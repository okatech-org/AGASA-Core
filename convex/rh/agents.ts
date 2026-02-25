import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// Helper to check HR access rights
const checkRHAccess = async (ctx: any, userId: any, requireWrite = false) => {
    if (!userId) throw new Error("Non autorisé : authentification requise.");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Utilisateur introuvable.");

    if (requireWrite) {
        const hasRights = [
            "admin_systeme",
            "directeur_general",
            "directeur",
            "chef_service",
        ].includes(user.role) || [
            "admin_systeme",
            "directeur_general",
            "directeur",
            "chef_service",
        ].includes(user.demoSimulatedRole);

        if (!hasRights) {
            throw new Error("Accès refusé : privilèges RH requis.");
        }
    }
    return user;
};

// 1. Lister tous les agents avec les infos utilisateurs jointes
export const listAgents = query({
    args: {
        userId: v.id("users"),
        direction: v.optional(v.string()),
        province: v.optional(v.string()),
        statut: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await checkRHAccess(ctx, args.userId);

        let agents = await ctx.db.query("agents").order("desc").collect();

        // Join with users table
        const enrichedAgents = await Promise.all(
            agents.map(async (agent) => {
                const user = await ctx.db.get(agent.userId);
                return {
                    ...agent,
                    user: user || null,
                };
            })
        );

        // Apply filters in memory
        return enrichedAgents.filter((agent) => {
            if (args.direction && args.direction !== "Toutes" && agent.direction !== args.direction) return false;
            if (args.province && args.province !== "Toutes" && agent.province !== args.province) return false;
            if (args.statut && args.statut !== "Tous" && agent.statut !== args.statut) return false;
            return true;
        });
    },
});

// 2. Obtenir un agent spécifique
export const getAgent = query({
    args: {
        userId: v.id("users"),
        agentId: v.id("agents"),
    },
    handler: async (ctx, args) => {
        await checkRHAccess(ctx, args.userId);
        const agent = await ctx.db.get(args.agentId);
        if (!agent) throw new Error("Agent introuvable");

        const user = await ctx.db.get(agent.userId);

        let documents: any = [];
        if (agent.documents && agent.documents.length > 0) {
            documents = await Promise.all(
                agent.documents.map(async (doc) => {
                    const url = await ctx.storage.getUrl(doc.id);
                    return { ...doc, url };
                })
            );
        }

        return {
            ...agent,
            user,
            documents
        };
    },
});

// 3. Obtenir l'organigramme (groupé par direction)
export const getOrganigramme = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        await checkRHAccess(ctx, args.userId);

        const agents = await ctx.db.query("agents").collect();
        const users = await ctx.db.query("users").collect();

        const enrichedAgents = agents.map(agent => ({
            ...agent,
            user: users.find(u => u._id === agent.userId)
        }));

        // Construire la hiérarchie simple (DG -> Directions -> Services)
        const directions = ["DG", "DERSP", "DICSP", "DAF", "LAA"];

        const hierarchy = directions.map(dir => {
            const agentsInDirection = enrichedAgents.filter(a => a.direction === dir);
            // Trouver le directeur
            const directeur = agentsInDirection.find(a =>
                a.user?.role === "directeur" ||
                a.user?.role === "directeur_general" ||
                a.poste?.toLowerCase().includes("directeur")
            );

            // Group by service
            const servicesMap = new Map();
            agentsInDirection.forEach(agent => {
                if (agent.service) {
                    if (!servicesMap.has(agent.service)) servicesMap.set(agent.service, []);
                    servicesMap.get(agent.service).push(agent);
                }
            });

            return {
                nom: dir,
                directeur: directeur || null,
                totalAgents: agentsInDirection.length,
                services: Array.from(servicesMap.entries()).map(([nom, agents]) => ({
                    nom,
                    chef: agents.find((a: any) => a.user?.role === "chef_service" || a.poste?.toLowerCase().includes("chef")),
                    totalAgents: agents.length,
                    agents
                }))
            };
        });

        return hierarchy;
    },
});

// 4. Créer un nouvel agent (et un compte utilisateur basique asssocié)
export const createAgent = mutation({
    args: {
        adminId: v.id("users"),
        // User Info
        email: v.string(),
        nom: v.string(),
        prenom: v.string(),
        telephone: v.optional(v.string()),
        // Agent Info
        etatCivil: v.object({
            dateNaissance: v.string(),
            lieuNaissance: v.string(),
            nationalite: v.string(),
            situationFamiliale: v.string(),
            nombreEnfants: v.number(),
            adresse: v.string(),
            cni: v.string(),
        }),
        poste: v.string(),
        grade: v.string(),
        echelon: v.number(),
        dateRecrutement: v.number(),
        direction: v.string(),
        service: v.string(),
        province: v.string(),
        competences: v.array(v.string()),
        contratType: v.union(v.literal("fonctionnaire"), v.literal("contractuel"), v.literal("vacataire")),
    },
    handler: async (ctx, args) => {
        const admin = await checkRHAccess(ctx, args.adminId, true);

        // 1. Vérifier si l'email existe
        const existingUser = await ctx.db.query("users").withIndex("by_email", q => q.eq("email", args.email)).first();
        if (existingUser) throw new Error("Un utilisateur avec cet email existe déjà.");

        // 2. Générer le matricule AGASA-YYYY-XXXX
        const annee = new Date().getFullYear();
        const tousUsers = await ctx.db.query("users").collect();
        const sequence = String(tousUsers.length + 1).padStart(4, '0');
        const nouveauMatricule = `AGASA-${annee}-${sequence}`;

        // 3. Créer l'utilisateur
        const newUserId = await ctx.db.insert("users", {
            firebaseUid: "pending_" + Date.now(), // Placeholder until they sign up
            email: args.email,
            nom: args.nom,
            prenom: args.prenom,
            telephone: args.telephone,
            role: "agent", // Role par défaut
            direction: args.direction as any,
            province: args.province as any,
            statut: "actif",
            tentativesConnexion: 0,
            derniereConnexion: 0,
            matricule: nouveauMatricule,
            dateCreation: Date.now(),
            dateModification: Date.now(),
            creePar: admin._id,
            is2FAActif: false,
        });

        // 4. Créer l'agent
        const newAgentId = await ctx.db.insert("agents", {
            userId: newUserId,
            etatCivil: args.etatCivil,
            poste: args.poste,
            grade: args.grade,
            echelon: args.echelon,
            dateRecrutement: args.dateRecrutement,
            direction: args.direction,
            service: args.service,
            province: args.province,
            competences: args.competences,
            contratType: args.contratType,
            statut: "en_poste",
        });

        // Audit Log
        await ctx.db.insert("auditLogs", {
            userId: admin._id,
            action: "CREATION_AGENT",
            module: "RH",
            details: `Agent ${args.nom} ${args.prenom} (${nouveauMatricule}) créé.`,
            ipAddress: "System",
            userAgent: "AGASA-Core API",
            timestamp: Date.now(),
            entiteType: "agents",
            entiteId: newAgentId,
        });

        return newAgentId;
    },
});

