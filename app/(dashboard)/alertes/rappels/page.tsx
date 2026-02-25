"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Megaphone, Smartphone, ExternalLink, Globe } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function RappelsProduitsPage() {
    const { user } = useAuth();
    const rappels = useQuery(api.alertes.rappels.listerRappels as any, { userId: user?._id as any });

    if (rappels === undefined) return <div className="p-8 text-center animate-pulse">Chargement du registre de rappels (F5/F2)...</div>;

    const getStatutBadge = (statut: string) => {
        switch (statut) {
            case 'en_preparation': return <Badge variant="outline" className="text-slate-600 bg-slate-50 border-slate-200">En conception</Badge>;
            case 'diffuse': return <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">Diffusé Canaux</Badge>;
            case 'en_cours': return <Badge variant="outline" className="text-orange-600 bg-orange-50 border-orange-200">Opération Active</Badge>;
            case 'termine': return <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">Retrait Sécurisé</Badge>;
            default: return <Badge variant="outline">{statut}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-orange-600 pl-3">Registres de Retrait & Rappels</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Gestion des interdictions de consommation et diffusion aux professionnels/citoyens.</p>
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white" asChild>
                    <Link href="/alertes/rappels/nouveau" className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Lancer une alerte lot
                    </Link>
                </Button>
            </div>

            <div className="bg-white rounded-md border shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[300px]">Produit Incriminé</TableHead>
                            <TableHead>Danger / Motif</TableHead>
                            <TableHead>Canaux Activés</TableHead>
                            <TableHead>Diffusion Centrale</TableHead>
                            <TableHead>Statut Opérationnel</TableHead>
                            <TableHead className="text-right">Alerte Source</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rappels.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                                    <Megaphone className="w-12 h-12 mx-auto text-slate-200 mb-4" />
                                    Aucun lot de produit sous le coup d'un rappel officiel.
                                </TableCell>
                            </TableRow>
                        ) : (
                            rappels.map((r: any) => (
                                <TableRow key={r._id} className="hover:bg-slate-50">
                                    <TableCell>
                                        <div className="font-semibold text-slate-900 font-mono text-sm">{r.lot}</div>
                                        <div className="text-sm font-bold text-red-600 truncate">{r.produit}</div>
                                        <div className="text-xs text-slate-500">Marque: {r.marque}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm font-medium text-slate-800 line-clamp-1">{r.motif}</div>
                                        <div className="text-xs text-orange-600 font-medium">Action : {r.actionRecommandee}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1.5 flex-wrap max-w-[150px]">
                                            {r.cannauxDiffusion.sms && <Badge variant="secondary" className="text-[9px] px-1 bg-slate-200"><Smartphone className="w-2.5 h-2.5 mr-0.5 inline" />SMS</Badge>}
                                            {r.cannauxDiffusion.push && <Badge variant="secondary" className="text-[9px] px-1 bg-emerald-100 text-emerald-800 border-[0.5px] border-emerald-300">F6 Citoyen</Badge>}
                                            {r.cannauxDiffusion.portail && <Badge variant="secondary" className="text-[9px] px-1 bg-blue-100 text-blue-800 border-[0.5px] border-blue-300">F2 Pro</Badge>}
                                            {r.cannauxDiffusion.reseauxSociaux && <Badge variant="secondary" className="text-[9px] px-1 bg-slate-800 text-white"><Globe className="w-2.5 h-2.5 mr-0.5 inline" />X/FB</Badge>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm font-medium text-slate-700">
                                            {r.dateDiffusion ? format(new Date(r.dateDiffusion), "dd/MM/yyyy HH:mm") : "-"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStatutBadge(r.statut)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {r.alerteId && (
                                            <Button variant="ghost" size="sm" className="h-8 text-xs text-blue-600 hover:text-blue-800" asChild>
                                                <Link href={`/alertes/alertes/${r.alerteId}`}><ExternalLink className="w-3 h-3 mr-1" /> Dossier</Link>
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="text-slate-500 text-xs italic">
                * Les diffusions "F6 Citoyen" déclenchent une notification push auprès de tous les usagers de l'application AGASA-Citoyen.
            </div>
        </div>
    );
}
