"use node";

import crypto from "crypto";

// Clé secrète factice pour la démonstration (en prod : process.env.GATEWAY_HMAC_SECRET)
const HMAC_SECRET = process.env.GATEWAY_HMAC_SECRET || "AGASA_SUPER_SECRET_KEY_2026_HMAC_VALIDATION";

export function verifierSignature(payloadBase: any, signatureFournie: string): boolean {
    if (!signatureFournie) return false;

    // Convertir l'objet original en string (sans sa signature)
    const payloadString = JSON.stringify(payloadBase);

    // Générer la signature attendue
    const signatureAttendue = crypto
        .createHmac("sha256", HMAC_SECRET)
        .update(payloadString)
        .digest("hex");

    return signatureAttendue === signatureFournie;
}

export function genererSignature(payloadBase: any): string {
    const payloadString = JSON.stringify(payloadBase);
    return crypto
        .createHmac("sha256", HMAC_SECRET)
        .update(payloadString)
        .digest("hex");
}
