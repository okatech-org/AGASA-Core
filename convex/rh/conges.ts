import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// Obtenir l'agent ID à partir du user ID
const getAgentId = async (ctx: any, userId: any) => {
    const agent = await ctx.db.query("agents").withIndex("by_userId", (q: any) => q.eq("userId", userId)).first();
    return agent ? agent._id : null;
};

// 1. Lister les congés avec logique de visibilité par rôle
export const list = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("Utilisateur introuvable");

        const isDRH = user.role === "admin_systeme" || user.role === "directeur_general" || user.direction === "DAF" || user.demoSimulatedRole === "admin_systeme";
        const isChef = user.role === "chef_service" || user.role === "directeur" || user.demoSimulatedRole === "chef_service";

        let conges = await ctx.db.query("conges").order("desc").collect();

        // Enrichir les données
        const enrichedConges = await Promise.all(
            conges.map(async (c) => {
                const agent = await ctx.db.get(c.agentId);
                const agentUser = agent ? await ctx.db.get(agent.userId) : null;
                return { ...c, agent, user: agentUser };
            })
        );

        if (isDRH) {
            return enrichedConges; // Vue globale
        } else if (isChef) {
            // Voit les siens + ceux de sa direction/service
            const agentId = await getAgentId(ctx, args.userId);
            return enrichedConges.filter(c =>
                c.agentId === agentId ||
                (c.agent?.direction === user.direction)
            );
        } else {
            // Agent lambda : ne voit que ses congés
            const agentId = await getAgentId(ctx, args.userId);
            return enrichedConges.filter(c => c.agentId === agentId);
        }
    }
});

// 2. Créer une nouvelle demande de congé
export const create = mutation({
    args: {
        userId: v.id("users"),
        type: v.union(v.literal("annuel"), v.literal("maladie"), v.literal("formation"), v.literal("maternite"), v.literal("paternite"), v.literal("exceptionnel")),
        dateDebut: v.number(),
        dateFin: v.number(),
        nombreJours: v.number(),
        motif: v.string(),
        isDraft: v.boolean(),
    },
    handler: async (ctx, args) => {
        const agentId = await getAgentId(ctx, args.userId);
        if (!agentId) throw new Error("Profil agent introuvable pour cet utilisateur.");

        const id = await ctx.db.insert("conges", {
            agentId,
            type: args.type,
            dateDebut: args.dateDebut,
            dateFin: args.dateFin,
            nombreJours: args.nombreJours,
            motif: args.motif,
            statut: args.isDraft ? "brouillon" : "soumis",
        });

        if (!args.isDraft) {
            // Log soumission
            await ctx.db.insert("auditLogs", {
                userId: args.userId,
                action: "SOUMISSION_CONGE",
                module: "RH",
                details: `Demande de ${args.nombreJours} jours traitée.`,
                ipAddress: "System",
                userAgent: "API",
                timestamp: Date.now(),
            });

            // Phase 11: Notification Temps Réel In-App pour l'Agent
            await ctx.db.insert("notifications", {
                destinataireId: args.userId,
                titre: "Demande transmise",
                message: `Votre demande de congé (${args.nombreJours}j) a bien été envoyée à votre hiérarchie.`,
                type: "info",
                lien: "/rh/conges",
                lue: false,
                dateCreation: Date.now(),
            });

            // Phase 11: Notification pour les administrateurs (Hiérarchie simulée)
            // Dans un cas réel, on ciblerait le boss direct (users where role == 'directeur' AND direction == user.direction)
        }

        return id;
    }
});

// 3. Workflow d'approbation (Validation / Refus)
export const evaluer = mutation({
    args: {
        adminId: v.id("users"),
        congeId: v.id("conges"),
        action: v.union(v.literal("approuver"), v.literal("refuser")),
        commentaire: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const admin = await ctx.db.get(args.adminId);
        const conge = await ctx.db.get(args.congeId);
        if (!admin || !conge) throw new Error("Entité introuvable");

        const isChef = admin.role === "chef_service" || admin.role === "directeur" || admin.demoSimulatedRole === "chef_service";
        const isDRH = admin.role === "admin_systeme" || admin.direction === "DAF" || admin.demoSimulatedRole === "admin_systeme";

        let newStatus = conge.statut;

        if (args.action === "refuser") {
            newStatus = "refuse";
        } else if (args.action === "approuver") {
            if (conge.statut === "soumis" && isChef) {
                newStatus = "approuve_n1"; // Passe à la DRH
            } else if ((conge.statut === "approuve_n1" || conge.statut === "soumis") && isDRH) {
                newStatus = "approuve_drh"; // Validation finale
            } else {
                throw new Error("Vous n'avez pas les droits pour cette étape de validation.");
            }
        }

        await ctx.db.patch(args.congeId, {
            statut: newStatus as any,
            validePar: admin._id,
            dateValidation: Date.now(),
            commentaireRefus: args.commentaire
        });

        return newStatus;
    }
});
