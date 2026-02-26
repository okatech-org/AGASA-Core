"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Landmark, BookOpen, Scale, FileText, LinkIcon,
    ArrowRight, Loader2, TrendingUp, CheckCircle, AlertTriangle,
} from "lucide-react";

const formatCFA = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XAF", maximumFractionDigits: 0 }).format(n);

const sousModules = [
    {
        label: "Journal Comptable",
        href: "/finance/comptabilite/journal",
        icon: BookOpen,
        desc: "Grand livre, saisie des écritures, brouillard comptable",
        color: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
    },
    {
        label: "États Financiers",
        href: "/finance/comptabilite/etats",
        icon: Scale,
        desc: "Balance générale, bilan, compte de résultat, liasses fiscales",
        color: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
    },
    {
        label: "Rapprochement Bancaire",
        href: "/finance/comptabilite/rapprochement",
        icon: LinkIcon,
        desc: "Pointage des écritures banque, import de relevés CSV",
        color: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
    },
];

export default function ComptabilitePage() {
    const { user } = useAuth();
    const userId = user?._id;
    const exercice = new Date().getFullYear();

    // KPIs from existing backend queries
    const journal = useQuery(
        api.finance.comptabilite.listerEcritures,
        userId ? { userId, exercice, journal: "tous" } : "skip"
    );
    const rapprochement = useQuery(
        api.finance.comptabilite.getStatsRapprochement,
        userId ? { userId } : "skip"
    );
    const etats = useQuery(
        api.finance.comptabilite.getEtatsFinanciers,
        userId ? { userId, exercice } : "skip"
    );

    const isLoading = journal === undefined || rapprochement === undefined || etats === undefined;

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
            </div>
        );
    }

    const totalEcritures = journal?.ecritures?.length ?? 0;
    const totalDebit = journal?.totalDebit ?? 0;
    const totalCredit = journal?.totalCredit ?? 0;
    const solde = journal?.solde ?? 0;
    const resultatNet = etats?.resultatNet ?? 0;
    const tauxRappro = rapprochement?.tauxAvancement ?? 0;
    const lignesEnAttente = rapprochement?.lignesEnAttente ?? 0;
    const lignesRapprochees = rapprochement?.lignesRapprochees ?? 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
                    <Landmark className="h-6 w-6 text-slate-700" />
                    Comptabilité Publique
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Vue d'ensemble des écritures comptables, rapprochement bancaire et états financiers — Exercice {exercice}
                </p>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Écritures */}
                <Card className="shadow-sm border-slate-200 hover:border-slate-300 transition-colors">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Écritures</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{totalEcritures}</p>
                            </div>
                            <div className="rounded-lg bg-slate-100 p-2">
                                <BookOpen className="h-5 w-5 text-slate-500" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Lignes comptabilisées en {exercice}</p>
                    </CardContent>
                </Card>

                {/* Flux Débit / Crédit */}
                <Card className="shadow-sm border-blue-100 hover:border-blue-200 transition-colors">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Flux Débiteur</p>
                                <p className="text-xl font-bold text-blue-700 mt-1">{formatCFA(totalDebit)}</p>
                            </div>
                            <div className="rounded-lg bg-blue-50 p-2">
                                <TrendingUp className="h-5 w-5 text-blue-500" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-slate-400">Crédit :</span>
                            <span className="text-xs font-medium text-slate-600">{formatCFA(totalCredit)}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Solde Périodique */}
                <Card className={`shadow-sm transition-colors ${solde >= 0 ? "border-emerald-100 hover:border-emerald-200" : "border-red-100 hover:border-red-200"}`}>
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Solde Périodique</p>
                                <p className={`text-xl font-bold mt-1 ${solde >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                                    {formatCFA(solde)}
                                </p>
                            </div>
                            <div className={`rounded-lg p-2 ${solde >= 0 ? "bg-emerald-50" : "bg-red-50"}`}>
                                <Scale className={`h-5 w-5 ${solde >= 0 ? "text-emerald-500" : "text-red-500"}`} />
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Débit − Crédit cumulé</p>
                    </CardContent>
                </Card>

                {/* Résultat Net */}
                <Card className={`shadow-sm transition-colors ${resultatNet >= 0 ? "border-emerald-100 hover:border-emerald-200" : "border-red-100 hover:border-red-200"}`}>
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Résultat Net</p>
                                <p className={`text-xl font-bold mt-1 ${resultatNet >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                                    {formatCFA(resultatNet)}
                                </p>
                            </div>
                            <div className="rounded-lg bg-purple-50 p-2">
                                <FileText className="h-5 w-5 text-purple-500" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Produits (cl.7) − Charges (cl.6)</p>
                    </CardContent>
                </Card>
            </div>

            {/* Rapprochement Progress */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50/50 border-b pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base flex items-center gap-2">
                                <LinkIcon className="h-4 w-4 text-slate-500" />
                                Rapprochement Bancaire
                            </CardTitle>
                            <CardDescription className="mt-0.5">Synchronisation du journal « Banque » avec les relevés importés</CardDescription>
                        </div>
                        <Link href="/finance/comptabilite/rapprochement">
                            <Badge variant="outline" className="cursor-pointer hover:bg-slate-100 transition-colors">
                                Détails <ArrowRight className="ml-1 h-3 w-3" />
                            </Badge>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-slate-700">Progression du Pointage</span>
                        <span className="text-sm font-bold text-emerald-700">{tauxRappro.toFixed(0)}%</span>
                    </div>
                    <Progress value={tauxRappro} className="h-2.5 bg-slate-100 [&>div]:bg-emerald-500" />
                    <div className="flex items-center gap-6 mt-4">
                        <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                            <span className="text-slate-600"><strong className="text-slate-900">{lignesRapprochees}</strong> pointées</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <span className="text-slate-600"><strong className="text-orange-700">{lignesEnAttente}</strong> en suspens</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Sub-modules Navigation */}
            <div>
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Accès Rapide</h2>
                <div className="grid gap-3 sm:grid-cols-3">
                    {sousModules.map((sm) => (
                        <Link key={sm.href} href={sm.href}>
                            <Card className="hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group h-full">
                                <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                                    <div className={`rounded-xl p-3 transition-colors ${sm.color}`}>
                                        <sm.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-slate-900">{sm.label}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{sm.desc}</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
