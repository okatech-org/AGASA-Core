import Link from "next/link";
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
    ArrowRight,
    CheckCircle,
    Monitor,
    HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const modules = [
    {
        icon: Users,
        title: "Ressources Humaines",
        description:
            "Gestion des agents, paie, congés, formations et portail self-service.",
        color: "text-blue-600 bg-blue-50",
    },
    {
        icon: DollarSign,
        title: "Finance & Comptabilité",
        description:
            "Budget, redevances, amendes, recouvrement et comptabilité publique.",
        color: "text-emerald-600 bg-emerald-50",
    },
    {
        icon: FileText,
        title: "Gestion Documentaire",
        description:
            "Courrier numérisé, signature électronique, workflows et archivage.",
        color: "text-amber-600 bg-amber-50",
    },
    {
        icon: Truck,
        title: "Logistique",
        description:
            "Flotte de véhicules, stocks de réactifs, maintenance des équipements.",
        color: "text-orange-600 bg-orange-50",
    },
    {
        icon: FlaskConical,
        title: "Laboratoire (LIMS)",
        description:
            "Échantillons, analyses, rapports ISO 17025 et base de contaminants.",
        color: "text-purple-600 bg-purple-50",
    },
    {
        icon: AlertTriangle,
        title: "Alertes Sanitaires",
        description:
            "Alertes actives, signalements citoyens, rappels de produits, protocole CEMAC.",
        color: "text-red-600 bg-red-50",
    },
    {
        icon: BarChart3,
        title: "Tableau de Bord BI",
        description:
            "KPI opérationnels, cartographie des risques et pilotage DG.",
        color: "text-cyan-600 bg-cyan-50",
    },
];

const etapes = [
    {
        numero: "1",
        titre: "Connectez-vous",
        description:
            "Avec vos identifiants AGASA, depuis votre navigateur web.",
    },
    {
        numero: "2",
        titre: "Travaillez",
        description:
            "Accédez à votre module métier : RH, Finance, Labo, Logistique...",
    },
    {
        numero: "3",
        titre: "Suivez",
        description:
            "Vos demandes, dossiers et indicateurs sont mis à jour en temps réel.",
    },
];

const faq = [
    {
        question: "Ai-je besoin de compétences informatiques ?",
        reponse:
            "Non. AGASA-Core est conçu pour être simple d'utilisation. Si vous savez utiliser un navigateur web, vous pouvez utiliser la plateforme. Des formations sont prévues pour chaque direction.",
    },
    {
        question: "Mes données sont-elles sécurisées ?",
        reponse:
            "Oui. Toutes les communications sont chiffrées (TLS 1.3). L'accès est protégé par authentification forte. Chaque action est tracée dans un journal d'audit non modifiable.",
    },
    {
        question: "Comment accéder depuis ma province ?",
        reponse:
            "La plateforme est accessible depuis n'importe quelle antenne provinciale via le réseau AGASA ou VPN. Il suffit d'un navigateur web et d'une connexion internet.",
    },
    {
        question: "Que se passe-t-il en cas de coupure internet ?",
        reponse:
            "La plateforme fonctionne en mode connecté. En cas de coupure, vos données sont préservées et vous retrouverez votre travail à la reconnexion. Des sauvegardes quotidiennes sont effectuées.",
    },
    {
        question: "Qui contacter en cas de problème ?",
        reponse:
            "Une hotline dédiée est disponible du lundi au vendredi, de 8h à 18h. Vous pouvez aussi créer un ticket depuis la plateforme ou contacter votre champion numérique local.",
    },
    {
        question: "Puis-je accéder depuis ma tablette ?",
        reponse:
            "Oui. AGASA-Core est optimisé pour les écrans de bureaux et tablettes. L'interface s'adapte automatiquement à la taille de votre écran.",
    },
];

