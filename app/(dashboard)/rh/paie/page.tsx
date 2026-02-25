"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { FileText, Calculator, Download, CheckCircle, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PaiePage() {
    const { user } = useAuth();
    const router = useRouter();
    const bulletins = useQuery(api.rh.paie.listBulletins, user?._id ? { userId: user._id } : "skip");
    const calculerPaie = useMutation(api.rh.paie.calculerPaieMois);
    const validerPaie = useMutation(api.rh.paie.validerPaie);

    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [isCalculating, setIsCalculating] = useState(false);

    const isDAF = user?.role === "admin_systeme" || user?.direction === "DAF" || user?.demoSimulatedRole === "admin_systeme";

    const filteredBulletins = bulletins?.filter((b: any) => b.mois === selectedMonth && b.annee === selectedYear) || [];

    const formatCFA = (montant: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(montant);
    };

    const hasCalculated = filteredBulletins.length > 0;
    const allValidated = hasCalculated && filteredBulletins.every((b: any) => b.statut === "valide");

    const handleCalculer = async () => {
        if (!user?._id) return;
        setIsCalculating(true);
        try {
            const count = await calculerPaie({
                adminId: user._id,
                mois: selectedMonth,
                annee: selectedYear
            });
            toast.success("Calcul Terminé", { description: `${count} bulletins ont été générés.` });
        } catch (error: any) {
            toast.error("Erreur", { description: error.message });
        } finally {
            setIsCalculating(false);
        }
    };

    const handleValider = async () => {
        if (!user?._id) return;
        try {
            await validerPaie({
                adminId: user._id,
                mois: selectedMonth,
                annee: selectedYear
            });
            toast.success("Paie Validée", { description: "Les bulletins sont désormais accessibles aux agents." });
        } catch (error: any) {
            toast.error("Erreur", { description: error.message });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Traitement de la Paie</h1>
                    <p className="text-muted-foreground text-sm">Génération et consultation des bulletins de salaire</p>
                </div>

                <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-md border">
                    <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                        <SelectTrigger className="w-[140px] bg-background border-none shadow-none"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 12 }).map((_, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>
                                    {new Date(0, i).toLocaleString('fr-FR', { month: 'long' }).toUpperCase()}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                        <SelectTrigger className="w-[100px] bg-background border-none shadow-none"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2026">2026</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {isDAF && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2 border shadow-sm border-l-4 border-l-[#1B4F72]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Opérations DAF</CardTitle>
                            <CardDescription>Actions pour le mois de {new Date(0, selectedMonth - 1).toLocaleString('fr-FR', { month: 'long' })} {selectedYear}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex gap-4">
                            <Button
                                onClick={handleCalculer}
                                disabled={isCalculating || allValidated}
                                variant={hasCalculated ? "outline" : "default"}
                                className={!hasCalculated ? "bg-[#1B4F72] hover:bg-[#1B4F72]/90" : ""}
                            >
                                <Calculator className="mr-2 h-4 w-4" />
                                {hasCalculated ? "Recalculer la paie" : "Lancer le calcul"}
                            </Button>

                            <Button
                                onClick={handleValider}
                                disabled={!hasCalculated || allValidated}
                                className={hasCalculated && !allValidated ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                                variant={hasCalculated && !allValidated ? "default" : "secondary"}
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {allValidated ? "Paie Validée" : "Valider et Publier"}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-muted/30">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-muted-foreground text-sm">Statut</span>
                                {allValidated ? <Badge className="bg-green-100 text-green-800 border-green-200">Clôturé</Badge> :
                                    hasCalculated ? <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">En révision</Badge> :
                                        <Badge variant="outline">Non calculé</Badge>}
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground text-sm">Bulletins émis</span>
                                <span className="font-bold text-xl">{filteredBulletins.length}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card className="border shadow-sm">
                <CardHeader className="bg-muted/10 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        Liste des bulletins
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/5">
                                <TableHead>Agent</TableHead>
                                <TableHead>Matricule</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead className="text-right">Salaire Brut</TableHead>
                                <TableHead className="text-right">Net à Payer</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBulletins.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                        <FileText className="h-8 w-8 mx-auto mb-3 opacity-20" />
                                        Aucun bulletin généré pour cette période.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBulletins.map((b: any) => {
                                    const brut = b.salaireBase + b.primesTerrain + b.indemnitesProvinciales + b.autresPrimes;
                                    return (
                                        <TableRow key={b._id}>
                                            <TableCell className="font-medium">{b.user?.prenom} {b.user?.nom}</TableCell>
                                            <TableCell className="font-mono text-xs">{b.user?.matricule}</TableCell>
                                            <TableCell>{b.agent?.grade}</TableCell>
                                            <TableCell className="text-right text-muted-foreground">{formatCFA(brut)}</TableCell>
                                            <TableCell className="text-right font-bold text-[#1B4F72]">{formatCFA(b.netAPayer)}</TableCell>
                                            <TableCell>
                                                {b.statut === "valide" ? (
                                                    <Badge className="bg-green-100 text-green-800 border-green-200 font-normal"><CheckCircle className="mr-1 h-3 w-3" /> Validé</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="font-normal text-muted-foreground"><Clock className="mr-1 h-3 w-3" /> Calculé</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => router.push(`/rh/paie/${b._id}`)}
                                                    disabled={!isDAF && b.statut !== "valide"}
                                                >
                                                    <Eye className="h-4 w-4 mr-2" /> Voir
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
