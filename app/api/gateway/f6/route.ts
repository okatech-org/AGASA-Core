import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

// Route F6 : AGASA-Citoyen --> AGASA-Core
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { flux, timestamp, data, signature } = body;

        if (flux !== "F6") {
            return NextResponse.json({ error: "Flux non autorisé sur cet endpoint" }, { status: 400 });
        }

        if (!signature || !data) {
            return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
        }

        await fetchMutation(api.gateway.receive.traiterFluxEntrant as any, {
            flux: "F6",
            data: data
        });

        return NextResponse.json({ success: true, message: "Requête F6 acceptée", referenceId: Date.now().toString() });

    } catch (e: any) {
        return NextResponse.json({ error: "Erreur Serveur", details: e.message }, { status: 500 });
    }
}
