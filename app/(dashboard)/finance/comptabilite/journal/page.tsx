"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Filter, Save, Lock, FileSpreadsheet } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

export default function JournalComptablePage() {
    const { user } = useAuth();
    const [exercice, setExercice] = useState(new Date().getFullYear());
    const [journalFilter, setJournalFilter] = useState("tous");
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Formulaire
    const [reference, setReference] = useState("");
    const [libelle, setLibelle] = useState("");
    const [compte, setCompte] = useState("");
    const [debit, setDebit] = useState("");
    const [credit, setCredit] = useState("");
    const [journal, setJournal] = useState("Opérations Diverses (OD)");

    const data = useQuery(api.finance.comptabilite.listerEcritures, {
        userId: user?._id as any,
        exercice,
        journal: journalFilter
    });

    const ajouterEcriture = useMutation(api.finance.comptabilite.ajouterEcriture);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await ajouterEcriture({
                userId: user?._id as any,
                reference,
                libelle,
                debit: parseFloat(debit) || 0,
                credit: parseFloat(credit) || 0,
                compte,
                journal,
                exercice
            });
            toast.success("Écriture comptable enregistrée au brouillard");
            setIsMenuOpen(false);
            setReference(""); setLibelle(""); setCompte(""); setDebit(""); setCredit("");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const formatMontant = (m: number) => {
        return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XAF", maximumFractionDigits: 0 }).format(m);
    };

    if (data === undefined) return <div className="p-8 text-center animate-pulse">Chargement du Grand Livre...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-slate-900 pl-3">Journal Comptable</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Grand livre des écritures et mouvements financiers structurés.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="text-slate-700 bg-white">
                        <Lock className="w-4 h-4 mr-2" /> Clôture Mensuelle
                    </Button>

                    <Dialog open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-slate-900 hover:bg-slate-800">
                                <Plus className="w-4 h-4 mr-2" /> Nouvelle Ligne
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl">
                            <DialogHeader>
                                <DialogTitle>Saisie d'une imputation comptable</DialogTitle>
                                <DialogDescription>Enregistrement d'une écriture au brouillard analytique AGASA.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Référence / Pièce</Label>
                                        <Input value={reference} onChange={e => setReference(e.target.value)} placeholder="Ex: F-2026-001" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Code Compte (PCG)</Label>
                                        <Input value={compte} onChange={e => setCompte(e.target.value)} placeholder="Ex: 512100" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Libellé de l'opération</Label>
                                    <Input value={libelle} onChange={e => setLibelle(e.target.value)} placeholder="Objet comptable" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Débit (FCFA)</Label>
                                        <Input type="number" min="0" value={debit} onChange={e => { setDebit(e.target.value); setCredit(""); }} placeholder="0" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Crédit (FCFA)</Label>
                                        <Input type="number" min="0" value={credit} onChange={e => { setCredit(e.target.value); setDebit(""); }} placeholder="0" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Journal Auxiliaire</Label>
                                    <Select value={journal} onValueChange={setJournal}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Achats (ACH)">Achats (ACH)</SelectItem>
                                            <SelectItem value="Ventes (VEN)">Ventes (VEN)</SelectItem>
                                            <SelectItem value="Banque (BQE)">Banque (BQE)</SelectItem>
                                            <SelectItem value="Caisse (CAI)">Caisse (CAI)</SelectItem>
                                            <SelectItem value="Opérations Diverses (OD)">Opérations Diverses (OD)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <DialogFooter className="pt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsMenuOpen(false)}>Annuler</Button>
                                    <Button type="submit" className="bg-slate-900"><Save className="w-4 h-4 mr-2" /> Enregistrer</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Totaliseurs de la période étudiée */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-4 flex justify-between items-center bg-slate-50/50">
                        <div>
                            <p className="text-xs uppercase font-semibold text-slate-500">Flux Débiteur</p>
                            <p className="text-xl font-bold text-slate-900 mt-1">{formatMontant(data.totalDebit)}</p>
                        </div>
                        <FileSpreadsheet className="w-8 h-8 text-slate-300" />
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-4 flex justify-between items-center bg-slate-50/50">
                        <div>
                            <p className="text-xs uppercase font-semibold text-slate-500">Flux Créditeur</p>
                            <p className="text-xl font-bold text-slate-900 mt-1">{formatMontant(data.totalCredit)}</p>
                        </div>
                        <FileSpreadsheet className="w-8 h-8 text-slate-300" />
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-4 flex justify-between items-center bg-slate-50/50 border-b-4 border-b-slate-900">
                        <div>
                            <p className="text-xs uppercase font-semibold text-slate-500">Solde Périodique (Débit - Crédit)</p>
                            <p className={`text-xl font-bold mt-1 ${data.solde > 0 ? 'text-emerald-700' : 'text-red-700'}`}>{formatMontant(data.solde)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 flex-1">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <Select value={exercice.toString()} onValueChange={(v) => setExercice(parseInt(v))}>
                        <SelectTrigger className="w-40 border-slate-200"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={new Date().getFullYear().toString()}>{new Date().getFullYear()}</SelectItem>
                            <SelectItem value={(new Date().getFullYear() - 1).toString()}>{new Date().getFullYear() - 1}</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={journalFilter} onValueChange={setJournalFilter}>
                        <SelectTrigger className="w-full border-slate-200"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="tous">Tous les Journaux</SelectItem>
                            <SelectItem value="Achats (ACH)">Achats (ACH)</SelectItem>
                            <SelectItem value="Ventes (VEN)">Ventes (VEN)</SelectItem>
                            <SelectItem value="Banque (BQE)">Banque (BQE)</SelectItem>
                            <SelectItem value="Caisse (CAI)">Caisse (CAI)</SelectItem>
                            <SelectItem value="Opérations Diverses (OD)">Opérations Diverses (OD)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead className="w-[100px]">Date</TableHead>
                                <TableHead>Journal</TableHead>
                                <TableHead>Compte</TableHead>
                                <TableHead className="w-[120px]">Référence</TableHead>
                                <TableHead className="min-w-[200px]">Libellé</TableHead>
                                <TableHead className="text-right text-slate-700 bg-slate-100/50">Débit</TableHead>
                                <TableHead className="text-right text-slate-700 bg-slate-100/50">Crédit</TableHead>
                                <TableHead className="text-center">Validé</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.ecritures.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">Aucune écriture comptable dans le registre sélectionné.</TableCell>
                                </TableRow>
                            ) : (
                                data.ecritures.map((e) => (
                                    <TableRow key={e._id} className="hover:bg-slate-50 font-mono text-xs">
                                        <TableCell>{format(new Date(e.dateEcriture), "dd/MM/yy")}</TableCell>
                                        <TableCell className="font-sans font-medium text-slate-600 truncate max-w-[120px]" title={e.journal}>{e.journal}</TableCell>
                                        <TableCell className="font-bold text-slate-900">{e.compte}</TableCell>
                                        <TableCell>{e.reference}</TableCell>
                                        <TableCell className="font-sans text-slate-800">{e.libelle}</TableCell>
                                        <TableCell className="text-right text-slate-900 bg-slate-50/50">{e.debit > 0 ? formatMontant(e.debit) : "-"}</TableCell>
                                        <TableCell className="text-right text-slate-900 bg-slate-50/50">{e.credit > 0 ? formatMontant(e.credit) : "-"}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={e.rapprochement ? "secondary" : "outline"} className={e.rapprochement ? "bg-emerald-100 text-emerald-800" : "text-slate-400"}>
                                                {e.rapprochement ? "Rapproché" : "Brouillard"}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
