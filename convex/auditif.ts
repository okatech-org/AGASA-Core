import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const creerNotification = mutation({
  args: {
    destinataireId: v.id("users"),
    titre: v.string(),
    message: v.string(),
    type: v.union(v.literal("info"), v.literal("alerte"), v.literal("action"), v.literal("rappel")),
    lien: v.optional(v.string()),
    priorite: v.optional(v.union(v.literal("LOW"), v.literal("NORMAL"), v.literal("HIGH"), v.literal("CRITICAL"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const notifId = await ctx.db.insert("notifications", {
      destinataireId: args.destinataireId,
      titre: args.titre,
      message: args.message,
      type: args.type,
      lien: args.lien,
      lue: false,
      dateCreation: now,
    });

    await ctx.db.insert("signaux", {
      type: "NOTIFICATION_CREEE",
      source: "AUDITIF",
      destination: "LIMBIQUE",
      entiteType: "notifications",
      entiteId: String(notifId),
      payload: {
        destinataireId: String(args.destinataireId),
        type: args.type,
      },
      confiance: 1,
      priorite: args.priorite ?? "NORMAL",
      correlationId: `notif_${now}_${String(notifId)}`,
      traite: false,
      timestamp: now,
    });

    return { notifId };
  },
});

export const marquerLue = mutation({
  args: {
    notifId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notifId, { lue: true });

    await ctx.db.insert("historiqueActions", {
      action: "NOTIFICATION_LUE",
      categorie: "UTILISATEUR",
      entiteType: "notifications",
      entiteId: String(args.notifId),
      details: { lue: true },
      metadata: { source: "AUDITIF" },
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const listerNonLues = query({
  args: {
    destinataireId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(100, args.limit ?? 25));
    return ctx.db
      .query("notifications")
      .withIndex("by_destinataireId_lue", (q) =>
        q.eq("destinataireId", args.destinataireId).eq("lue", false)
      )
      .order("desc")
      .take(limit);
  },
});
