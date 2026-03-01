// AGASA-Core — System Configuration
import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

const IS_DEMO_MODE =
    process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "true" ||
    process.env.ENABLE_DEMO_MODE === "true";

const checkAdmin = async (ctx: any, userId: any) => {
    const user = await ctx.db.get(userId);
    const isRealAdmin = user?.role === "admin_systeme";
    const isDemoAdmin = IS_DEMO_MODE && user?.demoSimulatedRole === "admin_systeme";
    if (!user || (!isRealAdmin && !isDemoAdmin)) {
        throw new Error("Accès refusé : privilèges administrateur requis.");
    }
    return user;
};

// Simulate starting static config since we might not have seeded configSysteme yet
const DEFAULT_CONFIG = {
    securite: {
        dureeSessionMinutes: 30,
        maxTentativesConnexion: 5,
        longueurMinMotDePasse: 8,
        exiger2FA: false
    },
    notifications: {
        activerEmail: true,
        emailAdmin: "admin@agasa.ga",
        frequenceRappelsJours: 7
    },
    recouvrement: {
        delaiRelanceJ15: 15,
        delaiRelanceJ30: 30,
        delaiTresorPublic: 30
    },
    systeme: {
        nomApplication: "AGASA-Core",
        version: "1.0.0",
        modeMaintenance: false
    }
};

export const getSystemConfig = query({
    args: { adminId: v.id("users") },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.adminId);
        const config = await ctx.db.query("configSysteme").first();

        if (!config) {
            return DEFAULT_CONFIG;
        }

        let parsedValue = DEFAULT_CONFIG;
        try {
            parsedValue = JSON.parse(config.valeur);
        } catch (e) {
            console.error("Config parse error:", e);
        }

        return {
            _id: config._id,
            ...parsedValue
        };
    }
});

export const updateSystemConfig = mutation({
    args: {
        adminId: v.id("users"),
        section: v.string(), // "securite", "notifications", etc.
        nouvellesValeurs: v.any() // JSON object of new values
    },
    handler: async (ctx, args) => {
        const admin = await checkAdmin(ctx, args.adminId);

        if (admin.role === "demo") {
            return "Les paramètres ne peuvent pas être modifiés en mode Démo.";
        }

        let config = await ctx.db.query("configSysteme").first();

        // Deserialize current value
        let currentConfigValue: any = DEFAULT_CONFIG;
        if (config?.valeur) {
            try {
                currentConfigValue = JSON.parse(config.valeur);
            } catch (e) { }
        }

        // Merge new values
        const updatedConfigValue = {
            ...currentConfigValue,
            [args.section]: {
                ...(currentConfigValue[args.section] || {}),
                ...args.nouvellesValeurs
            }
        };

        const stringifiedValue = JSON.stringify(updatedConfigValue);

        if (config) {
            await ctx.db.patch(config._id, {
                valeur: stringifiedValue,
                modifiePar: admin._id,
                dateModification: Date.now()
            });
        } else {
            await ctx.db.insert("configSysteme", {
                cle: "global",
                valeur: stringifiedValue,
                categorie: "systeme",
                description: "Configuration globale du système",
                modifiePar: admin._id,
                dateModification: Date.now()
            });
        }

        await ctx.db.insert("auditLogs", {
            userId: admin._id,
            action: "MODIFICATION_CONFIGURATION",
            module: "Admin",
            details: `La section ${args.section} de la configuration a été modifiée`,
            ipAddress: "System",
            userAgent: "AGASA-Core Admin API",
            timestamp: Date.now(),
        });

        return "Configuration sauvegardée avec succès.";
    }
});
