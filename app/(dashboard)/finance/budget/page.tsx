"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, Wallet, AlertTriangle, ArrowRight, Building2, MapPin } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { useRouter } from "next/navigation";

export default function BudgetDashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [exercice, setExercice] = useState(new Date().getFullYear());

    const data = useQuery(api.finance.budget.getBudgetDashboardStats, {
        userId: user?._id as any,
        exercice
    });

    const formatMontant = (m: number) => {
        return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XAF", maximumFractionDigits: 0 }).format(m);
    };

    if (data === undefined) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Agrégation des données comptables en cours...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-slate-900 pl-3">Tableau de Bord Budgétaire</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Supervision de l'exécution du budget général de l'AGASA (Exercice {exercice}).</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={exercice}
                        onChange={(e) => setExercice(parseInt(e.target.value))}
                        className="h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium"
                    >
                        <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                        <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                    </select>
                    <Button onClick={() => router.push('/finance/budget/nouveau')} className="bg-slate-900 hover:bg-slate-800">
                        + Nouvelle Ligne
                    </Button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm border-slate-200 border-b-4 border-b-blue-600 bg-blue-50/30">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center text-blue-800 mb-2">
                            <span className="text-sm font-semibold uppercase tracking-wider">Alloué Global</span>
                            <Wallet className="h-5 w-5 opacity-70" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{formatMontant(data.totalAlloue)}</div>
                        <p className="text-xs text-blue-600 font-medium mt-1">100% de l'enveloppe</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200 border-b-4 border-b-emerald-600">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center text-slate-600 mb-2">
                            <span className="text-sm font-semibold uppercase tracking-wider">Consommé Total</span>
                            <TrendingUp className="h-5 w-5 text-emerald-600 opacity-70" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{formatMontant(data.totalConsomme)}</div>
                        <p className="text-xs text-emerald-600 font-medium mt-1">{data.pctConsomme.toFixed(1)}% du budget total</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200 border-b-4 border-b-amber-500">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center text-slate-600 mb-2">
                            <span className="text-sm font-semibold uppercase tracking-wider">Montant Engagé</span>
                            <AlertTriangle className="h-5 w-5 text-amber-500 opacity-70" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{formatMontant(data.totalEngage)}</div>
                        <p className="text-xs text-amber-600 font-medium mt-1">{data.pctEngage.toFixed(1)}% du budget total</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200 border-b-4 border-b-slate-900">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center text-slate-600 mb-2">
                            <span className="text-sm font-semibold uppercase tracking-wider">Solde Disponible</span>
                            <DollarSign className="h-5 w-5 text-slate-900 opacity-70" />
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{formatMontant(data.totalDisponible)}</div>
                        <p className="text-xs text-slate-600 font-medium mt-1">{data.pctDisponible.toFixed(1)}% du budget total</p>
                    </CardContent>
                </Card>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="border-b bg-slate-50/50 pb-4">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-500" /> Consommation par Direction
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 h-[300px]">
                        {data.chartDirection.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                                <BarChart data={data.chartDirection} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="direction" type="category" width={120} tick={{ fontSize: 12, fill: '#64748B' }} />
                                    <RechartsTooltip cursor={{ fill: '#F1F5F9' }} formatter={(value: any) => formatMontant(value as number)} />
                                    <Bar dataKey="consomme" fill="#2563EB" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Données insuffisantes</div>
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="border-b bg-slate-50/50 pb-4">
                        <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-600" /> Évolution Mensuelle
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                            <LineChart data={data.evolutionMensuelle} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#64748B' }} />
                                <YAxis hide />
                                <RechartsTooltip formatter={(value: any) => formatMontant(value as number)} />
                                <Line type="monotone" dataKey="consomme" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Tableau Détaillé */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50/50 border-b p-4">
                    <CardTitle className="text-lg">Détails des Lignes Budgétaires</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 hover:bg-slate-50">
                                <TableHead className="w-[100px]">Code</TableHead>
                                <TableHead>Libellé & Structure</TableHead>
                                <TableHead className="text-right">Alloué</TableHead>
                                <TableHead className="text-right">Consommé</TableHead>
                                <TableHead className="text-right">Engagé</TableHead>
                                <TableHead className="text-right">Disponible</TableHead>
                                <TableHead className="text-center">Exécution</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.lignes.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Aucune ligne budgétaire pour cet exercice.</TableCell></TableRow>
                            ) : (
                                data.lignes.map(l => (
                                    <TableRow key={l._id} className={l.pctConsommation > 90 ? "bg-red-50/30 hover:bg-red-50" : "hover:bg-slate-50"}>
                                        <TableCell className="font-mono text-xs font-semibold">{l.code}</TableCell>
                                        <TableCell>
                                            <div className="font-semibold text-slate-900 text-sm whitespace-nowrap">{l.libelle}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                <Building2 className="w-3 h-3" /> {l.direction} <span className="mx-1">•</span> <MapPin className="w-3 h-3" /> {l.province}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">{formatMontant(l.montantAlloue)}</TableCell>
                                        <TableCell className="text-right font-medium text-emerald-700">{formatMontant(l.montantConsomme)}</TableCell>
                                        <TableCell className="text-right text-slate-600">{formatMontant(l.montantEngage)}</TableCell>
                                        <TableCell className="text-right font-bold text-slate-900">{formatMontant(l.montantDisponible)}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={l.pctConsommation > 90 ? "destructive" : (l.pctConsommation > 75 ? "secondary" : "outline")}
                                                className={l.pctConsommation > 75 && l.pctConsommation <= 90 ? "bg-amber-100 text-amber-800 hover:bg-amber-200" : ""}
                                            >
                                                {l.pctConsommation.toFixed(1)}%
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
