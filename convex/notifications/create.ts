import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const createNotification = mutation({
    args: {
        destinataireId: v.id("users"),
        titre: v.string(),
        message: v.string(),
        type: v.union(v.literal("info"), v.literal("alerte"), v.literal("action"), v.literal("rappel")),
        lien: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const notifId = await ctx.db.insert("notifications", {
            destinataireId: args.destinataireId,
            titre: args.titre,
            message: args.message,
            type: args.type,
            lien: args.lien,
            lue: false,
            dateCreation: Date.now(),
        });
        return notifId;
    }
});
