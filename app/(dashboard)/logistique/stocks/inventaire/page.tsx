"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Plus, FlaskConical, Wrench, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InventaireCompletPage() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [categorie, setCategorie] = useState("toutes");
    const [statut, setStatut] = useState("tous");

    const inventaire = useQuery(api.logistique.stocks.listerInventaire, {
        userId: user?._id as any,
        categorie: categorie === "toutes" ? undefined : categorie,
        statut: statut === "tous" ? undefined : statut
    });

    const getCategorieIcon = (cat: string) => {
        switch (cat) {
            case "reactif": return <FlaskConical className="w-4 h-4 text-purple-600" />;
            case "piece_rechange": return <Wrench className="w-4 h-4 text-slate-600" />;
            case "equipement": return <ShieldAlert className="w-4 h-4 text-cyan-600" />;
            default: return <Building2 className="w-4 h-4 text-emerald-600" />; // Consommable
        }
    };

    const filtered = (inventaire || []).filter(a =>
        a.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.reference.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-[#1B4F72] pl-3">Inventaire Global</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Répertoire exhaustif du magasin central et sous-magasins.</p>
                </div>
                <div className="flex gap-2">
                    <Button className="bg-[#1B4F72] hover:bg-[#1B4F72]/90">
                        <Plus className="w-4 h-4 mr-2" /> Référencer Matériel
                    </Button>
                </div>
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50/50 border-b pb-4 flex flex-col md:flex-row md:justify-between md:items-center p-4">
                    <div className="flex flex-1 gap-3 flex-col md:flex-row">
                        <Input
                            placeholder="Rechercher code, désignation..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-xs bg-white"
                        />
                        <Select value={categorie} onValueChange={setCategorie}>
                            <SelectTrigger className="w-[180px] bg-white">
                                <SelectValue placeholder="Catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="toutes">Toutes les Familles</SelectItem>
                                <SelectItem value="reactif">Réactifs Labo</SelectItem>
                                <SelectItem value="consommable">Consommables Bx</SelectItem>
                                <SelectItem value="equipement">EPI & Matériel</SelectItem>
                                <SelectItem value="piece_rechange">Pièces Auto</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statut} onValueChange={setStatut}>
                            <SelectTrigger className="w-[150px] bg-white">
                                <SelectValue placeholder="État du stock" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="tous">Tous les états</SelectItem>
                                <SelectItem value="ok">Stock Normal</SelectItem>
                                <SelectItem value="alerte">Seuil Critique</SelectItem>
                                <SelectItem value="rupture">En Rupture</SelectItem>
                                <SelectItem value="perime">Périmé</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="text-sm text-muted-foreground ml-auto whitespace-nowrap py-2 md:py-0">
                        {filtered.length} article(s) trouvé(s)
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead>Code Article</TableHead>
                                <TableHead>Désignation & Fournisseur</TableHead>
                                <TableHead>Famille</TableHead>
                                <TableHead className="text-right">Volume Dispo</TableHead>
                                <TableHead className="text-right">Seuil Sécurité</TableHead>
                                <TableHead>État</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inventaire === undefined ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground animate-pulse">Extraction de la base de données...</TableCell></TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Aucune référence matérielle ne correspond.</TableCell></TableRow>
                            ) : (
                                filtered.map(item => (
                                    <TableRow key={item._id} className="cursor-pointer hover:bg-slate-50">
                                        <TableCell className="font-mono text-xs font-semibold text-slate-700">{item.reference}</TableCell>
                                        <TableCell>
                                            <div className="font-medium text-slate-900">{item.designation}</div>
                                            <div className="text-xs text-muted-foreground">{item.fournisseur}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize flex gap-1 w-max items-center font-normal bg-slate-50">
                                                {getCategorieIcon(item.categorie)}
                                                {item.categorie.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <span className={`text-lg font-bold ${item.quantite <= item.seuilAlerte ? 'text-red-600' : 'text-slate-800'}`}>
                                                    {item.quantite.toLocaleString("fr-FR")}
                                                </span>
                                                <span className="text-xs text-muted-foreground">{item.unite}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground text-sm">
                                            {item.seuilAlerte} {item.unite}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={item.statut === 'ok' ? 'default' : (item.statut === 'rupture' ? 'destructive' : 'secondary')}
                                                className={item.statut === 'ok' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' :
                                                    (item.statut === 'alerte' ? 'bg-orange-100 text-orange-800' :
                                                        (item.statut === 'rupture' ? 'bg-red-600 text-white' : 'bg-slate-800 text-white'))}>
                                                {item.statut.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
