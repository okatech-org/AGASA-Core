"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import {
    PenTool, FileSignature, CheckCircle, XCircle, FileText,
    AlertCircle, Search, Calendar, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function SignaturesPage() {
    const { user } = useAuth();

    const elements = useQuery(api.ged.signatures.enAttente, {
        userId: user?._id as any
    });

    const signer = useMutation(api.ged.signatures.signer);
    const refuser = useMutation(api.ged.signatures.refuser);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDoc, setSelectedDoc] = useState<any>(null);
    const [isSignModalOpen, setIsSignModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectComment, setRejectComment] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const filtered = (elements || []).filter((item: any) => {
        const full = `${item.workflow.reference} ${item.workflow.titreDocument} ${item.initiateur?.prenom} ${item.initiateur?.nom}`.toLowerCase();
        return full.includes(searchTerm.toLowerCase());
    });

    const handleSignClick = (doc: any) => {
        setSelectedDoc(doc);
        setIsSignModalOpen(true);
    };

    const handleRejectClick = (doc: any) => {
        setSelectedDoc(doc);
        setRejectComment("");
        setIsRejectModalOpen(true);
    };

    const confirmSignature = async () => {
        if (!user?._id || !selectedDoc) return;
        setIsProcessing(true);
        try {
            const result = await signer({
                userId: user._id,
                etapeId: selectedDoc.etapeId,
                documentId: selectedDoc.workflow.documentId
            });
            toast.success("Document signé", { description: `Empreinte de traçabilité générée : ${result.trace}` });
            setIsSignModalOpen(false);
            setSelectedDoc(null);
        } catch (error: any) {
            toast.error("Erreur de signature", { description: error.message });
        } finally {
            setIsProcessing(false);
        }
    };

    const confirmRejection = async () => {
        if (!user?._id || !selectedDoc) return;
        if (rejectComment.trim().length === 0) {
            toast.error("Commentaire requis", { description: "Le motif du refus est obligatoire." });
            return;
        }
        setIsProcessing(true);
        try {
            await refuser({
                userId: user._id,
                etapeId: selectedDoc.etapeId,
                commentaire: rejectComment
            });
            toast.success("Signature refusée", { description: "Le document a été rejeté avec succès." });
            setIsRejectModalOpen(false);
            setSelectedDoc(null);
        } catch (error: any) {
            toast.error("Erreur", { description: error.message });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tightflex items-center gap-2">
                        <PenTool className="h-6 w-6 text-[#1B4F72] inline-block mr-2" />
                        Attente de Signature
                    </h1>
                    <p className="text-muted-foreground text-sm">Mes actes et documents nécessitant une signature électronique certifiée.</p>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher (ex: titre, référence...)"
                        className="pl-8 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                    {elements ? `${filtered.length} document(s)` : 'Chargement...'}
                </div>
            </div>

            <div className="bg-white rounded-lg border shadow-sm">
                {elements === undefined ? (
                    <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B4F72] mb-4"></div>
                        Vérification des bannettes électroniques...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-16 text-center">
                        <FileSignature className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-[#1B4F72]">Parapheur vide</h3>
                        <p className="text-sm text-muted-foreground mt-1">Vous n'avez aucun document en attente de signature.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50 text-xs uppercase tracking-wider">
                                    <TableHead className="w-[180px]">Date demande</TableHead>
                                    <TableHead>Document</TableHead>
                                    <TableHead>Initiateur</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((item: any) => (
                                    <TableRow key={item.etapeId} className="hover:bg-muted/30">
                                        <TableCell>
                                            <div className="font-medium text-sm flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                                {format(item.dateDemande, "dd MMM yyyy", { locale: fr })}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1 ml-5">
                                                {format(item.dateDemande, "HH:mm")}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-[#1B4F72] font-semibold text-sm cursor-pointer hover:underline" onClick={() => window.open(item.documentUrl, '_blank')}>
                                                <FileText className="w-4 h-4 shrink-0" />
                                                <span className="line-clamp-1">{item.workflow.titreDocument}</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1 ml-6">
                                                Ref: {item.workflow.reference}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-sm">{item.initiateur?.prenom} {item.initiateur?.nom}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5">{item.initiateur?.direction}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-normal capitalize border-slate-300 text-slate-700 bg-slate-50">
                                                {item.workflow.type.replace("_", " ")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 shadow-sm"
                                                    onClick={() => handleSignClick(item)}
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1.5" /> Signer
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 shadow-sm"
                                                    onClick={() => handleRejectClick(item)}
                                                >
                                                    <XCircle className="w-4 h-4 mr-1.5" /> Refuser
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => window.open(item.documentUrl, '_blank')}>
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* MODAL SIGNATURE */}
            <Dialog open={isSignModalOpen} onOpenChange={setIsSignModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-[#1B4F72]">
                            <PenTool className="h-5 w-5" /> Signature Électronique
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Vous êtes sur le point de valider et signer numériquement le document :
                            <strong className="block mt-2 text-slate-800">{selectedDoc?.workflow.titreDocument}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-blue-50/50 p-4 rounded-md border text-sm text-blue-800 my-2 flex gap-3 items-start">
                        <AlertCircle className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />
                        <p>En apposant votre signature électronique, vous engagez votre responsabilité administrative sur la validation de ce document conformément aux procédures AGASA. Une empreinte numérique inaltérable sera générée et horodatée.</p>
                    </div>

                    <DialogFooter className="sm:justify-end mt-4">
                        <Button variant="outline" onClick={() => setIsSignModalOpen(false)} disabled={isProcessing}>
                            Annuler
                        </Button>
                        <Button className="bg-[#1B4F72] hover:bg-[#1B4F72]/90" onClick={confirmSignature} disabled={isProcessing}>
                            {isProcessing ? "Signature en cours..." : "Certifier & Signer"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL REJET */}
            <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <XCircle className="h-5 w-5" /> Refuser la signature
                        </DialogTitle>
                        <DialogDescription>
                            Veuillez indiquer le motif du refus. Le document retournera à son initiateur.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 my-2">
                        <div className="space-y-2">
                            <Label htmlFor="motif">Motif du rejet <span className="text-red-500">*</span></Label>
                            <Textarea
                                id="motif"
                                placeholder="Indiquez clairement la raison (ex: Montants erronés, pièces manquantes...)"
                                value={rejectComment}
                                onChange={(e) => setRejectComment(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>

                    <DialogFooter className="sm:justify-end">
                        <Button variant="outline" onClick={() => setIsRejectModalOpen(false)} disabled={isProcessing}>
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={confirmRejection} disabled={isProcessing || rejectComment.trim().length === 0}>
                            {isProcessing ? "Rejet en cours..." : "Confirmer le Rejet"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
