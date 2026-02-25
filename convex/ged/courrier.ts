import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// Helper to check GED access rights
const checkGEDAccess = async (ctx: any, userId: any) => {
    if (!userId) throw new Error("Non autorisé : authentification requise.");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Utilisateur introuvable.");
    return user;
};

// 1. Lister les courriers (Entrant et Sortant)
export const listCourriers = query({
    args: {
        userId: v.id("users"),
        type: v.union(v.literal("entrant"), v.literal("sortant")),
        statut: v.optional(v.string()),
        priorite: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await checkGEDAccess(ctx, args.userId);

        const isAdmin = ["admin_systeme", "directeur_general", "directeur"].includes(user.role) || user.demoSimulatedRole === "admin_systeme";

        let courriers = await ctx.db.query("courriers")
            .filter(q => q.eq(q.field("type"), args.type))
            .order("desc")
            .collect();

        // Enregistrer les filtres supplémentaires si fournis
        if (args.statut && args.statut !== "tous") {
            courriers = courriers.filter(c => c.statut === args.statut);
        }
        if (args.priorite && args.priorite !== "toutes") {
            courriers = courriers.filter(c => c.priorite === args.priorite);
        }

        // Si pas admin, limiter la vue
        if (!isAdmin) {
            // Un utilisateur normal voit les courriers qu'il a créés OU ceux pour lesquels il est dans la liste de diffusion
            const diffusions = await ctx.db.query("diffusionsCourrier")
                .withIndex("by_destinataireId", q => q.eq("destinataireId", user._id))
                .collect();

            const courriersDiffusesIds = new Set(diffusions.map(d => d.courrierId));
            courriers = courriers.filter(c => c.creePar === user._id || courriersDiffusesIds.has(c._id));
        }

        // Enrichir avec URLs de document
        return await Promise.all(courriers.map(async (c) => {
            const url = await ctx.storage.getUrl(c.documentId);
            return { ...c, documentUrl: url };
        }));
    }
});

// 2. Obtenir un courrier spécifique avec son historique de diffusion
export const getCourrier = query({
    args: {
        userId: v.id("users"),
        courrierId: v.id("courriers"),
    },
    handler: async (ctx, args) => {
        const user = await checkGEDAccess(ctx, args.userId);
        const courrier = await ctx.db.get(args.courrierId);

        if (!courrier) throw new Error("Courrier introuvable");

        const documentUrl = await ctx.storage.getUrl(courrier.documentId);
        const createur = await ctx.db.get(courrier.creePar);

        // Fetch diffusions
        const diffusionsRaw = await ctx.db.query("diffusionsCourrier")
            .withIndex("by_courrierId", q => q.eq("courrierId", courrier._id))
            .collect();

        const diffusions = await Promise.all(diffusionsRaw.map(async d => {
            const destinataire = await ctx.db.get(d.destinataireId);
            return { ...d, destinataire };
        }));

        // Marquer comme lu si c'est le destinataire
        const maDiffusion = diffusionsRaw.find(d => d.destinataireId === user._id);
        if (maDiffusion && !maDiffusion.lu) {
            // Un query Convex (mutation readonly) request side-effect : on laisse la mutation updateLecture faire ca plutot
            // Mais pour une question d'affichage immédiat, on pourrait pre-calc
        }

        return {
            ...courrier,
            documentUrl,
            createur,
            diffusions
        };
    }
});

// 2.5 Generate Upload URL
export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});

// 3. Enregistrer un nouveau courrier entrant/sortant
export const creerCourrier = mutation({
    args: {
        userId: v.id("users"),
        reference: v.string(),
        type: v.union(v.literal("entrant"), v.literal("sortant")),
        categorie: v.union(v.literal("courrier_officiel"), v.literal("demande"), v.literal("plainte"), v.literal("notification"), v.literal("autre")),
        emetteur: v.string(),
        destinataire: v.string(),
        objet: v.string(),
        priorite: v.union(v.literal("urgent"), v.literal("important"), v.literal("normal")),
        dateDocument: v.number(),
        confidentiel: v.boolean(),
        tags: v.array(v.string()),
        documentId: v.id("_storage"),
        destinatairesIds: v.array(v.id("users")), // Pour alimenter le circuit de diffusion
    },
    handler: async (ctx, args) => {
        const user = await checkGEDAccess(ctx, args.userId);

        const courrierId = await ctx.db.insert("courriers", {
            reference: args.reference || `CR-${Date.now()}`,
            type: args.type,
            categorie: args.categorie,
            emetteur: args.emetteur,
            destinataire: args.destinataire,
            objet: args.objet,
            priorite: args.priorite,
            statut: "recu",
            dateDocument: args.dateDocument,
            dateReception: Date.now(),
            confidentiel: args.confidentiel,
            tags: args.tags,
            documentId: args.documentId,
            creePar: user._id,
        });

        // 2. Créer les circuits de diffusion
        if (args.destinatairesIds && args.destinatairesIds.length > 0) {
            for (const destId of args.destinatairesIds) {
                await ctx.db.insert("diffusionsCourrier", {
                    courrierId,
                    destinataireId: destId,
                    lu: false,
                });
            }
        }

        // 3. Audit
        await ctx.db.insert("auditLogs", {
            userId: user._id,
            action: "ENREGISTREMENT_COURRIER",
            module: "GED",
            details: `Enregistrement du courrier ${args.type} - Objet: ${args.objet}`,
            ipAddress: "System",
            userAgent: "API",
            timestamp: Date.now(),
            entiteType: "courriers",
            entiteId: courrierId,
        });

        return courrierId;
    }
});

// 4. Marquer le courrier comme lu par le destinataire (Accusé de lecture)
export const marquerCommeLu = mutation({
    args: {
        userId: v.id("users"),
        courrierId: v.id("courriers"),
    },
    handler: async (ctx, args) => {
        const diffusion = await ctx.db.query("diffusionsCourrier")
            .withIndex("by_courrierId", q => q.eq("courrierId", args.courrierId))
            .filter(q => q.eq(q.field("destinataireId"), args.userId))
            .first();

        if (diffusion && !diffusion.lu) {
            await ctx.db.patch(diffusion._id, {
                lu: true,
                dateLecture: Date.now()
            });
            return true;
        }
        return false;
    }
});

// 5. Mettre à jour le statut du courrier (Ex: "En traitement", "Traité", "Archivé")
export const updateStatut = mutation({
    args: {
        userId: v.id("users"),
        courrierId: v.id("courriers"),
        statut: v.union(v.literal("recu"), v.literal("en_traitement"), v.literal("traite"), v.literal("archive")),
    },
    handler: async (ctx, args) => {
        await checkGEDAccess(ctx, args.userId);

        await ctx.db.patch(args.courrierId, {
            statut: args.statut
        });

        await ctx.db.insert("auditLogs", {
            userId: args.userId,
            action: "UPDATE_STATUS_COURRIER",
            module: "GED",
            details: `Le courrier ${args.courrierId} passe au statut ${args.statut}.`,
            ipAddress: "System",
            userAgent: "API",
            timestamp: Date.now(),
        });

        return true;
    }
});
