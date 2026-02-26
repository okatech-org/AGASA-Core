"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Users, CalendarDays, GraduationCap, Wallet, UserCircle,
    ArrowRight, Loader2, Briefcase, Network,
} from "lucide-react";

const sousModules = [
    { label: "Gestion des agents", href: "/rh/agents", icon: Users, desc: "Dossiers, affectations, carrières" },
    { label: "Congés & Absences", href: "/rh/conges", icon: CalendarDays, desc: "Demandes, validation, soldes" },
    { label: "Formations", href: "/rh/formations", icon: GraduationCap, desc: "Catalogue, inscriptions, certificats" },
    { label: "Paie", href: "/rh/paie", icon: Wallet, desc: "Bulletins, primes, retenues" },
    { label: "Self-Service", href: "/rh/self-service", icon: UserCircle, desc: "Portail employé" },
    { label: "Organigramme", href: "/rh/organigramme", icon: Network, desc: "Structure organisationnelle" },
];

export default function RHPage() {
    const { user } = useAuth();
    const userId = user?._id;

    const agents = useQuery(api.rh.agents.listAgents, userId ? { userId } : "skip");
    const conges = useQuery(api.rh.conges.list, userId ? { userId } : "skip");

    const isLoading = agents === undefined || conges === undefined;

    const totalAgents = agents?.length ?? 0;
    const enPoste = agents?.filter((a: any) => a.statut === "en_poste" || a.agent?.statut === "en_poste").length ?? 0;
    const congesEnCours = conges?.filter((c: any) => c.statut === "soumis" || c.statut === "approuve_n1").length ?? 0;
    const congesApprouves = conges?.filter((c: any) => c.statut === "approuve_drh").length ?? 0;

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                    <Users className="h-6 w-6 text-blue-600" />
                    Ressources Humaines
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Gestion des carrières, paie, congés, formations et portail self-service
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm border-blue-100">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase">Effectif total</p>
                                <p className="text-2xl font-bold text-blue-700 mt-1">{totalAgents}</p>
                            </div>
                            <Users className="h-5 w-5 text-blue-400" />
                        </div>
                        <p className="text-xs text-slate-400 mt-2">{enPoste} en poste</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-amber-100">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase">Congés en attente</p>
                                <p className="text-2xl font-bold text-amber-700 mt-1">{congesEnCours}</p>
                            </div>
                            <CalendarDays className="h-5 w-5 text-amber-400" />
                        </div>
                        <p className="text-xs text-slate-400 mt-2">{congesApprouves} approuvés ce mois</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-emerald-100">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase">Formations</p>
                                <p className="text-2xl font-bold text-emerald-700 mt-1">—</p>
                            </div>
                            <GraduationCap className="h-5 w-5 text-emerald-400" />
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Voir catalogue</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-violet-100">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase">Paie</p>
                                <p className="text-2xl font-bold text-violet-700 mt-1">—</p>
                            </div>
                            <Wallet className="h-5 w-5 text-violet-400" />
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Voir bulletins</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Access to Sub-Modules */}
            <div>
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Sous-modules</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {sousModules.map((sm) => (
                        <Link key={sm.href} href={sm.href}>
                            <Card className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="rounded-lg bg-blue-50 p-2.5 group-hover:bg-blue-100 transition-colors">
                                        <sm.icon className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm">{sm.label}</p>
                                        <p className="text-xs text-muted-foreground truncate">{sm.desc}</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
