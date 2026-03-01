import crypto from "crypto";

type GatewayPayload = {
    flux: "F1" | "F3" | "F6";
    timestamp: number;
    data: unknown;
    signature: string;
};

type ValidationResult =
    | { ok: true; payload: GatewayPayload }
    | { ok: false; status: number; error: string };

const ALLOWED_SKEW_MS = 5 * 60 * 1000;

function getSecretForFlux(flux: GatewayPayload["flux"]): string | null {
    const perFlux = process.env[`GATEWAY_HMAC_SECRET_${flux}`];
    const shared = process.env.GATEWAY_HMAC_SECRET;
    return perFlux ?? shared ?? null;
}

function timingSafeHexEqual(expectedHex: string, receivedHex: string): boolean {
    if (!/^[a-f0-9]+$/i.test(expectedHex) || !/^[a-f0-9]+$/i.test(receivedHex)) return false;
    if (expectedHex.length !== receivedHex.length) return false;
    return crypto.timingSafeEqual(Buffer.from(expectedHex, "hex"), Buffer.from(receivedHex, "hex"));
}

function signPayload(payload: Omit<GatewayPayload, "signature">, secret: string): string {
    return crypto
        .createHmac("sha256", secret)
        .update(JSON.stringify(payload))
        .digest("hex");
}

export function validateGatewayRequest(body: unknown, expectedFlux: GatewayPayload["flux"]): ValidationResult {
    if (!body || typeof body !== "object") {
        return { ok: false, status: 400, error: "Payload JSON invalide" };
    }

    const raw = body as Partial<GatewayPayload>;
    if (raw.flux !== expectedFlux) {
        return { ok: false, status: 400, error: "Flux non autorisé sur cet endpoint" };
    }

    if (typeof raw.signature !== "string" || !raw.signature.trim()) {
        return { ok: false, status: 400, error: "Signature manquante" };
    }

    if (typeof raw.timestamp !== "number" || !Number.isFinite(raw.timestamp)) {
        return { ok: false, status: 400, error: "Timestamp invalide" };
    }

    if (typeof raw.data === "undefined") {
        return { ok: false, status: 400, error: "Payload invalide" };
    }

    if (Math.abs(Date.now() - raw.timestamp) > ALLOWED_SKEW_MS) {
        return { ok: false, status: 401, error: "Requête expirée ou horloge désynchronisée" };
    }

    const secret = getSecretForFlux(expectedFlux);
    if (!secret) {
        console.error(`[Gateway] Secret HMAC manquant pour ${expectedFlux}`);
        return { ok: false, status: 500, error: "Configuration gateway invalide" };
    }

    const payload: GatewayPayload = {
        flux: expectedFlux,
        timestamp: raw.timestamp,
        data: raw.data,
        signature: raw.signature,
    };

    const expected = signPayload(
        {
            flux: payload.flux,
            timestamp: payload.timestamp,
            data: payload.data,
        },
        secret
    );

    if (!timingSafeHexEqual(expected, payload.signature)) {
        return { ok: false, status: 401, error: "Signature invalide" };
    }

    return { ok: true, payload };
}
