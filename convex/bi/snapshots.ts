import { internalMutation, query } from "../_generated/server";
import { v } from "convex/values";

export const genererSnapshotKpi = internalMutation({
    handler: async (ctx) => {
        // Dans une implémentation réelle en PROD : 
        // 1. Agréger les données `agrementAgrements` pour le taux de conformité
        // 2. Agréger les `limsRapports` pour les analyses
        // 3. Agréger les `redevances` pour les revenus
        // 4. Parcourir toutes les provinces pour sommer les cas

        const now = Date.now();

        // Mock intelligent pour préserver les perfs sur le front
        const provincesNames = ["Estuaire", "Haut-Ogooué", "Moyen-Ogooué", "Ngounié", "Nyanga", "Ogooué-Ivindo", "Ogooué-Lolo", "Ogooué-Maritime", "Woleu-Ntem"];
        const provincesData = provincesNames.map(p => ({
            nom: p,
            inspections: Math.floor(Math.random() * 50) + 10,
            conformite: Math.floor(Math.random() * 40) + 50, // 50-90%
            recouvrement: Math.floor(Math.random() * 60) + 30, // 30-90%
            amendes: Math.floor(Math.random() * 5),
            saisies: Math.floor(Math.random() * 10)
        }));

        await ctx.db.insert("biKpiSnapshots", {
            dateSnapshot: now,
            provinces: provincesData,
            macroStats: {
                inspectionsMois: 420,
                varInspections: 12.5,
                conformiteGlobale: 78.4,
                varConformite: -2.1,
                tonnesSaisies: 15.2,
                valeurSaisies: 45000000,
                delaiAgrementMoyen: 18, // jours
                tauxRecouvrement: 42, // %
                revenusMensuels: 125000000 // FCFA
            }
        });

        console.log(`[BI] Snapshot généré avec succès à ${new Date(now).toISOString()}`);
    }
});

export const getDernierSnapshot = query({
    handler: async (ctx) => {
        const snapshots = await ctx.db.query("biKpiSnapshots").withIndex("by_date").order("desc").take(1);

        if (snapshots.length === 0) {
            // Renvoie une data par défaut pour le premier rendu
            return {
                dateSnapshot: Date.now(),
                provinces: [],
                macroStats: {
                    inspectionsMois: 0,
                    varInspections: 0,
                    conformiteGlobale: 0,
                    varConformite: 0,
                    tonnesSaisies: 0,
                    valeurSaisies: 0,
                    delaiAgrementMoyen: 0,
                    tauxRecouvrement: 0,
                    revenusMensuels: 0
                }
            };
        }

        return snapshots[0];
    }
});
