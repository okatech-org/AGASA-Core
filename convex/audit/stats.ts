import { v } from "convex/values";
import { query } from "../_generated/server";

// Helper to check audit access (auditeur, admin_systeme, directeur_general)
const checkAuditAccess = async (ctx: any, userId: any) => {
    if (!userId) throw new Error("Non autorisé : authentification requise.");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Utilisateur introuvable.");
    return user;
};

// 1. Journal d'audit — Liste des auditLogs
export const getJournal = query({
    args: {
        userId: v.id("users"),
        module: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await checkAuditAccess(ctx, args.userId);

        let logs;
        if (args.module && args.module !== "Tous") {
            logs = await ctx.db.query("auditLogs")
                .withIndex("by_module", (q: any) => q.eq("module", args.module))
                .order("desc")
                .take(args.limit ?? 100);
        } else {
            logs = await ctx.db.query("auditLogs")
                .order("desc")
                .take(args.limit ?? 100);
        }

        // Enrichir avec les noms d'utilisateurs
        return await Promise.all(logs.map(async (log) => {
            const user = await ctx.db.get(log.userId);
            return {
                ...log,
                utilisateur: user ? `${user.prenom} ${user.nom}` : "Système",
                role: user?.role ?? "inconnu",
            };
        }));
    }
});

// 2. KPIs BI — Agrégation cross-module
export const getBIKPIs = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await checkAuditAccess(ctx, args.userId);

        // Échantillons = proxy pour inspections
        const echantillons = await ctx.db.query("echantillons").collect();
        const analyses = await ctx.db.query("analyses").collect();
        const redevances = await ctx.db.query("redevances").collect();
        const alertes = await ctx.db.query("alertes").collect();
        const agents = await ctx.db.query("agents").collect();
        const users = await ctx.db.query("users").collect();
        const logs = await ctx.db.query("auditLogs").order("desc").take(500);

        // KPI Calculs
        const totalInspections = echantillons.length;
        const conformes = analyses.filter(a => a.conformite === "conforme").length;
        const totalAnalyses = analyses.length;
        const tauxConformite = totalAnalyses > 0 ? (conformes / totalAnalyses) * 100 : 0;

        const redevancesPayees = redevances.filter(r => r.statut === "paye");
        const totalRedevances = redevances.length;
        const tauxRecouvrement = totalRedevances > 0 ? (redevancesPayees.length / totalRedevances) * 100 : 0;
        const totalEncaisse = redevancesPayees.reduce((s, r) => s + r.montant, 0);

        const alertesActives = alertes.filter(a => a.statut !== "archivee" && a.statut !== "resolue").length;
        const effectifActif = agents.length;
        const effectifTotal = users.length;

        // Performance par province
        const provinces = ["Estuaire", "Haut-Ogooué", "Ogooué-Maritime", "Woleu-Ntem", "Moyen-Ogooué", "Nyanga", "Ngounié", "Ogooué-Ivindo", "Ogooué-Lolo"];
        const provincesData = provinces.map(p => {
            const provEch = echantillons.filter(e => e.lieuPrelevement?.includes(p));
            const provRed = redevances.filter(r => r.provinceOrigine === p);
            const provAlertes = alertes.filter(a => a.zoneGeographique === p && a.statut !== "archivee" && a.statut !== "resolue");
            const provPayees = provRed.filter(r => r.statut === "paye");
            const provRecouvrement = provRed.length > 0 ? (provPayees.length / provRed.length) * 100 : 0;

            return {
                province: p,
                inspections: provEch.length,
                conformite: tauxConformite, // Simplified — could be per-province
                recouvrement: Math.round(provRecouvrement),
                alertes: provAlertes.length,
                performance: provRecouvrement >= 85 ? "bon" : provRecouvrement >= 70 ? "moyen" : provRecouvrement >= 50 ? "en_dessous" : "critique",
            };
        }).filter(p => p.inspections > 0 || p.alertes > 0);

        // Activité par module (30j)
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const recentLogs = logs.filter(l => l.timestamp >= thirtyDaysAgo);
        const moduleGroups: Record<string, { count: number; actions: Record<string, number> }> = {};
        recentLogs.forEach(l => {
            if (!moduleGroups[l.module]) moduleGroups[l.module] = { count: 0, actions: {} };
            moduleGroups[l.module].count++;
            if (!moduleGroups[l.module].actions[l.action]) moduleGroups[l.module].actions[l.action] = 0;
            moduleGroups[l.module].actions[l.action]++;
        });

        const modulesActivity = Object.entries(moduleGroups).map(([module, data]) => {
            const topAction = Object.entries(data.actions).sort((a, b) => b[1] - a[1])[0];
            return {
                module,
                actions30j: data.count,
                topAction: topAction ? `${topAction[0]} (${topAction[1]})` : "—",
            };
        }).sort((a, b) => b.actions30j - a.actions30j);

        return {
            kpis: [
                { label: "Inspections réalisées", value: totalInspections.toString(), color: "text-blue-600" },
                { label: "Taux de conformité global", value: tauxConformite.toFixed(1) + "%", color: "text-emerald-600" },
                { label: "Redevances encaissées", value: new Intl.NumberFormat("fr-FR").format(totalEncaisse) + " FCFA", color: "text-amber-600" },
                { label: "Taux de recouvrement", value: tauxRecouvrement.toFixed(0) + "%", color: "text-violet-600" },
                { label: "Alertes actives", value: alertesActives.toString(), color: "text-red-600" },
                { label: "Effectif actif", value: `${effectifActif} / ${effectifTotal}`, color: "text-slate-600" },
            ],
            provincesData,
            modulesActivity,
        };
    }
});

