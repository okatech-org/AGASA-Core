import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

const actionArgs = {
  action: v.string(),
  categorie: v.string(),
  entiteType: v.string(),
  entiteId: v.optional(v.string()),
  userId: v.optional(v.string()),
  details: v.any(),
  metadata: v.optional(v.any()),
} as const;

export const loguerAction = internalMutation({
  args: actionArgs,
  handler: async (ctx, args) => {
    return ctx.db.insert("historiqueActions", {
      action: args.action,
      categorie: args.categorie,
      entiteType: args.entiteType,
      entiteId: args.entiteId,
      userId: args.userId,
      details: args.details,
      metadata: args.metadata,
      timestamp: Date.now(),
    });
  },
});

export const loguerActionPublic = mutation({
  args: actionArgs,
  handler: async (ctx, args) => {
    return ctx.db.insert("historiqueActions", {
      action: args.action,
      categorie: args.categorie,
      entiteType: args.entiteType,
      entiteId: args.entiteId,
      userId: args.userId,
      details: args.details,
      metadata: args.metadata,
      timestamp: Date.now(),
    });
  },
});

export const listerHistorique = query({
  args: {
    entiteType: v.optional(v.string()),
    entiteId: v.optional(v.string()),
    userId: v.optional(v.string()),
    categorie: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(300, args.limit ?? 100));
    const items = await ctx.db
      .query("historiqueActions")
      .withIndex("by_timestamp")
      .order("desc")
      .take(500);

    return items
      .filter((item) => (args.entiteType ? item.entiteType === args.entiteType : true))
      .filter((item) => (args.entiteId ? item.entiteId === args.entiteId : true))
      .filter((item) => (args.userId ? item.userId === args.userId : true))
      .filter((item) => (args.categorie ? item.categorie === args.categorie : true))
      .slice(0, limit);
  },
});

export const rechercherActions = query({
  args: {
    terme: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(200, args.limit ?? 50));
    const terme = args.terme.trim().toLowerCase();
    if (!terme) return [];

    const items = await ctx.db
      .query("historiqueActions")
      .withIndex("by_timestamp")
      .order("desc")
      .take(800);

    return items
      .filter((item) => {
        const compact = JSON.stringify({
          action: item.action,
          categorie: item.categorie,
          entiteType: item.entiteType,
          entiteId: item.entiteId,
          userId: item.userId,
          details: item.details,
        }).toLowerCase();
        return compact.includes(terme);
      })
      .slice(0, limit);
  },
});

export const calculerMetriques = internalMutation({
  args: { periode: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const periode = args.periode ?? "hourly";
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;

    const signaux = await ctx.db.query("signaux").collect();
    const historique = await ctx.db.query("historiqueActions").collect();

    const windowMs = periode === "daily" ? oneDay : oneHour;
    const from = now - windowMs;

    const signauxPeriode = signaux.filter((s) => s.timestamp >= from);
    const historiquePeriode = historique.filter((h) => h.timestamp >= from);

    const nonTraites = signauxPeriode.filter((s) => !s.traite).length;
    const totalSignaux = signauxPeriode.length;
    const totalActions = historiquePeriode.length;

    await ctx.db.insert("metriques", {
      nom: "signaux_non_traites",
      valeur: nonTraites,
      unite: "count",
      periode,
      dimensions: { source: "limbique" },
      timestamp: now,
    });

    await ctx.db.insert("metriques", {
      nom: "signaux_total",
      valeur: totalSignaux,
      unite: "count",
      periode,
      dimensions: { source: "limbique" },
      timestamp: now,
    });

    await ctx.db.insert("metriques", {
      nom: "actions_total",
      valeur: totalActions,
      unite: "count",
      periode,
      dimensions: { source: "hippocampe" },
      timestamp: now,
    });

    return { periode, totalSignaux, nonTraites, totalActions };
  },
});
