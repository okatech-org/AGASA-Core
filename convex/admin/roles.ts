import { query } from "../_generated/server";
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

// Hardcoded core roles map for Phase 2 
const CORE_ROLES = [
    { id: "admin_systeme", nom: "Administrateur Système", isDeletable: false, userCount: 1, permissions: { rh: { read: true, write: true }, finance: { read: true, write: true }, ged: { read: true, write: true }, admin: { read: true, write: true } } },
    { id: "directeur_general", nom: "Directeur Général", isDeletable: false, userCount: 1, permissions: { rh: { read: true }, finance: { read: true }, bi: { read: true, export: true }, alertes: { read: true, validate: true } } },
    { id: "directeur", nom: "Directeur", isDeletable: false, userCount: 4, permissions: { rh: { read: true, validate: true }, finance: { read: true, validate: true } } },
    { id: "chef_service", nom: "Chef de Service", isDeletable: false, userCount: 15, permissions: { rh: { read: true }, ged: { read: true, write: true } } },
    { id: "agent", nom: "Agent", isDeletable: false, userCount: 125, permissions: { rh: { read: true } } },
    { id: "technicien_laa", nom: "Technicien Laboratoire", isDeletable: false, userCount: 12, permissions: { lims: { read: true, write: true } } },
    { id: "auditeur", nom: "Auditeur Externe", isDeletable: false, userCount: 2, permissions: { finance: { read: true }, admin: { read: true, export: true } } },
];

export const getRolesWithPermissions = query({
    args: { adminId: v.id("users") },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.adminId);

        // Fetch users to calculate real time counts per role
        const users = await ctx.db.query("users").collect();

        return CORE_ROLES.map(role => {
            // For each role, count how many users have this role natively or simulated
            const count = users.filter(u => u.role === role.id || u.demoSimulatedRole === role.id).length;
            return { ...role, userCount: count };
        });
    }
});
