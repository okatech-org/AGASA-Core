"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, FileSignature, AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function LimsRapportsPage() {
    const { user } = useAuth();

    // Pour l'instant, on se base sur les échantillons "validés" pour simuler les rapports disponibles
    // Dans une implémentation complète, on interrogera `limsRapports`
    const echantillons = useQuery(api.lims.echantillons.listerEchantillons as any, { userId: user?._id as any });

    if (echantillons === undefined) return <div className="p-8 text-center animate-pulse">Recherche des certificats générés...</div>;

    // Filtre des échantillons terminés (Attente de rapport) ou Validés (Rapport émis)
    const rapportsPool = echantillons?.filter((e: any) => e.statut === "termine" || e.statut === "valide" || e.statut === "archive") || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-emerald-600 pl-3">Rapports d'Essais (RE)</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Édition, signature électronique et diffusion des certificats d'analyse.</p>
                </div>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-700 rounded-full"><FileSignature className="w-6 h-6" /></div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{rapportsPool.filter((e: any) => e.statut === "termine").length}</div>
                            <div className="text-sm font-medium text-slate-500">En attente de rédaction</div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 text-emerald-700 rounded-full"><CheckCircle2 className="w-6 h-6" /></div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{rapportsPool.filter((e: any) => e.statut === "valide").length}</div>
                            <div className="text-sm font-medium text-slate-500">Validés et Signés</div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-purple-100 text-purple-700 rounded-full"><FileText className="w-6 h-6" /></div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{rapportsPool.length}</div>
                            <div className="text-sm font-medium text-slate-500">Volume Global d'Édition</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Liste des Rapports */}
            <Card className="shadow-sm border-slate-200">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/80">
                            <TableRow>
                                <TableHead className="w-[150px]">Réf. Dossier</TableHead>
                                <TableHead>Date d'émission</TableHead>
                                <TableHead>Matrice analysée</TableHead>
                                <TableHead>Statut d'Accréditation</TableHead>
                                <TableHead>Conclusion</TableHead>
                                <TableHead className="text-right">Opérations</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rapportsPool.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                                        Aucun rapport d'essai dans le pool actuel. Terminez d'abord des analyses.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rapportsPool.map((echantillon: any) => (
                                    <TableRow key={echantillon._id} className="hover:bg-slate-50">
                                        <TableCell className="font-mono font-bold text-purple-700">
                                            {echantillon.codeBarres}
                                            {echantillon.statut === "valide" && (
                                                <div className="text-xs text-slate-400 font-normal">RE-{new Date().getFullYear()}-00{echantillon.codeBarres.slice(-3)}</div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium text-slate-700">
                                                {echantillon.statut === "valide"
                                                    ? format(Date.now(), "dd MMM yyyy", { locale: fr })
                                                    : <span className="text-slate-400 italic">En attente</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm font-semibold capitalize text-slate-800">{echantillon.matrice}</div>
                                            <div className="text-xs text-slate-500 max-w-[200px] truncate">{echantillon.description}</div>
                                        </TableCell>
                                        <TableCell>
                                            {/* Mock de l'accréditation des paramètres */}
                                            <div className="flex items-center gap-1.5 text-xs font-semibold">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Sous Accréditation COFRAC
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {echantillon.statut === "valide" ? (
                                                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Conforme
                                                </Badge>
                                            ) : echantillon.statut === "termine" ? (
                                                <Badge variant="outline" className="text-slate-600 border-slate-300">
                                                    Brouillon RE
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-none">
                                                    <AlertCircle className="w-3 h-3 mr-1" /> Non Conforme
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {echantillon.statut === "termine" ? (
                                                <Button size="sm" variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                                                    <FileSignature className="w-4 h-4 mr-2" /> Éditer & Signer
                                                </Button>
                                            ) : (
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="h-8 border-emerald-200 text-emerald-700 bg-emerald-50">
                                                        <Download className="w-4 h-4 mr-2" /> PDF ISO
                                                    </Button>
                                                </div>
                                            )}
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
