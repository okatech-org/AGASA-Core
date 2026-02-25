"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";

// Fix pour les icones Leaflet
const customIcon = new Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
const redIcon = new Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
const orangeIcon = new Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// Coordonnées approximatives des provinces
const provinceCoords: Record<string, [number, number]> = {
    "Estuaire": [0.4162, 9.4673],
    "Ogooué-Maritime": [-0.7193, 8.7815],
    "Woleu-Ntem": [1.5833, 11.5833],
    "Haut-Ogooué": [-1.6333, 13.5833],
    "Ngounié": [-1.7583, 10.9833],
    "Moyen-Ogooué": [-0.6833, 10.2333],
    "Ogooué-Ivindo": [0.9333, 12.8333],
    "Ogooué-Lolo": [-1.1667, 12.4833],
    "Nyanga": [-2.8333, 11.0000],
    "Siège": [0.3901, 9.4544]
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

export default function AlertesMap({ data }: { data: any[] }) {
    // Rend possible l'affichage de leaflet de manière sécurisée hors SSR
    return (
        <MapContainer center={[-0.8037, 11.6094]} zoom={6} scrollWheelZoom={false} className="h-full w-full z-0 relative rounded-b-lg">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {data.map((alerte: any) => {
                const coords = provinceCoords[alerte.zoneGeographique] || [-0.8037, 11.6094];
                const jitterLat = coords[0] + (Math.random() - 0.5) * 0.5;
                const jitterLng = coords[1] + (Math.random() - 0.5) * 0.5;
                const icon = alerte.niveau === "urgence" ? redIcon : alerte.niveau === "alerte" ? orangeIcon : customIcon;

                return (
                    <Marker position={[jitterLat, jitterLng]} icon={icon} key={alerte._id}>
                        <Popup>
                            <div className="space-y-2 min-w-[200px]">
                                <Badge className={`border-none ${getBadgeColor(alerte.niveau)} uppercase text-[10px]`}>{alerte.niveau}</Badge>
                                <div className="font-bold text-sm leading-tight text-slate-900">{alerte.titre}</div>
                                <div className="text-xs text-slate-500">Prov: {alerte.zoneGeographique}</div>
                                <Button size="sm" variant="outline" className="w-full text-xs h-7 mt-2" asChild>
                                    <Link href={`/alertes/alertes/${alerte._id}`}>Détails Investig.</Link>
                                </Button>
                            </div>
                        </Popup>
                    </Marker>
                )
            })}
        </MapContainer>
    );
}
