"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Shield, Lock, Users, Activity, AlertTriangle,
    ShieldCheck, RefreshCcw, Eye,
} from "lucide-react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

// Demo data
const demoLockedAccounts = [
    { matricule: "AGASA-2024-0012", nom: "Ndong Paul", email: "paul.ndong@agasa.ga", tentatives: 5, dateBlocage: "25/02/2026 09:12", province: "Estuaire" },
    { matricule: "AGASA-2024-0028", nom: "Mba Marc", email: "marc.mba@agasa.ga", tentatives: 7, dateBlocage: "24/02/2026 17:45", province: "Woleu-Ntem" },
];

const demoFailedAttempts = [
    { date: "25/02/2026 14:22", email: "test@agasa.ga", ip: "41.158.22.11", agent: "Chrome/Win10" },
    { date: "25/02/2026 12:05", email: "admin@agasa.ga", ip: "41.158.22.15", agent: "Firefox/Linux" },
    { date: "25/02/2026 09:12", email: "paul.ndong@agasa.ga", ip: "41.158.45.89", agent: "Safari/MacOS" },
    { date: "24/02/2026 17:45", email: "marc.mba@agasa.ga", ip: "41.158.12.34", agent: "Chrome/Android" },
    { date: "24/02/2026 16:30", email: "test@agasa.ga", ip: "185.234.11.22", agent: "curl/7.81" },
];

const demoActiveSessions = [
    { utilisateur: "Admin Système", role: "admin_systeme", depuis: "14h05", ip: "41.158.22.11", appareil: "Chrome / macOS" },
    { utilisateur: "DG", role: "directeur_general", depuis: "13h30", ip: "41.158.22.44", appareil: "Safari / iPad" },
    { utilisateur: "M. Obiang", role: "agent", depuis: "12h15", ip: "41.158.45.89", appareil: "Chrome / Windows" },
    { utilisateur: "Mme Nzé", role: "technicien_laa", depuis: "11h45", ip: "41.158.22.56", appareil: "Firefox / Ubuntu" },
];

export default function AdminSecuritePage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-agasa-primary flex items-center gap-2">
                        <Shield className="h-8 w-8" /> Dashboard Sécurité
                    </h1>
                    <p className="text-muted-foreground mt-1">Surveillance des accès, comptes verrouillés et sessions actives.</p>
                </div>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { title: "Comptes verrouillés", value: demoLockedAccounts.length, icon: Lock, color: "bg-red-100 text-red-600", badge: demoLockedAccounts.length },
                    { title: "Tentatives échouées (24h)", value: demoFailedAttempts.length, icon: AlertTriangle, color: "bg-amber-100 text-amber-600" },
                    { title: "Sessions actives", value: demoActiveSessions.length, icon: Activity, color: "bg-emerald-100 text-emerald-600" },
                    { title: "2FA activé", value: "26%", icon: ShieldCheck, color: "bg-blue-100 text-blue-600" },
                ].map((kpi) => (
                    <Card key={kpi.title} className="shadow-sm border-slate-200">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{kpi.title}</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</p>
                                </div>
                                <div className={`p-2.5 rounded-lg ${kpi.color} relative`}>
                                    <kpi.icon className="w-5 h-5" />
                                    {kpi.badge !== undefined && kpi.badge > 0 && (
                                        <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                                            {kpi.badge}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Comptes verrouillés */}
            <Card className="shadow-sm border-red-100">
                <CardHeader className="bg-red-50/50 border-b pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-red-800">
                        <Lock className="h-4 w-4" /> Comptes verrouillés ({demoLockedAccounts.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead>Matricule</TableHead>
                                <TableHead>Nom</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="text-center">Tentatives</TableHead>
                                <TableHead>Date blocage</TableHead>
                                <TableHead>Province</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {demoLockedAccounts.map((account, i) => (
                                <tr key={i} className="border-b hover:bg-red-50/30 transition-colors">
                                    <TableCell className="font-mono text-xs">{account.matricule}</TableCell>
                                    <TableCell className="font-medium">{account.nom}</TableCell>
                                    <TableCell className="text-sm text-slate-600">{account.email}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="destructive" className="text-xs">{account.tentatives}</Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-500">{account.dateBlocage}</TableCell>
                                    <TableCell className="text-sm">{account.province}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" className="text-xs gap-1"
                                            onClick={() => alert("Fonctionnalité de déverrouillage — Phase 2")}>
                                            <RefreshCcw className="h-3 w-3" /> Déverrouiller
                                        </Button>
                                    </TableCell>
                                </tr>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Tentatives échouées */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" /> Tentatives de connexion échouées (24h)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead>Date / Heure</TableHead>
                                <TableHead>Email tenté</TableHead>
                                <TableHead>Adresse IP</TableHead>
                                <TableHead>User Agent</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {demoFailedAttempts.map((attempt, i) => (
                                <tr key={i} className="border-b hover:bg-slate-50/60 transition-colors">
                                    <TableCell className="text-xs font-mono text-slate-500">{attempt.date}</TableCell>
                                    <TableCell className="font-medium text-sm">{attempt.email}</TableCell>
                                    <TableCell className="text-xs font-mono">{attempt.ip}</TableCell>
                                    <TableCell className="text-xs text-slate-500">{attempt.agent}</TableCell>
                                </tr>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Sessions actives */}
            <Card className="shadow-sm border-emerald-100">
                <CardHeader className="bg-emerald-50/30 border-b pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-800">
                        <Users className="h-4 w-4" /> Sessions actives ({demoActiveSessions.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead>Utilisateur</TableHead>
                                <TableHead>Rôle</TableHead>
                                <TableHead>Connecté depuis</TableHead>
                                <TableHead>Adresse IP</TableHead>
                                <TableHead>Appareil</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {demoActiveSessions.map((session, i) => (
                                <tr key={i} className="border-b hover:bg-slate-50/60 transition-colors">
                                    <TableCell className="font-medium">{session.utilisateur}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-xs capitalize">{session.role.replace("_", " ")}</Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600">{session.depuis}</TableCell>
                                    <TableCell className="text-xs font-mono">{session.ip}</TableCell>
                                    <TableCell className="text-xs text-slate-500">{session.appareil}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" className="text-xs gap-1"
                                            onClick={() => alert("Forcer la déconnexion — Phase 2")}>
                                            <Eye className="h-3 w-3" /> Détails
                                        </Button>
                                    </TableCell>
                                </tr>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
