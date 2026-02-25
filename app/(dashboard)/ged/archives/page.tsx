"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import {
    ArchiveRestore, FolderOpen, FileText, Search, Plus, Trash2,
    Download, Calendar as CalendarIcon, Tag, AlertTriangle, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function ArchivesPage() {
    const { user } = useAuth();
    const [dossierActuel, setDossierActuel] = useState(""); // "" = Tous les dossiers
    const [searchTerm, setSearchTerm] = useState("");
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // Upload form
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        titre: "",
        dossier: "Arsenal Réglementaire/Décrets",
        type: "decret",
        annee: new Date().getFullYear().toString(),
        tags: "",
        retention: "0" // 0 = illimité
    });

    const dossiers = useQuery(api.ged.archives.listerDossiers, { userId: user?._id as any });
    const documents = useQuery(api.ged.archives.explorerDossier, {
        userId: user?._id as any,
        dossierPath: dossierActuel,
        recherche: searchTerm
    });

    const generateUploadUrl = useMutation(api.ged.courrier.generateUploadUrl);
    const archiverDocument = useMutation(api.ged.archives.archiverDocument);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type !== "application/pdf") {
                toast.error("Format non supporté", { description: "Seuls les fichiers PDF sont acceptés pour l'archivage." });
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?._id || !selectedFile) return;

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

            // 3. Save Archive
            await archiverDocument({
                userId: user._id,
                titre: formData.titre,
                dossier: formData.dossier,
                type: formData.type,
                annee: parseInt(formData.annee, 10),
                tags: tagsList,
                documentId: storageId,
                donneesRetentionAnnee: formData.retention !== "0" ? parseInt(formData.retention, 10) : undefined,
            });

            toast.success("Succès", { description: "Le document a été classé aux archives centrales." });
            setIsUploadModalOpen(false);
            setSelectedFile(null);
            setFormData({ ...formData, titre: "", tags: "" });

        } catch (error: any) {
            toast.error("Erreur d'archivage", { description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Arborescence unique categories principale (Le string avant le premier '/')
    const dossierRootCategories = dossiers ? Array.from(new Set(dossiers.map((d: string) => d.split('/')[0]))) : [];

    return (
        <div className="flex h-[calc(100vh-100px)] gap-6 pb-6">

            {/* Volet Gauche: Explorateur d'arborescence */}
            <div className="w-64 shrink-0 bg-white rounded-lg border shadow-sm flex flex-col hidden md:flex">
                <div className="p-4 border-b">
                    <h2 className="font-bold flex items-center gap-2 text-[#1B4F72]">
                        <ArchiveRestore className="w-5 h-5" /> Explorateur
                    </h2>
                </div>
                <div className="p-3 overflow-y-auto flex-1 space-y-4">
                    <div
                        className={`px-3 py-2 text-sm rounded-md cursor-pointer transition-colors ${dossierActuel === "" ? "bg-[#1B4F72] text-white font-medium" : "hover:bg-slate-100"}`}
                        onClick={() => setDossierActuel("")}
                    >
                        Vue Globale (Tout voir)
                    </div>

                    {dossierRootCategories.map((rootCat) => (
                        <div key={rootCat} className="space-y-1">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1 flex items-center gap-2">
                                <FolderOpen className="w-3.5 h-3.5" /> {rootCat}
                            </h3>
                            <ul className="space-y-0.5 ml-2">
                                {dossiers?.filter((d: string) => d.startsWith(rootCat + "/")).map((dPath: string) => {
                                    const subFolder = dPath.split('/')[1];
                                    return (
                                        <li
                                            key={dPath}
                                            onClick={() => setDossierActuel(dPath)}
                                            className={`px-3 py-1.5 text-sm rounded-md cursor-pointer transition-colors border-l-2 ml-2
                                                ${dossierActuel === dPath ? "border-[#1B4F72] bg-blue-50 text-blue-700 font-medium" : "border-transparent text-slate-600 hover:bg-slate-100"}
                                            `}
                                        >
                                            {subFolder}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t bg-slate-50 mt-auto rounded-b-lg text-xs flex items-start gap-2 text-muted-foreground">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-[#1B4F72]" />
                    <p>Archives soumises aux politiques de rétention légale (CN-PG).</p>
                </div>
            </div>

            {/* Volet Droit: Liste des fichiers et Recherche */}
            <div className="flex-1 flex flex-col space-y-4 min-w-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            {dossierActuel === "" ? "Archives Centrales" : dossierActuel.replace('/', ' > ')}
                        </h1>
                        <p className="text-muted-foreground text-sm">Conservation numérique inaltérable</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button className="bg-[#1B4F72] hover:bg-[#1B4F72]/90 w-full sm:w-auto shadow-sm" onClick={() => setIsUploadModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Verser aux archives
                        </Button>
                    </div>
                </div>

                <div className="flex items-center justify-between bg-white p-2 rounded-lg border shadow-sm">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher par titre, mot-clé, thème..."
                            className="pl-9 h-9 border-none shadow-none focus-visible:ring-0"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="pr-4 text-sm font-medium text-slate-500">
                        {documents ? `${documents.length} document(s)` : '...'}
                    </div>
                </div>

                <div className="bg-white rounded-lg border shadow-sm flex-1 overflow-hidden flex flex-col relative">
                    {documents === undefined ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 z-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B4F72] mb-4"></div>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                            <ArchiveRestore className="h-16 w-16 text-slate-200 mb-4" />
                            <h3 className="text-lg font-medium text-slate-800">Dossier vide</h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-sm">Aucune archive ne correspond à votre recherche ou ce dossier est actuellement vide.</p>
                        </div>
                    ) : (
                        <div className="overflow-auto flex-1 h-0">
                            <Table>
                                <TableHeader className="sticky top-0 bg-slate-50 z-10 shadow-sm">
                                    <TableRow className="text-xs uppercase tracking-wider text-slate-500">
                                        <TableHead className="w-[300px]">Document</TableHead>
                                        {dossierActuel === "" && <TableHead>Dossier source</TableHead>}
                                        <TableHead>Typologie / Mots-clés</TableHead>
                                        <TableHead>Versement</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {documents.map((doc: any) => (
                                        <TableRow key={doc._id} className="hover:bg-blue-50/50 group">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded bg-[#1B4F72]/10 flex items-center justify-center shrink-0">
                                                        <FileText className="w-5 h-5 text-[#1B4F72]" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-sm text-[#1B4F72] truncate cursor-pointer hover:underline" onClick={() => window.open(doc.documentUrl, '_blank')}>
                                                            {doc.titre}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground uppercase flex items-center gap-1 mt-0.5">
                                                            <CalendarIcon className="w-3 h-3" /> Exercice {doc.annee}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {dossierActuel === "" && (
                                                <TableCell>
                                                    <Badge variant="secondary" className="font-normal text-[10px] bg-slate-100">
                                                        {doc.dossier.split('/')[1] || doc.dossier}
                                                    </Badge>
                                                </TableCell>
                                            )}

                                            <TableCell>
                                                <div className="flex flex-col gap-1.5 items-start">
                                                    <Badge variant="outline" className="font-medium capitalize text-[10px] bg-white">
                                                        {doc.type.replace('_', ' ')}
                                                    </Badge>
                                                    <div className="flex flex-wrap gap-1">
                                                        {doc.tags?.slice(0, 3).map((tag: string, i: number) => (
                                                            <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                                <Tag className="w-2.5 h-2.5" /> {tag}
                                                            </span>
                                                        ))}
                                                        {doc.tags?.length > 3 && <span className="text-[10px] text-muted-foreground">+{doc.tags.length - 3}</span>}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm">{format(doc.dateArchivage, "dd MMM yyyy", { locale: fr })}</span>
                                                    <span className="text-xs text-muted-foreground">par {doc.archiveur?.nom}</span>
                                                    {doc.dateDestructionPrevue && (
                                                        <span className="text-[10px] text-orange-600 flex items-center gap-1 mt-1 font-medium bg-orange-50 w-fit px-1 rounded border border-orange-100" title={`À détruire le ${format(doc.dateDestructionPrevue, "dd/MM/yyyy")}`}>
                                                            <AlertTriangle className="w-2.5 h-2.5" /> Rétention légale
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <Button size="icon" variant="ghost" className="text-slate-400 group-hover:text-[#1B4F72]" onClick={() => window.open(doc.documentUrl, '_blank')}>
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal d'upload */}
            <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-[#1B4F72]">
                            <ArchiveRestore className="h-5 w-5" /> Versement aux Archives
                        </DialogTitle>
                        <DialogDescription>
                            Placez un document légal ou contractuel dans l'arborescence figée. Cette action est définitive.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleUploadSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Fichier PDF <span className="text-red-500">*</span></Label>
                            <Input
                                type="file"
                                accept="application/pdf"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Titre du document <span className="text-red-500">*</span></Label>
                            <Input
                                placeholder="Ex: Décret N°0014/PR portant réorganisation AGASA..."
                                value={formData.titre}
                                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Emplacement (Dossier virtuel)</Label>
                                <Select value={formData.dossier} onValueChange={(v) => setFormData({ ...formData, dossier: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Arsenal Réglementaire/Décrets">Arsenal.Rég / Décrets</SelectItem>
                                        <SelectItem value="Arsenal Réglementaire/Arrêtés">Arsenal.Rég / Arrêtés</SelectItem>
                                        <SelectItem value="Arsenal Réglementaire/Lois">Arsenal.Rég / Lois</SelectItem>
                                        <SelectItem value="Ressources Humaines/Contrats">RH / Contrats</SelectItem>
                                        <SelectItem value="Ressources Humaines/Délibérations CA">RH / Délibérations CA</SelectItem>
                                        <SelectItem value="Finances/Marchés Publics">Finances / Marchés Publics</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Typologie</Label>
                                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="decret">Décret</SelectItem>
                                        <SelectItem value="arrete">Arrêté</SelectItem>
                                        <SelectItem value="contrat">Contrat / Convention</SelectItem>
                                        <SelectItem value="marche">Marché Public</SelectItem>
                                        <SelectItem value="pv">Procès-Verbal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Rétention Légale (Destruction prévue)</Label>
                                <Select value={formData.retention} onValueChange={(v) => setFormData({ ...formData, retention: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">Illimitée (Conservation à vie)</SelectItem>
                                        <SelectItem value="5">5 Ans</SelectItem>
                                        <SelectItem value="10">10 Ans</SelectItem>
                                        <SelectItem value="30">30 Ans</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Année d'exercice</Label>
                                <Input
                                    type="number"
                                    value={formData.annee}
                                    onChange={(e) => setFormData({ ...formData, annee: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Mots-clés (séparés par des virgules)</Label>
                            <Input
                                placeholder="ex: santé_animale, import_export, ceeac"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsUploadModalOpen(false)}>Annuler</Button>
                            <Button type="submit" className="bg-[#1B4F72] hover:bg-[#1B4F72]/90" disabled={isSubmitting || !selectedFile}>
                                {isSubmitting ? "Versement..." : "Confirmer le versement"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </div>
    );
}