// 5. Mettre à jour un agent existant
export const updateAgent = mutation({
    args: {
        adminId: v.id("users"),
        agentId: v.id("agents"),
        updates: v.object({
            poste: v.optional(v.string()),
            grade: v.optional(v.string()),
            echelon: v.optional(v.number()),
            direction: v.optional(v.string()),
            service: v.optional(v.string()),
            province: v.optional(v.string()),
            statut: v.optional(v.union(v.literal("en_poste"), v.literal("détaché"), v.literal("suspendu"), v.literal("retraité"))),
            competences: v.optional(v.array(v.string())),
            contratType: v.optional(v.union(v.literal("fonctionnaire"), v.literal("contractuel"), v.literal("vacataire"))),
        })
    },
    handler: async (ctx, args) => {
        const admin = await checkRHAccess(ctx, args.adminId, true);

        const agent = await ctx.db.get(args.agentId);
        if (!agent) throw new Error("Agent introuvable");

        await ctx.db.patch(args.agentId, args.updates);

        // Also update the associated user if direction/province changed
        const userUpdates: any = {};
        if (args.updates.direction) userUpdates.direction = args.updates.direction;
        if (args.updates.province) userUpdates.province = args.updates.province;

        if (Object.keys(userUpdates).length > 0) {
            await ctx.db.patch(agent.userId, userUpdates);
        }

        // Audit Log
        await ctx.db.insert("auditLogs", {
            userId: admin._id,
            action: "MODIFICATION_AGENT",
            module: "RH",
            details: `Profil agent ${args.agentId} mis à jour.`,
            ipAddress: "System",
            userAgent: "AGASA-Core API",
            timestamp: Date.now(),
            entiteType: "agents",
            entiteId: args.agentId,
        });

        return true;
    }
});

// --- GESTION DES DOCUMENTS ---

export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});

export const saveDocument = mutation({
    args: {
        adminId: v.id("users"),
        agentId: v.id("agents"),
        storageId: v.id("_storage"),
        nom: v.string(),
        type: v.string(),
    },
    handler: async (ctx, args) => {
        const admin = await checkRHAccess(ctx, args.adminId, true);
        const agent = await ctx.db.get(args.agentId);
        if (!agent) throw new Error("Agent introuvable");

        const doc = {
            id: args.storageId,
            nom: args.nom,
            type: args.type,
            dateAjout: Date.now(),
            ajoutePar: admin._id,
        };

        const existingDocs = agent.documents || [];
        await ctx.db.patch(args.agentId, {
            documents: [...existingDocs, doc]
        });

        // Audit Log
        await ctx.db.insert("auditLogs", {
            userId: admin._id,
            action: "UPLOAD_DOCUMENT_AGENT",
            module: "RH",
            details: `Document [${args.nom}] ajouté au dossier de l'agent ${args.agentId}.`,
            ipAddress: "System",
            userAgent: "AGASA-Core API",
            timestamp: Date.now(),
            entiteType: "agents",
            entiteId: args.agentId,
        });

        return true;
    }
});

export const deleteDocument = mutation({
    args: {
        adminId: v.id("users"),
        agentId: v.id("agents"),
        storageId: v.id("_storage"),
    },
    handler: async (ctx, args) => {
        const admin = await checkRHAccess(ctx, args.adminId, true);
        const agent = await ctx.db.get(args.agentId);
        if (!agent) throw new Error("Agent introuvable");

        await ctx.storage.delete(args.storageId);

        const existingDocs = agent.documents || [];
        await ctx.db.patch(args.agentId, {
            documents: existingDocs.filter(d => d.id !== args.storageId)
        });

        // Audit Log
        await ctx.db.insert("auditLogs", {
            userId: admin._id,
            action: "SUPPRESSION_DOCUMENT_AGENT",
            module: "RH",
            details: `Document supprimé du dossier de l'agent ${args.agentId}.`,
            ipAddress: "System",
            userAgent: "AGASA-Core API",
            timestamp: Date.now(),
            entiteType: "agents",
            entiteId: args.agentId,
        });

        return true;
    }
});
