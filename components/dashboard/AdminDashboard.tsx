"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
    Users, Activity, BarChart3, AlertTriangle, Network,
    TrendingUp, TrendingDown, ExternalLink, Shield,
} from "lucide-react";
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from "recharts";

// ============================================================================
// Static demo data (replaced by Convex queries when available)
// ============================================================================
const demoKpis = {
    usersActive: 47, usersTotal: 52,
    sessionsActive: 12,
    actions24h: 234,
    alertesSysteme: 2,
    fluxOk: 5, fluxTotal: 6,
};

const demoConnexionsParJour = [
    { jour: "Lun", connexions: 34 },
    { jour: "Mar", connexions: 42 },
    { jour: "Mer", connexions: 38 },
    { jour: "Jeu", connexions: 51 },
    { jour: "Ven", connexions: 45 },
    { jour: "Sam", connexions: 12 },
    { jour: "Dim", connexions: 8 },
];

const demoRepartitionRoles = [
    { name: "Admin", value: 2, color: "#991B1B" },
    { name: "DG", value: 1, color: "#7B2D8E" },
    { name: "Directeurs", value: 5, color: "#1D4ED8" },
    { name: "Chefs de service", value: 8, color: "#0EA5E9" },
    { name: "Agents", value: 28, color: "#22C55E" },
    { name: "Techniciens", value: 6, color: "#F97316" },
    { name: "Auditeurs", value: 2, color: "#6B7280" },
];

const demoUsersParProvince = [
    { province: "Estuaire", total: 18 },
    { province: "Siège", total: 12 },
    { province: "Haut-Ogooué", total: 5 },
    { province: "Ogooué-Maritime", total: 4 },
    { province: "Woleu-Ntem", total: 3 },
    { province: "Ngounié", total: 3 },
    { province: "Moyen-Ogooué", total: 2 },
    { province: "Ogooué-Ivindo", total: 2 },
    { province: "Ogooué-Lolo", total: 2 },
    { province: "Nyanga", total: 1 },
].sort((a, b) => b.total - a.total);

const demoRecentActions = [
    { heure: "14h32", utilisateur: "M. Obiang", action: "Connexion", module: "Auth" },
    { heure: "14h18", utilisateur: "Mme Nzé", action: "Résultat saisi", module: "LIMS" },
    { heure: "13h45", utilisateur: "Admin", action: "Modification rôle", module: "Admin" },
    { heure: "12h30", utilisateur: "M. Mba", action: "Congé soumis", module: "RH" },
    { heure: "11h15", utilisateur: "M. Ndong", action: "Export CSV", module: "Finance" },
];

// ============================================================================
// KPI Card
// ============================================================================
function KpiCard({ title, value, sub, icon: Icon, trend, color, badge }: {
    title: string; value: string; sub?: string; icon: any; trend?: number; color: string; badge?: number;
}) {
    return (
        <Card className="shadow-sm border-slate-200">
            <CardContent className="p-5">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-500">{title}</p>
                        <p className="text-2xl font-bold text-slate-900">{value}</p>
                    </div>
                    <div className={`p-2.5 rounded-lg ${color} relative`}>
                        <Icon className="w-5 h-5" />
                        {badge !== undefined && badge > 0 && (
                            <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                                {badge}
                            </span>
                        )}
                    </div>
                </div>
                {sub && <p className="text-xs text-slate-400 mt-3">{sub}</p>}
            </CardContent>
        </Card>
    );
}

