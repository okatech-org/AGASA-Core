"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, ShieldAlert, AlertTriangle, Scale, Target, ListOrdered } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useRouter } from "next/navigation";

export default function RedevancesDashboardPage() {
    const { user } = useAuth();
    const router = useRouter();

    const data = useQuery(api.finance.redevances.getDashboardStats, {
        userId: user?._id as any
    });

    const formatMontant = (m: number) => {
        return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XAF", maximumFractionDigits: 0 }).format(m);
    };

    const COLORS = ['#1B4F72', '#27AE60', '#E67E22', '#8E44AD', '#E74C3C'];

    if (data === undefined) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Calcul des statistiques de facturation et recouvrement...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-[#27AE60] pl-3">Redevances & Recouvrement</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Pilotage des factures (Agrément, Phyto, Import, Analyses) et recouvrement des créances.</p>
                </div>
                <Button onClick={() => router.push('/finance/redevances/liste')} className="bg-[#1B4F72] hover:bg-[#1B4F72]/90">
                    <ListOrdered className="w-4 h-4 mr-2" /> Explorer les Créances
                </Button>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center text-slate-500 mb-1">
                            <span className="text-xs font-semibold uppercase">Attendues (Mois)</span>
                            <Target className="h-4 w-4" />
                        </div>
                        <div className="text-xl font-bold text-slate-900">{formatMontant(data.totalAttenduMois)}</div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-emerald-200 bg-emerald-50/50">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center text-emerald-800 mb-1">
                            <span className="text-xs font-semibold uppercase">Encaissé (Mois)</span>
                            <DollarSign className="h-4 w-4" />
                        </div>
                        <div className="text-xl font-bold text-emerald-900">{formatMontant(data.totalEncaisseMois)}</div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center text-slate-500 mb-1">
                            <span className="text-xs font-semibold uppercase">Recouvrement M.</span>
                            <Scale className="h-4 w-4" />
                        </div>
                        <div className="text-xl font-bold text-slate-900">{data.tauxRecouvrement.toFixed(1)}%</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Objectif An 1 : 50%</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-amber-200 bg-amber-50/50">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center text-amber-800 mb-1">
                            <span className="text-xs font-semibold uppercase">En Retard</span>
                            <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div className="text-xl font-bold text-amber-900">{formatMontant(data.montantEnRetardTotal)}</div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-red-200 bg-red-50/50">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center text-red-800 mb-1">
                            <span className="text-xs font-semibold uppercase">Recouvr. Forcé</span>
                            <ShieldAlert className="h-4 w-4" />
                        </div>
                        <div className="text-xl font-bold text-red-900">{formatMontant(data.montantRecouvrementForce)}</div>
                        <p className="text-[10px] text-red-700/80 mt-1">Trésor Public</p>
                    </CardContent>
                </Card>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Evolution Taux de Recouvrement */}
                <Card className="shadow-sm border-slate-200 lg:col-span-2">
                    <CardHeader className="border-b bg-slate-50/50 pb-4">
                        <CardTitle className="text-base flex items-center gap-2 text-slate-800">Taux de Recouvrement Annuel</CardTitle>
                        <CardDescription>Progression du ratio d'encaissement sur 12 mois</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                            <LineChart data={data.recouvrementMensuel} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#64748B' }} />
                                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(t) => `${t}%`} domain={[0, 100]} />
                                <RechartsTooltip formatter={(value: any) => `${value}%`} />
                                <Line type="monotone" dataKey="taux" stroke="#27AE60" strokeWidth={3} dot={{ r: 4, fill: '#27AE60' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Répartition par Type */}
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="border-b bg-slate-50/50 pb-4">
                        <CardTitle className="text-base text-slate-800">Emissions par Catégorie</CardTitle>
                        <CardDescription>Répartition des factures</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 h-[300px] flex items-center justify-center">
                        {data.repartitionTypeData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                                <PieChart>
                                    <Pie
                                        data={data.repartitionTypeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.repartitionTypeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip formatter={(value: any) => formatMontant(value as number)} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-muted-foreground text-sm">Aucune donnée classifiée</div>
                        )}
                    </CardContent>
                </Card>

                {/* Encaissements par Province */}
                <Card className="shadow-sm border-slate-200 lg:col-span-3">
                    <CardHeader className="border-b bg-slate-50/50 pb-4">
                        <CardTitle className="text-base text-slate-800">Encaissements par Province d'Origine</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 h-[300px]">
                        {data.repartitionProvinceData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                                <BarChart data={data.repartitionProvinceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="province" tick={{ fontSize: 12, fill: '#64748B' }} />
                                    <YAxis tickFormatter={(value) => `${value / 1000000}M`} hide />
                                    <RechartsTooltip cursor={{ fill: '#F1F5F9' }} formatter={(value: any) => formatMontant(value as number)} />
                                    <Bar dataKey="montant" fill="#1B4F72" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Aucun encaissement validé</div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
