import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

const checkLimsAccess = async (ctx: any, userId: any) => {
    if (!userId) throw new Error("Non autorisé");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Introuvable");
    return user;
};

// 1. Lister le Référentiel des Paramètres
export const getCatalogue = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await checkLimsAccess(ctx, args.userId);
        return await ctx.db.query("limsParametres").collect();
    }
});

// 2. Assigner des analyses à un échantillon
export const assignerAnalyses = mutation({
    args: {
        userId: v.id("users"),
        echantillonId: v.id("limsEchantillons"),
        parametres: v.array(v.id("limsParametres")),
        technicienId: v.optional(v.id("users"))
    },
    handler: async (ctx, args) => {
        const user = await checkLimsAccess(ctx, args.userId);

        for (const pid of args.parametres) {
            await ctx.db.insert("limsAnalyses", {
                echantillonId: args.echantillonId,
                parametreId: pid,
                assigneA: args.technicienId,
                dateAssignation: Date.now(),
                statut: "en_attente"
            });
        }

        await ctx.db.patch(args.echantillonId, { statut: "en_analyse" });

        await ctx.db.insert("limsTracabilite", {
            echantillonId: args.echantillonId,
            dateLigne: Date.now(),
            agentId: user._id,
            nomAgent: `${user.prenom} ${user.nom}`,
            action: `Assignation de ${args.parametres.length} paramètre(s) d'analyse.`,
            lieu: "Bureau Central LAA"
        });

        return "success";
    }
});

// 3. Saisie technicien (Niveau 1)
export const saisirResultat = mutation({
    args: {
        userId: v.id("users"),
        analyseId: v.id("limsAnalyses"),
        resultatBrut: v.number(),
        incertitude: v.optional(v.number())
    },
    handler: async (ctx, args) => {
        const user = await checkLimsAccess(ctx, args.userId);

        const analyse = await ctx.db.get(args.analyseId);
        if (!analyse) throw new Error("Introuvable");

        const param = await ctx.db.get(analyse.parametreId);

        let conformite = true;
        if (param && param.seuilReglementaire) {
            conformite = args.resultatBrut <= param.seuilReglementaire;
        }

        await ctx.db.patch(args.analyseId, {
            resultatBrut: args.resultatBrut,
            resultatFinal: args.resultatBrut, // Simplification pour le demo
            incertitude: args.incertitude,
            conformite,
            statut: "valide_tech",
            dateValidationN1: Date.now()
        });

        await ctx.db.insert("limsTracabilite", {
            echantillonId: analyse.echantillonId,
            dateLigne: Date.now(),
            agentId: user._id,
            nomAgent: `${user.prenom} ${user.nom}`,
            action: `Saisie de résultat (N1) pour ${param?.nom} : ${args.resultatBrut} ${param?.unite}`,
            lieu: "Paillasse Analytique"
        });

        return "success";
    }
});

// 4. Validation Responsable Laboratoire (Niveau 2)
export const validerAnalyse = mutation({
    args: {
        userId: v.id("users"),
        analyseId: v.id("limsAnalyses"),
        statut: v.union(v.literal("valide_resp"), v.literal("rejete")),
        commentaireRejet: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const user = await checkLimsAccess(ctx, args.userId);
        const analyse = await ctx.db.get(args.analyseId);
        if (!analyse) throw new Error("Introuvable");

        await ctx.db.patch(args.analyseId, {
            statut: args.statut,
            dateValidationN2: Date.now(),
            commentaireRejet: args.commentaireRejet
        });

        const param = await ctx.db.get(analyse.parametreId);

        await ctx.db.insert("limsTracabilite", {
            echantillonId: analyse.echantillonId,
            dateLigne: Date.now(),
            agentId: user._id,
            nomAgent: `${user.prenom} ${user.nom}`,
            action: `Supervision (N2) : Résultat ${args.statut === 'valide_resp' ? 'Approuvé' : 'Rejeté'} pour ${param?.nom}`,
            lieu: "Direction LAA"
        });

        // Verifier si toutes les analyses de l'échantillon sont validées
        if (args.statut === "valide_resp") {
            const allAnalyses = await ctx.db.query("limsAnalyses").withIndex("by_echantillonId", q => q.eq("echantillonId", analyse.echantillonId)).collect();
            const toutValide = allAnalyses.every(a => a.statut === "valide_resp" || a._id === args.analyseId);

            if (toutValide) {
                await ctx.db.patch(analyse.echantillonId, { statut: "termine" });
                await ctx.db.insert("limsTracabilite", {
                    echantillonId: analyse.echantillonId,
                    dateLigne: Date.now() + 1000,
                    agentId: user._id,
                    nomAgent: "Système LIMS",
                    action: `Toutes les analyses paramétriques ont été validées N2. Le dossier est clôturé (Prêt pour rapport).`,
                    lieu: "Serveur AGASA-Admin"
                });
            }
        }

        return "success";
    }
});
