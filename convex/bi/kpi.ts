import { query } from "../_generated/server";
import { v } from "convex/values";

// Gère le LIGNE 1 et LIGNE 2 du Dashboard Opérationnel (app/(dashboard)/bi/page.tsx)
export const getDashboardData = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        // Historique de l'évolution mensuelle du taux de conformité
        const evolutionConformite = [
            { mois: "Jan", taux: 72 }, { mois: "Fév", taux: 75 },
            { mois: "Mar", taux: 74 }, { mois: "Avr", taux: 78 },
            { mois: "Mai", taux: 81 }, { mois: "Juin", taux: 80 },
            { mois: "Juil", taux: 76 }, { mois: "Août", taux: 75 },
            { mois: "Sep", taux: 72 }, { mois: "Oct", taux: 70 },
            { mois: "Nov", taux: 74 }, { mois: "Déc", taux: 78 }
        ];

        // Répartition des redevances par pilier
        const repartitionRedevances = [
            { name: "Agrément & Certificats", value: 35000000, color: "#10b981" },
            { name: "Import/Export", value: 55000000, color: "#3b82f6" },
            { name: "Laboratoire LAA", value: 15000000, color: "#f59e0b" },
            { name: "Phytosanitaire", value: 12000000, color: "#8b5cf6" },
            { name: "Amendes & Pénalités", value: 8000000, color: "#ef4444" }
        ];

        // Top 10 Etablissements Non-Conformes
        const topDelinquants = [
            { etab: "Super Gros (LBV)", infractions: 12 },
            { etab: "Boucherie Centrale", infractions: 9 },
            { etab: "Import Auto-Food", infractions: 8 },
            { etab: "Boulangerie PK8", infractions: 6 },
            { etab: "Poissonnier G&G", infractions: 5 },
            { etab: "Ferme Avicole Sud", infractions: 5 },
            { etab: "Alimentation Joie", infractions: 4 },
            { etab: "Marché Oloumi (Sect 2)", infractions: 4 },
            { etab: "Laiterie Ok", infractions: 3 },
            { etab: "Snack Akanda", infractions: 3 }
        ];

        return {
            evolutionConformite,
            repartitionRedevances,
            topDelinquants
        };
    }
});
