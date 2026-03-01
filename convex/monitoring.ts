import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getEtatSysteme = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const since = now - oneHour;

    const signauxRecents = await ctx.db
      .query("signaux")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", since))
      .collect();

    const historiquesRecents = await ctx.db
      .query("historiqueActions")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", since))
      .collect();

    const nonTraites = signauxRecents.filter((s) => !s.traite).length;
    const critiques = signauxRecents.filter((s) => s.priorite === "CRITICAL").length;

    return {
      windowMs: oneHour,
      signaux: {
        total: signauxRecents.length,
        nonTraites,
        critiques,
      },
      historique: {
        actions: historiquesRecents.length,
      },
      statut: critiques > 0 ? "degrade" : "ok",
      timestamp: now,
    };
  },
});

export const enregistrerSonde = mutation({
  args: {
    nom: v.string(),
    valeur: v.number(),
    unite: v.optional(v.string()),
    periode: v.optional(v.string()),
    dimensions: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("metriques", {
      nom: args.nom,
      valeur: args.valeur,
      unite: args.unite,
      periode: args.periode ?? "instant",
      dimensions: args.dimensions,
      timestamp: Date.now(),
    });
    return { success: true };
  },
});

export const listerMetriques = query({
  args: {
    nom: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(500, args.limit ?? 100));

    if (args.nom) {
      return ctx.db
        .query("metriques")
        .withIndex("by_nom", (q) => q.eq("nom", args.nom!))
        .order("desc")
        .take(limit);
    }

    const items = await ctx.db.query("metriques").collect();
    return items.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  },
});