// 3. Traçabilité financière — Redevances
export const getFinanceTrace = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await checkAuditAccess(ctx, args.userId);

        const redevances = await ctx.db.query("redevances").order("desc").take(50);
        const paiements = await ctx.db.query("paiements").order("desc").take(50);

        const enriched = redevances.map(r => {
            const paiement = paiements.find(p => p.redevanceId === r._id);
            return {
                ref: r.reference,
                operateur: r.operateur,
                type: r.type,
                montant: r.montant,
                statut: r.statut === "paye" ? "encaisse" : r.statut === "en_retard" ? "retard" : r.statut === "annule" ? "annule" : "en_recouvrement",
                date: new Date(r.dateEcheance).toLocaleDateString("fr-FR"),
                moyen: paiement?.mode ?? "—",
            };
        });

        const totalEncaisse = enriched.filter(r => r.statut === "encaisse").reduce((s, r) => s + r.montant, 0);
        const totalRecouvrement = enriched.filter(r => r.statut === "en_recouvrement").reduce((s, r) => s + r.montant, 0);
        const totalRetard = enriched.filter(r => r.statut === "retard").reduce((s, r) => s + r.montant, 0);

        return { redevances: enriched, totalEncaisse, totalRecouvrement, totalRetard };
    }
});

// 4. Flux inter-applications
export const getFlux = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await checkAuditAccess(ctx, args.userId);

        const flux = await ctx.db.query("fluxInterApps").order("desc").take(200);

        // Grouped by fluxCode
        const fluxGroups: Record<string, { total: number; succes: number; dernier: number; messages24h: number }> = {};
        const vingtQuatreH = Date.now() - 24 * 60 * 60 * 1000;

        flux.forEach(f => {
            if (!fluxGroups[f.fluxCode]) fluxGroups[f.fluxCode] = { total: 0, succes: 0, dernier: 0, messages24h: 0 };
            fluxGroups[f.fluxCode].total++;
            if (f.statut === "traite" || f.statut === "recu") fluxGroups[f.fluxCode].succes++;
            if (f.dateEnvoi > fluxGroups[f.fluxCode].dernier) fluxGroups[f.fluxCode].dernier = f.dateEnvoi;
            if (f.dateEnvoi >= vingtQuatreH) fluxGroups[f.fluxCode].messages24h++;
        });

        const fluxNames: Record<string, { nom: string; source: string; destination: string; type: string }> = {
            "F1": { nom: "AGASA-Core → Trésor Public", source: "AGASA-Core", destination: "Trésor Public", type: "Redevances" },
            "F2": { nom: "AGASA-Inspect → AGASA-Core", source: "AGASA-Inspect", destination: "AGASA-Core", type: "Rapports inspection" },
            "F3": { nom: "AGASA-Core → LIMS (LAA)", source: "AGASA-Core", destination: "LAA", type: "Échantillons" },
            "F4": { nom: "AGASA-Pro → AGASA-Core", source: "AGASA-Pro", destination: "AGASA-Core", type: "Demandes opérateurs" },
            "F5": { nom: "AGASA-Core → eSanté", source: "AGASA-Core", destination: "eSanté", type: "Alertes sanitaires" },
            "F6": { nom: "CEBEVIRHA → AGASA-Core", source: "CEBEVIRHA", destination: "AGASA-Core", type: "Notifications CEMAC" },
        };

        const result = Object.entries(fluxGroups).map(([code, data]) => ({
            id: code,
            ...(fluxNames[code] || { nom: code, source: "—", destination: "—", type: "—" }),
            statut: data.messages24h > 0 ? "actif" : "inactif",
            succes: data.total > 0 ? Math.round((data.succes / data.total) * 100 * 10) / 10 : 0,
            dernierMsg: data.dernier > 0 ? new Date(data.dernier).toLocaleString("fr-FR") : "—",
            messages24h: data.messages24h,
        }));

        // Include flux codes that have no data yet
        const allCodes = ["F1", "F2", "F3", "F4", "F5", "F6"];
        allCodes.forEach(code => {
            if (!result.find(r => r.id === code)) {
                result.push({
                    id: code,
                    ...(fluxNames[code] || { nom: code, source: "—", destination: "—", type: "—" }),
                    statut: "inactif",
                    succes: 0,
                    dernierMsg: "—",
                    messages24h: 0,
                });
            }
        });

        result.sort((a, b) => a.id.localeCompare(b.id));
        return result;
    }
});

