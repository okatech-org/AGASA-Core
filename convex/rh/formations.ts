import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// 1. Lister le catalogue de formations
export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("formations").order("desc").collect();
    }
});

// 2. Obtenir les détails d'une formation et la liste des inscrits
export const getDetails = query({
    args: { formationId: v.id("formations") },
    handler: async (ctx, args) => {
        const formation = await ctx.db.get(args.formationId);
        if (!formation) throw new Error("Formation introuvable");

        const inscriptions = await ctx.db.query("inscriptionsFormation")
            .withIndex("by_formationId", q => q.eq("formationId", args.formationId))
            .collect();

        const inscrits = await Promise.all(inscriptions.map(async (ins) => {
            const agent = await ctx.db.get(ins.agentId);
            const user = agent ? await ctx.db.get(agent.userId) : null;
            return {
                ...ins,
                agent,
                user
            };
        }));

        return {
            ...formation,
            inscriptions: inscrits
        };
    }
});

// 3. Créer une formation (Réservé DRH/Admin)
export const create = mutation({
    args: {
        adminId: v.id("users"),
        titre: v.string(),
        description: v.string(),
        categorie: v.union(v.literal("HACCP"), v.literal("ISO_22000"), v.literal("ISO_17025"), v.literal("culture_numerique"), v.literal("securite"), v.literal("management"), v.literal("autre")),
        duree: v.number(),
        formateur: v.string(),
        lieu: v.string(),
        dateDebut: v.number(),
        dateFin: v.number(),
        capaciteMax: v.number(),
    },
    handler: async (ctx, args) => {
        const admin = await ctx.db.get(args.adminId);
        if (!admin || (admin.role !== "admin_systeme" && admin.direction !== "DAF" && admin.demoSimulatedRole !== "admin_systeme")) {
            throw new Error("Privilèges insuffisants pour créer une formation.");
        }

        const id = await ctx.db.insert("formations", {
            titre: args.titre,
            description: args.description,
            categorie: args.categorie,
            duree: args.duree,
            formateur: args.formateur,
            lieu: args.lieu,
            dateDebut: args.dateDebut,
            dateFin: args.dateFin,
            capaciteMax: args.capaciteMax,
            statut: "planifiee",
        });

        return id;
    }
});

// 4. S'inscrire à une formation
export const inscrire = mutation({
    args: {
        userId: v.id("users"),
        formationId: v.id("formations"),
    },
    handler: async (ctx, args) => {
        const agent = await ctx.db.query("agents").withIndex("by_userId", q => q.eq("userId", args.userId)).first();
        if (!agent) throw new Error("Profil agent introuvable.");

        // Vérifier si déjà inscrit
        const existing = await ctx.db.query("inscriptionsFormation")
            .withIndex("by_agentId", q => q.eq("agentId", agent._id))
            .filter(q => q.eq(q.field("formationId"), args.formationId))
            .first();

        if (existing) throw new Error("Vous êtes déjà inscrit à cette formation.");

        // Vérifier la capacité
        const inscrits = await ctx.db.query("inscriptionsFormation")
            .withIndex("by_formationId", q => q.eq("formationId", args.formationId))
            .filter(q => q.neq(q.field("statut"), "absent"))
            .collect();

        const formation = await ctx.db.get(args.formationId);
        if (!formation) throw new Error("Formation introuvable");

        if (inscrits.length >= formation.capaciteMax) {
            throw new Error("Cette formation est complète.");
        }

        await ctx.db.insert("inscriptionsFormation", {
            formationId: args.formationId,
            agentId: agent._id,
            statut: "inscrit",
            dateInscription: Date.now(),
        });

        return true;
    }
});

// 5. Marquer la présence d'un inscrit
export const marquerPresence = mutation({
    args: {
        adminId: v.id("users"),
        inscriptionId: v.id("inscriptionsFormation"),
        present: v.boolean(),
    },
    handler: async (ctx, args) => {
        const admin = await ctx.db.get(args.adminId);
        if (!admin || (admin.role !== "admin_systeme" && admin.direction !== "DAF" && admin.demoSimulatedRole !== "admin_systeme")) {
            throw new Error("Privilèges insuffisants.");
        }

        await ctx.db.patch(args.inscriptionId, {
            statut: args.present ? "present" : "absent"
        });

        return true;
    }
});
