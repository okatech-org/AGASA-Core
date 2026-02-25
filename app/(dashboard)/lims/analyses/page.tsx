"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Microscope, Search, FlaskConical, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";

const demoAnalyses = [
    { id: "1", codeBarres: "ECH-2026-00142", matrice: "Viande bovine", parametre: "Salmonella spp.", methode: "ISO 6579-1:2017", technicien: "Mme Nzé", poste: "Incubateur A3", statut: "assignee", dateAssignation: "25/02/2026", priorite: "haute" },
    { id: "2", codeBarres: "ECH-2026-00143", matrice: "Poisson frais", parametre: "E. coli", methode: "ISO 16649-2:2001", technicien: "Mme Nzé", poste: "Incubateur A3", statut: "en_cours", dateAssignation: "25/02/2026", priorite: "normale" },
    { id: "3", codeBarres: "ECH-2026-00140", matrice: "Céréale importée", parametre: "Aflatoxine B1", methode: "ISO 16050:2003", technicien: "M. Mba", poste: "HPLC-01", statut: "resultat_saisi", dateAssignation: "24/02/2026", priorite: "normale" },
    { id: "4", codeBarres: "ECH-2026-00138", matrice: "Eau de source", parametre: "Plomb (Pb)", methode: "ISO 17294-2:2016", technicien: "M. Mba", poste: "ICP-MS-01", statut: "valide_tech", dateAssignation: "23/02/2026", priorite: "normale" },
    { id: "5", codeBarres: "ECH-2026-00135", matrice: "Produit laitier", parametre: "Listeria monocytogenes", methode: "ISO 11290-1:2017", technicien: "Mme Nzé", poste: "Incubateur B1", statut: "valide_resp", dateAssignation: "22/02/2026", priorite: "haute" },
    { id: "6", codeBarres: "ECH-2026-00133", matrice: "Fruit importé", parametre: "Résidus pesticides", methode: "EN 15662:2018", technicien: "M. Obame", poste: "GC-MS-01", statut: "publie", dateAssignation: "21/02/2026", priorite: "normale" },
    { id: "7", codeBarres: "ECH-2026-00144", matrice: "Viande de poulet", parametre: "Campylobacter", methode: "ISO 10272-1:2017", technicien: "M. Obame", poste: "Incubateur A3", statut: "assignee", dateAssignation: "25/02/2026", priorite: "normale" },
    { id: "8", codeBarres: "ECH-2026-00141", matrice: "Poisson fumé", parametre: "Histamine", methode: "AOAC 977.13", technicien: "Mme Nzé", poste: "HPLC-01", statut: "en_cours", dateAssignation: "24/02/2026", priorite: "haute" },
];

const statutConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    assignee: { label: "Assignée", color: "bg-blue-100 text-blue-700", icon: Clock },
    en_cours: { label: "En cours", color: "bg-amber-100 text-amber-700", icon: FlaskConical },
    resultat_saisi: { label: "Résultat saisi", color: "bg-violet-100 text-violet-700", icon: CheckCircle2 },
    valide_tech: { label: "Validé tech.", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
    valide_resp: { label: "Validé resp.", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
    publie: { label: "Publié", color: "bg-slate-100 text-slate-600", icon: CheckCircle2 },
};

export default function AnalysesPage() {
    const [search, setSearch] = useState("");
    const [statutFilter, setStatutFilter] = useState("tous");
    const [matriceFilter, setMatriceFilter] = useState("toutes");

    const filtered = demoAnalyses.filter(a => {
        if (search && !a.codeBarres.toLowerCase().includes(search.toLowerCase()) && !a.parametre.toLowerCase().includes(search.toLowerCase())) return false;
        if (statutFilter !== "tous" && a.statut !== statutFilter) return false;
        if (matriceFilter !== "toutes" && !a.matrice.toLowerCase().includes(matriceFilter.toLowerCase())) return false;
        return true;
    });

    const stats = {
        total: demoAnalyses.length,
        assignees: demoAnalyses.filter(a => a.statut === "assignee").length,
        enCours: demoAnalyses.filter(a => a.statut === "en_cours").length,
        terminées: demoAnalyses.filter(a => ["resultat_saisi", "valide_tech", "valide_resp", "publie"].includes(a.statut)).length,
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Microscope className="h-7 w-7 text-orange-600" /> Toutes les analyses
                    </h1>
                    <p className="text-muted-foreground text-sm">Liste complète des analyses du laboratoire</p>
                </div>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="shadow-sm"><CardContent className="p-4 text-center"><p className="text-xs text-slate-500">Total</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
                <Card className="shadow-sm"><CardContent className="p-4 text-center"><p className="text-xs text-slate-500">Assignées</p><p className="text-2xl font-bold text-blue-600">{stats.assignees}</p></CardContent></Card>
                <Card className="shadow-sm"><CardContent className="p-4 text-center"><p className="text-xs text-slate-500">En cours</p><p className="text-2xl font-bold text-amber-600">{stats.enCours}</p></CardContent></Card>
                <Card className="shadow-sm"><CardContent className="p-4 text-center"><p className="text-xs text-slate-500">Terminées</p><p className="text-2xl font-bold text-emerald-600">{stats.terminées}</p></CardContent></Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Rechercher par code-barres, paramètre..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Select value={statutFilter} onValueChange={setStatutFilter}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Statut" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="tous">Tous les statuts</SelectItem>
                        <SelectItem value="assignee">Assignée</SelectItem>
                        <SelectItem value="en_cours">En cours</SelectItem>
                        <SelectItem value="resultat_saisi">Résultat saisi</SelectItem>
                        <SelectItem value="valide_tech">Validé tech.</SelectItem>
                        <SelectItem value="valide_resp">Validé resp.</SelectItem>
                        <SelectItem value="publie">Publié</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={matriceFilter} onValueChange={setMatriceFilter}>
                    <SelectTrigger className="w-[160px]"><SelectValue placeholder="Matrice" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="toutes">Toutes matrices</SelectItem>
                        <SelectItem value="viande">Viande</SelectItem>
                        <SelectItem value="poisson">Poisson</SelectItem>
                        <SelectItem value="céréale">Céréale</SelectItem>
                        <SelectItem value="eau">Eau</SelectItem>
                        <SelectItem value="produit laitier">Produit laitier</SelectItem>
                        <SelectItem value="fruit">Fruit</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <Card className="shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead>Code-barres</TableHead>
                                <TableHead>Matrice</TableHead>
                                <TableHead>Paramètre</TableHead>
                                <TableHead>Méthode</TableHead>
                                <TableHead>Technicien</TableHead>
                                <TableHead>Poste</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Statut</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((a) => {
                                const s = statutConfig[a.statut];
                                return (
                                    <TableRow key={a.id} className="hover:bg-slate-50/60">
                                        <TableCell className="font-mono text-sm font-semibold">{a.codeBarres}</TableCell>
                                        <TableCell className="text-sm">{a.matrice}</TableCell>
                                        <TableCell className="text-sm font-medium">{a.parametre}</TableCell>
                                        <TableCell className="text-xs text-slate-500">{a.methode}</TableCell>
                                        <TableCell className="text-sm">{a.technicien}</TableCell>
                                        <TableCell className="text-xs text-slate-500">{a.poste}</TableCell>
                                        <TableCell className="text-sm">{a.dateAssignation}</TableCell>
                                        <TableCell>
                                            <Badge className={`text-xs border-0 ${s.color}`}>{s.label}</Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {filtered.length === 0 && (
                                <TableRow><TableCell colSpan={8} className="text-center py-8 text-sm text-slate-400">Aucune analyse trouvée</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <p className="text-xs text-slate-400 text-right">{filtered.length} analyse(s) affichée(s)</p>
        </div>
    );
}
