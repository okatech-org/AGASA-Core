"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, Send, ShieldAlert, FileText, ArrowLeftRight } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function ReseauCemacPage() {
    const { user } = useAuth();
    const dossiers = useQuery(api.alertes.cemac.listerDossiersCemac as any, { userId: user?._id as any });

    if (dossiers === undefined) return <div className="p-8 text-center animate-pulse">Connexion au réseau RASFF CEMAC...</div>;

    const getFlag = (pays: string) => {
        switch (pays) {
            case 'Gabon': return '🇬🇦';
            case 'Cameroun': return '🇨🇲';
            case 'Congo': return '🇨🇬';
            case 'Tchad': return '🇹🇩';
            case 'RCA': return '🇨🇫';
            case 'Guinee_Equatoriale': return '🇬🇶';
            default: return '🌍';
        }
    };

    const getRisqueBadge = (risque: string) => {
        switch (risque) {
            case 'faible': return <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">Faible</Badge>;
            case 'moyen': return <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">Moyen</Badge>;
            case 'eleve': return <Badge variant="outline" className="text-orange-600 bg-orange-50 border-orange-200">Élevé</Badge>;
            case 'grave': return <Badge className="bg-red-600 text-white hover:bg-red-700 animate-pulse">GRAVE (Létal)</Badge>;
            default: return <Badge variant="outline">{risque}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-emerald-600 pl-3">Réseau Rapide CEMAC (RASFF-Ext)</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Tour de veille et transmission des urgences transfrontalières CEMAC.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50">
                        <Send className="w-4 h-4 mr-2" />
                        Notifier les 5 états
                    </Button>
                </div>
            </div>

            {/* Statistiques rapides CEMAC */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">État du réseau RPC</div>
                        <div className="text-lg font-bold text-emerald-600 flex items-center gap-2 mt-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                            Connecté au Hub Yaoundé
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dernier Ping RASFF</div>
                    <div className="text-lg font-bold text-slate-800 mt-1">Il y a 3 mins</div>
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Toxines dominantes</div>
                    <div className="text-sm font-bold text-orange-600 mt-1">Aflatoxine M1 (Laits)</div>
                </div>
            </div>

            <div className="bg-white rounded-md border shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[80px]">Flux</TableHead>
                            <TableHead>Numéro RASFF / Date</TableHead>
                            <TableHead className="w-[200px]">Origine Notification</TableHead>
                            <TableHead>Détails Incrimination</TableHead>
                            <TableHead>Niveau de Risque</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dossiers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                                    <Globe className="w-12 h-12 mx-auto text-slate-200 mb-4" />
                                    Aucune alerte transfrontalière en cours dans l'espace CEMAC.
                                </TableCell>
                            </TableRow>
                        ) : (
                            dossiers.map((c: any) => (
                                <TableRow key={c._id} className="hover:bg-slate-50">
                                    <TableCell>
                                        {c.paysEmetteur === "Gabon" ? (
                                            <div className="p-1.5 bg-blue-100 text-blue-700 rounded-md inline-block" title="Sortant">
                                                <ArrowLeftRight className="w-4 h-4 transform rotate-180" />
                                            </div>
                                        ) : (
                                            <div className="p-1.5 bg-rose-100 text-rose-700 rounded-md inline-block" title="Entrant">
                                                <ArrowLeftRight className="w-4 h-4" />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-mono text-sm font-semibold text-slate-900 border-b border-transparent hover:border-blue-600 cursor-pointer w-fit">
                                            {c.reference}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-0.5">
                                            {format(new Date(c.dateNotification), "dd MMM yyyy", { locale: fr })}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 font-medium text-slate-800">
                                            <span className="text-xl leading-none">{getFlag(c.paysEmetteur)}</span>
                                            {c.paysEmetteur.replace('_', ' ')}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm font-bold text-slate-800 line-clamp-1">{c.produit}</div>
                                        <div className="text-xs text-slate-600">Danger: <span className="text-red-600 font-semibold">{c.dangerId}</span></div>
                                        {c.paysImpactes && c.paysImpactes.includes("Gabon") && (
                                            <Badge variant="destructive" className="mt-1 text-[10px] w-fit">GABON IMPACTÉ</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {getRisqueBadge(c.niveauRisque)}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm" className="h-8 text-xs bg-slate-50">
                                            <FileText className="w-3 h-3 mr-1" /> Dossier
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="text-slate-500 text-xs italic">
                La plateforme est interfacée avec le hub sécurisé de Yaoundé pour le traitement des alertes du Pool Économique.
            </div>
        </div>
    );
}
