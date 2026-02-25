"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, FileText, CheckCircle2, GitMerge, UserRound, AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function WorkflowDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const workflowId = params.id as string;

    const workflow = useQuery(api.ged.workflows.getWorkflowDetails, {
        userId: user?._id as any,
        workflowId: workflowId as any
    });

    if (workflow === undefined) return <div className="p-12 pl-20"><div className="animate-pulse h-8 w-64 bg-slate-200 rounded mb-4"></div></div>;
    if (!workflow) return <div className="p-10 text-center text-red-500">Circuit introuvable ou accès refusé.</div>;

    const getStatutBadge = (statut: string) => {
        switch (statut) {
            case "en_cours": return <Badge className="bg-orange-500 hover:bg-orange-600">En cours</Badge>;
            case "approuve": return <Badge className="bg-emerald-500 hover:bg-emerald-600">Approuvé</Badge>;
            case "rejete": return <Badge className="bg-red-500 hover:bg-red-600">Rejeté</Badge>;
            default: return <Badge variant="outline">{statut}</Badge>;
        }
    };

    const getEtapeIcon = (etape: any) => {
        if (etape.statut === "approuve") return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
        if (etape.statut === "rejete") return <AlertCircle className="w-5 h-5 text-red-500" />;
        if (workflow.statut === "en_cours" && workflow.etapeActuelle === etape.ordre) return <Clock className="w-5 h-5 text-orange-500 animate-pulse" />;
        return <div className="w-5 h-5 rounded-full border-2 border-slate-300" />;
    };

    const formatMontant = (montant: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(montant);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-50 p-2 rounded-lg border shadow-sm">
                            <GitMerge className="w-8 h-8 text-[#1B4F72]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="uppercase text-[10px] tracking-wider font-semibold border-slate-300 bg-white">
                                    {workflow.type.replace(/_/g, " ")}
                                </Badge>
                                {getStatutBadge(workflow.statut)}
                            </div>
                            <h1 className="text-xl md:text-2xl font-bold tracking-tight">{workflow.reference}</h1>
                        </div>
                    </div>
                </div>

                {/* Si l'utilisateur est le valideur actuel, proposer un raccourci vers ses actions */}
                {workflow.statut === "en_cours" && workflow.etapes.find((e: any) => e.ordre === workflow.etapeActuelle)?.valideurId === user?._id && (
                    <Button onClick={() => router.push('/ged/signatures')} className="bg-[#1B4F72] hover:bg-[#1B4F72]/90 animate-pulse">
                        Votre signature est requise
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Colonne gauche (2/3) : PDF Document */}
                <div className="lg:col-span-2 space-y-6 h-[800px]">
                    <Card className="h-full flex flex-col border-2 border-[#1B4F72]/10 overflow-hidden shadow-sm">
                        <CardHeader className="py-3 px-4 bg-slate-50 border-b flex flex-row items-center justify-between space-y-0 shrink-0">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-[#1B4F72]">
                                <FileText className="w-4 h-4" /> {workflow.titreDocument}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 relative bg-slate-100/50">
                            {workflow.documentUrl ? (
                                <iframe
                                    src={`${workflow.documentUrl}#view=FitH`}
                                    className="absolute inset-0 w-full h-full border-0"
                                    title="Visionneuse PDF"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                    Document original indisponible
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Colonne droite (1/3) : Progression & Métadonnées */}
                <div className="space-y-6">

                    <Card>
                        <CardHeader className="pb-3 border-b bg-slate-50 rounded-t-lg">
                            <CardTitle className="text-base flex items-center gap-2 text-[#1B4F72]">
                                <UserRound className="h-4 w-4" />
                                Informations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4 text-sm">
                            <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Initiateur</h4>
                                <div className="font-medium bg-slate-50 p-2 rounded border border-slate-100 flex flex-col">
                                    <span className="text-slate-900">{workflow.initiateur?.prenom} {workflow.initiateur?.nom}</span>
                                    <span className="text-xs text-muted-foreground">{(workflow.initiateur as any)?.poste} ({workflow.initiateur?.direction})</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> Initialisé le
                                    </h4>
                                    <p className="font-medium">{format(workflow.dateCreation, "dd MMM yyyy", { locale: fr })}</p>
                                </div>
                                {workflow.montant !== undefined && (
                                    <div>
                                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                            Montant
                                        </h4>
                                        <p className="font-bold text-[#1B4F72]">{formatMontant(workflow.montant)}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-[#1B4F72]/20 shadow-md">
                        <CardHeader className="pb-4 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <GitMerge className="h-5 w-5 text-[#1B4F72]" /> Parcours de Validation
                            </CardTitle>
                            <CardDescription>
                                État d'avancement du document.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 relative">
                            {/* Ligne verticale de liaison */}
                            <div className="absolute top-6 bottom-6 left-10 w-0.5 bg-slate-200"></div>

                            <div className="space-y-6">
                                {workflow.etapes.map((etape: any, idx: number) => {
                                    const isCurrent = workflow.statut === "en_cours" && workflow.etapeActuelle === etape.ordre;
                                    const isPast = etape.statut !== "en_attente";

                                    return (
                                        <div key={etape._id} className="relative flex items-start gap-4">
                                            <div className={`mt-0.5 z-10 w-8 h-8 bg-white border-2 rounded-full flex items-center justify-center 
                                                ${isPast ? (etape.statut === "approuve" ? "border-emerald-500 bg-emerald-50" : "border-red-500 bg-red-50") : (isCurrent ? "border-orange-500 bg-orange-50 shadow-sm" : "border-slate-300")}
                                            `}>
                                                {getEtapeIcon(etape)}
                                            </div>

                                            <div className="flex-1 bg-white p-3 rounded-md border shadow-sm">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Étape {etape.ordre}</span>
                                                        <p className="text-sm font-semibold">{etape.valideur?.prenom} {etape.valideur?.nom}</p>
                                                        <p className="text-xs text-muted-foreground">{etape.valideur?.direction}</p>
                                                    </div>
                                                </div>

                                                {etape.dateDecision && (
                                                    <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        Traité le {format(etape.dateDecision, "dd/MM/yyyy à HH:mm")}
                                                    </div>
                                                )}

                                                {etape.commentaire && (
                                                    <div className={`mt-2 p-2 rounded bg-slate-50 text-xs border-l-2 ${etape.statut === "rejete" ? "border-red-400 text-red-700" : "border-emerald-400 text-emerald-700"}`}>
                                                        <span className="font-semibold">{etape.statut === "rejete" ? "Motif de rejet" : "Commentaire"}:</span> "{etape.commentaire}"
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}
