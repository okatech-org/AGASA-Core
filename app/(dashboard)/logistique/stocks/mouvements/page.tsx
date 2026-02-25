"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpRight, ArrowDownRight, RefreshCw, BarChart2 } from "lucide-react";

export default function MouvementsStockPage() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [typeAlerte, setTypeAlerte] = useState("tous");

    const flux = useQuery(api.logistique.stocks.listerMouvements, {
        userId: user?._id as any
    });

    const filtered = (flux || []).filter(m =>
        (typeAlerte === "tous" || m.type === typeAlerte) &&
        (m.article.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.motif.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.agent.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-[#1B4F72] pl-3">Mouvements & Flux</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Traçabilité complète des entrées, sorties et re-calibrations du stock.</p>
                </div>
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50/50 border-b pb-4 flex flex-col md:flex-row md:justify-between md:items-center p-4">
                    <div className="flex flex-1 gap-3 flex-col md:flex-row">
                        <Input
                            placeholder="Chercher (Article, Motif, Agent)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-md bg-white"
                        />
                        <Select value={typeAlerte} onValueChange={setTypeAlerte}>
                            <SelectTrigger className="w-[180px] bg-white">
                                <SelectValue placeholder="Type Ope." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="tous">Toutes les opérations</SelectItem>
                                <SelectItem value="entree">Réception (+)</SelectItem>
                                <SelectItem value="sortie">Matériel sorti (-)</SelectItem>
                                <SelectItem value="ajustement">Régul. Inventaire</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead>Date & Opération</TableHead>
                                <TableHead>Désignation Article</TableHead>
                                <TableHead className="text-center">Volume Mvmt.</TableHead>
                                <TableHead>Motif & Responsable Local</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {flux === undefined ? (
                                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground animate-pulse">Synchronisation des flux matériels...</TableCell></TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Aucun mouvement récent détecté.</TableCell></TableRow>
                            ) : (
                                filtered.map(m => (
                                    <TableRow key={m._id} className="cursor-pointer hover:bg-slate-50">
                                        <TableCell>
                                            <div className="font-semibold text-sm mb-1">{new Date(m.dateMouvement).toLocaleString("fr-FR")}</div>
                                            {m.type === "entree" && <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"><ArrowUpRight className="w-3 h-3 mr-1" /> Entrée</Badge>}
                                            {m.type === "sortie" && <Badge className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200"><ArrowDownRight className="w-3 h-3 mr-1" /> Sortie</Badge>}
                                            {m.type === "ajustement" && <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"><RefreshCw className="w-3 h-3 mr-1" /> Ajustement</Badge>}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-slate-900 border-l-[3px] border-slate-300 pl-2">{m.article}</div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className={`text-lg font-bold font-mono px-3 py-1 rounded-md ${m.type === "entree" ? 'bg-emerald-50 text-emerald-700' : (m.type === "ajustement" ? 'bg-cyan-50 text-cyan-700' : 'bg-orange-50 text-orange-700')}`}>
                                                {m.type === "entree" ? "+" : (m.type === "sortie" ? "-" : "")}{m.quantite}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm border-b pb-1 mb-1 max-w-[300px] truncate" title={m.motif}>{m.motif}</div>
                                            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                                <BarChart2 className="w-3 h-3" /> Exécuté par: {m.agent}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
