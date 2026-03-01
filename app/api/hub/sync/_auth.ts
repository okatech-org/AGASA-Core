import { NextResponse } from "next/server";

export function assertHubSyncAuth(req: Request): NextResponse | null {
  const expected = process.env.HUB_SYNC_TOKEN;
  if (!expected) {
    return NextResponse.json({ error: "HUB_SYNC_TOKEN manquant" }, { status: 500 });
  }

  const header = req.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Authorization manquante" }, { status: 401 });
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token || token !== expected) {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }

  return null;
}

export function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}
