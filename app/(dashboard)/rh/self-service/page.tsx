"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { FileText, Calendar, BookOpen, Clock, Download, Plus, Network, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function PortailSelfServicePage() {
    const { user } = useAuth();
    const router = useRouter();

    // Assumes user._id is passed, could be skipped if not fully authed yet
    const data = useQuery(api.rh.selfService.getDashboardInfo, user?._id ? { userId: user._id } : "skip");

    if (data === undefined) {
        return <div className="p-10 text-center text-muted-foreground flex flex-col items-center gap-4">
            <UserCircle2 className="h-10 w-10 animate-pulse text-muted-foreground" />
            Chargement de votre Espace Employé...
        </div>;
    }

    if (!data) {
        return <div className="p-10 text-center text-red-500 bg-red-50 rounded-lg">
            Impossible de charger votre profil agent. Veuillez contacter le support.
        </div>;
    }

    const { agent, user: agentUser, soldeConges, dernierConge, dernierBulletin, prochaineFormation } = data;

    const getInitials = (nom: string, prenom: string) => `${prenom?.[0] || ""}${nom?.[0] || ""}`;

    const formatCFA = (montant: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(montant);
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Mon Portail RH</h1>
                    <p className="text-muted-foreground text-sm">Gérez vos demandes et consultez vos informations personnelles</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push("/rh/self-service/annuaire")}>
                        <Network className="mr-2 h-4 w-4" /> Annuaire des Collaborateurs
                    </Button>
                </div>
            </div>

            {/* HEADER PROFIL */}
            <Card className="border shadow-sm bg-gradient-to-r from-slate-50 to-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#1B4F72]/5 rounded-full -translate-y-16 translate-x-16" />
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                            <AvatarImage src={agentUser?.avatar} />
                            <AvatarFallback className="text-3xl bg-secondary text-secondary-foreground font-semibold">
                                {getInitials(agentUser?.nom, agentUser?.prenom)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-center sm:text-left space-y-1">
                            <h2 className="text-2xl font-bold">{agentUser?.prenom} {agentUser?.nom}</h2>
                            <p className="text-muted-foreground">{agent.poste}</p>
                            <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-2">
                                <Badge variant="secondary" className="font-mono">{agentUser?.matricule}</Badge>
                                <Badge variant="outline">{agent.direction} - {agent.service}</Badge>
                                <Badge className="bg-[#1B4F72] hover:bg-[#1B4F72]/90">{agent.province}</Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* DASHBOARD GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* WIDGET : CONGÉS */}
                <Card className="flex flex-col border shadow-sm hover:border-[#27AE60]/50 transition-colors">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-[#27AE60]" />
                            Mes Congés
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                        <div className="flex justify-between items-end border-b pb-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Solde Annuel</p>
                                <p className="text-4xl font-bold text-[#27AE60]">{soldeConges} <span className="text-lg text-muted-foreground">Jours</span></p>
                            </div>
                            <Button size="sm" onClick={() => router.push("/rh/conges/nouveau")} className="bg-[#27AE60] hover:bg-[#27AE60]/90 border-0 h-8 self-end mb-1">
                                <Plus className="mr-1 h-3 w-3" /> Demander
                            </Button>
                        </div>

                        <div>
                            <p className="text-sm font-semibold mb-2">Dernière activité</p>
                            {dernierConge ? (
                                <div className="bg-muted/30 p-3 rounded-md text-sm">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-medium capitalize">{dernierConge.type}</span>
                                        <Badge variant="outline" className={`text-[10px] ${dernierConge.statut === 'approuve_drh' ? 'text-green-600 border-green-200' : dernierConge.statut === 'refuse' ? 'text-red-600 border-red-200' : 'text-blue-600 border-blue-200'}`}>
                                            {dernierConge.statut.replace("_", " ")}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Du {new Date(dernierConge.dateDebut).toLocaleDateString('fr-FR')} au {new Date(dernierConge.dateFin).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">Aucune demande récente.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* WIDGET : PAIE */}
                <Card className="flex flex-col border shadow-sm hover:border-[#1B4F72]/50 transition-colors">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5 text-[#1B4F72]" />
                            Ma Rémunération
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                        <div className="flex justify-between items-end border-b pb-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Dernier Bulletin</p>
                                {dernierBulletin && dernierBulletin.statut === "valide" ? (
                                    <p className="text-2xl font-bold text-[#1B4F72]">{formatCFA(dernierBulletin.netAPayer)}</p>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic mt-2">En cours de traitement</p>
                                )}
                            </div>
                        </div>

                        <div>
                            {dernierBulletin ? (
                                <div className="bg-muted/30 p-3 rounded-md text-sm space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-semibold uppercase text-xs">{(new Date(0, dernierBulletin.mois - 1)).toLocaleString('fr-FR', { month: 'long' })} {dernierBulletin.annee}</span>
                                        </div>
                                        <Badge variant="secondary" className="bg-[#1B4F72]/10 text-[#1B4F72] border-[#1B4F72]/20">Validé</Badge>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full text-xs h-8 hover:bg-[#1B4F72]/5 hover:text-[#1B4F72] border-dashed"
                                        onClick={() => router.push(`/rh/paie/${dernierBulletin._id}`)}
                                        disabled={dernierBulletin.statut !== "valide"}
                                    >
                                        <Download className="mr-2 h-3 w-3" /> Consuter la fiche (PDF)
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">Aucun bulletin disponible.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* WIDGET : FORMATION */}
                <Card className="flex flex-col border shadow-sm hover:border-blue-500/50 transition-colors">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                            Mes Formations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                        <div className="flex justify-between items-end border-b pb-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Prochaine Session</p>
                                {prochaineFormation ? (
                                    <p className="text-lg font-bold line-clamp-2 leading-tight">{prochaineFormation.titre}</p>
                                ) : (
                                    <p className="text-lg font-semibold text-muted-foreground">Aucune session à venir</p>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-end">
                            {prochaineFormation ? (
                                <div className="bg-blue-50 p-3 rounded-md text-sm space-y-2 border border-blue-100">
                                    <div className="flex justify-between text-blue-800">
                                        <span className="font-medium">{(new Date(prochaineFormation.dateDebut)).toLocaleDateString('fr-FR')}</span>
                                        <span>{prochaineFormation.duree}h</span>
                                    </div>
                                    <div className="text-xs text-blue-700/80 truncate">
                                        📍 {prochaineFormation.lieu}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        className="w-full text-xs h-8 text-blue-700 hover:bg-blue-100 p-0"
                                        onClick={() => router.push(`/rh/formations/${prochaineFormation._id}`)}
                                    >
                                        Voir les détails &rarr;
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="w-full border-dashed"
                                    onClick={() => router.push("/rh/formations")}
                                >
                                    Parcourir le catalogue
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
