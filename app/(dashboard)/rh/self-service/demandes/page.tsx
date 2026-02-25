"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    ClipboardList, Calendar, GraduationCap, ArrowLeft, ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";

function getStatutLabel(statut: string): string {
    const map: Record<string, string> = {
        soumis: "Soumise",
        brouillon: "Brouillon",
        approuve_n1: "Validée par le responsable",
        approuve_drh: "Accordée",
        refuse: "Refusée",
        annule: "Annulée",
        inscrit: "En attente de validation",
        confirme: "Confirmée",
        certifie: "Certifié",
    };
    return map[statut] || statut;
}

function getStatutColor(statut: string): string {
    if (["approuve_drh", "confirme", "certifie"].includes(statut)) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (["refuse", "annule"].includes(statut)) return "bg-red-100 text-red-700 border-red-200";
    if (["soumis", "inscrit", "approuve_n1"].includes(statut)) return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-slate-100 text-slate-600";
}

function getTypeIcon(type: string) {
    if (type === "Congé") return Calendar;
    if (type === "Formation") return GraduationCap;
    return ClipboardList;
}

export default function MesDemandesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const demandes = useQuery(api.rh.selfService.getMyDemandes, user?._id ? { userId: user._id } : "skip");

    if (demandes === undefined) {
        return <div className="p-10 text-center text-muted-foreground">Chargement de vos demandes...</div>;
    }

    const enCours = demandes.filter(d => !["approuve_drh", "refuse", "annule", "certifie", "confirme"].includes(d.statut));
    const historique = demandes.filter(d => ["approuve_drh", "refuse", "annule", "certifie", "confirme"].includes(d.statut));

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Mes Demandes</h1>
                    <p className="text-sm text-muted-foreground">Suivez toutes vos demandes en cours (congés, formations)</p>
                </div>
            </div>

            {/* En cours */}
            <Card className="shadow-sm border-blue-100">
                <CardHeader className="bg-blue-50/50 border-b pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-blue-800">
                        <ClipboardList className="h-4 w-4" /> Demandes en cours ({enCours.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {enCours.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            ✅ Aucune demande en cours.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {enCours.map((d) => {
                                const Icon = getTypeIcon(d.type);
                                return (
                                    <div key={d._id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors">
                                        <div className="p-2 rounded-lg bg-blue-100">
                                            <Icon className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="text-xs">{d.type}</Badge>
                                                <Badge className={`text-xs border ${getStatutColor(d.statut)}`}>
                                                    {getStatutLabel(d.statut)}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-700 truncate">{d.objet}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Soumise le {new Date(d.date).toLocaleDateString("fr-FR")}
                                            </p>
                                        </div>
                                        <Link href={d.lien}>
                                            <Button variant="ghost" size="sm" className="text-xs gap-1">
                                                <ExternalLink className="h-3 w-3" /> Voir
                                            </Button>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Historique */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b pb-3">
                    <CardTitle className="text-sm font-semibold">Historique ({historique.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {historique.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            Aucun historique disponible.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {historique.slice(0, 20).map((d) => {
                                const Icon = getTypeIcon(d.type);
                                return (
                                    <div key={d._id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/60 transition-colors">
                                        <div className="p-2 rounded-lg bg-slate-100">
                                            <Icon className="h-4 w-4 text-slate-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-xs font-medium text-slate-500">{d.type}</span>
                                                <Badge className={`text-[10px] border ${getStatutColor(d.statut)}`}>
                                                    {getStatutLabel(d.statut)}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-600 truncate">{d.objet}</p>
                                        </div>
                                        <span className="text-xs text-slate-400 whitespace-nowrap">
                                            {new Date(d.date).toLocaleDateString("fr-FR")}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
