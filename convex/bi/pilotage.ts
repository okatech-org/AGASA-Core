import { query } from "../_generated/server";
import { v } from "convex/values";

export const getPilotageData = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        // Section Financière (Mds de FCFA)
        const perfPiliers = [
            { id: "agrement", nom: "Agrément Sanitaire", reel: 2.1, objectif: 2.5, percent: 84 },
            { id: "import", nom: "Import/Export", reel: 3.5, objectif: 3.0, percent: 116 },
            { id: "labo", nom: "Laboratoires", reel: 0.8, objectif: 1.0, percent: 80 },
            { id: "amendes", nom: "Amendes & Transac.", reel: 0.4, objectif: 0.5, percent: 80 },
            { id: "phyto", nom: "Phytosanitaire", reel: 0.2, objectif: 0.3, percent: 66 }
        ];

        // Objectif Annuel Cumulé (Progression Jan-Dec vs Cible 7 Mds)
        const cummulAnnuel = [
            { mois: "T1", reel: 1.8, cible: 1.75 },
            { mois: "T2", reel: 3.2, cible: 3.50 },
            { mois: "T3", reel: 5.1, cible: 5.25 },
            { mois: "T4", reel: 7.0, cible: 7.00 }
        ];

        // Comparaison des objectifs par province (Spider/Radar Chart)
        const perfProvinciale = [
            { subject: "Estuaire", A: 120, B: 110, fullMark: 150 },
            { subject: "Haut-Ogooué", A: 98, B: 130, fullMark: 150 },
            { subject: "Ogooué-Mar.", A: 86, B: 130, fullMark: 150 },
            { subject: "Woleu-Ntem", A: 99, B: 100, fullMark: 150 },
            { subject: "Ngounié", A: 85, B: 90, fullMark: 150 },
            { subject: "Nyanga", A: 65, B: 85, fullMark: 150 }
        ];

        // Section Performance (SLA)
        const sla = {
            delaiAgrement: { reel: 18, cible: 21, percent: 116 }, // Plus c'est bas mieux c'est
            delaiReponseAlerte: { reel: 34, cible: 48, percent: 129 }, // heures
            disponibilitePlateforme: { reel: 99.8, cible: 99.5, percent: 100 },
            scorePerformanceSysteme: 88.5 // sur 100
        };

        // Section RH (Effectifs et Absentéisme)
        const rh = {
            effectifsTotal: 462,
            absenteisme: 4.2, // %
            repartition: [
                { dir: "DERSP", count: 185 },
                { dir: "DICSP", count: 124 },
                { dir: "LAA", count: 86 },
                { dir: "DAF", count: 42 },
                { dir: "CAB-DG", count: 25 }
            ]
        };

        return { perfPiliers, cummulAnnuel, perfProvinciale, sla, rh };
    }
});
