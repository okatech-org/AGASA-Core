"use node";

import crypto from "crypto";

function getHmacSecret(): string {
    const secret = process.env.GATEWAY_HMAC_SECRET;
    if (!secret) {
        throw new Error("GATEWAY_HMAC_SECRET manquant");
    }
    return secret;
}

export function verifierSignature(payloadBase: any, signatureFournie: string): boolean {
    if (!signatureFournie) return false;

    try {
        const payloadString = JSON.stringify(payloadBase);
        const signatureAttendue = crypto
            .createHmac("sha256", getHmacSecret())
            .update(payloadString)
            .digest("hex");

        if (signatureAttendue.length !== signatureFournie.length) return false;
        return crypto.timingSafeEqual(
            Buffer.from(signatureAttendue, "hex"),
            Buffer.from(signatureFournie, "hex")
        );
    } catch {
        return false;
    }
}

export function genererSignature(payloadBase: any): string {
    const payloadString = JSON.stringify(payloadBase);
    return crypto
        .createHmac("sha256", getHmacSecret())
        .update(payloadString)
        .digest("hex");
}
