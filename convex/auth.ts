import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Sync Firebase User with Convex
export const syncUser = mutation({
    args: {
        firebaseUid: v.string(),
        email: v.string(),
        nom: v.string(),
        prenom: v.string(),
        // Used for demo simulated roles
        demoSimulatedRole: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Note: In a real prod environment, we would verify the JWT here too.
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
            .first();

        if (existingUser) {
            if (args.demoSimulatedRole) {
                await ctx.db.patch(existingUser._id, {
                    demoSimulatedRole: args.demoSimulatedRole,
                    derniereConnexion: Date.now(),
                });
            } else {
                await ctx.db.patch(existingUser._id, {
                    derniereConnexion: Date.now(),
                });
            }
            return existingUser;
        }

        // Default to 'agent' for new accounts, but this should be controlled by admin
        const newUserId = await ctx.db.insert("users", {
            firebaseUid: args.firebaseUid,
            email: args.email,
            nom: args.nom,
            prenom: args.prenom,
            role: "agent",
            province: "Siège",
            statut: "actif",
            tentativesConnexion: 0,
            derniereConnexion: Date.now(),
            matricule: `AGASA-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
            dateCreation: Date.now(),
            dateModification: Date.now(),
            is2FAActif: false,
            demoSimulatedRole: args.demoSimulatedRole,
        });

        return await ctx.db.get(newUserId);
    },
});

// Get current user details from DB
export const getUser = query({
    args: { firebaseUid: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_firebaseUid", (q) => q.eq("firebaseUid", args.firebaseUid))
            .first();
    },
});

// Log login action
export const logLogin = mutation({
    args: {
        userId: v.id("users"),
        ipAddress: v.string(),
        userAgent: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("auditLogs", {
            userId: args.userId,
            action: "connexion",
            module: "auth",
            details: "Connexion réussie",
            ipAddress: args.ipAddress,
            userAgent: args.userAgent,
            timestamp: Date.now(),
        });
    },
});

export const lockAccount = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (user) {
            const newAttempts = user.tentativesConnexion + 1;
            const patch: any = { tentativesConnexion: newAttempts };

            if (newAttempts >= 5) {
                patch.statut = "verrouille";
                // Log the lockout
                await ctx.db.insert("auditLogs", {
                    userId: user._id,
                    action: "verrouillage_compte",
                    module: "auth",
                    details: "Verrouillé après 5 tentatives échouées",
                    ipAddress: "unknown",
                    userAgent: "unknown",
                    timestamp: Date.now(),
                });
            }

            await ctx.db.patch(user._id, patch);
        }
    },
});

export const resetLoginAttempts = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (user && user.statut !== "verrouille") {
            await ctx.db.patch(user._id, { tentativesConnexion: 0 });
        }
    },
});
