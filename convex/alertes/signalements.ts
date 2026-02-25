import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

export const listerSignalements = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("Non autorisé");

        let req = ctx.db.query("signalementsCitoyens").order("desc");

        if (!["admin_systeme", "directeur_general"].includes(user.role)) {
            req = req.filter(q => q.eq(q.field("provinceAssignee"), user.province));
        }

        return await req.collect();
    },
});

export const getSignalement = query({
    args: { id: v.id("signalementsCitoyens"), userId: v.id("users") },
    handler: async (ctx, args) => {
        const sign = await ctx.db.get(args.id);
        if (!sign) throw new Error("Signalement introuvable");
        return sign;
    },
});

// Le citoyen soumet via l'app publique (AGASA-Citoyens) - Simulation webhook
export const recevoirSignalementPublic = mutation({
    args: {
        description: v.string(),
        photos: v.array(v.string()),
        gpsLatitude: v.optional(v.number()),
        gpsLongitude: v.optional(v.number()),
        adresse: v.string(),
        categorie: v.union(v.literal("produit_suspect"), v.literal("hygiene"), v.literal("intoxication"), v.literal("etablissement"), v.literal("autre")),
        anonyme: v.boolean(),
        signaleurRef: v.optional(v.string()),
        provinceForcee: v.string()
    },
    handler: async (ctx, args) => {
        // Détection Doublons (simplifiée) : même catégorie, même province dans les 48h
        const ilYADeuxJours = Date.now() - (48 * 60 * 60 * 1000);
        const similaires = await ctx.db.query("signalementsCitoyens")
            .filter(q => q.eq(q.field("categorie"), args.categorie))
            .filter(q => q.eq(q.field("provinceAssignee"), args.provinceForcee))
            .filter(q => q.gte(q.field("dateReception"), ilYADeuxJours))
            .collect();

        const isDoublon = similaires.length > 0;

        const id = await ctx.db.insert("signalementsCitoyens", {
            reference: `SIG-CIT-${Date.now().toString().slice(-6)}`,
            description: args.description,
            photos: args.photos,
            gpsLatitude: args.gpsLatitude,
            gpsLongitude: args.gpsLongitude,
            adresse: args.adresse,
            categorie: args.categorie,
            anonyme: args.anonyme,
            signaleurRef: args.signaleurRef,
            statut: "recu",
            provinceAssignee: args.provinceForcee,
            dateReception: Date.now(),
        });

        return { id, isDoublon, doublonsPotentiels: similaires.length };
    }
});

export const statuerSignalement = mutation({
    args: {
        id: v.id("signalementsCitoyens"),
        nouveauStatut: v.union(v.literal("en_verification"), v.literal("confirme"), v.literal("infonde"), v.literal("traite")),
        userId: v.id("users"),
        creerAlerte: v.boolean()
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("Non autorisé");

        const sign = await ctx.db.get(args.id);
        if (!sign) throw new Error("Introuvable");

        await ctx.db.patch(args.id, {
            statut: args.nouveauStatut,
            dateTraitement: Date.now()
        });

        // Escalade du signalement citoyen en Alerte Nationale Sanitaire
        if (args.creerAlerte && args.nouveauStatut === "confirme") {
            await ctx.db.insert("alertes", {
                titre: `Émanation du Signalement Citoyen ${sign.reference}`,
                description: sign.description,
                type: "biologique", // Par défaut, qualifiable ultérieurement
                source: "signalement_citoyen",
                sourceRef: sign.reference,
                zoneGeographique: sign.provinceAssignee,
                niveau: "vigilance",
                statut: "nouvelle",
                assigneeA: "Non assigné",
                dateCreation: Date.now(),
                actions: [{
                    date: Date.now(),
                    action: `Alerte déclenchée suite à la confirmation du signalement ${sign.reference}`,
                    responsable: `${user.prenom} ${user.nom}`
                }]
            });
        }

        return args.id;
    }
});
