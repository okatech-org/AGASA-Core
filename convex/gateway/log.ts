import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

export const logFlux = internalMutation({
    args: {
        sourceApp: v.string(), // "F1", "F2", "F3", "F4", "F5", "F6" ou "SYSTEM"
        destinationApp: v.string(), // "AGASA-Core", "AGASA-Pro", "AGASA-Inspect", "AGASA-Citoyen"
        typeMessage: v.string(), // e.g. "demande_agrement"
        payload: v.string(), // JSON stringifié
        fluxCode: v.union(v.literal("F1"), v.literal("F2"), v.literal("F3"), v.literal("F4"), v.literal("F5"), v.literal("F6")),
        statut: v.union(v.literal("envoye"), v.literal("recu"), v.literal("traite"), v.literal("erreur")),
        erreur: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("fluxInterApps", {
            fluxCode: args.fluxCode as any,
            sourceApp: args.sourceApp,
            destinationApp: args.destinationApp,
            typeMessage: args.typeMessage,
            dateEnvoi: Date.now(),
            dateReception: Date.now(),
            payload: args.payload,
            statut: args.statut as any,
            erreur: args.erreur,
            tentatives: 1
        });
    }
});
