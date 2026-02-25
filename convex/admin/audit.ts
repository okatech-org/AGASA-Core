// AGASA-Core — Admin Audit Logs
import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

// Helper to check admin role
const checkAdmin = async (ctx: any, userId: any) => {
    const user = await ctx.db.get(userId);
    if (!user || (user.role !== "admin_systeme" && user.demoSimulatedRole !== "admin_systeme")) {
        throw new Error("Accès refusé : privilèges administrateur requis.");
    }
    return user;
};

// 1. Lire les logs d'audit avec filtres
export const listLogs = query({
    args: {
        adminId: v.id("users"),
        limit: v.number(),
        cursor: v.optional(v.string()) // For pagination
    },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.adminId);

        const logs = await ctx.db
            .query("auditLogs")
            .order("desc")
            .paginate({ cursor: args.cursor || null, numItems: args.limit });

        // Populate user details for each log
        const enrichedLogs = await Promise.all(
            logs.page.map(async (log) => {
                let userDetails = { nom: "Système", prenom: "" };
                if (log.userId) {
                    const user = await ctx.db.get(log.userId);
                    if (user) userDetails = { nom: user.nom, prenom: user.prenom };
                }
                return {
                    ...log,
                    userName: `${userDetails.prenom} ${userDetails.nom}`.trim()
                };
            })
        );

        return {
            page: enrichedLogs,
            isDone: logs.isDone,
            continueCursor: logs.continueCursor
        };
    }
});

// 2. Action Interne: Log Action (Utilisé par d'autres fonctions)
export const logAction = mutation({
    args: {
        userId: v.id("users"),
        action: v.string(),
        module: v.string(),
        details: v.string(),
        ipAddress: v.optional(v.string()),
        userAgent: v.optional(v.string()),
        entiteType: v.optional(v.string()),
        entiteId: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        // Only internal functions should call this, or verified users
        await ctx.db.insert("auditLogs", {
            userId: args.userId,
            action: args.action,
            module: args.module,
            details: args.details,
            ipAddress: args.ipAddress || "0.0.0.0",
            userAgent: args.userAgent || "Unknown",
            timestamp: Date.now(),
            entiteType: args.entiteType,
            entiteId: args.entiteId
        });
    }
});
