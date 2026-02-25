"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Car, Microscope, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AgendaMaintenancePage() {
    const { user } = useAuth();
    const router = useRouter();

    const agenda = useQuery(api.logistique.maintenances.getAgendaMaintenance, {
        userId: user?._id as any
    });

    const getStatutBadge = (s: string) => {
        switch (s) {
            case "planifie": return <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Prévu</Badge>;
            case "urgent": return <Badge className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200"><AlertTriangle className="w-3 h-3 mr-1" /> Urgent (&lt; 30j)</Badge>;
            case "retard": return <Badge className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"><ShieldAlert className="w-3 h-3 mr-1" /> En Retard</Badge>;
            default: return <Badge variant="outline">{s}</Badge>;
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-[#1B4F72] pl-3">Planning des Interventions</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Vue unifiée des révisions automobiles et calibrations d'équipements LAA.</p>
                </div>
                <Button className="bg-[#1B4F72] hover:bg-[#1B4F72]/90" onClick={() => router.push('/logistique/maintenances/nouveau')}>
                    + Saisir Intervention
                </Button>
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50/50 border-b pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <CalendarClock className="w-5 h-5" /> Agenda Prévisionnel
                    </CardTitle>
                    <CardDescription>Liste chronologique des opérations de maintenance à venir.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-white">
                                <TableHead>Date Prévue</TableHead>
                                <TableHead>Entité Concernée</TableHead>
                                <TableHead>Critère Déclencheur</TableHead>
                                <TableHead>Priorité</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {agenda === undefined ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground animate-pulse">Génération du calendrier prévisionnel...</TableCell></TableRow>
                            ) : agenda.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-10 text-emerald-600 font-medium bg-emerald-50/20">Aucune intervention programmée. Le parc est à jour.</TableCell></TableRow>
                            ) : (
                                agenda.map((item, idx) => (
                                    <TableRow key={idx} className="hover:bg-slate-50">
                                        <TableCell className="font-semibold text-slate-900 border-l-[3px] border-slate-300">
                                            {new Date(item.date).toLocaleDateString("fr-FR")}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {item.typeEntite === "vehicule" ? <Car className="w-5 h-5 text-slate-500" /> : <Microscope className="w-5 h-5 text-slate-500" />}
                                                <div>
                                                    <div className="font-medium text-slate-900">{item.titre}</div>
                                                    <div className="text-xs text-muted-foreground uppercase tracking-wide">{item.typeEntite === 'vehicule' ? 'Flotte Auto' : 'Matériel LAA'}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm font-medium text-slate-700">
                                            {item.critere}
                                        </TableCell>
                                        <TableCell>
                                            {getStatutBadge(item.statut)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => router.push(item.typeEntite === 'vehicule' ? `/logistique/vehicules/${item.id}` : `/logistique/equipements/${item.id}`)}>
                                                Voir Dossier
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
