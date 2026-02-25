import { v } from "convex/values";
import { query } from "../_generated/server";

export const getDashboardInfo = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const agent = await ctx.db.query("agents").withIndex("by_userId", q => q.eq("userId", args.userId)).first();
        const user = await ctx.db.get(args.userId);

        if (!agent || !user) return null;

        // 1. Solde Congés (Simplifié: 30 jours/an)
        // Calculer les congés pris
        const congesApprouves = await ctx.db.query("conges")
            .withIndex("by_agentId", q => q.eq("agentId", agent._id))
            .filter(q => q.eq(q.field("statut"), "approuve_drh"))
            .collect();
        const joursPris = congesApprouves.reduce((acc, curr) => acc + curr.nombreJours, 0);
        const soldeConges = Math.max(0, 30 - joursPris);

        // 2. Dernière demande de congé
        const dernierConge = await ctx.db.query("conges")
            .withIndex("by_agentId", q => q.eq("agentId", agent._id))
            .order("desc")
            .first();

        // 3. Dernier bulletin de paie
        const dernierBulletin = await ctx.db.query("paie")
            .withIndex("by_agentId", q => q.eq("agentId", agent._id))
            .order("desc")
            .first();

        // 4. Prochaine formation
        const mesInscriptions = await ctx.db.query("inscriptionsFormation")
            .withIndex("by_agentId", q => q.eq("agentId", agent._id))
            .filter(q => q.eq(q.field("statut"), "inscrit"))
            .collect();

        let prochaineFormation = null;
        if (mesInscriptions.length > 0) {
            const formObj = await ctx.db.get(mesInscriptions[0].formationId);
            if (formObj && formObj.dateDebut > Date.now()) {
                prochaineFormation = formObj;
            }
        }

        return {
            agent,
            user,
            soldeConges,
            dernierConge,
            dernierBulletin,
            prochaineFormation,
        };
    }
});

// Annuaire de l'entreprise
export const getAnnuaire = query({
    args: {},
    handler: async (ctx) => {
        const tousAgents = await ctx.db.query("agents").filter(q => q.eq(q.field("statut"), "en_poste")).collect();
        const annuaire = await Promise.all(tousAgents.map(async a => {
            const user = await ctx.db.get(a.userId);
            return {
                id: a._id,
                nom: user?.nom || "",
                prenom: user?.prenom || "",
                email: user?.email || "",
                telephone: user?.telephone || "",
                avatar: user?.avatar || "",
                poste: a.poste,
                direction: a.direction,
                service: a.service,
                province: a.province
            };
        }));

        return annuaire.sort((x, y) => x.nom.localeCompare(y.nom));
    }
});

// Profil complet de l'agent connecté
export const getMyProfile = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const agent = await ctx.db.query("agents").withIndex("by_userId", q => q.eq("userId", args.userId)).first();
        const user = await ctx.db.get(args.userId);
        if (!agent || !user) return null;

        // Solde de congés
        const congesApprouves = await ctx.db.query("conges")
            .withIndex("by_agentId", q => q.eq("agentId", agent._id))
            .filter(q => q.eq(q.field("statut"), "approuve_drh"))
            .collect();
        const joursPris = congesApprouves.reduce((acc, curr) => acc + curr.nombreJours, 0);
        const soldeConges = Math.max(0, 30 - joursPris);

        return {
            agent: {
                ...agent,
                soldeConges,
            },
            user: {
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                matricule: user.matricule,
                telephone: user.telephone || "",
                avatar: user.avatar || "",
                role: user.role,
            },
        };
    }
});

// Liste consolidée de toutes les demandes de l'agent
export const getMyDemandes = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const agent = await ctx.db.query("agents").withIndex("by_userId", q => q.eq("userId", args.userId)).first();
        if (!agent) return [];

        // Congés
        const conges = await ctx.db.query("conges")
            .withIndex("by_agentId", q => q.eq("agentId", agent._id))
            .order("desc")
            .collect();

        // Inscriptions formation
        const inscriptions = await ctx.db.query("inscriptionsFormation")
            .withIndex("by_agentId", q => q.eq("agentId", agent._id))
            .order("desc")
            .collect();

        const formations = await Promise.all(
            inscriptions.map(async (insc) => {
                const f = await ctx.db.get(insc.formationId);
                return { ...insc, formationTitre: f?.titre || "Formation inconnue" };
            })
        );

        type Demande = {
            _id: string;
            type: string;
            objet: string;
            date: number;
            statut: string;
            lien: string;
        };

        const demandes: Demande[] = [];

        for (const c of conges) {
            const dateDebut = new Date(c.dateDebut).toLocaleDateString("fr-FR");
            const dateFin = new Date(c.dateFin).toLocaleDateString("fr-FR");
            demandes.push({
                _id: c._id,
                type: "Congé",
                objet: `${c.type} — du ${dateDebut} au ${dateFin} (${c.nombreJours}j)`,
                date: c._creationTime,
                statut: c.statut,
                lien: `/rh/conges`,
            });
        }

        for (const f of formations) {
            demandes.push({
                _id: f._id,
                type: "Formation",
                objet: f.formationTitre,
                date: f._creationTime,
                statut: f.statut,
                lien: `/rh/formations`,
            });
        }

        // Sort by date desc
        demandes.sort((a, b) => b.date - a.date);

        return demandes;
    }
});
