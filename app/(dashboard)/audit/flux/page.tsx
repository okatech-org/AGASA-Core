"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Network, CheckCircle2, XCircle, ArrowRightLeft, Download, Activity,
} from "lucide-react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

const demoFlux = [
    { id: "F1", nom: "AGASA-Core → Trésor Public", source: "AGASA-Core", destination: "Trésor Public", type: "Redevances", statut: "actif", succes: 99.2, dernierMsg: "25/02/2026 14:00", messages24h: 45 },
    { id: "F2", nom: "AGASA-Inspect → AGASA-Core", source: "AGASA-Inspect", destination: "AGASA-Core", type: "Rapports inspection", statut: "actif", succes: 97.8, dernierMsg: "25/02/2026 13:30", messages24h: 23 },
    { id: "F3", nom: "AGASA-Core → LIMS (LAA)", source: "AGASA-Core", destination: "LAA", type: "Échantillons", statut: "actif", succes: 100, dernierMsg: "25/02/2026 12:15", messages24h: 12 },
    { id: "F4", nom: "AGASA-Pro → AGASA-Core", source: "AGASA-Pro", destination: "AGASA-Core", type: "Demandes opérateurs", statut: "actif", succes: 95.6, dernierMsg: "25/02/2026 11:45", messages24h: 34 },
    { id: "F5", nom: "AGASA-Core → eSanté", source: "AGASA-Core", destination: "eSanté", type: "Alertes sanitaires", statut: "inactif", succes: 0, dernierMsg: "20/02/2026 08:00", messages24h: 0 },
    { id: "F6", nom: "CEBEVIRHA → AGASA-Core", source: "CEBEVIRHA", destination: "AGASA-Core", type: "Notifications CEMAC", statut: "actif", succes: 100, dernierMsg: "24/02/2026 16:00", messages24h: 3 },
];

export default function AuditFluxPage() {
    const actifs = demoFlux.filter(f => f.statut === "actif").length;
    const totalMessages = demoFlux.reduce((s, f) => s + f.messages24h, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Network className="h-7 w-7 text-slate-700" /> Flux inter-applications
                    </h1>
                    <p className="text-muted-foreground text-sm">Échanges de données entre les applications du système d&apos;information — Lecture seule</p>
                </div>
                <Button variant="outline" className="gap-2" onClick={() => alert("Export — Phase 2")}>
                    <Download className="h-4 w-4" /> Exporter
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-sm">
                    <CardContent className="p-5">
                        <p className="text-sm text-slate-500">Interfaces configurées</p>
                        <p className="text-2xl font-bold mt-1">{demoFlux.length}</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-emerald-100">
                    <CardContent className="p-5">
                        <p className="text-sm text-slate-500 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Actifs</p>
                        <p className="text-2xl font-bold text-emerald-700 mt-1">{actifs} / {demoFlux.length}</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardContent className="p-5">
                        <p className="text-sm text-slate-500 flex items-center gap-1"><Activity className="h-3.5 w-3.5" /> Messages (24h)</p>
                        <p className="text-2xl font-bold mt-1">{totalMessages}</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Flux</TableHead>
                                <TableHead>Source → Destination</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Taux succès</TableHead>
                                <TableHead className="text-right">Msg (24h)</TableHead>
                                <TableHead>Dernier message</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {demoFlux.map((f) => (
                                <TableRow key={f.id} className="hover:bg-slate-50/60">
                                    <TableCell className="font-mono text-xs">{f.id}</TableCell>
                                    <TableCell className="font-medium text-sm">{f.nom}</TableCell>
                                    <TableCell className="text-xs">
                                        <span className="text-slate-700">{f.source}</span>
                                        <ArrowRightLeft className="inline h-3 w-3 mx-1 text-slate-400" />
                                        <span className="text-slate-700">{f.destination}</span>
                                    </TableCell>
                                    <TableCell><Badge variant="outline" className="text-xs">{f.type}</Badge></TableCell>
                                    <TableCell>
                                        {f.statut === "actif" ? (
                                            <Badge className="text-xs border-0 bg-emerald-100 text-emerald-700 gap-1"><CheckCircle2 className="h-3 w-3" /> Actif</Badge>
                                        ) : (
                                            <Badge className="text-xs border-0 bg-red-100 text-red-700 gap-1"><XCircle className="h-3 w-3" /> Inactif</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className={`font-semibold text-sm ${f.succes >= 99 ? "text-emerald-600" : f.succes >= 95 ? "text-amber-600" : "text-red-600"}`}>
                                            {f.succes}%
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-sm">{f.messages24h}</TableCell>
                                    <TableCell className="text-xs text-slate-500">{f.dernierMsg}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
