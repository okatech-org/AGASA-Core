import { query } from "../_generated/server";
import { v } from "convex/values";

// Fournisseur des données pour la carte Leaflet Thermique
export const getCartographieData = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        // En vrai, on agrègerait la BD géospatiale
        // Pour la Heatmap Leaflet (GeoJSON ou Arrays)

        return {
            "Estuaire": { risque: 65, niveau: "tres_eleve", incidents: 145 },
            "Haut-Ogooue": { risque: 25, niveau: "modere", incidents: 32 },
            "Moyen-Ogooue": { risque: 45, niveau: "eleve", incidents: 68 },
            "Ngounie": { risque: 15, niveau: "faible", incidents: 12 },
            "Nyanga": { risque: 10, niveau: "faible", incidents: 8 },
            "Ogooue-Ivindo": { risque: 5, niveau: "faible", incidents: 4 },
            "Ogooue-Lolo": { risque: 12, niveau: "faible", incidents: 9 },
            "Ogooue-Maritime": { risque: 55, niveau: "eleve", incidents: 89 },
            "Woleu-Ntem": { risque: 35, niveau: "modere", incidents: 41 }
        };
    }
});
