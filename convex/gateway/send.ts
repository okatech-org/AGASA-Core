"use node";

import { internalAction, internalMutation, mutation } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { genererSignature } from "./auth";

// Action pour pousser vers une API externe
export const expedierFlux = internalAction({
    args: {
        flux: v.union(v.literal("F2"), v.literal("F4"), v.literal("F5")),
        destinationEndpoint: v.string(),
        data: v.any(),
        tentative: v.optional(v.number())
    },
    handler: async (ctx, args) => {
        const payload = {
            flux: args.flux,
            timestamp: Date.now(),
            data: args.data,
        };

        const signature = genererSignature(payload);
        const requestBody = JSON.stringify({ ...payload, signature });
        const currentAttempt = args.tentative || 1;

        try {
            // Simuler l'appel à une API externe (AGASA-Pro / Inspect / Citoyen)
            console.log(`[GATEWAY OUT] Envoi ${args.flux} - Tentative ${currentAttempt} vers ${args.destinationEndpoint}`);
            /* 
            const response = await fetch(args.destinationEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: requestBody
            });

            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            */

            // Simulation locale : on part du principe que ça marche
        } catch (error: any) {
            console.error(`[GATEWAY OUT] Erreur ${args.flux}`, error);

            // On déclenche le retry
            await ctx.runMutation(internal.gateway.retry.planifierRetry, {
                flux: args.flux,
                data: args.data,
                tentative: currentAttempt + 1,
                destinationEndpoint: args.destinationEndpoint
            });
        }
    }
});
