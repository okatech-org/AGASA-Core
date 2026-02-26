"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DollarSign, Search, Download, TrendingUp, TrendingDown, ArrowRight, Loader2,
} from "lucide-react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

const formatCFA = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

const statutConfig: Record<string, { label: string; color: string }> = {
    encaisse: { label: "Encaissé", color: "bg-emerald-100 text-emerald-700" },
    en_recouvrement: { label: "En recouvrement", color: "bg-amber-100 text-amber-700" },
    retard: { label: "En retard", color: "bg-red-100 text-red-700" },
    annule: { label: "Annulé", color: "bg-slate-100 text-slate-500" },
};

export default function AuditFinancePage() {
    const { user } = useAuth();
    const userId = user?._id;
    const [search, setSearch] = useState("");

    const data = useQuery(api.audit.stats.getFinanceTrace, userId ? { userId } : "skip");

    if (data === undefined) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
            </div>
        );
    }

    const filtered = data.redevances.filter((r: any) =>
        `${r.ref} ${r.operateur} ${r.type}`.toLowerCase().includes(search.toLowerCase())
    );

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
                        <p className="text-2xl font-bold text-emerald-700 mt-1">{formatCFA(data.totalEncaisse)}</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-amber-100">
                    <CardContent className="p-5">
                        <p className="text-sm text-slate-500 flex items-center gap-1"><ArrowRight className="h-3.5 w-3.5" /> En recouvrement</p>
                        <p className="text-2xl font-bold text-amber-700 mt-1">{formatCFA(data.totalRecouvrement)}</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-red-100">
                    <CardContent className="p-5">
                        <p className="text-sm text-slate-500 flex items-center gap-1"><TrendingDown className="h-3.5 w-3.5" /> En retard</p>
                        <p className="text-2xl font-bold text-red-700 mt-1">{formatCFA(data.totalRetard)}</p>
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
                            {filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-12">
                                        Aucune redevance trouvée.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((r: any, i: number) => (
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
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
