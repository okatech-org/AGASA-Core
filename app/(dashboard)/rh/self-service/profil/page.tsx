"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    User, Briefcase, MapPin, Calendar, Shield, Phone, Mail,
    Building2, BookOpen, Award, ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

function InfoRow({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
            {Icon && <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{value || "Non renseigné"}</p>
            </div>
        </div>
    );
}

export default function ProfilPage() {
    const { user } = useAuth();
    const router = useRouter();
    const data = useQuery(api.rh.selfService.getMyProfile, user?._id ? { userId: user._id } : "skip");

    if (data === undefined) {
        return <div className="p-10 text-center text-muted-foreground">Chargement de votre profil...</div>;
    }

    if (!data) {
        return (
            <div className="p-10 text-center text-red-500 bg-red-50 rounded-lg">
                Profil agent introuvable. Contactez le service RH.
            </div>
        );
    }

    const { agent, user: u } = data;
    const initials = `${u.prenom?.[0] || ""}${u.nom?.[0] || ""}`;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Mon Profil</h1>
                    <p className="text-sm text-muted-foreground">Vos informations personnelles et professionnelles</p>
                </div>
            </div>

            {/* Carte identité */}
            <Card className="shadow-sm overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-[#1B4F72] to-[#2980B9]" />
                <CardContent className="relative pb-6">
                    <Avatar className="h-20 w-20 border-4 border-background absolute -top-10 shadow-lg">
                        <AvatarImage src={u.avatar} />
                        <AvatarFallback className="text-2xl bg-emerald-100 text-emerald-700 font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="pt-12 space-y-1">
                        <h2 className="text-xl font-bold text-slate-900">{u.prenom} {u.nom}</h2>
                        <p className="text-[#1B4F72] font-medium">{agent.poste}</p>
                        <div className="flex flex-wrap gap-2 pt-1">
                            <Badge variant="secondary" className="font-mono text-xs">{u.matricule}</Badge>
                            <Badge variant="outline">{agent.direction} — {agent.service || "Service général"}</Badge>
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0">{agent.province}</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informations personnelles */}
                <Card className="shadow-sm">
                    <CardHeader className="bg-slate-50 border-b pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <User className="h-4 w-4" /> Informations personnelles
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <InfoRow label="Nom complet" value={`${u.prenom} ${u.nom}`} icon={User} />
                        <InfoRow label="Téléphone" value={u.telephone} icon={Phone} />
                        <InfoRow label="Email" value={u.email} icon={Mail} />
                        <InfoRow label="Province de résidence" value={agent.province} icon={MapPin} />
                    </CardContent>
                </Card>

                {/* Informations professionnelles */}
                <Card className="shadow-sm">
                    <CardHeader className="bg-slate-50 border-b pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Briefcase className="h-4 w-4" /> Informations professionnelles
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <InfoRow label="Matricule" value={u.matricule} icon={Shield} />
                        <InfoRow label="Poste" value={agent.poste} icon={Briefcase} />
                        <InfoRow label="Direction" value={agent.direction} icon={Building2} />
                        <InfoRow label="Service" value={agent.service || "Non affecté"} icon={Building2} />
                        <InfoRow label="Grade / Échelon" value={`${agent.grade || "—"} / ${agent.echelon || "—"}`} icon={Award} />
                        <InfoRow label="Type de contrat" value={agent.contratType || "Non renseigné"} icon={BookOpen} />
                        <InfoRow label="Date de recrutement" value={agent.dateRecrutement ? new Date(agent.dateRecrutement).toLocaleDateString("fr-FR") : "Non renseignée"} icon={Calendar} />
                    </CardContent>
                </Card>
            </div>

            {/* Congés */}
            <Card className="shadow-sm border-emerald-100">
                <CardHeader className="bg-emerald-50/50 border-b pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-800">
                        <Calendar className="h-4 w-4" /> Solde de congés
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex items-center gap-6">
                    <div className="text-center">
                        <p className="text-4xl font-bold text-emerald-600">{agent.soldeConges}</p>
                        <p className="text-xs text-slate-500 mt-1">jours restants</p>
                    </div>
                    <Separator orientation="vertical" className="h-12" />
                    <div className="text-sm text-slate-600 space-y-1">
                        <p>Quota annuel : <strong>30 jours</strong></p>
                        <p>Jours pris : <strong>{30 - agent.soldeConges} jours</strong></p>
                    </div>
                </CardContent>
            </Card>

            {/* Info modification */}
            <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p>💡 Pour modifier vos informations professionnelles, contactez votre direction ou le service RH.</p>
            </div>
        </div>
    );
}
