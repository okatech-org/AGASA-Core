"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, FlaskConical, Beaker, Zap, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LimsCatalogueAnalysesPage() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [filtreCat, setFiltreCat] = useState("toutes");

    const parametres = useQuery(api.lims.analyses.getCatalogue, { userId: user?._id as any });

    if (parametres === undefined) return <div className="p-8 text-center animate-pulse">Chargement du Répertoire de Méthodes ISO 17025...</div>;

    const filtered = parametres.filter(p => {
        const mc = p.nom.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase());
        const mt = filtreCat === "toutes" || p.categorie === filtreCat;
        return mc && mt;
    });

    const getCatIcon = (cat: string) => {
        switch (cat) {
            case "microbiologie": return <FlaskConical className="w-4 h-4 text-purple-600" />;
            case "chimie": return <Beaker className="w-4 h-4 text-emerald-600" />;
            case "physico_chimie": return <Zap className="w-4 h-4 text-amber-600" />;
            default: return <Eye className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-purple-600 pl-3">Référentiel Analytique</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Catalogue exhaustif des 253 paramètres d'essais accrédités du LAA.</p>
                </div>
                <Button variant="outline" className="bg-white">
                    <Download className="w-4 h-4 mr-2" /> Exporter OEC
                </Button>
            </div>

            {/* Filtres */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Rechercher par Nom du germe/métal, Code LIMS ou Norme..."
                        className="pl-9 border-slate-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={filtreCat} onValueChange={setFiltreCat}>
                    <SelectTrigger className="w-full md:w-[220px]">
                        <SelectValue placeholder="Catégorie d'Essai" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="toutes">Tous Secteurs</SelectItem>
                        <SelectItem value="microbiologie">Microbiologie Alimentaire</SelectItem>
                        <SelectItem value="chimie">Chimie & Résidus</SelectItem>
                        <SelectItem value="physico_chimie">Physico-Chimie</SelectItem>
                        <SelectItem value="toxicologie">Toxicologie</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table du Catalogue */}
            <div className="bg-white rounded-md border shadow-sm overflow-x-auto">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[120px]">Code LIMS</TableHead>
                            <TableHead>Paramètre (Germe / Molécule)</TableHead>
                            <TableHead>Catégorie</TableHead>
                            <TableHead>Méthode Normative</TableHead>
                            <TableHead className="text-right">Seuil / Limite Rég.</TableHead>
                            <TableHead className="text-center">Délai</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                                    <FlaskConical className="w-12 h-12 mx-auto text-slate-200 mb-4" />
                                    Aucun paramètre référencé (La base de données doit être initialisée avec le script Seed).
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((p) => (
                                <TableRow key={p._id} className="hover:bg-slate-50">
                                    <TableCell className="font-mono text-xs font-bold text-slate-700">{p.code}</TableCell>
                                    <TableCell className="font-semibold text-slate-900">{p.nom}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-xs capitalize text-slate-700">
                                            {getCatIcon(p.categorie)} {p.categorie.replace('_', ' ')}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-600 font-mono bg-slate-50 rounded px-2 w-fit">
                                        {p.methode} / {p.normeReference}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {p.seuilReglementaire ? (
                                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                {"<"} {p.seuilReglementaire} {p.unite}
                                            </Badge>
                                        ) : (
                                            <span className="text-slate-400 text-xs italic">LQ = {p.lq} {p.unite}</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center text-sm font-medium text-slate-700">
                                        {p.delaiJours} j
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="text-right text-xs text-slate-400">
                Liaison API Convex : {filtered.length} méthodes sur un panel de {parametres.length} accréditées ISO 17025.
            </div>
        </div>
    );
}
