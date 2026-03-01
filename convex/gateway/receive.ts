import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { CATEGORIES_ACTION, CORTEX, SIGNAL_TYPES, genererCorrelationId } from "../lib/neocortex";

type FluxCode = "F1" | "F3" | "F6";

const SOURCE_BY_FLUX: Record<FluxCode, string> = {
  F1: "AGASA-Pro",
  F3: "AGASA-Inspect",
  F6: "AGASA-Citoyen",
};

function safeErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Erreur inconnue";
}

function extraireTypeMessage(data: unknown): string {
  if (!data || typeof data !== "object") return "inconnu";
  const value = (data as { type?: unknown }).type;
  return typeof value === "string" && value.trim().length > 0 ? value : "inconnu";
}

function toJsonString(data: unknown): string {
  try {
    return JSON.stringify(data);
  } catch {
    return JSON.stringify({ error: "payload_non_serialisable" });
  }
}

function prioriteParFlux(flux: FluxCode): "LOW" | "NORMAL" | "HIGH" | "CRITICAL" {
  if (flux === "F6") return "HIGH";
  return "NORMAL";
}

export const traiterFluxEntrant = mutation({
  args: {
    flux: v.union(v.literal("F1"), v.literal("F3"), v.literal("F6")),
    data: v.any(),
    bridgeToken: v.string(),
  },
  handler: async (ctx, args) => {
    const bridgeToken = process.env.GATEWAY_INTERNAL_BRIDGE_TOKEN;
    if (!bridgeToken || args.bridgeToken !== bridgeToken) {
      throw new Error("Accès gateway non autorisé");
    }

    const flux = args.flux as FluxCode;
    const now = Date.now();
    const sourceApp = SOURCE_BY_FLUX[flux];
    const typeMessage = extraireTypeMessage(args.data);
    const payloadString = toJsonString(args.data);
    const correlationId = genererCorrelationId();

    const fluxId = await ctx.db.insert("fluxInterApps", {
      fluxCode: flux,
      sourceApp,
      destinationApp: "AGASA-Core",
      typeMessage,
      dateEnvoi: now,
      dateReception: now,
      payload: payloadString,
      statut: "recu",
      tentatives: 1,
    });

    try {
      await ctx.db.insert("signaux", {
        type: SIGNAL_TYPES.FLUX_RECU,
        source: CORTEX.GATEWAY,
        destination: CORTEX.LIMBIQUE,
        entiteType: "fluxInterApps",
        entiteId: String(fluxId),
        payload: {
          flux,
          sourceApp,
          typeMessage,
        },
        confiance: 1,
        priorite: prioriteParFlux(flux),
        correlationId,
        traite: false,
        timestamp: now,
      });

      await ctx.db.insert("historiqueActions", {
        action: "GATEWAY_FLUX_RECU",
        categorie: CATEGORIES_ACTION.SYSTEME,
        entiteType: "fluxInterApps",
        entiteId: String(fluxId),
        userId: "system",
        details: {
          flux,
          sourceApp,
          typeMessage,
        },
        metadata: {
          source: CORTEX.GATEWAY,
        },
        timestamp: now,
      });

      await ctx.db.patch(fluxId, {
        statut: "traite",
        dateTraitement: Date.now(),
      });

      await ctx.db.insert("signaux", {
        type: SIGNAL_TYPES.FLUX_TRAITE,
        source: CORTEX.GATEWAY,
        destination: CORTEX.HIPPOCAMPE,
        entiteType: "fluxInterApps",
        entiteId: String(fluxId),
        payload: {
          flux,
          sourceApp,
          typeMessage,
        },
        confiance: 1,
        priorite: "NORMAL",
        correlationId,
        traite: false,
        timestamp: Date.now(),
      });

      return {
        success: true,
        fluxId,
        flux,
        sourceApp,
        typeMessage,
      };
    } catch (error) {
      const message = safeErrorMessage(error);

      await ctx.db.patch(fluxId, {
        statut: "erreur",
        erreur: message,
        dateTraitement: Date.now(),
      });

      await ctx.db.insert("signaux", {
        type: SIGNAL_TYPES.FLUX_ERREUR,
        source: CORTEX.GATEWAY,
        destination: CORTEX.MONITORING,
        entiteType: "fluxInterApps",
        entiteId: String(fluxId),
        payload: {
          flux,
          sourceApp,
          typeMessage,
          erreur: message,
        },
        confiance: 1,
        priorite: "CRITICAL",
        correlationId,
        traite: false,
        timestamp: Date.now(),
      });

      await ctx.db.insert("historiqueActions", {
        action: "GATEWAY_FLUX_ERREUR",
        categorie: CATEGORIES_ACTION.SECURITE,
        entiteType: "fluxInterApps",
        entiteId: String(fluxId),
        userId: "system",
        details: {
          flux,
          sourceApp,
          typeMessage,
          erreur: message,
        },
        metadata: {
          source: CORTEX.GATEWAY,
        },
        timestamp: Date.now(),
      });

      throw error;
    }
  },
});
