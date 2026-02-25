"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function ListeRedevancesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [statutFilter, setStatutFilter] = useState("tous");

    const redevances = useQuery(api.finance.redevances.listerRedevances, {
        userId: user?._id as any
    });

    const formatMontant = (m: number) => {
        return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XAF", maximumFractionDigits: 0 }).format(m);
    };

    const filtrerRedevances = () => {
        if (!redevances) return [];
        return redevances.filter(r => {
            const matchSearch = r.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.operateur?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchStatut = statutFilter === "tous" || r.statut === statutFilter;
            return matchSearch && matchStatut;
        });
    };

    const getBadgeOptions = (statut: string) => {
        switch (statut) {
            case "paye":
            case "encaisse": return { color: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200", label: "Payé" };
            case "en_attente": return { color: "bg-amber-100 text-amber-800 hover:bg-amber-200", label: "En attente" };
            case "en_retard": return { color: "bg-orange-100 text-orange-800 hover:bg-orange-200", label: "En Retard" };
            case "relance_j15": return { color: "bg-orange-200 text-orange-900 hover:bg-orange-300", label: "Relancé (J+15)" };
            case "relance_j30": return { color: "bg-red-200 text-red-900 hover:bg-red-300", label: "Relancé (J+30)" };
            case "recouvrement_force": return { color: "bg-slate-900 text-white hover:bg-slate-800", label: "Recouvrement Forcé" };
            case "annule": return { color: "bg-slate-100 text-slate-500 hover:bg-slate-200", label: "Annulé" };
            default: return { color: "bg-slate-100 text-slate-800", label: statut };
        }
    };

    if (redevances === undefined) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Chargement de la base de facturation...</div>;
    }

    const dataFiltree = filtrerRedevances();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-slate-900 pl-3">Registre des Créances</h1>
                    <p className="text-muted-foreground mt-1 text-sm">{dataFiltree.length} factures / redevances référencées dans le SI.</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Chercher par Référence ou Opérateur..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <select
                        className="h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
                        value={statutFilter}
                        onChange={(e) => setStatutFilter(e.target.value)}
                    >
                        <option value="tous">Tous les statuts</option>
                        <option value="en_attente">En attente</option>
                        <option value="paye">Encaissées</option>
                        <option value="relance_j15">Relance (J+15)</option>
                        <option value="relance_j30">Relance (J+30)</option>
                        <option value="recouvrement_force">Recouvrement Forcé</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead>Référence</TableHead>
                                <TableHead>Opérateur</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Origine (App)</TableHead>
                                <TableHead className="text-right">Montant</TableHead>
                                <TableHead>Échéance</TableHead>
                                <TableHead className="text-center">Statut</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dataFiltree.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">Aucune redevance trouvée pour ces critères.</TableCell>
                                </TableRow>
                            ) : (
                                dataFiltree.map((r) => {
                                    const badge = getBadgeOptions(r.statut);
                                    return (
                                        <TableRow key={r._id} className="hover:bg-slate-50 transition-colors">
                                            <TableCell className="font-mono text-xs font-semibold">{r.reference}</TableCell>
                                            <TableCell className="font-medium text-slate-900">{r.operateur}</TableCell>
                                            <TableCell className="capitalize text-slate-600">{r.type}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-[10px] uppercase bg-slate-50">{r.sourceApp.replace('_', ' ')}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-slate-900">{formatMontant(r.montant)}</TableCell>
                                            <TableCell className="text-slate-600 text-sm">
                                                {format(new Date(r.dateEcheance), "dd MMM yyyy", { locale: fr })}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge className={badge.color} variant="secondary">
                                                    {badge.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="ghost" onClick={() => router.push(`/finance/redevances/${r._id}`)}>
                                                    <Eye className="h-4 w-4" />
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
        </div>
    );
}