// ============================================================================
// AdminDashboard
// ============================================================================
export function AdminDashboard() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
                    <Shield className="h-6 w-6 text-[#1B4F72]" />
                    Administration Système
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Santé du système, utilisateurs et monitoring AGASA-Admin
                </p>
            </div>

            {/* LIGNE 1 — KPI Santé du système */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                <KpiCard
                    title="Utilisateurs actifs"
                    value={`${demoKpis.usersActive} / ${demoKpis.usersTotal}`}
                    icon={Users}
                    color="bg-blue-100 text-blue-600"
                    sub="actifs sur le système"
                />
                <KpiCard
                    title="Sessions actives"
                    value={`${demoKpis.sessionsActive}`}
                    icon={Activity}
                    color="bg-emerald-100 text-emerald-600"
                    sub="en ce moment"
                />
                <KpiCard
                    title="Actions (24h)"
                    value={`${demoKpis.actions24h}`}
                    icon={BarChart3}
                    color="bg-purple-100 text-purple-600"
                    sub="enregistrées dans le journal"
                />
                <KpiCard
                    title="Alertes système"
                    value={`${demoKpis.alertesSysteme}`}
                    icon={AlertTriangle}
                    color={demoKpis.alertesSysteme > 0 ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"}
                    badge={demoKpis.alertesSysteme > 0 ? demoKpis.alertesSysteme : undefined}
                />
                <KpiCard
                    title="Flux inter-apps"
                    value={`${demoKpis.fluxOk}/${demoKpis.fluxTotal}`}
                    icon={Network}
                    color={demoKpis.fluxOk < demoKpis.fluxTotal ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}
                    sub="opérationnels"
                    badge={demoKpis.fluxOk < demoKpis.fluxTotal ? demoKpis.fluxTotal - demoKpis.fluxOk : undefined}
                />
            </div>

            {/* LIGNE 2 — Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Connexions par jour */}
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b pb-3">
                        <CardTitle className="text-sm font-semibold">Connexions par jour (7j)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 h-[280px]">
                        <ResponsiveContainer width="100%" height="100%" minHeight={240}>
                            <BarChart data={demoConnexionsParJour} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="jour" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                                <Tooltip cursor={{ fill: '#F1F5F9' }} />
                                <Bar dataKey="connexions" fill="#1B4F72" radius={[4, 4, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Répartition par rôle */}
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b pb-3">
                        <CardTitle className="text-sm font-semibold">Répartition par rôle</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 h-[280px]">
                        <ResponsiveContainer width="100%" height="100%" minHeight={240}>
                            <PieChart>
                                <Pie
                                    data={demoRepartitionRoles}
                                    cx="40%" cy="50%"
                                    innerRadius={50} outerRadius={80}
                                    paddingAngle={3} dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {demoRepartitionRoles.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Users par province */}
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b pb-3">
                        <CardTitle className="text-sm font-semibold">Utilisateurs par province</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 h-[280px]">
                        <ResponsiveContainer width="100%" height="100%" minHeight={240}>
                            <BarChart data={demoUsersParProvince} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                                <YAxis dataKey="province" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#334155' }} width={90} />
                                <Tooltip cursor={{ fill: '#F1F5F9' }} />
                                <Bar dataKey="total" fill="#1B4F72" radius={[0, 4, 4, 0]} barSize={14} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* LIGNE 3 — Activité récente + Alertes */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Activité récente */}
                <Card className="lg:col-span-3 shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b pb-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-semibold">Dernières actions du journal d&apos;audit</CardTitle>
                        <Link href="/admin/audit" className="text-xs text-agasa-primary hover:underline flex items-center gap-1">
                            Voir tout <ExternalLink className="h-3 w-3" />
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-slate-50/50 text-xs text-slate-500 uppercase">
                                    <th className="px-4 py-2 text-left font-medium">Heure</th>
                                    <th className="px-4 py-2 text-left font-medium">Utilisateur</th>
                                    <th className="px-4 py-2 text-left font-medium">Action</th>
                                    <th className="px-4 py-2 text-left font-medium">Module</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {demoRecentActions.map((a, i) => (
                                    <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="px-4 py-2.5 text-slate-500 font-mono text-xs">{a.heure}</td>
                                        <td className="px-4 py-2.5 font-medium text-slate-700">{a.utilisateur}</td>
                                        <td className="px-4 py-2.5 text-slate-600">{a.action}</td>
                                        <td className="px-4 py-2.5">
                                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                                {a.module}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* Alertes système */}
                <Card className="lg:col-span-2 shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b pb-3">
                        <CardTitle className="text-sm font-semibold">Alertes système</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                        {demoKpis.alertesSysteme > 0 ? (
                            <>
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
                                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-red-800">1 compte verrouillé</p>
                                        <p className="text-xs text-red-600 mt-0.5">demo-test@agasa.ga — 5 tentatives échouées</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 border border-orange-100">
                                    <Network className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-orange-800">Flux F3 en erreur</p>
                                        <p className="text-xs text-orange-600 mt-0.5">AGASA-Admin → AGASA-Inspect — Timeout</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2 p-4 text-center justify-center">
                                <span className="text-sm text-emerald-600">✅ Aucune alerte système en cours</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
