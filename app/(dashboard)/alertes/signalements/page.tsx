"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, FilterX, Smartphone, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";

export default function SignalementsCitoyensPage() {
    const { user } = useAuth();
    const sign = useQuery(api.alertes.signalements.listerSignalements as any, { userId: user?._id as any });
    const [searchTerm, setSearchTerm] = useState("");

    if (sign === undefined) return <div className="p-8 text-center animate-pulse">Relais de la plateforme citoyenne F6...</div>;

    const filtered = sign.filter((s: any) =>
        s.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.provinceAssignee.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatutBadge = (statut: string) => {
        switch (statut) {
            case 'recu': return <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">📩 Nouveau</Badge>;
            case 'en_verification': return <Badge variant="outline" className="text-orange-600 bg-orange-50 border-orange-200">🔎 Investigation</Badge>;
            case 'confirme': return <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200">⚠️ Fondé</Badge>;
            case 'infonde': return <Badge variant="outline" className="text-slate-500 bg-slate-50 border-slate-200">❌ Infondé</Badge>;
            case 'traite': return <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">✔️ Traité</Badge>;
            default: return <Badge variant="outline">{statut}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-blue-600 pl-3">Signalements Citoyens (F6)</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Tour de contrôle des remontées issues de l'application AGASA-Citoyen.</p>
                </div>
            </div>

            <div className="flex gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Rechercher par référence, description ou province..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                    <FilterX className="w-4 h-4 mr-2" /> Réinitialiser
                </Button>
            </div>

            <div className="bg-white rounded-md border shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead>Identité Source</TableHead>
                            <TableHead className="w-[300px]">Description Sommaire</TableHead>
                            <TableHead>Zone</TableHead>
                            <TableHead>Date Réception</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                                    <Smartphone className="w-12 h-12 mx-auto text-slate-200 mb-4" />
                                    Aucune remontée citoyenne pour la zone consultée.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((s: any) => (
                                <TableRow key={s._id} className="hover:bg-slate-50">
                                    <TableCell>
                                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                                            {s.reference}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            {s.anonyme ? (
                                                <Badge variant="secondary" className="text-[10px]">Source Anonyme</Badge>
                                            ) : (
                                                <span className="text-slate-600 truncate max-w-[150px] inline-block">Ref Citoyen: {s.signaleurRef}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-slate-800 line-clamp-2">{s.description}</div>
                                        <Badge variant="outline" className="mt-2 text-[10px] capitalize bg-slate-50">{s.categorie.replace('_', ' ')}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm font-medium flex items-center gap-1 text-slate-700">
                                            <MapPin className="w-3 h-3" /> {s.provinceAssignee}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm font-medium text-slate-700">
                                            {format(new Date(s.dateReception), "dd/MM/yyyy", { locale: fr })}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {format(new Date(s.dateReception), "HH:mm")}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStatutBadge(s.statut)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" className="h-8 flex gap-1 items-center" asChild>
                                            <Link href={`/alertes/signalements/${s._id}`}><Eye className="w-4 h-4" /> Ouvrir</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
