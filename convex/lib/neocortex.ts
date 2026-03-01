export const SIGNAL_TYPES = {
  FLUX_RECU: "FLUX_RECU",
  FLUX_TRAITE: "FLUX_TRAITE",
  FLUX_ERREUR: "FLUX_ERREUR",
  NOTIFICATION_CREEE: "NOTIFICATION_CREEE",
  NOTIFICATION_LUE: "NOTIFICATION_LUE",
  CONFIG_MISE_A_JOUR: "CONFIG_MISE_A_JOUR",
  WEBHOOK_RECU: "WEBHOOK_RECU",
  DECISION_EVALUEE: "DECISION_EVALUEE",
  ACTION_EXTERNE_EXECUTEE: "ACTION_EXTERNE_EXECUTEE",
  ALERTE_SYSTEME: "ALERTE_SYSTEME",
} as const;

export const CORTEX = {
  LIMBIQUE: "LIMBIQUE",
  HIPPOCAMPE: "HIPPOCAMPE",
  PREFRONTAL: "PREFRONTAL",
  SENSORIEL: "SENSORIEL",
  VISUEL: "VISUEL",
  AUDITIF: "AUDITIF",
  MOTEUR: "MOTEUR",
  PLASTICITE: "PLASTICITE",
  MONITORING: "MONITORING",
  GATEWAY: "GATEWAY",
  METIER: "METIER",
} as const;

export const CATEGORIES_ACTION = {
  METIER: "METIER",
  SYSTEME: "SYSTEME",
  UTILISATEUR: "UTILISATEUR",
  SECURITE: "SECURITE",
} as const;

export type SignalPriority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";

export interface ScorePondere {
  valeur: number;
  poids: number;
}

export const genererCorrelationId = (): string => {
  const random = Math.random().toString(36).slice(2, 10);
  return `corr_${Date.now()}_${random}`;
};

export const calculerScorePondere = (scores: ScorePondere[]): number => {
  if (!scores.length) return 0;
  let numerateur = 0;
  let denominateur = 0;
  for (const item of scores) {
    const poids = Number.isFinite(item.poids) ? Math.max(0, item.poids) : 0;
    const valeur = Number.isFinite(item.valeur) ? item.valeur : 0;
    numerateur += valeur * poids;
    denominateur += poids;
  }
  if (denominateur === 0) return 0;
  return numerateur / denominateur;
};

export const normaliserConfiance = (confiance: number): number => {
  if (!Number.isFinite(confiance)) return 0;
  if (confiance < 0) return 0;
  if (confiance > 1) return 1;
  return confiance;
};
