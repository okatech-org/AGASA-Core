"use client";

import dynamic from 'next/dynamic';
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

// Dynamically import the map to avoid SSR issues with Leaflet's 'window'
const CartographieHeatmap = dynamic(() => import('@/app/(dashboard)/bi/cartographie/components/MapWrapper'), {
    ssr: false,
    loading: () => <div className="h-[650px] w-full bg-slate-100 flex items-center justify-center text-slate-400 border rounded-lg">Chargement de la matrice géo-spatiale des risques AGASA-Core...</div>
});

export default function CartographieRisquesPage() {
    return (
        <div className="space-y-4 h-[calc(100vh-10rem)] flex flex-col">
            <div className="flex justify-between items-end flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-rose-600 pl-3">Cartographie Thermique des Risques</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Superposition en temps réel : Taux Non-Conformité + Labo Positifs + Plaintes Citoyennes.</p>
                </div>
            </div>

            <div className="flex-1 min-h-0 relative rounded-lg overflow-hidden border shadow-sm flex">
                {/* Lateral Panel For Legend & Filters */}
                <div className="w-80 bg-white border-r z-10 flex flex-col">
                    <div className="p-4 border-b bg-slate-50">
                        <h3 className="font-semibold text-sm flex items-center gap-2 text-slate-800">
                            <AlertCircle className="w-4 h-4 text-rose-500" /> Légende du Risque
                        </h3>
                    </div>
                    <div className="p-4 space-y-4 text-sm text-slate-600 flex-1 overflow-y-auto">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-md bg-[#ef4444] shadow-inner opacity-80"></div>
                            <span>Très élevé (&gt; 60%)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-md bg-[#f97316] shadow-inner opacity-80"></div>
                            <span>Élevé (40-60%)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-md bg-[#eab308] shadow-inner opacity-80"></div>
                            <span>Modéré (20-40%)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-md bg-[#22c55e] shadow-inner opacity-80"></div>
                            <span>Faible (0-20%)</span>
                        </div>

                        <hr className="my-4 border-slate-100" />

                        <p className="text-xs italic text-slate-500">
                            L'algorithme de corrélation affecte un poids de 40% pour les constats Labo, 35% pour l'Inspection Terrain, et 25% pour les F6 Citoyens.
                        </p>
                    </div>
                </div>

                {/* Map Container */}
                <div className="flex-1 bg-slate-50">
                    <CartographieHeatmap />
                </div>
            </div>
        </div>
    );
}
