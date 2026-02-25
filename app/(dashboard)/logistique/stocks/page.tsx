"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, PackageOpen, TrendingDown, Clock, MoveRight, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function StocksDashboardPage() {
    const { user } = useAuth();
    const router = useRouter();

    const stats = useQuery(api.logistique.stocks.getStocksStats, { userId: user?._id as any });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-[#1B4F72] pl-3">Supervision des Stocks</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Contrôle de l'inventaire matériel et alertes d'approvisionnement.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push('/logistique/stocks/mouvements')}>
                        Journal des Flux
                    </Button>
                    <Button className="bg-[#1B4F72] hover:bg-[#1B4F72]/90" onClick={() => router.push('/logistique/stocks/inventaire')}>
                        Ouvrir le Magasin Virtuel
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Références Actives</CardTitle>
                        <PackageOpen className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats ? stats.totalArticles : "-"}</div>
                        <p className="text-xs text-muted-foreground mt-1 text-emerald-600 bg-emerald-50 inline-block px-1 rounded">
                            Valeur Est. : {stats ? stats.valeurTotaleAprox.toLocaleString("fr-FR") : "-"} FCFA
                        </p>
                    </CardContent>
                </Card>
                <Card className={`shadow-sm ${stats?.produitsEnAlerteTot && stats.produitsEnAlerteTot > 0 ? "border-orange-300 bg-orange-50/40" : "border-slate-200"}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={`text-sm font-medium ${stats?.produitsEnAlerteTot && stats.produitsEnAlerteTot > 0 ? 'text-orange-900' : ''}`}>Seuils Critiques</CardTitle>
                        <TrendingDown className={`h-4 w-4 ${stats?.produitsEnAlerteTot && stats.produitsEnAlerteTot > 0 ? 'text-orange-500' : 'text-slate-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats?.produitsEnAlerteTot && stats.produitsEnAlerteTot > 0 ? 'text-orange-700' : ''}`}>
                            {stats ? stats.produitsEnAlerteTot : "-"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Articles nécessitant réappro</p>
                    </CardContent>
                </Card>
                <Card className={`shadow-sm ${stats?.produitsExpiresProches && stats.produitsExpiresProches > 0 ? "border-red-300 bg-red-50/40" : "border-slate-200"}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={`text-sm font-medium ${stats?.produitsExpiresProches && stats.produitsExpiresProches > 0 ? 'text-red-900' : ''}`}>Péremptions (&lt; 30j)</CardTitle>
                        <Clock className={`h-4 w-4 ${stats?.produitsExpiresProches && stats.produitsExpiresProches > 0 ? 'text-red-500' : 'text-slate-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats?.produitsExpiresProches && stats.produitsExpiresProches > 0 ? 'text-red-700' : ''}`}>
                            {stats ? stats.produitsExpiresProches : "-"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Lot(s) arrivant à échéance</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200 bg-slate-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Répartition par pôle</CardTitle>
                        <MoveRight className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                            <div className="flex justify-between border-b pb-1"><span className="text-muted-foreground">Réactifs LAA</span> <span className="font-medium">{stats?.repartitionCategories.reactifs}</span></div>
                            <div className="flex justify-between border-b pb-1 pl-2"><span className="text-muted-foreground">Fournitures</span> <span className="font-medium">{stats?.repartitionCategories.consommables}</span></div>
                            <div className="flex justify-between pt-1"><span className="text-muted-foreground">Équipements</span> <span className="font-medium">{stats?.repartitionCategories.equipements}</span></div>
                            <div className="flex justify-between pt-1 pl-2"><span className="text-muted-foreground">Pièces Auto</span> <span className="font-medium">{stats?.repartitionCategories.pieces}</span></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Alertes d'inventaire */}
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50/50 border-b pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg text-red-700">
                            <AlertCircle className="w-5 h-5" /> Ruptures & Planchers (Top 5)
                        </CardTitle>
                        <CardDescription>Articles ayant atteint ou franchi le seuil de sécurité.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Référence</TableHead>
                                    <TableHead>Qte Dispo</TableHead>
                                    <TableHead>Statut</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!stats ? (
                                    <TableRow><TableCell colSpan={3} className="text-center py-4">Recherche...</TableCell></TableRow>
                                ) : stats.alertesUrgentes.length === 0 ? (
                                    <TableRow><TableCell colSpan={3} className="text-center py-6 text-emerald-600 font-medium bg-emerald-50/20">Aucune alerte de stock.</TableCell></TableRow>
                                ) : (
                                    stats.alertesUrgentes.map(a => (
                                        <TableRow key={a._id} className="cursor-pointer hover:bg-slate-50">
                                            <TableCell>
                                                <div className="font-medium text-slate-900">{a.designation}</div>
                                                <div className="text-xs text-muted-foreground font-mono">{a.reference}</div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-bold text-red-600 text-lg">{a.quantite}</span>
                                                <span className="text-xs text-muted-foreground ml-1">{a.unite}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="destructive" className={a.statut === "rupture" ? "bg-red-600" : "bg-orange-500"}>
                                                    {a.statut.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Derniers mouvements */}
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50/50 border-b pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <RefreshCw className="w-5 h-5" /> Flux Récents (Top 5)
                        </CardTitle>
                        <CardDescription>Dernières sorties ou réceptions enregistrées.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Détail</TableHead>
                                    <TableHead className="text-right">Volume</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!stats ? (
                                    <TableRow><TableCell colSpan={4} className="text-center py-4">Recherche...</TableCell></TableRow>
                                ) : stats.mouvementsRecents.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="text-center py-4 text-muted-foreground">Pas de mouvements récents.</TableCell></TableRow>
                                ) : (
                                    stats.mouvementsRecents.map(m => (
                                        <TableRow key={m._id}>
                                            <TableCell>
                                                {m.type === "entree" && <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"><ArrowUpRight className="w-3 h-3 mr-1" /> Entrée</Badge>}
                                                {m.type === "sortie" && <Badge className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200"><ArrowDownRight className="w-3 h-3 mr-1" /> Sortie</Badge>}
                                                {m.type === "ajustement" && <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"><RefreshCw className="w-3 h-3 mr-1" /> Ajust.</Badge>}
                                            </TableCell>
                                            <TableCell className="text-xs whitespace-nowrap">{new Date(m.dateMouvement).toLocaleDateString("fr-FR")}</TableCell>
                                            <TableCell className="text-sm truncate max-w-[120px]">{m.motif}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                <span className={m.type === "entree" ? "text-emerald-600" : (m.type === "sortie" ? "text-orange-600" : "text-blue-600")}>
                                                    {m.type === "entree" ? "+" : (m.type === "sortie" ? "-" : "")}{m.quantite}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
