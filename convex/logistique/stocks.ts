import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";

const checkLogAccess = async (ctx: any, userId: any) => {
    if (!userId) throw new Error("Non autorisé : authentification requise.");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Utilisateur introuvable.");
    return user;
};

// 1. Tableau de bord des Stocks (KPIs & Alertes)
export const getStocksStats = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await checkLogAccess(ctx, args.userId);

        const stocks = await ctx.db.query("stocks").collect();
        const mouvements = await ctx.db.query("mouvementsStock").collect();
        const alertes = stocks.filter(s => s.quantite <= s.seuilAlerte);
        const expiresSoon = stocks.filter(s => {
            if (!s.datePeremption) return false;
            const diffJours = (s.datePeremption - Date.now()) / (1000 * 60 * 60 * 24);
            return diffJours > 0 && diffJours <= 30; // Expire dans les 30 jours
        });

        return {
            totalArticles: stocks.length,
            valeurTotaleAprox: stocks.reduce((acc, s) => acc + (s.quantite * 15000), 0), // Simulation de valeur ($/FCFA)
            produitsEnAlerteTot: alertes.length,
            produitsExpiresProches: expiresSoon.length,
            repartitionCategories: {
                reactifs: stocks.filter(s => s.categorie === "reactif").length,
                consommables: stocks.filter(s => s.categorie === "consommable").length,
                equipements: stocks.filter(s => s.categorie === "equipement").length,
                pieces: stocks.filter(s => s.categorie === "piece_rechange").length,
            },
            alertesUrgentes: alertes.slice(0, 5), // Les 5 premiers pour la vue rapide
            mouvementsRecents: mouvements.sort((a, b) => b._creationTime - a._creationTime).slice(0, 5)
        };
    }
});

// 2. Liste de l'inventaire
export const listerInventaire = query({
    args: {
        userId: v.id("users"),
        categorie: v.optional(v.string()),
        statut: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        await checkLogAccess(ctx, args.userId);
        let q = ctx.db.query("stocks").order("desc");
        let articles = await q.collect();

        if (args.categorie && args.categorie !== "toutes") {
            articles = articles.filter(a => a.categorie === args.categorie);
        }
        if (args.statut && args.statut !== "tous") {
            articles = articles.filter(a => a.statut === args.statut);
        }

        return articles;
    }
});

// 2b. Liste de tous les mouvements
export const listerMouvements = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await checkLogAccess(ctx, args.userId);
        const mvtsData = await ctx.db.query("mouvementsStock")
            .order("desc")
            .take(100);

        return await Promise.all(mvtsData.map(async m => {
            const article = await ctx.db.get(m.articleId);
            const agent = await ctx.db.get(m.agentId);
            let agentNom = "Système";
            if (agent) {
                const agentUser = await ctx.db.get(agent.userId);
                if (agentUser) agentNom = `${agentUser.prenom} ${agentUser.nom}`;
            }
            return {
                ...m,
                agent: agentNom,
                article: article ? `${article.reference} - ${article.designation}` : 'Article Supprimé'
            };
        }));
    }
});

// 3. Fiche article et historique des mouvements
export const getArticle = query({
    args: { userId: v.id("users"), stockId: v.id("stocks") },
    handler: async (ctx, args) => {
        await checkLogAccess(ctx, args.userId);
        const article = await ctx.db.get(args.stockId);
        if (!article) throw new Error("Article introuvable");

        const mvtsData = await ctx.db.query("mouvementsStock")
            .withIndex("by_articleId", q => q.eq("articleId", article._id))
            .order("desc")
            .collect();

        const historiques = await Promise.all(mvtsData.map(async m => {
            const agent = await ctx.db.get(m.agentId);
            let agentNom = "Système";
            if (agent) {
                const agentUser = await ctx.db.get(agent.userId);
                if (agentUser) agentNom = `${agentUser.prenom} ${agentUser.nom}`;
            }
            return { ...m, agent: agentNom };
        }));

        return { ...article, historiques };
    }
});

// 4. Enregistrer un mouvement (Entrée/Sortie/Ajustement)
export const enregistrerMouvement = mutation({
    args: {
        userId: v.id("users"),
        articleId: v.id("stocks"),
        type: v.union(v.literal("entree"), v.literal("sortie"), v.literal("ajustement")),
        quantite: v.number(),
        motif: v.string()
    },
    handler: async (ctx, args) => {
        const user = await checkLogAccess(ctx, args.userId);
        const article = await ctx.db.get(args.articleId);
        if (!article) throw new Error("Article introuvable dans le stock");

        // Trouver l'agent correspondant au user
        const agent = await ctx.db.query("agents").withIndex("by_userId", q => q.eq("userId", user._id)).first();
        if (!agent) throw new Error("Vous devez avoir un profil agent pour enregistrer un mouvement");

        let nouvelleQte = article.quantite;
        if (args.type === "entree") nouvelleQte += args.quantite;
        else if (args.type === "sortie") {
            if (article.quantite < args.quantite) throw new Error("Stock insuffisant pour cette sortie.");
            nouvelleQte -= args.quantite;
        }
        else if (args.type === "ajustement") {
            nouvelleQte = args.quantite; // Valeur absolue pour ajustement d'inventaire
        }

        // MAJ de la fiche de stock
        let statut = "ok";
        if (nouvelleQte === 0) statut = "rupture";
        else if (nouvelleQte <= article.seuilAlerte) statut = "alerte";

        await ctx.db.patch(article._id, {
            quantite: nouvelleQte,
            statut: statut as any
        });

        // Historiser
        await ctx.db.insert("mouvementsStock", {
            articleId: article._id,
            type: args.type,
            quantite: args.quantite,
            dateMouvement: Date.now(),
            motif: args.motif,
            agentId: agent._id
        });

        // Audit Admin
        await ctx.db.insert("auditLogs", {
            userId: user._id,
            action: `MVT_STOCK_${args.type.toUpperCase()}`,
            module: "LOGISTIQUE",
            details: `Réf: ${article.reference} | Qte: ${args.quantite} | Motif: ${args.motif}`,
            ipAddress: "System",
            userAgent: "API",
            timestamp: Date.now()
        });

        return nouvelleQte;
    }
});
