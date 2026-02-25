import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";

const checkFinanceAccess = async (ctx: any, userId: any) => {
    if (!userId) throw new Error("Non autorisé : authentification requise.");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Utilisateur introuvable.");
    return user;
};

// 1. Dashboard Redevances
export const getDashboardStats = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await checkFinanceAccess(ctx, args.userId);

        const moisEnCours = new Date();
        const debutMois = new Date(moisEnCours.getFullYear(), moisEnCours.getMonth(), 1).getTime();
        const finMois = new Date(moisEnCours.getFullYear(), moisEnCours.getMonth() + 1, 0).getTime();

        const toutesRedevances = await ctx.db.query("redevances").collect();

        // Calculs globaux du mois en cours
        let totalAttenduMois = 0;
        let totalEncaisseMois = 0;
        let montantEnRetardTotal = 0;
        let montantRecouvrementForce = 0;
        let totalPayeAllTime = 0;
        let totalAttenduAllTime = 0;

        const chartType: Record<string, number> = {};
        const chartProvince: Record<string, number> = {};

        toutesRedevances.forEach(r => {
            totalAttenduAllTime += r.montant;
            if (r.statut === "paye") totalPayeAllTime += r.montant;

            // Stats mensuelles (échéance dans le mois ou payé dans le mois)
            const isMoisEnCours = r.dateEcheance >= debutMois && r.dateEcheance <= finMois;

            if (isMoisEnCours) {
                totalAttenduMois += r.montant;
            }

            if (r.statut === "paye") {
                if (r.datePaiement && r.datePaiement >= debutMois && r.datePaiement <= finMois) {
                    totalEncaisseMois += r.montant;
                }
                // Répartition par province pour les encaissements
                if (!chartProvince[r.provinceOrigine]) chartProvince[r.provinceOrigine] = 0;
                chartProvince[r.provinceOrigine] += r.montant;
            }

            if (r.statut === "en_retard" || r.statut === "relance_j15" || r.statut === "relance_j30") {
                montantEnRetardTotal += r.montant;
            }

            if (r.statut === "recouvrement_force") {
                montantRecouvrementForce += r.montant;
            }

            // Répartition par type
            if (!chartType[r.type]) chartType[r.type] = 0;
            chartType[r.type] += r.montant;
        });

        const repartitionTypeData = Object.keys(chartType).map(t => ({ name: t, value: chartType[t] }));
        const repartitionProvinceData = Object.keys(chartProvince).map(p => ({ province: p, montant: chartProvince[p] })).sort((a, b) => b.montant - a.montant);

        // Simulation Taux de recouvrement par mois sur l'année
        const moisNoms = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
        const recouvrementMensuel = moisNoms.map((m, i) => {
            if (i > new Date().getMonth()) return { mois: m, taux: 0 };
            return {
                mois: m,
                taux: Math.round(50 + (Math.random() * 20)) // 50-70%
            };
        });

        return {
            totalAttenduMois,
            totalEncaisseMois,
            tauxRecouvrement: totalAttenduMois > 0 ? (totalEncaisseMois / totalAttenduMois) * 100 : 0,
            tauxRecouvrementAllTime: totalAttenduAllTime > 0 ? (totalPayeAllTime / totalAttenduAllTime) * 100 : 0,
            montantEnRetardTotal,
            montantRecouvrementForce,
            repartitionTypeData,
            repartitionProvinceData,
            recouvrementMensuel
        };
    }
});

// 2. Lister les redevances
export const listerRedevances = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await checkFinanceAccess(ctx, args.userId);
        return await ctx.db.query("redevances").order("desc").collect();
    }
});

// 3. Détail d'une redevance
export const getRedevance = query({
    args: { userId: v.id("users"), redevanceId: v.id("redevances") },
    handler: async (ctx, args) => {
        await checkFinanceAccess(ctx, args.userId);
        const redevance = await ctx.db.get(args.redevanceId);
        if (!redevance) throw new Error("Facture introuvable.");

        // Historique factice basé sur la hiérarchie des statuts
        const timeline = [];
        timeline.push({ titre: "Émission Facture", date: redevance.dateEcheance - (30 * 24 * 60 * 60 * 1000), desc: "Générée depuis " + redevance.sourceApp });

        if (redevance.statut === "paye") {
            timeline.push({ titre: "Règlement effectué", date: redevance.datePaiement || Date.now(), desc: "Montant acquitté" });
        } else {
            if (redevance.dateEcheance < Date.now()) timeline.push({ titre: "Échéance dépassée", date: redevance.dateEcheance, desc: "Passage en dette" });
            if (redevance.statut === "relance_j15" || redevance.statut === "relance_j30" || redevance.statut === "recouvrement_force") {
                timeline.push({ titre: "1ère Relance (J+15)", date: redevance.dateEcheance + (15 * 24 * 60 * 60 * 1000), desc: "Notification envoyée à l'opérateur" });
            }
            if (redevance.statut === "relance_j30" || redevance.statut === "recouvrement_force") {
                timeline.push({ titre: "Mise en demeure (J+30)", date: redevance.dateEcheance + (30 * 24 * 60 * 60 * 1000), desc: "Transfert au contentieux possible" });
            }
            if (redevance.statut === "recouvrement_force") {
                timeline.push({ titre: "Recouvrement Forcé Trésor (J+60)", date: redevance.dateEcheance + (60 * 24 * 60 * 60 * 1000), desc: "Dossier transmis au Trésor Public" });
            }
        }

        return { ...redevance, timeline: timeline.sort((a, b) => a.date - b.date) };
    }
});

// 4. Marquer comme payé
export const marquerPaye = mutation({
    args: {
        userId: v.id("users"),
        redevanceId: v.id("redevances"),
        modePaiement: v.string()
    },
    handler: async (ctx, args) => {
        const user = await checkFinanceAccess(ctx, args.userId);

        await ctx.db.patch(args.redevanceId, {
            statut: "paye",
            datePaiement: Date.now(),
            modePaiement: args.modePaiement
        });

        // Audit Admin
        await ctx.db.insert("auditLogs", {
            userId: user._id,
            action: "ENCAISSEMENT_REDEVANCE",
            module: "FINANCE",
            details: `Facture payée via ${args.modePaiement}. ID: ${args.redevanceId}`,
            ipAddress: "System",
            userAgent: "API",
            timestamp: Date.now()
        });

        return "success";
    }
});
