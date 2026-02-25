import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// Obtenir l'agent ID
const getAgentId = async (ctx: any, userId: any) => {
    const agent = await ctx.db.query("agents").withIndex("by_userId", (q: any) => q.eq("userId", userId)).first();
    return agent ? agent._id : null;
};

export const listBulletins = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) return [];

        const isDRH = user.role === "admin_systeme" || user.role === "directeur_general" || user.direction === "DAF" || user.demoSimulatedRole === "admin_systeme";

        let bulletins = await ctx.db.query("paie").order("desc").collect();

        // Enrichir
        const enriched = await Promise.all(bulletins.map(async b => {
            const agent = await ctx.db.get(b.agentId);
            const agentUser = agent ? await ctx.db.get(agent.userId) : null;
            return { ...b, agent, user: agentUser };
        }));

        if (isDRH) return enriched;

        // Pour un agent régulier
        const agentId = await getAgentId(ctx, args.userId);
        return enriched.filter(b => b.agentId === agentId);
    }
});

export const calculerPaieMois = mutation({
    args: {
        adminId: v.id("users"),
        mois: v.number(),
        annee: v.number(),
    },
    handler: async (ctx, args) => {
        // En prod, ceci serait réservé au rôle DAF/Admin
        const agents = await ctx.db.query("agents").collect();
        const generatedIds = [];

        // Supprimer l'existant s'il y en a en brouillon/calculé
        const existants = await ctx.db.query("paie")
            .filter(q => q.eq(q.field("mois"), args.mois))
            .filter(q => q.eq(q.field("annee"), args.annee))
            .collect();

        for (const ex of existants) {
            if (ex.statut === "calcule") await ctx.db.delete(ex._id);
        }

        // Simuler le calcul simplifié pour chaque agent
        for (const agent of agents) {
            if (agent.statut === "retraité" || agent.statut === "suspendu") continue;

            const baseGradeMap: Record<string, number> = {
                "A1": 850000, "A2": 750000, "B1": 600000, "B2": 500000, "C1": 350000
            };
            const salaireBase = baseGradeMap[agent.grade] || 400000;
            const primesTerrain = agent.province !== "Siège" ? 150000 : 0;
            const indemnitesProvinciales = agent.province !== "Estuaire" ? 50000 : 0;
            const autresPrimes = (agent.echelon * 10000); // Prime d'ancienneté simulée

            const brut = salaireBase + primesTerrain + indemnitesProvinciales + autresPrimes;
            const retenueCNSS = brut * 0.025; // 2.5%
            const retenueImpot = brut * 0.15; // 15% flat demo
            const autresRetenues = 0;

            const netAPayer = brut - retenueCNSS - retenueImpot - autresRetenues;

            const id = await ctx.db.insert("paie", {
                agentId: agent._id,
                mois: args.mois,
                annee: args.annee,
                salaireBase,
                primesTerrain,
                indemnitesProvinciales,
                autresPrimes,
                retenueCNSS,
                retenueImpot,
                autresRetenues,
                netAPayer,
                dateGeneration: Date.now(),
                statut: "calcule"
            });
            generatedIds.push(id);
        }

        return generatedIds.length;
    }
});

export const validerPaie = mutation({
    args: {
        adminId: v.id("users"),
        mois: v.number(),
        annee: v.number(),
    },
    handler: async (ctx, args) => {
        // Valide tous les bulletins calculés du mois
        const bulletins = await ctx.db.query("paie")
            .filter(q => q.eq(q.field("mois"), args.mois))
            .filter(q => q.eq(q.field("annee"), args.annee))
            .filter(q => q.eq(q.field("statut"), "calcule"))
            .collect();

        for (const b of bulletins) {
            await ctx.db.patch(b._id, { statut: "valide" });
        }

        // Log audit
        await ctx.db.insert("auditLogs", {
            userId: args.adminId,
            action: "VALIDATION_PAIE",
            module: "RH",
            details: `Paie ${args.mois}/${args.annee} validée pour ${bulletins.length} agents.`,
            ipAddress: "System",
            userAgent: "API",
            timestamp: Date.now(),
        });

        return true;
    }
});

export const getBrouillonPaie = query({
    args: {
        mois: v.number(),
        annee: v.number(),
    },
    handler: async (ctx, args) => {
        let bulletins = await ctx.db.query("paie")
            .filter(q => q.eq(q.field("mois"), args.mois))
            .filter(q => q.eq(q.field("annee"), args.annee))
            .filter(q => q.eq(q.field("statut"), "calcule"))
            .collect();

        return await Promise.all(bulletins.map(async b => {
            const agent = await ctx.db.get(b.agentId);
            const user = agent ? await ctx.db.get(agent.userId) : null;
            return { ...b, agent, user };
        }));
    }
});

export const updateLignePaie = mutation({
    args: {
        adminId: v.id("users"),
        paieId: v.id("paie"),
        updates: v.object({
            salaireBase: v.optional(v.number()),
            primesTerrain: v.optional(v.number()),
            indemnitesProvinciales: v.optional(v.number()),
            autresPrimes: v.optional(v.number()),
            retenueCNSS: v.optional(v.number()),
            retenueImpot: v.optional(v.number()),
            autresRetenues: v.optional(v.number()),
        })
    },
    handler: async (ctx, args) => {
        const paie = await ctx.db.get(args.paieId);
        if (!paie || paie.statut !== "calcule") throw new Error("Ligne introuvable ou déjà validée.");

        const merged = { ...paie, ...args.updates };
        const brut = merged.salaireBase + merged.primesTerrain + merged.indemnitesProvinciales + merged.autresPrimes;
        const netAPayer = brut - merged.retenueCNSS - merged.retenueImpot - merged.autresRetenues;

        await ctx.db.patch(args.paieId, {
            ...args.updates,
            netAPayer
        });

        return true;
    }
});
