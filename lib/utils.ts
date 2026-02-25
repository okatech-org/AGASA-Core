import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Classnames Utility ---
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Formatage de date en français ---
export function formatDateFR(
  timestamp: number,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    ...options,
  }).format(new Date(timestamp));
}

export function formatDateTimeFR(timestamp: number): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function formatDateShortFR(timestamp: number): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(timestamp));
}

// --- Formatage monétaire FCFA ---
export function formatFCFA(montant: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(montant) + " FCFA";
}

// --- Génération de matricule ---
export function generateMatricule(sequence: number): string {
  const year = new Date().getFullYear();
  return `AGASA-${year}-${String(sequence).padStart(4, "0")}`;
}

// --- Initiales pour avatar ---
export function getInitiales(nom: string, prenom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

// --- Temps relatif en français ---
export function tempsRelatif(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;
  return formatDateShortFR(timestamp);
}
