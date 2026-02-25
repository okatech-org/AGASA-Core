"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
import { useState } from "react";
import {
    LayoutDashboard,
    Users,
    Wallet,
    Files,
    Truck,
    Microscope,
    AlertTriangle,
    LineChart,
    Settings,
    Bell,
    Shield,
    ClipboardList,
    Network,
    Lock,
    ChevronDown,
    ChevronRight,
    User,
    Calendar,
    GraduationCap,
    BookOpen,
    PenTool,
    FileSearch,
    DollarSign,
    FileText,
    BarChart3,
    Beaker,
    FlaskConical,
    type LucideIcon,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================
type NavItem = {
    href: string;
    label: string;
    icon: LucideIcon;
    badge?: number;
    children?: { href: string; label: string }[];
};

type NavSection = {
    title: string;
    items: NavItem[];
    accentColor?: string;
};

// ============================================================================
// Navigation config per role
// ============================================================================
function getSidebarSections(role: string | null, direction?: string): NavSection[] {
    const effectiveRole = role || "agent";

    // -- Common "Général" section --
    const generalSection: NavSection = {
        title: "Général",
        items: [
            { href: "/tableau-de-bord", label: effectiveRole === "agent" || effectiveRole === "technicien_laa" ? "Mon espace" : "Tableau de bord", icon: LayoutDashboard },
            { href: "/notifications", label: "Notifications", icon: Bell },
        ],
    };

    // -- Modules Métier (full for admin/demo, filtered for others) --
    const allModules: NavItem[] = [
        {
            href: "/rh", label: "Ressources Humaines", icon: Users,
            children: [
                { href: "/rh/agents", label: "Agents" },
                { href: "/rh/organigramme", label: "Organigramme" },
                { href: "/rh/conges", label: "Congés" },
                { href: "/rh/paie", label: "Paie" },
                { href: "/rh/formations", label: "Formations" },
                { href: "/rh/self-service/profil", label: "Self-service" },
            ],
        },
        {
            href: "/finance", label: "Finance", icon: Wallet,
            children: [
                { href: "/finance/budget", label: "Budget" },
                { href: "/finance/redevances", label: "Redevances & Amendes" },
                { href: "/finance/comptabilite", label: "Comptabilité" },
                { href: "/finance/paiements", label: "Paiements" },
            ],
        },
        {
            href: "/ged", label: "Documents", icon: Files,
            children: [
                { href: "/ged/courrier", label: "Courrier" },
                { href: "/ged/signatures", label: "Signatures" },
                { href: "/ged/workflows", label: "Workflows" },
            ],
        },
        {
            href: "/logistique", label: "Logistique", icon: Truck,
            children: [
                { href: "/logistique/vehicules", label: "Véhicules & Flotte" },
                { href: "/logistique/stocks", label: "Stocks" },
                { href: "/logistique/equipements", label: "Équipements" },
                { href: "/logistique/maintenances", label: "Maintenances" },
            ],
        },
        {
            href: "/lims", label: "Laboratoire", icon: Microscope,
            children: [
                { href: "/lims/echantillons", label: "Échantillons" },
                { href: "/lims/analyses", label: "Analyses" },
                { href: "/lims/rapports", label: "Rapports" },
                { href: "/lims/qualite", label: "Contrôle qualité" },
                { href: "/lims/contaminants", label: "Contaminants" },
            ],
        },
        {
            href: "/alertes", label: "Alertes", icon: AlertTriangle,
            children: [
                { href: "/alertes", label: "Tableau de bord" },
                { href: "/alertes/actives", label: "Alertes actives" },
                { href: "/alertes/signalements", label: "Signalements citoyens" },
                { href: "/alertes/rappels", label: "Rappels produits" },
                { href: "/alertes/cemac", label: "Protocole CEMAC" },
            ],
        },
        {
            href: "/bi", label: "BI — Décisionnel", icon: LineChart,
            children: [
                { href: "/bi", label: "KPI opérationnels" },
                { href: "/bi/pilotage", label: "Pilotage stratégique" },
            ],
        },
    ];

    // -- Admin section --
    const adminSection: NavSection = {
        title: "Administration",
        accentColor: "border-l-4 border-[#1B4F72]",
        items: [
            { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
            { href: "/admin/roles", label: "Rôles & Permissions", icon: Lock },
            { href: "/admin/audit", label: "Journal d'audit", icon: ClipboardList },
            { href: "/admin/configuration", label: "Configuration", icon: Settings },
            { href: "/admin/api-gateway", label: "API Gateway", icon: Network },
            { href: "/admin/securite", label: "Sécurité", icon: Shield },
        ],
    };

    // =====================================================
    // Build sections per role
    // =====================================================
    switch (effectiveRole) {
        case "admin_systeme":
        case "demo":
            return [
                generalSection,
                { title: "Modules Métier", items: allModules },
                adminSection,
            ];

        case "directeur_general":
            return [
                generalSection,
                {
                    title: "Pilotage",
                    items: [
                        {
                            href: "/bi", label: "BI — Décisionnel", icon: LineChart,
                            children: [
                                { href: "/bi", label: "KPI opérationnels" },
                                { href: "/bi/pilotage", label: "Pilotage stratégique" },
                            ],
                        },
                        {
                            href: "/alertes", label: "Alertes", icon: AlertTriangle,
                            children: [
                                { href: "/alertes", label: "Tableau de bord" },
                                { href: "/alertes/actives", label: "Alertes urgentes" },
                                { href: "/alertes/signalements", label: "Signalements" },
                            ],
                        },
                        { href: "/ged/workflows?en_attente_de_moi=true", label: "Mes validations", icon: PenTool },
                        { href: "/ged/signatures", label: "Mes signatures", icon: FileText },
                    ],
                },
                {
                    title: "Consultation",
                    items: [
                        { href: "/rh", label: "Ressources Humaines", icon: Users },
                        { href: "/finance", label: "Finance", icon: Wallet },
                        { href: "/ged", label: "Documents", icon: Files },
                        { href: "/logistique", label: "Logistique", icon: Truck },
                        { href: "/lims", label: "Laboratoire", icon: Microscope },
                    ],
                },
            ];

        case "directeur": {
            const dirLabel = direction || "Direction";
            const dirSections: NavSection[] = [
                generalSection,
                {
                    title: `Ma Direction (${dirLabel})`,
                    items: [
                        { href: `/rh/agents?direction=${direction}`, label: "Mon équipe", icon: Users },
                        { href: `/rh/conges?statut=soumis&direction=${direction}`, label: "Congés à valider", icon: Calendar },
                        { href: `/ged/courrier?direction=${direction}`, label: "Courrier direction", icon: Files },
                        { href: "/ged/workflows?en_attente_de_moi=true", label: "Mes validations", icon: PenTool },
                    ],
                },
                {
                    title: "Modules Métier",
                    items: [
                        { href: "/rh", label: "Ressources Humaines", icon: Users },
                        { href: "/finance", label: "Finance", icon: Wallet },
                        { href: "/ged", label: "Documents", icon: Files },
                    ],
                },
                {
                    title: "Reporting",
                    items: [
                        { href: `/bi?direction=${direction}`, label: "BI Direction", icon: LineChart },
                    ],
                },
            ];
            // Add direction-specific modules
            if (direction === "LAA") {
                dirSections[2].items.push({ href: "/lims", label: "Laboratoire", icon: Microscope });
            }
            if (direction === "DERSP" || direction === "DICSP") {
                dirSections[2].items.push({ href: "/alertes", label: "Alertes", icon: AlertTriangle });
            }
            if (direction === "DAF") {
                dirSections[2].items.push({ href: "/logistique", label: "Logistique", icon: Truck });
            }
            return dirSections;
        }

        case "agent":
            return [
                {
                    title: "",
                    items: [
                        { href: "/tableau-de-bord", label: "Mon espace", icon: LayoutDashboard },
                        { href: "/notifications", label: "Notifications", icon: Bell },
                        { href: "/rh/self-service/profil", label: "Mon profil", icon: User },
                        { href: "/rh/conges?mes_demandes=true", label: "Mes congés", icon: Calendar },
                        { href: "/rh/paie?mes_bulletins=true", label: "Ma paie", icon: Wallet },
                        { href: "/rh/formations", label: "Formations", icon: GraduationCap },
                        { href: "/rh/self-service/demandes", label: "Mes demandes", icon: ClipboardList },
                        { href: "/rh/self-service/annuaire", label: "Annuaire", icon: BookOpen },
                    ],
                },
            ];

        case "technicien_laa":
            return [
                generalSection,
                {
                    title: "Laboratoire",
                    items: [
                        {
                            href: "/lims/echantillons", label: "Échantillons", icon: FlaskConical,
                            children: [
                                { href: "/lims/echantillons/nouveau", label: "Enregistrer" },
                                { href: "/lims/echantillons", label: "Tous les échantillons" },
                            ],
                        },
                        {
                            href: "/lims/analyses", label: "Analyses", icon: Microscope,
                            children: [
                                { href: "/lims/analyses/saisie", label: "Mes analyses à faire" },
                                { href: "/lims/analyses", label: "Toutes les analyses" },
                            ],
                        },
                        { href: "/lims/qualite", label: "Contrôle qualité", icon: BarChart3 },
                        { href: "/lims/rapports", label: "Rapports", icon: FileText },
                        { href: "/lims/parametres", label: "Catalogue paramètres", icon: BookOpen },
                        { href: "/lims/contaminants", label: "Contaminants", icon: AlertTriangle },
                    ],
                },
                {
                    title: "Mon Espace RH",
                    items: [
                        { href: "/rh/self-service/profil", label: "Mon profil", icon: User },
                        { href: "/rh/conges?mes_demandes=true", label: "Mes congés", icon: Calendar },
                        { href: "/rh/paie?mes_bulletins=true", label: "Ma paie", icon: Wallet },
                        { href: "/rh/formations", label: "Formations", icon: GraduationCap },
                        { href: "/rh/self-service/annuaire", label: "Annuaire", icon: BookOpen },
                    ],
                },
            ];

        case "auditeur":
            return [
                {
                    title: "Audit",
                    items: [
                        { href: "/tableau-de-bord", label: "Portail d'audit", icon: LayoutDashboard },
                        { href: "/notifications", label: "Notifications", icon: Bell },
                    ],
                },
                {
                    title: "Consultation",
                    items: [
                        { href: "/audit/journal", label: "Journal d'audit", icon: ClipboardList },
                        { href: "/audit/finance", label: "Traçabilité financière", icon: DollarSign },
                        { href: "/audit/rapports-financiers", label: "Rapports financiers", icon: FileText },
                        { href: "/audit/signatures", label: "Signatures", icon: PenTool },
                        { href: "/audit/flux", label: "Flux inter-applications", icon: Network },
                        { href: "/audit/bi", label: "Indicateurs BI", icon: LineChart },
                    ],
                },
                {
                    title: "Exports",
                    items: [
                        { href: "/audit/rapports", label: "Générer un rapport", icon: FileSearch },
                    ],
                },
            ];

        default:
            return [generalSection, { title: "Modules Métier", items: allModules }];
    }
}

// ============================================================================
// Sidebar sub-item component
// ============================================================================
function SidebarNavItem({ item, pathname }: { item: NavItem; pathname: string }) {
    const [isOpen, setIsOpen] = useState(
        item.children ? pathname.startsWith(item.href) : false
    );
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
    const hasChildren = item.children && item.children.length > 0;

    return (
        <div>
            <div className="flex items-center">
                <Link
                    href={hasChildren ? item.href : item.href}
                    className={cn(
                        "flex flex-1 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                            ? "bg-agasa-primary/10 text-agasa-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    onClick={(e) => {
                        if (hasChildren) {
                            e.preventDefault();
                            setIsOpen(!isOpen);
                        }
                    }}
                >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                        <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                            {item.badge}
                        </span>
                    )}
                    {hasChildren && (
                        <span className="ml-auto">
                            {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                        </span>
                    )}
                </Link>
            </div>
            {hasChildren && isOpen && (
                <div className="ml-7 mt-1 space-y-0.5 border-l border-slate-200 pl-3">
                    {item.children!.map((child) => (
                        <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                                "block rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                                pathname === child.href || pathname.startsWith(child.href + "/")
                                    ? "text-agasa-primary bg-agasa-primary/5"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                        >
                            {child.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

// ============================================================================
// Main Sidebar Component
// ============================================================================
export function Sidebar() {
    const pathname = usePathname();
    const { role, user } = useAuth();
    const direction = user?.direction;

    const sections = getSidebarSections(role, direction);

    return (
        <aside className="hidden w-[280px] shrink-0 border-r bg-white lg:block min-h-[calc(100vh-4rem)]">
            <div className="flex h-full flex-col">
                <div className="flex-1 space-y-5 overflow-y-auto py-5">
                    {sections.map((section, idx) => (
                        <div key={idx} className={cn("px-4", section.accentColor)}>
                            {section.title && (
                                <h2 className="mb-2 px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    {section.title}
                                </h2>
                            )}
                            <nav className="space-y-0.5">
                                {section.items.map((item) => (
                                    <SidebarNavItem key={item.href + item.label} item={item} pathname={pathname} />
                                ))}
                            </nav>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}
