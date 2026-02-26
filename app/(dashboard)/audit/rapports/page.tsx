"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ClipboardCheck, Download, Calendar, FileText, Settings2, Loader2,
} from "lucide-react";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

const rapportTypes = [
    { id: "mensuel", label: "Rapport mensuel opérationnel", description: "Synthèse des actions, inspections, alertes et redevances du mois.", delai: "~2 min" },
    { id: "trimestriel", label: "Rapport trimestriel — Ministère du Budget", description: "État d'exécution budgétaire et situation des redevances pour le Ministère.", delai: "~5 min" },
    { id: "annuel", label: "Rapport annuel — Cour des Comptes", description: "Rapport financier annuel complet avec pièces justificatives.", delai: "~10 min" },
    { id: "ca", label: "Rapport trimestriel — Conseil d'Administration", description: "Indicateurs clés et analyse de performance pour le CA.", delai: "~5 min" },
    { id: "custom", label: "Rapport d'audit personnalisé", description: "Sélectionnez les modules et la période pour un rapport sur mesure.", delai: "Variable" },
];

export default function AuditRapportsPage() {
    const { user } = useAuth();
    const userId = user?._id;
    const [selectedType, setSelectedType] = useState("");

    const rapports = useQuery(api.audit.stats.getRapportsHistory, userId ? { userId } : "skip");

    if (rapports === undefined) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <ClipboardCheck className="h-7 w-7 text-slate-700" /> Rapports d&apos;audit
                </h1>
                <p className="text-muted-foreground text-sm">Générez et exportez des rapports d&apos;audit personnalisés</p>
            </div>

            {/* Génération */}
            <Card className="shadow-sm border-blue-100">
                <CardHeader className="bg-blue-50/30 border-b pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-blue-800">
                        <Settings2 className="h-4 w-4" /> Générer un nouveau rapport
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rapportTypes.map((rt) => (
                            <Card
                                key={rt.id}
                                className={`cursor-pointer transition-all hover:shadow-md ${selectedType === rt.id ? "border-blue-400 shadow-md ring-1 ring-blue-200" : "border-slate-200"}`}
                                onClick={() => setSelectedType(rt.id)}
                            >
                                <CardContent className="p-4 space-y-2">
                                    <h3 className="font-semibold text-sm">{rt.label}</h3>
                                    <p className="text-xs text-slate-500">{rt.description}</p>
                                    <Badge variant="secondary" className="text-[10px]">⏱ {rt.delai}</Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {selectedType && (
                        <div className="mt-6 flex flex-wrap items-center gap-4">
                            <Select defaultValue="fevrier-2026">
                                <SelectTrigger className="w-[200px] h-9">
                                    <Calendar className="h-3.5 w-3.5 mr-1" />
                                    <SelectValue placeholder="Période" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="fevrier-2026">Février 2026</SelectItem>
                                    <SelectItem value="janvier-2026">Janvier 2026</SelectItem>
                                    <SelectItem value="q4-2025">Q4 2025</SelectItem>
                                    <SelectItem value="2025">Année 2025</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select defaultValue="pdf">
                                <SelectTrigger className="w-[140px] h-9">
                                    <FileText className="h-3.5 w-3.5 mr-1" />
                                    <SelectValue placeholder="Format" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pdf">PDF</SelectItem>
                                    <SelectItem value="excel">Excel</SelectItem>
                                    <SelectItem value="csv">CSV</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button className="bg-blue-600 hover:bg-blue-700 gap-2" onClick={() => alert("Génération de rapport — Phase 2")}>
                                <Download className="h-4 w-4" /> Générer le rapport
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Historique */}
            <Card className="shadow-sm">
                <CardHeader className="bg-slate-50 border-b pb-3">
                    <CardTitle className="text-sm font-semibold">Historique des rapports générés</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {rapports.length === 0 ? (
                            <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                                Aucun rapport généré dans l&apos;historique d&apos;audit.
                            </div>
                        ) : (
                            rapports.map((r: any, i: number) => (
                                <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/60 transition-colors">
                                    <div>
                                        <p className="text-sm font-medium">{r.titre}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-[10px]">{r.type}</Badge>
                                            <span className="text-xs text-slate-400">{r.date}</span>
                                            <span className="text-xs text-slate-400">par {r.generePar}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="secondary" className="text-xs">{r.format}</Badge>
                                        <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => alert("Téléchargement — Phase 2")}>
                                            <Download className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
