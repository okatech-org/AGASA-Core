// lib/gateway/types.ts

// Type générique pour une requête Gateway
export interface GatewayPayload<T> {
    flux: "F1" | "F2" | "F3" | "F4" | "F5" | "F6";
    timestamp: number;
    data: T;
    signature?: string; // HMAC SHA256 of the payload (excluding signature field)
}

// ==== FLUX F1 : AGASA-Pro → AGASA-Admin ====
export type F1Data =
    | { type: "demande_agrement"; operateurId: string; documentUrl: string; infos: any }
    | { type: "paiement_redevance"; operateurId: string; montant: number; reference: string }
    | { type: "commande_analyse"; operateurId: string; typeAnalyse: string; echantillonRef: string };

// ==== FLUX F2 : AGASA-Admin → AGASA-Pro ====
export type F2Data =
    | { type: "decision_agrement"; operateurId: string; statut: "accorde" | "refuse"; notes: string }
    | { type: "resultat_analyse"; operateurId: string; echantillonRef: string; conformite: boolean; rapportUrl: string }
    | { type: "maj_smiley"; operateurId: string; nouveauScore: "A" | "B" | "C" | "D" };

// ==== FLUX F3 : AGASA-Inspect → AGASA-Admin ====
export type F3Data =
    | { type: "rapport_inspection"; inspecteurId: string; etablissementId: string; rapportUrl: string; coordonneesGPS: { lat: number; lng: number } }
    | { type: "pv_amende"; inspecteurId: string; etablissementId: string; montant: number; motif: string }
    | { type: "echantillon_preleve"; inspecteurId: string; etablissementId: string; echantillonRef: string };

// ==== FLUX F4 : AGASA-Admin → AGASA-Inspect ====
export type F4Data =
    | { type: "planning_inspection"; inspecteurId: string; missions: Array<{ etablissementId: string; datePrevue: number }> }
    | { type: "profil_risque"; etablissementId: string; niveauRisque: string }
    | { type: "historique_etablissement"; etablissementId: string; historique: any };

// ==== FLUX F5 : AGASA-Admin → AGASA-Citoyen ====
export type F5Data =
    | { type: "maj_smiley_public"; etablissementId: string; nouveauScore: "A" | "B" | "C" | "D" }
    | { type: "alerte_rappel"; reference: string; detailsProduit: string; instructions: string }
    | { type: "maj_carte_etablissements"; etablissements: Array<any> };

// ==== FLUX F6 : AGASA-Citoyen → AGASA-Admin ====
export type F6Data = {
    type: "signalement_citoyen";
    description: string;
    provinceGeo: string;
    coordonneesGps?: { lat: number; lng: number };
    photoUrls?: string[];
    anonyme: boolean;
    contactPublic?: string; // si non anonyme
};
