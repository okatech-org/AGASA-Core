import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

export const getStatsAlertes = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("Non autorisé");

        const toutesAlertes = await ctx.db.query("alertes").collect();
        const tousSignalements = await ctx.db.query("signalementsCitoyens").collect();
        const rpps = await ctx.db.query("rappelsProduits").collect();
        const cemac = await ctx.db.query("cemacAlertes").collect();

        return {
            actives: toutesAlertes.filter(a => ["nouvelle", "en_verification", "confirmee"].includes(a.statut)).length,
            signalementsEnAttente: tousSignalements.filter(s => s.statut === "recu").length,
            rappelsEnCours: rpps.filter(r => r.statut === "en_cours").length,
            cemacActives: cemac.filter(c => ["recue", "emise"].includes(c.statut)).length,

            // Pour la Timeline (2 dernières jours)
            recentes: toutesAlertes
                .sort((a, b) => b.dateCreation - a.dateCreation)
                .slice(0, 10),

            // Pour la carte
            geolocData: toutesAlertes.filter(a => ["nouvelle", "en_verification", "confirmee"].includes(a.statut)),
        };
    },
});

export const listerAlertes = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("Non autorisé");

        let req = ctx.db.query("alertes").order("desc");

        // Cloisonnement provincial si non DG/Admin
        if (!["admin_systeme", "directeur_general"].includes(user.role)) {
            // Un agent d'antenne ne voit que celles de sa province, ou celles qui lui sont assignées
            req = req.filter(q => q.eq(q.field("zoneGeographique"), user.province));
        }

        return await req.collect();
    },
});

export const getAlerte = query({
    args: { id: v.id("alertes"), userId: v.id("users") },
    handler: async (ctx, args) => {
        const alerte = await ctx.db.get(args.id);
        if (!alerte) throw new Error("Alerte introuvable");
        return alerte;
    },
});

export const assignerAlerte = mutation({
    args: {
        id: v.id("alertes"),
        agentId: v.string(), // On peut stocker l'ID de l'agent ou "Antenne Woleu-Ntem"
        userId: v.id("users")
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("Non autorisé");

        const alerte = await ctx.db.get(args.id);
        if (!alerte) throw new Error("Alerte introuvable");

        const actions = alerte.actions || [];
        actions.push({
            date: Date.now(),
            action: `Assignation à: ${args.agentId}`,
            responsable: `${user.prenom} ${user.nom}`,
        });

        await ctx.db.patch(args.id, {
            assigneeA: args.agentId,
            statut: "en_verification",
            actions
        });

        // Log Audit
        await ctx.db.insert("auditLogs", {
            userId: args.userId,
            action: "ASSIGNATION_ALERTE",
            module: "ALERTES",
            details: `Alerte ${args.id} assignée.`,
            ipAddress: "127.0.0.1",
            userAgent: "AGASA-Admin",
            timestamp: Date.now(),
        });

        return args.id;
    },
});

export const statuerAlerte = mutation({
    args: {
        id: v.id("alertes"),
        nouveauStatut: v.union(
            v.literal("confirmee"),
            v.literal("resolue"),
            v.literal("archivee")
        ),
        commentaire: v.string(),
        userId: v.id("users")
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("Non autorisé");

        const alerte = await ctx.db.get(args.id);
        if (!alerte) throw new Error("Alerte introuvable");

        const actions = alerte.actions || [];
        actions.push({
            date: Date.now(),
            action: `Changement de statut vers ${args.nouveauStatut.toUpperCase()} - ${args.commentaire}`,
            responsable: `${user.prenom} ${user.nom}`,
        });

        const patch: any = {
            statut: args.nouveauStatut,
            actions
        };

        if (args.nouveauStatut === "confirmee") patch.dateConfirmation = Date.now();
        if (args.nouveauStatut === "resolue") patch.dateResolution = Date.now();

        await ctx.db.patch(args.id, patch);

        return args.id;
    },
});

export const creerAlerteManuelle = mutation({
    args: {
        titre: v.string(),
        description: v.string(),
        type: v.union(v.literal("biologique"), v.literal("chimique"), v.literal("physique")),
        zoneGeographique: v.string(),
        niveau: v.union(v.literal("information"), v.literal("vigilance"), v.literal("alerte"), v.literal("urgence")),
        userId: v.id("users")
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("Non autorisé");

        const alerteId = await ctx.db.insert("alertes", {
            titre: args.titre,
            description: args.description,
            type: args.type,
            source: "interne",
            zoneGeographique: args.zoneGeographique,
            niveau: args.niveau,
            statut: "nouvelle",
            assigneeA: "Non assigné",
            dateCreation: Date.now(),
            actions: [{
                date: Date.now(),
                action: "Création manuelle de l'alerte interne",
                responsable: `${user.prenom} ${user.nom}`
            }],
        });

        return alerteId;
    },
});
