import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { validateGatewayRequest } from "../_utils";

export const runtime = "nodejs";

// Route F3 : AGASA-Inspect --> AGASA-Admin
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validation = validateGatewayRequest(body, "F3");
        if (!validation.ok) {
            return NextResponse.json({ error: validation.error }, { status: validation.status });
        }
        const bridgeToken = process.env.GATEWAY_INTERNAL_BRIDGE_TOKEN;
        if (!bridgeToken) {
            return NextResponse.json({ error: "Configuration gateway invalide" }, { status: 500 });
        }

        await fetchMutation(api.gateway.receive.traiterFluxEntrant, {
            flux: "F3",
            data: validation.payload.data,
            bridgeToken,
        });

        return NextResponse.json({ success: true, message: "Requête F3 acceptée", referenceId: Date.now().toString() });

    } catch (e: any) {
        return NextResponse.json({ error: "Erreur Serveur", details: e.message }, { status: 500 });
    }
}
