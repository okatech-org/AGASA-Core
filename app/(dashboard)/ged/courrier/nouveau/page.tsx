"use client";

import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload, FileText, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export default function NouveauCourrierPage() {
    const { user } = useAuth();
    const router = useRouter();

    const generateUploadUrl = useMutation(api.ged.courrier.generateUploadUrl);
    const creerCourrier = useMutation(api.ged.courrier.creerCourrier);
    const listUsers = useQuery(api.admin.users.list, { userId: user?._id as any });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        reference: "",
        type: "entrant" as "entrant" | "sortant",
        categorie: "courrier_officiel" as any,
        emetteur: "",
        destinataire: "",
        objet: "",
        priorite: "normal" as any,
        confidentiel: false,
        tags: "",
    });

    const [selectedDestinataires, setSelectedDestinataires] = useState<string[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type !== "application/pdf" && !file.type.startsWith('image/')) {
                toast.error("Format non supporté", { description: "Veuillez uploader un PDF ou une image." });
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB
                toast.error("Fichier trop volumineux", { description: "La taille maximum est de 10 Mo." });
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleDestinataireToggle = (userId: string) => {
        if (selectedDestinataires.includes(userId)) {
            setSelectedDestinataires(selectedDestinataires.filter(id => id !== userId));
        } else {
            setSelectedDestinataires([...selectedDestinataires, userId]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?._id) return;
        if (!selectedFile) {
            toast.error("Document requis", { description: "Veuillez joindre le document numérisé." });
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

            // 2. Format tags
            const tagsList = formData.tags
                .split(",")
                .map(t => t.trim().toLowerCase())
                .filter(Boolean);

            // 3. Save Courier
            const courrierId = await creerCourrier({
                userId: user._id,
                reference: formData.reference,
                type: formData.type,
                categorie: formData.categorie,
                emetteur: formData.emetteur,
                destinataire: formData.destinataire,
                objet: formData.objet,
                priorite: formData.priorite,
                dateDocument: Date.now(),
                confidentiel: formData.confidentiel,
                tags: tagsList,
                documentId: storageId,
                destinatairesIds: selectedDestinataires as any, // Array of User IDs
            });

            toast.success("Succès", { description: "Le courrier a été numérisé et enregistré." });
            router.push(`/ged/courrier/${courrierId}`);

        } catch (error: any) {
            toast.error("Erreur d'enregistrement", { description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isAdmin = ["admin_systeme", "directeur_general", "directeur"].includes(user?.role || "") || user?.demoSimulatedRole === "admin_systeme";
    const serviceName = isAdmin ? "Bureau d'Ordre" : user?.direction || "Interne";


    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-4 mb-4 border-b pb-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Numériser un Courrier</h1>
                    <p className="text-muted-foreground text-sm">Enregistrement dans la Gestion Électronique des Documents</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section Fichier */}
                <Card className="border-2 border-[#1B4F72]/10 bg-slate-50/50">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Upload className="h-5 w-5 text-[#1B4F72]" /> Document numérisé <span className="text-red-500">*</span>
                        </CardTitle>
                        <CardDescription>Format PDF ou Image (Max 10 Mo)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-24 w-48 flex-col gap-2 border-dashed"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <FileText className="h-6 w-6 text-muted-foreground" />
                                <span>Parcourir</span>
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="application/pdf,image/*"
                                onChange={handleFileChange}
                            />
                            {selectedFile && (
                                <div className="flex-1 p-4 bg-white border rounded-md flex items-center gap-3">
                                    <CheckCircle className="h-8 w-8 text-emerald-500" />
                                    <div>
                                        <p className="font-medium text-sm">{selectedFile.name}</p>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Informations générales</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nature du flux</Label>
                                    <Select value={formData.type} onValueChange={(v: "entrant" | "sortant") => setFormData({ ...formData, type: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="entrant">Courrier Entrant</SelectItem>
                                            <SelectItem value="sortant">Courrier Sortant</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Numéro de Référence (Optionnel)</Label>
                                    <Input
                                        placeholder="Ex: REF-2026-001"
                                        value={formData.reference}
                                        onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                    />
                                    <p className="text-[10px] text-muted-foreground">Laissez vide pour auto-générer</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Émetteur <span className="text-red-500">*</span></Label>
                                <Input
                                    placeholder={formData.type === "entrant" ? "Nom de l'organisme externe ou expéditeur" : serviceName}
                                    required
                                    value={formData.emetteur}
                                    onChange={(e) => setFormData({ ...formData, emetteur: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Destinataire (Texte brut) <span className="text-red-500">*</span></Label>
                                <Input
                                    placeholder={formData.type === "entrant" ? serviceName : "Nom de l'organisme externe destinataire"}
                                    required
                                    value={formData.destinataire}
                                    onChange={(e) => setFormData({ ...formData, destinataire: e.target.value })}
                                />
                            </div>

                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Détails et Classification</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Objet du document <span className="text-red-500">*</span></Label>
                                <Input
                                    required
                                    value={formData.objet}
                                    onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Catégorie</Label>
                                    <Select value={formData.categorie} onValueChange={(v) => setFormData({ ...formData, categorie: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="courrier_officiel">Courrier Officiel</SelectItem>
                                            <SelectItem value="demande">Demande (Agrément...)</SelectItem>
                                            <SelectItem value="plainte">Plainte / Réclamation</SelectItem>
                                            <SelectItem value="notification">Notification / Arrêté</SelectItem>
                                            <SelectItem value="autre">Autre</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Priorité de traitement</Label>
                                    <Select value={formData.priorite} onValueChange={(v) => setFormData({ ...formData, priorite: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                            <SelectItem value="important">Important</SelectItem>
                                            <SelectItem value="normal">Normal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Mots-clés (séparés par des virgules)</Label>
                                <Input
                                    placeholder="ex: facture, douane, 2026"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Circuit de diffusion */}
                <Card>
                    <CardHeader className="pb-4 border-b">
                        <CardTitle className="text-lg">Circuit de diffusion interne</CardTitle>
                        <CardDescription>
                            Sélectionnez les utilisateurs internes à AGASA qui doivent lire et traiter ce courrier.
                            <br />Si personne n'est sélectionné, seul le Bureau d'Ordre et vous y aurez accès.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {listUsers === undefined ? (
                            <div className="text-sm text-muted-foreground">Chargement de l'annuaire...</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {listUsers.filter(u => u._id !== user?._id).map((u: any) => (
                                    <div
                                        key={u._id}
                                        className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-colors ${selectedDestinataires.includes(u._id) ? 'bg-blue-50 border-blue-300' : 'hover:bg-muted/50'}`}
                                        onClick={() => handleDestinataireToggle(u._id)}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${selectedDestinataires.includes(u._id) ? 'bg-blue-600 border-blue-600' : 'border-input bg-background'}`}>
                                            {selectedDestinataires.includes(u._id) && <CheckCircle className="w-3 h-3 text-white" />}
                                        </div>
                                        <div className="flex-1 truncate">
                                            <p className="text-sm font-medium leading-none">{u.prenom} {u.nom}</p>
                                            <p className="text-xs text-muted-foreground mt-1 truncate">{u.direction} - {u.poste}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>Annuler</Button>
                    <Button type="submit" className="bg-[#1B4F72] hover:bg-[#1B4F72]/90" disabled={isSubmitting}>
                        {isSubmitting ? (
                            "Enregistrement..."
                        ) : (
                            <><Save className="mr-2 h-4 w-4" /> Enregistrer le courrier</>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
