import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

const checkGEDAccess = async (ctx: any, userId: any) => {
    if (!userId) throw new Error("Non autorisé : authentification requise.");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Utilisateur introuvable.");
    return user;
};

// 1. Lister les dossiers virtuels (pour construire l'arborescence)
// Dans une approche simple, on va extraire les dossiers uniques de tous les documents archivés
export const listerDossiers = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await checkGEDAccess(ctx, args.userId);

        const archives = await ctx.db.query("archives").collect();
        const dossiersSet = new Set<string>();

        archives.forEach(a => dossiersSet.add(a.dossier));

        // Ajouter quelques dossiers par défaut si vide
        if (dossiersSet.size === 0) {
            dossiersSet.add("Arsenal Réglementaire/Décrets");
            dossiersSet.add("Arsenal Réglementaire/Arrêtés");
            dossiersSet.add("Ressources Humaines/Contrats");
            dossiersSet.add("Finances/Marchés Publics");
        }

        return Array.from(dossiersSet).sort();
    }
});

// 2. Lister le contenu d'un dossier
export const explorerDossier = query({
    args: {
        userId: v.id("users"),
        dossierPath: v.string(), // ex: "Arsenal Réglementaire/Décrets"
        recherche: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        await checkGEDAccess(ctx, args.userId);

        let archives;

        // Si on n'est pas à la racine (dossierPath=""), on filtre
        if (args.dossierPath !== "") {
            archives = await ctx.db.query("archives")
                .withIndex("by_dossier", q => q.eq("dossier", args.dossierPath))
                .order("desc")
                .collect();
        } else {
            archives = await ctx.db.query("archives")
                .order("desc")
                .collect();
        }

        // Filtre client-side pour la recherche par titre ou tags
        if (args.recherche && args.recherche.trim() !== "") {
            const searchLower = args.recherche.toLowerCase();
            archives = archives.filter(a =>
                a.titre.toLowerCase().includes(searchLower) ||
                a.tags.some(t => t.toLowerCase().includes(searchLower))
            );
        }

        return await Promise.all(archives.map(async (a) => {
            const url = await ctx.storage.getUrl(a.documentId);
            const archiveur = await ctx.db.get(a.archivePar);
            return {
                ...a,
                documentUrl: url,
                archiveur
            };
        }));
    }
});

// 3. Archiver un nouveau document (manuel)
export const archiverDocument = mutation({
    args: {
        userId: v.id("users"),
        titre: v.string(),
        dossier: v.string(),
        type: v.string(),
        annee: v.number(),
        tags: v.array(v.string()),
        documentId: v.id("_storage"),
        donneesRetentionAnnee: v.optional(v.number()), // ex: 10 ans
    },
    handler: async (ctx, args) => {
        const user = await checkGEDAccess(ctx, args.userId);

        let dateDestruction = undefined;
        if (args.donneesRetentionAnnee) {
            const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
            dateDestruction = Date.now() + (args.donneesRetentionAnnee * msPerYear);
        }

        const archiveId = await ctx.db.insert("archives", {
            titre: args.titre,
            dossier: args.dossier,
            type: args.type,
            annee: args.annee,
            tags: args.tags,
            documentId: args.documentId,
            dateArchivage: Date.now(),
            archivePar: user._id,
            dateDestructionPrevue: dateDestruction,
        });

        // Audit Log
        await ctx.db.insert("auditLogs", {
            userId: user._id,
            action: "ARCHIVAGE_DOCUMENT",
            module: "GED",
            details: `Archivage document '${args.titre}' dans le dossier [${args.dossier}].`,
            ipAddress: "System",
            userAgent: "API",
            timestamp: Date.now(),
            entiteType: "archives",
            entiteId: archiveId,
        });

        return archiveId;
    }
});
