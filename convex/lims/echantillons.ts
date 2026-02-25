import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// Helper vérification des accès pour les agents LAA (Laboratoire d'Analyse Agricole)
const checkLimsAccess = async (ctx: any, userId: any) => {
    if (!userId) throw new Error("Non autorisé : authentification requise.");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Utilisateur introuvable.");
    return user;
};

// 1. Dashboard Global LIMS
export const getDashboardStats = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await checkLimsAccess(ctx, args.userId);

        const echantillons = await ctx.db.query("limsEchantillons").collect();
        const analyses = await ctx.db.query("limsAnalyses").collect();

        const moisEnCours = new Date();
        const debutMois = new Date(moisEnCours.getFullYear(), moisEnCours.getMonth(), 1).getTime();

        let echantillonsMois = 0;
        let analysesEnCours = 0;
        let analysesTerminees = 0;
        let alertesNonConformite = 0;

        const chartMatrice: Record<string, number> = {};
        const chartConformite: Record<string, { total: number, conformes: number }> = {};

        // Liste des dernières non-conformités
        const nonConformes: any[] = [];

        for (const e of echantillons) {
            if (e.dateReception >= debutMois) echantillonsMois++;
            if (!chartMatrice[e.matrice]) chartMatrice[e.matrice] = 0;
            chartMatrice[e.matrice]++;

            // Init chart conformité
            if (!chartConformite[e.matrice]) chartConformite[e.matrice] = { total: 0, conformes: 0 };
        }

        for (const a of analyses) {
            if (a.statut === "en_cours" || a.statut === "en_attente") analysesEnCours++;
            if (a.statut === "valide_tech") analysesTerminees++;

            if (a.conformite === false) {
                alertesNonConformite++;
                if (nonConformes.length < 5) {
                    const echantillon = await ctx.db.get(a.echantillonId);
                    const parametre = await ctx.db.get(a.parametreId);
                    nonConformes.push({
                        _id: a._id,
                        echantillonReference: echantillon?.codeBarres,
                        parametreNom: parametre?.nom,
                        resultat: a.resultatFinal,
                        seuil: parametre?.seuilReglementaire,
                        date: a.dateValidationN1 || Date.now()
                    });
                }
            }

            // Calcul conformite par matrice
            if (a.conformite !== undefined) {
                const ech = echantillons.find(e => e._id === a.echantillonId);
                if (ech) {
                    chartConformite[ech.matrice].total++;
                    if (a.conformite) chartConformite[ech.matrice].conformes++;
                }
            }
        }

        const tauxGlobalMois = analyses.filter(a => a.conformite !== undefined).length > 0
            ? (analyses.filter(a => a.conformite === true).length / analyses.filter(a => a.conformite !== undefined).length) * 100
            : 0;

        // Mock graphique d'évolution sur 12 semaines
        const evs = [];
        for (let i = 11; i >= 0; i--) {
            const dateStr = new Date(Date.now() - (i * 7 * 24 * 60 * 60 * 1000)).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
            evs.push({ semaine: "S." + dateStr, volume: Math.floor(Math.random() * 50) + 10 });
        }

        const repartitionMatrice = Object.keys(chartMatrice).map(k => ({ name: k, value: chartMatrice[k] }));
        const tauxConformiteMatrice = Object.keys(chartConformite).map(k => ({
            matrice: k,
            taux: chartConformite[k].total > 0 ? (chartConformite[k].conformes / chartConformite[k].total) * 100 : 0
        })).filter(x => x.taux > 0);

        return {
            echantillonsMois,
            analysesEnCours,
            analysesTerminees,
            alertesNonConformite,
            tauxConformite: tauxGlobalMois,
            evolutionHebdo: evs,
            repartitionMatrice,
            tauxConformiteMatrice,
            dernieresAlertes: nonConformes.sort((a, b) => b.date - a.date)
        };
    }
});

// 2. Lister les échantillons (Vue Pipeline et Tableau)
export const listerEchantillons = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        await checkLimsAccess(ctx, args.userId);
        return await ctx.db.query("limsEchantillons").order("desc").collect();
    }
});

