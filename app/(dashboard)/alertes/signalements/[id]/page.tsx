"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserX, AlertTriangle, ShieldCheck, XCircle, FileText, Image as ImageIcon, CheckCircle2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useParams, useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useState } from "react";

export default function FicheSignalementPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const id = params.id as Id<"signalementsCitoyens">;

    const sign = useQuery(api.alertes.signalements.getSignalement as any, { id, userId: user?._id as any });
    const statuer = useMutation(api.alertes.signalements.statuerSignalement as any);

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (sign === undefined) return <div className="p-8 text-center animate-pulse">Décodage de la plainte citoyenne...</div>;

    const handleStatuer = async (nouveauStatut: string, creerAlerte: boolean) => {
        setIsSubmitting(true);
        try {
            await statuer({ id, userId: user?._id as any, nouveauStatut, creerAlerte });
            toast.success(`Dossier mis à jour.`);
            if (creerAlerte) {
                toast.success("Une Alerte Nationale a été automatiquement déclenchée et assignée.");
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        Signalement Citoyen : {sign.reference}
                        {sign.anonyme && <Badge variant="secondary" className="bg-slate-200">ANONYME</Badge>}
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm font-mono flex items-center gap-2">
                        {sign.provinceAssignee} | P-GPS: {sign.gpsLatitude?.toFixed(4)}, {sign.gpsLongitude?.toFixed(4)}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50 border-b">
                            <CardTitle className="text-lg">Exposé des Faits</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <h3 className="text-sm font-semibold text-slate-500 mb-2">Témoignage du plaignant</h3>
                            <p className="text-slate-800 whitespace-pre-wrap leading-relaxed text-base italic p-4 bg-yellow-50/50 border-l-4 border-yellow-400 rounded-r-md">
                                "{sign.description}"
                            </p>

                            <div className="mt-8 border-t pt-6">
                                <h3 className="text-sm font-semibold text-slate-500 mb-4 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" /> Preuves visuelles (Upload Application F6)
                                </h3>
                                {sign.photos && sign.photos.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {/* Mock Images */}
                                        <div className="aspect-square bg-slate-100 rounded-md border-2 border-dashed flex items-center justify-center text-slate-400 text-xs">Photo 1 inaccessible (Demo)</div>
                                    </div>
                                ) : (
                                    <div className="text-sm text-slate-500 bg-slate-50 p-4 rounded text-center">Aucune preuve visuelle fournie par l'usager.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions Panel */}
                    <Card className="shadow-sm border-blue-200 border-t-4">
                        <CardHeader className="bg-blue-50/50 pb-2">
                            <CardTitle className="text-base text-blue-900 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5" /> Verdict de l'Inspection
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4 pt-4">
                            {sign.statut === "recu" && (
                                <div className="space-y-3">
                                    <p className="text-sm text-slate-600 mb-4">Que souhaitez-vous faire de ce signalement ?</p>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => handleStatuer('en_verification', false)}
                                            disabled={isSubmitting}
                                            className="flex-1 bg-slate-50 hover:bg-slate-100 border-slate-300"
                                        >
                                            <ShieldAlert className="w-4 h-4 mr-2" />
                                            Dépêcher une équipe (Vérification)
                                        </Button>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => handleStatuer('infonde', false)}
                                            disabled={isSubmitting}
                                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Classer Infondé (Calomnie/Erreur)
                                        </Button>
                                        <Button
                                            onClick={() => handleStatuer('confirme', true)}
                                            disabled={isSubmitting}
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                        >
                                            <AlertTriangle className="w-4 h-4 mr-2" />
                                            Escalader en Alerte Sanitaire
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {sign.statut === "en_verification" && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800">
                                        Les agents sont sur le terrain. En attente du rapport.
                                    </div>
                                    <div className="flex gap-3">
                                        <Button onClick={() => handleStatuer('infonde', false)} variant="outline" className="flex-1 text-slate-700">Non Confirmé</Button>
                                        <Button onClick={() => handleStatuer('confirme', true)} className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow">Vérifié ! Créer Alerte</Button>
                                    </div>
                                </div>
                            )}

                            {["confirme", "infonde", "traite"].includes(sign.statut) && (
                                <div className="text-center p-4 bg-slate-50 border border-slate-200 rounded">
                                    <CheckCircle2 className={`w-8 h-8 mx-auto mb-2 ${sign.statut === 'confirme' ? 'text-red-500' : 'text-slate-400'}`} />
                                    <p className="text-sm font-semibold capitalize text-slate-800">Dossier clôturé ({sign.statut.replace('_', ' ')})</p>
                                    {sign.dateTraitement && (
                                        <p className="text-xs text-slate-500 mt-1">Traité le {format(new Date(sign.dateTraitement), "dd/MM/yyyy")}</p>
                                    )}
                                </div>
                            )}

                        </CardContent>
                    </Card>
                </div>

                {/* Meta Panel */}
                <div className="space-y-6">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50 border-b">
                            <CardTitle className="text-base text-slate-800">Résumé Contextuel</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b">
                                <span className="text-sm text-slate-500">Ouverture</span>
                                <span className="text-sm font-medium">{format(new Date(sign.dateReception), "dd/MM HH:mm")}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b">
                                <span className="text-sm text-slate-500">Catégorie</span>
                                <Badge variant="secondary" className="capitalize text-xs">{sign.categorie.replace('_', ' ')}</Badge>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b">
                                <span className="text-sm text-slate-500">Juridiction</span>
                                <span className="text-sm font-medium">{sign.provinceAssignee}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b">
                                <span className="text-sm text-slate-500">Auteur</span>
                                <span className="text-sm font-medium">{sign.anonyme ? "Lancéur d'Alerte X" : "Identifié via eGouv"}</span>
                            </div>

                            <div className="mt-4 p-3 bg-red-50 rounded border border-red-100 flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                                <div className="text-xs text-red-800 leading-tight">
                                    L'IA de sécurité signale une potentielle occurrence de mêmes faits dans la province (+2 signalements).
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
