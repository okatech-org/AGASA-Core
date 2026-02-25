"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CalendarClock, Save, ArrowLeft } from "lucide-react";

export default function NouveauRapportMaintenancePage() {
    const { user } = useAuth();
    const router = useRouter();

    const [typeEntite, setTypeEntite] = useState<"vehicule" | "equipement">("vehicule");
    const [entiteId, setEntiteId] = useState("");
    const [typeIntervention, setTypeIntervention] = useState<"preventive" | "corrective" | "calibration">("preventive");
    const [dateIntervention, setDateIntervention] = useState(new Date().toISOString().substring(0, 10));
    const [description, setDescription] = useState("");
    const [technicien, setTechnicien] = useState("");
    const [cout, setCout] = useState("");

    // Reprogrammation
    const [prochaineMaintenanceKm, setProchaineMaintenanceKm] = useState("");
    const [prochaineMaintenanceDate, setProchaineMaintenanceDate] = useState("");

    const vehicules = useQuery(api.logistique.vehicules.listerVehicules, { userId: user?._id as any, statut: "tous" });
    const equipements = useQuery(api.logistique.equipements.listerEquipements, { userId: user?._id as any, statut: "tous" });
    const enregistrer = useMutation(api.logistique.maintenances.enregistrerIntervention);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await enregistrer({
                userId: user?._id as any,
                entiteType: typeEntite,
                entiteId: entiteId,
                typeIntervention,
                dateIntervention: new Date(dateIntervention).getTime(),
                description,
                technicien,
                cout: cout ? parseInt(cout) : undefined,
                prochaineMaintenanceKm: prochaineMaintenanceKm ? parseInt(prochaineMaintenanceKm) : undefined,
                prochaineMaintenanceDate: prochaineMaintenanceDate ? new Date(prochaineMaintenanceDate).getTime() : undefined
            });
            toast.success("Rapport d'intervention enregistré et entité mise à jour");
            router.push('/logistique/maintenances');
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de l'enregistrement");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Rapport d'Intervention</h1>
                    <p className="text-muted-foreground mt-1">Saisie d'une fiche d'entretien, de réparation ou de calibration.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50/50 border-b">
                        <CardTitle className="text-lg flex items-center gap-2"><CalendarClock className="w-5 h-5" /> Entité & Qualification</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Nature du parc ciblé</Label>
                                <Select value={typeEntite} onValueChange={(val: any) => { setTypeEntite(val); setEntiteId(""); }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir le parc" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="vehicule">Flotte Automobile</SelectItem>
                                        <SelectItem value="equipement">Matériel de Laboratoire (LAA)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Sélection du matériel concerné</Label>
                                <Select value={entiteId} onValueChange={setEntiteId} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder={`Sélectionner un ${typeEntite === 'vehicule' ? 'véhicule' : 'équipement'}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {typeEntite === "vehicule" ? (
                                            vehicules?.map(v => (
                                                <SelectItem key={v._id} value={v._id}>
                                                    {v.immatriculation} - {v.marque} {v.modele}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            equipements?.map(e => (
                                                <SelectItem key={e._id} value={e._id}>
                                                    {e.reference} - {e.designation} (Labo: {e.laboratoire})
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Type d'opération</Label>
                                <Select value={typeIntervention} onValueChange={(val: any) => setTypeIntervention(val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Qualification de l'intervention" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="preventive">Entretien Préventif</SelectItem>
                                        <SelectItem value="corrective">Réparation / Corrective</SelectItem>
                                        {typeEntite === "equipement" && <SelectItem value="calibration">Calibration / Métrologie</SelectItem>}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Date constatée</Label>
                                <Input type="date" value={dateIntervention} onChange={e => setDateIntervention(e.target.value)} required />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50/50 border-b">
                        <CardTitle className="text-lg">Détails de Prestation</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 grid gap-6">
                        <div className="space-y-2">
                            <Label>Compte rendu d'intervention</Label>
                            <Textarea
                                placeholder="Détail des pièces remplacées, mesures de calibrations relevées, etc."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                required
                                rows={4}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Garage, Prestataire ou Technicien</Label>
                                <Input placeholder="Nom du tiers" value={technicien} onChange={e => setTechnicien(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Coût de l'opération (FCFA) - Optionnel</Label>
                                <Input type="number" placeholder="0" value={cout} onChange={e => setCout(e.target.value)} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200 border-l-4 border-l-orange-500">
                    <CardHeader className="bg-orange-50/50 border-b">
                        <CardTitle className="text-lg text-orange-900">Programmation Consécutive (Reprise)</CardTitle>
                        <CardDescription className="text-orange-700/80">Quand devra avoir lieu la prochaine révision ou calibration ?</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {typeEntite === "vehicule" && (
                                <div className="space-y-2">
                                    <Label>Prochain Odomètre de service (Km)</Label>
                                    <Input type="number" placeholder="Ex: 85000" value={prochaineMaintenanceKm} onChange={e => setProchaineMaintenanceKm(e.target.value)} />
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label>Date d'échéance temporelle</Label>
                                <Input type="date" value={prochaineMaintenanceDate} onChange={e => setProchaineMaintenanceDate(e.target.value)} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4 mt-8 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
                    <Button type="submit" className="bg-[#1B4F72] hover:bg-[#1B4F72]/90 w-48">
                        <Save className="w-4 h-4 mr-2" /> Clôturer et Archiver
                    </Button>
                </div>
            </form>
        </div>
    );
}
