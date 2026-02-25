"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import L from "leaflet";

// Correction des icônes Leaflet par défaut sous NextJS
const initLeaflet = () => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
        iconUrl: '/leaflet/marker-icon.png',
        shadowUrl: '/leaflet/marker-shadow.png',
    });
};

export default function LogistiqueMap({ stats }: { stats: any }) {
    useEffect(() => {
        initLeaflet();
    }, []);

    if (!stats || !stats.mapItems) return <div className="h-[500px] w-full bg-slate-50 flex items-center justify-center text-slate-400">Initialisation de la cartographie GPRS...</div>;

    return (
        <MapContainer
            center={[0.3901, 9.4544]}
            zoom={7}
            scrollWheelZoom={false}
            className="h-full w-full outline-none z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {stats.mapItems.map((item: any) => {
                // Simulation grossière de position autour de Lbv pour la démo
                const lat = 0.3901 + (Math.random() - 0.5) * 2;
                const lng = 9.4544 + (Math.random() - 0.5) * 2;

                return (
                    <Marker key={item.id} position={[lat, lng]}>
                        <Popup>
                            <div className="font-sans">
                                <div className="font-bold text-slate-900 border-b pb-1 mb-1">{item.immatriculation}</div>
                                <div className="text-xs">{item.marque} {item.modele}</div>
                                <div className="text-xs capitalize flex items-center gap-1 mt-1">
                                    <span className={`w-2 h-2 rounded-full ${item.statut === 'en_mission' ? 'bg-blue-500' : (item.statut === 'disponible' ? 'bg-emerald-500' : 'bg-orange-500')}`}></span>
                                    {item.statut.replace('_', ' ')}
                                </div>
                                {item.statut === 'en_mission' && (
                                    <div className="mt-2 bg-slate-50 p-2 rounded text-xs">
                                        <div><span className="font-semibold text-slate-700">Mission:</span> {item.mission}</div>
                                        <div><span className="font-semibold text-slate-700">Chauffeur:</span> {item.conducteur}</div>
                                    </div>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}
