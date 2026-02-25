"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, Calendar as CalendarIcon, FilterX } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminAuditPage() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [moduleFilter, setModuleFilter] = useState("tous");

    // In a real application, we would use PaginatedQuery for large datasets.
    // For the demo and Phase 2, we fetch a limited list to demonstrate the UI.
    const auditResult = useQuery(api.admin.audit.listLogs, user?._id ? { adminId: user._id, limit: 100 } : "skip");

    if (!auditResult) {
        return <div className="flex h-48 items-center justify-center text-muted-foreground">Chargement du journal d'audit...</div>;
    }

    const logs = auditResult.page;

    const filteredLogs = logs.filter((log) => {
        const matchesSearch =
            log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log as any).userName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesModule = moduleFilter === "tous" || log.module === moduleFilter;

        return matchesSearch && matchesModule;
    });

    const handleExport = () => {
        // Generate a simple CSV for the demo
        const headers = ["Date", "Utilisateur", "Action", "Module", "Détails", "Adresse IP"];
        const csvContent = [
            headers.join(";"),
            ...filteredLogs.map(log => [
                new Date(log.timestamp).toISOString(),
                (log as any).userName,
                log.action,
                log.module,
                `"${log.details.replace(/"/g, '""')}"`,
                log.ipAddress
            ].join(";"))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `agasa_audit_logs_${format(new Date(), "yyyyMMdd")}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-agasa-primary">Journal d'Audit</h1>
                    <p className="text-muted-foreground mt-1">Traçabilité complète des actions effectuées sur le HUB AGASA-Core.</p>
                </div>
                <Button onClick={handleExport} variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Exporter CSV
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher (action, utilisateur, détails)..."
                        className="pl-9 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        value={moduleFilter}
                        onChange={(e) => setModuleFilter(e.target.value)}
                    >
                        <option value="tous">Tous les modules</option>
                        <option value="Auth">Authentification</option>
                        <option value="Admin">Administration</option>
                        <option value="RH">Ressources Humaines</option>
                        <option value="Finance">Finances</option>
                        <option value="LIMS">LIMS</option>
                    </select>

                    {(searchTerm !== "" || moduleFilter !== "tous") && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setSearchTerm(""); setModuleFilter("tous"); }}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <FilterX className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-md border bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[180px]">Date & Heure</TableHead>
                            <TableHead>Utilisateur</TableHead>
                            <TableHead>Module</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead className="w-[300px]">Détails</TableHead>
                            <TableHead className="hidden md:table-cell text-right">IP (Client)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredLogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    Aucun log trouvé correspondant à vos critères.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredLogs.map((log) => (
                                <TableRow key={log._id}>
                                    <TableCell className="text-xs whitespace-nowrap">
                                        <span className="font-medium text-slate-700">
                                            {format(new Date(log.timestamp), "dd/MM/yyyy", { locale: fr })}
                                        </span>
                                        <br />
                                        <span className="text-muted-foreground">
                                            {format(new Date(log.timestamp), "HH:mm:ss", { locale: fr })}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-medium text-sm">{(log as any).userName}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-800 border-blue-200">
                                            {log.module}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-xs uppercase font-mono tracking-tight text-slate-600">
                                        {log.action}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        <span className="truncate block max-w-[280px]" title={log.details}>
                                            {log.details}
                                        </span>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-right text-xs font-mono text-muted-foreground">
                                        {log.ipAddress}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <p>Affichage de {filteredLogs.length} entrée(s) de journal</p>
                <p className="text-xs">Les données sont conservées pendant 5 ans conformément à la politique de sécurité locale.</p>
            </div>
        </div>
    );
}
