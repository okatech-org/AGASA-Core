"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, ShieldAlert, Eye, AlertTriangle, BugOff, Flame, FilterX, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function AlertesActivesPage() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [filtreType, setFiltreType] = useState("tous");
    const [filtreNiveau, setFiltreNiveau] = useState("tous");

    const toutesAlertes = useQuery(api.alertes.alertes.listerAlertes as any, { userId: user?._id as any });

    if (toutesAlertes === undefined) return <div className="p-8 text-center animate-pulse">Chargement des alertes actives...</div>;

    const filtered = toutesAlertes.filter((a: any) => {
        const mc = a.titre.toLowerCase().includes(searchTerm.toLowerCase());
        const t = filtreType === "tous" || a.type === filtreType;
        const n = filtreNiveau === "tous" || a.niveau === filtreNiveau;
        // On ne garde que les alertes actives
        const isActif = ["nouvelle", "en_verification", "confirmee"].includes(a.statut);

        return mc && t && n && isActif;
    });

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'biologique': return <BugOff className="w-4 h-4 text-emerald-600" />;
            case 'chimique': return <Flame className="w-4 h-4 text-amber-600" />;
            case 'physique': return <AlertTriangle className="w-4 h-4 text-slate-600" />;
            default: return <ShieldAlert className="w-4 h-4 text-slate-400" />;
        }
    };

    const getNiveauBadge = (niveau: string) => {
        switch (niveau) {
            case 'information': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none">Information</Badge>;
            case 'vigilance': return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none">Vigilance</Badge>;
            case 'alerte': return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-none">Alerte</Badge>;
            case 'urgence': return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-none">Urgence</Badge>;
            default: return <Badge variant="outline">Inconnu</Badge>;
        }
    };

    const getStatutBadge = (statut: string) => {
        switch (statut) {
            case 'nouvelle': return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">🆕 Nouvelle</Badge>;
            case 'en_verification': return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">🔎 Audit en cours</Badge>;
            case 'confirmee': return <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">⚠️ Confirmée</Badge>;
            default: return <Badge variant="outline">{statut}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-red-600 pl-3 flex items-center gap-2">
                        <Activity className="h-7 w-7 text-red-600" />
                        Alertes Sanitaires Actives
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">Suivi temps réel des investigations et signalements en cours de traitement.</p>
                </div>
            </div>

            {/* Filtres */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Rechercher une alerte en cours..."
                        className="pl-9 border-slate-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap md:flex-nowrap gap-2">
                    <Select value={filtreType} onValueChange={setFiltreType}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Danger" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="tous">Tous Dangers</SelectItem>
                            <SelectItem value="biologique">Biologique (Bact.)</SelectItem>
                            <SelectItem value="chimique">Chimique (Toxine)</SelectItem>
                            <SelectItem value="physique">Physique</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filtreNiveau} onValueChange={setFiltreNiveau}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Niveau" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="tous">Tous Niveaux</SelectItem>
                            <SelectItem value="information">Information</SelectItem>
                            <SelectItem value="vigilance">Vigilance</SelectItem>
                            <SelectItem value="alerte">Alerte Rouge</SelectItem>
                            <SelectItem value="urgence">Urgence Absolue</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" size="icon" onClick={() => { setSearchTerm(''); setFiltreType('tous'); setFiltreNiveau('tous'); }}>
                        <FilterX className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-md border shadow-sm overflow-x-auto">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[300px]">Description & Type</TableHead>
                            <TableHead>Localisation</TableHead>
                            <TableHead>Ouverture</TableHead>
                            <TableHead>Gravité</TableHead>
                            <TableHead>Statut Actuel</TableHead>
                            <TableHead className="text-right">Assignat.</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                                    <ShieldAlert className="w-12 h-12 mx-auto text-slate-200 mb-4" />
                                    Aucune alerte active ne correspond à vos filtres.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((alerte: any) => (
                                <TableRow key={alerte._id} className="hover:bg-slate-50 group">
                                    <TableCell>
                                        <div className="flex gap-3">
                                            <div className="mt-1 p-1.5 bg-slate-100 rounded-md shrink-0">
                                                {getTypeIcon(alerte.type)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{alerte.titre}</div>
                                                <div className="text-xs text-slate-500 line-clamp-1">{alerte.description}</div>
                                                <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 font-mono">
                                                    Source: {alerte.source.replace('_', ' ')}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-sm text-slate-700">{alerte.zoneGeographique}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm font-medium text-slate-700">
                                            {format(new Date(alerte.dateCreation), "dd/MM/yyyy", { locale: fr })}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {format(new Date(alerte.dateCreation), "HH:mm")}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getNiveauBadge(alerte.niveau)}
                                    </TableCell>
                                    <TableCell>
                                        {getStatutBadge(alerte.statut)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-xs text-slate-600 line-clamp-1 max-w-[120px] bg-slate-100 px-2 py-0.5 rounded">
                                                {alerte.assigneeA}
                                            </span>
                                            <Button variant="ghost" size="sm" className="h-7 text-xs flex gap-1" asChild>
                                                <Link href={`/alertes/alertes/${alerte._id}`}><Eye className="w-3 h-3" /> Suivre</Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="text-right text-xs text-slate-400">
                {filtered.length} alertes actives
            </div>
        </div>
    );
}
