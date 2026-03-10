import Link from "next/link";
import Image from "next/image";
import {
    Shield,
    FileText,
    Clock,
    Lock,
    Globe,
    Users,
    DollarSign,
    Truck,
    FlaskConical,
    AlertTriangle,
    BarChart3,
    ChevronRight,
    Building2,
    Microscope,
    Zap,
    CheckCircle2,
    Eye,
} from "lucide-react";
import { HeroActions, CtaActions } from "@/components/HomeActions";

const modules = [
    {
        icon: Users,
        title: "Ressources Humaines",
        description:
            "Gestion des agents, paie, congés, formations et portail self-service.",
        image: "/images/module_rh.png",
        color: "var(--ds-blue)",
    },
    {
        icon: DollarSign,
        title: "Finance & Comptabilité",
        description:
            "Budget, redevances, amendes, recouvrement et comptabilité publique.",
        image: "/images/module_finance.png",
        color: "var(--ds-emerald)",
    },
    {
        icon: FileText,
        title: "Gestion Documentaire",
        description:
            "Courrier numérisé, signature électronique, workflows et archivage.",
        image: "/images/module_doc.png",
        color: "var(--ds-amber)",
    },
    {
        icon: Truck,
        title: "Logistique",
        description:
            "Flotte de véhicules, stocks de réactifs, maintenance des équipements.",
        image: "/images/module_logistique.png",
        color: "var(--ds-amber)",
    },
    {
        icon: FlaskConical,
        title: "Laboratoire (LIMS)",
        description:
            "Échantillons, analyses, rapports ISO 17025 et base de contaminants.",
        image: "/images/module_labo.png",
        color: "var(--ds-violet)",
    },
    {
        icon: AlertTriangle,
        title: "Alertes Sanitaires",
        description:
            "Alertes actives, signalements citoyens, rappels de produits, protocole CEMAC.",
        image: "/images/hero_bg.png",
        color: "var(--ds-rose)",
    },
    {
        icon: BarChart3,
        title: "Tableau de Bord BI",
        description:
            "KPI opérationnels, cartographie des risques et pilotage DG.",
        image: "/images/module_finance.png",
        color: "var(--ds-cyan)",
    },
];

const acteurs = [
    {
        role: "La Direction Générale",
        description: "Pilote les indicateurs de performance, surveille les alertes sanitaires globales et prend des décisions stratégiques.",
        icon: BarChart3,
        color: "var(--ds-blue)",
    },
    {
        role: "L'Inspecteur Terrain",
        description: "Remonte instantanément les constats de conformité et valide les inspections depuis les marchés et frontières.",
        icon: Shield,
        color: "var(--ds-amber)",
    },
    {
        role: "Le Technicien Labo",
        description: "Suit le parcours des échantillons garantissant la traçabilité complète des analyses de sécurité alimentaire.",
        icon: Microscope,
        color: "var(--ds-violet)",
    },
    {
        role: "Le Support & RH",
        description: "Gère fluidement la carrière des agents et les finances dans un environnement moderne zéro papier.",
        icon: Building2,
        color: "var(--ds-emerald)",
    },
];

const etapes = [
    {
        numero: "1",
        titre: "Connectez-vous",
        description:
            "Avec vos identifiants internes AGASA, depuis n'importe quel appareil.",
    },
    {
        numero: "2",
        titre: "Travaillez",
        description:
            "Accédez à votre espace métier dédié et collaborez en temps réel avec vos pairs.",
    },
    {
        numero: "3",
        titre: "Suivez",
        description:
            "Suivez l'évolution de vos dossiers avec une traçabilité totale des processus.",
    },
];

const stats = [
    { value: "7", label: "Modules métier", suffix: "+" },
    { value: "9", label: "Provinces couvertes" },
    { value: "99.5", label: "Disponibilité", suffix: "%" },
    { value: "0", label: "Papier", suffix: "" },
];

