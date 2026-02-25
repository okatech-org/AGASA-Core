"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Microscope, ClipboardEdit, ArrowRight, AlertTriangle, Clock } from "lucide-react";
import { toast } from "sonner";

const mesAnalyses = [
    { id: "1", codeBarres: "ECH-2026-00142", matrice: "Viande bovine", parametre: "Salmonella spp.", methode: "ISO 6579-1:2017", poste: "Incubateur A3", statut: "assignee", dateAssignation: "25/02/2026 08:30", priorite: "haute" },
    { id: "2", codeBarres: "ECH-2026-00143", matrice: "Poisson frais", parametre: "E. coli", methode: "ISO 16649-2:2001", poste: "Incubateur A3", statut: "assignee", dateAssignation: "25/02/2026 09:15", priorite: "normale" },
    { id: "3", codeBarres: "ECH-2026-00144", matrice: "Viande de poulet", parametre: "Campylobacter", methode: "ISO 10272-1:2017", poste: "Incubateur A3", statut: "en_cours", dateAssignation: "25/02/2026 10:00", priorite: "normale" },
    { id: "4", codeBarres: "ECH-2026-00141", matrice: "Poisson fumé", parametre: "Histamine", methode: "AOAC 977.13", poste: "HPLC-01", statut: "en_cours", dateAssignation: "24/02/2026 14:00", priorite: "haute" },
    { id: "5", codeBarres: "ECH-2026-00140", matrice: "Céréale importée", parametre: "Aflatoxine B1", methode: "ISO 16050:2003", poste: "HPLC-01", statut: "resultat_saisi", dateAssignation: "24/02/2026 08:00", priorite: "normale" },
];

const statutConfig: Record<string, { label: string; color: string }> = {
    assignee: { label: "À faire", color: "bg-blue-100 text-blue-700" },
    en_cours: { label: "En cours", color: "bg-amber-100 text-amber-700" },
    resultat_saisi: { label: "Résultat saisi", color: "bg-violet-100 text-violet-700" },
};

export default function SaisieAnalysesPage() {
    const aFaire = mesAnalyses.filter(a => a.statut === "assignee");
    const enCours = mesAnalyses.filter(a => a.statut === "en_cours");
    const resultats = mesAnalyses.filter(a => a.statut === "resultat_saisi");

    const handleSaisir = (id: string) => {
        toast.info("Ouverture du formulaire de saisie — Phase 2");
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <ClipboardEdit className="h-7 w-7 text-orange-600" /> Mes analyses à faire
                </h1>
                <p className="text-muted-foreground text-sm">Analyses assignées à votre poste — Traitez-les dans l&apos;ordre (plus ancien en premier)</p>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="shadow-sm border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                        <p className="text-xs text-slate-500 mb-1">À faire</p>
                        <p className="text-3xl font-bold text-blue-600">{aFaire.length}</p>
                        <p className="text-xs text-slate-400">analyses en attente</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-l-4 border-l-amber-500">
                    <CardContent className="p-4">
                        <p className="text-xs text-slate-500 mb-1">En cours</p>
                        <p className="text-3xl font-bold text-amber-600">{enCours.length}</p>
                        <p className="text-xs text-slate-400">saisie commencée</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-l-4 border-l-violet-500">
                    <CardContent className="p-4">
                        <p className="text-xs text-slate-500 mb-1">Résultats saisis</p>
                        <p className="text-3xl font-bold text-violet-600">{resultats.length}</p>
                        <p className="text-xs text-slate-400">en attente de validation</p>
                    </CardContent>
                </Card>
            </div>

            {/* À faire */}
            {aFaire.length > 0 && (
                <Card className="shadow-sm">
                    <CardHeader className="bg-blue-50 border-b pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-600" /> Analyses à faire ({aFaire.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead>Code-barres</TableHead>
                                    <TableHead>Matrice</TableHead>
                                    <TableHead>Paramètre</TableHead>
                                    <TableHead>Méthode</TableHead>
                                    <TableHead>Poste</TableHead>
                                    <TableHead>Priorité</TableHead>
                                    <TableHead>Assignée le</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {aFaire.map((a) => (
                                    <TableRow key={a.id} className="hover:bg-blue-50/30">
                                        <TableCell className="font-mono text-sm font-semibold">{a.codeBarres}</TableCell>
                                        <TableCell className="text-sm">{a.matrice}</TableCell>
                                        <TableCell className="text-sm font-medium">{a.parametre}</TableCell>
                                        <TableCell className="text-xs text-slate-500">{a.methode}</TableCell>
                                        <TableCell className="text-sm">{a.poste}</TableCell>
                                        <TableCell>
                                            {a.priorite === "haute" ? (
                                                <Badge className="bg-red-100 text-red-700 border-0 text-xs gap-1"><AlertTriangle className="h-3 w-3" /> Haute</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="text-xs">Normale</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-500">{a.dateAssignation}</TableCell>
                                        <TableCell>
                                            <Button size="sm" className="gap-1 bg-orange-600 hover:bg-orange-700" onClick={() => handleSaisir(a.id)}>
                                                📝 Saisir <ArrowRight className="h-3 w-3" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* En cours */}
            {enCours.length > 0 && (
                <Card className="shadow-sm">
                    <CardHeader className="bg-amber-50 border-b pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Microscope className="h-4 w-4 text-amber-600" /> En cours ({enCours.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead>Code-barres</TableHead>
                                    <TableHead>Matrice</TableHead>
                                    <TableHead>Paramètre</TableHead>
                                    <TableHead>Poste</TableHead>
                                    <TableHead>Priorité</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {enCours.map((a) => (
                                    <TableRow key={a.id} className="hover:bg-amber-50/30">
                                        <TableCell className="font-mono text-sm font-semibold">{a.codeBarres}</TableCell>
                                        <TableCell className="text-sm">{a.matrice}</TableCell>
                                        <TableCell className="text-sm font-medium">{a.parametre}</TableCell>
                                        <TableCell className="text-sm">{a.poste}</TableCell>
                                        <TableCell>
                                            {a.priorite === "haute" ? (
                                                <Badge className="bg-red-100 text-red-700 border-0 text-xs">Haute</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="text-xs">Normale</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button size="sm" variant="outline" className="gap-1" onClick={() => handleSaisir(a.id)}>
                                                Continuer <ArrowRight className="h-3 w-3" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Résultats saisis */}
            {resultats.length > 0 && (
                <Card className="shadow-sm">
                    <CardHeader className="bg-violet-50 border-b pb-3">
                        <CardTitle className="text-sm font-semibold">✅ Résultats saisis — En attente de validation ({resultats.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead>Code-barres</TableHead>
                                    <TableHead>Matrice</TableHead>
                                    <TableHead>Paramètre</TableHead>
                                    <TableHead>Statut</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {resultats.map((a) => (
                                    <TableRow key={a.id}>
                                        <TableCell className="font-mono text-sm">{a.codeBarres}</TableCell>
                                        <TableCell className="text-sm">{a.matrice}</TableCell>
                                        <TableCell className="text-sm">{a.parametre}</TableCell>
                                        <TableCell><Badge className="bg-violet-100 text-violet-700 border-0 text-xs">En attente validation</Badge></TableCell>
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
