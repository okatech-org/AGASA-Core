import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";

const checkFinanceAccess = async (ctx: any, userId: any) => {
    if (!userId) throw new Error("Non autorisé : authentification requise.");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Utilisateur introuvable.");
    return user;
};

// 1. Dashboard Budget
export const getBudgetDashboardStats = query({
    args: { userId: v.id("users"), exercice: v.optional(v.number()) },
    handler: async (ctx, args) => {
        await checkFinanceAccess(ctx, args.userId);

        const annee = args.exercice || new Date().getFullYear();
        const lignes = await ctx.db.query("lignesBudgetaires")
            .withIndex("by_exercice", q => q.eq("exercice", annee))
            .collect();

        // Calcul des agrégats
        let totalAlloue = 0;
        let totalEngage = 0;
        let totalConsomme = 0;

        const consoParDirection: Record<string, number> = {};
        const consoParProvince: Record<string, number> = {};

        lignes.forEach(l => {
            totalAlloue += l.montantAlloue;
            totalEngage += l.montantEngage;
            totalConsomme += l.montantConsomme;

            // Par direction
            if (!consoParDirection[l.direction]) consoParDirection[l.direction] = 0;
            consoParDirection[l.direction] += l.montantConsomme;

            // Par province
            if (!consoParProvince[l.province]) consoParProvince[l.province] = 0;
            consoParProvince[l.province] += l.montantConsomme;
        });

        const totalDisponible = totalAlloue - (totalEngage + totalConsomme);

        // Préparation Data Graphiques
        const chartDirection = Object.keys(consoParDirection).map(d => ({ direction: d, consomme: consoParDirection[d] })).sort((a, b) => b.consomme - a.consomme);
        const chartProvince = Object.keys(consoParProvince).map(p => ({ province: p, consomme: consoParProvince[p] })).sort((a, b) => b.consomme - a.consomme);

        // Simulation de l'évolution mensuelle pour le graphique (Mock)
        const mois = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
        const monthlyBase = totalConsomme > 0 ? totalConsomme / (new Date().getMonth() + 1 || 1) : 0;
        const evolutionMensuelle = mois.map((m, i) => {
            // Uniquement jusqu'au mois en cours pour le réalisme
            if (i > new Date().getMonth()) return { mois: m, consomme: 0 };
            const variation = (Math.random() * 0.4) + 0.8; // +/- 20%
            return {
                mois: m,
                consomme: Math.round(monthlyBase * variation)
            };
        });

        return {
            annee,
            totalAlloue,
            totalEngage,
            pctEngage: totalAlloue > 0 ? (totalEngage / totalAlloue) * 100 : 0,
            totalConsomme,
            pctConsomme: totalAlloue > 0 ? (totalConsomme / totalAlloue) * 100 : 0,
            totalDisponible,
            pctDisponible: totalAlloue > 0 ? (totalDisponible / totalAlloue) * 100 : 0,
            lignes: lignes.map(l => ({
                ...l,
                pctConsommation: l.montantAlloue > 0 ? ((l.montantEngage + l.montantConsomme) / l.montantAlloue) * 100 : 0
            })).sort((a, b) => b.pctConsommation - a.pctConsommation),
            chartDirection,
            chartProvince,
            evolutionMensuelle
        };
    }
});

// 2. Ajouter Ligne Budgétaire
export const ajouterLigne = mutation({
    args: {
        userId: v.id("users"),
        code: v.string(),
        libelle: v.string(),
        programme: v.string(),
        direction: v.string(),
        province: v.string(),
        montantAlloue: v.number(),
        exercice: v.number()
    },
    handler: async (ctx, args) => {
        const user = await checkFinanceAccess(ctx, args.userId);

        // Vérif existence
        const existant = await ctx.db.query("lignesBudgetaires")
            .filter(q => q.and(
                q.eq(q.field("code"), args.code),
                q.eq(q.field("exercice"), args.exercice)
            )).first();

        if (existant) throw new Error("Une ligne avec ce code existe déjà pour cet exercice.");

        const id = await ctx.db.insert("lignesBudgetaires", {
            code: args.code,
            libelle: args.libelle,
            programme: args.programme,
            direction: args.direction,
            province: args.province,
            montantAlloue: args.montantAlloue,
            montantEngage: 0,
            montantConsomme: 0,
            montantDisponible: args.montantAlloue,
            exercice: args.exercice
        });

        // Audit Admin
        await ctx.db.insert("auditLogs", {
            userId: user._id,
            action: "CREATION_LIGNE_BUDGET",
            module: "FINANCE",
            details: `Ligne ${args.code} : ${args.montantAlloue} FCFA (${args.exercice})`,
            ipAddress: "System",
            userAgent: "API",
            timestamp: Date.now()
        });

        return id;
    }
});
