"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import {
    GitMerge, Plus, Search, CheckCircle2, XCircle, Clock,
    FileText, UserRound, ArrowRight, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function WorkflowsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatut, setFilterStatut] = useState("tous");

    const workflows = useQuery(api.ged.workflows.listerWorkflows, {
        userId: user?._id as any
    });

    const getStatutBadge = (statut: string) => {
        switch (statut) {
            case "en_cours": return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200"><Clock className="w-3 h-3 mr-1" /> En cours</Badge>;
            case "approuve": return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Approuvé</Badge>;
            case "rejete": return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Rejeté</Badge>;
            default: return <Badge variant="outline">{statut}</Badge>;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "marche_public": return "text-purple-700 bg-purple-50 border-purple-200";
            case "decision_administrative": return "text-blue-700 bg-blue-50 border-blue-200";
            case "note_service": return "text-emerald-700 bg-emerald-50 border-emerald-200";
            case "courrier_sortant": return "text-orange-700 bg-orange-50 border-orange-200";
            default: return "text-slate-700 bg-slate-50 border-slate-200";
        }
    };

    const formatType = (type: string) => type.replace(/_/g, " ");

    const filtered = (workflows || []).filter((w: any) => {
        const full = `${w.reference} ${w.titreDocument} ${w.initiateur?.prenom} ${w.initiateur?.nom}`.toLowerCase();
        const matchSearch = full.includes(searchTerm.toLowerCase());
        const matchStatut = filterStatut === "tous" || w.statut === filterStatut;
        return matchSearch && matchStatut;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tightflex items-center gap-2">
                        <GitMerge className="h-6 w-6 text-[#1B4F72] inline-block mr-2" />
                        Circuits de Validation
                    </h1>
                    <p className="text-muted-foreground text-sm">Gestion des workflows d'approbation (Marchés, Décisions, Notes)</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button onClick={() => router.push("/ged/workflows/nouveau")} className="bg-[#1B4F72] hover:bg-[#1B4F72]/90 w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" /> Lancer un circuit
                    </Button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-lg border shadow-sm">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher une référence, objet, initiateur..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full sm:w-48">
                    <Select value={filterStatut} onValueChange={setFilterStatut}>
                        <SelectTrigger>
                            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Filtrer par statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="tous">Tous les statuts</SelectItem>
                            <SelectItem value="en_cours">En cours</SelectItem>
                            <SelectItem value="approuve">Approuvé</SelectItem>
                            <SelectItem value="rejete">Rejeté</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="bg-white rounded-lg border shadow-sm">
                {workflows === undefined ? (
                    <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B4F72] mb-4"></div>
                        Chargement des workflows...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-16 text-center">
                        <GitMerge className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-800">Aucun circuit trouvé</h3>
                        <p className="text-sm text-muted-foreground mt-1">Vous n'avez aucun workflow correspondant à ces filtres.</p>
                        {searchTerm === "" && filterStatut === "tous" && (
                            <Button variant="outline" className="mt-4" onClick={() => router.push("/ged/workflows/nouveau")}>
                                Initialiser le premier circuit
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50 text-xs uppercase tracking-wider">
                                    <TableHead className="w-[150px]">Date / Réf.</TableHead>
                                    <TableHead>Type & Objet</TableHead>
                                    <TableHead>Initiateur</TableHead>
                                    <TableHead>Progression</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((w: any) => (
                                    <TableRow key={w._id} className="cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => router.push(`/ged/workflows/${w._id}`)}>
                                        <TableCell>
                                            <div className="font-semibold text-sm ">{format(w.dateCreation, "dd MMM yyyy", { locale: fr })}</div>
                                            <div className="text-xs text-muted-foreground mt-1 font-mono">{w.reference}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className={`capitalize font-medium text-[10px] h-5 ${getTypeColor(w.type)}`}>
                                                    {formatType(w.type)}
                                                </Badge>
                                            </div>
                                            <div className="font-medium text-sm flex items-center gap-2">
                                                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                                                <span className="line-clamp-1">{w.titreDocument}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-sm text-slate-900">{w.initiateur?.prenom} {w.initiateur?.nom}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5">{w.initiateur?.direction}</div>
                                        </TableCell>
                                        <TableCell>
                                            {w.statut === "en_cours" ? (
                                                <div className="flex flex-col justify-center">
                                                    <span className="text-xs font-semibold text-orange-600 mb-1">Étape {w.etapeActuelle}</span>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <UserRound className="w-3 h-3" /> En attente de :
                                                        <span className="font-medium text-slate-700">{w.valideurActuel?.prenom} {w.valideurActuel?.nom}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">
                                                    Circuit terminé
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {getStatutBadge(w.statut)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/ged/workflows/${w._id}`); }}>
                                                Détails <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
}
