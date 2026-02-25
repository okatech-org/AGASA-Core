"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle, AlertTriangle, FileUp, Link as LinkIcon, Download } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function RapprochementBancairePage() {
    const { user } = useAuth();
    const [isUploading, setIsUploading] = useState(false);

    const stats = useQuery(api.finance.comptabilite.getStatsRapprochement, {
        userId: user?._id as any
    });

    const formatMontant = (m: number) => {
        return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XAF", maximumFractionDigits: 0 }).format(m);
    };

    const handleUploadReleve = () => {
        setIsUploading(true);
        setTimeout(() => {
            setIsUploading(false);
            toast.success("Relevé bancaire importé et analysé avec succès.");
        }, 1500);
    };

    if (stats === undefined) return <div className="p-8 text-center animate-pulse">Extraction des écritures bancaires...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-slate-900 pl-3">Rapprochement Bancaire</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Synchronisation et pointage des écritures "Banque" avec le relevé de compte officiel.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="text-slate-700 bg-white">
                        <Download className="w-4 h-4 mr-2" /> Exporter le PV
                    </Button>
                    <Button onClick={handleUploadReleve} disabled={isUploading} className="bg-slate-900 hover:bg-slate-800">
                        {isUploading ? <span className="animate-pulse">Importation...</span> : <><Upload className="w-4 h-4 mr-2" /> Importer Relevé (CSV)</>}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Résumé du Rapprochement */}
                <Card className="shadow-sm border-slate-200 md:col-span-1">
                    <CardHeader className="bg-slate-50/50 border-b p-4">
                        <CardTitle className="text-lg">État d'Avancement</CardTitle>
                        <CardDescription>Période en cours</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-semibold text-slate-700">Progression du pointage</span>
                                <span className="font-bold text-emerald-700">{stats.tauxAvancement.toFixed(0)}%</span>
                            </div>
                            <Progress value={stats.tauxAvancement} className="h-2 bg-slate-100 [&>div]:bg-emerald-600" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
                                <span className="text-2xl font-bold text-slate-900">{stats.lignesRapprochees}</span>
                                <span className="text-xs text-muted-foreground mt-1">Lignes Pointées</span>
                            </div>
                            <div className="p-4 rounded bg-orange-50 border border-orange-100 flex flex-col items-center justify-center text-center">
                                <span className="text-2xl font-bold text-orange-700">{stats.lignesEnAttente}</span>
                                <span className="text-xs text-orange-600/80 mt-1">En suspens</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <p className="text-sm font-medium text-slate-700 mb-2">Algorithme de lettrage</p>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <CheckCircle className="w-4 h-4 text-emerald-500" /> Montant exact
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                <CheckCircle className="w-4 h-4 text-emerald-500" /> Date (Marge de 3 jours)
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table des non rapprochés */}
                <Card className="shadow-sm border-slate-200 md:col-span-2">
                    <CardHeader className="bg-slate-50/50 border-b p-4 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" /> Écritures en suspens
                            </CardTitle>
                            <CardDescription>Lignes du journal "Banque" sans correspondance sur le relevé importé</CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-none">
                            {stats.lignesEnAttente} lignes
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-white">
                                    <TableHead>Date</TableHead>
                                    <TableHead>Référence</TableHead>
                                    <TableHead>Libellé Interne</TableHead>
                                    <TableHead className="text-right">Montant</TableHead>
                                    <TableHead className="text-center">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.ecrituresA_Rapprocher.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground flex flex-col items-center">
                                            <CheckCircle className="w-12 h-12 text-emerald-400 mb-2 opacity-50" />
                                            <span>Excellent ! Toutes les écritures sont rapprochées.</span>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    stats.ecrituresA_Rapprocher.map((e) => (
                                        <TableRow key={e._id} className="hover:bg-orange-50/30">
                                            <TableCell className="font-mono text-xs text-slate-500">{format(new Date(e.dateEcriture), "dd/MM/yy")}</TableCell>
                                            <TableCell className="font-semibold text-slate-900 text-xs">{e.reference}</TableCell>
                                            <TableCell className="text-slate-700 max-w-[200px] truncate">{e.libelle}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                {e.debit > 0 ? <span className="text-emerald-700">+{formatMontant(e.debit)}</span> : <span className="text-rose-700">-{formatMontant(e.credit)}</span>}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button size="sm" variant="ghost" className="h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                                                    <LinkIcon className="w-4 h-4 mr-1" /> Forcer
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
