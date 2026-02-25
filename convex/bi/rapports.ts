import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

export const listerRapports = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.query("biRapports").withIndex("by_date").order("desc").take(50);
    }
});

export const genererRapport = mutation({
    args: {
        userId: v.id("users"),
        type: v.union(v.literal("mensuel_perf"), v.literal("trimestriel_budget"), v.literal("annuel_cc"), v.literal("rapport_ca")),
        periode: v.string(),
        titre: v.string()
    },
    handler: async (ctx, args) => {
        // Simule la préparation asynchrone d'un rapport BI lourd (BigQuery/CloudSQL)
        // Normalement ici on déléguerait à une action + webhook ou PDF Generator
        const rapportId = await ctx.db.insert("biRapports", {
            type: args.type,
            titre: args.titre,
            periode: args.periode,
            dateGeneration: Date.now(),
            generePar: args.userId,
            statut: "termine", // Synchronous simulation
            fichierUrl: "https://example.com/mock-report.pdf" // Fake URL for demo
        });

        return rapportId;
    }
});
