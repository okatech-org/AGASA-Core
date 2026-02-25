"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Correction icônes leaflet par défaut (même si on utilise des CircleMarker ici)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/marker-icon-2x.png',
    iconUrl: '/marker-icon.png',
    shadowUrl: '/marker-shadow.png',
});

// Coordonnées approximatives des 9 provinces du Gabon
const provincesGeo: Record<string, [number, number]> = {
    "Estuaire": [0.45, 10.05],
    "Haut-Ogooue": [-1.63, 13.58],
    "Moyen-Ogooue": [-0.70, 10.22],
    "Ngounie": [-1.87, 11.05],
    "Nyanga": [-2.85, 11.00],
    "Ogooue-Ivindo": [0.56, 12.86],
    "Ogooue-Lolo": [-1.13, 12.47],
    "Ogooue-Maritime": [-0.71, 8.78],
    "Woleu-Ntem": [1.60, 11.57]
};

const getColor = (niveau: string) => {
    switch (niveau) {
        case 'tres_eleve': return '#ef4444'; // Red-500
        case 'eleve': return '#f97316'; // Orange-500
        case 'modere': return '#eab308'; // Yellow-500
        case 'faible': return '#22c55e'; // Green-500
        default: return '#cbd5e1';
    }
};

export default function CartographieHeatmap() {
    const { user } = useAuth();
    const mapData = useQuery(api.bi.cartographie.getCartographieData as any, { userId: user?._id as any });

    if (!mapData) return <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center p-8 text-center">Connexion aux satellites Sentinel pour relevé topographique...</div>;

    const gabonCenter: [number, number] = [-0.8037, 11.6094];

    return (
        <MapContainer center={gabonCenter} zoom={6} scrollWheelZoom={true} className="h-full w-full z-0 relative">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />

            {Object.keys(mapData).map((provinceName) => {
                const data = mapData[provinceName as keyof typeof mapData] as any;
                const coords = provincesGeo[provinceName];
                if (!coords) return null;

                const color = getColor(data.niveau);

                return (
                    <CircleMarker
                        key={provinceName}
                        center={coords}
                        radius={Math.max(15, data.risque / 1.5)} // Taille proportionnelle au risque
                        pathOptions={{
                            color: color,
                            fillColor: color,
                            fillOpacity: 0.6,
                            weight: 2
                        }}
                    >
                        <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
                            <span className="font-bold">{provinceName}</span>
                        </Tooltip>
                        <Popup>
                            <div className="p-1 space-y-2 min-w-[200px]">
                                <h3 className="font-bold text-slate-800 border-b pb-1">{provinceName}</h3>
                                <div className="text-sm space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Score de Risque:</span>
                                        <span className="font-bold text-slate-900">{data.risque}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Incidents Qualité:</span>
                                        <span className="font-bold text-slate-900">{data.incidents} cas</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Niveau d'Alerte:</span>
                                        <span className="capitalize font-bold" style={{ color }}>
                                            {data.niveau.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </CircleMarker>
                );
            })}
        </MapContainer>
    );
}
