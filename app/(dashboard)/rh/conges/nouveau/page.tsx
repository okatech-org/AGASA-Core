"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function NouveauCongePage() {
    const { user } = useAuth();
    const router = useRouter();
    const sumetConge = useMutation(api.rh.conges.create);

    // Simuler le solde 
    const selfServiceData = useQuery(api.rh.selfService.getDashboardInfo, user?._id ? { userId: user._id } : "skip");

    const [formData, setFormData] = useState({
        type: "annuel" as any,
        dateDebut: "",
        dateFin: "",
        motif: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calcul approximatif des jours (sans exclure week-end par simplicité)
    const computeDays = () => {
        if (!formData.dateDebut || !formData.dateFin) return 0;
        const start = new Date(formData.dateDebut).getTime();
        const end = new Date(formData.dateFin).getTime();
        const diff = end - start;
        return Math.max(1, Math.ceil(diff / (1000 * 3600 * 24)) + 1);
    };

    const days = computeDays();
    const solde = selfServiceData?.soldeConges ?? 30;

    const handleSubmit = async (isDraft: boolean) => {
        if (!user?._id) return;
        if (!formData.dateDebut || !formData.dateFin) return toast.error("Veuillez sélectionner les dates.");
        if (formData.type === "annuel" && days > solde) return toast.error("Solde de congés insuffisant.");

        setIsSubmitting(true);
        try {
            await sumetConge({
                userId: user._id,
                type: formData.type,
                dateDebut: new Date(formData.dateDebut).getTime(),
                dateFin: new Date(formData.dateFin).getTime(),
                nombreJours: days,
                motif: formData.motif,
                isDraft
            });
            toast.success(isDraft ? "Brouillon enregistré" : "Demande soumise avec succès");
            router.push("/rh/conges");
        } catch (error: any) {
            toast.error("Erreur", { description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Nouvelle Demande</h1>
                    <p className="text-muted-foreground text-sm">Déposer une demande d'absence</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Formulaire de demande</CardTitle>
                            <CardDescription>Remplissez les détails de la période d'absence souhaitée.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Type de congé</Label>
                                <Select value={formData.type} onValueChange={(val: any) => setFormData({ ...formData, type: val })}>
                                    <SelectTrigger><SelectValue placeholder="Sélectionner le motif..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="annuel">Congé Annuel</SelectItem>
                                        <SelectItem value="maladie">Congé Maladie</SelectItem>
                                        <SelectItem value="maternite">Congé Maternité</SelectItem>
                                        <SelectItem value="paternite">Congé Paternité</SelectItem>
                                        <SelectItem value="formation">Congé Formation</SelectItem>
                                        <SelectItem value="exceptionnel">Exceptionnel (Mariage, Décès)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date de début</Label>
                                    <Input type="date" min={new Date().toISOString().split('T')[0]} value={formData.dateDebut} onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Date de fin</Label>
                                    <Input type="date" min={formData.dateDebut} value={formData.dateFin} onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })} />
                                </div>
                            </div>

                            {days > 0 && (
                                <Alert className="bg-muted/50">
                                    <AlertTitle>Résumé de la demande</AlertTitle>
                                    <AlertDescription>
                                        Vous demandez <strong>{days} jour(s)</strong> de congé, incluant les potentiels week-ends.
                                        {formData.type === "annuel" && (
                                            <span className={`block mt-1 ${days > solde ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                                                Solde après validation : {solde - days} jour(s)
                                            </span>
                                        )}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label>Motif / Justificatif (Optionnel)</Label>
                                <Textarea
                                    placeholder="Ex: Voyage familial..."
                                    value={formData.motif}
                                    onChange={(e: any) => setFormData({ ...formData, motif: e.target.value })}
                                    rows={4}
                                />
                                <p className="text-xs text-muted-foreground">Une pièce justificative pourra être demandée par la RH pour les motifs maladie ou exceptionnels.</p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t p-6 bg-muted/10">
                            <Button variant="outline" onClick={() => handleSubmit(true)} disabled={isSubmitting}>
                                <Save className="mr-2 h-4 w-4" /> Sauvegarder Brouillon
                            </Button>
                            <Button onClick={() => handleSubmit(false)} disabled={isSubmitting || (formData.type === "annuel" && days > solde) || days === 0} className="bg-[#1B4F72] hover:bg-[#1B4F72]/90">
                                Soumettre au N+1 <Send className="ml-2 h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Mon Solde (Annuel)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center">
                                <span className="text-5xl font-bold block text-[#27AE60]">{solde}</span>
                                <span className="text-muted-foreground text-sm uppercase font-semibold">Jours Restants</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Workflow</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative border-l ml-2 space-y-4 pb-2">
                                <div className="relative pl-5">
                                    <div className="absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                                    <p className="text-sm font-semibold">1. Soumission</p>
                                    <p className="text-xs text-muted-foreground">Par l'Agent</p>
                                </div>
                                <div className="relative pl-5">
                                    <div className="absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full bg-muted-foreground ring-4 ring-background" />
                                    <p className="text-sm font-semibold text-muted-foreground">2. Validation N+1</p>
                                    <p className="text-xs text-muted-foreground">Chef de Service / Directeur</p>
                                </div>
                                <div className="relative pl-5">
                                    <div className="absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full bg-muted-foreground ring-4 ring-background" />
                                    <p className="text-sm font-semibold text-muted-foreground">3. Accord DRH</p>
                                    <p className="text-xs text-muted-foreground">Direction Administrative</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
