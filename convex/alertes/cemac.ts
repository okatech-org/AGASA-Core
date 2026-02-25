import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

export const listerDossiersCemac = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("Non autorisé");

        return await ctx.db.query("cemacAlertes").order("desc").collect();
    },
});

export const notifierAlerteCemac = mutation({
    args: {
        produit: v.string(),
        dangerId: v.string(),
        niveauRisque: v.union(v.literal("faible"), v.literal("moyen"), v.literal("eleve"), v.literal("grave")),
        actionRequise: v.string(),
        paysImpactes: v.array(v.string()),
        alerteReferenceId: v.optional(v.id("alertes")),
        userId: v.id("users")
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("Non autorisé");

        const id = await ctx.db.insert("cemacAlertes", {
            reference: `RASFF-CEMAC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
            paysEmetteur: "Gabon", // Nous sommes le noeud gabonais
            dateNotification: Date.now(),
            produit: args.produit,
            dangerId: args.dangerId,
            niveauRisque: args.niveauRisque,
            actionRequise: args.actionRequise,
            paysImpactes: args.paysImpactes,
            statut: "emise",
            alerteNationaleLiee: args.alerteReferenceId,
        });

        return id;
    }
});
