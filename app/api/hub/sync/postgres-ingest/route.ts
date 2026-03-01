import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { assertHubSyncAuth } from "../_auth";

export const runtime = "nodejs";

type HubIngestEvent = {
  eventId: string;
  sourceSystem: string;
  occurredAt: number;
  typeMessage: string;
  payload: unknown;
  applyToFlux?: boolean;
  fluxCode?: "F1" | "F2" | "F3" | "F4" | "F5" | "F6";
  sourceApp?: string;
  destinationApp?: string;
};

function isValidEvent(value: unknown): value is HubIngestEvent {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<HubIngestEvent>;
  return (
    typeof v.eventId === "string" &&
    typeof v.sourceSystem === "string" &&
    typeof v.occurredAt === "number" &&
    Number.isFinite(v.occurredAt) &&
    typeof v.typeMessage === "string"
  );
}

export async function POST(req: Request) {
  const authError = assertHubSyncAuth(req);
  if (authError) return authError;

  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
    }

    const payload = body as { events?: unknown[] };
    const rawEvents = payload.events;
    if (!Array.isArray(rawEvents) || rawEvents.length === 0) {
      return NextResponse.json({ error: "events[] requis" }, { status: 400 });
    }

    const events = rawEvents.filter(isValidEvent);
    if (events.length !== rawEvents.length) {
      return NextResponse.json({ error: "Certains events sont invalides" }, { status: 400 });
    }

    const typedApi = api as any;
    const results = [] as Array<{ eventId: string; success: boolean; details?: unknown; error?: string }>;
    for (const event of events) {
      try {
        const details = await fetchMutation(typedApi.sync.hub.ingestFromPostgres, event);
        results.push({ eventId: event.eventId, success: true, details });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        results.push({ eventId: event.eventId, success: false, error: message });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    return NextResponse.json({
      success: successCount === results.length,
      total: results.length,
      successCount,
      failureCount: results.length - successCount,
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: "Ingestion hub impossible", details: message }, { status: 500 });
  }
}
