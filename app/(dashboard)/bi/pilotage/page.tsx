"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Scale, Clock, ShieldCheck, Users, GraduationCap, LayoutDashboard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
    BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, LineChart, Line
} from "recharts";

export default function PilotageStrategiquePage() {
    const { user } = useAuth();

    const pilotageParams = useQuery(api.bi.pilotage.getPilotageData as any, user?._id ? { userId: user._id } : "skip");

    if (!pilotageParams) return (
        <div className="space-y-6 animate-pulse">
            <div className="flex items-start gap-4 pb-4 border-b">
                <Skeleton className="w-14 h-14 rounded-lg bg-indigo-100/50" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64 bg-slate-200" />
                    <Skeleton className="h-4 w-96 bg-slate-100" />
                </div>
            </div>

            <div className="space-y-4">
                <Skeleton className="h-6 w-48 bg-slate-200" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-[370px] rounded-xl bg-slate-50 border border-slate-100" />
                    <Skeleton className="h-[370px] rounded-xl bg-slate-50 border border-slate-100" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                <Skeleton className="h-[300px] rounded-xl bg-slate-50 border border-slate-100" />
                <Skeleton className="h-[300px] rounded-xl bg-slate-50 border border-slate-100" />
                <Skeleton className="h-[300px] rounded-xl bg-slate-50 border border-slate-100" />
            </div>
        </div>
    );

    const { perfPiliers, cummulAnnuel, perfProvinciale, sla, rh } = pilotageParams;

    return (
        <div className="space-y-6">
            <div className="flex items-start gap-4 pb-4 border-b">
                <div className="p-3 bg-slate-900 rounded-lg text-white">
                    <LayoutDashboard className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Cabinet Direction Générale</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Tour de contrôle stratégique : Finances, Performance SLA et Ressources Humaines.</p>
                </div>
            </div>

            {/* SECTION 1 : FINANCE MACRO */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-indigo-600" /> Objectifs de Recettes (Mds FCFA)</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50 border-b pb-4">
                            <CardTitle className="text-base flex justify-between">
                                Revenus Générés par Pilier vs Cible
                                <span className="text-xs text-slate-500 font-normal">Objectif total estimé : 7.3 Mds</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 h-[300px]">
                            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                                <BarChart data={perfPiliers} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                                    <YAxis type="category" dataKey="nom" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#334155' }} width={130} />
                                    <Tooltip cursor={{ fill: '#F8FAFC' }} formatter={(value: any) => `${value} Mds FCFA`} />
                                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                    <Bar dataKey="reel" name="Réalisé (Encaisse)" fill="#10b981" radius={[0, 4, 4, 0]} />
                                    <Bar dataKey="objectif" name="Prévisionnel Budget" fill="#cbd5e1" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50 border-b pb-4">
                            <CardTitle className="text-base">Maturité Financière Annuelle</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 h-[300px]">
                            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                                <LineChart data={cummulAnnuel} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                    <YAxis tickFormatter={(val) => `${val} Mds`} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                    <Tooltip formatter={(value: any) => `${value} Mds FCFA`} />
                                    <Legend />
                                    <Line type="monotone" dataKey="reel" name="Revenus Cumulés Réels" stroke="#3b82f6" strokeWidth={4} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="cible" name="Objectif Linéaire (7 Mds)" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                {/* SECTION 2 : PERFORMANCE SLA */}
                <Card className="shadow-sm border-slate-200 lg:col-span-1 border-t-4 border-t-amber-500">
                    <CardHeader className="bg-slate-50 border-b">
                        <CardTitle className="text-base flex items-center gap-2"><Scale className="w-4 h-4 text-amber-600" /> Contrat de Service (SLA)</CardTitle>
                        <CardDescription>Qualité du service rendu aux usagers</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-medium text-slate-700">Temps Traitement Agréments</span>
                                <span className="text-sm font-bold text-emerald-600">{sla.delaiAgrement.reel} j / {sla.delaiAgrement.cible} j</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `85%` }}></div>
                            </div>
                            <p className="text-xs text-slate-500 text-right">Bon : inf. à 21 jours</p>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-100">
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-medium text-slate-700">Urgences (Signalements)</span>
                                <span className="text-sm font-bold text-emerald-600">{sla.delaiReponseAlerte.reel} h / {sla.delaiReponseAlerte.cible} h</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `70%` }}></div>
                            </div>
                            <p className="text-xs text-slate-500 text-right">Bon : inf. à 48 heures</p>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-100">
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-medium text-slate-700">Disponibilité S.I. (Cloud)</span>
                                <span className="text-sm font-bold text-blue-600">{sla.disponibilitePlateforme.reel}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `99%` }}></div>
                            </div>
                            <p className="text-xs text-slate-500 text-right">Cible : 99.5%</p>
                        </div>
                    </CardContent>
                </Card>

                {/* SECTION 3 : RH */}
                <Card className="shadow-sm border-slate-200 lg:col-span-1 border-t-4 border-t-rose-500">
                    <CardHeader className="bg-slate-50 border-b">
                        <CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4 text-rose-600" /> Capital Humain</CardTitle>
                        <CardDescription>Masse salariale et présence opérationnelle</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex justify-center gap-8 text-center pb-4 border-b border-slate-100">
                            <div>
                                <p className="text-[2.5rem] font-bold text-slate-800 leading-tight">{rh.effectifsTotal}</p>
                                <p className="text-xs font-semibold text-slate-500 uppercase">Agents Actifs</p>
                            </div>
                            <div>
                                <p className="text-[2.5rem] font-bold text-rose-600 leading-tight">{rh.absenteisme}%</p>
                                <p className="text-xs font-semibold text-slate-500 uppercase">Absentéisme</p>
                            </div>
                        </div>

                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                                <BarChart data={rh.repartition} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="dir" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                    <Tooltip cursor={{ fill: '#F1F5F9' }} />
                                    <Bar dataKey="count" name="Effectifs" fill="#f43f5e" radius={[2, 2, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* MATRICE SPIDER */}
                <Card className="shadow-sm border-slate-200 lg:col-span-1">
                    <CardHeader className="bg-slate-50 border-b pb-4">
                        <CardTitle className="text-base">Radar des Provinces Clés</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={perfProvinciale}>
                                <PolarGrid stroke="#E2E8F0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#475569' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                <Radar name="Budget Atteint (%)" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                                <Radar name="Couverture Insp. (%)" dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                                <Legend wrapperStyle={{ fontSize: '11px', bottom: -5 }} />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
