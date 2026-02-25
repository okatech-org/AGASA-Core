import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper for generating random dates in the past
const randomDate = (daysAgoStart: number, daysAgoEnd: number) => {
  const start = Date.now() - (daysAgoStart * 24 * 60 * 60 * 1000);
  const end = Date.now() - (daysAgoEnd * 24 * 60 * 60 * 1000);
  return start + Math.random() * (end - start);
};

export default mutation({
  handler: async (ctx) => {
    console.log("Starting full seed for AGASA-Core...");

    // =========================================================================
    // 1. COMPTES DÉMO DE BASE
    // =========================================================================

    // Admin
    const existingAdmin = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", "demo-admin@agasa.ga")).first();
    if (!existingAdmin) {
      await ctx.db.insert("users", {
        firebaseUid: "demo-admin-uid", email: "demo-admin@agasa.ga", nom: "Système", prenom: "Admin", role: "demo", demoSimulatedRole: "admin_systeme", province: "Siège", statut: "actif", tentativesConnexion: 0, derniereConnexion: Date.now(), matricule: "AGASA-DEMO-001", dateCreation: Date.now(), dateModification: Date.now(), is2FAActif: false,
      });
    }

    // DG
    const existingDg = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", "demo-dg@agasa.ga")).first();
    if (!existingDg) {
      await ctx.db.insert("users", {
        firebaseUid: "demo-dg-uid", email: "demo-dg@agasa.ga", nom: "Général", prenom: "Directeur", role: "demo", demoSimulatedRole: "directeur_general", direction: "DG", province: "Siège", statut: "actif", tentativesConnexion: 0, derniereConnexion: Date.now(), matricule: "AGASA-DEMO-002", dateCreation: Date.now(), dateModification: Date.now(), is2FAActif: false,
      });
    }

    // Directeur
    const existingDir = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", "demo-directeur@agasa.ga")).first();
    if (!existingDir) {
      await ctx.db.insert("users", {
        firebaseUid: "demo-dir-uid", email: "demo-directeur@agasa.ga", nom: "DERSP", prenom: "Directeur", role: "demo", demoSimulatedRole: "directeur", direction: "DERSP", province: "Estuaire", statut: "actif", tentativesConnexion: 0, derniereConnexion: Date.now(), matricule: "AGASA-DEMO-003", dateCreation: Date.now(), dateModification: Date.now(), is2FAActif: false,
      });
    }

    // Agent (Self-service RH)
    const existingAgent = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", "demo-agent@agasa.ga")).first();
    let mainAgentId;
    if (!existingAgent) {
      mainAgentId = await ctx.db.insert("users", {
        firebaseUid: "demo-agent-uid", email: "demo-agent@agasa.ga", nom: "Moussavou", prenom: "Jean", role: "demo", demoSimulatedRole: "agent", direction: "DERSP", province: "Haut-Ogooué", statut: "actif", tentativesConnexion: 0, derniereConnexion: Date.now(), matricule: "AGASA-DEMO-004", dateCreation: Date.now(), dateModification: Date.now(), is2FAActif: false,
      });
      // Insert full agent file to test RH
      await ctx.db.insert("agents", {
        userId: mainAgentId,
        etatCivil: { dateNaissance: "1985-05-15", lieuNaissance: "Franceville", nationalite: "Gabonaise", situationFamiliale: "Marié(e)", nombreEnfants: 2, adresse: "Quartier Potos, Franceville", cni: "123456789" },
        poste: "Inspecteur Sanitaire", grade: "A1", echelon: 3, dateRecrutement: randomDate(1800, 1800), direction: "DERSP", service: "Inspection Frontalière", province: "Haut-Ogooué", competences: ["Inspection environnementale", "Normes HACCP"], contratType: "fonctionnaire", statut: "en_poste",
      });
    } else {
      mainAgentId = existingAgent._id;
    }

    // Technicien LAA
    const existingTech = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", "demo-technicien@agasa.ga")).first();
    if (!existingTech) {
      await ctx.db.insert("users", {
        firebaseUid: "demo-tech-uid", email: "demo-technicien@agasa.ga", nom: "Nzé", prenom: "Marie", role: "demo", demoSimulatedRole: "technicien_laa", direction: "LAA", province: "Estuaire", statut: "actif", tentativesConnexion: 0, derniereConnexion: Date.now(), matricule: "AGASA-DEMO-005", dateCreation: Date.now(), dateModification: Date.now(), is2FAActif: false,
      });
    }

    // Auditeur
    const existingAuditeur = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", "demo-auditeur@agasa.ga")).first();
    if (!existingAuditeur) {
      await ctx.db.insert("users", {
        firebaseUid: "demo-auditeur-uid", email: "demo-auditeur@agasa.ga", nom: "Externe", prenom: "Auditeur", role: "demo", demoSimulatedRole: "auditeur", province: "Siège", statut: "actif", tentativesConnexion: 0, derniereConnexion: Date.now(), matricule: "AGASA-DEMO-006", dateCreation: Date.now(), dateModification: Date.now(), is2FAActif: false,
      });
    }

    console.log("Demos accounts seeded.");

    const agentRecords = await ctx.db.query("agents").collect();
    // Proceed only if not yet seeded
    if (agentRecords.length > 5) return "Already fully seeded.";

    // =========================================================================
    // 2. RH : VRAIES DONNÉES FICTIVES (Agents, Congés, Paie, Formations)
    // =========================================================================
    console.log("Seeding RH...");
    const noms = ["Obiang", "Mba", "Ndong", "Ondo", "Mintsa", "Kombila", "Moussavou", "Nziengui", "Boussamba", "Ntsame"];
    const prenoms = ["Arthur", "Marc", "Chloé", "Léa", "Paul", "Julien", "Marie", "Sophie", "Jean", "Grace"];
    const provinces = ["Estuaire", "Haut-Ogooué", "Moyen-Ogooué", "Ngounié", "Nyanga", "Ogooué-Ivindo", "Ogooué-Lolo", "Ogooué-Maritime", "Woleu-Ntem", "Siège"] as const;
    const directions = ["DERSP", "DICSP", "DAF", "LAA"] as const;

    // 30 agents fictifs
    const newAgentUserIds = [];
    for (let i = 0; i < 30; i++) {
      const nom = noms[Math.floor(Math.random() * noms.length)];
      const prenom = prenoms[Math.floor(Math.random() * prenoms.length)];
      const direction = directions[Math.floor(Math.random() * directions.length)];
      const province = provinces[Math.floor(Math.random() * provinces.length)];

      const uid = await ctx.db.insert("users", {
        firebaseUid: `mock-agent-${i}`, email: `${prenom.toLowerCase()}.${nom.toLowerCase()}@agasa.ga`, nom, prenom, role: "agent", direction, province, statut: "actif", tentativesConnexion: 0, derniereConnexion: randomDate(1, 30), matricule: `AGASA-2024-00${10 + i}`, dateCreation: randomDate(100, 300), dateModification: Date.now(), is2FAActif: false,
      });
      newAgentUserIds.push(uid);

      await ctx.db.insert("agents", {
        userId: uid,
        etatCivil: { dateNaissance: "1990-01-01", lieuNaissance: "Libreville", nationalite: "Gabonaise", situationFamiliale: "Célibataire", nombreEnfants: 1, adresse: "Libreville", cni: "12345" },
        poste: "Agent technique", grade: "B2", echelon: 1, dateRecrutement: randomDate(365, 1095), direction, service: "Général", province, competences: [], contratType: "fonctionnaire", statut: "en_poste",
      });
    }

    // 5 Demandes de congés pour mainAgentId
    const agentProfile = await ctx.db.query("agents").withIndex("by_userId", (q) => q.eq("userId", mainAgentId)).first();
    if (agentProfile) {
      await ctx.db.insert("conges", { agentId: agentProfile._id, type: "annuel", dateDebut: randomDate(-30, -15), dateFin: randomDate(-15, -1), nombreJours: 15, motif: "Repos annuel", statut: "approuve_drh" });
      await ctx.db.insert("conges", { agentId: agentProfile._id, type: "maladie", dateDebut: randomDate(10, 15), dateFin: randomDate(5, 10), nombreJours: 5, motif: "Paludisme", statut: "approuve_n1" });
      await ctx.db.insert("conges", { agentId: agentProfile._id, type: "annuel", dateDebut: randomDate(-60, -45), dateFin: randomDate(-45, -30), nombreJours: 15, motif: "Congés anticipés", statut: "brouillon" });
      await ctx.db.insert("conges", { agentId: agentProfile._id, type: "formation", dateDebut: randomDate(-90, -80), dateFin: randomDate(-80, -70), nombreJours: 10, motif: "Certification", statut: "refuse", commentaireRefus: "Période de forte activité" });
      await ctx.db.insert("conges", { agentId: agentProfile._id, type: "exceptionnel", dateDebut: randomDate(-10, -5), dateFin: randomDate(-5, -2), nombreJours: 3, motif: "Mariage", statut: "soumis" });
    }

    // 10 Bulletins de paie
    if (agentProfile) {
      for (let i = 1; i <= 10; i++) {
        await ctx.db.insert("paie", { agentId: agentProfile._id, mois: i, annee: 2025, salaireBase: 450000, primesTerrain: 50000, indemnitesProvinciales: 25000, autresPrimes: 0, retenueCNSS: 12500, retenueImpot: 35000, autresRetenues: 0, netAPayer: 477500, dateGeneration: randomDate(300 - (i * 30), 280 - (i * 30)), statut: "paye" });
      }
    }

    // Formations
    const f1Id = await ctx.db.insert("formations", { titre: "Sensibilisation ISO 22000", description: "Bases du management de la sécurité des denrées alimentaires.", categorie: "ISO_22000", duree: 14, formateur: "Cabinet QSE", lieu: "Siège (Salle de Réunion)", dateDebut: randomDate(-20, -22), dateFin: randomDate(-18, -20), capaciteMax: 20, statut: "planifiee" });
    await ctx.db.insert("formations", { titre: "Techniques d'Écouvillonnage", description: "Prélèvement de surface en milieu industriel.", categorie: "HACCP", duree: 7, formateur: "Expert LAA", lieu: "Port-Gentil", dateDebut: randomDate(30, 31), dateFin: randomDate(31, 32), capaciteMax: 10, statut: "terminee" });
    await ctx.db.insert("formations", { titre: "Nouvel Outil AGASA-Core", description: "Prise en main des modules du nouveau hub numérique.", categorie: "culture_numerique", duree: 3, formateur: "NTSAGUI Digital", lieu: "En ligne", dateDebut: randomDate(-5, -6), dateFin: randomDate(-4, -5), capaciteMax: 100, statut: "planifiee" });

    // =========================================================================
    // 3. LOGISTIQUE & EQUIPEMENTS
    // =========================================================================
    console.log("Seeding Logistique...");
    const vehicules = [
      { immatriculation: "GE-451-AB", marque: "Toyota", modele: "Hilux", annee: 2021, type: "inspection", province: "Estuaire", kilometrage: 45000, statut: "en_mission" },
      { immatriculation: "GE-892-CD", marque: "Ford", modele: "Ranger", annee: 2019, type: "inspection", province: "Woleu-Ntem", kilometrage: 82000, statut: "disponible" },
      { immatriculation: "GE-101-FR", marque: "Peugeot", modele: "Boxer Frigo", annee: 2018, type: "frigorifique", province: "Ogooué-Maritime", kilometrage: 120000, statut: "en_maintenance" },
      { immatriculation: "GE-555-ZZ", marque: "Nissan", modele: "Navara", annee: 2022, type: "inspection", province: "Ngounié", kilometrage: 25000, statut: "disponible" },
      { immatriculation: "GE-001-DG", marque: "Toyota", modele: "Prado", annee: 2023, type: "administratif", province: "Siège", kilometrage: 12000, statut: "disponible" }
    ] as const;
    for (const v of vehicules) {
      await ctx.db.insert("vehicules", { ...v });
    }

    // =========================================================================
    // 4. LIMS (Laboratoire)
    // =========================================================================
    console.log("Seeding LIMS...");
    const paramIds = [];
    const paramsDef = [
      { c: "MB-01", n: "Salmonella spp", cat: "microbiologique", unit: "UFC/g", seuil: 0, norme: "ISO 6579" },
      { c: "MB-02", n: "Listeria monocytogenes", cat: "microbiologique", unit: "UFC/g", seuil: 100, norme: "ISO 11290" },
      { c: "CH-01", n: "Cadmium (Cd)", cat: "chimique", unit: "mg/kg", seuil: 0.1, norme: "Codex Stan 193-1995" },
      { c: "PH-01", n: "Histamine", cat: "physique", unit: "mg/kg", seuil: 100, norme: "Reg CE 2073/2005" },
    ] as const;

    for (const p of paramsDef) {
      const pid = await ctx.db.insert("parametresAnalyse", { code: p.c, nom: p.n, categorie: p.cat, methode: "Standard", unite: p.unit, limiteQuantification: 0.01, seuilReglementaire: p.seuil, normeReference: p.norme, equipementRequis: "Générique", delaiJours: 5 });
      paramIds.push(pid);
    }

    const matrices = ["viande", "poisson", "eau", "fruit_legume", "produit_laitier"] as const;
    for (let i = 1; i <= 20; i++) {
      const echId = await ctx.db.insert("echantillons", {
        codeBarres: `ECH-2026-${1000 + i}`, origine: "inspection", origineRef: `INSP-${8000 + i}`, matrice: matrices[i % 5], description: "Prélèvement de contrôle de routine", quantite: 1, unite: "kg", datePrelevement: randomDate(10, 20), lieuPrelevement: "Marché et Supermarchés", conditionsTransport: { temperature: 4, duree: 2, conformite: true }, statut: (i % 3 === 0) ? "analyse_terminee" : "en_analyse", chainesPossession: []
      });

      // 2 analyses per sample
      await ctx.db.insert("analyses", {
        echantillonId: echId, parametreId: paramIds[i % 4], methodeAccreditee: "Oui", posteAnalytique: "Labo Central", unite: "mg/kg", limiteQuantification: 0.01, seuilReglementaire: paramsDef[i % 4].seuil, incertitude: "±5%", normeReference: paramsDef[i % 4].norme, conformite: (i % 6 === 0) ? "non_conforme" : "conforme", statut: (i % 3 === 0) ? "valide_resp" : "en_cours", resultatFinal: (i % 6 === 0) ? paramsDef[i % 4].seuil * 1.5 : paramsDef[i % 4].seuil * 0.5
      });
      await ctx.db.insert("analyses", {
        echantillonId: echId, parametreId: paramIds[(i + 1) % 4], methodeAccreditee: "Oui", posteAnalytique: "Labo Central", unite: "mg/kg", limiteQuantification: 0.01, seuilReglementaire: paramsDef[(i + 1) % 4].seuil, incertitude: "±5%", normeReference: paramsDef[(i + 1) % 4].norme, conformite: "conforme", statut: (i % 3 === 0) ? "valide_resp" : "en_cours", resultatFinal: paramsDef[(i + 1) % 4].seuil * 0.2
      });
    }

    // =========================================================================
    // 5. ALERTES & SIGNALEMENTS
    // =========================================================================
    console.log("Seeding Alertes...");
    await ctx.db.insert("alertes", { titre: "Présence d'aflatoxines dans arachides", description: "Lot importé d'arachides grillées présentant des taux d'aflatoxines dépassant la norme.", type: "chimique", source: "labo", zoneGeographique: "Estuaire", niveau: "urgence", statut: "confirmee", assigneeA: "DICSP", dateCreation: randomDate(2, 3), actions: [] });
    await ctx.db.insert("alertes", { titre: "Gastro-entérite collective", description: "Signalements multiples suite à la consommation d'un buffet lors d'un mariage.", type: "biologique", source: "signalement_citoyen", zoneGeographique: "Ogooué-Maritime", niveau: "alerte", statut: "en_verification", assigneeA: "DERSP", dateCreation: randomDate(1, 2), actions: [] });
    for (let i = 0; i < 6; i++) {
      await ctx.db.insert("alertes", { titre: `Alerte mineure #${i}`, description: "Analyse environnementale de routine", type: "physique", source: "interne", zoneGeographique: "Ngounié", niveau: "information", statut: "resolue", assigneeA: "LAA", dateCreation: randomDate(30, 60), actions: [] });
    }

    for (let i = 0; i < 10; i++) {
      await ctx.db.insert("signalementsCitoyens", {
        reference: `SIG-2026-${500 + i}`, description: "La viande exposée semble avariée et comporte des mouches.", photos: [], adresse: "Marché Mont-Bouët, Libreville", categorie: "hygiene", anonyme: false, statut: i % 2 === 0 ? "en_verification" : "traite", provinceAssignee: "Estuaire", dateReception: randomDate(2, 10)
      });
    }

    // =========================================================================
    // 6. FINANCE (Redevances)
    // =========================================================================
    console.log("Seeding Finance...");
    for (let i = 0; i < 20; i++) {
      await ctx.db.insert("redevances", {
        type: ["agrement", "importation", "analyse", "amende"][i % 4] as "agrement" | "importation" | "analyse" | "amende",
        reference: `FAC-2026-${1000 + i}`, montant: 50000 + (Math.random() * 150000), dateEcheance: randomDate(-15, 15), sourceApp: "agasa_pro", sourceRef: `CMD-${i}`, operateur: `Supermarché ${String.fromCharCode(65 + i)}`, statut: i % 4 === 0 ? "paye" : (i % 3 === 0 ? "en_retard" : "en_attente"), provinceOrigine: "Estuaire"
      });
    }

    // =========================================================================
    // 7. GED
    // =========================================================================
    console.log("Seeding GED...");
    for (let i = 0; i < 15; i++) {
      await ctx.db.insert("documents", {
        titre: `Note de service N°${100 + i}/DG`, description: "Rappel des procédures de contrôle", type: "note_service", fichierUrl: "https://example.com/doc.pdf", fichierNom: "note_service.pdf", fichierTaille: 1024000, fichierType: "application/pdf", emetteur: "Direction Générale", destinataires: ["Toutes directions"], directionEmettrice: "DG", reference: `NS-${100 + i}`, dateDocument: randomDate(5, 50), tags: ["interne", "process"], confidentiel: false, archivage: { dureeRetention: 5 }, statut: "traite"
      });
    }

    // =========================================================================
    // 8. BI
    // =========================================================================
    console.log("Seeding BI...");
    for (let m = 1; m <= 3; m++) {
      await ctx.db.insert("kpiSnapshots", {
        date: Date.now() - (m * 30 * 24 * 60 * 60 * 1000), province: "National", direction: "Globale", inspectionsRealisees: 1250 - (m * 50), tauxConformite: 82 + m, tonnagesSaisis: 15, valeurSaisies: 12500000, delaiMoyenAgrement: 14, tauxRecouvrement: 75, revenusParPilier: JSON.stringify({ agrements: 45, importations: 40, analyses: 15 }), nombreAlertes: 5, nombreSignalements: 25
      });
    }

    console.log("Seed completed successfully.");
    return "Seed completed.";
  },
});
