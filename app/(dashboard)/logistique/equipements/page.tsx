"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Microscope, Beaker, Scale, ShieldAlert, Cpu, CheckCircle2, AlertTriangle, PenTool } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function EquipementsDashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [statut, setStatut] = useState("tous");
    const [type, setType] = useState("tous");

    const stats = useQuery(api.logistique.equipements.getEquipementsStats, { userId: user?._id as any });
    const liste = useQuery(api.logistique.equipements.listerEquipements, {
        userId: user?._id as any,
        statut: statut === "tous" ? undefined : statut,
        type: type === "tous" ? undefined : type
    });

    const getTypeIcon = (t: string) => {
        switch (t) {
            case "spectrometre": return <Cpu className="w-4 h-4 text-cyan-600" />;
            case "chromatographe": return <Beaker className="w-4 h-4 text-purple-600" />;
            case "balance": return <Scale className="w-4 h-4 text-emerald-600" />;
            default: return <Microscope className="w-4 h-4 text-slate-600" />;
        }
    };

    const getStatutBadge = (s: string) => {
        switch (s) {
            case "operationnel": return <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Opérationnel</Badge>;
            case "en_panne": return <Badge className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"><ShieldAlert className="w-3 h-3 mr-1" /> En panne</Badge>;
            case "en_maintenance": return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"><PenTool className="w-3 h-3 mr-1" /> Maintenance</Badge>;
            case "reforme": return <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" /> Réformé</Badge>;
            default: return <Badge variant="outline">{s}</Badge>;
        }
    }

    const filtered = (liste || []).filter(e =>
        e.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.marque.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-[#1B4F72] pl-3">Parc Instrumental LAA</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Gestion des équipements de laboratoire, métrologie et suivi des calibrations.</p>
                </div>
                <Button className="bg-[#1B4F72] hover:bg-[#1B4F72]/90">
                    + Nouvel Appareil
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center text-emerald-700 mb-2">
                            <span className="text-sm font-medium">Opérationnels</span>
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div className="text-3xl font-bold">{stats ? stats.operationnels : "-"}</div>
                        <p className="text-xs text-muted-foreground mt-1">Sur {stats?.total || 0} équipements total</p>
                    </CardContent>
                </Card>

                <Card className={`shadow-sm ${stats?.calibrationsUrgentes && stats.calibrationsUrgentes > 0 ? "border-amber-300 bg-amber-50/50" : "border-slate-200"}`}>
                    <CardContent className="p-6">
                        <div className={`flex justify-between items-center mb-2 ${stats?.calibrationsUrgentes && stats.calibrationsUrgentes > 0 ? 'text-amber-800' : 'text-slate-500'}`}>
                            <span className="text-sm font-medium">Calibrations à faire</span>
                            <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div className={`text-3xl font-bold ${stats?.calibrationsUrgentes && stats.calibrationsUrgentes > 0 ? 'text-amber-700' : ''}`}>
                            {stats ? stats.calibrationsUrgentes : "-"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Requises sous 30 jours</p>
                    </CardContent>
                </Card>

                <Card className={`shadow-sm ${stats?.en_panne && stats.en_panne > 0 ? "border-red-300 bg-red-50/50" : "border-slate-200"}`}>
                    <CardContent className="p-6">
                        <div className={`flex justify-between items-center mb-2 ${stats?.en_panne && stats.en_panne > 0 ? 'text-red-800' : 'text-slate-500'}`}>
                            <span className="text-sm font-medium">Appareils Hors Service</span>
                            <ShieldAlert className="h-4 w-4" />
                        </div>
                        <div className={`text-3xl font-bold ${stats?.en_panne && stats.en_panne > 0 ? 'text-red-700' : ''}`}>
                            {stats ? stats.en_panne : "-"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Pannes déclarées</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200 bg-slate-50">
                    <CardContent className="p-4">
                        <div className="text-sm font-medium mb-2 text-slate-700">Répartition Analytique</div>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                            <div className="flex justify-between border-b pb-1"><span className="text-muted-foreground">Spectromètres</span> <span className="font-medium">{stats?.repartitionType.spectro}</span></div>
                            <div className="flex justify-between border-b pb-1 pl-2"><span className="text-muted-foreground">Chromato.</span> <span className="font-medium">{stats?.repartitionType.chromato}</span></div>
                            <div className="flex justify-between pt-1"><span className="text-muted-foreground">Balances</span> <span className="font-medium">{stats?.repartitionType.balance}</span></div>
                            <div className="flex justify-between pt-1 pl-2"><span className="text-muted-foreground">Autres</span> <span className="font-medium">{stats?.repartitionType.autre}</span></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50/50 border-b pb-4 flex flex-col md:flex-row md:justify-between md:items-center p-4">
                    <div className="flex flex-1 gap-3 flex-col md:flex-row">
                        <Input
                            placeholder="Chercher (Réf, Nom, Marque)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-xs bg-white"
                        />
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="w-[180px] bg-white">
                                <SelectValue placeholder="Catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="tous">Tous les Types</SelectItem>
                                <SelectItem value="spectrometre">Spectromètres</SelectItem>
                                <SelectItem value="chromatographe">Chromatographes</SelectItem>
                                <SelectItem value="balance">Balances</SelectItem>
                                <SelectItem value="autre">Autres</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statut} onValueChange={setStatut}>
                            <SelectTrigger className="w-[180px] bg-white">
                                <SelectValue placeholder="Disponibilité" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="tous">Toutes les dispos</SelectItem>
                                <SelectItem value="operationnel">Opérationnels</SelectItem>
                                <SelectItem value="en_maintenance">En maintenance</SelectItem>
                                <SelectItem value="en_panne">En panne</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead>Identifiant & Appareil</TableHead>
                                <TableHead>Labo d'Affectation</TableHead>
                                <TableHead>Famille</TableHead>
                                <TableHead>Dernière Calibration</TableHead>
                                <TableHead>Échéance (Métrologie)</TableHead>
                                <TableHead>Statut</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {liste === undefined ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground animate-pulse">Chargement de la cartographie matérielle...</TableCell></TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Aucun équipement correspondant aux filtres.</TableCell></TableRow>
                            ) : (
                                filtered.map(item => {
                                    const diff = item.prochaineCalibration ? ((item.prochaineCalibration - Date.now()) / (1000 * 60 * 60 * 24)) : null;
                                    const isUrgent = diff !== null && diff <= 30 && diff > 0;
                                    const isPerime = diff !== null && diff <= 0;

                                    return (
                                        <TableRow key={item._id} className="cursor-pointer hover:bg-slate-50" onClick={() => router.push(`/logistique/equipements/${item._id}`)}>
                                            <TableCell>
                                                <div className="font-semibold text-slate-900">{item.designation}</div>
                                                <div className="text-xs font-mono text-muted-foreground">{item.reference} - {item.marque} {item.modele}</div>
                                            </TableCell>
                                            <TableCell className="font-medium text-sm text-slate-700">
                                                {item.laboratoire}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 capitalize text-sm text-slate-600">
                                                    {getTypeIcon(item.type)} {item.type}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {item.derniereCalibration ? new Date(item.derniereCalibration).toLocaleDateString("fr-FR") : <span className="text-muted-foreground italic">Non calibré</span>}
                                            </TableCell>
                                            <TableCell>
                                                {item.prochaineCalibration ? (
                                                    <div className="flex flex-col">
                                                        <span className={`text-sm font-medium ${isUrgent ? 'text-amber-600' : (isPerime ? 'text-red-600 font-bold' : 'text-slate-800')}`}>
                                                            {new Date(item.prochaineCalibration).toLocaleDateString("fr-FR")}
                                                        </span>
                                                        {isUrgent && <span className="text-[10px] text-amber-600 uppercase font-semibold">Bientôt expiré</span>}
                                                        {isPerime && <span className="text-[10px] text-red-600 uppercase font-bold">Calibration obsolète</span>}
                                                    </div>
                                                ) : <span className="text-muted-foreground text-sm">-</span>}
                                            </TableCell>
                                            <TableCell>
                                                {getStatutBadge(item.statut)}
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