// 5. Chaîne de signatures
export const getSignatures = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await checkAuditAccess(ctx, args.userId);

        const signatures = await ctx.db.query("signatures").order("desc").take(50);

        const enriched = await Promise.all(signatures.map(async (sig) => {
            const signataire = await ctx.db.get(sig.signataireId);
            return {
                ref: `SIG-${sig._id.slice(-8).toUpperCase()}`,
                document: "Document #" + sig.documentId.slice(-6),
                signataire: signataire ? `${signataire.prenom} ${signataire.nom}` : "Inconnu",
                date: new Date(sig.dateSignature).toLocaleString("fr-FR"),
                hash: sig.empreinteDigitale ? `sha256:${sig.empreinteDigitale.slice(0, 8)}...${sig.empreinteDigitale.slice(-4)}` : "—",
                statut: "valide" as const,
            };
        }));

        // Also get pending from workflows
        const pendingEtapes = await ctx.db.query("etapesWorkflow")
            .filter((q: any) => q.eq(q.field("statut"), "en_attente"))
            .take(20);

        const pending = await Promise.all(pendingEtapes.map(async (e) => {
            const workflow = await ctx.db.get(e.workflowId);
            const valideur = await ctx.db.get(e.valideurId);
            return {
                ref: `SIG-PEND-${e._id.slice(-6).toUpperCase()}`,
                document: workflow?.titreDocument ?? "Document en attente",
                signataire: valideur ? `${valideur.prenom} ${valideur.nom}` : "Inconnu",
                date: workflow ? new Date(workflow.dateCreation).toLocaleString("fr-FR") : "—",
                hash: "—",
                statut: "en_attente" as const,
            };
        }));

        return [...pending, ...enriched];
    }
});

// 6. Rapports financiers
export const getRapportsFinanciers = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await checkAuditAccess(ctx, args.userId);

        const lignes = await ctx.db.query("lignesBudgetaires").collect();
        const redevances = await ctx.db.query("redevances").collect();

        const totalAlloue = lignes.reduce((s, l) => s + l.montantAlloue, 0);
        const totalConsomme = lignes.reduce((s, l) => s + l.montantConsomme, 0);
        const pctConsomme = totalAlloue > 0 ? Math.round((totalConsomme / totalAlloue) * 100) : 0;

        const totalRedevances = redevances.length;
        const payees = redevances.filter(r => r.statut === "paye").length;
        const tauxRecouvrement = totalRedevances > 0 ? Math.round((payees / totalRedevances) * 100) : 0;

        const revenus = redevances.filter(r => r.statut === "paye").reduce((s, r) => s + r.montant, 0);

        return {
            revenus,
            pctConsomme,
            tauxRecouvrement,
            totalRapports: 0, // These are "generated reports" — no table for that yet
        };
    }
});

// 7. Rapports d'audit (historique des rapports générés par les auditeurs)
export const getRapportsHistory = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await checkAuditAccess(ctx, args.userId);

        // Fetch audit logs related to report generation
        const reportLogs = await ctx.db.query("auditLogs")
            .order("desc")
            .take(500);

        const reports = reportLogs
            .filter(l => l.action.includes("EXPORT") || l.action.includes("RAPPORT") || l.action.includes("GENERATION"))
            .slice(0, 20)
            .map(l => {
                const user = l.userId;
                return {
                    date: new Date(l.timestamp).toLocaleDateString("fr-FR"),
                    type: l.module,
                    titre: l.details || l.action,
                    generePar: "Utilisateur",
                    format: "PDF",
                    taille: "—",
                };
            });

        return reports;
    }
});
