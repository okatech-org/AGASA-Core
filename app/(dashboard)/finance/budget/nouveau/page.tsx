"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Building2, Save, ArrowLeft, PiggyBank } from "lucide-react";

export default function NouvelleLigneBudgetairePage() {
    const { user } = useAuth();
    const router = useRouter();

    const [code, setCode] = useState("");
    const [libelle, setLibelle] = useState("");
    const [programme, setProgramme] = useState("");
    const [direction, setDirection] = useState("");
    const [province, setProvince] = useState("Estuaire");
    const [montantAlloue, setMontantAlloue] = useState("");
    const [exercice, setExercice] = useState(new Date().getFullYear().toString());

    const ajouterLigne = useMutation(api.finance.budget.ajouterLigne);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await ajouterLigne({
                userId: user?._id as any,
                code,
                libelle,
                programme,
                direction,
                province,
                montantAlloue: parseInt(montantAlloue),
                exercice: parseInt(exercice)
            });
            toast.success("Ligne budgétaire créée avec succès");
            router.push('/finance/budget');
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la création");
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-slate-900 pl-3">Saisie Budgétaire</h1>
                    <p className="text-muted-foreground mt-1">Allocation de crédits et enregistrement d'une nouvelle ligne comptable.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50/50 border-b">
                        <CardTitle className="text-lg flex items-center gap-2"><PiggyBank className="w-5 h-5" /> Paramètres de l'Allocation</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Exercice Comptable</Label>
                                <Select value={exercice} onValueChange={setExercice}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Année" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={(new Date().getFullYear()).toString()}>{new Date().getFullYear()}</SelectItem>
                                        <SelectItem value={(new Date().getFullYear() + 1).toString()}>{new Date().getFullYear() + 1}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Code Imputation</Label>
                                <Input placeholder="Ex: 612-44-AB" value={code} onChange={e => setCode(e.target.value)} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Libellé complet de la ligne</Label>
                            <Input placeholder="Description de la dépense ou du poste..." value={libelle} onChange={e => setLibelle(e.target.value)} required />
                        </div>

                        <div className="space-y-2">
                            <Label>Montant Alloué (FCFA)</Label>
                            <Input type="number" placeholder="Ex: 5000000" min="0" value={montantAlloue} onChange={e => setMontantAlloue(e.target.value)} required className="font-mono font-medium text-lg text-emerald-700" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50/50 border-b">
                        <CardTitle className="text-lg flex items-center gap-2"><Building2 className="w-5 h-5" /> Imputation Structurelle</CardTitle>
                        <CardDescription>Quelle entité de l'AGASA est concernée ?</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 grid gap-6">
                        <div className="space-y-2">
                            <Label>Programme concerné</Label>
                            <Input placeholder="Ex: Inspection Sanitaire, Pilotage..." value={programme} onChange={e => setProgramme(e.target.value)} required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Direction Centrale</Label>
                                <Select value={direction} onValueChange={setDirection} required>
                                    <SelectTrigger><SelectValue placeholder="Sélectionner la DA/DC" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Direction Générale">Direction Générale</SelectItem>
                                        <SelectItem value="DAF">Direction Administrative & Financière</SelectItem>
                                        <SelectItem value="DIPQ">Direction de l'Inspection et Promotion</SelectItem>
                                        <SelectItem value="LAA">Laboratoire d'Analyse (LAA)</SelectItem>
                                        <SelectItem value="DRH">Ressources Humaines</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Délégation Provinciale</Label>
                                <Select value={province} onValueChange={setProvince}>
                                    <SelectTrigger><SelectValue placeholder="Province" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Estuaire">Estuaire (Libreville)</SelectItem>
                                        <SelectItem value="Haut-Ogooué">Haut-Ogooué</SelectItem>
                                        <SelectItem value="Moyen-Ogooué">Moyen-Ogooué</SelectItem>
                                        <SelectItem value="Ngounié">Ngounié</SelectItem>
                                        <SelectItem value="Nyanga">Nyanga</SelectItem>
                                        <SelectItem value="Ogooué-Ivindo">Ogooué-Ivindo</SelectItem>
                                        <SelectItem value="Ogooué-Lolo">Ogooué-Lolo</SelectItem>
                                        <SelectItem value="Ogooué-Maritime">Ogooué-Maritime (Port-Gentil)</SelectItem>
                                        <SelectItem value="Woleu-Ntem">Woleu-Ntem</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4 mt-8 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
                    <Button type="submit" className="bg-slate-900 hover:bg-slate-800 w-48">
                        <Save className="w-4 h-4 mr-2" /> Valider l'Allocation
                    </Button>
                </div>
            </form>
        </div>
    );
}