export default function PublicHomePage() {
    return (
        <div>
            {/* ─── Hero Section (§7.C) ─── */}
            <section className="gradient-hero relative overflow-hidden py-20 lg:py-32">
                {/* Subtle grid overlay */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h1v1H0zM20 0h1v1h-1zM0 20h1v1H0zM20 20h1v1h-1z'/%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />

                <div className="container-ds relative z-10">
                    <div className="max-w-3xl">
                        {/* Badge animé */}
                        <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-md">
                            <span className="pulse-dot" />
                            Transformation Numérique 2026
                        </div>

                        {/* H1 — Cormorant Garamond 700 */}
                        <h1 className="text-white">
                            AGASA-Admin
                            <span className="mt-3 block">
                                Le Hub{" "}
                                <span className="text-gradient">Numérique</span>{" "}
                                de la Sécurité Alimentaire
                            </span>
                        </h1>

                        {/* Sous-titre — DM Sans 18px */}
                        <p className="text-lead mt-8 max-w-[600px] text-white/70">
                            Une infrastructure digitale souveraine pour la gestion, le contrôle et le
                            pilotage de l&apos;AGASA. Un outil technologique premium pour tous les acteurs,
                            garantissant efficacité et traçabilité.
                        </p>

                        {/* 2 CTA */}
                        <HeroActions />
                    </div>
                </div>

                {/* Stats Banner — glass, integrated at bottom */}
                <div className="container-ds relative z-10" style={{marginTop: "10rem"}}>
                    <div className="glass rounded-2xl border border-white/10 p-6 lg:p-8">
                        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                            {stats.map((stat) => (
                                <div key={stat.label} className="text-center">
                                    <div className="text-3xl font-bold text-white lg:text-4xl">
                                        {stat.value}
                                        <span className="text-gradient">{stat.suffix}</span>
                                    </div>
                                    <div className="mt-1 text-sm font-medium text-white/60">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Section Vision & Bénéfices ─── */}
            <section className="section-padding bg-[var(--ds-bg-muted)]">
                <div className="container-ds">
                    <div className="mx-auto max-w-3xl text-center">
                        <span className="overline">La Vision</span>
                        <h2 className="mt-3 text-[var(--ds-text)]">
                            Pourquoi numériser la gestion <span className="text-gradient">de l&apos;AGASA</span> ?
                        </h2>
                        <p className="text-lead mx-auto mt-4 text-[var(--ds-text-muted)]">
                            Notre ambition est de moderniser l&apos;administration publique gabonaise pour offrir un service de qualité, rapide et transparent.
                        </p>
                    </div>
                    <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {[
                            {
                                icon: FileText,
                                title: "100% Zéro Papier",
                                desc: "Vos dossiers et workflows entièrement numérisés. Finies les pertes d'archives.",
                                color: "var(--ds-blue)",
                            },
                            {
                                icon: Clock,
                                title: "Gain d'Efficacité",
                                desc: "L'automatisation réduit les délais de traitement de plusieurs semaines à quelques jours.",
                                color: "var(--ds-emerald)",
                            },
                            {
                                icon: Lock,
                                title: "Traçabilité Absolue",
                                desc: "Chaque action, chaque paiement et chaque décision est sécurisé et auditable.",
                                color: "var(--ds-amber)",
                            },
                            {
                                icon: Globe,
                                title: "Réseau National",
                                desc: "Un seul système interconnectant le siège et les 9 provinces en temps réel.",
                                color: "var(--ds-violet)",
                            },
                        ].map((item, i) => (
                            <div
                                key={item.title}
                                className={`neu-card group relative rounded-2xl border border-[var(--ds-border)] bg-[var(--ds-bg-card)] p-8 animate-fade-in-up stagger-${i + 1}`}
                            >
                                <div
                                    className="icon-container mb-6"
                                    style={{ background: `color-mix(in srgb, ${item.color} 12%, transparent)` }}
                                >
                                    <item.icon
                                        className="h-5 w-5"
                                        style={{ color: item.color }}
                                        strokeWidth={1.8}
                                    />
                                </div>
                                <h4 className="text-[var(--ds-text)]">{item.title}</h4>
                                <p className="mt-3 text-[var(--ds-text-muted)]">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Section Acteurs ─── */}
            <section className="section-padding border-y border-[var(--ds-border)] bg-[var(--ds-bg-card)]">
                <div className="container-ds">
                    <div className="grid items-center gap-16 lg:grid-cols-2">
                        <div>
                            <span className="overline">Les Acteurs</span>
                            <h2 className="mt-3 text-[var(--ds-text)]">
                                Conçu pour l&apos;humain, <br />pensé pour <span className="text-gradient">l&apos;action</span>.
                            </h2>
                            <p className="text-lead mt-6 text-[var(--ds-text-muted)]">
                                AGASA-Admin n&apos;est pas qu&apos;un logiciel. C&apos;est l&apos;outil de travail du quotidien pour des centaines d&apos;agents dédiés à la sécurité alimentaire du pays.
                            </p>

                            <div className="mt-10 space-y-6">
                                {acteurs.map((acteur) => (
                                    <div key={acteur.role} className="group flex gap-4">
                                        <div className="shrink-0 mt-1">
                                            <div
                                                className="icon-container"
                                                style={{ background: `color-mix(in srgb, ${acteur.color} 12%, transparent)` }}
                                            >
                                                <acteur.icon
                                                    className="h-5 w-5"
                                                    style={{ color: acteur.color }}
                                                    strokeWidth={1.8}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-[var(--ds-text)]">{acteur.role}</h4>
                                            <p className="mt-2 text-[var(--ds-text-muted)]">{acteur.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative h-[500px] w-full overflow-hidden rounded-3xl lg:h-[600px]">
                            <Image
                                src="/images/module_rh.png"
                                alt="Équipe AGASA"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/70 via-transparent to-transparent" />
                            <div className="absolute bottom-8 left-8 right-8 text-white">
                                <p className="font-serif text-xl font-semibold">L&apos;équipe AGASA au cœur de l&apos;innovation.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Section Modules (§7.D) ─── */}
            <section className="section-padding bg-[var(--ds-bg-muted)]">
                <div className="container-ds">
                    <div className="mx-auto mb-16 max-w-3xl text-center">
                        <span className="overline">Modules Métier</span>
                        <h2 className="mt-3 text-[var(--ds-text)]">
                            Une plateforme <span className="text-gradient">unifiée</span>
                        </h2>
                        <p className="text-lead mx-auto mt-4 text-[var(--ds-text-muted)]">
                            Découvrez les différentes briques logicielles qui permettent de gérer l&apos;intégration complète de nos activités.
                        </p>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
                        {modules.map((mod, i) => (
                            <div
                                key={mod.title}
                                className={`neu-card group relative flex flex-col overflow-hidden rounded-[20px] border border-[var(--ds-border)] bg-[var(--ds-bg-card)] animate-fade-in-up stagger-${i + 1}`}
                            >
                                <div className="relative h-48 w-full overflow-hidden bg-[var(--ds-bg-muted)]">
                                    <Image
                                        src={mod.image}
                                        alt={mod.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div className="flex flex-1 flex-col p-8">
                                    <div
                                        className="icon-container mb-4"
                                        style={{ background: `color-mix(in srgb, ${mod.color} 12%, transparent)` }}
                                    >
                                        <mod.icon
                                            className="h-5 w-5"
                                            style={{ color: mod.color }}
                                            strokeWidth={1.8}
                                        />
                                    </div>
                                    <h4 className="text-[var(--ds-text)]">{mod.title}</h4>
                                    <p className="mt-3 flex-1 text-[var(--ds-text-muted)]">
                                        {mod.description}
                                    </p>
                                    <div className="mt-4 flex items-center gap-1 text-sm font-medium" style={{ color: mod.color }}>
                                        En savoir plus
                                        <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.8} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Section Bénéfices (Bandeau d'assurance §7.F) ─── */}
            <section className="border-y border-[var(--ds-border)] bg-[color-mix(in_srgb,var(--ds-blue)_6%,transparent)]">
                <div className="container-ds section-padding">
                    <div className="grid gap-8 md:grid-cols-3">
                        {[
                            {
                                icon: Shield,
                                title: "Sécurité & Souveraineté",
                                desc: "Données hébergées de manière souveraine. Chiffrement bout-en-bout.",
                                color: "var(--ds-emerald)",
                            },
                            {
                                icon: Zap,
                                title: "Disponibilité 99.5%",
                                desc: "Infrastructure cloud résiliente avec basculement automatique.",
                                color: "var(--ds-blue)",
                            },
                            {
                                icon: Eye,
                                title: "Transparence CTRI",
                                desc: "Auditabilité intégrale de chaque opération et décision.",
                                color: "var(--ds-amber)",
                            },
                        ].map((item) => (
                            <div key={item.title} className="flex items-start gap-4">
                                <div
                                    className="icon-container shrink-0"
                                    style={{ background: `color-mix(in srgb, ${item.color} 12%, transparent)` }}
                                >
                                    <item.icon
                                        className="h-5 w-5"
                                        style={{ color: item.color }}
                                        strokeWidth={1.8}
                                    />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-[var(--ds-text)]">{item.title}</h4>
                                    <p className="mt-1 text-[13px] text-[var(--ds-text-muted)]">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Section Comment ça marche ─── */}
            <section className="section-padding bg-[var(--ds-bg-card)]">
                <div className="container-ds">
                    <div className="mx-auto max-w-3xl text-center">
                        <span className="overline">Démarrage rapide</span>
                        <h2 className="mt-3 text-[var(--ds-text)]">
                            Prêt en <span className="text-gradient">3 étapes</span>
                        </h2>
                        <p className="text-lead mx-auto mt-4 text-[var(--ds-text-muted)]">
                            Une adoption immédiate grâce à une interface centrée sur l&apos;utilisateur.
                        </p>
                    </div>
                    <div className="mt-16 flex flex-col items-center gap-12 md:flex-row md:items-start md:justify-center md:gap-8 lg:gap-16">
                        {etapes.map((etape, i) => (
                            <div key={etape.numero} className={`relative flex max-w-sm flex-col items-center text-center animate-fade-in-up stagger-${i + 1}`}>
                                <div className="gradient-agasa relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg">
                                    {etape.numero}
                                </div>
                                <h4 className="text-[var(--ds-text)]">{etape.titre}</h4>
                                <p className="mt-3 text-[var(--ds-text-muted)]">
                                    {etape.description}
                                </p>
                                {i < etapes.length - 1 && (
                                    <ChevronRight className="absolute -right-6 top-4 hidden h-8 w-8 text-[var(--ds-border)] md:block lg:-right-10" strokeWidth={1.8} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA Final (§7.H) ─── */}
            <section className="gradient-hero relative overflow-hidden py-20 lg:py-24">
                {/* Grid overlay */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h1v1H0zM20 0h1v1h-1zM0 20h1v1H0zM20 20h1v1h-1z'/%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />
                <div className="container-ds relative z-10 text-center">
                    <Shield className="mx-auto h-16 w-16 text-white/80" strokeWidth={1.8} />
                    <h2 className="mt-6 text-white">
                        Rejoignez la révolution <span className="text-gradient">digitale</span>
                    </h2>
                    <p className="text-lead mx-auto mt-6 max-w-2xl text-white/70">
                        Connectez-vous avec vos identifiants ou explorez la plateforme via le compte de démonstration pour découvrir toute sa puissance.
                    </p>
                    <CtaActions />
                </div>
            </section>
        </div>
    );
}
