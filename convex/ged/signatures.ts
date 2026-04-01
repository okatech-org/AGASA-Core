import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// Helper
const checkGEDAccess = async (ctx: any, userId: any) => {
    if (!userId) throw new Error("Non autorisé : authentification requise.");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Utilisateur introuvable.");
    return user;
};

// 1. Lister les documents en attente de signature pour l'utilisateur
// Pour le MVP sans workflows complexes asynchrones stricts, on va créer une méthode manuelle
// ou lister les workflows où l'utilisateur est le valideur actuel et l'action requise est "signature".
// Ici on va concevoir une table virtuelle ou utiliser les workflows.
// Mais d'après le prompt, on liste les documents en attente.
// Pour simplifier, on va lister les etapesWorkflow où le statut est "en_attente" et valideur = userId (et où le workflow est de type nécessitant signature, ex: "courrier_sortant", "decision_administrative")
export const enAttente = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await checkGEDAccess(ctx, args.userId);

        // Liste les étapes assignées à l'utilisateur
        const etapesRaw = await ctx.db.query("etapesWorkflow")
            .withIndex("by_valideurId", q => q.eq("valideurId", args.userId))
            .filter(q => q.eq(q.field("statut"), "en_attente"))
            .collect();

        // Filtrer celles qui correspondent à l'étape actuelle du workflow
        const result = [];
        for (const etape of etapesRaw) {
            const workflow = await ctx.db.get(etape.workflowId);
            if (workflow && workflow.statut === "en_cours" && workflow.etapeActuelle === etape.ordre) {
                const initiateur = await ctx.db.get(workflow.initiateurId);
                const documentUrl = await ctx.storage.getUrl(workflow.documentId);

                result.push({
                    etapeId: etape._id,
                    workflow,
                    initiateur,
                    documentUrl,
                    dateDemande: workflow.dateCreation // Simplification
                });
            }
        }

        return result.sort((a, b) => b.workflow.dateCreation - a.workflow.dateCreation);
    }
});

// 2. Signer électroniquement
export const signer = mutation({
    args: {
        userId: v.id("users"),
        etapeId: v.id("etapesWorkflow"),
        documentId: v.id("_storage"),
        pinCode: v.optional(v.string()), // Pour simuler une double authentification si besoin
    },
    handler: async (ctx, args) => {
        const user = await checkGEDAccess(ctx, args.userId);

        const etape = await ctx.db.get(args.etapeId);
        if (!etape || etape.statut !== "en_attente" || etape.valideurId !== user._id) {
            throw new Error("Action invalide ou étape introuvable.");
        }

        const workflow = await ctx.db.get(etape.workflowId);
        if (!workflow) throw new Error("Workflow introuvable.");

        // 1. Enregistrer la signature horodatée (Certification de l'identité)
        const traceHash = `SIGN-${Date.now()}-${user._id}-${workflow._id}`;

        await ctx.db.insert("signatures", {
            documentId: args.documentId,
            signataireId: user._id,
            dateSignature: Date.now(),
            empreinteDigitale: traceHash,
            ipAddress: "System/Portal",
        });

        // 2. Mettre à jour l'étape
        await ctx.db.patch(args.etapeId, {
            statut: "approuve",
            dateDecision: Date.now(),
            commentaire: "Signé électroniquement",
        });

        // 3. Avancer le workflow
        // Vérifier s'il y a une étape suivante
        const etapesSuivantes = await ctx.db.query("etapesWorkflow")
            .withIndex("by_workflowId", q => q.eq("workflowId", workflow._id))
            .filter(q => q.gt(q.field("ordre"), workflow.etapeActuelle))
            .collect();

        if (etapesSuivantes.length > 0) {
            // Passe à l'étape suivante
            await ctx.db.patch(workflow._id, {
                etapeActuelle: workflow.etapeActuelle + 1
            });
        } else {
            // Workflow terminé
            await ctx.db.patch(workflow._id, {
                statut: "approuve"
            });
        }

        // 4. Audit
        await ctx.db.insert("auditLogs", {
            userId: user._id,
            action: "SIGNATURE_ELECTRONIQUE",
            module: "GED",
            details: `Signature électronique apposée sur le document du workflow ${workflow.reference} (Trace: ${traceHash})`,
            ipAddress: "System/Portal",
            userAgent: "AGASA-Admin Signature Module",
            timestamp: Date.now(),
            entiteType: "workflows",
            entiteId: workflow._id,
        });

        return { success: true, trace: traceHash };
    }
});

// 3. Refuser de signer
export const refuser = mutation({
    args: {
        userId: v.id("users"),
        etapeId: v.id("etapesWorkflow"),
        commentaire: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await checkGEDAccess(ctx, args.userId);

        const etape = await ctx.db.get(args.etapeId);
        if (!etape || etape.statut !== "en_attente" || etape.valideurId !== user._id) {
            throw new Error("Action invalide.");
        }

        const workflow = await ctx.db.get(etape.workflowId);
        if (!workflow) throw new Error("Workflow introuvable.");

        // Mettre à jour l'étape
        await ctx.db.patch(args.etapeId, {
            statut: "rejete",
            dateDecision: Date.now(),
            commentaire: args.commentaire,
        });

        // Mettre à jour le workflow global (Arrêt immédiat lors d'un rejet)
        await ctx.db.patch(workflow._id, {
            statut: "rejete"
        });

        // Audit
        await ctx.db.insert("auditLogs", {
            userId: user._id,
            action: "REJET_SIGNATURE",
            module: "GED",
            details: `Refus de signer le document ${workflow.reference}. Motif: ${args.commentaire}`,
            ipAddress: "System/Portal",
            userAgent: "API",
            timestamp: Date.now(),
            entiteType: "workflows",
            entiteId: workflow._id,
        });

        return true;
    }
});
