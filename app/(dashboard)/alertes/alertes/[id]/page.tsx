"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldAlert, CheckCircle2, Archive, AlertTriangle, BugOff, Flame, AlertCircle, FileText, Activity, MapPin, Megaphone } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useParams, useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

export default function FicheAlertePage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const id = params.id as Id<"alertes">;

    const alerte = useQuery(api.alertes.alertes.getAlerte as any, { id, userId: user?._id as any });
    const statuer = useMutation(api.alertes.alertes.statuerAlerte as any);
    const assigner = useMutation(api.alertes.alertes.assignerAlerte as any);

    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (alerte === undefined) return <div className="p-8 text-center animate-pulse">Chargement du dossier crypté...</div>;

    const handleAssignToMe = async () => {
        try {
            await assigner({ id, userId: user?._id as any, agentId: `${user?.prenom} ${user?.nom}` });
            toast.success("Dossier assigné avec succès.");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleStatuer = async (nouveauStatut: string) => {
        if (!comment.trim()) {
            toast.error("Veuillez saisir un rapport circonstancié avant de modifier le statut.");
            return;
        }
        setIsSubmitting(true);
        try {
            await statuer({ id, userId: user?._id as any, nouveauStatut, commentaire: comment });
            toast.success(`Alerte passée au statut: ${nouveauStatut.replace('_', ' ')}`);
            setComment("");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getBadgeColor = (niveau: string) => {
        switch (niveau) {
            case 'information': return "bg-blue-100 text-blue-800";
            case 'vigilance': return "bg-amber-100 text-amber-800";
            case 'alerte': return "bg-orange-100 text-orange-800";
            case 'urgence': return "bg-red-100 text-red-800";
            default: return "bg-slate-100 text-slate-800";
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
                        Dossier d'Investigation
                        <Badge className={`border-none ${getBadgeColor(alerte.niveau)} uppercase`}>{alerte.niveau}</Badge>
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm font-mono flex items-center gap-2">
                        {alerte.type.toUpperCase()} | {alerte.zoneGeographique}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50 border-b">
                            <CardTitle className="text-lg flex justify-between items-center">
                                <span>{alerte.titre}</span>
                                <Badge variant="outline" className="text-xs uppercase bg-white">
                                    STATUT: {alerte.statut.replace('_', ' ')}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <h3 className="text-sm font-semibold text-slate-500 mb-2">Description des faits</h3>
                            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-md border border-slate-100 text-sm">
                                {alerte.description}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                <div className="space-y-1">
                                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1"><MapPin className="w-3 h-3" /> Zone</div>
                                    <div className="text-sm font-semibold">{alerte.zoneGeographique}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Source</div>
                                    <div className="text-sm font-semibold capitalize">{alerte.source.replace('_', ' ')}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1"><FileText className="w-3 h-3" /> Ref Source</div>
                                    <div className="text-sm font-semibold font-mono">{alerte.sourceRef || 'N/A'}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Assignation</div>
                                    <div className="text-sm font-semibold text-blue-600">{alerte.assigneeA}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions d'Investigation */}
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Activity className="w-4 h-4 text-blue-600" /> Piloter l'Investigation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {alerte.statut === "nouvelle" && (
                                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                                    <h4 className="text-sm font-semibold text-yellow-800 mb-2">Prise en charge requise</h4>
                                    <Button onClick={handleAssignToMe} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                                        M'assigner ce dossier
                                    </Button>
                                </div>
                            )}

                            {["en_verification", "confirmee"].includes(alerte.statut) && (
                                <div className="space-y-3">
                                    <Textarea
                                        placeholder="Rédigez un rapport circonstancié ou un compte rendu d'étape obligatoire avant de statuer..."
                                        className="h-24 resize-none"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    />
                                    <div className="flex flex-wrap gap-2 justify-end">
                                        {alerte.statut === "en_verification" && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleStatuer('resolue')}
                                                    disabled={isSubmitting}
                                                    className="border-green-600 text-green-600 hover:bg-green-50"
                                                >
                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                    Classer Sans Suite (Résolue)
                                                </Button>
                                                <Button
                                                    onClick={() => handleStatuer('confirmee')}
                                                    disabled={isSubmitting}
                                                    className="bg-red-600 hover:bg-red-700 text-white"
                                                >
                                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                                    Confirmer le Risque (Alerte Maximale)
                                                </Button>
                                            </>
                                        )}
                                        {alerte.statut === "confirmee" && (
                                            <>
                                                <Button
                                                    onClick={() => handleStatuer('resolue')}
                                                    disabled={isSubmitting}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                >
                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                    Clôturer la Crise (Résolution)
                                                </Button>
                                                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                                                    <Link href="/alertes/rappels/nouveau">
                                                        <Megaphone className="w-4 h-4 mr-2" />
                                                        Déclencher Procédure de Rappel
                                                    </Link>
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {alerte.statut === "resolue" && (
                                <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                                    <h4 className="text-sm font-semibold text-slate-800 mb-2">Dossier clôturé.</h4>
                                    <Button onClick={() => handleStatuer('archivee')} disabled={isSubmitting} variant="outline" className="text-slate-600">
                                        <Archive className="w-4 h-4 mr-2" /> Archiver définitivement
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Timeline */}
                <div className="space-y-6">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50 border-b">
                            <CardTitle className="text-base">Chronologie des Événements</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pl-8">
                            <div className="relative border-l-2 border-slate-200 space-y-6 py-2">
                                {alerte.actions?.map((action: any, idx: number) => (
                                    <div key={idx} className="relative pl-6">
                                        <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm ring-2 ring-blue-100"></div>
                                        <div className="text-xs text-slate-400 font-mono mb-1">
                                            {format(new Date(action.date), "dd/MM/yyyy à HH:mm")}
                                        </div>
                                        <div className="text-sm text-slate-800 font-medium">
                                            {action.action}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                            <span>Par : {action.responsable}</span>
                                        </div>
                                    </div>
                                ))}
                                {/* Event Création Initial */}
                                <div className="relative pl-6">
                                    <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-slate-300 rounded-full border-2 border-white shadow-sm"></div>
                                    <div className="text-xs text-slate-400 font-mono mb-1">
                                        {format(new Date(alerte.dateCreation), "dd/MM/yyyy à HH:mm")}
                                    </div>
                                    <div className="text-sm text-slate-600 font-medium">Inscription au registre des alertes</div>
                                    <div className="text-xs text-slate-500 mt-1">Généré par le système {alerte.source}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
