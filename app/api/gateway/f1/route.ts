import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

const SECRET = process.env.GATEWAY_HMAC_SECRET || "AGASA_SUPER_SECRET_KEY_2026_HMAC_VALIDATION";

// Route F1 : AGASA-Pro --> AGASA-Core
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { flux, timestamp, data, signature } = body;

        if (flux !== "F1") {
            return NextResponse.json({ error: "Flux non autorisé sur cet endpoint" }, { status: 400 });
        }

        if (!signature || !timestamp || !data) {
            return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
        }

        // --- VALIDATION HMAC SIMPLIFIÉE POUR EXEMPLE ---
        // Dans la réalité, on utiliserait le crypto de Node
        // const isValid = verify(bodyWithoutSignature, signature);
        // if (!isValid) return 401 Unauthorized;

        // Transmission au backend Convex
        await fetchMutation(api.gateway.receive.traiterFluxEntrant as any, {
            flux: "F1",
            data: data
        });

        return NextResponse.json({ success: true, message: "Requête F1 acceptée", referenceId: Date.now().toString() });

    } catch (e: any) {
        return NextResponse.json({ error: "Erreur Serveur", details: e.message }, { status: 500 });
    }
}
