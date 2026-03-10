import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { validateGatewayRequest } from "../_utils";

export const runtime = "nodejs";

// Route F1 : AGASA-Pro --> AGASA-Admin
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validation = validateGatewayRequest(body, "F1");
        if (!validation.ok) {
            return NextResponse.json({ error: validation.error }, { status: validation.status });
        }
        const bridgeToken = process.env.GATEWAY_INTERNAL_BRIDGE_TOKEN;
        if (!bridgeToken) {
            return NextResponse.json({ error: "Configuration gateway invalide" }, { status: 500 });
        }

        // Transmission au backend Convex
        await fetchMutation(api.gateway.receive.traiterFluxEntrant, {
            flux: "F1",
            data: validation.payload.data,
            bridgeToken,
        });

        return NextResponse.json({ success: true, message: "Requête F1 acceptée", referenceId: Date.now().toString() });

    } catch (e: any) {
        return NextResponse.json({ error: "Erreur Serveur", details: e.message }, { status: 500 });
    }
}
