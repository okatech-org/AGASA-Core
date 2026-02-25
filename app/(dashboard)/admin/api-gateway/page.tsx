"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, ArrowRightLeft, CheckCircle2, AlertCircle, RefreshCcw, PauseCircle, ServerCrash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminGatewayPage() {
    const { user } = useAuth();
    const fluxStats = useQuery(api.admin.gateway.getFluxStats, user?._id ? { adminId: user._id } : "skip");

    if (!fluxStats) {
        return <div className="flex h-48 items-center justify-center text-muted-foreground">Vérification de l'état des interfaces en cours...</div>;
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "actif": return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
            case "erreur": return <ServerCrash className="h-5 w-5 text-destructive" />;
            case "inactif": return <PauseCircle className="h-5 w-5 text-muted-foreground" />;
            default: return <AlertCircle className="h-5 w-5 text-amber-500" />;
        }
    };

    const activeCount = fluxStats.filter(f => f.status === "actif").length;
    const errorCount = fluxStats.filter(f => f.status === "erreur").length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-agasa-primary">Monitoring API Gateway</h1>
                    <p className="text-muted-foreground mt-1">Supervision des flux de données inter-applications du hub digital AGASA.</p>
                </div>
                <Button variant="outline" className="gap-2">
                    <RefreshCcw className="h-4 w-4" />
                    Actualiser les métriques
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Interfaces Actives</CardTitle>
                        <ArrowRightLeft className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{activeCount} / {fluxStats.length}</div>
                        <p className="text-xs text-muted-foreground">Flux opérationnels</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Erreurs d'Intégration</CardTitle>
                        <ServerCrash className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{errorCount}</div>
                        <p className="text-xs text-muted-foreground">Nécessitent une intervention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Volume Total (24h)</CardTitle>
                        <Activity className="h-4 w-4 text-agasa-accent" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {fluxStats.reduce((acc, curr) => acc + curr.req24h, 0).toLocaleString("fr-GA")}
                        </div>
                        <p className="text-xs text-muted-foreground">Messages traités</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>État des Flux</CardTitle>
                    <CardDescription>Vue détaillée des connexions aux applications métiers (Sydonia, e-Tax, AGASA-Pro...).</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="w-[80px]">Statut</TableHead>
                                    <TableHead>Identifiant</TableHead>
                                    <TableHead>Source & Destination</TableHead>
                                    <TableHead className="text-right">Messages (24h)</TableHead>
                                    <TableHead className="text-right">Taux de Succès</TableHead>
                                    <TableHead>Dernier Message</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fluxStats.map((flux) => (
                                    <TableRow key={flux.code} className={flux.status === "erreur" ? "bg-red-50/50" : ""}>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center" title={`Statut: ${flux.status}`}>
                                                {getStatusIcon(flux.status)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-semibold text-agasa-primary">{flux.code}</div>
                                            <div className="text-xs text-muted-foreground">{flux.nom}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                <span className="bg-slate-100 px-2 py-1 rounded">{flux.source}</span>
                                                <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                                                <span className="bg-slate-100 px-2 py-1 rounded">{flux.dest}</span>
                                            </div>
                                            {flux.error && (
                                                <div className="text-xs text-destructive mt-1 mt-1 font-medium bg-red-100/50 px-2 py-1 rounded">
                                                    Erreur: {flux.error}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-sm">
                                            {flux.req24h > 0 ? flux.req24h.toLocaleString("fr-GA") : "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {flux.req24h > 0 ? (
                                                <span className={flux.successRate < 95 ? "text-amber-600 font-bold" : "text-emerald-600 font-medium"}>
                                                    {flux.successRate}%
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">N/A</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {flux.req24h > 0 ? (
                                                formatDistanceToNow(new Date(flux.lastMsg), { addSuffix: true, locale: fr })
                                            ) : (
                                                "Aucun flux récent"
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" className="text-xs">
                                                Détails
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
