"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Calendar, Clock, MapPin, Users, Info, UserPlus, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useState } from "react";

export default function FormationDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const formationId = params.id as string;
    const data = useQuery(api.rh.formations.getDetails, { formationId: formationId as any });
    const inscrire = useMutation(api.rh.formations.inscrire);
    const marquerPresence = useMutation(api.rh.formations.marquerPresence);

    const [isInscribing, setIsInscribing] = useState(false);

    if (data === undefined) return <div className="p-8 text-center">Chargement des détails...</div>;

    // Pour des raisons de typage strict
    const formation = data as any;

    if (!formation) return <div className="p-8 text-center text-red-500">Formation introuvable.</div>;

    const myAgentId = user?._id; // En réalité il faudrait chercher le agentId lié
    const isAlreadyInscript = formation.inscriptions.some((i: any) => i.user?._id === user?._id);
    const placeRestantes = formation.capaciteMax - formation.inscriptions.length;
    const hasAdminAccess = user?.role === "admin_systeme" || user?.role === "directeur_general" || user?.direction === "DAF" || user?.demoSimulatedRole === "admin_systeme";

    const handleInscription = async () => {
        if (!user?._id) return;
        setIsInscribing(true);
        try {
            await inscrire({ userId: user._id, formationId: formation._id });
            toast.success("Inscription validée", { description: "Vous êtes inscrit à cette formation." });
        } catch (error: any) {
            toast.error("Échec de l'inscription", { description: error.message });
        } finally {
            setIsInscribing(false);
        }
    };

    const handlePresence = async (inscriptionId: string, present: boolean) => {
        if (!user?._id) return;
        try {
            await marquerPresence({
                adminId: user._id,
                inscriptionId: inscriptionId as any,
                present
            });
            toast.success("Statut mis à jour", { description: present ? "Marqué comme présent." : "Marqué comme absent." });
        } catch (error: any) {
            toast.error("Erreur", { description: error.message });
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-4 border-b pb-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-normal uppercase mb-2">
                        {formation.categorie.replace("_", " ")}
                    </Badge>
                    <h1 className="text-3xl font-bold tracking-tight leading-tight">{formation.titre}</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Colonne Principale: Détails */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="border shadow-none bg-[#F8FAFC]">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Info className="h-5 w-5 text-blue-600" />
                                Objectifs de la session
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">{formation.description}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                Liste des Inscrits ({formation.inscriptions.length} / {formation.capaciteMax})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 p-0">
                            {formation.inscriptions.length === 0 ? (
                                <div className="p-6 text-center text-muted-foreground">Aucun inscrit pour le moment.</div>
                            ) : (
                                <ul className="divide-y">
                                    {formation.inscriptions.map((ins: any, idx: number) => (
                                        <li key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-muted/5 gap-3">
                                            <div>
                                                <p className="font-medium text-sm">{ins.user?.prenom} {ins.user?.nom}</p>
                                                <p className="text-xs text-muted-foreground">{ins.agent?.direction} - {ins.agent?.poste}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {hasAdminAccess && (
                                                    <div className="flex items-center gap-1 mr-2 border-r pr-3">
                                                        <Button
                                                            size="sm"
                                                            variant={ins.statut === "present" ? "default" : "outline"}
                                                            className={`h-7 px-2 text-xs ${ins.statut === "present" ? "bg-green-600 hover:bg-green-700" : ""}`}
                                                            onClick={() => handlePresence(ins._id, true)}
                                                        >
                                                            Présent
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant={ins.statut === "absent" ? "destructive" : "outline"}
                                                            className="h-7 px-2 text-xs"
                                                            onClick={() => handlePresence(ins._id, false)}
                                                        >
                                                            Absent
                                                        </Button>
                                                    </div>
                                                )}
                                                <Badge variant="outline" className={
                                                    ins.statut === "present" ? "bg-green-50 text-green-700 border-green-200" :
                                                        ins.statut === "absent" ? "bg-red-50 text-red-700 border-red-200" :
                                                            ins.user?._id === user?._id ? "bg-blue-50 text-blue-700 border-blue-200" : ""
                                                }>
                                                    {ins.statut === "present" ? "Présent" :
                                                        ins.statut === "absent" ? "Absent" :
                                                            ins.user?._id === user?._id ? "Vous" : "Inscrit"}
                                                </Badge>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Colonne Droite: Action & Meta */}
                <div className="space-y-6">
                    <Card className="border-2 border-[#1B4F72]/20 shadow-md relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#1B4F72]/5 rounded-bl-full" />
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl">S'inscrire</CardTitle>
                            <CardDescription>
                                Places restantes : <span className="font-bold text-[#1B4F72]">{placeRestantes > 0 ? placeRestantes : 0}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isAlreadyInscript ? (
                                <div className="bg-green-50 text-green-800 p-4 rounded-md border border-green-200 flex flex-col items-center justify-center text-center">
                                    <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
                                    <span className="font-medium">Vous êtes déjà inscrit !</span>
                                    <span className="text-xs mt-1">Votre place est confirmée.</span>
                                </div>
                            ) : formation.statut === "terminee" ? (
                                <div className="bg-gray-100 text-gray-500 p-4 rounded-md text-center">
                                    Formation cloturée
                                </div>
                            ) : placeRestantes <= 0 ? (
                                <div className="bg-orange-50 text-orange-800 p-4 rounded-md text-center font-medium border border-orange-200">
                                    Session Complète
                                </div>
                            ) : (
                                <Button
                                    className="w-full h-12 text-lg bg-[#27AE60] hover:bg-[#27AE60]/90 text-white"
                                    onClick={handleInscription}
                                    disabled={isInscribing}
                                >
                                    <UserPlus className="mr-2 h-5 w-5" /> Confirmer ma place
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Informations pratiques
                        </CardHeader>
                        <CardContent className="space-y-4 pt-2">
                            <div className="flex gap-3">
                                <Calendar className="h-5 w-5 text-[#1B4F72] shrink-0" />
                                <div>
                                    <p className="font-medium text-sm">Période</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Du {new Date(formation.dateDebut).toLocaleDateString('fr-FR')}<br />
                                        Au {new Date(formation.dateFin).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex gap-3">
                                <Clock className="h-5 w-5 text-[#1B4F72] shrink-0" />
                                <div>
                                    <p className="font-medium text-sm">Volume Horaire</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{formation.duree} Heures</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex gap-3">
                                <MapPin className="h-5 w-5 text-[#1B4F72] shrink-0" />
                                <div>
                                    <p className="font-medium text-sm">Lieu / Salle</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{formation.lieu}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex gap-3">
                                <BookOpen className="h-5 w-5 text-[#1B4F72] shrink-0" />
                                <div>
                                    <p className="font-medium text-sm">Formateur(ice)</p>
                                    <p className="text-xs text-muted-foreground mt-0.5 font-semibold text-[#1B4F72]">{formation.formateur}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
