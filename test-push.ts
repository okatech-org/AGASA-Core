import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// ID d'un agent de la DB locale au hasard (Copie un ID valide depuis le dashboard /admin/users)
// Ou on pousse direct à tous les Users via la BDD
async function main() {
    console.log("Connecté à Convex URL:", process.env.NEXT_PUBLIC_CONVEX_URL);

    // Utilisation d'un ID en dur (Celui du compte démo standard)
    const DEMO_USER_ID = "j5764dsqx7qjny0xst0f513d7s7965tt"; // Placeholder - À ajuster si erreur

    console.log("Envoi d'une notification push (Type : ALERTE)...");

    try {
        const notifId = await client.mutation(api.notifications.create.createNotification, {
            destinataireId: DEMO_USER_ID as any,
            titre: "⚠️ Dépassement Seuil LABO",
            message: "L'échantillon E-2026-89 (Lot Thon) présente un taux d'histamine supérieur à la norme EN-1456. Action requise.",
            type: "alerte",
            lien: "/lims/echantillons"
        });
        console.log(`✅ Notification injectée avec succès ! ID: ${notifId}`);
    } catch (e) {
        console.log("Erreur d'insertion:", (e as Error).message);
        console.log("Cela signifie probablement que DEMO_USER_ID est incorrect.");
    }
}

main().catch(console.error);
