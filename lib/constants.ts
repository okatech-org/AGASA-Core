// ============================================================================
// AGASA-Admin — Constantes Globales
// ============================================================================

// --- Rôles Utilisateurs ---
export const ROLES = {
  ADMIN_SYSTEME: "admin_systeme",
  DIRECTEUR_GENERAL: "directeur_general",
  DIRECTEUR: "directeur",
  CHEF_SERVICE: "chef_service",
  AGENT: "agent",
  TECHNICIEN_LAA: "technicien_laa",
  AUDITEUR: "auditeur",
  DEMO: "demo",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin_systeme: "Administrateur Système",
  directeur_general: "Directeur Général",
  directeur: "Directeur",
  chef_service: "Chef de Service",
  agent: "Agent",
  technicien_laa: "Technicien Laboratoire",
  auditeur: "Auditeur",
  demo: "Démonstration",
};

export const ROLE_HIERARCHY: UserRole[] = [
  "admin_systeme",
  "directeur_general",
  "directeur",
  "chef_service",
  "agent",
  "technicien_laa",
  "auditeur",
  "demo",
];

// --- Directions AGASA ---
export const DIRECTIONS = {
  DG: "DG",
  DERSP: "DERSP",
  DICSP: "DICSP",
  DAF: "DAF",
  LAA: "LAA",
} as const;

export type Direction = (typeof DIRECTIONS)[keyof typeof DIRECTIONS];

export const DIRECTION_LABELS: Record<Direction, string> = {
  DG: "Direction Générale",
  DERSP: "Direction de l'Évaluation des Risques Sanitaires et Phytosanitaires",
  DICSP: "Direction des Inspections et du Contrôle Sanitaire et Phytosanitaire",
  DAF: "Direction Administrative et Financière",
  LAA: "Laboratoire d'Analyses Alimentaires",
};

export const DIRECTION_SHORT_LABELS: Record<Direction, string> = {
  DG: "Direction Générale",
  DERSP: "Évaluation des Risques",
  DICSP: "Inspections & Contrôle",
  DAF: "Admin & Finances",
  LAA: "Laboratoire",
};

// --- Provinces du Gabon ---
export const PROVINCES = [
  "Estuaire",
  "Haut-Ogooué",
  "Moyen-Ogooué",
  "Ngounié",
  "Nyanga",
  "Ogooué-Ivindo",
  "Ogooué-Lolo",
  "Ogooué-Maritime",
  "Woleu-Ntem",
  "Siège",
] as const;

export type Province = (typeof PROVINCES)[number];

export const PROVINCE_CAPITALS: Record<string, string> = {
  Estuaire: "Libreville",
  "Haut-Ogooué": "Franceville",
  "Moyen-Ogooué": "Lambaréné",
  Ngounié: "Mouila",
  Nyanga: "Tchibanga",
  "Ogooué-Ivindo": "Makokou",
  "Ogooué-Lolo": "Koulamoutou",
  "Ogooué-Maritime": "Port-Gentil",
  "Woleu-Ntem": "Oyem",
  Siège: "Libreville",
};

// --- Statuts Utilisateur ---
export const USER_STATUTS = {
  ACTIF: "actif",
  INACTIF: "inactif",
  VERROUILLE: "verrouille",
} as const;

export type UserStatut = (typeof USER_STATUTS)[keyof typeof USER_STATUTS];

// --- Modules de l'Application ---
export const MODULES = {
  TABLEAU_DE_BORD: "tableau-de-bord",
  RH: "rh",
  FINANCE: "finance",
  GED: "ged",
  LOGISTIQUE: "logistique",
  LIMS: "lims",
  ALERTES: "alertes",
  BI: "bi",
  ADMIN: "admin",
} as const;

export type ModuleKey = (typeof MODULES)[keyof typeof MODULES];

export const MODULE_LABELS: Record<ModuleKey, string> = {
  "tableau-de-bord": "Tableau de Bord",
  rh: "Ressources Humaines",
  finance: "Finance & Comptabilité",
  ged: "Gestion Documentaire",
  logistique: "Logistique",
  lims: "Laboratoire (LIMS)",
  alertes: "Alertes Sanitaires",
  bi: "BI — Décisionnel",
  admin: "Administration",
};

// --- Permissions par rôle ---
export const MODULE_ACCESS: Record<UserRole, ModuleKey[]> = {
  admin_systeme: [
    "tableau-de-bord", "rh", "finance", "ged", "logistique",
    "lims", "alertes", "bi", "admin",
  ],
  directeur_general: [
    "tableau-de-bord", "rh", "finance", "ged", "logistique",
    "lims", "alertes", "bi",
  ],
  directeur: [
    "tableau-de-bord", "rh", "finance", "ged", "logistique", "alertes",
  ],
  chef_service: [
    "tableau-de-bord", "rh", "finance", "ged", "logistique",
  ],
  agent: ["tableau-de-bord", "rh"],
  technicien_laa: ["tableau-de-bord", "rh", "lims"],
  auditeur: ["tableau-de-bord", "finance", "bi"],
  demo: [
    "tableau-de-bord", "rh", "finance", "ged", "logistique",
    "lims", "alertes", "bi", "admin",
  ],
};

// --- Constantes Métier ---
export const APP_NAME = "AGASA-Admin";
export const APP_VERSION = "1.0.0";
export const APP_DESCRIPTION =
  "Plateforme interne unifiée de l'Agence Gabonaise de Sécurité Alimentaire";

export const SESSION_DURATION_MINUTES = 30;
export const SESSION_WARNING_MINUTES = 25;
export const MAX_LOGIN_ATTEMPTS = 5;
export const MIN_PASSWORD_LENGTH = 8;

export const RECOUVREMENT_DELAIS = {
  RELANCE_J15: 15,
  RELANCE_J30: 30,
  TRESOR_PUBLIC: 30,
} as const;

export const SEUIL_CA_FCFA = 30_000_000; // 30 millions FCFA pour validation CA
