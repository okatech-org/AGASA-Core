import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { CATEGORIES_ACTION, CORTEX, SIGNAL_TYPES, genererCorrelationId } from "../lib/neocortex";

export const markAsRead = mutation({
    args: { notifId: v.id("notifications") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.notifId, { lue: true });

        const now = Date.now();
        await ctx.db.insert("signaux", {
            type: SIGNAL_TYPES.NOTIFICATION_LUE,
            source: CORTEX.AUDITIF,
            destination: CORTEX.HIPPOCAMPE,
            entiteType: "notifications",
            entiteId: String(args.notifId),
            payload: { lue: true },
            confiance: 1,
            priorite: "LOW",
            correlationId: genererCorrelationId(),
            traite: false,
            timestamp: now,
        });

        await ctx.db.insert("historiqueActions", {
            action: "NOTIFICATION_LUE",
            categorie: CATEGORIES_ACTION.UTILISATEUR,
            entiteType: "notifications",
            entiteId: String(args.notifId),
            details: { lue: true },
            metadata: { source: CORTEX.AUDITIF },
            timestamp: now,
        });
    }
});

export const markAllAsRead = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const unreadNotifs = await ctx.db
            .query("notifications")
            .withIndex("by_destinataireId_lue", (q) =>
                q.eq("destinataireId", args.userId).eq("lue", false)
            )
            .collect();

        // Patch itérations (Convex scale auto)
        for (const notif of unreadNotifs) {
            await ctx.db.patch(notif._id, { lue: true });
        }

        const now = Date.now();
        await ctx.db.insert("signaux", {
            type: SIGNAL_TYPES.NOTIFICATION_LUE,
            source: CORTEX.AUDITIF,
            destination: CORTEX.HIPPOCAMPE,
            entiteType: "notifications",
            entiteId: String(args.userId),
            payload: { count: unreadNotifs.length, mode: "bulk" },
            confiance: 1,
            priorite: "LOW",
            correlationId: genererCorrelationId(),
            traite: false,
            timestamp: now,
        });

        await ctx.db.insert("historiqueActions", {
            action: "NOTIFICATIONS_TOUTES_LUES",
            categorie: CATEGORIES_ACTION.UTILISATEUR,
            entiteType: "notifications",
            entiteId: String(args.userId),
            details: { count: unreadNotifs.length },
            metadata: { source: CORTEX.AUDITIF },
            timestamp: now,
        });
    }
});

export const deleteNotification = mutation({
    args: { notifId: v.id("notifications") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.notifId);

        const now = Date.now();
        await ctx.db.insert("signaux", {
            type: SIGNAL_TYPES.FLUX_TRAITE,
            source: CORTEX.AUDITIF,
            destination: CORTEX.HIPPOCAMPE,
            entiteType: "notifications",
            entiteId: String(args.notifId),
            payload: { action: "delete" },
            confiance: 1,
            priorite: "LOW",
            correlationId: genererCorrelationId(),
            traite: false,
            timestamp: now,
        });

        await ctx.db.insert("historiqueActions", {
            action: "NOTIFICATION_SUPPRIMEE",
            categorie: CATEGORIES_ACTION.UTILISATEUR,
            entiteType: "notifications",
            entiteId: String(args.notifId),
            details: { action: "delete" },
            metadata: { source: CORTEX.AUDITIF },
            timestamp: now,
        });
    }
});
