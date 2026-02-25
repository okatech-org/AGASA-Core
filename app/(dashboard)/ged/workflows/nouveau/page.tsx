"use client";

import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload, FileText, CheckCircle, Info, Waypoints, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export default function NouveauWorkflowPage() {
    const { user } = useAuth();
    const router = useRouter();

    const generateUploadUrl = useMutation(api.ged.courrier.generateUploadUrl); // On réutilise le storage ged
    const initialiserWorkflow = useMutation(api.ged.workflows.initialiserWorkflow);
    const listUsers = useQuery(api.admin.users.list, { userId: user?._id as any });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        titreDocument: "",
        type: "decision_administrative" as "marche_public" | "decision_administrative" | "note_service" | "courrier_sortant",
        montant: "",
    });

    const [valideursIds, setValideursIds] = useState<string[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type !== "application/pdf") {
                toast.error("Format non supporté", { description: "Veuillez uploader un PDF." });
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }
            if (file.size > 15 * 1024 * 1024) { // 15MB
                toast.error("Fichier trop volumineux", { description: "La taille maximum est de 15 Mo." });
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }
            setSelectedFile(file);
        }
    };

    const addValideur = (userId: string) => {
        if (!valideursIds.includes(userId)) {
            setValideursIds([...valideursIds, userId]);
        }
    };

    const removeValideur = (index: number) => {
        const nv = [...valideursIds];
        nv.splice(index, 1);
        setValideursIds(nv);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?._id) return;
        if (!selectedFile) {
            toast.error("Document requis", { description: "Veuillez joindre le document à soumettre au circuit." });
            return;
        }
        if (valideursIds.length === 0) {
            toast.error("Valideur requis", { description: "Veuillez définir au moins une étape de validation." });
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Upload file
            const postUrl = await generateUploadUrl();
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": selectedFile.type },
                body: selectedFile,
            });
            const { storageId } = await result.json();

            // 2. Save Workflow
            const workflowId = await initialiserWorkflow({
                userId: user._id,
                type: formData.type,
                titreDocument: formData.titreDocument,
                montant: formData.type === "marche_public" && formData.montant ? parseFloat(formData.montant) : undefined,
                documentId: storageId,
                valideursIds: valideursIds as any,
            });

            toast.success("Circuit lancé", { description: "Les valideurs ont été notifiés." });
            router.push(`/ged/workflows/${workflowId}`);

        } catch (error: any) {
            toast.error("Erreur", { description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-4 border-b pb-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Initialiser un Circuit de Validation</h1>
                    <p className="text-muted-foreground text-sm">Définissez le parcours de validation de votre document</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Colonne gauche (2/3) : Détails et Fichier */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-2 border-[#1B4F72]/10 bg-slate-50/50">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Upload className="h-5 w-5 text-[#1B4F72]" /> Document Original <span className="text-red-500">*</span>
                            </CardTitle>
                            <CardDescription>Uploader le document PDF supportant le workflow.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-24 w-full sm:w-48 flex-col gap-2 border-dashed bg-white"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <FileText className="h-6 w-6 text-muted-foreground" />
                                    <span>Parcourir (PDF)</span>
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                />
                                {selectedFile && (
                                    <div className="flex-1 w-full p-4 bg-white border rounded-md flex items-center gap-3 shadow-sm">
                                        <CheckCircle className="h-8 w-8 text-emerald-500" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{selectedFile.name}</p>
                                            <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} Mo</p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                            className="ml-auto text-red-500 hover:text-red-700"
                                        >
                                            Retirer
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Informations du document</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nature du Workflow</Label>
                                <Select value={formData.type} onValueChange={(v: "marche_public" | "decision_administrative" | "note_service" | "courrier_sortant") => setFormData({ ...formData, type: v, montant: "" })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="decision_administrative">Décision Administrative</SelectItem>
                                        <SelectItem value="note_service">Note de Service</SelectItem>
                                        <SelectItem value="marche_public">Marché Public / Contrat</SelectItem>
                                        <SelectItem value="courrier_sortant">Courrier Sortant (Validation)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Titre / Objet du document <span className="text-red-500">*</span></Label>
                                <Input
                                    required
                                    placeholder="Ex: Décision N°45 portant affectation..."
                                    value={formData.titreDocument}
                                    onChange={(e) => setFormData({ ...formData, titreDocument: e.target.value })}
                                />
                            </div>

                            {formData.type === "marche_public" && (
                                <div className="space-y-2">
                                    <Label>Montant du marché (FCFA) <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="number"
                                        required
                                        placeholder="Ex: 15000000"
                                        value={formData.montant}
                                        onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Colonne droite (1/3) : Parcours de validation */}
                <div className="space-y-6">
                    <Card className="border-[#1B4F72]/20 shadow-md overflow-visible relative">
                        <div className="absolute -top-3 -right-3 bg-[#1B4F72] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow">
                            {valideursIds.length}
                        </div>
                        <CardHeader className="pb-4 border-b bg-slate-50 rounded-t-lg">
                            <CardTitle className="text-lg flex items-center gap-2 text-[#1B4F72]">
                                <Waypoints className="h-5 w-5" /> Parcours de Validation
                            </CardTitle>
                            <CardDescription>
                                Définissez l'ordre chronologique des signataires.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            {/* Liste des étapes */}
                            {valideursIds.length === 0 ? (
                                <div className="text-sm text-muted-foreground text-center p-4 border border-dashed rounded bg-slate-50 italic">
                                    Aucune étape définie. Ajoutez un valideur ci-dessous.
                                </div>
                            ) : (
                                <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                    {valideursIds.map((vId, idx) => {
                                        const userObj = listUsers?.find(u => u._id === vId);
                                        return (
                                            <div key={`${vId}-${idx}`} className="relative flex items-center justify-between p-3 bg-white border border-slate-200 shadow-sm rounded-md group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-[#1B4F72] text-white text-xs flex items-center justify-center font-bold relative z-10 shadow-sm">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold">{userObj?.prenom} {userObj?.nom}</p>
                                                        <p className="text-[10px] text-muted-foreground uppercase">{(userObj as any)?.poste} ({userObj?.direction})</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 group-hover:text-red-500"
                                                    onClick={() => removeValideur(idx)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Selecteur pour ajouter */}
                            <div className="pt-4 border-t mt-4">
                                <Label className="text-xs text-muted-foreground uppercase mb-2 block">Ajouter une étape</Label>
                                <Select onValueChange={addValideur} value="">
                                    <SelectTrigger className="border-dashed bg-slate-50 font-medium">
                                        <SelectValue placeholder="Sélectionner un signataire..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {listUsers?.filter(u => u.statut === "actif").map((u: any) => (
                                            <SelectItem key={u._id} value={u._id} disabled={valideursIds.includes(u._id)}>
                                                {u.prenom} {u.nom} - <span className="text-xs text-muted-foreground">{u.poste}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Button type="submit" className="w-full bg-[#1B4F72] hover:bg-[#1B4F72]/90 h-12 shadow-md" disabled={isSubmitting}>
                        {isSubmitting ? (
                            "Lancement du circuit..."
                        ) : (
                            <><Save className="mr-2 h-4 w-4" /> Initialiser le Workflow</>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
