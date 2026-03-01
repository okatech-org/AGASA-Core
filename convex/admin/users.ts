// AGASA-Core — Admin Users Management
import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

const IS_DEMO_MODE =
    process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "true" ||
    process.env.ENABLE_DEMO_MODE === "true";

// Helper to check admin role
const checkAdmin = async (ctx: any, userId: any) => {
    const user = await ctx.db.get(userId);
    const isRealAdmin = user?.role === "admin_systeme";
    const isDemoAdmin = IS_DEMO_MODE && user?.demoSimulatedRole === "admin_systeme";
    if (!user || (!isRealAdmin && !isDemoAdmin)) {
        throw new Error("Accès refusé : privilèges administrateur requis.");
    }
    return user;
};

// 1. Lister tous les utilisateurs
export const list = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.userId);
        return await ctx.db.query("users").order("desc").collect();
    }
});

// 2. Basculer le statut (Actif / Verrouillé / Inactif)
export const toggleStatus = mutation({
    args: {
        adminId: v.id("users"),
        userId: v.id("users"),
        nouveauStatut: v.union(v.literal("actif"), v.literal("inactif"), v.literal("verrouille"))
    },
    handler: async (ctx, args) => {
        const admin = await checkAdmin(ctx, args.adminId);

        // Prevent self-lockout
        if (args.userId === admin._id) {
            throw new Error("Vous ne pouvez pas modifier votre propre statut.");
        }

        const targetUser = await ctx.db.get(args.userId);
        if (!targetUser) throw new Error("Utilisateur introuvable.");

        // En mode démonstration, interdire la modification d'autres admins ou comptes de base
        if (admin.role === "demo" && targetUser.email.includes("demo-")) {
            // Just return simulated success
            return "Action simulée en mode démonstration.";
        }

        await ctx.db.patch(args.userId, {
            statut: args.nouveauStatut,
            dateModification: Date.now()
        });

        // Log the action
        await ctx.db.insert("auditLogs", {
            userId: admin._id,
            action: "MODIFICATION_STATUT_UTILISATEUR",
            module: "Admin",
            details: `Statut de ${targetUser.email} changé à ${args.nouveauStatut}`,
            ipAddress: "System",
            userAgent: "AGASA-Core Admin API",
            timestamp: Date.now(),
            entiteType: "users",
            entiteId: args.userId
        });

        return `Statut mis à jour avec succès.`;
    }
});
