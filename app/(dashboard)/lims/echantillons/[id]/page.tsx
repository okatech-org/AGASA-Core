"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit3, FlaskConical, MapPin, Truck, History, CheckCircle2, ShieldAlert, PlusCircle, CalendarDays, Key, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function LimsFicheEchantillonPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const echantillonId = params.id as string;

    const dossier = useQuery(api.lims.echantillons.getEchantillon, {
        userId: user?._id as any,
        echantillonId: echantillonId as any
    });

    if (dossier === undefined) return <div className="p-8 text-center text-muted-foreground animate-pulse">Chargement du dossier documentaire {echantillonId}...</div>;

    const statuts = ["enregistre", "en_analyse", "termine", "valide", "archive"];
    let currIdx = statuts.indexOf(dossier.statut);
    if (currIdx === -1) currIdx = 0; // recu, detruit etc.

    return (
        <div className="max-w-6xl mx-auto space-y-6">

            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <div className="flex items-start gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-slate-100 mt-1">
                        <ArrowLeft className="w-5 h-5 text-slate-700" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-black font-mono tracking-tight text-purple-900">{dossier.codeBarres}</h1>
                            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 text-xs py-0.5">
                                {dossier.statut.toUpperCase().replace('_', ' ')}
                            </Badge>
                        </div>
                        <p className="text-slate-600 text-sm font-medium">{dossier.description}</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {dossier.statut !== "archive" && dossier.statut !== "detruit" && (
                        <Button className="bg-slate-900 text-white shadow-sm" onClick={() => router.push(`/lims/analyses/assignation?echantillon=${dossier._id}`)}>
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Assigner Analyses
                        </Button>
                    )}
                    {dossier.statut === "valide" && (
                        <Button variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">
                            <ShieldAlert className="w-4 h-4 mr-2" />
                            Générer Rapport ISO
                        </Button>
                    )}
                </div>
            </div>

            {/* Pipeline Horizontal */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 relative">
                <div className="flex justify-between relative z-10">
                    {statuts.map((step, idx) => (
                        <div key={step} className="flex flex-col items-center gap-2 bg-white px-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx <= currIdx ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-400 border-2 border-slate-200'}`}>
                                {idx < currIdx ? <CheckCircle2 className="w-5 h-5" /> : (idx + 1)}
                            </div>
                            <span className={`text-xs uppercase font-bold ${idx <= currIdx ? 'text-purple-900' : 'text-slate-400'}`}>
                                {step.replace('_', ' ')}
                            </span>
                        </div>
                    ))}
                </div>
                {/* Ligne de connexion */}
                <div className="absolute top-[40px] left-12 right-12 h-0.5 bg-slate-200 z-0">
                    <div className="h-full bg-purple-600 transition-all duration-500" style={{ width: `${(currIdx / (statuts.length - 1)) * 100}%` }}></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Colonne Gauche : Identité & Transport */}
                <div className="space-y-6 lg:col-span-1">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50/50 border-b p-4">
                            <CardTitle className="text-base text-slate-800 flex items-center gap-2"><Key className="w-4 h-4" /> Signalétique</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4 text-sm">
                            <div className="grid grid-cols-2 gap-y-3">
                                <div className="text-slate-500">Origine:</div><div className="font-semibold text-slate-900 capitalize">{dossier.origine}</div>
                                <div className="text-slate-500">Réf. Source:</div><div className="font-semibold font-mono text-purple-700">{dossier.referenceSource || "N/A"}</div>
                                <div className="text-slate-500">Matrice:</div><div className="font-semibold text-slate-900 capitalize">{dossier.matrice.replace('_', ' ')}</div>
                                <div className="text-slate-500">Quantité:</div><div className="font-semibold text-slate-900">{dossier.quantite} {dossier.unite}</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50/50 border-b p-4">
                            <CardTitle className="text-base text-slate-800 flex items-center gap-2"><MapPin className="w-4 h-4" /> Prélèvement</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4 text-sm">
                            <div>
                                <span className="text-slate-500 block text-xs mb-1">Lieu Exact</span>
                                <span className="font-medium text-slate-900">{dossier.lieuPrelevement}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarDays className="w-4 h-4 text-slate-400" />
                                <span className="font-medium">{format(new Date(dossier.datePrelevement), "dd MMM yyyy à HH:mm", { locale: fr })}</span>
                            </div>
                            <div className="pt-2 border-t flex justify-between">
                                <span className="text-slate-500">Agent:</span>
                                <span className="font-medium">{dossier.prelevePar || "Non spécifié"}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-orange-50/30 border-b p-4 border-orange-100">
                            <CardTitle className="text-base text-orange-900 flex items-center gap-2"><Truck className="w-4 h-4" /> Intégrité Transport</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600">Conformité Initiale</span>
                                {dossier.conditionsTransport.conforme ?
                                    <Badge className="bg-emerald-100 text-emerald-800">Conforme</Badge> :
                                    <Badge className="bg-red-100 text-red-800">Non Conforme</Badge>
                                }
                            </div>
                            <div className="flex justify-between border-t pt-2">
                                <span className="text-slate-500">Temp. Réception:</span>
                                <span className="font-mono font-bold">{dossier.conditionsTransport.temperature ? `${dossier.conditionsTransport.temperature}°C` : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Durée Transit:</span>
                                <span>{dossier.conditionsTransport.duree ? `${dossier.conditionsTransport.duree} Heures` : 'N/A'}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Colonne Droite : Analyses et Traçabilité */}
                <div className="space-y-6 lg:col-span-2">

                    {/* Plan d'Analyses */}
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-blue-50/30 border-b border-blue-100 p-4 flex flex-row items-center justify-between">
                            <CardTitle className="text-base text-blue-900 flex items-center gap-2"><FlaskConical className="w-5 h-5" /> Plan d'Analyses Paramétriques</CardTitle>
                            <Badge className="bg-blue-100 text-blue-800">Nbre: {dossier.analyses.length}</Badge>
                        </CardHeader>
                        <CardContent className="p-0 border-t-0">
                            <Table>
                                <TableHeader className="bg-slate-50/50 text-xs">
                                    <TableRow>
                                        <TableHead>Paramètre Visé</TableHead>
                                        <TableHead>Tech. LAA</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Résultat (Conformité)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dossier.analyses.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-slate-500 text-sm">
                                                Aucun paramètre analytique assigné.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        dossier.analyses.map((analyse: any) => (
                                            <TableRow key={analyse._id}>
                                                <TableCell className="font-medium text-slate-800 text-sm">{analyse.parametreNom}</TableCell>
                                                <TableCell className="text-xs text-slate-500">{analyse.technicienNom}</TableCell>
                                                <TableCell>
                                                    <span className="text-[10px] uppercase font-bold text-slate-500">{analyse.statut.replace('_', ' ')}</span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {analyse.resultatFinal ? (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <span className="font-bold font-mono">{analyse.resultatFinal}</span>
                                                            {analyse.conformite === true && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                                            {analyse.conformite === false && <ShieldAlert className="w-4 h-4 text-red-500" />}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 italic text-xs">En attente</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Chaîne de possession ISO 17025 */}
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50/50 border-b p-4">
                            <CardTitle className="text-base text-slate-800 flex items-center gap-2"><History className="w-5 h-5 text-slate-600" /> Chaîne de Possession (Audit Log)</CardTitle>
                            <CardDescription className="text-xs">Traçabilité complète inaltérable selon la norme ISO/IEC 17025.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="relative border-l border-slate-200 ml-6 my-6 space-y-6">
                                {dossier.tracabilite.map((t: any) => (
                                    <div key={t._id} className="relative pl-6">
                                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 bg-purple-500 rounded-full ring-4 ring-white" />
                                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-1">
                                            <span className="font-bold text-slate-900 text-sm">{t.action}</span>
                                            <span className="text-xs text-slate-500 font-mono">
                                                {format(new Date(t.dateLigne), "dd/MM/yyyy HH:mm:ss")}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-600 flex items-center gap-1 mb-1">
                                            <span className="font-semibold text-purple-800">{t.nomAgent}</span>
                                            <span className="text-slate-400 mx-1">•</span>
                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {t.lieu}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}
