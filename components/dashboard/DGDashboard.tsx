"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
    TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle,
    Users, PenTool, FileText, BarChart3, MapPin,
} from "lucide-react";
import {
    BarChart, Bar, LineChart, Line,
    XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from "recharts";

const demoRevenusParPilier = [
    { pilier: "Agrément", realise: 180, objectif: 220 },
    { pilier: "Import", realise: 150, objectif: 170 },
    { pilier: "Labo", realise: 45, objectif: 50 },
    { pilier: "Amendes", realise: 30, objectif: 40 },
    { pilier: "Phyto", realise: 20, objectif: 25 },
];

const demoRevenusCumules = [
    { mois: "Jan", realise: 420, objectif: 580 },
    { mois: "Fév", realise: 850, objectif: 1170 },
    { mois: "Mar", realise: 1350, objectif: 1750 },
    { mois: "Avr", realise: 1900, objectif: 2330 },
    { mois: "Mai", realise: 2450, objectif: 2920 },
    { mois: "Jun", realise: 3100, objectif: 3500 },
    { mois: "Jul", realise: 3600, objectif: 4080 },
    { mois: "Aoû", realise: 4100, objectif: 4670 },
    { mois: "Sep", realise: 4700, objectif: 5250 },
    { mois: "Oct", realise: 5200, objectif: 5830 },
    { mois: "Nov", realise: 5800, objectif: 6420 },
    { mois: "Déc", realise: 6400, objectif: 7000 },
];

const demoProvinces = [
    { province: "Estuaire", inspections: 145, conformite: 85, recouvrement: 72, alertes: 2 },
    { province: "Haut-Ogooué", inspections: 89, conformite: 78, recouvrement: 65, alertes: 1 },
    { province: "Ogooué-Maritime", inspections: 67, conformite: 82, recouvrement: 58, alertes: 0 },
    { province: "Woleu-Ntem", inspections: 54, conformite: 71, recouvrement: 45, alertes: 3 },
    { province: "Ngounié", inspections: 42, conformite: 88, recouvrement: 62, alertes: 0 },
];

export function DGDashboard() {
    const { user } = useAuth();
    const nom = user?.nom || "Directeur Général";
    const today = new Date().toLocaleDateString("fr-FR", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
    });

    return (
        <div className="space-y-6">
            {/* Bannière */}
            <div className="border-l-4 border-[#7B2D8E] pl-4">
                <h1 className="text-2xl font-bold text-slate-900">Bonjour, M. le Directeur Général</h1>
                <p className="text-sm text-muted-foreground capitalize">{today}</p>
            </div>

            {/* Actions urgentes */}
            <Card className="bg-amber-50/60 border-amber-200 shadow-sm">
                <CardContent className="p-4 space-y-2">
                    <h3 className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" /> Actions urgentes
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <Link href="/ged/signatures" className="flex items-center gap-2 text-amber-700 hover:underline">
                            <FileText className="h-3.5 w-3.5" /> 3 documents en attente de signature
                        </Link>
                        <Link href="/ged/workflows?en_attente_de_moi=true" className="flex items-center gap-2 text-amber-700 hover:underline">
                            <PenTool className="h-3.5 w-3.5" /> 2 workflows à valider
                        </Link>
                        <Link href="/alertes" className="flex items-center gap-2 text-red-600 hover:underline font-medium">
                            <AlertTriangle className="h-3.5 w-3.5" /> 1 alerte « urgence »
                        </Link>
                        <Link href="/finance/budget" className="flex items-center gap-2 text-amber-700 hover:underline">
                            <DollarSign className="h-3.5 w-3.5" /> Budget DAF à 93%
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* KPI Macro */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[
                    { title: "Revenus encaissés (mois)", value: "425 M FCFA", trend: 18.4, icon: DollarSign, color: "bg-emerald-100 text-emerald-600" },
                    { title: "Taux de recouvrement", value: "68%", trend: 5.2, icon: Target, color: "bg-blue-100 text-blue-600" },
                    { title: "Inspections ce mois", value: "1 250", trend: 12.3, icon: BarChart3, color: "bg-purple-100 text-purple-600" },
                    { title: "Taux de conformité", value: "83%", trend: 2.1, icon: Target, color: "bg-teal-100 text-teal-600" },
                    { title: "Alertes actives", value: "3", icon: AlertTriangle, color: "bg-red-100 text-red-600" },
                    { title: "Effectif total", value: "47 / 52", icon: Users, color: "bg-slate-100 text-slate-600" },
                ].map((kpi) => (
                    <Card key={kpi.title} className="shadow-sm border-slate-200">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{kpi.title}</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-1">{kpi.value}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${kpi.color}`}>
                                    <kpi.icon className="w-6 h-6" />
                                </div>
                            </div>
                            {kpi.trend !== undefined && (
                                <div className="mt-3 flex items-center text-sm">
                                    {kpi.trend > 0 ? <TrendingUp className="w-4 h-4 mr-1 text-emerald-500" /> : <TrendingDown className="w-4 h-4 mr-1 text-red-500" />}
                                    <span className={kpi.trend > 0 ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                                        {Math.abs(kpi.trend)}%
                                    </span>
                                    <span className="text-slate-400 ml-1">vs mois précédent</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Graphiques financiers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b pb-3">
                        <CardTitle className="text-sm font-semibold">Revenus par pilier (mois en cours vs objectif)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 h-[320px]">
                        <ResponsiveContainer width="100%" height="100%" minHeight={280}>
                            <BarChart data={demoRevenusParPilier} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="pilier" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="realise" name="Réalisé (M FCFA)" fill="#7B2D8E" radius={[4, 4, 0, 0]} barSize={28} />
                                <Bar dataKey="objectif" name="Objectif" fill="#E2E8F0" radius={[4, 4, 0, 0]} barSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b pb-3">
                        <CardTitle className="text-sm font-semibold">Revenus cumulés vs objectif annuel (7 Mds FCFA)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 h-[320px]">
                        <ResponsiveContainer width="100%" height="100%" minHeight={280}>
                            <LineChart data={demoRevenusCumules} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="realise" name="Réalisé (M)" stroke="#7B2D8E" strokeWidth={3} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="objectif" name="Objectif" stroke="#94A3B8" strokeWidth={2} strokeDasharray="8 4" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Tableau comparatif provinces */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Performance par province
                    </CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-xs text-slate-500 uppercase">
                                <th className="px-5 py-3 text-left font-medium">Province</th>
                                <th className="px-5 py-3 text-right font-medium">Inspections</th>
                                <th className="px-5 py-3 text-right font-medium">Conformité%</th>
                                <th className="px-5 py-3 text-right font-medium">Recouvrement%</th>
                                <th className="px-5 py-3 text-right font-medium">Alertes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {demoProvinces.map((p, i) => (
                                <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="px-5 py-3 font-medium text-slate-900">{p.province}</td>
                                    <td className="px-5 py-3 text-right font-mono text-slate-700">{p.inspections}</td>
                                    <td className="px-5 py-3 text-right">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.conformite >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {p.conformite}%
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.recouvrement >= 60 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {p.recouvrement}%
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-right font-mono">{p.alertes > 0 ? <span className="text-red-600 font-semibold">{p.alertes}</span> : <span className="text-slate-400">0</span>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
