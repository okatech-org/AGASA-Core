"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft, User, Briefcase, Award, Star, FileText,
    Mail, Phone, MapPin, Calendar, Building, Edit, Download, Plus, Trash2, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function AgentProfile() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const agentId = params.id as string;

    const agentData = useQuery(api.rh.agents.getAgent, user?._id && agentId ? {
        userId: user._id,
        agentId: agentId as any,
    } : "skip");

    const generateUploadUrl = useMutation(api.rh.agents.generateUploadUrl);
    const saveDocument = useMutation(api.rh.agents.saveDocument);
    const deleteDocument = useMutation(api.rh.agents.deleteDocument);

    const hasWriteAccess = user?.role === "admin_systeme" || user?.role === "directeur_general" || user?.role === "directeur" || user?.role === "chef_service" || user?.demoSimulatedRole === "admin_systeme";

    if (agentData === undefined) {
        return <div className="flex h-48 items-center justify-center text-muted-foreground">Chargement du profil...</div>;
    }

    if (agentData === null) {
        return <div className="flex h-48 items-center justify-center text-red-500">Agent introuvable.</div>;
    }

    const { user: agentUser, documents, ...agent } = agentData as any;

    const getInitials = (nom: string, prenom: string) => {
        return `${prenom?.[0] || ""}${nom?.[0] || ""}`;
    };

    const formatDate = (timestamp: number | string) => {
        if (!timestamp) return "Non renseigné";
        const d = new Date(timestamp);
        return d.toLocaleDateString("fr-FR");
    };

    const getStatusColor = (statut: string) => {
        switch (statut) {
            case "en_poste": return "bg-green-100 text-green-800 border-green-200";
            case "détaché": return "bg-blue-100 text-blue-800 border-blue-200";
            case "suspendu": return "bg-red-100 text-red-800 border-red-200";
            case "retraité": return "bg-gray-100 text-gray-800 border-gray-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user?._id) return;

        setIsUploading(true);
        try {
            const postUrl = await generateUploadUrl();
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const { storageId } = await result.json();

            await saveDocument({
                adminId: user._id,
                agentId: agent._id,
                storageId: storageId,
                nom: file.name,
                type: file.type,
            });

            toast.success("Document ajouté avec succès.");
        } catch (error: any) {
            toast.error("Erreur d'upload", { description: error.message });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDeleteDocument = async (storageId: string) => {
        if (!user?._id) return;
        if (!confirm("Voulez-vous vraiment supprimer ce document ?")) return;
        try {
            await deleteDocument({
                adminId: user._id,
                agentId: agent._id,
                storageId: storageId as any
            });
            toast.success("Document supprimé.");
        } catch (error: any) {
            toast.error("Erreur de suppression", { description: error.message });
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dossier Agent</h1>
                    <p className="text-muted-foreground text-sm">Fiche détaillée du personnel centralisée</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    {hasWriteAccess && (
                        <Button variant="outline" onClick={() => router.push(`/rh/agents/${agentId}/modifier`)}>
                            <Edit className="mr-2 h-4 w-4" /> Modifier
                        </Button>
                    )}
                    <Button className="bg-[#1B4F72] hover:bg-[#1B4F72]/90">
                        <Download className="mr-2 h-4 w-4" /> Exporter PDF
                    </Button>
                </div>
            </div>

            {/* Profil Header Card */}
            <Card className="relative overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-[#1B4F72] to-[#27AE60] opacity-90" />
                <CardContent className="pt-0 relative px-6 pb-6">
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12 sm:-mt-16">
                        <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background shadow-md bg-secondary">
                            <AvatarImage src={agentUser?.avatar} />
                            <AvatarFallback className="text-3xl bg-secondary text-secondary-foreground font-semibold">
                                {getInitials(agentUser?.nom, agentUser?.prenom)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-1 mt-2 sm:mt-0 pb-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-bold">{agentUser?.prenom} {agentUser?.nom}</h2>
                                    <div className="flex items-center gap-3 mt-1 text-muted-foreground">
                                        <Badge variant="secondary" className="font-mono">{agentUser?.matricule}</Badge>
                                        <span className="flex items-center gap-1 text-sm"><Building className="h-3 w-3" /> {agent.direction}</span>
                                        <Badge variant="outline" className={`${getStatusColor(agent.statut)} uppercase text-[10px]`}>
                                            {agent.statut.replace("_", " ")}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="identite" className="w-full">
                <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full h-auto gap-2 bg-transparent">
                    <TabsTrigger value="identite" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-card">
                        <User className="mr-2 h-4 w-4" /> Identité
                    </TabsTrigger>
                    <TabsTrigger value="carriere" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-card">
                        <Briefcase className="mr-2 h-4 w-4" /> Carrière
                    </TabsTrigger>
                    <TabsTrigger value="competences" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-card">
                        <Award className="mr-2 h-4 w-4" /> Compétences
                    </TabsTrigger>
                    <TabsTrigger value="evaluations" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-card">
                        <Star className="mr-2 h-4 w-4" /> Évaluations
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-card">
                        <FileText className="mr-2 h-4 w-4" /> Documents
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    {/* ONGLET IDENTITÉ */}
                    <TabsContent value="identite" className="mt-0 outline-none">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center"><User className="mr-2 h-5 w-5 text-muted-foreground" /> État Civil</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground mb-1">Date de naissance</p>
                                            <p className="font-medium">{formatDate(agent.etatCivil?.dateNaissance)}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Lieu de naissance</p>
                                            <p className="font-medium">{agent.etatCivil?.lieuNaissance || "Non renseigné"}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Nationalité</p>
                                            <p className="font-medium">{agent.etatCivil?.nationalite || "Gabonaise"}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">N° CNI / Passeport</p>
                                            <p className="font-medium font-mono">{agent.etatCivil?.cni || "Non renseigné"}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Situation familiale</p>
                                            <p className="font-medium capitalize">{agent.etatCivil?.situationFamiliale || "Célibataire"}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Nombre d'enfants</p>
                                            <p className="font-medium">{agent.etatCivil?.nombreEnfants || 0}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center"><MapPin className="mr-2 h-5 w-5 text-muted-foreground" /> Coordonnées</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                            <div>
                                                <p className="text-muted-foreground mb-1">Adresse de résidence</p>
                                                <p className="font-medium">{agent.etatCivil?.adresse || "Libreville, Gabon"}</p>
                                            </div>
                                        </div>
                                        <Separator />
                                        <div className="flex items-start gap-3">
                                            <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                            <div>
                                                <p className="text-muted-foreground mb-1">Téléphone personnel</p>
                                                <p className="font-medium">{agentUser?.telephone || "Non renseigné"}</p>
                                            </div>
                                        </div>
                                        <Separator />
                                        <div className="flex items-start gap-3">
                                            <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                            <div>
                                                <p className="text-muted-foreground mb-1">Email professionnel</p>
                                                <p className="font-medium text-blue-600">{agentUser?.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* ONGLET CARRIÈRE */}
                    <TabsContent value="carriere" className="mt-0 outline-none">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center"><Briefcase className="mr-2 h-5 w-5 text-muted-foreground" /> Affectation Actuelle</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="col-span-2">
                                            <p className="text-muted-foreground mb-1">Poste occupé</p>
                                            <p className="font-medium text-base">{agent.poste}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Direction</p>
                                            <p className="font-medium">{agent.direction}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Service</p>
                                            <p className="font-medium">{agent.service || "Non renseigné"}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Province</p>
                                            <p className="font-medium">{agent.province}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Date d'affectation</p>
                                            <p className="font-medium">{formatDate(agent.dateRecrutement)}</p>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="grid grid-cols-3 gap-4 text-sm mt-4">
                                        <div>
                                            <p className="text-muted-foreground mb-1">Type de contrat</p>
                                            <p className="font-medium capitalize">{agent.contratType}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Grade</p>
                                            <p className="font-medium">{agent.grade}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Échelon</p>
                                            <p className="font-medium">{agent.echelon}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center"><Calendar className="mr-2 h-5 w-5 text-muted-foreground" /> Historique (Démo)</CardTitle>
                                    <CardDescription>Évolution au sein de l'AGASA</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="relative border-l ml-3 space-y-6 pb-4">
                                        <div className="relative pl-6">
                                            <div className="absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                                            <p className="text-sm font-semibold">{agent.poste}</p>
                                            <p className="text-xs text-muted-foreground">{agent.direction} • Depuis {formatDate(agent.dateRecrutement)}</p>
                                        </div>
                                        <div className="relative pl-6">
                                            <div className="absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full bg-muted-foreground ring-4 ring-background" />
                                            <p className="text-sm font-semibold text-muted-foreground">Intégration AGASA</p>
                                            <p className="text-xs text-muted-foreground">Premier poste • {formatDate(agent.dateRecrutement)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* ONGLET COMPÉTENCES */}
                    <TabsContent value="competences" className="mt-0 outline-none">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center"><Award className="mr-2 h-5 w-5 text-muted-foreground" /> Profil de Compétences</CardTitle>
                                <CardDescription>Expertises et qualifications techniques de l'agent</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {agent.competences && agent.competences.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {agent.competences.map((comp: string, idx: number) => (
                                            <Badge key={idx} variant="secondary" className="text-sm px-3 py-1">
                                                {comp}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Award className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                        <p>Aucune compétence n'a encore été renseignée pour cet agent.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ONGLET ÉVALUATIONS */}
                    <TabsContent value="evaluations" className="mt-0 outline-none">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center"><Star className="mr-2 h-5 w-5 text-muted-foreground" /> Évaluations Annuelles</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8 text-muted-foreground">
                                    <Star className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                    <p>Les évaluations seront disponibles lors de la prochaine campagne (Phase 3.4).</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ONGLET DOCUMENTS */}
                    <TabsContent value="documents" className="mt-0 outline-none">
                        <Card>
                            <CardHeader className="flex flex-row justify-between items-center">
                                <div>
                                    <CardTitle className="text-lg flex items-center"><FileText className="mr-2 h-5 w-5 text-muted-foreground" /> Dossier Administratif</CardTitle>
                                    <CardDescription>Documents numériques (CNI, diplômes, contrats...)</CardDescription>
                                </div>
                                {hasWriteAccess && (
                                    <div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                            accept=".pdf,.png,.jpg,.jpeg"
                                        />
                                        <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                                            {isUploading ? (
                                                <span className="flex items-center"><span className="animate-spin mr-2 border-2 border-white border-t-transparent rounded-full h-4 w-4"></span> Upload...</span>
                                            ) : (
                                                <><Plus className="mr-2 h-4 w-4" /> Uploader un Document</>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent>
                                {documents && documents.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {documents.map((doc: any, i: number) => (
                                            <div key={i} className="flex flex-col p-4 border rounded-md hover:bg-muted/10 transition group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-8 w-8 text-[#1B4F72] opacity-80" />
                                                        <div className="max-w-[150px]">
                                                            <p className="font-semibold text-sm truncate" title={doc.nom}>{doc.nom}</p>
                                                            <p className="text-xs text-muted-foreground">{formatDate(doc.dateAjout)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-auto flex justify-between items-center border-t pt-3">
                                                    <Button variant="ghost" size="sm" className="h-8 group-hover:bg-[#1B4F72]/10" onClick={() => window.open(doc.url, "_blank")}>
                                                        <ExternalLink className="h-4 w-4 mr-2" /> Ouvrir
                                                    </Button>
                                                    {hasWriteAccess && (
                                                        <Button variant="ghost" size="sm" className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteDocument(doc.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg bg-muted/5">
                                        <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                        <p>Aucun document dans le dossier de cet agent.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
