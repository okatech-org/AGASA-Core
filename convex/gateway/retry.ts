import { internalAction, internalMutation, query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

// Table temporaire en mémoire via scheduler Convex
export const planifierRetry = internalMutation({
    args: {
        flux: v.string(),
        data: v.any(),
        tentative: v.number(),
        destinationEndpoint: v.string()
    },
    handler: async (ctx, args) => {
        const MAX_TENTATIVES = 3;

        if (args.tentative >= MAX_TENTATIVES) {
            // Echec définitif
            await ctx.db.insert("fluxInterApps", {
                fluxCode: args.flux as any,
                sourceApp: "AGASA-Admin",
                destinationApp: args.flux === "F2" ? "AGASA-Pro" : args.flux === "F4" ? "AGASA-Inspect" : "AGASA-Citoyen",
                typeMessage: "RETRY_ECHEC_DEFINITIF",
                dateEnvoi: Date.now(),
                payload: JSON.stringify(args.data),
                statut: "erreur",
                erreur: "Nombre maximal de tentatives atteint (3)",
                tentatives: args.tentative
            });
            return;
        }

        const delaiMinutes = Math.pow(2, args.tentative); // Backoff exponentiel : 1min, 2min, 4min
        const delaiMs = delaiMinutes * 60 * 1000;

        await ctx.db.insert("fluxInterApps", {
            fluxCode: args.flux as any,
            sourceApp: "AGASA-Admin",
            destinationApp: args.flux === "F2" ? "AGASA-Pro" : args.flux === "F4" ? "AGASA-Inspect" : "AGASA-Citoyen",
            typeMessage: "DELAI_RETRY_PROGRAMME",
            dateEnvoi: Date.now(),
            payload: JSON.stringify(args.data),
            statut: "envoye",
            erreur: `Prochaine tentative dans ${delaiMinutes} minute(s)`,
            tentatives: args.tentative
        });
    }
});
