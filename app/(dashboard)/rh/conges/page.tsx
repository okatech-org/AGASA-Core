"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Plus, Check, X, Calendar as CalendarIcon, Filter, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CongesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const conges = useQuery(api.rh.conges.list, user?._id ? { userId: user._id } : "skip");
    const evaluerConge = useMutation(api.rh.conges.evaluer);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedConge, setSelectedConge] = useState<any>(null);
    const [actionModal, setActionModal] = useState<"approuver" | "refuser" | null>(null);
    const [commentaire, setCommentaire] = useState("");

    const isChefOrDRH = user?.role === "admin_systeme" || user?.role === "directeur_general" || user?.role === "directeur" || user?.role === "chef_service" || user?.demoSimulatedRole === "chef_service" || user?.demoSimulatedRole === "admin_systeme" || user?.direction === "DAF";
    const isDRH = user?.role === "admin_systeme" || user?.role === "directeur_general" || user?.direction === "DAF" || user?.demoSimulatedRole === "admin_systeme";

    if (conges === undefined) {
        return <div className="flex justify-center p-8">Chargement des congés...</div>;
    }

    const filteredConges = conges.filter((c: any) => {
        const matchesTerm = c.user?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.user?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.motif?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTerm;
    });

    const getStatusBadge = (statut: string) => {
        switch (statut) {
            case "brouillon": return <Badge variant="outline" className="text-gray-500">Brouillon</Badge>;
            case "soumis": return <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">En attente N+1</Badge>;
            case "approuve_n1": return <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">En attente RH</Badge>;
            case "approuve_drh": return <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">Approuvé</Badge>;
            case "refuse": return <Badge variant="destructive">Refusé</Badge>;
            default: return <Badge variant="outline">{statut}</Badge>;
        }
    };

    const handleEvaluer = async () => {
        if (!user?._id || !selectedConge || !actionModal) return;

        try {
            await evaluerConge({
                adminId: user._id,
                congeId: selectedConge._id,
                action: actionModal,
                commentaire: commentaire || undefined
            });
            toast.success(`Demande ${actionModal === "approuver" ? "approuvée" : "refusée"} avec succès.`);
            setActionModal(null);
            setSelectedConge(null);
            setCommentaire("");
        } catch (error: any) {
            toast.error("Erreur", { description: error.message });
        }
    };

    const canApprouve = (statut: string) => {
        if (statut === "soumis" && isChefOrDRH) return true;
        if (statut === "approuve_n1" && isDRH) return true;
        return false;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Gestion des Congés</h1>
                    <p className="text-muted-foreground text-sm">Suivi, validation et historique des absences</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push("/rh/conges/calendrier")}>
                        <CalendarIcon className="mr-2 h-4 w-4" /> Calendrier d'Équipe
                    </Button>
                    <Button onClick={() => router.push("/rh/conges/nouveau")} className="bg-[#1B4F72] hover:bg-[#1B4F72]/90">
                        <Plus className="mr-2 h-4 w-4" /> Nouvelle demande
                    </Button>
                </div>
            </div>

            <Card className="border shadow-sm">
                <CardHeader className="pb-3 border-b bg-muted/20">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <CardTitle className="text-lg flex items-center">
                            <Filter className="mr-2 h-5 w-5 text-muted-foreground" /> Filtres
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder="Rechercher agent ou motif..."
                                className="w-[250px] bg-background"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/10">
                                <TableHead className="w-[250px]">Agent</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Période</TableHead>
                                <TableHead>Jours</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredConges.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Aucune demande de congé trouvée.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredConges.map((c: any) => (
                                    <TableRow key={c._id} className="hover:bg-muted/5">
                                        <TableCell>
                                            <div className="font-medium text-sm">{c.user?.nom} {c.user?.prenom}</div>
                                            <div className="text-xs text-muted-foreground">{c.agent?.direction} - {c.agent?.service}</div>
                                        </TableCell>
                                        <TableCell className="capitalize">{c.type}</TableCell>
                                        <TableCell className="text-sm">
                                            {new Date(c.dateDebut).toLocaleDateString("fr-FR")} au {new Date(c.dateFin).toLocaleDateString("fr-FR")}
                                        </TableCell>
                                        <TableCell className="font-medium">{c.nombreJours} j</TableCell>
                                        <TableCell>{getStatusBadge(c.statut)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {canApprouve(c.statut) && (
                                                    <>
                                                        <Button variant="outline" size="icon" className="h-8 w-8 text-green-600 border-green-200 hover:bg-green-50"
                                                            onClick={() => { setSelectedConge(c); setActionModal("approuver"); }}
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50"
                                                            onClick={() => { setSelectedConge(c); setActionModal("refuser"); }}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { }}>
                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Modal d'évaluation */}
            <Dialog open={!!actionModal} onOpenChange={(open) => !open && setActionModal(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{actionModal === "approuver" ? "Approuver la demande" : "Refuser la demande"}</DialogTitle>
                        <DialogDescription>
                            Vous êtes sur le point de {actionModal === "approuver" ? "valider" : "rejeter"} la demande de {selectedConge?.user?.prenom} {selectedConge?.user?.nom}.
                            Cette action sera enregistrée.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="bg-muted p-3 rounded-md text-sm">
                            <p><strong>Période :</strong> {new Date(selectedConge?.dateDebut).toLocaleDateString("fr-FR")} - {new Date(selectedConge?.dateFin).toLocaleDateString("fr-FR")} ({selectedConge?.nombreJours} jours)</p>
                            <p><strong>Motif :</strong> {selectedConge?.motif}</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Commentaire {actionModal === "refuser" && "(Requis)"}</label>
                            <Textarea
                                placeholder="Ajouter une remarque..."
                                value={commentaire}
                                onChange={(e: any) => setCommentaire(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActionModal(null)}>Annuler</Button>
                        <Button
                            className={actionModal === "approuver" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                            onClick={handleEvaluer}
                            disabled={actionModal === "refuser" && commentaire.length < 5}
                        >
                            Confirmer {actionModal === "approuver" ? "l'approbation" : "le refus"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
