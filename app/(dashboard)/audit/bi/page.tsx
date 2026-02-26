"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    BarChart3, TrendingUp, TrendingDown, Download, Loader2, MapPin, Microscope,
} from "lucide-react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

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

export default function AuditBIPage() {
    const { user } = useAuth();
    const userId = user?._id;
    const data = useQuery(api.audit.stats.getBIKPIs, userId ? { userId } : "skip");

    if (data === undefined) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
            </div>
        );
    }

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
                {data.kpis.map((kpi: any) => (
                    <Card key={kpi.label} className="shadow-sm">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-medium text-slate-500 mb-1">{kpi.label}</p>
                                    <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Performance provinciale */}
            {data.provincesData.length > 0 && (
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
                                    <TableHead className="text-right">Recouvrement</TableHead>
                                    <TableHead className="text-right">Alertes</TableHead>
                                    <TableHead>Performance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.provincesData.map((p: any) => (
                                    <TableRow key={p.province} className="hover:bg-slate-50/60">
                                        <TableCell className="font-medium text-sm">{p.province}</TableCell>
                                        <TableCell className="text-right font-semibold">{p.inspections}</TableCell>
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
            )}

            {/* Activité par module */}
            {data.modulesActivity.length > 0 && (
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
                                    <TableHead>Action la plus fréquente</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.modulesActivity.map((m: any) => (
                                    <TableRow key={m.module} className="hover:bg-slate-50/60">
                                        <TableCell><Badge variant="secondary" className="text-xs">{m.module}</Badge></TableCell>
                                        <TableCell className="text-right font-semibold">{m.actions30j}</TableCell>
                                        <TableCell className="text-sm text-slate-600">{m.topAction}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
