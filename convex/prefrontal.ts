import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { calculerScorePondere, CATEGORIES_ACTION, CORTEX } from "./lib/neocortex";

const TRANSITIONS: Record<string, Record<string, string[]>> = {
  agrement: {
    brouillon: ["soumis", "annule"],
    soumis: ["verification_documents", "demande_complements", "annule"],
    verification_documents: ["inspection_programmee", "demande_complements", "refuse"],
    inspection_programmee: ["inspection_realisee", "annule"],
    inspection_realisee: ["decision_en_cours"],
    decision_en_cours: ["agree", "refuse"],
  },
};

export const validerTransition = query({
  args: {
    workflow: v.string(),
    etatActuel: v.string(),
    etatCible: v.string(),
  },
  handler: async (_ctx, args) => {
    const workflow = TRANSITIONS[args.workflow] ?? {};
    const next = workflow[args.etatActuel] ?? [];
    return {
      valide: next.includes(args.etatCible),
      autorises: next,
    };
  },
});

export const evaluerDecision = mutation({
  args: {
    workflow: v.string(),
    scores: v.array(
      v.object({
        valeur: v.number(),
        poids: v.number(),
      })
    ),
    seuilValidation: v.optional(v.number()),
    contexte: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const score = calculerScorePondere(args.scores);
    const seuil = args.seuilValidation ?? 0.65;
    const decision = score >= seuil ? "approuve" : "rejet";
    const now = Date.now();

    await ctx.db.insert("historiqueActions", {
      action: "DECISION_EVALUEE",
      categorie: CATEGORIES_ACTION.METIER,
      entiteType: args.workflow,
      details: {
        score,
        seuil,
        decision,
        scores: args.scores,
      },
      metadata: {
        contexte: args.contexte,
        source: CORTEX.PREFRONTAL,
      },
      timestamp: now,
    });

    await ctx.db.insert("signaux", {
      type: "DECISION_EVALUEE",
      source: CORTEX.PREFRONTAL,
      destination: CORTEX.HIPPOCAMPE,
      entiteType: args.workflow,
      payload: { decision, score, seuil },
      confiance: Math.max(0, Math.min(1, score)),
      priorite: score >= seuil ? "NORMAL" : "HIGH",
      correlationId: `decision_${now}_${args.workflow}`,
      traite: false,
      timestamp: now,
    });

    return { score, seuil, decision };
  },
});

export const executerWorkflow = mutation({
  args: {
    workflow: v.string(),
    entiteType: v.string(),
    entiteId: v.string(),
    etatActuel: v.string(),
    etatCible: v.string(),
    userId: v.optional(v.string()),
    contexte: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const workflow = TRANSITIONS[args.workflow] ?? {};
    const autorises = workflow[args.etatActuel] ?? [];
    const transitionValide = autorises.includes(args.etatCible);

    if (!transitionValide) {
      throw new Error(`Transition non autorisée: ${args.etatActuel} -> ${args.etatCible}`);
    }

    const now = Date.now();
    await ctx.db.insert("historiqueActions", {
      action: "WORKFLOW_TRANSITION",
      categorie: CATEGORIES_ACTION.METIER,
      entiteType: args.entiteType,
      entiteId: args.entiteId,
      userId: args.userId,
      details: {
        workflow: args.workflow,
        from: args.etatActuel,
        to: args.etatCible,
      },
      metadata: args.contexte,
      timestamp: now,
    });

    await ctx.db.insert("signaux", {
      type: "FLUX_TRAITE",
      source: CORTEX.PREFRONTAL,
      destination: CORTEX.LIMBIQUE,
      entiteType: args.entiteType,
      entiteId: args.entiteId,
      payload: {
        workflow: args.workflow,
        from: args.etatActuel,
        to: args.etatCible,
      },
      confiance: 1,
      priorite: "NORMAL",
      correlationId: `workflow_${now}_${args.entiteId}`,
      traite: false,
      timestamp: now,
    });

    return { success: true, etat: args.etatCible };
  },
});
