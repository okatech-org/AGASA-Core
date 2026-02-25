"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Plane, Truck, Car, Navigation, AlertTriangle, PenTool, CheckCircle2, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function VehiculesListePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [filtreType, setFiltreType] = useState("tous");
    const [filtreStatut, setFiltreStatut] = useState("tous");
    const [searchTerm, setSearchTerm] = useState("");

    const vehicules = useQuery(api.logistique.vehicules.listerVehicules, {
        userId: user?._id as any,
        type: filtreType !== "tous" ? filtreType : undefined,
        statut: filtreStatut !== "tous" ? filtreStatut : undefined
    });

    const getStatutBadge = (statut: string) => {
        switch (statut) {
            case "disponible": return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Disponible</Badge>;
            case "en_mission": return <Badge className="bg-blue-50 text-blue-700 border-blue-200"><Navigation className="w-3 h-3 mr-1" /> En mission</Badge>;
            case "en_maintenance": return <Badge className="bg-amber-50 text-amber-700 border-amber-200"><PenTool className="w-3 h-3 mr-1" /> Maintenance</Badge>;
            case "hors_service": return <Badge className="bg-red-50 text-red-700 border-red-200"><ShieldAlert className="w-3 h-3 mr-1" /> Hors service</Badge>;
            default: return <Badge variant="outline">{statut}</Badge>;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "inspection": return <Truck className="w-4 h-4 text-indigo-600" />;
            case "frigorifique": return <Plane className="w-4 h-4 text-cyan-600" />; // Utilisé génériquement ici pour frigo
            case "administratif": return <Car className="w-4 h-4 text-slate-600" />;
            default: return <Car className="w-4 h-4" />;
        }
    };

    const filtered = (vehicules || []).filter(v =>
        v.immatriculation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.modele.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-[#1B4F72] pl-3">Flotte Automobile</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Gestion et état du parc de véhicules AGASA.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push('/logistique/vehicules')}>
                        Tableau de Bord Cartographique
                    </Button>
                    <Button className="bg-[#1B4F72] hover:bg-[#1B4F72]/90" onClick={() => router.push('/logistique/vehicules/nouveau')}>
                        + Ajouter un véhicule
                    </Button>
                </div>
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50/50 border-b pb-4">
                    <CardTitle className="text-lg">Parc Actuel</CardTitle>
                    <CardDescription>Filtrez par plaque, statut ou type pour cibler un véhicule.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="p-4 flex gap-3 bg-white border-b">
                        <Input
                            placeholder="Rechercher (ex: AB-123-CD, Toyota...)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-xs"
                        />
                        <Select value={filtreType} onValueChange={setFiltreType}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Type de véhicule" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="tous">Tous les types</SelectItem>
                                <SelectItem value="inspection">Inspection Terrain (4x4)</SelectItem>
                                <SelectItem value="frigorifique">Chaîne du Froid</SelectItem>
                                <SelectItem value="administratif">Administratif (Liaison)</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filtreStatut} onValueChange={setFiltreStatut}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Statut global" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="tous">Tous les statuts</SelectItem>
                                <SelectItem value="disponible">Disponibles</SelectItem>
                                <SelectItem value="en_mission">En mission</SelectItem>
                                <SelectItem value="en_maintenance">En maintenance</SelectItem>
                                <SelectItem value="hors_service">Hors service</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead>Immatriculation</TableHead>
                                <TableHead>Marque & Modèle</TableHead>
                                <TableHead>Catégorie</TableHead>
                                <TableHead>Affectation</TableHead>
                                <TableHead className="text-right">Kilométrage</TableHead>
                                <TableHead>État Actuel</TableHead>
                                <TableHead className="text-right">Prochaine Rév.</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vehicules === undefined ? (
                                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Chargement de la flotte...</TableCell></TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Aucun véhicule ne correspond aux critères.</TableCell></TableRow>
                            ) : (
                                filtered.map((v) => {
                                    const needsMaintenance = v.prochaineMaintenanceKm && (v.prochaineMaintenanceKm - v.kilometrage) < 1000;

                                    return (
                                        <TableRow key={v._id} className={`hover:bg-slate-50 cursor-pointer ${needsMaintenance ? 'bg-orange-50/30' : ''}`} onClick={() => router.push(`/logistique/vehicules/${v._id}`)}>
                                            <TableCell className="font-bold text-slate-800 font-mono tracking-widest">{v.immatriculation}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{v.marque}</div>
                                                <div className="text-xs text-muted-foreground">{v.modele} ({v.annee})</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm capitalize">
                                                    {getTypeIcon(v.type)}
                                                    {v.type}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-slate-100">{v.province}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {v.kilometrage.toLocaleString("fr-FR")} km
                                            </TableCell>
                                            <TableCell>
                                                {getStatutBadge(v.statut)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {v.prochaineMaintenanceKm ? (
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {needsMaintenance && <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />}
                                                        <span className={`text-sm ${needsMaintenance ? 'text-orange-600 font-semibold' : 'text-slate-600'}`}>
                                                            {v.prochaineMaintenanceKm.toLocaleString("fr-FR")} km
                                                        </span>
                                                    </div>
                                                ) : <span className="text-xs text-slate-400">Non défini</span>}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
