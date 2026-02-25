"use client";

import dynamic from 'next/dynamic';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, RadioReceiver, Megaphone, Globe, Plus, AlertTriangle, BugOff, Flame, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from 'react';

// Chargement dynamique de la carte sans SSR pour éviter "window is not defined"
const AlertesMap = dynamic(() => import('@/app/(dashboard)/alertes/components/AlertesMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400">Chargement de la cartographie Géo-Spatiale...</div>
});

export default function AlertesDashboard() {
    const { user } = useAuth();
    const stats = useQuery(api.alertes.alertes.getStatsAlertes as any, { userId: user?._id as any });

    if (stats === undefined) return <div className="p-8 text-center animate-pulse">Initialisation du Centre Opérationnel des Alertes...</div>;

    const getIconForType = (type: string) => {
        switch (type) {
            case 'biologique': return <BugOff className="w-4 h-4 text-emerald-600" />;
            case 'chimique': return <Flame className="w-4 h-4 text-amber-600" />;
            case 'physique': return <AlertTriangle className="w-4 h-4 text-slate-600" />;
            default: return <ShieldAlert className="w-4 h-4 text-purple-600" />;
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
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-red-600 pl-3">Poste de Commandement (Alertes)</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Vue centralisée des crises sanitaires, signalements et retraits du marché.</p>
                </div>
                <div className="flex gap-2">
                    <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
                        <Link href="/alertes/alertes/nouveau" className="flex items-center">
                            <Plus className="w-4 h-4 mr-2" />
                            Déclencher Alerte
                        </Link>
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Alertes Actives</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stats.actives}</h3>
                        </div>
                        <div className="p-3 bg-red-100 text-red-600 rounded-full">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Flux Citoyen (F6)</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stats.signalementsEnAttente}</h3>
                        </div>
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                            <RadioReceiver className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Rappels en Cours (F2/F5)</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stats.rappelsEnCours}</h3>
                        </div>
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
                            <Megaphone className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Réseau CEMAC (RASFF)</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stats.cemacActives}</h3>
                        </div>
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                            <Globe className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Carte Interactive */}
                <Card className="shadow-sm border-slate-200 lg:col-span-2">
                    <CardHeader className="bg-slate-50/50 border-b p-4">
                        <CardTitle className="text-base text-slate-800 flex items-center gap-2">Cartographie des Menaces Sanitaires Actives</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 h-[400px]">
                        <AlertesMap data={stats.geolocData} />
                    </CardContent>
                </Card>

                {/* Flux Récent */}
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50/50 border-b p-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-base text-slate-800">Direct 48h</CardTitle>
                        <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold text-blue-600 hover:text-blue-700" asChild>
                            <Link href="/alertes/alertes">Tout voir <ChevronRight className="w-3 h-3 ml-1" /></Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0 h-[400px] overflow-y-auto">
                        <div className="flex flex-col">
                            {stats.recentes.length === 0 ? (
                                <div className="p-8 text-center text-sm text-slate-500">Aucune alerte active détectée.</div>
                            ) : (
                                stats.recentes.map((alerte: any) => (
                                    <Link key={alerte._id} href={`/alertes/alertes/${alerte._id}`} className="p-4 border-b last:border-0 hover:bg-slate-50 flex items-start gap-4 transition-colors">
                                        <div className="mt-1">{getIconForType(alerte.type)}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-semibold text-sm text-slate-900 truncate pr-2">{alerte.titre}</h4>
                                                <Badge className={`border-none ${getBadgeColor(alerte.niveau)} text-[10px] shrink-0 uppercase mb-1`}>{alerte.niveau}</Badge>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div className="text-xs text-slate-500 capitalize">{alerte.zoneGeographique}</div>
                                                <div className="text-[10px] text-slate-400 font-mono">
                                                    {new Date(alerte.dateCreation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
