"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, Clock, Copy, ExternalLink, ShieldAlert, Check } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import React from "react";

export default function RedevanceDetailsPage({ params }: { params: { id: string } }) {
    const { user } = useAuth();
    const router = useRouter();

    const data = useQuery(api.finance.redevances.getRedevance, {
        userId: user?._id as any,
        redevanceId: params.id as any
    });

    const marquerPaye = useMutation(api.finance.redevances.marquerPaye);

    if (data === undefined) return <div className="p-8 text-center animate-pulse">Extraction du dossier de facturation...</div>;

    const handleEncaissement = async (mode: string) => {
        try {
            await marquerPaye({
                userId: user?._id as any,
                redevanceId: params.id as any,
                modePaiement: mode
            });
            toast.success("Encaissement enregistré et lettré avec succès");
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de l'encaissement");
        }
    };

    const formatMontant = (m: number) => {
        return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XAF", maximumFractionDigits: 0 }).format(m);
    };

    const getStatusTheme = (statut: string) => {
        switch (statut) {
            case "paye": return { color: "bg-emerald-100 text-emerald-800", icon: <CheckCircle className="h-5 w-5 text-emerald-600" /> };
            case "en_attente": return { color: "bg-amber-100 text-amber-800", icon: <Clock className="h-5 w-5 text-amber-600" /> };
            case "recouvrement_force": return { color: "bg-slate-900 text-white", icon: <ShieldAlert className="h-5 w-5 text-white" /> };
            default: return { color: "bg-orange-100 text-orange-800", icon: <Clock className="h-5 w-5 text-orange-600" /> };
        }
    };

    const theme = getStatusTheme(data.statut);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Facture {data.reference}</h1>
                        <Badge variant="secondary" className={theme.color + " uppercase text-xs"}>{data.statut.replace('_', ' ')}</Badge>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Informations Principales */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50/50 border-b p-4">
                            <CardTitle className="text-lg">Informations de Facturation</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid gap-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Opérateur / Débiteur</p>
                                    <p className="font-medium text-slate-900">{data.operateur}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Montant à recouvrer</p>
                                    <p className="text-2xl font-bold text-slate-900">{formatMontant(data.montant)}</p>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Source d'imposition</p>
                                    <Badge variant="outline" className="text-xs">{data.sourceApp}</Badge>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Type de redevance</p>
                                    <p className="font-medium capitalize text-slate-700">{data.type}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Date d'échéance</p>
                                    <p className="font-medium text-slate-900">{format(new Date(data.dateEcheance), "dd MMMM yyyy", { locale: fr })}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Province d'origine</p>
                                    <p className="font-medium text-slate-700">{data.provinceOrigine}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline de Recouvrement */}
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50/50 border-b p-4">
                            <CardTitle className="text-lg">Historique de Recouvrement</CardTitle>
                            <CardDescription>Traçabilité légale du dossier</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-6 pl-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                {data.timeline.map((etape: any, idx: number) => (
                                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white bg-slate-300 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                            {etape.titre.includes("Règlement") ? <Check className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3" />}
                                        </div>
                                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded bg-white border border-slate-200 shadow-sm">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="font-medium text-slate-900 text-sm">{etape.titre}</div>
                                                <time className="text-xs text-slate-500 font-mono">{format(new Date(etape.date), "dd/MM/yyyy")}</time>
                                            </div>
                                            <div className="text-xs text-slate-600">{etape.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Panneau d'Actions */}
                <div className="space-y-6">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50/50 border-b p-4">
                            <CardTitle className="text-lg">Actions DAF</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 flex flex-col gap-3">
                            {data.statut !== "paye" && (
                                <>
                                    <Button onClick={() => handleEncaissement("virement")} className="w-full bg-emerald-600 hover:bg-emerald-700 justify-start">
                                        <CheckCircle className="w-4 h-4 mr-2" /> Valider Paiement (Virement)
                                    </Button>
                                    <Button onClick={() => handleEncaissement("especes")} className="w-full bg-emerald-600 hover:bg-emerald-700 justify-start">
                                        <CheckCircle className="w-4 h-4 mr-2" /> Valider Paiement (Espèces)
                                    </Button>
                                    <Button onClick={() => handleEncaissement("mobile_money")} className="w-full bg-emerald-600 hover:bg-emerald-700 justify-start">
                                        <CheckCircle className="w-4 h-4 mr-2" /> Valider Paiement (Mobile Money)
                                    </Button>

                                    <hr className="my-2 border-slate-100" />

                                    <Button variant="outline" className="w-full justify-start border-orange-200 text-orange-700 hover:bg-orange-50">
                                        <Clock className="w-4 h-4 mr-2" /> Forcer la relance manuelle
                                    </Button>

                                    {data.statut === "recouvrement_force" && (
                                        <Button variant="destructive" className="w-full justify-start mt-2">
                                            <ShieldAlert className="w-4 h-4 mr-2" /> Imprimer Dossier Trésor
                                        </Button>
                                    )}
                                </>
                            )}

                            {data.statut === "paye" && (
                                <div className="text-center p-4 bg-emerald-50 rounded-md border border-emerald-100 mb-2">
                                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-emerald-800">Dossier clôturé.</p>
                                    <p className="text-xs text-emerald-600/80">Payé le {format(new Date(data.datePaiement!), "dd/MM/yyyy")} via {data.modePaiement}</p>
                                </div>
                            )}

                            <Button variant="secondary" className="w-full justify-start">
                                <ExternalLink className="w-4 h-4 mr-2" /> Voir le document source
                            </Button>

                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50/50 border-b p-4">
                            <CardTitle className="text-sm">Documents Justificatifs</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 flex flex-col gap-2">
                            <Button variant="outline" size="sm" className="w-full justify-between font-normal">
                                <span className="truncate">Titre_de_perception.pdf</span> <Copy className="w-3 h-3 text-slate-400" />
                            </Button>
                            {data.statut === "paye" && (
                                <Button variant="outline" size="sm" className="w-full justify-between font-normal text-emerald-700 border-emerald-200">
                                    <span className="truncate">Recu_caisse_AGASA.pdf</span> <CheckCircle className="w-3 h-3 text-emerald-500" />
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
