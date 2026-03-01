import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { CATEGORIES_ACTION, CORTEX } from "./lib/neocortex";

function serialiserValeur(value: unknown): string {
  return JSON.stringify(value ?? null);
}

function parserValeur(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

export const lireConfig = query({
  args: { cle: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db.query("configSysteme").withIndex("by_cle", (q) => q.eq("cle", args.cle)).unique();
    if (!row) return null;
    return {
      cle: row.cle,
      valeur: parserValeur(row.valeur),
      categorie: row.categorie,
      description: row.description,
      modifiePar: row.modifiePar,
      dateModification: row.dateModification,
    };
  },
});

export const ecrireConfig = mutation({
  args: {
    cle: v.string(),
    valeur: v.any(),
    categorie: v.string(),
    description: v.string(),
    modifiePar: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db.query("configSysteme").withIndex("by_cle", (q) => q.eq("cle", args.cle)).unique();

    const payload = {
      cle: args.cle,
      valeur: serialiserValeur(args.valeur),
      categorie: args.categorie,
      description: args.description,
      modifiePar: args.modifiePar,
      dateModification: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
    } else {
      await ctx.db.insert("configSysteme", payload);
    }

    await ctx.db.insert("signaux", {
      type: "CONFIG_MISE_A_JOUR",
      source: CORTEX.PLASTICITE,
      destination: CORTEX.LIMBIQUE,
      entiteType: "configSysteme",
      entiteId: args.cle,
      payload: {
        cle: args.cle,
        categorie: args.categorie,
      },
      confiance: 1,
      priorite: "NORMAL",
      correlationId: `cfg_${now}_${args.cle}`,
      traite: false,
      timestamp: now,
    });

    await ctx.db.insert("historiqueActions", {
      action: "CONFIG_MISE_A_JOUR",
      categorie: CATEGORIES_ACTION.SYSTEME,
      entiteType: "configSysteme",
      entiteId: args.cle,
      userId: args.modifiePar,
      details: {
        cle: args.cle,
        valeur: args.valeur,
      },
      metadata: { source: CORTEX.PLASTICITE },
      timestamp: now,
    });

    return { success: true };
  },
});

export const lirePoidsAdaptatifs = query({
  args: {
    signal: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.signal) {
      return ctx.db.query("poidsAdaptatifs").collect();
    }
    return ctx.db.query("poidsAdaptatifs").withIndex("by_signal", (q) => q.eq("signal", args.signal!)).collect();
  },
});

export const ajusterPoids = internalMutation({
  args: {
    signal: v.string(),
    regle: v.string(),
    succes: v.boolean(),
    pas: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const pas = args.pas ?? 0.05;
    const now = Date.now();
    const rows = await ctx.db.query("poidsAdaptatifs").withIndex("by_signal", (q) => q.eq("signal", args.signal)).collect();
    const existing = rows.find((row) => row.regle === args.regle);

    if (!existing) {
      const poidsInitial = args.succes ? 0.55 : 0.45;
      await ctx.db.insert("poidsAdaptatifs", {
        signal: args.signal,
        regle: args.regle,
        poids: poidsInitial,
        executionsReussies: args.succes ? 1 : 0,
        executionsEchouees: args.succes ? 0 : 1,
        dernierAjustement: now,
      });
      return { poids: poidsInitial, created: true };
    }

    const delta = args.succes ? pas : -pas;
    const prochainPoids = Math.max(0, Math.min(1, existing.poids + delta));

    await ctx.db.patch(existing._id, {
      poids: prochainPoids,
      executionsReussies: existing.executionsReussies + (args.succes ? 1 : 0),
      executionsEchouees: existing.executionsEchouees + (args.succes ? 0 : 1),
      dernierAjustement: now,
    });

    return { poids: prochainPoids, created: false };
  },
});
