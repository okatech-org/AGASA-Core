"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, BarChart3, Receipt, Scale } from "lucide-react";

export default function EtatsFinanciersPage() {
    const { user } = useAuth();
    const [exercice, setExercice] = useState(new Date().getFullYear());

    const data = useQuery(api.finance.comptabilite.getEtatsFinanciers, {
        userId: user?._id as any,
        exercice
    });

    const formatMontant = (m: number) => {
        return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XAF", maximumFractionDigits: 0 }).format(m);
    };

    if (data === undefined) return <div className="p-8 text-center animate-pulse">Génération des liasses fiscales en cours...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-slate-900 pl-3">États Financiers</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Génération des documents de synthèse réglementaires (Bilan, Compte de Résultat).</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={exercice.toString()} onValueChange={(v) => setExercice(parseInt(v))}>
                        <SelectTrigger className="w-32 bg-white">
                            <SelectValue placeholder="Exercice" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={new Date().getFullYear().toString()}>{new Date().getFullYear()}</SelectItem>
                            <SelectItem value={(new Date().getFullYear() - 1).toString()}>{new Date().getFullYear() - 1}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="shadow-sm border-slate-200 hover:border-slate-300 transition-colors cursor-pointer group">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Scale className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900">Balance Générale</p>
                            <p className="text-xs text-muted-foreground mt-1">Situation exhaustive des comptes</p>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-2"><Download className="w-4 h-4 mr-2" /> PDF / Excel</Button>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200 hover:border-slate-300 transition-colors cursor-pointer group">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <BarChart3 className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900">Compte de Résultat</p>
                            <p className="text-xs text-muted-foreground mt-1">Performances Périodiques</p>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-2"><Download className="w-4 h-4 mr-2" /> PDF / Excel</Button>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200 hover:border-slate-300 transition-colors cursor-pointer group">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="h-12 w-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Receipt className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900">État Budgétaire</p>
                            <p className="text-xs text-muted-foreground mt-1">Exécution par rapport à l'alloué</p>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-2"><Download className="w-4 h-4 mr-2" /> PDF / Excel</Button>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200 hover:border-slate-300 transition-colors cursor-pointer group">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="h-12 w-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900">Rapport Cour des Comptes</p>
                            <p className="text-xs text-muted-foreground mt-1">Liasse normalisée État</p>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-2 bg-slate-900 text-white hover:bg-slate-800 border-none"><Download className="w-4 h-4 mr-2" /> Générer</Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50/50 border-b p-4">
                        <CardTitle className="text-base">Moyenne Classes Comptables (Aperçu Balance)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-white hover:bg-white text-xs">
                                    <TableHead>Classe</TableHead>
                                    <TableHead className="text-right">Débit</TableHead>
                                    <TableHead className="text-right">Crédit</TableHead>
                                    <TableHead className="text-right">Solde</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.balanceComptes.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground text-sm">Balance vide pour cet exercice.</TableCell></TableRow>
                                ) : (
                                    data.balanceComptes.map(b => (
                                        <TableRow key={b.classe}>
                                            <TableCell className="font-semibold text-slate-900">Classe {b.classe}</TableCell>
                                            <TableCell className="text-right">{formatMontant(b.debit)}</TableCell>
                                            <TableCell className="text-right">{formatMontant(b.credit)}</TableCell>
                                            <TableCell className={`text-right font-bold ${b.solde > 0 ? 'text-emerald-700' : 'text-red-700'}`}>{formatMontant(b.solde)}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full">
                        <div className="p-4 rounded-full bg-slate-50 border border-slate-100 mb-4">
                            <BarChart3 className="w-12 h-12 text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{formatMontant(data.resultatNet)}</h3>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-2">Résultat Net Provisoire</p>
                        <p className="text-xs text-muted-foreground mt-4 max-w-sm">Le résultat est estimé en temps réel sur la base des imputations en classe 6 (Charges) et 7 (Produits) validées au journal.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