export default function PublicHomePage() {
    return (
        <div>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-agasa-primary via-agasa-primary/95 to-agasa-secondary py-20 lg:py-28">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/90">
                            <Shield className="h-4 w-4" />
                            Agence Gabonaise de Sécurité Alimentaire
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-white lg:text-5xl">
                            AGASA-Core
                            <span className="mt-2 block text-2xl font-medium text-white/80 lg:text-3xl">
                                Le Hub Numérique de la Sécurité Alimentaire
                            </span>
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
                            Plateforme interne unifiée pour la gestion, le contrôle et le
                            pilotage de l&apos;AGASA. Un seul outil pour tous les agents, du
                            siège de Libreville aux 9 antennes provinciales.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-4">
                            <Button
                                asChild
                                size="lg"
                                className="bg-white text-agasa-primary hover:bg-white/90"
                            >
                                <Link href="/connexion">
                                    Accéder à la plateforme
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="border-white/30 bg-transparent text-white hover:bg-white/10"
                            >
                                <Link href="/demo">
                                    Découvrir la démo
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section Pourquoi */}
            <section className="py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-foreground">
                            Pourquoi numériser la gestion de l&apos;AGASA ?
                        </h2>
                        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                            La transformation numérique au service de la sécurité alimentaire
                            gabonaise
                        </p>
                    </div>
                    <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {[
                            {
                                icon: FileText,
                                title: "Fini le papier",
                                desc: "Tous vos dossiers, courriers et documents accessibles en un clic depuis votre bureau ou votre tablette.",
                            },
                            {
                                icon: Clock,
                                title: "Gain de temps",
                                desc: "Des processus qui prenaient 45-90 jours réduits à 15-21 jours grâce à l'automatisation.",
                            },
                            {
                                icon: Lock,
                                title: "Traçabilité totale",
                                desc: "Chaque action est enregistrée. Chaque franc CFA est traçable du paiement au Trésor Public.",
                            },
                            {
                                icon: Globe,
                                title: "9 Provinces connectées",
                                desc: "Du siège de Libreville à l'antenne de Bitam, la même plateforme, les mêmes données, en temps réel.",
                            },
                        ].map((item) => (
                            <Card
                                key={item.title}
                                className="border-0 bg-white shadow-sm transition-shadow hover:shadow-md"
                            >
                                <CardContent className="pt-6">
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-agasa-primary/10">
                                        <item.icon className="h-6 w-6 text-agasa-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground">
                                        {item.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                        {item.desc}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section Modules */}
            <section className="bg-white py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-foreground">
                            Une plateforme, tous vos outils
                        </h2>
                        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                            7 modules intégrés pour couvrir l&apos;ensemble des besoins de
                            l&apos;AGASA
                        </p>
                    </div>
                    <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {modules.map((mod) => (
                            <Card
                                key={mod.title}
                                className="border transition-all hover:shadow-md"
                            >
                                <CardContent className="pt-6">
                                    <div
                                        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${mod.color}`}
                                    >
                                        <mod.icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-semibold text-foreground">{mod.title}</h3>
                                    <p className="mt-1.5 text-sm text-muted-foreground">
                                        {mod.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section Comment ça marche */}
            <section className="py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-foreground">
                            Simple comme 1-2-3
                        </h2>
                        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                            Trois étapes pour commencer à utiliser AGASA-Core
                        </p>
                    </div>
                    <div className="mt-12 flex flex-col items-center gap-8 md:flex-row md:justify-center">
                        {etapes.map((etape, i) => (
                            <div key={etape.numero} className="flex items-start gap-4 md:flex-col md:items-center md:text-center">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-agasa-primary text-xl font-bold text-white shadow-lg">
                                    {etape.numero}
                                </div>
                                <div className="max-w-xs">
                                    <h3 className="text-lg font-semibold text-foreground">
                                        {etape.titre}
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {etape.description}
                                    </p>
                                </div>
                                {i < etapes.length - 1 && (
                                    <ChevronRight className="hidden h-6 w-6 text-muted-foreground/50 md:block" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section Écosystème */}
            <section className="bg-white py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-foreground">
                            AGASA-Core : le cœur de l&apos;écosystème numérique
                        </h2>
                        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
                            Toutes les données transitent par AGASA-Core. Aucune communication
                            directe entre les autres applications.
                        </p>
                    </div>
                    <div className="mt-12 flex justify-center">
                        <div className="relative w-full max-w-2xl">
                            {/* Hub central */}
                            <div className="mx-auto flex h-36 w-36 flex-col items-center justify-center rounded-full bg-agasa-primary text-white shadow-xl">
                                <Shield className="h-8 w-8" />
                                <span className="mt-1 text-sm font-bold">AGASA-Core</span>
                                <span className="text-xs opacity-75">Hub Central</span>
                            </div>
                            {/* Apps connectées */}
                            <div className="mt-8 grid grid-cols-3 gap-4">
                                {[
                                    {
                                        name: "AGASA-Pro",
                                        desc: "Opérateurs économiques",
                                        flux: "F1 ↔ F2",
                                        color: "bg-blue-50 border-blue-200 text-blue-700",
                                    },
                                    {
                                        name: "AGASA-Inspect",
                                        desc: "Inspections terrain",
                                        flux: "F3 ↔ F4",
                                        color: "bg-amber-50 border-amber-200 text-amber-700",
                                    },
                                    {
                                        name: "AGASA-Citoyen",
                                        desc: "Grand public",
                                        flux: "F5 ↔ F6",
                                        color: "bg-green-50 border-green-200 text-green-700",
                                    },
                                ].map((app) => (
                                    <div
                                        key={app.name}
                                        className={`rounded-xl border-2 p-4 text-center ${app.color}`}
                                    >
                                        <Monitor className="mx-auto h-6 w-6" />
                                        <p className="mt-2 text-sm font-semibold">{app.name}</p>
                                        <p className="text-xs opacity-75">{app.desc}</p>
                                        <p className="mt-1 text-xs font-medium">{app.flux}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section FAQ */}
            <section className="py-16 lg:py-24">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <HelpCircle className="mx-auto h-10 w-10 text-agasa-primary" />
                        <h2 className="mt-4 text-3xl font-bold text-foreground">
                            Questions fréquentes
                        </h2>
                    </div>
                    <div className="mt-10 space-y-4">
                        {faq.map((item) => (
                            <details
                                key={item.question}
                                className="group rounded-xl border bg-white shadow-sm"
                            >
                                <summary className="flex cursor-pointer items-center justify-between p-5 text-left font-medium text-foreground">
                                    {item.question}
                                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
                                </summary>
                                <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                                    {item.reponse}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="bg-agasa-primary py-16">
                <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <CheckCircle className="mx-auto h-12 w-12 text-white/80" />
                    <h2 className="mt-4 text-3xl font-bold text-white">
                        Prêt à commencer ?
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-white/75">
                        Connectez-vous avec vos identifiants AGASA ou explorez la
                        plateforme en mode démonstration.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <Button
                            asChild
                            size="lg"
                            className="bg-white text-agasa-primary hover:bg-white/90"
                        >
                            <Link href="/connexion">Se connecter</Link>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="border-white/30 bg-transparent text-white hover:bg-white/10"
                        >
                            <Link href="/demo">Explorer la démo</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
