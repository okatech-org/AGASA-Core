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
} from "lucide-react";
import { HeroActions, CtaActions } from "@/components/HomeActions";

const modules = [
    {
        icon: Users,
        title: "Ressources Humaines",
        description:
            "Gestion des agents, paie, congés, formations et portail self-service.",
        image: "/images/module_rh.png",
        color: "text-blue-600 bg-blue-50",
    },
    {
        icon: DollarSign,
        title: "Finance & Comptabilité",
        description:
            "Budget, redevances, amendes, recouvrement et comptabilité publique.",
        image: "/images/module_finance.png",
        color: "text-emerald-600 bg-emerald-50",
    },
    {
        icon: FileText,
        title: "Gestion Documentaire",
        description:
            "Courrier numérisé, signature électronique, workflows et archivage.",
        image: "/images/module_doc.png",
        color: "text-amber-600 bg-amber-50",
    },
    {
        icon: Truck,
        title: "Logistique",
        description:
            "Flotte de véhicules, stocks de réactifs, maintenance des équipements.",
        image: "/images/module_logistique.png",
        color: "text-orange-600 bg-orange-50",
    },
    {
        icon: FlaskConical,
        title: "Laboratoire (LIMS)",
        description:
            "Échantillons, analyses, rapports ISO 17025 et base de contaminants.",
        image: "/images/module_labo.png",
        color: "text-purple-600 bg-purple-50",
    },
    {
        icon: AlertTriangle,
        title: "Alertes Sanitaires",
        description:
            "Alertes actives, signalements citoyens, rappels de produits, protocole CEMAC.",
        image: "/images/hero_bg.png",
        color: "text-red-600 bg-red-50",
    },
    {
        icon: BarChart3,
        title: "Tableau de Bord BI",
        description:
            "KPI opérationnels, cartographie des risques et pilotage DG.",
        image: "/images/module_finance.png",
        color: "text-cyan-600 bg-cyan-50",
    },
];

