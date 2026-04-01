import { FileText, Shield, MonitorSmartphone, Scale, Phone, MapPin, Mail, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Header } from "@/components/layout/Header";

// NOTE: Pour un site public complet, on utiliserait un Layout Public incluant le Header/Footer de l'accueil.
// Ici, on réimplémente le visuel par essence de la page demandée.

export default function AProposPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* HEADER SIMPLIFIÉ (Mimétisme public) */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 shadow-sm ring-1 ring-emerald-600/20">
                            <Shield className="h-6 w-6 text-white" aria-hidden="true" />
                        </div>
                        <div>
                            <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none block">AGASA<span className="text-emerald-600">.GA</span></span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Sécurité Alimentaire</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/"><Button variant="ghost" className="text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 font-medium">Portail Citoyen</Button></Link>
                        <Link href="/login"><Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all focus:ring-4 focus:ring-emerald-600/20">Accès Agents <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
                    </div>
                </div>
            </header>

            <main className="pb-24">
                {/* HERO SECTION */}
                <section className="relative overflow-hidden bg-slate-900 pb-20 pt-24 sm:pt-32 text-center text-white">
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent" />
                    <div className="container relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 z-10">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6">
                            L'Agence Gabonaise de Sécurité Alimentaire
                        </h1>
                        <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
                            L'autorité compétente de référence pour le contrôle sanitaire, phytosanitaire et qualitatif au service de la protection des consommateurs en République Gabonaise.
                        </p>
                    </div>
                </section>

                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 space-y-24">

                    {/* 1. QUI SOMMES-NOUS */}
                    <section className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="max-w-3xl">
                            <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                <Shield className="w-8 h-8 text-emerald-600" /> Qu'est-ce que l'AGASA ?
                            </h2>
                            <div className="text-slate-600 text-lg leading-relaxed space-y-4">
                                <p>
                                    Créée pour veiller à la conformité sanitaire et phytosanitaire sur le territoire national, l'AGASA est l'organe exécutif de référence garantissant la sécurité des aliments « de la fourche à la fourchette ».
                                </p>
                                <p>
                                    Notre mission centrale s'articule autour du contrôle rigoureux des denrées alimentaires, de la protection des végétaux, et de l'inspection des établissements agro-industriels, afin de prévenir les crises sanitaires et d'assurer une qualité irréprochable aux consommateurs.
                                </p>
                            </div>

                            <div className="mt-10 grid sm:grid-cols-2 gap-6">
                                <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2"><MonitorSmartphone className="w-5 h-5 text-indigo-600" /> L'Écosystème Digital (PNDT)</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Dans le cadre du Plan National de Transition Digitale 2024-2026, l'AGASA numérise ses processus via l'infrastructure souveraine <strong>AGASA-Admin</strong> (Hub central ERP & LIMS).
                                    </p>
                                </div>
                                <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2"><MapPin className="w-5 h-5 text-emerald-600" /> Structure Nationale</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Afin d'assurer sa mission régalienne, l'Agence est structurée autour d'une Direction Générale (4 directions centrales : DERSP, DICSP, DAF, LAA) appuyée par 9 antennes provinciales.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 2. BASES LÉGALES */}
                    <section>
                        <div className="max-w-3xl mb-12">
                            <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                <Scale className="w-8 h-8 text-amber-600" /> Cadre Réglementaire & Légal
                            </h2>
                            <p className="text-slate-500 mt-4 text-lg">
                                L'action de l'AGASA s'inscrit rigoureusement dans un corpus légal national fixant les prérogatives d'inspection, d'agrément et de protection phytosanitaire.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { text: "Ordonnance n°50/78 du 28 août 1978", desc: "Portant contrôle de la qualité des produits et denrées alimentaires." },
                                { text: "Loi n° 040/2018 du 05 juillet 2018", desc: "Réglementation globale relative à la protection des végétaux en République Gabonaise." },
                                { text: "Décret n°0190/PR/MAA du 22 juin 2014", desc: "Instauration de l'agrément ou autorisation sanitaire pour la manipulation de denrées." },
                                { text: "Décret N°0578/PR/MAEP du 19 oct 2015", desc: "Conditions d'hygiène applicables dans les établissements de transformation alimentaire." },
                                { text: "Décret N°000922/PR/MAEP du 19 oct 2015", desc: "Tarification des prestations de police phytosanitaire aux frontières." },
                                { text: "Arrêté n°426/MAEP", desc: "Fixation du barème des amendes, pénalités et transactions pour les infractions sanitaires." },
                            ].map((loi, i) => (
                                <div key={i} className="group relative bg-white border border-slate-200 p-6 flex flex-col items-start hover:shadow-lg transition-all rounded-2xl hover:border-amber-300">
                                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors">{loi.text}</h4>
                                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">{loi.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 3. CONTACT */}
                    <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 overflow-hidden relative">
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-emerald-500 rounded-full blur-[100px] opacity-20"></div>
                        <h2 className="text-3xl font-bold mb-8 relative z-10">Nous Contacter</h2>

                        <div className="grid sm:grid-cols-3 gap-8 relative z-10">
                            <div className="flex items-start gap-4">
                                <MapPin className="w-6 h-6 text-emerald-400 mt-1 shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-white mb-1">Siège Social</h4>
                                    <p className="text-slate-400 text-sm">Quartier Batterie IV<br />Libreville, Gabon</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Phone className="w-6 h-6 text-emerald-400 mt-1 shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-white mb-1">Téléphone & Email</h4>
                                    <p className="text-slate-400 text-sm">+241 11 00 00 00<br />contact@agasa.ga</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Clock className="w-6 h-6 text-emerald-400 mt-1 shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-white mb-1">Horaires d'Ouverture</h4>
                                    <p className="text-slate-400 text-sm">Lundi à Vendredi<br />08h00 - 18h00</p>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </main>

            {/* FOOTER PUBLIC */}
            <footer className="border-t border-slate-200 bg-white py-12">
                <div className="container mx-auto px-4 text-center text-sm text-slate-500">
                    <p className="font-semibold mb-2">AGASA - Agence Gabonaise de Sécurité Alimentaire</p>
                    <p>© 2026 Tous droits réservés. Plateforme propulsée par l'écosystème institutionnel du PNDT.</p>
                </div>
            </footer>
        </div>
    );
}
