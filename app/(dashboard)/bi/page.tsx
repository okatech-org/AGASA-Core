"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, ClipboardCheck, Scale, AlertTriangle, Coins, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
    ComposedChart
} from "recharts";

export default function BIDashboardOpPage() {
    const { user } = useAuth();

    // Remplacé par les VRAIES requêtes backend (via snapshots pour la perf)
    const snapshots = useQuery(api.bi.snapshots.getDernierSnapshot as any);
    const chartsData = useQuery(api.bi.kpi.getDashboardData as any, user?._id ? { userId: user._id } : "skip");

    if (!snapshots || !chartsData) return (
        <div className="space-y-6 animate-pulse">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-72 bg-slate-200" />
                    <Skeleton className="h-4 w-96 bg-slate-100" />
                </div>
                <Skeleton className="h-10 w-[180px] bg-slate-100 rounded-md" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-[140px] rounded-xl bg-slate-50 border border-slate-100" />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-[350px] rounded-xl bg-slate-50 border border-slate-100" />
                ))}
            </div>

            <Skeleton className="h-[300px] w-full rounded-xl bg-slate-50 border border-slate-100 mt-6" />
        </div>
    );

    const { macroStats, provinces } = snapshots;

    // Stat Cards Component
    const KpiCard = ({ title, value, icon: Icon, trend, sub }: any) => (
        <Card className="shadow-sm border-slate-200">
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-500 truncate">{title}</p>
                        <p className="text-3xl font-bold text-slate-900">{value}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${trend && trend > 0 ? 'bg-emerald-100 text-emerald-600' : trend && trend < 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                </div>
                {trend !== undefined && (
                    <div className="mt-4 flex items-center text-sm">
                        {trend > 0 ? <TrendingUp className="w-4 h-4 mr-1 text-emerald-500" /> : <TrendingDown className="w-4 h-4 mr-1 text-red-500" />}
                        <span className={trend > 0 ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                            {Math.abs(trend)}%
                        </span>
                        <span className="text-slate-400 ml-1">vs mois précis</span>
                    </div>
                )}
                {sub && <p className="text-xs text-slate-400 mt-4">{sub}</p>}
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-indigo-600 pl-3">Tableau de Bord Décisionnel (Opérations)</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Vue macroscopique des opérations d'inspections, finances, et qualités.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select defaultValue="ce_mois">
                        <SelectTrigger className="w-[180px] bg-white"><SelectValue placeholder="Période" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="aujourdhui">Aujourd'hui</SelectItem>
                            <SelectItem value="cette_semaine">Cette semaine</SelectItem>
                            <SelectItem value="ce_mois">Ce Mois (En cours)</SelectItem>
                            <SelectItem value="trimestre">Ce Trimestre</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* LIGNE 1 : KPI MACRO */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <KpiCard
                    title="Inspections Réalisées" value={macroStats.inspectionsMois}
                    icon={ClipboardCheck} trend={macroStats.varInspections}
                />
                <KpiCard
                    title="Taux de Conformité Global" value={`${macroStats.conformiteGlobale}%`}
                    icon={Target} trend={macroStats.varConformite}
                />
                <KpiCard
                    title="Volume Produits Saisis" value={`${macroStats.tonnesSaisies} Tonnes`}
                    icon={AlertTriangle} trend={5.2} sub={`Valeur marchande: ${(macroStats.valeurSaisies / 1000000).toFixed(1)}M FCFA`}
                />
                <KpiCard
                    title="Délai Moyen (Agréments)" value={`${macroStats.delaiAgrementMoyen} Jours`}
                    icon={Scale} trend={-12.5} sub="Objectif National : < 21 jours"
                />
                <KpiCard
                    title="Taux Recouvrement Amendes" value={`${macroStats.tauxRecouvrement}%`}
                    icon={TrendingUp} sub="Objectif An 1 : 50%"
                />
                <KpiCard
                    title="Revenus Encaissés (Mensuel)" value={`${(macroStats.revenusMensuels / 1000000).toFixed(1)} M FCFA`}
                    icon={Coins} trend={18.4}
                />
            </div>

            {/* LIGNE 2 : GRAPHIQUES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b pb-4">
                        <CardTitle className="text-base">Inspections par Province (Objectif vs Réel)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                            <BarChart data={provinces} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="nom" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                <Tooltip cursor={{ fill: '#F1F5F9' }} />
                                <Legend />
                                <Bar dataKey="inspections" name="Nb. Inspections" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b pb-4">
                        <CardTitle className="text-base">Évolution Taux de Conformité (12 Mois)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                            <LineChart data={chartsData.evolutionConformite} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                <YAxis domain={[50, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="taux" name="Taux de conformité (%)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b pb-4">
                        <CardTitle className="text-base">Mix de Revenus (Par Pilier Métier)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                            <PieChart>
                                <Pie
                                    data={chartsData.repartitionRedevances}
                                    cx="50%" cy="50%"
                                    innerRadius={80} outerRadius={110}
                                    paddingAngle={5} dataKey="value"
                                >
                                    {chartsData.repartitionRedevances.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: any) => new Intl.NumberFormat('fr-GA', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(value)} />
                                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '11px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b pb-4">
                        <CardTitle className="text-base text-red-800">Top 10 : Établissements Multirécidivistes</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                            <BarChart data={chartsData.topDelinquants} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                                <YAxis dataKey="etab" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#334155' }} width={100} />
                                <Tooltip cursor={{ fill: '#FEE2E2' }} />
                                <Bar dataKey="infractions" name="Nbr Infractions Détectées" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={16} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* LIGNE 3 : Matrices Détaillées */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b">
                    <CardTitle className="text-base">Matrice de Performance Provinciale</CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 bg-slate-50/50 uppercase border-b">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Territoire Provincial</th>
                                <th className="px-6 py-4 font-semibold text-right">Inspections</th>
                                <th className="px-6 py-4 font-semibold text-right">Taux Conformité</th>
                                <th className="px-6 py-4 font-semibold text-right">Taux Recouvr.</th>
                                <th className="px-6 py-4 font-semibold text-right">Infractions Actes</th>
                                <th className="px-6 py-4 font-semibold text-right">Saisies (Alerte)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {provinces.map((prov: any, idx: number) => (
                                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{prov.nom}</td>
                                    <td className="px-6 py-4 text-right font-mono text-slate-700">{prov.inspections}</td>
                                    <td className="px-6 py-4 text-right font-mono">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${prov.conformite >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {prov.conformite}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${prov.recouvrement >= 50 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {prov.recouvrement}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-slate-700">{prov.amendes}</td>
                                    <td className="px-6 py-4 text-right font-mono text-orange-600 font-semibold">{prov.saisies}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

        </div>
    );
}
