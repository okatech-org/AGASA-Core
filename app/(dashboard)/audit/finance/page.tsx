"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DollarSign, Search, Download, ArrowRight, TrendingUp, TrendingDown,
} from "lucide-react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

const redevances = [
    { ref: "RED-2026-001", operateur: "OLAM Gabon", type: "Agrément import", montant: 15000000, statut: "encaisse", date: "25/02/2026", moyen: "Virement bancaire" },
    { ref: "RED-2026-002", operateur: "Cimencam", type: "Certification phytosanitaire", montant: 5500000, statut: "encaisse", date: "24/02/2026", moyen: "Chèque" },
    { ref: "RED-2026-003", operateur: "SIAT Gabon", type: "Analyse laboratoire", montant: 2800000, statut: "en_recouvrement", date: "22/02/2026", moyen: "—" },
    { ref: "RED-2026-004", operateur: "Total Energies", type: "Amende non-conformité", montant: 8000000, statut: "encaisse", date: "20/02/2026", moyen: "Ordre de paiement" },
    { ref: "RED-2026-005", operateur: "Import-Export Gabon", type: "Agrément import", montant: 12000000, statut: "en_recouvrement", date: "18/02/2026", moyen: "—" },
    { ref: "RED-2026-006", operateur: "Nestlé Gabon", type: "Certification phytosanitaire", montant: 4200000, statut: "encaisse", date: "15/02/2026", moyen: "Virement bancaire" },
    { ref: "RED-2026-007", operateur: "Société Gabonaise Agricole", type: "Analyse laboratoire", montant: 3100000, statut: "retard", date: "10/02/2026", moyen: "—" },
    { ref: "RED-2026-008", operateur: "Agro-Gabon", type: "Amende non-conformité", montant: 6500000, statut: "annule", date: "05/02/2026", moyen: "—" },
];

const formatCFA = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

const statutConfig: Record<string, { label: string; color: string }> = {
    encaisse: { label: "Encaissé", color: "bg-emerald-100 text-emerald-700" },
    en_recouvrement: { label: "En recouvrement", color: "bg-amber-100 text-amber-700" },
    retard: { label: "En retard", color: "bg-red-100 text-red-700" },
    annule: { label: "Annulé", color: "bg-slate-100 text-slate-500" },
};

export default function AuditFinancePage() {
    const [search, setSearch] = useState("");

    const filtered = redevances.filter(r =>
        `${r.ref} ${r.operateur} ${r.type}`.toLowerCase().includes(search.toLowerCase())
    );

    const totalEncaisse = redevances.filter(r => r.statut === "encaisse").reduce((s, r) => s + r.montant, 0);
    const totalRecouvrement = redevances.filter(r => r.statut === "en_recouvrement").reduce((s, r) => s + r.montant, 0);
    const totalRetard = redevances.filter(r => r.statut === "retard").reduce((s, r) => s + r.montant, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <DollarSign className="h-7 w-7 text-slate-700" /> Traçabilité financière
                    </h1>
                    <p className="text-muted-foreground text-sm">Suivi du parcours de chaque redevance et amende — Lecture seule</p>
                </div>
                <Button variant="outline" className="gap-2" onClick={() => alert("Export — Phase 2")}>
                    <Download className="h-4 w-4" /> Exporter
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-sm border-emerald-100">
                    <CardContent className="p-5">
                        <p className="text-sm text-slate-500 flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" /> Encaissé</p>
                        <p className="text-2xl font-bold text-emerald-700 mt-1">{formatCFA(totalEncaisse)}</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-amber-100">
                    <CardContent className="p-5">
                        <p className="text-sm text-slate-500 flex items-center gap-1"><ArrowRight className="h-3.5 w-3.5" /> En recouvrement</p>
                        <p className="text-2xl font-bold text-amber-700 mt-1">{formatCFA(totalRecouvrement)}</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-red-100">
                    <CardContent className="p-5">
                        <p className="text-sm text-slate-500 flex items-center gap-1"><TrendingDown className="h-3.5 w-3.5" /> En retard</p>
                        <p className="text-2xl font-bold text-red-700 mt-1">{formatCFA(totalRetard)}</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm">
                <CardHeader className="bg-slate-50 border-b pb-3">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Rechercher par référence, opérateur..." className="pl-9 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead>Référence</TableHead>
                                <TableHead>Opérateur</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Montant</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Moyen de paiement</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((r, i) => (
                                <TableRow key={i} className="hover:bg-slate-50/60">
                                    <TableCell className="font-mono text-xs">{r.ref}</TableCell>
                                    <TableCell className="font-medium text-sm">{r.operateur}</TableCell>
                                    <TableCell className="text-sm">{r.type}</TableCell>
                                    <TableCell className="text-right font-semibold text-sm">{formatCFA(r.montant)}</TableCell>
                                    <TableCell>
                                        <Badge className={`text-xs border-0 ${statutConfig[r.statut]?.color}`}>
                                            {statutConfig[r.statut]?.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-500">{r.date}</TableCell>
                                    <TableCell className="text-xs text-slate-500">{r.moyen}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
