"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { User, Shield, Mail, Phone, Building2, MapPin, Calendar, Clock, Edit, Lock, Unlock, ArrowLeft } from "lucide-react";
import Link from "next/link";

const demoUser = {
    id: "user_demo_001",
    nom: "Obiang Ndong",
    prenom: "Jean-Pierre",
    email: "jp.obiang@agasa.ga",
    telephone: "+241 77 12 34 56",
    matricule: "AGASA-2024-0015",
    role: "directeur",
    direction: "DERSP",
    province: "Estuaire",
    statut: "actif",
    dateCreation: "15/01/2024",
    dernièreConnexion: "25/02/2026 14:32",
    tentativesConnexion: 0,
    is2FA: false,
    avatar: null,
    permissions: ["rh:read", "rh:write", "rh:validate", "finance:read", "ged:read", "ged:write", "ged:validate", "bi:read"],
};

const activityLog = [
    { date: "25/02/2026 14:32", action: "Connexion", module: "Auth", details: "Connexion réussie depuis 196.168.1.42" },
    { date: "25/02/2026 14:35", action: "Consultation", module: "RH", details: "Consultation fiche agent AGASA-2024-0023" },
    { date: "25/02/2026 15:10", action: "Validation", module: "RH", details: "Validation congé annuel de Mme Nzé (5 jours)" },
    { date: "25/02/2026 15:45", action: "Consultation", module: "BI", details: "Consultation tableau de bord direction DERSP" },
    { date: "24/02/2026 09:15", action: "Signature", module: "GED", details: "Signature note de service NS-2026-042" },
    { date: "24/02/2026 10:30", action: "Validation", module: "RH", details: "Refus formation ISO 22000 pour M. Mba — commentaire : calendrier incompatible" },
    { date: "23/02/2026 08:00", action: "Connexion", module: "Auth", details: "Connexion réussie depuis 196.168.1.42" },
];

const statutColors: Record<string, string> = {
    actif: "bg-emerald-100 text-emerald-700",
    inactif: "bg-slate-100 text-slate-600",
    verrouille: "bg-red-100 text-red-700",
};

const roleLabels: Record<string, string> = {
    admin_systeme: "Administrateur Système",
    directeur_general: "Directeur Général",
    directeur: "Directeur",
    chef_service: "Chef de Service",
    agent: "Agent AGASA",
    technicien_laa: "Technicien LAA",
    auditeur: "Auditeur",
    demo: "Démo",
};

export default function UserDetailPage() {
    const params = useParams();
    const u = demoUser;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/admin/utilisateurs">
                    <Button variant="ghost" size="sm" className="gap-1"><ArrowLeft className="h-4 w-4" /> Retour</Button>
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">Profil utilisateur</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="shadow-sm lg:col-span-1">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center mb-4">
                            <User className="h-10 w-10 text-slate-500" />
                        </div>
                        <h2 className="text-lg font-bold">{u.prenom} {u.nom}</h2>
                        <p className="text-sm text-slate-500">{u.matricule}</p>
                        <Badge className={`mt-2 ${statutColors[u.statut]} border-0`}>{u.statut.charAt(0).toUpperCase() + u.statut.slice(1)}</Badge>
                        <div className="mt-4 space-y-2 text-sm w-full text-left">
                            <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-slate-400" /><span className="font-medium">{roleLabels[u.role]}</span></div>
                            <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-400" />{u.direction}</div>
                            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" />{u.province}</div>
                            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" />{u.email}</div>
                            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" />{u.telephone}</div>
                            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-slate-400" />Créé le {u.dateCreation}</div>
                            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-slate-400" />Dernière connexion : {u.dernièreConnexion}</div>
                        </div>
                        <div className="mt-6 flex gap-2 w-full">
                            <Link href={`/admin/utilisateurs/${params.id}/modifier`} className="flex-1">
                                <Button variant="outline" className="w-full gap-1"><Edit className="h-4 w-4" /> Modifier</Button>
                            </Link>
                            <Button variant="outline" className="gap-1 text-red-600 hover:text-red-700"><Lock className="h-4 w-4" /> Verrouiller</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Permissions */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Permissions</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {u.permissions.map(p => (
                                    <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Sécurité</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-slate-500">2FA activé</span><span>{u.is2FA ? "Oui" : "Non"}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Tentatives échouées</span><span>{u.tentativesConnexion}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Statut du compte</span><Badge className={`${statutColors[u.statut]} border-0 text-xs`}>{u.statut}</Badge></div>
                        </CardContent>
                    </Card>

                    {/* Activity Log */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Activité récente</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Module</TableHead>
                                        <TableHead>Détails</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activityLog.map((a, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="text-xs text-slate-500 whitespace-nowrap">{a.date}</TableCell>
                                            <TableCell className="text-sm font-medium">{a.action}</TableCell>
                                            <TableCell><Badge variant="secondary" className="text-xs">{a.module}</Badge></TableCell>
                                            <TableCell className="text-xs text-slate-500">{a.details}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
