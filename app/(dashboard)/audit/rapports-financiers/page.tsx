"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    FileText, Download, Calendar, BarChart3, PieChart, TrendingUp,
} from "lucide-react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

const demoRapports = [
    { ref: "RF-2026-001", titre: "État d'exécution budgétaire — Janvier 2026", type: "Budget", periode: "Janvier 2026", dateGeneration: "05/02/2026", format: "PDF", taille: "2.4 Mo" },
    { ref: "RF-2026-002", titre: "Rapprochement bancaire — Janvier 2026", type: "Comptabilité", periode: "Janvier 2026", dateGeneration: "08/02/2026", format: "PDF", taille: "1.8 Mo" },
    { ref: "RF-2026-003", titre: "Situation des redevances — T4 2025", type: "Redevances", periode: "Q4 2025", dateGeneration: "15/01/2026", format: "Excel", taille: "3.1 Mo" },
    { ref: "RF-2026-004", titre: "Rapport annuel financier 2025 — Cour des Comptes", type: "Annuel", periode: "2025", dateGeneration: "20/01/2026", format: "PDF", taille: "12.5 Mo" },
    { ref: "RF-2026-005", titre: "Tableau de bord financier — Novembre 2025", type: "Budget", periode: "Novembre 2025", dateGeneration: "05/12/2025", format: "PDF", taille: "2.1 Mo" },
    { ref: "RF-2026-006", titre: "Situation du recouvrement par province — 2025", type: "Redevances", periode: "2025", dateGeneration: "10/01/2026", format: "Excel", taille: "4.7 Mo" },
];

const formatCFA = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

export default function AuditRapportsFinanciersPage() {
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
                    { title: "Revenus exercice 2026", value: formatCFA(2850000000), icon: TrendingUp, color: "text-emerald-600" },
                    { title: "Budget consommé", value: "67%", icon: BarChart3, color: "text-blue-600" },
                    { title: "Taux de recouvrement", value: "82%", icon: PieChart, color: "text-amber-600" },
                    { title: "Rapports disponibles", value: demoRapports.length.toString(), icon: FileText, color: "text-slate-700" },
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

            <Card className="shadow-sm">
                <CardHeader className="bg-slate-50 border-b pb-3">
                    <CardTitle className="text-sm font-semibold">Rapports financiers archivés</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead>Référence</TableHead>
                                <TableHead>Titre</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Période</TableHead>
                                <TableHead>Généré le</TableHead>
                                <TableHead>Format</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {demoRapports.map((r, i) => (
                                <TableRow key={i} className="hover:bg-slate-50/60">
                                    <TableCell className="font-mono text-xs">{r.ref}</TableCell>
                                    <TableCell className="font-medium text-sm max-w-[300px] truncate">{r.titre}</TableCell>
                                    <TableCell><Badge variant="outline" className="text-xs">{r.type}</Badge></TableCell>
                                    <TableCell className="text-sm">{r.periode}</TableCell>
                                    <TableCell className="text-xs text-slate-500">{r.dateGeneration}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="text-xs">{r.format} ({r.taille})</Badge>
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
        </div>
    );
}
