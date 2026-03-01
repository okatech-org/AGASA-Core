"use node";

import { internalAction, mutation } from "./_generated/server";
import { v } from "convex/values";

export const executerActionExterne = internalAction({
  args: {
    endpoint: v.string(),
    method: v.optional(v.union(v.literal("GET"), v.literal("POST"), v.literal("PUT"), v.literal("PATCH"), v.literal("DELETE"))),
    payload: v.optional(v.any()),
    headers: v.optional(v.array(v.object({ key: v.string(), value: v.string() }))),
  },
  handler: async (_ctx, args) => {
    const method = args.method ?? "POST";
    const headers: Record<string, string> = { "content-type": "application/json" };
    for (const header of args.headers ?? []) {
      headers[header.key.toLowerCase()] = header.value;
    }

    const response = await fetch(args.endpoint, {
      method,
      headers,
      body: args.payload ? JSON.stringify(args.payload) : undefined,
    });

    const text = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      body: text,
    };
  },
});

export const enregistrerCommandeMoteur = mutation({
  args: {
    action: v.string(),
    entiteType: v.string(),
    entiteId: v.optional(v.string()),
    payload: v.optional(v.any()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    await ctx.db.insert("historiqueActions", {
      action: args.action,
      categorie: "SYSTEME",
      entiteType: args.entiteType,
      entiteId: args.entiteId,
      userId: args.userId,
      details: args.payload,
      metadata: { source: "MOTEUR" },
      timestamp: now,
    });

    await ctx.db.insert("signaux", {
      type: "ACTION_EXTERNE_EXECUTEE",
      source: "MOTEUR",
      destination: "HIPPOCAMPE",
      entiteType: args.entiteType,
      entiteId: args.entiteId,
      payload: {
        action: args.action,
      },
      confiance: 0.9,
      priorite: "NORMAL",
      correlationId: `moteur_${now}_${args.action}`,
      traite: false,
      timestamp: now,
    });

    return { success: true };
  },
});
