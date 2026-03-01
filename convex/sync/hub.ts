import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { CATEGORIES_ACTION, CORTEX, SIGNAL_TYPES, genererCorrelationId } from "../lib/neocortex";

type StreamName = "fluxInterApps" | "signaux" | "historiqueActions";

type HubEvent = {
  id: string;
  stream: StreamName;
  timestamp: number;
  data: unknown;
};

function normalizeLimit(value: number | undefined): number {
  const fallback = 200;
  if (!value) return fallback;
  return Math.max(1, Math.min(1000, value));
}

function normalizeSince(value: number | undefined): number {
  if (!value || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

export const exportEvents = query({
  args: {
    since: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const since = normalizeSince(args.since);
    const limit = normalizeLimit(args.limit);

    const [fluxRows, signauxRows, historiqueRows] = await Promise.all([
      ctx.db.query("fluxInterApps").collect(),
      ctx.db.query("signaux").collect(),
      ctx.db.query("historiqueActions").collect(),
    ]);

    const events: HubEvent[] = [];

    for (const row of fluxRows) {
      const ts = row.dateTraitement ?? row.dateReception ?? row.dateEnvoi;
      if (typeof ts !== "number" || ts < since) continue;
      events.push({
        id: `flux:${String(row._id)}`,
        stream: "fluxInterApps",
        timestamp: ts,
        data: row,
      });
    }

    for (const row of signauxRows) {
      if (row.timestamp < since) continue;
      events.push({
        id: `signal:${String(row._id)}`,
        stream: "signaux",
        timestamp: row.timestamp,
        data: row,
      });
    }

    for (const row of historiqueRows) {
      if (row.timestamp < since) continue;
      events.push({
        id: `historique:${String(row._id)}`,
        stream: "historiqueActions",
        timestamp: row.timestamp,
        data: row,
      });
    }

    events.sort((a, b) => a.timestamp - b.timestamp);
    const sliced = events.slice(0, limit);
    const nextSince = sliced.length ? sliced[sliced.length - 1].timestamp + 1 : since;

    return {
      events: sliced,
      nextSince,
      hasMore: events.length > sliced.length,
      total: events.length,
    };
  },
});

export const ingestFromPostgres = mutation({
  args: {
    eventId: v.string(),
    sourceSystem: v.string(),
    occurredAt: v.number(),
    typeMessage: v.string(),
    payload: v.any(),
    applyToFlux: v.optional(v.boolean()),
    fluxCode: v.optional(v.union(
      v.literal("F1"),
      v.literal("F2"),
      v.literal("F3"),
      v.literal("F4"),
      v.literal("F5"),
      v.literal("F6")
    )),
    sourceApp: v.optional(v.string()),
    destinationApp: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const historyId = await ctx.db.insert("historiqueActions", {
      action: "POSTGRES_EVENT_INGEST",
      categorie: CATEGORIES_ACTION.SYSTEME,
      entiteType: "hub_postgres",
      entiteId: args.eventId,
      userId: args.sourceSystem,
      details: {
        typeMessage: args.typeMessage,
        payload: args.payload,
        occurredAt: args.occurredAt,
      },
      metadata: {
        source: CORTEX.SENSORIEL,
      },
      timestamp: now,
    });

    const signalId = await ctx.db.insert("signaux", {
      type: SIGNAL_TYPES.WEBHOOK_RECU,
      source: CORTEX.SENSORIEL,
      destination: CORTEX.LIMBIQUE,
      entiteType: "hub_postgres",
      entiteId: args.eventId,
      payload: {
        typeMessage: args.typeMessage,
        sourceSystem: args.sourceSystem,
      },
      confiance: 1,
      priorite: "NORMAL",
      correlationId: genererCorrelationId(),
      traite: false,
      timestamp: now,
    });

    let fluxId: string | null = null;
    if (args.applyToFlux && args.fluxCode && args.sourceApp && args.destinationApp) {
      const inserted = await ctx.db.insert("fluxInterApps", {
        fluxCode: args.fluxCode,
        sourceApp: args.sourceApp,
        destinationApp: args.destinationApp,
        typeMessage: args.typeMessage,
        payload: JSON.stringify(args.payload),
        statut: "recu",
        dateEnvoi: args.occurredAt,
        dateReception: now,
        dateTraitement: now,
        tentatives: 1,
      });
      fluxId = String(inserted);
    }

    return {
      success: true,
      historyId: String(historyId),
      signalId: String(signalId),
      fluxId,
    };
  },
});
