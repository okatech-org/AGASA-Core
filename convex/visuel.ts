import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const genererUrlUpload = mutation({
  args: {},
  handler: async (ctx) => {
    const uploadUrl = await ctx.storage.generateUploadUrl();
    return { uploadUrl };
  },
});

export const enregistrerMedia = mutation({
  args: {
    storageId: v.id("_storage"),
    entiteType: v.string(),
    entiteId: v.string(),
    typeMedia: v.string(),
    legende: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    const now = Date.now();

    await ctx.db.insert("historiqueActions", {
      action: "MEDIA_ENREGISTRE",
      categorie: "UTILISATEUR",
      entiteType: args.entiteType,
      entiteId: args.entiteId,
      userId: args.userId,
      details: {
        storageId: args.storageId,
        typeMedia: args.typeMedia,
        legende: args.legende,
        url,
      },
      metadata: { source: "VISUEL" },
      timestamp: now,
    });

    await ctx.db.insert("signaux", {
      type: "FLUX_TRAITE",
      source: "VISUEL",
      destination: "HIPPOCAMPE",
      entiteType: args.entiteType,
      entiteId: args.entiteId,
      payload: {
        storageId: args.storageId,
        typeMedia: args.typeMedia,
      },
      confiance: 0.95,
      priorite: "NORMAL",
      correlationId: `media_${now}_${args.entiteId}`,
      traite: false,
      timestamp: now,
    });

    return { success: true, url };
  },
});

export const obtenirUrlMedia = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    return { url };
  },
});
