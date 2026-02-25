import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";

const checkLogAccess = async (ctx: any, userId: any) => {
    if (!userId) throw new Error("Non autorisé : authentification requise.");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Utilisateur introuvable.");
    return user;
};

// 1. Liste des prochaines maintenances (Agenda)
export const getAgendaMaintenance = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await checkLogAccess(ctx, args.userId);

        const vehicules = await ctx.db.query("vehicules").collect();
        const equipements = await ctx.db.query("equipements").collect();

        const data: any[] = [];
        const now = Date.now();
        const moisProchain = now + (1000 * 60 * 60 * 24 * 30);

        // Agenda Véhicules
        vehicules.forEach(v => {
            if (v.prochaineMaintenanceDate) {
                data.push({
                    typeEntite: "vehicule",
                    id: v._id,
                    titre: `${v.marque} ${v.modele} (${v.immatriculation})`,
                    date: v.prochaineMaintenanceDate,
                    statut: (v.prochaineMaintenanceDate < now) ? "retard" : (v.prochaineMaintenanceDate < moisProchain ? "urgent" : "planifie"),
                    critere: v.prochaineMaintenanceKm ? `Km: ${v.kilometrage} / ${v.prochaineMaintenanceKm}` : ""
                });
            }
        });

        // Agenda Equipements (LAA)
        equipements.forEach(e => {
            if (e.prochaineCalibration) {
                data.push({
                    typeEntite: "equipement",
                    id: e._id,
                    titre: `${e.designation} (${e.reference})`,
                    date: e.prochaineCalibration,
                    statut: (e.prochaineCalibration < now) ? "retard" : (e.prochaineCalibration < moisProchain ? "urgent" : "planifie"),
                    critere: `Calibration requise`
                });
            }
        });

        return data.sort((a, b) => a.date - b.date);
    }
});

// 2. Enregistrer une nouvelle intervention (Auto ou LAA)
export const enregistrerIntervention = mutation({
    args: {
        userId: v.id("users"),
        entiteType: v.union(v.literal("vehicule"), v.literal("equipement")),
        entiteId: v.string(), // ID du véhi ou de l'équipement
        typeIntervention: v.union(v.literal("preventive"), v.literal("corrective"), v.literal("calibration")),
        dateIntervention: v.number(),
        description: v.string(),
        technicien: v.string(),
        cout: v.optional(v.number()),
        // Pour reprogrammer la prochaine
        prochaineMaintenanceKm: v.optional(v.number()),
        prochaineMaintenanceDate: v.optional(v.number())
    },
    handler: async (ctx, args) => {
        const user = await checkLogAccess(ctx, args.userId);

        let vId: Id<"vehicules"> | undefined = undefined;
        let eId: Id<"equipements"> | undefined = undefined;

        if (args.entiteType === "vehicule") {
            vId = args.entiteId as Id<"vehicules">;
            const veh = await ctx.db.get(vId);
            if (!veh) throw new Error("Véhicule introuvable");

            // Mise à jour de la prochaine maintenance sur le véhicule
            const patch: any = { statut: "disponible" };
            if (args.prochaineMaintenanceKm) patch.prochaineMaintenanceKm = args.prochaineMaintenanceKm;
            if (args.prochaineMaintenanceDate) patch.prochaineMaintenanceDate = args.prochaineMaintenanceDate;
            await ctx.db.patch(vId, patch);

        } else {
            eId = args.entiteId as Id<"equipements">;
            const eqpt = await ctx.db.get(eId);
            if (!eqpt) throw new Error("Équipement introuvable");

            // Mise à jour de l'équipement
            const patch: any = { statut: "operationnel", derniereCalibration: args.dateIntervention };
            if (args.prochaineMaintenanceDate) patch.prochaineCalibration = args.prochaineMaintenanceDate;
            await ctx.db.patch(eId, patch);
        }

        // Création de l'entrée dans le carnet d'entretien unifié
        await ctx.db.insert("maintenances", {
            vehiculeId: vId,
            equipementId: eId,
            type: args.typeIntervention,
            dateIntervention: args.dateIntervention,
            description: args.description,
            technicien: args.technicien,
            cout: args.cout,
            statut: "terminee"
        });

        // Audit Admin
        await ctx.db.insert("auditLogs", {
            userId: user._id,
            action: "NOUVELLE_MAINTENANCE",
            module: "LOGISTIQUE",
            details: `Intervention ${args.typeIntervention} sur ${args.entiteType}: ${args.entiteId}`,
            ipAddress: "System",
            userAgent: "API",
            timestamp: Date.now()
        });

        return "success";
    }
});
