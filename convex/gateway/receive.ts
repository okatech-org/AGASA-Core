import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

export const traiterFluxEntrant = mutation({
    args: {
        flux: v.string(), // F1, F3, F6
        data: v.any()
    },
    handler: async (ctx, args) => {
        try {
            switch (args.flux) {
                case "F1": // AGASA-Pro -> AGASA-Core
                    if (args.data.type === "demande_agrement") {
                        // Crée un dossier fictif
                        console.log("F1: Nouvelle demande d'agrément", args.data);
                    } else if (args.data.type === "paiement_redevance") {
                        // Crée une ligne de redevance payee
                        console.log("F1: Paiement redevance", args.data);
                    } else if (args.data.type === "commande_analyse") {
                        // Crée dossier labo
                        console.log("F1: Commande analyse", args.data);
                    }

                    await ctx.db.insert("fluxInterApps", {
                        fluxCode: "F1",
                        sourceApp: "AGASA-Pro",
                        destinationApp: "AGASA-Core",
                        typeMessage: args.data.type,
                        dateEnvoi: Date.now(),
                        dateReception: Date.now(),
                        payload: JSON.stringify(args.data),
                        statut: "traite",
                        tentatives: 1
                    });

                    break;

                case "F3": // AGASA-Inspect -> AGASA-Core
                    if (args.data.type === "rapport_inspection") {
                        console.log("F3: Rapport inspection", args.data);
                    } else if (args.data.type === "pv_amende") {
                        console.log("F3: PV Amende", args.data);
                    } else if (args.data.type === "echantillon_preleve") {
                        console.log("F3: Echantillon prélevé", args.data);
                    }

                    await ctx.db.insert("fluxInterApps", {
                        fluxCode: "F3",
                        sourceApp: "AGASA-Inspect",
                        destinationApp: "AGASA-Core",
                        typeMessage: args.data.type,
                        dateEnvoi: Date.now(),
                        dateReception: Date.now(),
                        payload: JSON.stringify(args.data),
                        statut: "traite",
                        tentatives: 1
                    });

                    break;

                case "F6": // AGASA-Citoyen -> AGASA-Core
                    if (args.data.type === "signalement_citoyen") {
                        // Router vers Alertes
                        // ctx.db.insert("signalementsCitoyens", ...)
                        console.log("F6: Signalement citoyen", args.data);
                    }

                    await ctx.db.insert("fluxInterApps", {
                        fluxCode: "F6",
                        sourceApp: "AGASA-Citoyen",
                        destinationApp: "AGASA-Core",
                        typeMessage: args.data.type,
                        dateEnvoi: Date.now(),
                        dateReception: Date.now(),
                        payload: JSON.stringify(args.data),
                        statut: "traite",
                        tentatives: 1
                    });

                    break;

                default:
                    throw new Error("Flux entrant inconnu: " + args.flux);
            }
        } catch (error: any) {
            await ctx.db.insert("fluxInterApps", {
                fluxCode: args.flux as any,
                sourceApp: `INCONNU-${args.flux}`,
                destinationApp: "AGASA-Core",
                typeMessage: "ERREUR_ROUTAGE",
                dateEnvoi: Date.now(),
                dateReception: Date.now(),
                payload: JSON.stringify(args.data),
                statut: "erreur",
                erreur: error.message,
                tentatives: 1
            });
            throw error;
        }
    }
});
