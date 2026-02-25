"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import {
    ArrowLeft, Calculator, Save, CheckCircle, Search, Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CalculPaiePage() {
    const { user } = useAuth();
    const router = useRouter();
    const currentDate = new Date();
    const [selectedMois, setSelectedMois] = useState<number>(currentDate.getMonth() + 1);
    const [selectedAnnee, setSelectedAnnee] = useState<number>(currentDate.getFullYear());

    const brouillon = useQuery(api.rh.paie.getBrouillonPaie, {
        mois: selectedMois,
        annee: selectedAnnee
    });

    const genererPaie = useMutation(api.rh.paie.calculerPaieMois);
    const validerPaie = useMutation(api.rh.paie.validerPaie);
    const updateLigne = useMutation(api.rh.paie.updateLignePaie);

    const [isGenerating, setIsGenerating] = useState(false);
    const [isValidating, setIsValidating] = useState(false);

    // Filter
    const [searchTerm, setSearchTerm] = useState("");

    const hasAccess = user?.role === "admin_systeme" || user?.role === "directeur_general" || user?.direction === "DAF" || user?.demoSimulatedRole === "admin_systeme";

    if (!hasAccess) {
        return <div className="p-10 text-center text-red-500">Accès non autorisé au calcul de paie.</div>;
    }

    const handleGenerer = async () => {
        if (!user?._id) return;
        setIsGenerating(true);
        try {
            const count = await genererPaie({
                adminId: user._id,
                mois: selectedMois,
                annee: selectedAnnee
            });
            toast.success("Brouillon généré", { description: `${count} bulletins pré-calculés.` });
        } catch (error: any) {
            toast.error("Erreur", { description: error.message });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleValider = async () => {
        if (!user?._id) return;
        if (!confirm("Voulez-vous vraiment clore et valider la paie de ce mois ? Elle ne sera plus modifiable.")) return;

        setIsValidating(true);
        try {
            await validerPaie({
                adminId: user._id,
                mois: selectedMois,
                annee: selectedAnnee
            });
            toast.success("Paie validée", { description: "Les bulletins sont désormais définitifs." });
            router.push("/rh/paie");
        } catch (error: any) {
            toast.error("Erreur", { description: error.message });
        } finally {
            setIsValidating(false);
        }
    };

    const handleCellChange = async (paieId: any, fieldName: string, value: string) => {
        if (!user?._id) return;
        const numValue = parseInt(value, 10);
        if (isNaN(numValue)) return;

        try {
            await updateLigne({
                adminId: user._id,
                paieId,
                updates: { [fieldName]: numValue }
            });
        } catch (error: any) {
            toast.error("Erreur de sauvegarde", { description: error.message });
        }
    };

    const moisOptions = [
        { val: 1, label: "Janvier" }, { val: 2, label: "Février" }, { val: 3, label: "Mars" },
        { val: 4, label: "Avril" }, { val: 5, label: "Mai" }, { val: 6, label: "Juin" },
        { val: 7, label: "Juillet" }, { val: 8, label: "Août" }, { val: 9, label: "Septembre" },
        { val: 10, label: "Octobre" }, { val: 11, label: "Novembre" }, { val: 12, label: "Décembre" },
    ];

    const formatMontant = (montant: number) => {
        return new Intl.NumberFormat('fr-FR').format(montant);
    };

    const filtered = (brouillon || []).filter((b: any) => {
        const full = `${b.user?.nom} ${b.user?.prenom} ${b.user?.matricule}`.toLowerCase();
        return full.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Traitement de la Paie</h1>
                    <p className="text-muted-foreground text-sm">Ajustement des variables mensuelles avant validation</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                <div className="flex gap-4">
                    <Select value={selectedMois.toString()} onValueChange={(v) => setSelectedMois(parseInt(v))}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Mois" />
                        </SelectTrigger>
                        <SelectContent>
                            {moisOptions.map(m => (
                                <SelectItem key={m.val} value={m.val.toString()}>{m.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedAnnee.toString()} onValueChange={(v) => setSelectedAnnee(parseInt(v))}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Année" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2026">2026</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="secondary" onClick={handleGenerer} disabled={isGenerating}>
                        <Play className="mr-2 h-4 w-4" /> {isGenerating ? "Calcul..." : "Initialiser le mois"}
                    </Button>
                </div>
            </div>

            {brouillon === undefined ? (
                <div className="h-48 flex items-center justify-center text-muted-foreground">Chargement des variables du mois...</div>
            ) : brouillon.length === 0 ? (
                <div className="text-center py-16 bg-muted/10 border border-dashed rounded-lg">
                    <Calculator className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground">Aucun brouillon de paie</h3>
                    <p className="text-sm text-muted-foreground mt-1">Cliquez sur « Initialiser le mois » pour pré-remplir les salaires.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="relative w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher un agent..."
                                className="pl-8 bg-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="text-sm font-medium text-muted-foreground">
                            {brouillon.length} bulletins en brouillon
                        </div>
                        <Button className="bg-[#1B4F72] hover:bg-[#1B4F72]/90" onClick={handleValider} disabled={isValidating}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Clôturer et Valider la Paie
                        </Button>
                    </div>

                    <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
                        <Table className="text-xs">
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[200px]">Agent</TableHead>
                                    <TableHead>Salaire Base</TableHead>
                                    <TableHead>Primes</TableHead>
                                    <TableHead>Indemnités</TableHead>
                                    <TableHead>A. Primes</TableHead>
                                    <TableHead className="bg-red-50 text-red-700">Ret. CNSS</TableHead>
                                    <TableHead className="bg-red-50 text-red-700">Ret. Impôt</TableHead>
                                    <TableHead className="bg-red-50 text-red-700">A. Retenues</TableHead>
                                    <TableHead className="text-right font-bold text-[#1B4F72] text-sm">Net à Payer</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((b: any) => (
                                    <TableRow key={b._id} className="hover:bg-transparent">
                                        <TableCell className="font-medium">
                                            <div className="truncate w-[180px]" title={`${b.user?.prenom} ${b.user?.nom}`}>
                                                {b.user?.prenom} {b.user?.nom}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">{b.user?.matricule} • {b.agent?.grade}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Input type="number" defaultValue={b.salaireBase} onBlur={(e) => handleCellChange(b._id, 'salaireBase', e.target.value)} className="h-7 text-xs w-[90px] p-1 text-right" />
                                        </TableCell>
                                        <TableCell>
                                            <Input type="number" defaultValue={b.primesTerrain} onBlur={(e) => handleCellChange(b._id, 'primesTerrain', e.target.value)} className="h-7 text-xs w-[80px] p-1 text-right" />
                                        </TableCell>
                                        <TableCell>
                                            <Input type="number" defaultValue={b.indemnitesProvinciales} onBlur={(e) => handleCellChange(b._id, 'indemnitesProvinciales', e.target.value)} className="h-7 text-xs w-[80px] p-1 text-right" />
                                        </TableCell>
                                        <TableCell>
                                            <Input type="number" defaultValue={b.autresPrimes} onBlur={(e) => handleCellChange(b._id, 'autresPrimes', e.target.value)} className="h-7 text-xs w-[80px] p-1 text-right" />
                                        </TableCell>
                                        <TableCell className="bg-red-50/50">
                                            <Input type="number" defaultValue={b.retenueCNSS} onBlur={(e) => handleCellChange(b._id, 'retenueCNSS', e.target.value)} className="h-7 text-xs w-[80px] p-1 text-right text-red-700 font-medium" />
                                        </TableCell>
                                        <TableCell className="bg-red-50/50">
                                            <Input type="number" defaultValue={b.retenueImpot} onBlur={(e) => handleCellChange(b._id, 'retenueImpot', e.target.value)} className="h-7 text-xs w-[80px] p-1 text-right text-red-700 font-medium" />
                                        </TableCell>
                                        <TableCell className="bg-red-50/50">
                                            <Input type="number" defaultValue={b.autresRetenues} onBlur={(e) => handleCellChange(b._id, 'autresRetenues', e.target.value)} className="h-7 text-xs w-[80px] p-1 text-right text-red-700 font-medium" />
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-sm text-[#1B4F72]">
                                            {formatMontant(b.netAPayer)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
}
