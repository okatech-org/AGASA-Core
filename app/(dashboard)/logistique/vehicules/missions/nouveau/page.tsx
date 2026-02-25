"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation, MapPin, Calendar, Clock, Car } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export default function DepartMissionPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form data
    const [vehiculeId, setVehiculeId] = useState<string>("");
    const [conducteurId, setConducteurId] = useState<string>("");
    const [destination, setDestination] = useState("");
    const [motif, setMotif] = useState("");
    const [dateRetour, setDateRetour] = useState("");

    // On va seulement chercher les véhicules disponibles
    const vehiculesDispos = useQuery(api.logistique.vehicules.listerVehicules, {
        userId: user?._id as any,
        statut: "disponible"
    });

    // On simule une liste d'agents pour l'instant (la vraie query est dans rh.agents)
    const agents = useQuery(api.rh.agents.listAgents, { userId: user?._id as any, statut: "actif" });

    const assignerMission = useMutation(api.logistique.vehicules.assignerMission);

    // Auto-fill kilometrage for selected car
    const selectedCar = (vehiculesDispos || []).find(v => v._id === vehiculeId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?._id || !selectedCar || !conducteurId) return;

        setIsSubmitting(true);
        try {
            await assignerMission({
                userId: user._id,
                vehiculeId: vehiculeId as Id<"vehicules">,
                conducteurId: conducteurId as Id<"agents">,
                destination,
                motif,
                dateDepart: Date.now(),
                dateRetourPrevue: new Date(dateRetour).getTime(),
                kmDepart: selectedCar.kilometrage
            });

            toast.success("Ordre de mission enregistré", { description: `Le véhicule ${selectedCar.immatriculation} est maintenant en mission.` });
            router.push('/logistique/vehicules/liste');
        } catch (error: any) {
            toast.error("Erreur", { description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 pt-4">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Navigation className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Autorisation de Sortie (Mission)</h1>
                    <p className="text-muted-foreground text-sm">Assigner un véhicule disponible de la flotte à un inspecteur.</p>
                </div>
            </div>

            <Card className="shadow-sm border-slate-200">
                <form onSubmit={handleSubmit}>
                    <CardHeader className="bg-slate-50/50 border-b">
                        <CardTitle className="text-lg">Détails de Déploiement</CardTitle>
                        <CardDescription>Tous les champs sont requis pour le traçage logistique.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">

                        {/* Section Matériel & RH */}
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-4">
                            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                                <Car className="w-4 h-4" /> Actifs déployés
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Véhicule assigné (Disponibles)</Label>
                                    <Select value={vehiculeId} onValueChange={setVehiculeId} required>
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="Sélectionnez un véhicule..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vehiculesDispos?.map(v => (
                                                <SelectItem key={v._id} value={v._id}>
                                                    {v.immatriculation} — {v.marque} {v.modele} ({v.kilometrage} km)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Conducteur (Agent Assermenté)</Label>
                                    <Select value={conducteurId} onValueChange={setConducteurId} required>
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="Sélectionnez un agent..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {agents?.map(a => (
                                                <SelectItem key={a._id} value={a._id}>
                                                    {a.user ? `${a.user.prenom} ${a.user.nom}` : "Agent Inconnu"} - {a.poste}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {selectedCar && (
                                <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded flex justify-between items-center border border-blue-100">
                                    <span>Kilométrage de sortie généré à partir de l'ODO actuel :</span>
                                    <span className="font-bold text-sm">{selectedCar.kilometrage.toLocaleString("fr-FR")} km</span>
                                </div>
                            )}
                        </div>

                        {/* Section Mission */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-2 border-b pb-2">
                                <MapPin className="w-4 h-4" /> Destinaton & Motif
                            </h3>

                            <div className="space-y-2">
                                <Label>Lieu / Zone de déploiement</Label>
                                <Input
                                    placeholder="Ex: Nkok (ZERP), Port d'Owendo, etc."
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Motif de la mission technique</Label>
                                <Input
                                    placeholder="Ex: Inspection phytosanitaire navire Cargo, Fraude douanière..."
                                    value={motif}
                                    onChange={(e) => setMotif(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 opacity-60">
                                    <Label>Date/Heure Départ</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input value="Maintenant (Automatique)" disabled className="pl-9 bg-slate-50" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Date de Retour Prévue</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="date"
                                            className="pl-9"
                                            value={dateRetour}
                                            onChange={(e) => setDateRetour(e.target.value)}
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end gap-3 border-t">
                            <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
                            <Button type="submit" className="bg-[#1B4F72] hover:bg-[#1B4F72]/90" disabled={isSubmitting || !selectedCar || !conducteurId}>
                                {isSubmitting ? "Validation..." : "Signer l'ordre de mission"}
                            </Button>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}
