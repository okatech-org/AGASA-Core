"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Truck, Car, Package, Wrench, MapPin,
    ArrowRight, Loader2, AlertTriangle,
} from "lucide-react";

const sousModules = [
    { label: "Flotte de véhicules", href: "/logistique/vehicules", icon: Car, desc: "Inventaire, suivi GPS temps réel" },
    { label: "Stocks & Réactifs", href: "/logistique/stocks", icon: Package, desc: "Inventaire, alertes, mouvements" },
    { label: "Maintenances", href: "/logistique/maintenances", icon: Wrench, desc: "Planification, historique, coûts" },
    { label: "Équipements", href: "/logistique/equipements", icon: MapPin, desc: "Calibration, état, réforme" },
];

export default function LogistiquePage() {
    const { user } = useAuth();
    const userId = user?._id;

    const flotte = useQuery(api.logistique.vehicules.getFlotteStats, userId ? { userId } : "skip");
    const stocks = useQuery(api.logistique.stocks.getStocksStats, userId ? { userId } : "skip");

    const isLoading = flotte === undefined || stocks === undefined;

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                    <Truck className="h-6 w-6 text-orange-600" />
                    Logistique
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Flotte de véhicules, stocks de réactifs et maintenance des équipements
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm border-blue-100">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase">Véhicules</p>
                                <p className="text-2xl font-bold text-blue-700 mt-1">{flotte?.total ?? 0}</p>
                            </div>
                            <Car className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200">{flotte?.disponibles ?? 0} dispo</Badge>
                            <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200">{flotte?.en_mission ?? 0} en mission</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-amber-100">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase">En maintenance</p>
                                <p className="text-2xl font-bold text-amber-700 mt-1">{flotte?.en_maintenance ?? 0}</p>
                            </div>
                            <Wrench className="h-5 w-5 text-amber-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-emerald-100">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase">Articles en stock</p>
                                <p className="text-2xl font-bold text-emerald-700 mt-1">{stocks?.totalArticles ?? 0}</p>
                            </div>
                            <Package className="h-5 w-5 text-emerald-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className={`shadow-sm ${(stocks?.produitsEnAlerteTot ?? 0) > 0 ? "border-red-200 bg-red-50/30" : "border-slate-100"}`}>
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase">Alertes stock</p>
                                <p className={`text-2xl font-bold mt-1 ${(stocks?.produitsEnAlerteTot ?? 0) > 0 ? "text-red-700" : "text-slate-700"}`}>
                                    {stocks?.produitsEnAlerteTot ?? 0}
                                </p>
                            </div>
                            <AlertTriangle className={`h-5 w-5 ${(stocks?.produitsEnAlerteTot ?? 0) > 0 ? "text-red-400" : "text-slate-300"}`} />
                        </div>
                        {(stocks?.produitsExpiresProches ?? 0) > 0 && (
                            <Badge variant="destructive" className="mt-2 text-[10px]">{stocks?.produitsExpiresProches} expirent bientôt</Badge>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Access to Sub-Modules */}
            <div>
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Sous-modules</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    {sousModules.map((sm) => (
                        <Link key={sm.href} href={sm.href}>
                            <Card className="hover:shadow-md hover:border-orange-200 transition-all cursor-pointer group">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="rounded-lg bg-orange-50 p-2.5 group-hover:bg-orange-100 transition-colors">
                                        <sm.icon className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm">{sm.label}</p>
                                        <p className="text-xs text-muted-foreground truncate">{sm.desc}</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-orange-500 transition-colors" />
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
