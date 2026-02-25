import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const markAsRead = mutation({
    args: { notifId: v.id("notifications") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.notifId, { lue: true });
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
    }
});

export const deleteNotification = mutation({
    args: { notifId: v.id("notifications") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.notifId);
    }
});
