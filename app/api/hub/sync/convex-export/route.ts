import { NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { assertHubSyncAuth, parsePositiveInt } from "../_auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const authError = assertHubSyncAuth(req);
  if (authError) return authError;

  try {
    const url = new URL(req.url);
    const since = parsePositiveInt(url.searchParams.get("since"), 0);
    const limit = parsePositiveInt(url.searchParams.get("limit"), 200);

    const typedApi = api as any;
    const data = await fetchQuery(typedApi.sync.hub.exportEvents, {
      since,
      limit,
    });

    return NextResponse.json({
      success: true,
      since,
      limit,
      ...data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: "Export hub impossible", details: message }, { status: 500 });
  }
}
