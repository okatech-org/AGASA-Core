"use client";

import dynamic from "next/dynamic";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Car, Navigation, ShieldAlert, PenTool, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

// Chargement Asynchrone obligatoire pour désactiver le Server-Side Rendering (Leaflet use window)
const LogistiqueMap = dynamic(
    () => import('@/components/logistique/LogistiqueMap'),
    { ssr: false, loading: () => <Skeleton className="w-full h-[500px] bg-slate-50 border-slate-100" /> }
);

export default function VehiculesDashboardPage() {
    const { user } = useAuth();
    const router = useRouter();

    const stats = useQuery(api.logistique.vehicules.getFlotteStats, { userId: user?._id as any });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-[#1B4F72] pl-3">Supervision de Flotte</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Géolocalisation et état en temps réel des véhicules AGASA.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Cartes KPI (Raccourcis Conservés) */}
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-slate-200" onClick={() => router.push('/logistique/vehicules/liste')}>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-slate-500">Parc Automobile</p>
                                <p className="text-3xl font-bold text-slate-900">{stats ? stats.total : '-'}</p>
                            </div>
                            <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Car className="w-5 h-5" /></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer border-emerald-200" onClick={() => router.push('/logistique/vehicules/missions/nouveau')}>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-emerald-600">Disponibles</p>
                                <p className="text-3xl font-bold text-slate-900">{stats ? stats.disponibles : '-'}</p>
                            </div>
                            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><CheckCircle2 className="w-5 h-5" /></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-[#1B4F72]/20">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-[#1B4F72]">En Mission Active</p>
                                <p className="text-3xl font-bold text-slate-900">{stats ? stats.en_mission : '-'}</p>
                            </div>
                            <div className="p-2 bg-[#1B4F72]/10 rounded-lg text-[#1B4F72]"><Navigation className="w-5 h-5" /></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer border-amber-200" onClick={() => router.push('/logistique/maintenances')}>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-amber-600">En Maintenance</p>
                                <p className="text-3xl font-bold text-slate-900">{stats ? stats.en_maintenance : '-'}</p>
                            </div>
                            <div className="p-2 bg-amber-100 rounded-lg text-amber-600"><PenTool className="w-5 h-5" /></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border border-slate-200 overflow-hidden shadow-sm">
                <CardHeader className="bg-slate-50 border-b relative z-10">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-emerald-600" />
                        Tracer GPS en direct (Unités connectées)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 relative">
                    <div className="h-[500px] w-full z-0 relative">
                        {stats ? <LogistiqueMap stats={stats} /> : <Skeleton className="h-full w-full bg-slate-50" />}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
