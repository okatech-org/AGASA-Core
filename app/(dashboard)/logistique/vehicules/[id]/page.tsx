"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Car, Navigation, Wrench, CalendarClock, PenTool, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VehiculeDetailsPage() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const vehiculeId = params.id as Id<"vehicules">;

    const vData = useQuery(api.logistique.vehicules.getVehicule, {
        userId: user?._id as any,
        vehiculeId
    });

    if (vData === undefined) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Chargement de la fiche véhicule...</div>;
    }

    const { missions, maintenances, ...v } = vData;

    const getStatutBadge = (statut: string) => {
        switch (statut) {
            case "disponible": return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Disponible</Badge>;
            case "en_mission": return <Badge className="bg-blue-50 text-blue-700 border-blue-200"><Navigation className="w-3 h-3 mr-1" /> En mission</Badge>;
            case "en_maintenance": return <Badge className="bg-amber-50 text-amber-700 border-amber-200"><PenTool className="w-3 h-3 mr-1" /> Maintenance</Badge>;
            case "hors_service": return <Badge className="bg-red-50 text-red-700 border-red-200"><ShieldAlert className="w-3 h-3 mr-1" /> Hors service</Badge>;
            default: return <Badge variant="outline">{statut}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Entête */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                        <Car className="w-8 h-8 text-slate-700" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold font-mono tracking-widest text-slate-900">{v.immatriculation}</h1>
                            {getStatutBadge(v.statut)}
                        </div>
                        <p className="text-muted-foreground font-medium text-lg">{v.marque} {v.modele}</p>
                    </div>
                </div>
                <Button variant="outline" onClick={() => router.back()}>Retour à la Flotte</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Colonne de gauche (Informations Signalétiques) */}
                <div className="space-y-6">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50 border-b pb-4">
                            <CardTitle className="text-sm">Caractéristiques Techniques</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <dl className="divide-y divide-slate-100 text-sm">
                                <div className="flex justify-between p-4">
                                    <dt className="text-muted-foreground">Type/Usage</dt>
                                    <dd className="font-medium capitalize">{v.type.replace('_', ' ')}</dd>
                                </div>
                                <div className="flex justify-between p-4">
                                    <dt className="text-muted-foreground">Année Mat.</dt>
                                    <dd className="font-medium">{v.annee}</dd>
                                </div>
                                <div className="flex justify-between p-4">
                                    <dt className="text-muted-foreground">Zone d'Affectation</dt>
                                    <dd className="font-medium">{v.province}</dd>
                                </div>
                                <div className="flex justify-between p-4 bg-blue-50/50">
                                    <dt className="text-blue-800 font-medium flex items-center gap-2"><Navigation className="w-4 h-4" /> Odomètre actuel</dt>
                                    <dd className="font-bold text-blue-900 text-lg">{v.kilometrage.toLocaleString("fr-FR")} km</dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-amber-50/50 border-b border-amber-100 pb-4">
                            <CardTitle className="text-sm text-amber-900 flex items-center gap-2">
                                <Wrench className="w-4 h-4" /> Suivi Entretien
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Prochaine révision selon Odomètre</p>
                                <p className="text-xl font-bold text-slate-800">
                                    {v.prochaineMaintenanceKm ? `${v.prochaineMaintenanceKm.toLocaleString("fr-FR")} km` : 'Non paramétrée'}
                                </p>
                                {v.prochaineMaintenanceKm && (v.prochaineMaintenanceKm - v.kilometrage) < 1000 && (
                                    <span className="text-xs font-semibold text-red-600 bg-red-50 p-1 rounded mt-1 inline-block">
                                        Entretien imminent (reste {(v.prochaineMaintenanceKm - v.kilometrage).toLocaleString("fr-FR")} km)
                                    </span>
                                )}
                            </div>
                            <Button className="w-full" variant="outline" onClick={() => router.push('/logistique/maintenances/nouveau')}>
                                Planifier Entretien
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Colonne principale (Historique dynamique) */}
                <div className="lg:col-span-2 space-y-6">

                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="border-b pb-4 flex flex-row items-center justify-between p-6">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Navigation className="w-5 h-5" /> Journal de Déploiement
                                </CardTitle>
                                <CardDescription>Dernières missions effectuées par cet actif.</CardDescription>
                            </div>
                            <Button size="sm" className="bg-[#1B4F72] hover:bg-[#1B4F72]/90" onClick={() => router.push('/logistique/vehicules/missions/nouveau')}>
                                + Assigner Mission
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead>Départ</TableHead>
                                        <TableHead>Conducteur</TableHead>
                                        <TableHead>Destination</TableHead>
                                        <TableHead>Distance</TableHead>
                                        <TableHead>Statut</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {missions.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Aucune mission enregistrée.</TableCell></TableRow>
                                    ) : (
                                        missions.slice(0, 5).map(m => (
                                            <TableRow key={m._id}>
                                                <TableCell className="text-sm">{new Date(m.dateDepart).toLocaleDateString("fr-FR")}</TableCell>
                                                <TableCell className="font-medium text-sm">{m.conducteur}</TableCell>
                                                <TableCell className="text-sm">{m.destination}</TableCell>
                                                <TableCell className="text-sm">
                                                    {m.kmRetour ? `${(m.kmRetour - m.kmDepart).toLocaleString("fr-FR")} km` : 'En cours'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={m.statut === "en_cours" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-50"}>
                                                        {m.statut.replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="border-b pb-4 p-6">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <CalendarClock className="w-5 h-5 text-slate-700" /> Historique Maintenance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Intervention détaillée</TableHead>
                                        <TableHead>Garage / Mécano</TableHead>
                                        <TableHead className="text-right">Coût estimé</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {maintenances.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">Carnet d'entretien vierge.</TableCell></TableRow>
                                    ) : (
                                        maintenances.map(m => (
                                            <TableRow key={m._id}>
                                                <TableCell className="text-sm whitespace-nowrap">{new Date(m.dateIntervention).toLocaleDateString("fr-FR")}</TableCell>
                                                <TableCell>
                                                    <span className="font-medium">{m.type}</span>
                                                    <p className="text-xs text-muted-foreground">{m.description}</p>
                                                </TableCell>
                                                <TableCell className="text-sm">{m.technicien}</TableCell>
                                                <TableCell className="text-right font-medium text-sm">
                                                    {m.cout ? `${m.cout.toLocaleString("fr-FR")} FCFA` : '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}
