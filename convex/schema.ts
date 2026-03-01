import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ============================================================================
// AGASA-Core — Schéma Convex Complet (Prompt 0.2)
// ============================================================================

export default defineSchema({
    // ============================================================================
    // === AUTHENTIFICATION & UTILISATEURS ===
    // ============================================================================
    users: defineTable({
        firebaseUid: v.string(),
        email: v.string(),
        nom: v.string(),
        prenom: v.string(),
        role: v.union(
            v.literal("admin_systeme"),
            v.literal("directeur_general"),
            v.literal("directeur"),
            v.literal("chef_service"),
            v.literal("agent"),
            v.literal("technicien_laa"),
            v.literal("auditeur"),
            v.literal("demo")
        ),
        direction: v.optional(
            v.union(
                v.literal("DG"),
                v.literal("DERSP"),
                v.literal("DICSP"),
                v.literal("DAF"),
                v.literal("LAA")
            )
        ),
        province: v.union(
            v.literal("Estuaire"),
            v.literal("Haut-Ogooué"),
            v.literal("Moyen-Ogooué"),
            v.literal("Ngounié"),
            v.literal("Nyanga"),
            v.literal("Ogooué-Ivindo"),
            v.literal("Ogooué-Lolo"),
            v.literal("Ogooué-Maritime"),
            v.literal("Woleu-Ntem"),
            v.literal("Siège")
        ),
        statut: v.union(
            v.literal("actif"),
            v.literal("inactif"),
            v.literal("verrouille")
        ),
        tentativesConnexion: v.number(),
        derniereConnexion: v.number(),
        avatar: v.optional(v.string()),
        telephone: v.optional(v.string()),
        matricule: v.string(), // ex: "AGASA-2024-0001"
        dateCreation: v.number(),
        dateModification: v.number(),
        creePar: v.optional(v.id("users")),
        is2FAActif: v.boolean(),
        permissions: v.optional(v.array(v.string())),
        demoSimulatedRole: v.optional(v.string()), // Pour les comptes de démo uniquement
    })
        .index("by_firebaseUid", ["firebaseUid"])
        .index("by_email", ["email"])
        .index("by_role", ["role"])
        .index("by_direction", ["direction"])
        .index("by_province", ["province"])
        .index("by_matricule", ["matricule"]),

    sessions: defineTable({
        userId: v.id("users"),
        token: v.string(),
        ipAddress: v.string(),
        userAgent: v.string(),
        expiresAt: v.number(),
        createdAt: v.number(),
    }).index("by_userId", ["userId"]),

    auditLogs: defineTable({
        userId: v.id("users"),
        action: v.string(),
        module: v.string(),
        details: v.string(),
        ipAddress: v.string(),
        userAgent: v.string(),
        timestamp: v.number(),
        entiteType: v.optional(v.string()),
        entiteId: v.optional(v.string()),
    })
        .index("by_userId", ["userId"])
        .index("by_module", ["module"])
        .index("by_timestamp", ["timestamp"]),

    // ============================================================================
    // === MODULE RH ===
    // ============================================================================
    agents: defineTable({
        userId: v.id("users"),
        etatCivil: v.object({
            dateNaissance: v.string(),
            lieuNaissance: v.string(),
            nationalite: v.string(),
            situationFamiliale: v.string(),
            nombreEnfants: v.number(),
            adresse: v.string(),
            cni: v.string(),
        }),
        poste: v.string(),
        grade: v.string(),
        echelon: v.number(),
        dateRecrutement: v.number(),
        dateIntegration: v.optional(v.number()),
        direction: v.string(),
        service: v.string(),
        province: v.string(),
        competences: v.array(v.string()),
        contratType: v.union(
            v.literal("fonctionnaire"),
            v.literal("contractuel"),
            v.literal("vacataire")
        ),
        statut: v.union(
            v.literal("en_poste"),
            v.literal("détaché"),
            v.literal("suspendu"),
            v.literal("retraité")
        ),
        documents: v.optional(v.array(v.object({
            id: v.id("_storage"),
            nom: v.string(),
            type: v.string(),
            dateAjout: v.number(),
            ajoutePar: v.id("users")
        }))),
    }).index("by_userId", ["userId"]),

    evaluations: defineTable({
        agentId: v.id("agents"),
        evaluateurId: v.id("users"),
        periode: v.string(), // ex: "2025"
        note: v.number(), // /20
        appreciation: v.string(),
        objectifs: v.array(v.string()),
        recommandations: v.array(v.string()),
        dateEvaluation: v.number(),
    }).index("by_agentId", ["agentId"]),

    conges: defineTable({
        agentId: v.id("agents"),
        type: v.union(
            v.literal("annuel"),
            v.literal("maladie"),
            v.literal("formation"),
            v.literal("maternite"),
            v.literal("paternite"),
            v.literal("exceptionnel")
        ),
        dateDebut: v.number(),
        dateFin: v.number(),
        nombreJours: v.number(),
        motif: v.string(),
        statut: v.union(
            v.literal("brouillon"),
            v.literal("soumis"),
            v.literal("approuve_n1"),
            v.literal("approuve_drh"),
            v.literal("refuse"),
            v.literal("annule")
        ),
        validePar: v.optional(v.id("users")),
        dateValidation: v.optional(v.number()),
        commentaireRefus: v.optional(v.string()),
    })
        .index("by_agentId", ["agentId"])
        .index("by_statut", ["statut"]),

    formations: defineTable({
        titre: v.string(),
        description: v.string(),
        categorie: v.union(
            v.literal("HACCP"),
            v.literal("ISO_22000"),
            v.literal("ISO_17025"),
            v.literal("culture_numerique"),
            v.literal("securite"),
            v.literal("management"),
            v.literal("autre")
        ),
        duree: v.number(), // heures
        formateur: v.string(),
        lieu: v.string(),
        dateDebut: v.number(),
        dateFin: v.number(),
        capaciteMax: v.number(),
        statut: v.union(
            v.literal("planifiee"),
            v.literal("en_cours"),
            v.literal("terminee"),
            v.literal("annulee")
        ),
    }),

    inscriptionsFormation: defineTable({
        formationId: v.id("formations"),
        agentId: v.id("agents"),
        statut: v.union(
            v.literal("inscrit"),
            v.literal("confirme"),
            v.literal("present"),
            v.literal("absent"),
            v.literal("certifie")
        ),
        dateInscription: v.number(),
        certificatUrl: v.optional(v.string()),
    }).index("by_formationId", ["formationId"]).index("by_agentId", ["agentId"]),

    paie: defineTable({
        agentId: v.id("agents"),
        mois: v.number(), // 1-12
        annee: v.number(),
        salaireBase: v.number(),
        primesTerrain: v.number(),
        indemnitesProvinciales: v.number(),
        autresPrimes: v.number(),
        retenueCNSS: v.number(),
        retenueImpot: v.number(),
        autresRetenues: v.number(),
        netAPayer: v.number(),
        dateGeneration: v.number(),
        statut: v.union(
            v.literal("calcule"),
            v.literal("valide"),
            v.literal("paye")
        ),
        bulletinPdfUrl: v.optional(v.string()),
    }).index("by_agentId", ["agentId"]),

    // ============================================================================
    // === MODULE FINANCE ===
    // ============================================================================
    lignesBudgetaires: defineTable({
        code: v.string(),
        libelle: v.string(),
        programme: v.string(),
        direction: v.string(),
        province: v.string(),
        montantAlloue: v.number(),
        montantEngage: v.number(),
        montantConsomme: v.number(),
        montantDisponible: v.number(),
        exercice: v.number(),
    }).index("by_exercice", ["exercice"]).index("by_direction", ["direction"]),

    redevances: defineTable({
        type: v.union(
            v.literal("agrement"),
            v.literal("importation"),
            v.literal("analyse"),
            v.literal("phyto"),
            v.literal("amende")
        ),
        reference: v.string(),
        montant: v.number(),
        dateEcheance: v.number(),
        sourceApp: v.union(
            v.literal("agasa_pro"),
            v.literal("agasa_inspect"),
            v.literal("interne")
        ),
        sourceRef: v.string(), // ID externe
        operateur: v.string(),
        statut: v.union(
            v.literal("en_attente"),
            v.literal("paye"),
            v.literal("en_retard"),
            v.literal("relance_j15"),
            v.literal("relance_j30"),
            v.literal("recouvrement_force"),
            v.literal("annule")
        ),
        datePaiement: v.optional(v.number()),
        modePaiement: v.optional(v.string()),
        provinceOrigine: v.string(),
    })
        .index("by_statut", ["statut"])
        .index("by_type", ["type"])
        .index("by_province", ["provinceOrigine"])
        .index("by_dateEcheance", ["dateEcheance"]),

    ecrituresComptables: defineTable({
        reference: v.string(),
        dateEcriture: v.number(),
        libelle: v.string(),
        debit: v.number(),
        credit: v.number(),
        compte: v.string(),
        journal: v.string(),
        redevanceId: v.optional(v.id("redevances")),
        pieceJustificative: v.optional(v.string()),
        exercice: v.number(),
        rapprochement: v.boolean(),
    }).index("by_exercice", ["exercice"]).index("by_journal", ["journal"]),

    paiements: defineTable({
        reference: v.string(),
        nomOperateur: v.string(),
        montant: v.number(),
        mode: v.string(), // "mobile_money", "virement", "carte", "especes"
        datePaiement: v.number(),
        statut: v.union(v.literal("en_attente"), v.literal("valide"), v.literal("erreur")),
        redevanceId: v.optional(v.id("redevances")),
    }).index("by_statut", ["statut"]),

    rapprochementsBancaires: defineTable({
        date: v.number(),
        banque: v.string(),
        soldeReleve: v.number(),
        soldeSysteme: v.number(),
        ecart: v.number(),
        statut: v.string(),
        observations: v.string(),
    }),

    // ============================================================================
    // === MODULE GED ===
    // ============================================================================
    documents: defineTable({
        titre: v.string(),
        description: v.string(),
        type: v.union(
            v.literal("courrier_entrant"),
            v.literal("courrier_sortant"),
            v.literal("decision"),
            v.literal("note_service"),
            v.literal("rapport"),
            v.literal("reglementaire"),
            v.literal("autre")
        ),
        fichierUrl: v.string(),
        fichierNom: v.string(),
        fichierTaille: v.number(),
        fichierType: v.string(),
        emetteur: v.string(),
        destinataires: v.array(v.string()),
        directionEmettrice: v.string(),
        reference: v.string(),
        dateDocument: v.number(),
        tags: v.array(v.string()),
        confidentiel: v.boolean(),
        archivage: v.object({
            dureeRetention: v.number(), // années
            dateArchivage: v.optional(v.number()),
            dateDestruction: v.optional(v.number()),
        }),
        statut: v.union(
            v.literal("recu"),
            v.literal("en_traitement"),
            v.literal("traite"),
            v.literal("archive")
        ),
    })
        .index("by_type", ["type"])
        .index("by_direction", ["directionEmettrice"])
        .index("by_statut", ["statut"]),

    signaturesElectroniques: defineTable({
        documentId: v.id("documents"),
        signataireId: v.id("users"),
        dateSignature: v.optional(v.number()),
        certificat: v.optional(v.string()),
        horodatage: v.optional(v.number()),
        statut: v.union(
            v.literal("en_attente"),
            v.literal("signe"),
            v.literal("refuse")
        ),
    }).index("by_documentId", ["documentId"]),

    workflowsValidation: defineTable({
        documentId: v.id("documents"),
        type: v.union(
            v.literal("marche_public"),
            v.literal("decision"),
            v.literal("courrier"),
            v.literal("autre")
        ),
        etapes: v.array(
            v.object({
                ordre: v.number(),
                valideurId: v.id("users"),
                statut: v.union(
                    v.literal("en_attente"),
                    v.literal("approuve"),
                    v.literal("refuse")
                ),
                dateAction: v.optional(v.number()),
                commentaire: v.optional(v.string()),
            })
        ),
        seuilMontant: v.optional(v.number()),
        statutGlobal: v.union(
            v.literal("en_cours"),
            v.literal("approuve"),
            v.literal("refuse"),
            v.literal("annule")
        ),
    }).index("by_documentId", ["documentId"]),

    // ============================================================================
    // === MODULE LOGISTIQUE ===
    // ============================================================================
    vehicules: defineTable({
        immatriculation: v.string(),
        marque: v.string(),
        modele: v.string(),
        type: v.union(v.literal("inspection"), v.literal("frigorifique"), v.literal("administratif")),
        annee: v.number(),
        province: v.string(),
        kilometrage: v.number(),
        statut: v.union(v.literal("disponible"), v.literal("en_mission"), v.literal("en_maintenance"), v.literal("hors_service")),
        prochaineMaintenanceKm: v.optional(v.number()),
        prochaineMaintenanceDate: v.optional(v.number()),
        photoUrl: v.optional(v.string()),
    }).index("by_statut", ["statut"]).index("by_province", ["province"]),

    missionsVehicules: defineTable({
        vehiculeId: v.id("vehicules"),
        conducteurId: v.id("agents"),
        destination: v.string(),
        motif: v.string(),
        dateDepart: v.number(),
        dateRetourPrevue: v.number(),
        dateRetourEffective: v.optional(v.number()),
        kmDepart: v.number(),
        kmRetour: v.optional(v.number()),
        observations: v.optional(v.string()),
        statut: v.union(v.literal("planifiee"), v.literal("en_cours"), v.literal("terminee"), v.literal("annulee")),
    }).index("by_vehiculeId", ["vehiculeId"]).index("by_statut", ["statut"]),

    stocks: defineTable({
        reference: v.string(),
        designation: v.string(),
        categorie: v.union(v.literal("reactif"), v.literal("consommable"), v.literal("equipement"), v.literal("piece_rechange")),
        quantite: v.number(),
        seuilAlerte: v.number(),
        unite: v.string(),
        fournisseur: v.string(),
        datePeremption: v.optional(v.number()),
        statut: v.union(v.literal("ok"), v.literal("alerte"), v.literal("rupture"), v.literal("perime")),
    }).index("by_categorie", ["categorie"]).index("by_statut", ["statut"]),

    mouvementsStock: defineTable({
        articleId: v.id("stocks"),
        type: v.union(v.literal("entree"), v.literal("sortie"), v.literal("ajustement")),
        quantite: v.number(),
        motif: v.string(),
        dateMouvement: v.number(),
        agentId: v.id("agents"),
    }).index("by_articleId", ["articleId"]),

    equipements: defineTable({
        reference: v.string(),
        designation: v.string(),
        type: v.union(v.literal("spectrometre"), v.literal("chromatographe"), v.literal("balance"), v.literal("autre")),
        marque: v.string(),
        modele: v.string(),
        laboratoire: v.string(),
        dateAcquisition: v.number(),
        derniereCalibration: v.optional(v.number()),
        prochaineCalibration: v.optional(v.number()),
        statut: v.union(v.literal("operationnel"), v.literal("en_maintenance"), v.literal("en_panne"), v.literal("reforme")),
    }).index("by_statut", ["statut"]).index("by_type", ["type"]),

    maintenances: defineTable({
        vehiculeId: v.optional(v.id("vehicules")),
        equipementId: v.optional(v.id("equipements")),
        type: v.union(v.literal("preventive"), v.literal("corrective"), v.literal("calibration")),
        dateIntervention: v.number(),
        description: v.string(),
        technicien: v.string(),
        cout: v.optional(v.number()),
        statut: v.union(v.literal("planifiee"), v.literal("en_cours"), v.literal("terminee")),
    }),

    // ============================================================================
    // === MODULE LIMS ===
    // ============================================================================
    echantillons: defineTable({
        codeBarres: v.string(), // "ECH-2026-XXXXX"
        origine: v.union(
            v.literal("inspection"),
            v.literal("operateur"),
            v.literal("interne")
        ),
        origineRef: v.string(),
        matrice: v.union(
            v.literal("viande"),
            v.literal("poisson"),
            v.literal("cereale"),
            v.literal("fruit_legume"),
            v.literal("produit_laitier"),
            v.literal("eau"),
            v.literal("autre")
        ),
        description: v.string(),
        quantite: v.number(),
        unite: v.string(),
        datePrelevement: v.number(),
        lieuPrelevement: v.string(),
        inspecteurId: v.optional(v.id("users")),
        conditionsTransport: v.object({
            temperature: v.number(),
            duree: v.number(), // heures
            conformite: v.boolean(),
        }),
        dateReception: v.optional(v.number()),
        receptionnePar: v.optional(v.id("users")),
        statut: v.union(
            v.literal("recu"),
            v.literal("enregistre"),
            v.literal("en_analyse"),
            v.literal("analyse_terminee"),
            v.literal("valide"),
            v.literal("archive"),
            v.literal("detruit")
        ),
        chainesPossession: v.array(
            v.object({
                date: v.number(),
                agent: v.string(),
                action: v.string(),
                lieu: v.string(),
            })
        ),
    })
        .index("by_codeBarres", ["codeBarres"])
        .index("by_statut", ["statut"])
        .index("by_origine", ["origine"]),

    analyses: defineTable({
        echantillonId: v.id("echantillons"),
        parametreId: v.id("parametresAnalyse"),
        methodeAccreditee: v.string(),
        posteAnalytique: v.string(),
        resultatBrut: v.optional(v.number()),
        resultatFinal: v.optional(v.number()),
        unite: v.string(),
        limiteQuantification: v.number(),
        incertitude: v.string(),
        normeReference: v.string(),
        seuilReglementaire: v.number(),
        conformite: v.union(
            v.literal("conforme"),
            v.literal("non_conforme"),
            v.literal("indetermine")
        ),
        technicienId: v.optional(v.id("users")),
        dateAnalyse: v.optional(v.number()),
        dateValidation: v.optional(v.number()),
        validePar: v.optional(v.id("users")),
        statut: v.union(
            v.literal("assignee"),
            v.literal("en_cours"),
            v.literal("resultat_saisi"),
            v.literal("valide_tech"),
            v.literal("valide_resp"),
            v.literal("publie")
        ),
    })
        .index("by_echantillonId", ["echantillonId"])
        .index("by_statut", ["statut"])
        .index("by_technicienId", ["technicienId"]),

    parametresAnalyse: defineTable({
        code: v.string(),
        nom: v.string(),
        categorie: v.union(
            v.literal("microbiologique"),
            v.literal("chimique"),
            v.literal("physique"),
            v.literal("organoleptique")
        ),
        methode: v.string(),
        unite: v.string(),
        limiteQuantification: v.number(),
        seuilReglementaire: v.number(),
        normeReference: v.string(),
        equipementRequis: v.string(),
        delaiJours: v.number(),
    }),

    rapportsAnalyse: defineTable({
        echantillonId: v.id("echantillons"),
        reference: v.string(),
        dateRapport: v.number(),
        contenu: v.string(), // JSON stringifié
        signePar: v.optional(v.id("users")),
        dateSignature: v.optional(v.number()),
        pdfUrl: v.optional(v.string()),
        statut: v.union(
            v.literal("brouillon"),
            v.literal("signe"),
            v.literal("envoye")
        ),
        destinataireApp: v.union(v.literal("agasa_pro"), v.null()),
        destinataireRef: v.optional(v.string()),
    }),

    controleQualite: defineTable({
        type: v.union(
            v.literal("carte_controle"),
            v.literal("essai_interlabo"),
            v.literal("etalon")
        ),
        parametreId: v.id("parametresAnalyse"),
        valeurAttendue: v.number(),
        valeurObtenue: v.number(),
        ecart: v.number(),
        dateControle: v.number(),
        technicienId: v.id("users"),
        conforme: v.boolean(),
    }),

    nonConformites: defineTable({
        type: v.union(
            v.literal("analyse"),
            v.literal("equipement"),
            v.literal("processus")
        ),
        description: v.string(),
        causeRacine: v.optional(v.string()),
        actionCorrective: v.optional(v.string()),
        responsableId: v.id("users"),
        dateDetection: v.number(),
        dateResolution: v.optional(v.number()),
        statut: v.union(
            v.literal("ouverte"),
            v.literal("en_traitement"),
            v.literal("resolue"),
            v.literal("close")
        ),
    }),

    // ============================================================================
    // === MODULE ALERTES ===
    // ============================================================================
    alertes: defineTable({
        titre: v.string(),
        description: v.string(),
        type: v.union(
            v.literal("biologique"),
            v.literal("chimique"),
            v.literal("physique")
        ),
        source: v.union(
            v.literal("signalement_citoyen"),
            v.literal("inspection"),
            v.literal("labo"),
            v.literal("cemac"),
            v.literal("interne")
        ),
        sourceRef: v.optional(v.string()),
        zoneGeographique: v.string(),
        niveau: v.union(
            v.literal("information"),
            v.literal("vigilance"),
            v.literal("alerte"),
            v.literal("urgence")
        ),
        statut: v.union(
            v.literal("nouvelle"),
            v.literal("en_verification"),
            v.literal("confirmee"),
            v.literal("resolue"),
            v.literal("archivee")
        ),
        assigneeA: v.string(),
        dateCreation: v.number(),
        dateConfirmation: v.optional(v.number()),
        dateResolution: v.optional(v.number()),
        actions: v.array(
            v.object({
                date: v.number(),
                action: v.string(),
                responsable: v.string(),
            })
        ),
    })
        .index("by_statut", ["statut"])
        .index("by_type", ["type"])
        .index("by_province", ["zoneGeographique"]),

    rappelsProduits: defineTable({
        alerteId: v.optional(v.id("alertes")),
        produit: v.string(),
        marque: v.string(),
        lot: v.string(),
        motif: v.string(),
        actionRecommandee: v.string(),
        pointsVenteConcernes: v.array(v.string()),
        cannauxDiffusion: v.object({
            sms: v.boolean(),
            push: v.boolean(),
            portail: v.boolean(),
            reseauxSociaux: v.boolean(),
        }),
        statut: v.union(
            v.literal("en_preparation"),
            v.literal("diffuse"),
            v.literal("en_cours"),
            v.literal("termine")
        ),
        dateCreation: v.number(),
        dateDiffusion: v.optional(v.number()),
    }),

    signalementsCitoyens: defineTable({
        reference: v.string(),
        description: v.string(),
        photos: v.array(v.string()), // URLs
        gpsLatitude: v.optional(v.number()),
        gpsLongitude: v.optional(v.number()),
        adresse: v.string(),
        categorie: v.union(
            v.literal("produit_suspect"),
            v.literal("hygiene"),
            v.literal("intoxication"),
            v.literal("etablissement"),
            v.literal("autre")
        ),
        anonyme: v.boolean(),
        signaleurRef: v.optional(v.string()),
        statut: v.union(
            v.literal("recu"),
            v.literal("en_verification"),
            v.literal("confirme"),
            v.literal("infonde"),
            v.literal("traite")
        ),
        provinceAssignee: v.string(),
        agentAssigne: v.optional(v.id("users")),
        dateReception: v.number(),
        dateTraitement: v.optional(v.number()),
    }),

    cemacAlertes: defineTable({
        reference: v.string(), // Numéro RASFF régional
        paysEmetteur: v.union(
            v.literal("Gabon"),
            v.literal("Cameroun"),
            v.literal("Congo"),
            v.literal("Tchad"),
            v.literal("RCA"),
            v.literal("Guinee_Equatoriale")
        ),
        dateNotification: v.number(),
        produit: v.string(),
        dangerId: v.string(), // Bactérie, toxine, corps étranger
        niveauRisque: v.union(
            v.literal("faible"),
            v.literal("moyen"),
            v.literal("eleve"),
            v.literal("grave")
        ),
        actionRequise: v.string(),
        paysImpactes: v.array(v.string()),
        statut: v.union(
            v.literal("recue"),
            v.literal("emise"),
            v.literal("traitee"),
            v.literal("archivee")
        ),
        alerteNationaleLiee: v.optional(v.id("alertes")),
    }).index("by_statut", ["statut"]).index("by_paysEmetteur", ["paysEmetteur"]),

    // ============================================================================
    // === MODULE BI ===
    // ============================================================================
    kpiSnapshots: defineTable({
        date: v.number(), // Timestamp de la période (ex: début du mois)
        province: v.string(),
        direction: v.string(),
        inspectionsRealisees: v.number(),
        tauxConformite: v.number(), // %
        tonnagesSaisis: v.number(), // kg/tonnes
        valeurSaisies: v.number(), // FCFA
        delaiMoyenAgrement: v.number(), // jours
        tauxRecouvrement: v.number(), // %
        revenusParPilier: v.string(), // JSON stringifié
        nombreAlertes: v.number(),
        nombreSignalements: v.number(),
    }),

    // ============================================================================
    // === API GATEWAY ===
    // ============================================================================
    fluxInterApps: defineTable({
        fluxCode: v.union(
            v.literal("F1"),
            v.literal("F2"),
            v.literal("F3"),
            v.literal("F4"),
            v.literal("F5"),
            v.literal("F6")
        ),
        sourceApp: v.string(),
        destinationApp: v.string(),
        typeMessage: v.string(),
        payload: v.string(), // JSON stringifié
        statut: v.union(
            v.literal("envoye"),
            v.literal("recu"),
            v.literal("traite"),
            v.literal("erreur")
        ),
        dateEnvoi: v.number(),
        dateReception: v.optional(v.number()),
        dateTraitement: v.optional(v.number()),
        tentatives: v.number(),
        erreur: v.optional(v.string()),
    })
        .index("by_fluxCode", ["fluxCode"])
        .index("by_statut", ["statut"]),

    // ============================================================================
    // === CONFIGURATION SYSTÈME ===
    // ============================================================================
    configSysteme: defineTable({
        cle: v.string(),
        valeur: v.string(), // JSON stringifié selon le cas
        categorie: v.string(),
        description: v.string(),
        modifiePar: v.optional(v.id("users")),
        dateModification: v.number(),
    }).index("by_cle", ["cle"]),

    // ============================================================================
    // === NEOCORTEX OMEGA (Système Nerveux Digital) ===
    // ============================================================================
    signaux: defineTable({
        type: v.string(),
        source: v.string(),
        destination: v.optional(v.string()),
        entiteType: v.optional(v.string()),
        entiteId: v.optional(v.string()),
        payload: v.any(),
        confiance: v.number(), // 0-1
        priorite: v.union(
            v.literal("LOW"),
            v.literal("NORMAL"),
            v.literal("HIGH"),
            v.literal("CRITICAL")
        ),
        correlationId: v.string(),
        parentSignalId: v.optional(v.id("signaux")),
        ttl: v.optional(v.number()),
        traite: v.boolean(),
        timestamp: v.number(),
    })
        .index("by_type", ["type"])
        .index("by_timestamp", ["timestamp"])
        .index("by_non_traite", ["traite", "timestamp"])
        .index("by_correlation", ["correlationId"]),

    historiqueActions: defineTable({
        action: v.string(),
        categorie: v.string(),
        entiteType: v.string(),
        entiteId: v.optional(v.string()),
        userId: v.optional(v.string()),
        details: v.any(),
        metadata: v.optional(v.any()),
        timestamp: v.number(),
    })
        .index("by_entite", ["entiteType", "entiteId"])
        .index("by_user", ["userId", "timestamp"])
        .index("by_timestamp", ["timestamp"])
        .index("by_categorie", ["categorie"]),

    metriques: defineTable({
        nom: v.string(),
        valeur: v.number(),
        unite: v.optional(v.string()),
        periode: v.string(),
        dimensions: v.optional(v.any()),
        timestamp: v.number(),
    })
        .index("by_nom", ["nom"])
        .index("by_periode", ["periode", "timestamp"]),

    poidsAdaptatifs: defineTable({
        signal: v.string(),
        regle: v.string(),
        poids: v.number(), // 0-1
        executionsReussies: v.number(),
        executionsEchouees: v.number(),
        dernierAjustement: v.number(),
    }).index("by_signal", ["signal"]),

    notifications: defineTable({
        destinataireId: v.id("users"),
        titre: v.string(),
        message: v.string(),
        type: v.union(
            v.literal("info"),
            v.literal("alerte"),
            v.literal("action"),
            v.literal("rappel")
        ),
        lien: v.optional(v.string()),
        lue: v.boolean(),
        dateCreation: v.number(),
    })
        .index("by_destinataireId", ["destinataireId"])
        .index("by_destinataireId_lue", ["destinataireId", "lue"]),

    // ============================================================================
    // === MODULE GED (Gestion Électronique des Documents) ===
    // ============================================================================
    courriers: defineTable({
        reference: v.string(),
        type: v.union(v.literal("entrant"), v.literal("sortant")),
        categorie: v.union(v.literal("courrier_officiel"), v.literal("demande"), v.literal("plainte"), v.literal("notification"), v.literal("autre")),
        emetteur: v.string(),
        destinataire: v.string(),
        objet: v.string(),
        priorite: v.union(v.literal("urgent"), v.literal("important"), v.literal("normal")),
        statut: v.union(v.literal("recu"), v.literal("en_traitement"), v.literal("traite"), v.literal("archive")),
        dateDocument: v.number(),
        dateReception: v.number(),
        confidentiel: v.boolean(),
        tags: v.array(v.string()),
        documentId: v.id("_storage"),
        creePar: v.id("users"),
    }),

    diffusionsCourrier: defineTable({
        courrierId: v.id("courriers"),
        destinataireId: v.id("users"),
        lu: v.boolean(),
        dateLecture: v.optional(v.number()),
        actionRequise: v.optional(v.string()),
    }).index("by_courrierId", ["courrierId"]).index("by_destinataireId", ["destinataireId"]),

    workflows: defineTable({
        reference: v.string(),
        type: v.union(v.literal("marche_public"), v.literal("decision_administrative"), v.literal("note_service"), v.literal("courrier_sortant")),
        documentId: v.id("_storage"),
        titreDocument: v.string(),
        initiateurId: v.id("users"),
        dateCreation: v.number(),
        statut: v.union(v.literal("en_cours"), v.literal("approuve"), v.literal("rejete")),
        montant: v.optional(v.number()), // Pour certains workflows comme les marchés publics
        etapeActuelle: v.number(), // Index de l'étape courante
    }),

    etapesWorkflow: defineTable({
        workflowId: v.id("workflows"),
        ordre: v.number(),
        valideurId: v.id("users"),
        statut: v.union(v.literal("en_attente"), v.literal("approuve"), v.literal("rejete")),
        dateDecision: v.optional(v.number()),
        commentaire: v.optional(v.string()),
    }).index("by_workflowId", ["workflowId"]).index("by_valideurId", ["valideurId"]),

    signatures: defineTable({
        documentId: v.id("_storage"),
        signataireId: v.id("users"),
        dateSignature: v.number(),
        empreinteDigitale: v.string(), // hash ou ID de traçabilité
        ipAddress: v.string(),
    }).index("by_documentId", ["documentId"]).index("by_signataireId", ["signataireId"]),

    archives: defineTable({
        titre: v.string(),
        dossier: v.string(), // Chemin virtuel ex: 'Arsenal Réglementaire/2024'
        type: v.string(), // ex: "decret", "arrete", "contrat"
        annee: v.number(),
        documentId: v.id("_storage"),
        tags: v.array(v.string()),
        dateArchivage: v.number(),
        archivePar: v.id("users"),
        dateDestructionPrevue: v.optional(v.number()), // Rétention légale
    }).index("by_dossier", ["dossier"]),

    // ============================================================================
    // === MODULE LIMS (Laboratoire AGASA) ===
    // ============================================================================
    limsEchantillons: defineTable({
        codeBarres: v.string(), // ECH-2026-XXXXX
        dateReception: v.number(),
        origine: v.union(v.literal("inspection"), v.literal("operateur"), v.literal("interne")), // AGASA-Inspect, AGASA-Pro, Interne
        referenceSource: v.optional(v.string()), // ID du dossier source si applicable
        matrice: v.string(), // viande, poisson, etc.
        description: v.string(),
        quantite: v.number(),
        unite: v.string(),
        datePrelevement: v.number(),
        lieuPrelevement: v.string(),
        prelevePar: v.optional(v.string()), // ID inspecteur si terrain
        conditionsTransport: v.object({
            temperature: v.optional(v.number()),
            duree: v.optional(v.number()),
            conforme: v.boolean(),
        }),
        receptionnePar: v.id("users"),
        statut: v.union(v.literal("recu"), v.literal("enregistre"), v.literal("en_analyse"), v.literal("termine"), v.literal("valide"), v.literal("archive"), v.literal("detruit")),
    }).index("by_codeBarres", ["codeBarres"]).index("by_statut", ["statut"]),

    limsTracabilite: defineTable({
        echantillonId: v.id("limsEchantillons"),
        dateLigne: v.number(),
        agentId: v.optional(v.id("users")), // S'il s'agit d'un agent connecté
        nomAgent: v.string(), // Saisi manuellement ou automatiquement
        action: v.string(),
        lieu: v.string(),
    }).index("by_echantillonId", ["echantillonId"]),

    limsParametres: defineTable({
        code: v.string(),
        nom: v.string(),
        categorie: v.string(), // microbiologique, chimique, etc.
        methode: v.string(),
        unite: v.string(),
        lq: v.number(), // limite de quantification
        seuilReglementaire: v.optional(v.number()),
        normeReference: v.string(),
        equipementRequis: v.optional(v.string()), // ID equipement lié
        delaiJours: v.number(),
    }).index("by_categorie", ["categorie"]),

    limsAnalyses: defineTable({
        echantillonId: v.id("limsEchantillons"),
        parametreId: v.id("limsParametres"),
        assigneA: v.optional(v.id("users")), // Technicien
        dateAssignation: v.number(),
        resultatBrut: v.optional(v.number()),
        resultatFinal: v.optional(v.number()),
        incertitude: v.optional(v.number()),
        conformite: v.optional(v.boolean()),
        statut: v.union(v.literal("en_attente"), v.literal("en_cours"), v.literal("valide_tech"), v.literal("valide_resp"), v.literal("rejete"), v.literal("publie")),
        dateValidationN1: v.optional(v.number()),
        dateValidationN2: v.optional(v.number()),
        commentaireRejet: v.optional(v.string()),
    }).index("by_echantillonId", ["echantillonId"]).index("by_statut", ["statut"]).index("by_assigneA", ["assigneA"]),

    limsRapports: defineTable({
        reference: v.string(), // AR-2026-XXXXX
        echantillonId: v.id("limsEchantillons"),
        dateGeneration: v.number(),
        conclusion: v.union(v.literal("conforme"), v.literal("non_conforme")),
        signataireId: v.id("users"),
        documentId: v.id("_storage"),
    }).index("by_echantillonId", ["echantillonId"]),

    limsQualite: defineTable({
        code: v.string(),
        type: v.union(v.literal("carte_controle"), v.literal("non_conformite")),
        titre: v.string(),
        description: v.string(),
        dateCreation: v.number(),
        statut: v.string(),
        actionsCorrectives: v.optional(v.string()),
        clotureLe: v.optional(v.number()),
    }),

    limsContaminants: defineTable({
        annee: v.number(),
        parametreId: v.id("limsParametres"),
        province: v.string(),
        nombreAnalyses: v.number(),
        nombreNonConformes: v.number(),
        valeurMoyenne: v.number(),
    }),

    biKpiSnapshots: defineTable({
        dateSnapshot: v.number(),
        provinces: v.any(), // Array of province KPI objects
        macroStats: v.any(), // Global stats object
    }).index("by_date", ["dateSnapshot"]),

    biRapports: defineTable({
        titre: v.string(),
        type: v.union(v.literal("mensuel_perf"), v.literal("trimestriel_budget"), v.literal("annuel_cc"), v.literal("rapport_ca")),
        periode: v.string(),
        dateGeneration: v.number(),
        generePar: v.id("users"),
        fichierUrl: v.optional(v.string()), // or v.id("_storage")
        statut: v.union(v.literal("en_cours"), v.literal("termine"), v.literal("echec")),
    }).index("by_type", ["type"]).index("by_date", ["dateGeneration"]),


});