const acteurs = [
    {
        role: "La Direction Générale",
        description: "Pilote les indicateurs de performance, surveille les alertes sanitaires globales et prend des décisions stratégiques.",
        icon: BarChart3,
    },
    {
        role: "L'Inspecteur Terrain",
        description: "Remonte instantanément les constats de conformité et valide les inspections depuis les marchés et frontières.",
        icon: Shield,
    },
    {
        role: "Le Technicien Labo",
        description: "Suit le parcours des échantillons garantissant la traçabilité complète des analyses de sécurité alimentaire.",
        icon: Microscope,
    },
    {
        role: "Le Support & RH",
        description: "Gère fluidement la carrière des agents et les finances dans un environnement moderne zéro papier.",
        icon: Building2,
    }
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

const faq = [
    {
        question: "Ai-je besoin de compétences informatiques avancées ?",
        reponse:
            "Non. AGASA-Core est conçu pour être très simple d'utilisation. L'interface est intuitive et guidée.",
    },
    {
        question: "Mes données sont-elles sécurisées ?",
        reponse:
            "Oui. Toutes les communications sont chiffrées. L'accès est protégé et chaque action est tracée.",
    },
    {
        question: "Comment accéder depuis ma province ?",
        reponse:
            "La plateforme est accessible depuis n'importe quelle antenne provinciale. Il suffit d'une connexion internet.",
    },
    {
        question: "Peut-on l'utiliser sur tablette ?",
        reponse:
            "Oui, la plateforme est 100% responsive et optimisée pour une utilisation sur mobile, tablette ou bureau.",
    },
];

export default function PublicHomePage() {
    return (
        <div>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-agasa-secondary py-20 lg:py-32">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/hero_bg.png"
                        alt="Hub Numérique AGASA au Gabon"
                        fill
                        className="object-cover object-center opacity-40 mix-blend-overlay"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-agasa-secondary via-agasa-primary/80 to-agasa-primary/95 mix-blend-multiply" />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/90 shadow-sm backdrop-blur-md">
                            <Shield className="h-4 w-4" />
                            Agence Gabonaise de Sécurité Alimentaire
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white lg:text-6xl drop-shadow-md">
                            AGASA-Core
                            <span className="mt-4 block text-2xl font-semibold text-white/90 lg:text-4xl">
                                Le Hub Numérique de la Sécurité Alimentaire
                            </span>
                        </h1>
                        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/85 drop-shadow-sm font-medium">
                            Une infrastructure digitale souveraine pour la gestion, le contrôle et le
                            pilotage de l&apos;AGASA. Un outil technologique premium pour tous les acteurs,
                            garantissant efficacité et traçabilité pour protéger la santé publique.
                        </p>
                        <div className="mt-10">
                            <HeroActions />
                        </div>
                    </div>
                </div>
            </section>

            {/* Section Vision & Benefices */}
            <section className="py-20 lg:py-28 bg-slate-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <span className="text-agasa-primary font-semibold tracking-wider uppercase text-sm">La Vision</span>
                        <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
                            Pourquoi numériser la gestion de l&apos;AGASA ?
                        </h2>
                        <p className="mt-4 text-lg text-slate-600">
                            Notre ambition est de moderniser l&apos;administration publique gabonaise pour offrir un service de qualité, rapide et transparent.
                        </p>
                    </div>
                    <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {[
                            {
                                icon: FileText,
                                title: "100% Zéro Papier",
                                desc: "Vos dossiers et workflows entièrement numérisés. Finies les pertes d&apos;archives.",
                            },
                            {
                                icon: Clock,
                                title: "Gain d'Efficacité",
                                desc: "L'automatisation réduit les délais de traitement des processus de plusieurs semaines à quelques jours.",
                            },
                            {
                                icon: Lock,
                                title: "Traçabilité Absolue",
                                desc: "Chaque action, chaque paiement et chaque décision est sécurisé et auditable instantanément.",
                            },
                            {
                                icon: Globe,
                                title: "Réseau National",
                                desc: "Un seul système interconnectant le siège et les 9 provinces en temps réel, sans coupure.",
                            },
                        ].map((item) => (
                            <div key={item.title} className="relative group bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className="absolute inset-0 bg-gradient-to-br from-agasa-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative">
                                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-agasa-primary/10 text-agasa-primary group-hover:bg-agasa-primary group-hover:text-white transition-colors">
                                        <item.icon className="h-7 w-7" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">
                                        {item.title}
                                    </h3>
                                    <p className="mt-3 text-slate-600 leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section Acteurs */}
            <section className="py-20 lg:py-28 bg-white border-y border-slate-100">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-agasa-primary font-semibold tracking-wider uppercase text-sm">Les Acteurs</span>
                            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
                                Conçu pour l&apos;humain, <br />pensé pour l&apos;action.
                            </h2>
                            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                                AGASA-Core n&apos;est pas qu&apos;un logiciel. C&apos;est l&apos;outil de travail du quotidien pour des centaines d&apos;agents dédiés à la sécurité alimentaire du pays. Chaque rôle dispose d&apos;une interface sur-mesure.
                            </p>

                            <div className="mt-10 space-y-8">
                                {acteurs.map((acteur) => (
                                    <div key={acteur.role} className="flex gap-4">
                                        <div className="shrink-0 mt-1">
                                            <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm">
                                                <acteur.icon className="h-5 w-5 text-agasa-primary" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">{acteur.role}</h3>
                                            <p className="mt-2 text-slate-600">{acteur.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl">
                            <Image
                                src="/images/module_rh.png"
                                alt="Équipe AGASA"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                            <div className="absolute bottom-8 left-8 right-8 text-white">
                                <p className="font-semibold text-xl">L&apos;équipe AGASA au cœur de l&apos;innovation.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section Modules */}
            <section className="bg-slate-50 py-20 lg:py-28">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-agasa-primary font-semibold tracking-wider uppercase text-sm">Modules Métier</span>
                        <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
                            Une plateforme unifiée
                        </h2>
                        <p className="mt-4 text-lg text-slate-600">
                            Découvrez les différentes briques logicielles qui permettent de gérer l&apos;intégration complète de nos activités.
                        </p>
                    </div>
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {modules.map((mod) => (
                            <div
                                key={mod.title}
                                className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:shadow-xl hover:-translate-y-1"
                            >
                                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                                    <Image
                                        src={mod.image}
                                        alt={mod.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-300" />
                                </div>
                                <div className="flex flex-1 flex-col p-6">
                                    <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${mod.color}`}>
                                        <mod.icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{mod.title}</h3>
                                    <p className="text-sm text-slate-600 flex-1 leading-relaxed">
                                        {mod.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section Comment ça marche */}
            <section className="py-20 lg:py-28 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-slate-900">
                            Prêt en 3 étapes
                        </h2>
                        <p className="mt-4 text-lg text-slate-600">
                            Une adoption immédiate grâce à une interface centrée sur l&apos;utilisateur.
                        </p>
                    </div>
                    <div className="mt-16 flex flex-col items-center gap-12 md:flex-row md:justify-center md:items-start md:gap-8 lg:gap-16">
                        {etapes.map((etape, i) => (
                            <div key={etape.numero} className="flex flex-col items-center text-center max-w-sm relative">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-agasa-primary to-agasa-secondary text-2xl font-bold text-white shadow-lg shadow-agasa-primary/20 mb-6 relative z-10">
                                    {etape.numero}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">
                                    {etape.titre}
                                </h3>
                                <p className="text-slate-600 leading-relaxed">
                                    {etape.description}
                                </p>
                                {i < etapes.length - 1 && (
                                    <ChevronRight className="hidden h-8 w-8 text-slate-300 absolute -right-6 lg:-right-10 top-4 md:block" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="bg-agasa-primary py-20 lg:py-24 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%221%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
                <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <Shield className="mx-auto h-16 w-16 text-white/90 drop-shadow-md mb-6" />
                    <h2 className="text-3xl font-bold text-white sm:text-4xl drop-shadow-sm">
                        Rejoignez la révolution digitale
                    </h2>
                    <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80 font-medium">
                        Connectez-vous avec vos identifiants ou explorez la plateforme via le compte de démonstration pour découvrir toute sa puissance.
                    </p>
                    <div className="mt-10">
                        <CtaActions />
                    </div>
                </div>
            </section>
        </div>
    );
}
