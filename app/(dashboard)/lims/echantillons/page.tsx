"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Search, PlusCircle, FlaskConical, MapPin, CalendarDays, CheckCircle2, ShieldAlert, Archive, Trash2, Edit3, ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LimsEchantillonsListPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [filtreMatrice, setFiltreMatrice] = useState("toutes");
    const [filtreStatut, setFiltreStatut] = useState("tous");

    const echantillons = useQuery(api.lims.echantillons.listerEchantillons as any, { userId: user?._id as any });

    const getStatusInfo = (statut: string) => {
        switch (statut) {
            case "recu": return { label: "Reçu", color: "bg-slate-100 text-slate-700", icon: <ClipboardList className="w-3 h-3 mr-1" /> };
            case "enregistre": return { label: "Enregistré", color: "bg-blue-100 text-blue-800", icon: <Edit3 className="w-3 h-3 mr-1" /> };
            case "en_analyse": return { label: "En Analyse", color: "bg-purple-100 text-purple-800", icon: <FlaskConical className="w-3 h-3 mr-1 animate-pulse" /> };
            case "termine": return { label: "Analyse Terminée", color: "bg-emerald-100 text-emerald-800", icon: <CheckCircle2 className="w-3 h-3 mr-1" /> };
            case "valide": return { label: "Validé (Directeur)", color: "bg-green-100 text-green-900 border border-green-300", icon: <ShieldAlert className="w-3 h-3 mr-1" /> };
            case "archive": return { label: "Archivé", color: "bg-orange-100 text-orange-800", icon: <Archive className="w-3 h-3 mr-1" /> };
            case "detruit": return { label: "Détruit", color: "bg-red-100 text-red-800", icon: <Trash2 className="w-3 h-3 mr-1" /> };
            default: return { label: statut, color: "bg-gray-100 text-gray-800", icon: null };
        }
    };

    const getOrigineLabel = (o: string) => {
        if (o === "inspection") return "AGASA-Inspect (Terrain)";
        if (o === "operateur") return "AGASA-Pro (Commande)";
        return "Demande Interne";
    };

    if (echantillons === undefined) return <div className="p-8 text-center text-muted-foreground animate-pulse">Chargement de la base LIMS...</div>;

    const filtered = echantillons?.filter((e: any) => {
        const matchSearch = e.codeBarres.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (e.referenceSource || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchMatrice = filtreMatrice === "toutes" || e.matrice === filtreMatrice;
        const matchStatut = filtreStatut === "tous" || e.statut === filtreStatut;
        return matchSearch && matchMatrice && matchStatut;
    });

    // Calculs pour le pipeline visuel
    const statsPipeline = {
        nouveaux: echantillons?.filter((e: any) => e.statut === "recu" || e.statut === "enregistre").length || 0,
        labo: echantillons?.filter((e: any) => e.statut === "en_analyse").length || 0,
        finis: echantillons?.filter((e: any) => e.statut === "termine" || e.statut === "valide").length || 0
    };

    const totalE = echantillons?.length || 1; // eviter div 0

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-purple-600 pl-3">Registre des Échantillons</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Gestion du cycle de vie analytique (Réception, Tests, ISO 17025).</p>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => router.push('/lims/echantillons/nouveau')}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Enregistrer un prélèvement
                </Button>
            </div>

            {/* Pipeline Visuel */}
            <Card className="shadow-sm border-slate-200 overflow-hidden">
                <CardContent className="p-0 flex">
                    <div className="flex-1 p-4 bg-slate-50 border-r border-slate-200 flex flex-col justify-center items-center text-center">
                        <span className="text-2xl font-bold text-slate-700">{statsPipeline.nouveaux}</span>
                        <span className="text-xs text-slate-500 uppercase font-semibold">À Analyser</span>
                        <div className="w-full bg-slate-200 h-1.5 mt-2 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: `${(statsPipeline.nouveaux / totalE) * 100}%` }}></div>
                        </div>
                    </div>
                    <div className="flex-1 p-4 bg-purple-50/30 border-r border-slate-200 flex flex-col justify-center items-center text-center">
                        <span className="text-2xl font-bold text-purple-700">{statsPipeline.labo}</span>
                        <span className="text-xs text-purple-600/80 uppercase font-semibold">Sur Paillasse (Labo)</span>
                        <div className="w-full bg-slate-200 h-1.5 mt-2 rounded-full overflow-hidden">
                            <div className="bg-purple-500 h-full" style={{ width: `${(statsPipeline.labo / totalE) * 100}%` }}></div>
                        </div>
                    </div>
                    <div className="flex-1 p-4 bg-emerald-50/30 flex flex-col justify-center items-center text-center">
                        <span className="text-2xl font-bold text-emerald-700">{statsPipeline.finis}</span>
                        <span className="text-xs text-emerald-600/80 uppercase font-semibold">Analyses Terminées</span>
                        <div className="w-full bg-slate-200 h-1.5 mt-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full" style={{ width: `${(statsPipeline.finis / totalE) * 100}%` }}></div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Filtres */}
            <Card className="shadow-sm border-slate-200">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Recherche par Code-Barres, Description ou Réf Source..."
                                className="pl-9 border-slate-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={filtreMatrice} onValueChange={setFiltreMatrice}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Toutes Matrices" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="toutes">Toutes Matrices</SelectItem>
                                <SelectItem value="viande">Produits Carnés (Viande)</SelectItem>
                                <SelectItem value="poisson">Produits Halieutiques</SelectItem>
                                <SelectItem value="vegetal">Végétaux / Céréales</SelectItem>
                                <SelectItem value="eau">Eaux / Boissons</SelectItem>
                                <SelectItem value="autre">Autres</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filtreStatut} onValueChange={setFiltreStatut}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Tous Statuts" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="tous">Tous Statuts</SelectItem>
                                <SelectItem value="enregistre">Nouveaux (Enregistrés)</SelectItem>
                                <SelectItem value="en_analyse">En cours d'Analyse</SelectItem>
                                <SelectItem value="termine">Terminés</SelectItem>
                                <SelectItem value="valide">Validés (Rapport émis)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <div className="bg-white rounded-md border shadow-sm overflow-x-auto">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[180px]">Code-Barres LIMS</TableHead>
                            <TableHead>Réception</TableHead>
                            <TableHead>Origine</TableHead>
                            <TableHead>Matrice & Quantité</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                    Aucun échantillon ne correspond à vos critères.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered?.map((echantillon: any) => {
                                const statInfo = getStatusInfo(echantillon.statut);
                                return (
                                    <TableRow key={echantillon._id} className="hover:bg-slate-50 cursor-pointer" onClick={() => router.push(`/lims/echantillons/${echantillon._id}`)}>
                                        <TableCell className="font-mono font-bold text-purple-700">
                                            {echantillon.codeBarres}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-sm text-slate-700">
                                                <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                                {format(new Date(echantillon.dateReception), "dd MMM yyyy", { locale: fr })}
                                            </div>
                                            <div className="text-xs text-slate-500 ml-5">à {format(new Date(echantillon.dateReception), "HH:mm")}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium text-slate-900">{getOrigineLabel(echantillon.origine)}</div>
                                            {echantillon.referenceSource && (
                                                <div className="text-xs text-slate-500 font-mono mt-0.5">Réf: {echantillon.referenceSource}</div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-semibold capitalize text-slate-800">{echantillon.matrice}</div>
                                            <div className="text-xs text-slate-500 trunc w-48 truncate" title={echantillon.description}>{echantillon.description}</div>
                                            <div className="text-xs font-medium text-slate-700 mt-1">{echantillon.quantite} {echantillon.unite}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`${statInfo.color} font-medium px-2.5 py-0.5 border-transparent flex w-fit items-center`}>
                                                {statInfo.icon} {statInfo.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); router.push(`/lims/echantillons/${echantillon._id}`); }}>
                                                <Eye className="h-4 w-4 text-slate-500" />
                                                <span className="sr-only">Voir</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
