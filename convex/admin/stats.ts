// AGASA-Core — Admin Stats
import { query } from "../_generated/server";
import { v } from "convex/values";

export const getDashboardStats = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const admin = await ctx.db.get(args.userId);
        if (!admin || (admin.role !== "admin_systeme" && admin.demoSimulatedRole !== "admin_systeme")) {
            return null;
        }
        // Total Users
        const users = await ctx.db.query("users").collect();
        const activeUsers = users.filter(u => u.statut === "actif").length;

        // Roles Distribution
        const rolesMap = new Map<string, number>();
        users.forEach(u => {
            const role = u.demoSimulatedRole || u.role;
            rolesMap.set(role, (rolesMap.get(role) || 0) + 1);
        });

        const rolesData = Array.from(rolesMap.entries()).map(([name, value]) => ({ name, value }));

        // Provinces Distribution
        const provinceMap = new Map<string, number>();
        users.forEach(u => {
            if (u.province) {
                provinceMap.set(u.province, (provinceMap.get(u.province) || 0) + 1);
            }
        });
        const provincesData = Array.from(provinceMap.entries()).map(([name, value]) => ({ name, value }));

        // Recent Audit Logs (last 5)
        const recentLogs = await ctx.db.query("auditLogs").order("desc").take(5);

        return {
            kpi: {
                totalUsers: users.length,
                activeUsers: activeUsers,
                activeSessions: Math.floor(activeUsers * 0.4), // Simulated for demo purposes
                recentActions: await ctx.db.query("auditLogs").filter(q => q.gt(q.field("timestamp"), Date.now() - 86400000)).collect().then(arr => arr.length),
                systemAlerts: users.filter(u => u.statut === "verrouille").length
            },
            charts: {
                rolesDistribution: rolesData,
                provincesDistribution: provincesData
            },
            recentLogs: recentLogs
        };
    }
});
