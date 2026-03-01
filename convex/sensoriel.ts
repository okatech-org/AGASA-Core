import { httpAction, query } from "./_generated/server";

export const healthcheck = query({
  args: {},
  handler: async () => ({ ok: true, timestamp: Date.now() }),
});

export const webhookEntrant = httpAction(async (ctx, request) => {
  const now = Date.now();
  const expectedToken = process.env.SENSORIEL_WEBHOOK_TOKEN;
  const token = request.headers.get("x-agasa-sensor-token") ?? "";

  if (expectedToken && token !== expectedToken) {
    return new Response(JSON.stringify({ error: "Webhook non autorisé" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  let payload: unknown = null;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Payload JSON invalide" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(JSON.stringify({
    success: true,
    receivedAt: now,
    method: request.method,
    hasPayload: payload !== null,
  }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
});
