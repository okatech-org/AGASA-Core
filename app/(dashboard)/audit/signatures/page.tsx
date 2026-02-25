"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    PenTool, CheckCircle2, Clock, Download, ExternalLink,
} from "lucide-react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

const demoSignatures = [
    { ref: "SIG-2026-001", document: "Décision N°12/DG — Réorganisation LAA", signataire: "DG", date: "25/02/2026 14:00", hash: "sha256:a3f4...b2e1", statut: "valide" },
    { ref: "SIG-2026-002", document: "Marché 045/2026 — Acquisition réactifs", signataire: "DG", date: "24/02/2026 16:30", hash: "sha256:c7d8...e9f2", statut: "valide" },
    { ref: "SIG-2026-003", document: "Note de service N°8 — Horaires Ramadan", signataire: "Directeur DERSP", date: "23/02/2026 10:15", hash: "sha256:f1a2...b3c4", statut: "valide" },
    { ref: "SIG-2026-004", document: "Rapport annuel 2025 — Cour des Comptes", signataire: "DG", date: "22/02/2026 09:00", hash: "sha256:d5e6...f7a8", statut: "valide" },
    { ref: "SIG-2026-005", document: "Attestation de conformité — OLAM Gabon", signataire: "Directeur DICSP", date: "21/02/2026 15:45", hash: "sha256:b9c0...d1e2", statut: "valide" },
    { ref: "SIG-2026-006", document: "Budget prévisionnel Q2 2026", signataire: "DG", date: "20/02/2026 11:30", hash: "sha256:e3f4...a5b6", statut: "en_attente" },
];

export default function AuditSignaturesPage() {
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
                        <p className="text-2xl font-bold text-slate-900 mt-1">{demoSignatures.length}</p>
                        <p className="text-xs text-slate-400">Exercice en cours</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-emerald-100">
                    <CardContent className="p-5">
                        <p className="text-sm text-slate-500 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Validées</p>
                        <p className="text-2xl font-bold text-emerald-700 mt-1">{demoSignatures.filter(s => s.statut === "valide").length}</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-amber-100">
                    <CardContent className="p-5">
                        <p className="text-sm text-slate-500 flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-amber-500" /> En attente</p>
                        <p className="text-2xl font-bold text-amber-700 mt-1">{demoSignatures.filter(s => s.statut === "en_attente").length}</p>
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
                            {demoSignatures.map((sig, i) => (
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
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
