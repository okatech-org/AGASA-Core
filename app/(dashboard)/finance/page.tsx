"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
    DollarSign, PiggyBank, Receipt, CreditCard, Landmark,
    ArrowRight, Loader2, TrendingUp, TrendingDown,
} from "lucide-react";

const formatCFA = (n: number) => new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";
const formatPct = (n: number) => n.toFixed(1) + "%";

const sousModules = [
    { label: "Gestion budgétaire", href: "/finance/budget", icon: PiggyBank, desc: "Lignes, engagements, consommation" },
    { label: "Redevances & Amendes", href: "/finance/redevances", icon: Receipt, desc: "Émissions, recouvrement, relances" },
    { label: "Comptabilité publique", href: "/finance/comptabilite", icon: Landmark, desc: "Écritures, journaux, rapprochements" },
    { label: "Passerelle paiement", href: "/finance/paiements", icon: CreditCard, desc: "Paiements, mobile money, virements" },
];

export default function FinancePage() {
    const { user } = useAuth();
    const userId = user?._id;

    const budget = useQuery(api.finance.budget.getBudgetDashboardStats, userId ? { userId } : "skip");

    const isLoading = budget === undefined;

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                    <DollarSign className="h-6 w-6 text-emerald-600" />
                    Finance & Comptabilité
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Budget, redevances, amendes, recouvrement et comptabilité publique
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm border-emerald-100">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase">Budget alloué</p>
                                <p className="text-xl font-bold text-emerald-700 mt-1">{budget ? formatCFA(budget.totalAlloue) : "—"}</p>
                            </div>
                            <PiggyBank className="h-5 w-5 text-emerald-400" />
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Exercice {budget?.annee}</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-blue-100">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase">Engagé</p>
                                <p className="text-xl font-bold text-blue-700 mt-1">{budget ? formatCFA(budget.totalEngage) : "—"}</p>
                            </div>
                            <TrendingUp className="h-5 w-5 text-blue-400" />
                        </div>
                        <p className="text-xs text-slate-400 mt-2">{budget ? formatPct(budget.pctEngage) : "—"} du budget</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-amber-100">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase">Consommé</p>
                                <p className="text-xl font-bold text-amber-700 mt-1">{budget ? formatCFA(budget.totalConsomme) : "—"}</p>
                            </div>
                            <TrendingDown className="h-5 w-5 text-amber-400" />
                        </div>
                        <p className="text-xs text-slate-400 mt-2">{budget ? formatPct(budget.pctConsomme) : "—"} du budget</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-violet-100">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase">Disponible</p>
                                <p className="text-xl font-bold text-violet-700 mt-1">{budget ? formatCFA(budget.totalDisponible) : "—"}</p>
                            </div>
                            <DollarSign className="h-5 w-5 text-violet-400" />
                        </div>
                        <p className="text-xs text-slate-400 mt-2">{budget ? formatPct(budget.pctDisponible) : "—"} restant</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Access to Sub-Modules */}
            <div>
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Sous-modules</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    {sousModules.map((sm) => (
                        <Link key={sm.href} href={sm.href}>
                            <Card className="hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="rounded-lg bg-emerald-50 p-2.5 group-hover:bg-emerald-100 transition-colors">
                                        <sm.icon className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm">{sm.label}</p>
                                        <p className="text-xs text-muted-foreground truncate">{sm.desc}</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
