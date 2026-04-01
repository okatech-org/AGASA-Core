// ============================================================================
// AGASA-Admin — Types TypeScript Globaux
// ============================================================================

import type { UserRole, Direction, Province, ModuleKey, UserStatut } from "./constants";

// Re-export des types de constantes
export type { UserRole, Direction, Province, ModuleKey, UserStatut };

// --- Utilisateur ---
export interface User {
    _id: string;
    firebaseUid: string;
    email: string;
    nom: string;
    prenom: string;
    role: UserRole;
    direction: Direction | null;
    province: Province;
    statut: UserStatut;
    tentativesConnexion: number;
    derniereConnexion: number;
    avatar?: string;
    telephone?: string;
    matricule: string;
    dateCreation: number;
    dateModification: number;
    creePar?: string;
    is2FAActif: boolean;
    permissions?: string[];
}

// --- Session ---
export interface Session {
    _id: string;
    userId: string;
    token: string;
    ipAddress: string;
    userAgent: string;
    expiresAt: number;
    createdAt: number;
}

// --- Audit Log ---
export interface AuditLog {
    _id: string;
    userId: string;
    action: string;
    module: string;
    details: string;
    ipAddress: string;
    userAgent: string;
    timestamp: number;
    entiteType?: string;
    entiteId?: string;
}

// --- Navigation ---
export interface NavItem {
    label: string;
    href: string;
    icon: string;
    module?: ModuleKey;
    children?: NavSubItem[];
    badge?: number;
    requiredRoles?: UserRole[];
}

export interface NavSubItem {
    label: string;
    href: string;
}

export interface NavSection {
    title: string;
    items: NavItem[];
}

// --- Breadcrumb ---
export interface BreadcrumbItem {
    label: string;
    href?: string;
}

// --- Notification ---
export interface Notification {
    _id: string;
    destinataireId: string;
    titre: string;
    message: string;
    type: "info" | "alerte" | "action" | "rappel";
    lien?: string;
    lu: boolean;
    dateCreation: number;
}

// --- API Response ---
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// --- Pagination ---
export interface PaginationParams {
    page: number;
    limit: number;
}

export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// --- Filtres ---
export interface FilterOption {
    value: string;
    label: string;
    count?: number;
}

// --- Statuts communs ---
export type StatutCouleur = {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    className?: string;
};
