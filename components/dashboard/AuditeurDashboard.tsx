"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
    ClipboardList, DollarSign, FileText, PenTool, Network,
    FileSearch, ShieldCheck, BarChart3, Clock,
} from "lucide-react";

export function AuditeurDashboard() {
    const { user } = useAuth();
    const nom = user?.nom || "Auditeur";
    const today = new Date().toLocaleDateString("fr-FR", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
    });

    const demoTimeline = [
        { date: "25/02/2026 14h32", user: "M. Obiang (admin)", action: "Modification du rôle de Mme Nzé", module: "Admin" },
        { date: "25/02/2026 13h15", user: "Mme Mintsa (agent)", action: "Demande de congé soumise", module: "RH" },
        { date: "25/02/2026 11h45", user: "DG", action: "Workflow approuvé : marché réactifs", module: "GED" },
        { date: "24/02/2026 17h20", user: "M. Ndong (tech)", action: "Résultat saisi ECH-2026-1012", module: "LIMS" },
        { date: "24/02/2026 16h00", user: "Admin", action: "Export journal d'audit (450 lignes)", module: "Admin" },
    ];

    return (
        <div className="space-y-6">
            {/* Bannière */}
            <div className="bg-slate-800 text-white rounded-lg p-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5" /> Portail d&apos;Audit — AGASA-Admin
                    </h1>
                    <p className="text-sm text-slate-300 mt-1">Bienvenue, {nom} — {today}</p>
                </div>
                <span className="text-xs text-slate-400 bg-slate-700 px-3 py-1 rounded-full">
                    🔒 Accès en lecture seule — Conformité CTRI
                </span>
            </div>

            {/* KPI Traçabilité */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                    { title: "Actions enregistrées (30j)", value: "3 420", icon: BarChart3, color: "bg-slate-100 text-slate-600" },
                    { title: "Redevances tracées (exercice)", value: "2.8 Mds FCFA", sub: "68% encaissées, 22% en recouvrement", icon: DollarSign, color: "bg-slate-100 text-slate-600" },
                    { title: "Documents signés (exercice)", value: "127", icon: FileText, color: "bg-slate-100 text-slate-600" },
                    { title: "Anomalies détectées", value: "4", icon: ClipboardList, color: "bg-amber-100 text-amber-600" },
                ].map((kpi) => (
                    <Card key={kpi.title} className="shadow-sm border-slate-200">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{kpi.title}</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</p>
                                </div>
                                <div className={`p-2.5 rounded-lg ${kpi.color}`}>
                                    <kpi.icon className="w-5 h-5" />
                                </div>
                            </div>
                            {kpi.sub && <p className="text-xs text-slate-400 mt-2">{kpi.sub}</p>}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Accès rapide */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                    { title: "Journal d'audit complet", sub: "Historique exhaustif de toutes les actions", icon: FileSearch, href: "/audit/journal" },
                    { title: "Traçabilité financière", sub: "Parcours de chaque redevance et amende", icon: DollarSign, href: "/audit/finance" },
                    { title: "Rapports financiers", sub: "États financiers, exécution budgétaire", icon: FileText, href: "/audit/rapports-financiers" },
                    { title: "Chaîne de signatures", sub: "Vérification d'authenticité", icon: PenTool, href: "/audit/signatures" },
                    { title: "Flux inter-applications", sub: "Échanges de données entre apps", icon: Network, href: "/audit/flux" },
                    { title: "Rapports d'audit", sub: "Générez des rapports personnalisés", icon: ClipboardList, href: "/audit/rapports" },
                ].map((card) => (
                    <Link key={card.href} href={card.href}>
                        <Card className="shadow-sm border-slate-200 hover:border-slate-400 hover:shadow-md transition-all cursor-pointer h-full">
                            <CardContent className="p-4 flex items-start gap-3">
                                <div className="p-2.5 rounded-lg bg-slate-100">
                                    <card.icon className="h-5 w-5 text-slate-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900">{card.title}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">{card.sub}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Activité récente */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Activité système récente
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-xs text-slate-500 uppercase bg-slate-50/50">
                                <th className="px-4 py-2.5 text-left font-medium">Date/Heure</th>
                                <th className="px-4 py-2.5 text-left font-medium">Utilisateur</th>
                                <th className="px-4 py-2.5 text-left font-medium">Action</th>
                                <th className="px-4 py-2.5 text-left font-medium">Module</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {demoTimeline.map((entry, i) => (
                                <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="px-4 py-2.5 text-slate-500 font-mono text-xs">{entry.date}</td>
                                    <td className="px-4 py-2.5 font-medium text-slate-700">{entry.user}</td>
                                    <td className="px-4 py-2.5 text-slate-600">{entry.action}</td>
                                    <td className="px-4 py-2.5">
                                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                            {entry.module}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
