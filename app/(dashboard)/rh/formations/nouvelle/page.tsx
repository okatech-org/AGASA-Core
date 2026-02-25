"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function NouvelleFormationPage() {
    const { user } = useAuth();
    const router = useRouter();
    const createFormation = useMutation(api.rh.formations.create);

    const [formData, setFormData] = useState({
        titre: "",
        description: "",
        categorie: "HACCP" as any,
        duree: 8,
        formateur: "",
        lieu: "",
        dateDebut: "",
        dateFin: "",
        capaciteMax: 20,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const checkAccess = () => {
        return user?.role === "admin_systeme" || user?.direction === "DAF" || user?.demoSimulatedRole === "admin_systeme";
    };

    if (!user || !checkAccess()) {
        return (
            <div className="max-w-2xl mx-auto mt-10">
                <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Accès Restreint</AlertTitle>
                    <AlertDescription>
                        Seuls les membres de la DAF ou de la Direction Générale peuvent planifier de nouvelles formations.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const handleSubmit = async () => {
        if (!formData.titre || !formData.dateDebut || !formData.dateFin) {
            return toast.error("Veuillez remplir les champs obligatoires.");
        }

        setIsSubmitting(true);
        try {
            await createFormation({
                adminId: user._id,
                titre: formData.titre,
                description: formData.description || "Aucune description fournie.",
                categorie: formData.categorie,
                duree: formData.duree,
                formateur: formData.formateur || "Non assigné",
                lieu: formData.lieu || "À définir",
                dateDebut: new Date(formData.dateDebut).getTime(),
                dateFin: new Date(formData.dateFin).getTime(),
                capaciteMax: formData.capaciteMax,
            });
            toast.success("Formation créée", { description: "La session est désormais visible dans le catalogue." });
            router.push("/rh/formations");
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
                    <h1 className="text-2xl font-bold tracking-tight">Planifier une Formation</h1>
                    <p className="text-muted-foreground text-sm">Création d'une nouvelle session dans le catalogue RH</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Détails de la session</CardTitle>
                    <CardDescription>Renseignez les informations pédagogiques et logistiques.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Titre de la formation <span className="text-red-500">*</span></Label>
                        <Input placeholder="Ex: Maîtrise des normes sanitaires HACCP niveau 1" value={formData.titre} onChange={(e) => setFormData({ ...formData, titre: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Catégorie thématique</Label>
                            <Select value={formData.categorie} onValueChange={(val: any) => setFormData({ ...formData, categorie: val })}>
                                <SelectTrigger><SelectValue placeholder="Catégorie..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HACCP">Procédure HACCP</SelectItem>
                                    <SelectItem value="ISO_22000">Norme ISO 22000</SelectItem>
                                    <SelectItem value="ISO_17025">Norme ISO 17025</SelectItem>
                                    <SelectItem value="culture_numerique">Culture Numérique</SelectItem>
                                    <SelectItem value="securite">Hygiène & Sécurité</SelectItem>
                                    <SelectItem value="management">Management & RH</SelectItem>
                                    <SelectItem value="autre">Autre Thématique</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Intervenant / Formateur</Label>
                            <Input placeholder="Nom du formateur ou cabinet..." value={formData.formateur} onChange={(e) => setFormData({ ...formData, formateur: e.target.value })} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Description <span className="text-red-500">*</span></Label>
                        <Textarea
                            placeholder="Objectifs, programme, prérequis..."
                            rows={4}
                            value={formData.description}
                            onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-md border">
                        <div className="space-y-2">
                            <Label>Date de début <span className="text-red-500">*</span></Label>
                            <Input type="date" value={formData.dateDebut} onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Date de fin <span className="text-red-500">*</span></Label>
                            <Input type="date" value={formData.dateFin} onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Lieu de la formation</Label>
                            <Input placeholder="Ex: Salle B3, Siège AGASA" value={formData.lieu} onChange={(e) => setFormData({ ...formData, lieu: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                                <Label>Durée (H)</Label>
                                <Input type="number" min="1" value={formData.duree} onChange={(e) => setFormData({ ...formData, duree: parseInt(e.target.value) || 0 })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Capacité / Inscrits MAX</Label>
                                <Input type="number" min="1" value={formData.capaciteMax} onChange={(e) => setFormData({ ...formData, capaciteMax: parseInt(e.target.value) || 20 })} />
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-3 bg-muted/10 border-t p-6">
                    <Button variant="outline" onClick={() => router.back()} disabled={isSubmitting}>Annuler</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-[#1B4F72] hover:bg-[#1B4F72]/90">
                        {isSubmitting ? "Création en cours..." : "Valider et Publier"} <Save className="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
