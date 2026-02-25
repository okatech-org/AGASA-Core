import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";

const checkLogAccess = async (ctx: any, userId: any) => {
    if (!userId) throw new Error("Non autorisé : authentification requise.");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Utilisateur introuvable.");
    return user;
};

// 1. Dashboard KPI & Map Data
export const getFlotteStats = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await checkLogAccess(ctx, args.userId);

        const vehicules = await ctx.db.query("vehicules").collect();
        const stats = {
            total: vehicules.length,
            disponibles: vehicules.filter(v => v.statut === "disponible").length,
            en_mission: vehicules.filter(v => v.statut === "en_mission").length,
            en_maintenance: vehicules.filter(v => v.statut === "en_maintenance").length,
            hors_service: vehicules.filter(v => v.statut === "hors_service").length,

            // Répartition métier (Génie civil / Inspecteurs etc)
            parType: {
                inspection: vehicules.filter(v => v.type === "inspection").length,
                frigorifique: vehicules.filter(v => v.type === "frigorifique").length,
                administratif: vehicules.filter(v => v.type === "administratif").length,
            },

            // Carte (Data points)  
            mapItems: await Promise.all(vehicules.map(async (v) => {
                let currentMissionStr = "Aucune mission active";
                let conducteur = "N/A";

                if (v.statut === "en_mission") {
                    const missionEnCours = await ctx.db.query("missionsVehicules")
                        .withIndex("by_vehiculeId", q => q.eq("vehiculeId", v._id))
                        .filter(q => q.eq(q.field("statut"), "en_cours"))
                        .first();

                    if (missionEnCours) {
                        currentMissionStr = missionEnCours.destination;
                        if (missionEnCours.conducteurId) {
                            const agent = await ctx.db.get(missionEnCours.conducteurId as Id<"agents">);
                            if (agent) {
                                const agentUser = await ctx.db.get(agent.userId);
                                if (agentUser) conducteur = `${agentUser.prenom} ${agentUser.nom}`;
                            }
                        }
                    }
                }

                return {
                    id: v._id,
                    immatriculation: v.immatriculation,
                    marque: v.marque,
                    modele: v.modele,
                    statut: v.statut,
                    province: v.province,
                    mission: currentMissionStr,
                    conducteur
                };
            }))
        };

        return stats;
    }
});

// 2. Liste détaillée des véhicules
export const listerVehicules = query({
    args: {
        userId: v.id("users"),
        statut: v.optional(v.string()),
        type: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        await checkLogAccess(ctx, args.userId);

        let q = ctx.db.query("vehicules").order("desc");
        let vehicules = await q.collect();

        if (args.statut && args.statut !== "tous") {
            vehicules = vehicules.filter(v => v.statut === args.statut);
        }
        if (args.type && args.type !== "tous") {
            vehicules = vehicules.filter(v => v.type === args.type);
        }

        return vehicules;
    }
});

// 3. Fiche véhicule
export const getVehicule = query({
    args: { userId: v.id("users"), vehiculeId: v.id("vehicules") },
    handler: async (ctx, args) => {
        await checkLogAccess(ctx, args.userId);
        const vehicule = await ctx.db.get(args.vehiculeId);
        if (!vehicule) throw new Error("Véhicule introuvable");

        const missionsData = await ctx.db.query("missionsVehicules").withIndex("by_vehiculeId", q => q.eq("vehiculeId", vehicule._id)).order("desc").collect();
        const missions = await Promise.all(missionsData.map(async m => {
            let conducteurNom = 'Inconnu';
            if (m.conducteurId) {
                const agent = await ctx.db.get(m.conducteurId as Id<"agents">);
                if (agent) {
                    const agentUser = await ctx.db.get(agent.userId);
                    if (agentUser) conducteurNom = `${agentUser.prenom} ${agentUser.nom}`;
                }
            }
            return { ...m, conducteur: conducteurNom };
        }));

        const maintenances = await ctx.db.query("maintenances")
            .filter(q => q.eq(q.field("vehiculeId"), vehicule._id))
            .order("desc")
            .collect();

        return { ...vehicule, missions, maintenances };
    }
});

// 4. Ajouter / Créer un véhicule
export const creerVehicule = mutation({
    args: {
        userId: v.id("users"),
        immatriculation: v.string(),
        marque: v.string(),
        modele: v.string(),
        type: v.union(v.literal("inspection"), v.literal("frigorifique"), v.literal("administratif")),
        annee: v.number(),
        province: v.string(),
        kilometrage: v.number(),
        prochaineMaintenanceKm: v.number(),
    },
    handler: async (ctx, args) => {
        const user = await checkLogAccess(ctx, args.userId);

        const id = await ctx.db.insert("vehicules", {
            immatriculation: args.immatriculation,
            marque: args.marque,
            modele: args.modele,
            type: args.type,
            annee: args.annee,
            province: args.province,
            kilometrage: args.kilometrage,
            statut: "disponible",
            prochaineMaintenanceKm: args.prochaineMaintenanceKm
        });

        await ctx.db.insert("auditLogs", {
            userId: user._id,
            action: "CREATION_VEHICULE",
            module: "LOGISTIQUE",
            details: `Enregistrement véhicule ${args.immatriculation}`,
            ipAddress: "System",
            userAgent: "API",
            timestamp: Date.now()
        });

        return id;
    }
});

// 5. Départ en mission
export const assignerMission = mutation({
    args: {
        userId: v.id("users"),
        vehiculeId: v.id("vehicules"),
        conducteurId: v.id("agents"),
        destination: v.string(),
        motif: v.string(),
        dateDepart: v.number(),
        dateRetourPrevue: v.number(),
        kmDepart: v.number()
    },
    handler: async (ctx, args) => {
        const user = await checkLogAccess(ctx, args.userId);
        const vehicule = await ctx.db.get(args.vehiculeId);
        if (!vehicule || vehicule.statut !== "disponible") {
            throw new Error("Véhicule indisponible pour une mission");
        }

        const missionId = await ctx.db.insert("missionsVehicules", {
            vehiculeId: args.vehiculeId,
            conducteurId: args.conducteurId,
            destination: args.destination,
            motif: args.motif,
            dateDepart: args.dateDepart,
            dateRetourPrevue: args.dateRetourPrevue,
            kmDepart: args.kmDepart,
            statut: "en_cours"
        });

        await ctx.db.patch(args.vehiculeId, {
            statut: "en_mission",
            kilometrage: Math.max(vehicule.kilometrage, args.kmDepart)
        });

        return missionId;
    }
});

// 6. Retour de mission (clôture)
export const cloturerMission = mutation({
    args: {
        userId: v.id("users"),
        missionId: v.id("missionsVehicules"),
        kmRetour: v.number(),
        observations: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        await checkLogAccess(ctx, args.userId);
        const mission = await ctx.db.get(args.missionId);
        if (!mission || mission.statut !== "en_cours") throw new Error("Mission introuvable ou déjà terminée");

        if (args.kmRetour < mission.kmDepart) throw new Error("Le kilométrage retour doit être supérieur au départ");

        await ctx.db.patch(mission._id, {
            dateRetourEffective: Date.now(),
            kmRetour: args.kmRetour,
            observations: args.observations,
            statut: "terminee"
        });

        await ctx.db.patch(mission.vehiculeId, {
            statut: "disponible",
            kilometrage: args.kmRetour // MAJ compteur ODO
        });

        return true;
    }
});
