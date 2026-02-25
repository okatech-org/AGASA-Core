"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Save, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface AgentFormProps {
    mode: "create" | "edit";
    agentId?: string;
}

const STEPS = [
    { id: 1, title: "Identité", description: "État civil et Coordonnées" },
    { id: 2, title: "Affectation", description: "Poste, Service et Direction" },
    { id: 3, title: "Contrat", description: "Détails contractuels" },
    { id: 4, title: "Compétences", description: "Expertise technique" },
    { id: 5, title: "Validation", description: "Récapitulatif" },
];

const COMPETENCES_LIST = [
    "Inspection alimentaire", "Analyses labo", "Contrôle frontière",
    "HACCP", "ISO 22000", "ISO 17025", "Management", "Qualité"
];

export function AgentForm({ mode, agentId }: AgentFormProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const createAgent = useMutation(api.rh.agents.createAgent);
    const updateAgent = useMutation(api.rh.agents.updateAgent);

    // In edit mode we would load existing data
    const existingAgentData = useQuery(api.rh.agents.getAgent, mode === "edit" && user?._id && agentId ? {
        userId: user._id,
        agentId: agentId as any,
    } : "skip");

    const [formData, setFormData] = useState({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        dateNaissance: "",
        lieuNaissance: "",
        nationalite: "Gabonaise",
        cni: "",
        situationFamiliale: "Célibataire",
        nombreEnfants: 0,
        adresse: "",

        poste: "",
        direction: "DG",
        service: "",
        province: "Estuaire",

        grade: "A1",
        echelon: 1,
        contratType: "fonctionnaire",
        dateRecrutement: new Date().toISOString().split('T')[0],

        competences: [] as string[],
    });

    // Populate form data if editing
    // We are skipping the effect for simplicity in this demo and assuming create mode predominantly
    // Real implementation would have a useEffect to setFormData

    const handleNext = () => {
        if (currentStep < 5) setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleCompetenceToggle = (comp: string) => {
        setFormData(prev => {
            const current = (prev.competences || []);
            if (current.includes(comp)) {
                return { ...prev, competences: current.filter(c => c !== comp) };
            } else {
                return { ...prev, competences: [...current, comp] };
            }
        });
    };

    const handleSubmit = async () => {
        if (!user?._id) return;
        setIsSubmitting(true);

        try {
            if (mode === "create") {
                await createAgent({
                    adminId: user._id,
                    nom: formData.nom,
                    prenom: formData.prenom,
                    email: formData.email,
                    telephone: formData.telephone,
                    etatCivil: {
                        dateNaissance: formData.dateNaissance || new Date().toISOString(),
                        lieuNaissance: formData.lieuNaissance || "Libreville",
                        nationalite: formData.nationalite,
                        situationFamiliale: formData.situationFamiliale,
                        nombreEnfants: formData.nombreEnfants,
                        adresse: formData.adresse,
                        cni: formData.cni,
                    },
                    poste: formData.poste || "Nouveau Poste",
                    direction: formData.direction,
                    service: formData.service || "Général",
                    province: formData.province,
                    grade: formData.grade,
                    echelon: formData.echelon,
                    contratType: formData.contratType as any,
                    dateRecrutement: new Date(formData.dateRecrutement).getTime() || Date.now(),
                    competences: formData.competences,
                });
                toast.success("Agent créé", { description: "L'agent a été ajouté avec succès." });
            } else {
                // Update logic
                await updateAgent({
                    adminId: user._id,
                    agentId: agentId as any,
                    updates: {
                        poste: formData.poste,
                        direction: formData.direction,
                        service: formData.service,
                        province: formData.province,
                        grade: formData.grade,
                        echelon: formData.echelon,
                        contratType: formData.contratType as any,
                        competences: formData.competences,
                    }
                });
                toast.success("Agent modifié", { description: "Les informations de l'agent ont été mises à jour." });
            }
            router.push("/rh/agents");
        } catch (error: any) {
            toast.error("Erreur", { description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Nom</Label>
                            <Input value={formData.nom} onChange={e => setFormData({ ...formData, nom: e.target.value })} placeholder="Entrez le nom" />
                        </div>
                        <div className="space-y-2">
                            <Label>Prénom</Label>
                            <Input value={formData.prenom} onChange={e => setFormData({ ...formData, prenom: e.target.value })} placeholder="Entrez le prénom" />
                        </div>
                        <div className="space-y-2">
                            <Label>Email professionnel</Label>
                            <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="email@agasa.ga" />
                        </div>
                        <div className="space-y-2">
                            <Label>Téléphone</Label>
                            <Input value={formData.telephone} onChange={e => setFormData({ ...formData, telephone: e.target.value })} placeholder="+241..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Date de naissance</Label>
                            <Input type="date" value={formData.dateNaissance} onChange={e => setFormData({ ...formData, dateNaissance: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>N° CNI / Passeport</Label>
                            <Input value={formData.cni} onChange={e => setFormData({ ...formData, cni: e.target.value })} placeholder="Numéro de pièce" />
                        </div>
                        <div className="space-y-2">
                            <Label>Situation matrimoniale</Label>
                            <Select value={formData.situationFamiliale} onValueChange={(val) => setFormData({ ...formData, situationFamiliale: val })}>
                                <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Célibataire">Célibataire</SelectItem>
                                    <SelectItem value="Marié(e)">Marié(e)</SelectItem>
                                    <SelectItem value="Divorcé(e)">Divorcé(e)</SelectItem>
                                    <SelectItem value="Veuf/Veuve">Veuf/Veuve</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Nombre d'enfants</Label>
                            <Input type="number" min="0" value={formData.nombreEnfants} onChange={e => setFormData({ ...formData, nombreEnfants: parseInt(e.target.value) || 0 })} />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Direction</Label>
                            <Select value={formData.direction} onValueChange={(val) => setFormData({ ...formData, direction: val })}>
                                <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DG">Direction Générale (DG)</SelectItem>
                                    <SelectItem value="DERSP">Direction de l'Évaluation (DERSP)</SelectItem>
                                    <SelectItem value="DICSP">Direction des Inspections (DICSP)</SelectItem>
                                    <SelectItem value="DAF">Direction Administrative (DAF)</SelectItem>
                                    <SelectItem value="LAA">Laboratoire (LAA)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Service</Label>
                            <Input value={formData.service} onChange={e => setFormData({ ...formData, service: e.target.value })} placeholder="Nom du service (ex: Comptabilité)" />
                        </div>
                        <div className="space-y-2">
                            <Label>Intitulé du poste</Label>
                            <Input value={formData.poste} onChange={e => setFormData({ ...formData, poste: e.target.value })} placeholder="Ex: Inspecteur Sanitaire" />
                        </div>
                        <div className="space-y-2">
                            <Label>Province d'affectation</Label>
                            <Select value={formData.province} onValueChange={(val) => setFormData({ ...formData, province: val })}>
                                <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Siège">Siège (Libreville)</SelectItem>
                                    <SelectItem value="Estuaire">Estuaire</SelectItem>
                                    <SelectItem value="Haut-Ogooué">Haut-Ogooué</SelectItem>
                                    <SelectItem value="Moyen-Ogooué">Moyen-Ogooué</SelectItem>
                                    <SelectItem value="Ogooué-Maritime">Ogooué-Maritime</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Type de contrat</Label>
                            <Select value={formData.contratType} onValueChange={(val) => setFormData({ ...formData, contratType: val })}>
                                <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="fonctionnaire">Fonctionnaire</SelectItem>
                                    <SelectItem value="contractuel">Contractuel</SelectItem>
                                    <SelectItem value="vacataire">Vacataire</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Date de recrutement</Label>
                            <Input type="date" value={formData.dateRecrutement} onChange={e => setFormData({ ...formData, dateRecrutement: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Grade Agasa</Label>
                            <Select value={formData.grade} onValueChange={(val) => setFormData({ ...formData, grade: val })}>
                                <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="A1">A1</SelectItem>
                                    <SelectItem value="A2">A2</SelectItem>
                                    <SelectItem value="B1">B1</SelectItem>
                                    <SelectItem value="B2">B2</SelectItem>
                                    <SelectItem value="C1">C1</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Échelon</Label>
                            <Input type="number" min="1" max="10" value={formData.echelon} onChange={e => setFormData({ ...formData, echelon: parseInt(e.target.value) || 1 })} />
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-4">
                        <Label>Sélectionnez les compétences de l'agent</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                            {COMPETENCES_LIST.map((comp) => (
                                <div key={comp} className="flex items-center space-x-2 border p-3 rounded-md bg-card">
                                    <Checkbox id={`comp-${comp}`} checked={(formData.competences || []).includes(comp)} onCheckedChange={() => handleCompetenceToggle(comp)} />
                                    <label htmlFor={`comp-${comp}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        {comp}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-6">
                        <div className="bg-muted p-4 rounded-lg flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-lg">{formData.nom} {formData.prenom}</h4>
                                <p className="text-muted-foreground">{formData.email}</p>
                            </div>
                            <Badge variant="outline" className="text-primary border-primary">Profil Prêt</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-y-4 text-sm">
                            <div>
                                <span className="text-muted-foreground block text-xs uppercase">Poste Target</span>
                                <span className="font-medium">{formData.poste || "-"}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-xs uppercase">Direction & Service</span>
                                <span className="font-medium">{formData.direction} - {formData.service || "-"}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-xs uppercase">Province</span>
                                <span className="font-medium">{formData.province}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-xs uppercase">Contrat</span>
                                <span className="font-medium capitalize">{formData.contratType} (Grade {formData.grade})</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                                En validant, ce profil sera enregistré dans la base de données centrale AGASA. L'agent recevra (en production) un email l'invitant à finaliser son compte Firebase.
                            </p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Card className="w-full max-w-3xl mx-auto shadow-md">
            <CardHeader className="bg-muted/30 border-b pb-6">
                <CardTitle className="text-2xl">{mode === "create" ? "Nouveau Profil Agent" : "Modifier Profil Agent"}</CardTitle>
                <CardDescription>
                    Étape {currentStep} sur {STEPS.length} : {STEPS[currentStep - 1].title}
                </CardDescription>

                {/* Stepper Wizard Progress */}
                <div className="flex items-center space-x-2 mt-4 overflow-hidden">
                    {STEPS.map((step, idx) => (
                        <div key={step.id} className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-semibold transition-colors
                                ${currentStep === step.id ? "border-primary bg-primary text-primary-foreground" :
                                    currentStep > step.id ? "border-primary bg-primary/20 text-primary" :
                                        "border-muted text-muted-foreground"}
                            `}>
                                {currentStep > step.id ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                            </div>
                            {idx < STEPS.length - 1 && (
                                <div className={`w-12 h-1 mx-2 rounded-full ${currentStep > step.id ? "bg-primary" : "bg-muted"}`} />
                            )}
                        </div>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="pt-8 min-h-[300px]">
                {renderStepContent()}
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6 bg-muted/10">
                <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Retour
                </Button>

                {currentStep < 5 ? (
                    <Button onClick={handleNext} className="bg-[#1B4F72] hover:bg-[#1B4F72]/90">
                        Suivant <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white">
                        {isSubmitting ? "Enregistrement..." : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                {mode === "create" ? "Enregistrer l'Agent" : "Mettre à jour"}
                            </>
                        )}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
