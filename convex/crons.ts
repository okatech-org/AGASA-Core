import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";

const crons = cronJobs();

// Mutation interne pour exécuter la logique de recouvrement
export const executerRecouvrementAuto = internalMutation({
    args: {},
    handler: async (ctx) => {
        const maintenant = Date.now();
        const J15 = 15 * 24 * 60 * 60 * 1000;
        const J30 = 30 * 24 * 60 * 60 * 1000;
        const J60 = 60 * 24 * 60 * 60 * 1000;

        const redevancesEnAttente = await ctx.db.query("redevances")
            .withIndex("by_statut", q => q.eq("statut", "en_attente"))
            .collect();

        const redevancesRelance15 = await ctx.db.query("redevances")
            .withIndex("by_statut", q => q.eq("statut", "relance_j15"))
            .collect();

        const redevancesRelance30 = await ctx.db.query("redevances")
            .withIndex("by_statut", q => q.eq("statut", "relance_j30"))
            .collect();

        // 1. En Attente -> Relance J15
        for (const r of redevancesEnAttente) {
            if (maintenant - r.dateEcheance > J15) {
                await ctx.db.patch(r._id, { statut: "relance_j15" });
                await ctx.db.insert("auditLogs", {
                    userId: "system" as any, // Identifiant système
                    action: "RELANCE_AUTO_J15",
                    module: "FINANCE",
                    details: `Redevance ${r.reference} en retard de +15 jours. Notification envoyée à l'opérateur via AGASA-Pro.`,
                    ipAddress: "Cron",
                    userAgent: "Convex_Cron",
                    timestamp: maintenant
                });
            }
        }

        // 2. Relance J15 -> Relance J30
        for (const r of redevancesRelance15) {
            if (maintenant - r.dateEcheance > J30) {
                await ctx.db.patch(r._id, { statut: "relance_j30" });
                await ctx.db.insert("auditLogs", {
                    userId: "system" as any,
                    action: "RELANCE_AUTO_J30",
                    module: "FINANCE",
                    details: `Redevance ${r.reference} en retard de +30 jours. Deuxième notification envoyée.`,
                    ipAddress: "Cron",
                    userAgent: "Convex_Cron",
                    timestamp: maintenant
                });
            }
        }

        // 3. Relance J30 -> Recouvrement Forcé
        for (const r of redevancesRelance30) {
            if (maintenant - r.dateEcheance > J60) {
                await ctx.db.patch(r._id, { statut: "recouvrement_force" });
                await ctx.db.insert("auditLogs", {
                    userId: "system" as any,
                    action: "RECOUVREMENT_FORCE_TRESOR",
                    module: "FINANCE",
                    details: `Redevance ${r.reference} en retard > 60j. Constitution du dossier pour le Trésor Public.`,
                    ipAddress: "Cron",
                    userAgent: "Convex_Cron",
                    timestamp: maintenant
                });
            }
        }

        return "Recouvrement terminé.";
    }
});

// Définition de la tâche planifiée : Tous les jours à 6h00 (UTC)
crons.daily(
    "Recouvrement automatique des redevances",
    { hourUTC: 6, minuteUTC: 0 },
    internal.crons.executerRecouvrementAuto
);

export default crons;
