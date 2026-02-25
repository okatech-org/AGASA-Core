import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";

const checkLogAccess = async (ctx: any, userId: any) => {
    if (!userId) throw new Error("Non autorisé : authentification requise.");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Utilisateur introuvable.");
    return user;
};

// 1. Dashboard Équipements (LAA)
export const getEquipementsStats = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await checkLogAccess(ctx, args.userId);

        const equipements = await ctx.db.query("equipements").collect();
        const calibrationsUrgentes = equipements.filter(e => {
            if (!e.prochaineCalibration) return false;
            const diffJours = (e.prochaineCalibration - Date.now()) / (1000 * 60 * 60 * 24);
            return diffJours > 0 && diffJours <= 30; // Calibration expire dans les 30 jours
        });

        return {
            total: equipements.length,
            operationnels: equipements.filter(e => e.statut === "operationnel").length,
            en_panne: equipements.filter(e => e.statut === "en_panne" || e.statut === "reforme").length,
            en_maintenance: equipements.filter(e => e.statut === "en_maintenance").length,

            calibrationsUrgentes: calibrationsUrgentes.length,
            calibrationsList: calibrationsUrgentes.slice(0, 5),

            repartitionType: {
                spectro: equipements.filter(e => e.type === "spectrometre").length,
                chromato: equipements.filter(e => e.type === "chromatographe").length,
                balance: equipements.filter(e => e.type === "balance").length,
                autre: equipements.filter(e => e.type === "autre").length
            }
        };
    }
});

// 2. Liste détaillée des équipements
export const listerEquipements = query({
    args: {
        userId: v.id("users"),
        statut: v.optional(v.string()),
        type: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        await checkLogAccess(ctx, args.userId);
        let q = ctx.db.query("equipements").order("desc");
        let liste = await q.collect();

        if (args.statut && args.statut !== "tous") {
            liste = liste.filter(e => e.statut === args.statut);
        }
        if (args.type && args.type !== "tous") {
            liste = liste.filter(e => e.type === args.type);
        }

        return liste;
    }
});

// 3. Fiche Équipement détaillée
export const getEquipement = query({
    args: { userId: v.id("users"), equipementId: v.id("equipements") },
    handler: async (ctx, args) => {
        await checkLogAccess(ctx, args.userId);
        const equipement = await ctx.db.get(args.equipementId);
        if (!equipement) throw new Error("Équipement introuvable");

        const maintenances = await ctx.db.query("maintenances")
            .filter(q => q.eq(q.field("equipementId"), equipement._id))
            .order("desc")
            .collect();

        return { ...equipement, maintenances };
    }
});

// 4. Ajouter un équipement
export const creerEquipement = mutation({
    args: {
        userId: v.id("users"),
        reference: v.string(),
        designation: v.string(),
        type: v.union(v.literal("spectrometre"), v.literal("chromatographe"), v.literal("balance"), v.literal("autre")),
        marque: v.string(),
        modele: v.string(),
        laboratoire: v.string(),
        dateAcquisition: v.number(),
        prochaineCalibration: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const user = await checkLogAccess(ctx, args.userId);

        const id = await ctx.db.insert("equipements", {
            reference: args.reference,
            designation: args.designation,
            type: args.type,
            marque: args.marque,
            modele: args.modele,
            laboratoire: args.laboratoire,
            dateAcquisition: args.dateAcquisition,
            prochaineCalibration: args.prochaineCalibration,
            statut: "operationnel"
        });

        // Audit Admin
        await ctx.db.insert("auditLogs", {
            userId: user._id,
            action: "CREATION_EQUIPEMENT_LAA",
            module: "LOGISTIQUE",
            details: `Enregistrement Eqpt: ${args.reference} | ${args.designation}`,
            ipAddress: "System",
            userAgent: "API",
            timestamp: Date.now()
        });

        return id;
    }
});
