import { internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { CATEGORIES_ACTION, CORTEX, SIGNAL_TYPES, genererCorrelationId } from "../lib/neocortex";

export const logFlux = internalMutation({
    args: {
        sourceApp: v.string(), // "F1", "F2", "F3", "F4", "F5", "F6" ou "SYSTEM"
        destinationApp: v.string(), // "AGASA-Admin", "AGASA-Pro", "AGASA-Inspect", "AGASA-Citoyen"
        typeMessage: v.string(), // e.g. "demande_agrement"
        payload: v.string(), // JSON stringifié
        fluxCode: v.union(v.literal("F1"), v.literal("F2"), v.literal("F3"), v.literal("F4"), v.literal("F5"), v.literal("F6")),
        statut: v.union(v.literal("envoye"), v.literal("recu"), v.literal("traite"), v.literal("erreur")),
        erreur: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const fluxId = await ctx.db.insert("fluxInterApps", {
            fluxCode: args.fluxCode,
            sourceApp: args.sourceApp,
            destinationApp: args.destinationApp,
            typeMessage: args.typeMessage,
            dateEnvoi: now,
            dateReception: now,
            payload: args.payload,
            statut: args.statut,
            erreur: args.erreur,
            tentatives: 1
        });

        const correlationId = genererCorrelationId();
        await ctx.db.insert("signaux", {
            type: SIGNAL_TYPES.FLUX_RECU,
            source: CORTEX.GATEWAY,
            destination: CORTEX.LIMBIQUE,
            entiteType: "fluxInterApps",
            entiteId: String(fluxId),
            payload: {
                fluxCode: args.fluxCode,
                sourceApp: args.sourceApp,
                destinationApp: args.destinationApp,
                typeMessage: args.typeMessage,
                statut: args.statut,
            },
            confiance: 1,
            priorite: args.statut === "erreur" ? "CRITICAL" : "NORMAL",
            correlationId,
            traite: false,
            timestamp: now,
        });

        await ctx.db.insert("historiqueActions", {
            action: "GATEWAY_LOG_FLUX",
            categorie: CATEGORIES_ACTION.SYSTEME,
            entiteType: "fluxInterApps",
            entiteId: String(fluxId),
            userId: "system",
            details: {
                fluxCode: args.fluxCode,
                sourceApp: args.sourceApp,
                destinationApp: args.destinationApp,
                typeMessage: args.typeMessage,
                statut: args.statut,
                erreur: args.erreur,
            },
            metadata: {
                source: CORTEX.GATEWAY,
            },
            timestamp: now,
        });

        return fluxId;
    }
});
