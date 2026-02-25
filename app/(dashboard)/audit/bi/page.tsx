"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    BarChart3, TrendingUp, TrendingDown, Users, AlertTriangle,
    Download, ShieldCheck, Microscope, DollarSign, MapPin,
} from "lucide-react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

const kpis = [
    { label: "Inspections réalisées (mois)", value: "142", trend: "+12%", up: true, icon: ShieldCheck, color: "text-blue-600" },
    { label: "Taux de conformité global", value: "87,3%", trend: "-1,2%", up: false, icon: BarChart3, color: "text-emerald-600" },
    { label: "Redevances encaissées (mois)", value: "485M FCFA", trend: "+8%", up: true, icon: DollarSign, color: "text-amber-600" },
    { label: "Taux de recouvrement", value: "82%", trend: "+3%", up: true, icon: TrendingUp, color: "text-violet-600" },
    { label: "Alertes actives", value: "7", trend: "+2", up: false, icon: AlertTriangle, color: "text-red-600" },
    { label: "Effectif total actif", value: "47 / 52", trend: "stable", up: true, icon: Users, color: "text-slate-600" },
];

const provincesData = [
    { province: "Estuaire", inspections: 42, conformite: 91.2, recouvrement: 88, alertes: 1, performance: "bon" },
    { province: "Haut-Ogooué", inspections: 18, conformite: 85.4, recouvrement: 79, alertes: 2, performance: "moyen" },
    { province: "Ogooué-Maritime", inspections: 15, conformite: 88.0, recouvrement: 84, alertes: 0, performance: "bon" },
    { province: "Woleu-Ntem", inspections: 14, conformite: 82.1, recouvrement: 71, alertes: 1, performance: "en_dessous" },
    { province: "Moyen-Ogooué", inspections: 12, conformite: 90.5, recouvrement: 86, alertes: 0, performance: "bon" },
    { province: "Nyanga", inspections: 11, conformite: 78.3, recouvrement: 68, alertes: 1, performance: "critique" },
    { province: "Ngounié", inspections: 10, conformite: 84.7, recouvrement: 75, alertes: 1, performance: "moyen" },
    { province: "Ogooué-Ivindo", inspections: 10, conformite: 86.0, recouvrement: 77, alertes: 0, performance: "moyen" },
    { province: "Ogooué-Lolo", inspections: 10, conformite: 81.0, recouvrement: 65, alertes: 1, performance: "en_dessous" },
];

const performanceColors: Record<string, string> = {
    bon: "bg-emerald-100 text-emerald-700",
    moyen: "bg-amber-100 text-amber-700",
    en_dessous: "bg-orange-100 text-orange-700",
    critique: "bg-red-100 text-red-700",
};

const performanceLabels: Record<string, string> = {
    bon: "Bon",
    moyen: "Moyen",
    en_dessous: "En dessous",
    critique: "Critique",
};

const modulesActivity = [
    { module: "RH", actions30j: 312, tendance: "+5%", topAction: "Demandes de congés (89)" },
    { module: "Finance", actions30j: 247, tendance: "+12%", topAction: "Écritures redevances (134)" },
    { module: "GED", actions30j: 198, tendance: "-3%", topAction: "Validations workflows (67)" },
    { module: "LIMS", actions30j: 456, tendance: "+8%", topAction: "Saisie résultats (312)" },
    { module: "Logistique", actions30j: 87, tendance: "stable", topAction: "Mouvements stock (45)" },
    { module: "Alertes", actions30j: 34, tendance: "+15%", topAction: "Création alertes (12)" },
];

export default function AuditBIPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <BarChart3 className="h-7 w-7 text-slate-700" /> Indicateurs BI
                    </h1>
                    <p className="text-muted-foreground text-sm">Vue consolidée des indicateurs opérationnels — Lecture seule</p>
                </div>
                <Button variant="outline" className="gap-2" onClick={() => alert("Export — Phase 2")}>
                    <Download className="h-4 w-4" /> Exporter
                </Button>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kpis.map((kpi) => (
                    <Card key={kpi.label} className="shadow-sm">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-medium text-slate-500 mb-1">{kpi.label}</p>
                                    <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                                </div>
                                <kpi.icon className={`h-5 w-5 ${kpi.color} opacity-50`} />
                            </div>
                            <div className="flex items-center gap-1 mt-2">
                                {kpi.up ? (
                                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                                ) : (
                                    <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                                )}
                                <span className={`text-xs font-medium ${kpi.up ? "text-emerald-600" : "text-red-600"}`}>{kpi.trend}</span>
                                <span className="text-xs text-slate-400 ml-1">vs mois précédent</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Performance provinciale */}
            <Card className="shadow-sm">
                <CardHeader className="bg-slate-50 border-b pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Performance par province
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead>Province</TableHead>
                                <TableHead className="text-right">Inspections</TableHead>
                                <TableHead className="text-right">Conformité</TableHead>
                                <TableHead className="text-right">Recouvrement</TableHead>
                                <TableHead className="text-right">Alertes</TableHead>
                                <TableHead>Performance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {provincesData.map((p) => (
                                <TableRow key={p.province} className="hover:bg-slate-50/60">
                                    <TableCell className="font-medium text-sm">{p.province}</TableCell>
                                    <TableCell className="text-right font-semibold">{p.inspections}</TableCell>
                                    <TableCell className="text-right">
                                        <span className={`font-semibold ${p.conformite >= 90 ? "text-emerald-600" : p.conformite >= 80 ? "text-amber-600" : "text-red-600"}`}>
                                            {p.conformite}%
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className={`font-semibold ${p.recouvrement >= 80 ? "text-emerald-600" : p.recouvrement >= 70 ? "text-amber-600" : "text-red-600"}`}>
                                            {p.recouvrement}%
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">{p.alertes > 0 ? <Badge variant="destructive" className="text-xs">{p.alertes}</Badge> : <span className="text-xs text-slate-400">0</span>}</TableCell>
                                    <TableCell>
                                        <Badge className={`text-xs border-0 ${performanceColors[p.performance]}`}>
                                            {performanceLabels[p.performance]}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Activité par module */}
            <Card className="shadow-sm">
                <CardHeader className="bg-slate-50 border-b pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Microscope className="h-4 w-4" /> Activité par module (30 derniers jours)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead>Module</TableHead>
                                <TableHead className="text-right">Actions (30j)</TableHead>
                                <TableHead>Tendance</TableHead>
                                <TableHead>Action la plus fréquente</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {modulesActivity.map((m) => (
                                <TableRow key={m.module} className="hover:bg-slate-50/60">
                                    <TableCell><Badge variant="secondary" className="text-xs">{m.module}</Badge></TableCell>
                                    <TableCell className="text-right font-semibold">{m.actions30j}</TableCell>
                                    <TableCell>
                                        <span className={`text-xs font-medium ${m.tendance.includes("+") ? "text-emerald-600" : m.tendance.includes("-") ? "text-red-600" : "text-slate-500"}`}>
                                            {m.tendance}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600">{m.topAction}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
