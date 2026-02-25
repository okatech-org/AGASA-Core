import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";

const checkFinanceAccess = async (ctx: any, userId: any) => {
    if (!userId) throw new Error("Non autorisé : authentification requise.");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Utilisateur introuvable.");
    return user;
};

// 1. Lister les paiements
export const listerPaiements = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await checkFinanceAccess(ctx, args.userId);
        return await ctx.db.query("paiements").order("desc").collect();
    }
});

// 2. Statistiques des paiements (Dashboard)
export const getStatsPaiements = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await checkFinanceAccess(ctx, args.userId);

        const paiements = await ctx.db.query("paiements").collect();
        const aujourdhuiDebut = new Date(new Date().setHours(0, 0, 0, 0)).getTime();

        let paiementsJour = 0;
        let enAttente = 0;
        let erreurs = 0;

        const repMode: Record<string, number> = {};

        paiements.forEach(p => {
            if (p.datePaiement >= aujourdhuiDebut) paiementsJour++;
            if (p.statut === "en_attente") enAttente++;
            if (p.statut === "erreur") erreurs++;

            if (p.statut === "valide") {
                if (!repMode[p.mode]) repMode[p.mode] = 0;
                repMode[p.mode] += p.montant;
            }
        });

        return {
            total: paiements.length,
            paiementsJour,
            enAttente,
            erreurs,
            repartitionMode: Object.keys(repMode).map(m => ({ mode: m, montant: repMode[m] })).sort((a, b) => b.montant - a.montant)
        };
    }
});

// 3. Réconciliation (Lettrage automatique)
export const reconcilierPaiement = mutation({
    args: {
        userId: v.id("users"),
        paiementId: v.id("paiements"),
        redevanceId: v.id("redevances")
    },
    handler: async (ctx, args) => {
        const user = await checkFinanceAccess(ctx, args.userId);

        const paiement = await ctx.db.get(args.paiementId);
        if (!paiement) throw new Error("Paiement introuvable.");

        const redevance = await ctx.db.get(args.redevanceId);
        if (!redevance) throw new Error("Facture/Redevance introuvable.");

        // MAJ Paiement
        await ctx.db.patch(args.paiementId, {
            statut: "valide",
            redevanceId: args.redevanceId
        });

        // MAJ Redevance
        await ctx.db.patch(args.redevanceId, {
            statut: "paye",
            datePaiement: paiement.datePaiement,
            modePaiement: paiement.mode
        });

        // Audit Admin
        await ctx.db.insert("auditLogs", {
            userId: user._id,
            action: "RECONCILIATION_PAIEMENT",
            module: "FINANCE",
            details: `Paiement ${paiement.reference} lettré avec Facture ${redevance.reference}.`,
            ipAddress: "System",
            userAgent: "API",
            timestamp: Date.now()
        });

        return "success";
    }
});

// 4. Action Manuelle (Annuler, Rembourser, etc.)
export const gererStatutPaiement = mutation({
    args: {
        userId: v.id("users"),
        paiementId: v.id("paiements"),
        statut: v.union(v.literal("valide"), v.literal("erreur"), v.literal("en_attente"))
    },
    handler: async (ctx, args) => {
        const user = await checkFinanceAccess(ctx, args.userId);

        await ctx.db.patch(args.paiementId, {
            statut: args.statut
        });

        await ctx.db.insert("auditLogs", {
            userId: user._id,
            action: "UPDATE_STATUT_PAIEMENT",
            module: "FINANCE",
            details: `Statut du paiement ${args.paiementId} passé à ${args.statut}.`,
            ipAddress: "System",
            userAgent: "API",
            timestamp: Date.now()
        });

        return "success";
    }
});
