import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { CORTEX, genererCorrelationId, normaliserConfiance } from "./lib/neocortex";

function destinationParType(type: string): string {
  if (type.startsWith("NOTIFICATION_")) return CORTEX.AUDITIF;
  if (type.startsWith("WEBHOOK_")) return CORTEX.SENSORIEL;
  if (type.startsWith("DECISION_")) return CORTEX.PREFRONTAL;
  if (type.startsWith("FLUX_")) return CORTEX.GATEWAY;
  return CORTEX.METIER;
}

const signalArgs = {
  type: v.string(),
  source: v.string(),
  payload: v.any(),
  confiance: v.number(),
  priorite: v.union(v.literal("LOW"), v.literal("NORMAL"), v.literal("HIGH"), v.literal("CRITICAL")),
  correlationId: v.optional(v.string()),
  destination: v.optional(v.string()),
  entiteType: v.optional(v.string()),
  entiteId: v.optional(v.string()),
  parentSignalId: v.optional(v.id("signaux")),
  ttl: v.optional(v.number()),
} as const;

export const emettreSignal = internalMutation({
  args: signalArgs,
  handler: async (ctx, args) => {
    return ctx.db.insert("signaux", {
      type: args.type,
      source: args.source,
      destination: args.destination ?? destinationParType(args.type),
      entiteType: args.entiteType,
      entiteId: args.entiteId,
      payload: args.payload,
      confiance: normaliserConfiance(args.confiance),
      priorite: args.priorite,
      correlationId: args.correlationId ?? genererCorrelationId(),
      parentSignalId: args.parentSignalId,
      ttl: args.ttl,
      traite: false,
      timestamp: Date.now(),
    });
  },
});

export const emettreSignalPublic = mutation({
  args: signalArgs,
  handler: async (ctx, args) => {
    return ctx.db.insert("signaux", {
      type: args.type,
      source: args.source,
      destination: args.destination ?? destinationParType(args.type),
      entiteType: args.entiteType,
      entiteId: args.entiteId,
      payload: args.payload,
      confiance: normaliserConfiance(args.confiance),
      priorite: args.priorite,
      correlationId: args.correlationId ?? genererCorrelationId(),
      parentSignalId: args.parentSignalId,
      ttl: args.ttl,
      traite: false,
      timestamp: Date.now(),
    });
  },
});

export const marquerTraite = internalMutation({
  args: {
    signalId: v.id("signaux"),
    traite: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.signalId, { traite: args.traite });
  },
});

export const routerSignal = internalMutation({
  args: { signalId: v.id("signaux") },
  handler: async (ctx, args) => {
    const signal = await ctx.db.get(args.signalId);
    if (!signal) return { routed: false, reason: "signal_not_found" };

    const destination = signal.destination ?? destinationParType(signal.type);
    await ctx.db.patch(args.signalId, {
      destination,
      traite: true,
    });

    return { routed: true, destination };
  },
});

export const listerSignauxNonTraites = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(200, args.limit ?? 50));
    return ctx.db
      .query("signaux")
      .withIndex("by_non_traite", (q) => q.eq("traite", false))
      .order("desc")
      .take(limit);
  },
});

export const nettoyerSignaux = internalMutation({
  args: {
    retentionMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const retentionMs = args.retentionMs ?? 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    const signaux = await ctx.db.query("signaux").collect();
    let deleted = 0;

    for (const signal of signaux) {
      const expireByTtl = signal.ttl ? signal.timestamp + signal.ttl < now : false;
      const expireByRetention = signal.traite && signal.timestamp < now - retentionMs;
      if (expireByTtl || expireByRetention) {
        await ctx.db.delete(signal._id);
        deleted += 1;
      }
    }

    return { deleted };
  },
});
