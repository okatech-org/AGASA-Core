"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Microscope, Activity, ShieldAlert, PenTool, CheckCircle2, AlertTriangle, Cpu, Beaker, Scale, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EquipementDetailsPage() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const eqptId = params.id as Id<"equipements">;

    const data = useQuery(api.logistique.equipements.getEquipement, {
        userId: user?._id as any,
        equipementId: eqptId
    });

    if (data === undefined) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Chargement de la fiche signalétique de l'appareil...</div>;
    }

    const { maintenances, ...eq } = data;

    const getTypeIcon = (t: string) => {
        switch (t) {
            case "spectrometre": return <Cpu className="w-8 h-8 text-cyan-700" />;
            case "chromatographe": return <Beaker className="w-8 h-8 text-purple-700" />;
            case "balance": return <Scale className="w-8 h-8 text-emerald-700" />;
            default: return <Microscope className="w-8 h-8 text-slate-700" />;
        }
    };

    const getStatutBadge = (s: string) => {
        switch (s) {
            case "operationnel": return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-sm py-1"><CheckCircle2 className="w-4 h-4 mr-1" /> Opérationnel</Badge>;
            case "en_panne": return <Badge className="bg-red-50 text-red-700 border-red-200 text-sm py-1"><ShieldAlert className="w-4 h-4 mr-1" /> En panne</Badge>;
            case "en_maintenance": return <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-sm py-1"><PenTool className="w-4 h-4 mr-1" /> Maintenance</Badge>;
            case "reforme": return <Badge variant="secondary" className="text-sm py-1"><AlertTriangle className="w-4 h-4 mr-1" /> Réformé</Badge>;
            default: return <Badge variant="outline">{s}</Badge>;
        }
    }

    return (
        <div className="space-y-6">
            {/* Entête Fiche */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 shadow-inner">
                        {getTypeIcon(eq.type)}
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{eq.designation}</h1>
                            {getStatutBadge(eq.statut)}
                        </div>
                        <p className="text-muted-foreground font-mono text-sm font-medium">REF: {eq.reference} — {eq.marque} {eq.modele}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.back()}>Retour</Button>
                    <Button variant="default" className="bg-[#1B4F72]">
                        <Settings className="w-4 h-4 mr-2" /> Options Appareil
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Métrologie et Signalétique */}
                <div className="space-y-6">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50 border-b pb-4">
                            <CardTitle className="text-sm flex items-center gap-2"><Activity className="w-4 h-4" /> Métrologie Légale</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <dl className="divide-y divide-slate-100 text-sm">
                                <div className="flex justify-between p-4 bg-emerald-50/30">
                                    <dt className="text-emerald-800 font-medium">Dernier Certificat</dt>
                                    <dd className="font-bold text-emerald-900">
                                        {eq.derniereCalibration ? new Date(eq.derniereCalibration).toLocaleDateString("fr-FR") : '-'}
                                    </dd>
                                </div>
                                <div className="flex justify-between p-4 bg-orange-50/50">
                                    <dt className="text-orange-900 font-medium">Échéance Prochaine</dt>
                                    <dd className="font-bold text-orange-900">
                                        {eq.prochaineCalibration ? new Date(eq.prochaineCalibration).toLocaleDateString("fr-FR") : 'Non planifiée'}
                                    </dd>
                                </div>
                                <div className="p-4">
                                    <Button variant="outline" className="w-full text-xs h-8" onClick={() => router.push('/logistique/maintenances/nouveau')}>
                                        + Programmer Calibration
                                    </Button>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50 border-b pb-4">
                            <CardTitle className="text-sm">Immobilisation Labo</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <dl className="divide-y divide-slate-100 text-sm">
                                <div className="flex justify-between p-4">
                                    <dt className="text-muted-foreground">Unité d'Affectation</dt>
                                    <dd className="font-medium text-slate-800">{eq.laboratoire}</dd>
                                </div>
                                <div className="flex justify-between p-4">
                                    <dt className="text-muted-foreground">Date Acquisition</dt>
                                    <dd className="font-medium">{new Date(eq.dateAcquisition).toLocaleDateString("fr-FR")}</dd>
                                </div>
                                <div className="flex justify-between p-4">
                                    <dt className="text-muted-foreground">Âge Appareil</dt>
                                    <dd className="font-medium">
                                        {Math.floor((Date.now() - eq.dateAcquisition) / (1000 * 60 * 60 * 24 * 365.25))} ans
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>
                </div>

                {/* Historique Maintenances */}
                <div className="lg:col-span-2">
                    <Card className="shadow-sm border-slate-200 h-full">
                        <CardHeader className="border-b pb-4 flex flex-row items-center justify-between p-6 bg-slate-50/50">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <PenTool className="w-5 h-5" /> Carnet de Maintenance
                                </CardTitle>
                                <CardDescription>Historique des interventions et calibrations métrologiques.</CardDescription>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => router.push('/logistique/maintenances/nouveau')}>
                                Soumettre Fiche Interv.
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-white">
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Type Interv.</TableHead>
                                        <TableHead>Rapport Technicien</TableHead>
                                        <TableHead>État</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {maintenances.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">Le carnet d'entretien est actuellement vide pour ce matériel.</TableCell></TableRow>
                                    ) : (
                                        maintenances.map(m => (
                                            <TableRow key={m._id}>
                                                <TableCell className="font-semibold text-sm whitespace-nowrap">
                                                    {new Date(m.dateIntervention).toLocaleDateString("fr-FR")}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={`capitalize ${m.type === 'calibration' ? 'border-cyan-200 bg-cyan-50 text-cyan-800' : 'bg-slate-50'}`}>
                                                        {m.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm font-medium">{m.description}</div>
                                                    <div className="text-xs text-muted-foreground truncate w-[200px]">Par: {m.technicien}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={m.statut === 'terminee' ? 'secondary' : 'outline'} className={m.statut === 'terminee' ? 'bg-emerald-50 text-emerald-700 border-none' : ''}>
                                                        {m.statut}
                                                    </Badge>
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
