import { v } from "convex/values";
import { query } from "../_generated/server";

export const getMyNotifications = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const limit = 50; // On garde les 50 dernières actives pour la fluidité
        return await ctx.db
            .query("notifications")
            .withIndex("by_destinataireId", (q) => q.eq("destinataireId", args.userId))
            .order("desc")
            .take(limit);
    }
});

export const getUnreadCount = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const unreadNotifs = await ctx.db
            .query("notifications")
            .withIndex("by_destinataireId_lue", (q) =>
                q.eq("destinataireId", args.userId).eq("lue", false)
            )
            .collect();
        return unreadNotifs.length;
    }
});