// 3. Fiche Échantillon
export const getEchantillon = query({
    args: { userId: v.id("users"), echantillonId: v.id("limsEchantillons") },
    handler: async (ctx, args) => {
        await checkLimsAccess(ctx, args.userId);

        const echantillon = await ctx.db.get(args.echantillonId);
        if (!echantillon) throw new Error("Échantillon introuvable");

        const receptionnaire = await ctx.db.get(echantillon.receptionnePar);

        const traites = await ctx.db.query("limsTracabilite")
            .withIndex("by_echantillonId", q => q.eq("echantillonId", args.echantillonId))
            .collect();
        const tracabilite = traites.sort((a, b) => b.dateLigne - a.dateLigne);

        const assignations = await ctx.db.query("limsAnalyses")
            .withIndex("by_echantillonId", q => q.eq("echantillonId", args.echantillonId))
            .collect();

        const analysesAssociees = await Promise.all(assignations.map(async a => {
            const parametre = await ctx.db.get(a.parametreId);
            const tech = a.assigneA ? await ctx.db.get(a.assigneA) : null;
            return {
                ...a,
                parametreNom: parametre?.nom,
                technicienNom: tech ? `${tech.prenom} ${tech.nom}` : "Non assigné"
            };
        }));

        return {
            ...echantillon,
            receptionnaireNom: receptionnaire ? `${receptionnaire.prenom} ${receptionnaire.nom}` : "Inconnu",
            tracabilite,
            analyses: analysesAssociees
        };
    }
});

// 4. Enregistrement d'un nouvel échantillon
export const enregistrerEchantillon = mutation({
    args: {
        userId: v.id("users"),
        origine: v.union(v.literal("inspection"), v.literal("operateur"), v.literal("interne")),
        referenceSource: v.optional(v.string()),
        matrice: v.string(),
        description: v.string(),
        quantite: v.number(),
        unite: v.string(),
        datePrelevement: v.number(),
        lieuPrelevement: v.string(),
        prelevePar: v.optional(v.string()),
        temperature: v.optional(v.number()),
        dureeTransport: v.optional(v.number()),
        transportConforme: v.boolean(),
    },
    handler: async (ctx, args) => {
        const user = await checkLimsAccess(ctx, args.userId);

        // Génération automatique du code-barres LIMS ECH-YYYY-XXXXX
        const countMois = Math.floor(Math.random() * 89999) + 10000;
        const codeBarres = `ECH-${new Date().getFullYear()}-${countMois}`;

        const echantillonId = await ctx.db.insert("limsEchantillons", {
            codeBarres,
            dateReception: Date.now(),
            origine: args.origine,
            referenceSource: args.referenceSource,
            matrice: args.matrice,
            description: args.description,
            quantite: args.quantite,
            unite: args.unite,
            datePrelevement: args.datePrelevement,
            lieuPrelevement: args.lieuPrelevement,
            prelevePar: args.prelevePar,
            conditionsTransport: {
                temperature: args.temperature,
                duree: args.dureeTransport,
                conforme: args.transportConforme
            },
            receptionnePar: user._id,
            statut: "enregistre"
        });

        // Historique de traçabilité (Chaîne de possession)
        await ctx.db.insert("limsTracabilite", {
            echantillonId,
            dateLigne: args.datePrelevement,
            nomAgent: args.prelevePar || "Inspecteur/Opérateur",
            action: "Prélèvement de l'échantillon brut",
            lieu: args.lieuPrelevement
        });

        await ctx.db.insert("limsTracabilite", {
            echantillonId,
            dateLigne: Date.now(),
            agentId: user._id,
            nomAgent: `${user.prenom} ${user.nom}`,
            action: `Réception et validation d'intégrité (Temp: ${args.temperature}°C, Conformité transport: ${args.transportConforme ? 'Oui' : 'Non'})`,
            lieu: "Laboratoire LAA, Libreville"
        });

        await ctx.db.insert("limsTracabilite", {
            echantillonId,
            dateLigne: Date.now() + 1000,
            agentId: user._id,
            nomAgent: `${user.prenom} ${user.nom}`,
            action: `Création du dossier LIMS (Enregistrement informatique N° ${codeBarres})`,
            lieu: "Laboratoire LAA, Libreville"
        });

        return echantillonId;
    }
});
