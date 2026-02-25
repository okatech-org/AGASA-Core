"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileDown, FileSpreadsheet, Send, Settings, BookOpen, Presentation, Scale, RefreshCw, BarChart4 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";

export default function GenerateurRapportsPage() {
    const { user } = useAuth();
    const rapports = useQuery(api.bi.rapports.listerRapports as any, { userId: user?._id as any });
    const generer = useMutation(api.bi.rapports.genererRapport as any);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const genererDoc = async (type: string, titre: string, periode: string) => {
        setIsSubmitting(true);
        try {
            toast.info(`Initialisation de l'IA pour la rédaction du ${titre}...`);
            await generer({
                userId: user?._id as any,
                type, titre, periode
            });
            setTimeout(() => {
                toast.success(`${titre} généré avec succès dans le cloud.`);
                setIsSubmitting(false);
            }, 1000);
        } catch (error: any) {
            toast.error(error.message);
            setIsSubmitting(false);
        }
    };

    if (rapports === undefined) return <div className="p-8 text-center animate-pulse">Synchronisation aux moteurs BigQuery...</div>;

    const reportCards = [
        {
            type: "mensuel_perf", title: "Rapport Mensuel de Performance",
            desc: "Bilan global du mois et variation des indicateurs.", pericod: "Mars 2026",
            icon: BarChart4, color: "text-blue-600", bg: "bg-blue-50"
        },
        {
            type: "trimestriel_budget", title: "Bilan d'Activité Trimestriel",
            desc: "Format strict Ministère de l'Économie pour justification des dotations.", pericod: "T1 2026",
            icon: Scale, color: "text-amber-600", bg: "bg-amber-50"
        },
        {
            type: "annuel_cc", title: "Rapport Annuel Consolidé",
            desc: "Liasse fiscale et opérationnelle pour la Cour des Comptes.", pericod: "Exercice 2025",
            icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50"
        },
        {
            type: "rapport_ca", title: "Exposé Conseil d'Administration",
            desc: "Plaquette exécutive avec graphes destinés aux présidents du C.A.", pericod: "Session Printemps 2026",
            icon: Presentation, color: "text-indigo-600", bg: "bg-indigo-50"
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-slate-800 pl-3">Générateur de Rapports (Automatisé)</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Génération instantanée des synthèses officielles requises par la tutelle et la loi.</p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Settings className="w-4 h-4" /> Paramétrer les Envois Auto (Cron)
                </Button>
            </div>

            {/* CATALOGUE GÉNÉRATEUR */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {reportCards.map((rc, idx) => (
                    <Card key={idx} className="shadow-sm border-slate-200 hover:border-slate-300 transition-colors">
                        <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start mb-2">
                                <div className={`p-2 rounded-md ${rc.bg}`}>
                                    <rc.icon className={`w-5 h-5 ${rc.color}`} />
                                </div>
                                <Badge variant="secondary" className="text-[10px] uppercase font-mono">{rc.pericod}</Badge>
                            </div>
                            <CardTitle className="text-sm font-bold text-slate-800 leading-tight">{rc.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-4">
                            <p className="text-xs text-slate-500 h-10">{rc.desc}</p>
                            <Button
                                className="w-full h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white"
                                disabled={isSubmitting}
                                onClick={() => genererDoc(rc.type, rc.title, rc.pericod)}
                            >
                                {isSubmitting ? <RefreshCw className="w-3 h-3 mr-2 animate-spin" /> : <FileDown className="w-3 h-3 mr-2" />}
                                Compiler PDF
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* HISTORIQUE */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b pb-4">
                    <CardTitle className="text-base flex items-center justify-between">
                        <span>Historique des Générations</span>
                        <Badge variant="outline" className="font-normal bg-white">Format A4 Officiel Cloud</Badge>
                    </CardTitle>
                </CardHeader>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">Type de Rapport</TableHead>
                            <TableHead>Période Visée</TableHead>
                            <TableHead>Horodatage & Auteur</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Rendu</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rapports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center text-slate-500">
                                    Aucun rapport officiel n'a encore été compilé dans l'archive.
                                </TableCell>
                            </TableRow>
                        ) : (
                            rapports.map((r: any) => (
                                <TableRow key={r._id} className="hover:bg-slate-50">
                                    <TableCell>
                                        <div className="font-semibold text-slate-900 text-sm">{r.titre}</div>
                                        <div className="text-xs text-slate-500 font-mono mt-0.5">REF: RPT-{r._id.toString().substring(0, 6).toUpperCase()}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-slate-100">{r.periode}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-slate-700">{format(new Date(r.dateGeneration), "dd MMM yyyy à HH:mm", { locale: fr })}</div>
                                        <div className="text-xs text-slate-400">Demande Administrateur</div>
                                    </TableCell>
                                    <TableCell>
                                        {r.statut === "termine" ? (
                                            <span className="flex items-center text-xs font-semibold text-emerald-600 before:content-[''] before:block before:w-2 before:h-2 before:bg-emerald-500 before:rounded-full before:mr-2">
                                                Prêt
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-xs font-semibold text-slate-500 before:content-[''] before:block before:w-2 before:h-2 before:bg-amber-500 before:rounded-full before:mr-2 animate-pulse">
                                                Génération...
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="icon" className="h-8 w-8 text-slate-600 hover:text-blue-600 hover:border-blue-200">
                                                <FileDown className="w-4 h-4" />
                                            </Button>
                                            <Button variant="outline" size="icon" className="h-8 w-8 text-slate-600 hover:text-emerald-600 hover:border-emerald-200" title="Source Data (Excel)">
                                                <FileSpreadsheet className="w-4 h-4" />
                                            </Button>
                                            <Button variant="outline" size="icon" className="h-8 w-8 text-slate-600 hover:text-indigo-600 hover:border-indigo-200" title="Diffuser par email confidentiel">
                                                <Send className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

        </div>
    );
}
