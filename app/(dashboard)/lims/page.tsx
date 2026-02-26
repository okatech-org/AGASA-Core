"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Microscope, Beaker, CheckCircle, ShieldAlert, AlertTriangle, Activity } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function LimsDashboardPage() {
    const { user } = useAuth();

    const data = useQuery(
        api.lims.echantillons.getDashboardStats as any,
        user?._id ? { userId: user._id } : "skip"
    );

    const COLORS = ['#1B4F72', '#27AE60', '#E67E22', '#8E44AD', '#E74C3C', '#F1C40F', '#3498DB'];

    if (data === undefined) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Synchronisation des équipements analytiques LAA...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-purple-600 pl-3">Supervision Laboratoire</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Contrôle Qualité LIMS : Analyses physiques, microbiologiques et chimiques.</p>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center text-slate-500 mb-1">
                            <span className="text-xs font-semibold uppercase">Reçus (Mois)</span>
                            <Beaker className="h-4 w-4" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{data.echantillonsMois}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Nouveaux dossiers</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-blue-200 bg-blue-50/50">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center text-blue-800 mb-1">
                            <span className="text-xs font-semibold uppercase">Tests en cours</span>
                            <Microscope className="h-4 w-4" />
                        </div>
                        <div className="text-2xl font-bold text-blue-900">{data.analysesEnCours}</div>
                        <p className="text-[10px] text-blue-700/80 mt-1">Paillasse analytique</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-purple-200 bg-purple-50/50">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center text-purple-800 mb-1">
                            <span className="text-xs font-semibold uppercase">Attente Validation</span>
                            <Activity className="h-4 w-4" />
                        </div>
                        <div className="text-2xl font-bold text-purple-900">{data.analysesTerminees}</div>
                        <p className="text-[10px] text-purple-700/80 mt-1">Signatures Niveau 2</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-emerald-200 bg-emerald-50/50">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center text-emerald-800 mb-1">
                            <span className="text-xs font-semibold uppercase">Taux CQ Conformité</span>
                            <CheckCircle className="h-4 w-4" />
                        </div>
                        <div className="text-2xl font-bold text-emerald-900">{data.tauxConformite.toFixed(1)}%</div>
                        <p className="text-[10px] text-emerald-700/80 mt-1">Matériel analysé sain</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-red-200 bg-red-50/50">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center text-red-800 mb-1">
                            <span className="text-xs font-semibold uppercase">Alertes de Seuil</span>
                            <ShieldAlert className="h-4 w-4" />
                        </div>
                        <div className="text-2xl font-bold text-red-900">{data.alertesNonConformite}</div>
                        <p className="text-[10px] text-red-700/80 mt-1">Rapports d'infraction</p>
                    </CardContent>
                </Card>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Evolution Charge Labo */}
                <Card className="shadow-sm border-slate-200 lg:col-span-2">
                    <CardHeader className="border-b bg-slate-50/50 pb-4">
                        <CardTitle className="text-base flex items-center gap-2 text-slate-800">Trafic Global du Laboratoire</CardTitle>
                        <CardDescription>Volume hebdomadaire des échantillons réceptionnés au LAA</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                            <BarChart data={data.evolutionHebdo} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="semaine" tick={{ fontSize: 12, fill: '#64748B' }} />
                                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                                <RechartsTooltip cursor={{ fill: '#F1F5F9' }} />
                                <Bar dataKey="volume" fill="#8E44AD" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Répartition Matrice */}
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="border-b bg-slate-50/50 pb-4">
                        <CardTitle className="text-base text-slate-800">Répartition par Matrice</CardTitle>
                        <CardDescription>Viande, Poisson, Eau, Sols...</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 h-[300px] flex items-center justify-center">
                        {data.repartitionMatrice.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                                <PieChart>
                                    <Pie
                                        data={data.repartitionMatrice}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.repartitionMatrice.map((entry: any, index: any) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-muted-foreground text-sm">Catalogue vide</div>
                        )}
                    </CardContent>
                </Card>

                {/* Conformité par Matrice */}
                <Card className="shadow-sm border-slate-200 lg:col-span-2">
                    <CardHeader className="border-b bg-slate-50/50 pb-4">
                        <CardTitle className="text-base text-slate-800">Taux de Conformité par Matrice</CardTitle>
                        <CardDescription>Critères chimiques & biologiques d'anormalité réglementaire</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 h-[300px]">
                        {data.tauxConformiteMatrice.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                                <BarChart data={data.tauxConformiteMatrice} layout="vertical" margin={{ top: 20, right: 30, left: 30, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                                    <YAxis dataKey="matrice" type="category" width={100} tick={{ fontSize: 12, fill: '#64748B' }} className="capitalize" />
                                    <RechartsTooltip cursor={{ fill: '#F1F5F9' }} formatter={(value: any) => `${(value as number).toFixed(1)}% `} />
                                    <Bar dataKey="taux" fill="#27AE60" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Pas de calculs terminés</div>
                        )}
                    </CardContent>
                </Card>

                {/* Alertes de Non Conformité Récentes */}
                <Card className="shadow-sm border-red-200 lg:col-span-1">
                    <CardHeader className="border-b bg-red-50/50 border-red-100 pb-4">
                        <CardTitle className="text-base text-red-800 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" /> Derniers Dépassements
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {data.dernieresAlertes.length === 0 ? (
                            <div className="p-6 text-center text-emerald-600/80 text-sm flex flex-col items-center">
                                <CheckCircle className="w-8 h-8 opacity-50 mb-2" /> Aucun dépassement constaté.
                            </div>
                        ) : (
                            <div className="divide-y divide-red-100 bg-white">
                                {data.dernieresAlertes.map((alerte: any, idx: number) => (
                                    <div key={idx} className="p-4 hover:bg-red-50/30">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-mono text-xs font-semibold text-slate-900">{alerte.echantillonReference}</span>
                                            <span className="text-[10px] text-slate-500">{format(new Date(alerte.date), "dd/MM/yy")}</span>
                                        </div>
                                        <p className="text-sm text-slate-700 mb-2">{alerte.parametreNom}</p>
                                        <div className="flex gap-2 text-xs">
                                            <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold">Res: {alerte.resultat}</span>
                                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Seuil légal: {alerte.seuil}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
