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

export const maintenanceNeocortex = internalMutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const retentionMs = 7 * 24 * 60 * 60 * 1000;
        const signaux = await ctx.db.query("signaux").collect();

        let deleted = 0;
        let nonTraites = 0;
        for (const signal of signaux) {
            if (!signal.traite) nonTraites += 1;
            const expireByRetention = signal.traite && signal.timestamp < now - retentionMs;
            const expireByTtl = signal.ttl ? signal.timestamp + signal.ttl < now : false;
            if (expireByRetention || expireByTtl) {
                await ctx.db.delete(signal._id);
                deleted += 1;
            }
        }

        await ctx.db.insert("metriques", {
            nom: "maintenance_signaux_deleted",
            valeur: deleted,
            unite: "count",
            periode: "daily",
            dimensions: { source: "crons" },
            timestamp: now,
        });

        await ctx.db.insert("metriques", {
            nom: "maintenance_signaux_non_traites",
            valeur: nonTraites,
            unite: "count",
            periode: "daily",
            dimensions: { source: "crons" },
            timestamp: now,
        });

        return { deleted, nonTraites };
    },
});

export const snapshotMetriquesNeocortex = internalMutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        const since = now - oneHour;

        const signaux = await ctx.db
            .query("signaux")
            .withIndex("by_timestamp", (q) => q.gte("timestamp", since))
            .collect();
        const historiques = await ctx.db
            .query("historiqueActions")
            .withIndex("by_timestamp", (q) => q.gte("timestamp", since))
            .collect();

        await ctx.db.insert("metriques", {
            nom: "signaux_1h",
            valeur: signaux.length,
            unite: "count",
            periode: "hourly",
            dimensions: { source: "crons" },
            timestamp: now,
        });

        await ctx.db.insert("metriques", {
            nom: "historique_actions_1h",
            valeur: historiques.length,
            unite: "count",
            periode: "hourly",
            dimensions: { source: "crons" },
            timestamp: now,
        });

        return { signaux: signaux.length, historiques: historiques.length };
    },
});

// Définition de la tâche planifiée : Tous les jours à 6h00 (UTC)
crons.daily(
    "Recouvrement automatique des redevances",
    { hourUTC: 6, minuteUTC: 0 },
    internal.crons.executerRecouvrementAuto
);

crons.daily(
    "Maintenance NEOCORTEX",
    { hourUTC: 2, minuteUTC: 30 },
    internal.crons.maintenanceNeocortex
);

crons.hourly(
    "Snapshot métriques NEOCORTEX",
    { minuteUTC: 5 },
    internal.crons.snapshotMetriquesNeocortex
);

export default crons;
