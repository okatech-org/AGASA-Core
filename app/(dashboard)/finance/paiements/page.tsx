"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, AlertTriangle, Smartphone, CreditCard, Landmark, Banknote, HelpCircle, Link as LinkIcon, Download, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function PasserellePaiementsPage() {
    const { user } = useAuth();
    const [redevanceId, setRedevanceId] = useState("");
    const [paiementToReconcile, setPaiementToReconcile] = useState<any>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const stats = useQuery(api.finance.paiements.getStatsPaiements, { userId: user?._id as any });
    const paiements = useQuery(api.finance.paiements.listerPaiements, { userId: user?._id as any });
    const reconcilier = useMutation(api.finance.paiements.reconcilierPaiement);
    const gererStatut = useMutation(api.finance.paiements.gererStatutPaiement);

    const formatMontant = (m: number) => {
        return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XAF", maximumFractionDigits: 0 }).format(m);
    };

    const getModeIcon = (mode: string) => {
        switch (mode) {
            case "mobile_money": return <Smartphone className="w-4 h-4 text-orange-600" />;
            case "virement": return <Landmark className="w-4 h-4 text-blue-600" />;
            case "carte": return <CreditCard className="w-4 h-4 text-slate-800" />;
            case "especes": return <Banknote className="w-4 h-4 text-emerald-600" />;
            default: return <HelpCircle className="w-4 h-4 text-slate-400" />;
        }
    };

    const handleReconciliation = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await reconcilier({
                userId: user?._id as any,
                paiementId: paiementToReconcile._id,
                redevanceId: redevanceId as any
            });
            toast.success("Réconciliation effectuée, la facture est maintenant lettrée et payée.");
            setIsMenuOpen(false);
            setRedevanceId("");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleAnnulation = async (id: any) => {
        if (!confirm("Voulez-vous annuler ce paiement ? L'ID de la transaction sera marqué en erreur.")) return;
        try {
            await gererStatut({ userId: user?._id as any, paiementId: id, statut: "erreur" });
            toast.success("Action annulée.");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    if (stats === undefined || paiements === undefined) return <div className="p-8 text-center animate-pulse">Chargement de la passerelle financière...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-blue-600 pl-3">Passerelle Paiements</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Centralisation et réconciliation des flux entrants (Airtel, Moov, Trésor).</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="text-slate-700 bg-white">
                        <Download className="w-4 h-4 mr-2" /> Exporter le registre
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-3xl font-bold text-slate-900">{stats.paiementsJour}</span>
                        <span className="text-xs text-muted-foreground uppercase font-semibold mt-1">Paiements du jour</span>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-emerald-200 bg-emerald-50/50">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-3xl font-bold text-emerald-700">{paiements.filter(p => p.statut === "valide").length}</span>
                        <span className="text-xs text-emerald-700/80 uppercase font-semibold mt-1">Transactions Réconciliées</span>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-amber-200 bg-amber-50/50">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-3xl font-bold text-amber-700">{stats.enAttente}</span>
                        <span className="text-xs text-amber-700/80 uppercase font-semibold mt-1">En attente de Lettrage</span>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-red-200 bg-red-50/50">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-3xl font-bold text-red-700">{stats.erreurs}</span>
                        <span className="text-xs text-red-700/80 uppercase font-semibold mt-1">Erreurs / Annulés</span>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="shadow-sm border-slate-200 lg:col-span-1">
                    <CardHeader className="bg-slate-50/50 border-b p-4">
                        <CardTitle className="text-base text-slate-800">Recettes par canal</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        {stats.repartitionMode.length === 0 ? <div className="text-xs text-center text-slate-500">Aucune donnée</div> : null}
                        {stats.repartitionMode.map(m => (
                            <div key={m.mode} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                                <div className="flex items-center gap-2">
                                    {getModeIcon(m.mode)}
                                    <span className="text-sm font-medium capitalize text-slate-700">{m.mode.replace("_", " ")}</span>
                                </div>
                                <span className="font-bold text-slate-900">{formatMontant(m.montant)}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200 lg:col-span-3">
                    <CardHeader className="bg-slate-50/50 border-b p-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-base text-slate-800">Trafic Financier Entrant</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                                        <TableHead>Horodatage</TableHead>
                                        <TableHead>Transaction ID</TableHead>
                                        <TableHead>Débiteur / Opérateur</TableHead>
                                        <TableHead className="text-right">Montant Brut</TableHead>
                                        <TableHead className="text-center">Canal</TableHead>
                                        <TableHead className="text-center">Statut</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paiements.length === 0 ? (
                                        <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Aucun paiement enregistré sur la passerelle.</TableCell></TableRow>
                                    ) : (
                                        paiements.map(p => (
                                            <TableRow key={p._id} className="hover:bg-slate-50">
                                                <TableCell className="text-xs text-slate-500">{format(new Date(p.datePaiement), "dd/MM/yy HH:mm")}</TableCell>
                                                <TableCell className="font-mono text-xs font-semibold">{p.reference}</TableCell>
                                                <TableCell className="font-medium text-slate-900">{p.nomOperateur}</TableCell>
                                                <TableCell className="text-right font-bold text-slate-900">{formatMontant(p.montant)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-center gap-1 text-xs text-slate-600 capitalize">
                                                        {getModeIcon(p.mode)} {p.mode.replace("_", " ")}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {p.statut === "valide" && <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">Réconcilié</Badge>}
                                                    {p.statut === "en_attente" && <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none">À Lettrer</Badge>}
                                                    {p.statut === "erreur" && <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-none">Rejeté / Annulé</Badge>}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {p.statut === "en_attente" && (
                                                        <Dialog open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                                                            <DialogTrigger asChild>
                                                                <Button size="sm" onClick={() => setPaiementToReconcile(p)} className="bg-blue-600 hover:bg-blue-700 h-7 text-xs px-2">
                                                                    <LinkIcon className="w-3 h-3 mr-1" /> Lettrer
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>Réconciliation Manuelle</DialogTitle>
                                                                    <DialogDescription>Liez la transaction {p.reference} à une facture émise.</DialogDescription>
                                                                </DialogHeader>
                                                                <form onSubmit={handleReconciliation} className="space-y-4 py-4">
                                                                    <div className="bg-slate-50 p-3 rounded text-sm border border-slate-200">
                                                                        <div className="flex justify-between">
                                                                            <span className="text-slate-500">Montant reçu :</span>
                                                                            <span className="font-bold text-slate-900">{formatMontant(p.montant)}</span>
                                                                        </div>
                                                                        <div className="flex justify-between mt-1">
                                                                            <span className="text-slate-500">Auteur :</span>
                                                                            <span className="font-medium text-slate-900">{p.nomOperateur}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label>Identifiant (ID) de la redevance attendue</Label>
                                                                        <Input value={redevanceId} onChange={e => setRedevanceId(e.target.value)} placeholder="Copiez/Collez l'ID Convex de la facture" required />
                                                                    </div>
                                                                    <DialogFooter className="mt-4">
                                                                        <Button type="button" variant="outline" onClick={() => setIsMenuOpen(false)}>Annuler</Button>
                                                                        <Button type="submit" className="bg-slate-900">Affecter le paiement</Button>
                                                                    </DialogFooter>
                                                                </form>
                                                            </DialogContent>
                                                        </Dialog>
                                                    )}
                                                    {p.statut === "valide" && (
                                                        <Button size="sm" variant="ghost" onClick={() => handleAnnulation(p._id)} title="Annuler ce paiement" className="h-7 w-7 p-0 text-slate-400 hover:text-red-600">
                                                            <RotateCcw className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
