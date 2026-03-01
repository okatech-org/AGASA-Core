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

// Mock data for the API Gateway as it was not fully implemented in DB models yet
const MOCK_API_FLUX = [
    { code: "F1", nom: "AGASA-Pro → Core (Opérateurs)", source: "AGASA-Pro", dest: "AGASA-Core", status: "actif", req24h: 1240, successRate: 99.8, lastMsg: Date.now() - 300000 },
    { code: "F2", nom: "Core → AGASA-Pro (Certificats)", source: "AGASA-Core", dest: "AGASA-Pro", status: "actif", req24h: 845, successRate: 100, lastMsg: Date.now() - 1500000 },
    { code: "F3", nom: "Sydonia → Core (Douanes)", source: "Sydonia World", dest: "AGASA-Core", status: "erreur", req24h: 300, successRate: 85.2, lastMsg: Date.now() - 86400000, error: "Connection timeout on partner API" },
    { code: "F4", nom: "Core → e-Tax (Trésor Public)", source: "AGASA-Core", dest: "e-Tax", status: "actif", req24h: 12, successRate: 100, lastMsg: Date.now() - 36000000 },
    { code: "F5", nom: "AGASA-Inspect → Core (Rapports)", source: "AGASA-Inspect", dest: "AGASA-Core", status: "inactif", req24h: 0, successRate: 0, lastMsg: Date.now() - 864000000 },
    { code: "F6", nom: "AGASA-Citoyen → Core (Alertes)", source: "AGASA-Citoyen", dest: "AGASA-Core", status: "actif", req24h: 42, successRate: 100, lastMsg: Date.now() - 7200000 }
];

export const getFluxStats = query({
    args: { adminId: v.id("users") },
    handler: async (ctx, args) => {
        await checkAdmin(ctx, args.adminId);

        // En production, on lirait ctx.db.query("fluxInterApps") 
        // Pour la Phase 2, on retourne des stats simulées réalistes
        return MOCK_API_FLUX;
    }
});
