"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    PenTool, CheckCircle2, Clock, Download, Loader2,
} from "lucide-react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

export default function AuditSignaturesPage() {
    const { user } = useAuth();
    const userId = user?._id;
    const signatures = useQuery(api.audit.stats.getSignatures, userId ? { userId } : "skip");

    if (signatures === undefined) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
            </div>
        );
    }

    const total = signatures.length;
    const validees = signatures.filter((s: any) => s.statut === "valide").length;
    const enAttente = signatures.filter((s: any) => s.statut === "en_attente").length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <PenTool className="h-7 w-7 text-slate-700" /> Chaîne de signatures
                    </h1>
                    <p className="text-muted-foreground text-sm">Vérification de l&apos;authenticité et de la conformité des signatures électroniques</p>
                </div>
                <Button variant="outline" className="gap-2" onClick={() => alert("Export — Phase 2")}>
                    <Download className="h-4 w-4" /> Exporter
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-sm">
                    <CardContent className="p-5">
                        <p className="text-sm text-slate-500">Total signatures</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{total}</p>
                        <p className="text-xs text-slate-400">Exercice en cours</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-emerald-100">
                    <CardContent className="p-5">
                        <p className="text-sm text-slate-500 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Validées</p>
                        <p className="text-2xl font-bold text-emerald-700 mt-1">{validees}</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-amber-100">
                    <CardContent className="p-5">
                        <p className="text-sm text-slate-500 flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-amber-500" /> En attente</p>
                        <p className="text-2xl font-bold text-amber-700 mt-1">{enAttente}</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead>Référence</TableHead>
                                <TableHead>Document</TableHead>
                                <TableHead>Signataire</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Hash de vérification</TableHead>
                                <TableHead>Statut</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {signatures.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-12">
                                        Aucune signature enregistrée.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                signatures.map((sig: any, i: number) => (
                                    <TableRow key={i} className="hover:bg-slate-50/60">
                                        <TableCell className="font-mono text-xs">{sig.ref}</TableCell>
                                        <TableCell className="text-sm font-medium max-w-[300px] truncate">{sig.document}</TableCell>
                                        <TableCell className="text-sm">{sig.signataire}</TableCell>
                                        <TableCell className="text-xs text-slate-500">{sig.date}</TableCell>
                                        <TableCell className="font-mono text-[10px] text-slate-400">{sig.hash}</TableCell>
                                        <TableCell>
                                            <Badge className={`text-xs border-0 ${sig.statut === "valide" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                                {sig.statut === "valide" ? "✓ Vérifié" : "En attente"}
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
