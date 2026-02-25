import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

const checkGEDAccess = async (ctx: any, userId: any) => {
    if (!userId) throw new Error("Non autorisé : authentification requise.");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Utilisateur introuvable.");
    return user;
};

// 1. Lister les workflows
export const listerWorkflows = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await checkGEDAccess(ctx, args.userId);

        const isAdmin = ["admin_systeme", "directeur_general", "directeur"].includes(user.role) || user.demoSimulatedRole === "admin_systeme";

        // Liste générale
        let allWorkflows = await ctx.db.query("workflows").order("desc").collect();

        if (!isAdmin) {
            // Filtrer: Soit l'utilisateur est initiateur, soit il est impliqué comme valideur dans une des étapes
            const mesEtapes = await ctx.db.query("etapesWorkflow")
                .withIndex("by_valideurId", q => q.eq("valideurId", user._id))
                .collect();

            const wfIdsImbriques = new Set(mesEtapes.map(e => e.workflowId));

            allWorkflows = allWorkflows.filter(w => w.initiateurId === user._id || wfIdsImbriques.has(w._id));
        }

        return await Promise.all(allWorkflows.map(async (wf) => {
            const initiateur = await ctx.db.get(wf.initiateurId);
            const documentUrl = await ctx.storage.getUrl(wf.documentId);

            // Récupérer le valideur actuel si en cours
            let valideurActuel = null;
            if (wf.statut === "en_cours") {
                const etapes = await ctx.db.query("etapesWorkflow")
                    .withIndex("by_workflowId", q => q.eq("workflowId", wf._id))
                    .filter(q => q.eq(q.field("ordre"), wf.etapeActuelle))
                    .collect();

                if (etapes.length > 0) {
                    valideurActuel = await ctx.db.get(etapes[0].valideurId);
                }
            }

            return {
                ...wf,
                initiateur,
                valideurActuel,
                documentUrl
            };
        }));
    }
});

// 2. Initialiser un Workflow
export const initialiserWorkflow = mutation({
    args: {
        userId: v.id("users"),
        titreDocument: v.string(),
        type: v.union(v.literal("marche_public"), v.literal("decision_administrative"), v.literal("note_service"), v.literal("courrier_sortant")),
        documentId: v.id("_storage"),
        montant: v.optional(v.number()),
        valideursIds: v.array(v.id("users")), // IDs dans l'ordre de validation
    },
    handler: async (ctx, args) => {
        const user = await checkGEDAccess(ctx, args.userId);

        if (args.valideursIds.length === 0) {
            throw new Error("Un workflow nécessite au moins un valideur.");
        }

        const dateCreation = Date.now();
        const reference = `WF-${args.type.toUpperCase()}-${dateCreation}`;

        // 1. Créer le workflow global
        const workflowId = await ctx.db.insert("workflows", {
            reference,
            type: args.type,
            titreDocument: args.titreDocument,
            initiateurId: user._id,
            documentId: args.documentId,
            montant: args.montant,
            statut: "en_cours",
            etapeActuelle: 1, // L'étape 1 est la première
            dateCreation,
        });

        // 2. Générer les étapes successives
        for (let i = 0; i < args.valideursIds.length; i++) {
            await ctx.db.insert("etapesWorkflow", {
                workflowId,
                valideurId: args.valideursIds[i],
                ordre: i + 1,
                statut: "en_attente",
            });
        }

        // 3. Log Audit
        await ctx.db.insert("auditLogs", {
            userId: user._id,
            action: "CREATION_WORKFLOW",
            module: "GED",
            details: `Initialisation du circuit ${reference} avec ${args.valideursIds.length} étape(s).`,
            ipAddress: "System",
            userAgent: "API",
            timestamp: Date.now(),
            entiteType: "workflows",
            entiteId: workflowId,
        });

        return workflowId;
    }
});

// 3. Récupérer les détails d'un workflow (avec ses étapes)
export const getWorkflowDetails = query({
    args: {
        userId: v.id("users"),
        workflowId: v.id("workflows"),
    },
    handler: async (ctx, args) => {
        await checkGEDAccess(ctx, args.userId);

        const workflow = await ctx.db.get(args.workflowId);
        if (!workflow) throw new Error("Workflow introuvable.");

        const initiateur = await ctx.db.get(workflow.initiateurId);
        const documentUrl = await ctx.storage.getUrl(workflow.documentId);

        // Fetch étapes
        const etapesRaw = await ctx.db.query("etapesWorkflow")
            .withIndex("by_workflowId", q => q.eq("workflowId", workflow._id))
            .collect();

        // Sort by ordre
        etapesRaw.sort((a, b) => a.ordre - b.ordre);

        const etapes = await Promise.all(etapesRaw.map(async (e) => {
            const valideur = await ctx.db.get(e.valideurId);
            return { ...e, valideur };
        }));

        return {
            ...workflow,
            initiateur,
            documentUrl,
            etapes
        };
    }
});
