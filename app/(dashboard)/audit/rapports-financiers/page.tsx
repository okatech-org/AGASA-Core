"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    FileText, Download, TrendingUp, BarChart3, PieChart, Loader2,
} from "lucide-react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

const formatCFA = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

export default function AuditRapportsFinanciersPage() {
    const { user } = useAuth();
    const userId = user?._id;
    const data = useQuery(api.audit.stats.getRapportsFinanciers, userId ? { userId } : "skip");
    const rapports = useQuery(api.audit.stats.getRapportsHistory, userId ? { userId } : "skip");

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
                        <FileText className="h-7 w-7 text-slate-700" /> Rapports financiers
                    </h1>
                    <p className="text-muted-foreground text-sm">États financiers, exécution budgétaire et rapprochement bancaire — Lecture seule</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { title: "Revenus exercice", value: formatCFA(data.revenus), icon: TrendingUp, color: "text-emerald-600" },
                    { title: "Budget consommé", value: data.pctConsomme + "%", icon: BarChart3, color: "text-blue-600" },
                    { title: "Taux de recouvrement", value: data.tauxRecouvrement + "%", icon: PieChart, color: "text-amber-600" },
                    { title: "Rapports disponibles", value: (rapports?.length ?? 0).toString(), icon: FileText, color: "text-slate-700" },
                ].map((kpi) => (
                    <Card key={kpi.title} className="shadow-sm">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-medium text-slate-500">{kpi.title}</p>
                                    <p className={`text-xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
                                </div>
                                <kpi.icon className={`h-5 w-5 ${kpi.color} opacity-60`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {rapports && rapports.length > 0 && (
                <Card className="shadow-sm">
                    <CardHeader className="bg-slate-50 border-b pb-3">
                        <CardTitle className="text-sm font-semibold">Rapports financiers archivés</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead>Titre</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Format</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rapports.map((r: any, i: number) => (
                                    <TableRow key={i} className="hover:bg-slate-50/60">
                                        <TableCell className="font-medium text-sm max-w-[300px] truncate">{r.titre}</TableCell>
                                        <TableCell><Badge variant="outline" className="text-xs">{r.type}</Badge></TableCell>
                                        <TableCell className="text-xs text-slate-500">{r.date}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="text-xs">{r.format}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => alert("Téléchargement — Phase 2")}>
                                                <Download className="h-3 w-3" /> Télécharger
                                            </Button>
                                        </TableCell>
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
