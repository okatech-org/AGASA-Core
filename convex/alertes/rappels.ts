import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

export const listerRappels = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("Non autorisé");

        return await ctx.db.query("rappelsProduits").order("desc").collect();
    },
});

export const creerRappel = mutation({
    args: {
        alerteId: v.optional(v.id("alertes")),
        produit: v.string(),
        marque: v.string(),
        lot: v.string(),
        motif: v.string(),
        actionRecommandee: v.string(),
        pointsVenteConcernes: v.array(v.string()),
        cannauxDiffusion: v.object({
            sms: v.boolean(),
            push: v.boolean(),
            portail: v.boolean(),
            reseauxSociaux: v.boolean()
        }),
        userId: v.id("users")
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("Non autorisé");

        const id = await ctx.db.insert("rappelsProduits", {
            alerteId: args.alerteId,
            produit: args.produit,
            marque: args.marque,
            lot: args.lot,
            motif: args.motif,
            actionRecommandee: args.actionRecommandee,
            pointsVenteConcernes: args.pointsVenteConcernes,
            cannauxDiffusion: args.cannauxDiffusion,
            statut: "en_preparation",
            dateCreation: Date.now()
        });

        return id;
    }
});

export const diffuserRappel = mutation({
    args: {
        id: v.id("rappelsProduits"),
        userId: v.id("users")
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("Non autorisé");

        const rappel = await ctx.db.get(args.id);
        if (!rappel) throw new Error("Introuvable");

        await ctx.db.patch(args.id, {
            statut: "diffuse",
            dateDiffusion: Date.now()
        });

        // Enregistrer la diffusion dans l'audit (qui historise l'action multicanal)
        await ctx.db.insert("auditLogs", {
            userId: args.userId,
            action: "DIFFUSION_RAPPEL",
            module: "ALERTES",
            details: `Lot ${rappel.lot} diffusé. Canaux: ${JSON.stringify(rappel.cannauxDiffusion)}`,
            ipAddress: "127.0.0.1",
            userAgent: "Sys",
            timestamp: Date.now()
        });

        return args.id;
    }
});
