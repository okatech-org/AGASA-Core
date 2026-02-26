"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search, Download, FileSearch, Filter, Loader2,
} from "lucide-react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

const modules = ["Tous", "RH", "FINANCE", "GED", "LIMS", "LOGISTIQUE", "ADMIN", "ALERTES"];

export default function AuditJournalPage() {
    const { user } = useAuth();
    const userId = user?._id;
    const [search, setSearch] = useState("");
    const [moduleFilter, setModuleFilter] = useState("Tous");

    const logs = useQuery(api.audit.stats.getJournal, userId ? {
        userId,
        module: moduleFilter !== "Tous" ? moduleFilter : undefined,
    } : "skip");

    const filtered = (logs ?? []).filter((log: any) => {
        if (!search) return true;
        const full = `${log.utilisateur} ${log.action} ${log.details} ${log.ipAddress}`.toLowerCase();
        return full.includes(search.toLowerCase());
    });

    const handleExport = () => {
        const csv = [
            "Date;Utilisateur;Rôle;Module;Action;IP;Détails",
            ...filtered.map((l: any) => `${new Date(l.timestamp).toLocaleString("fr-FR")};${l.utilisateur};${l.role};${l.module};${l.action};${l.ipAddress};${l.details}`)
        ].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit_journal_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
    };

    if (logs === undefined) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <FileSearch className="h-7 w-7 text-slate-700" /> Journal d&apos;audit complet
                    </h1>
                    <p className="text-muted-foreground text-sm">Historique exhaustif de toutes les actions du système — Lecture seule</p>
                </div>
                <Button variant="outline" onClick={handleExport} className="gap-2">
                    <Download className="h-4 w-4" /> Exporter CSV
                </Button>
            </div>

            <Card className="shadow-sm">
                <CardHeader className="bg-slate-50 border-b pb-3 flex flex-row items-center gap-4 flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Rechercher par utilisateur, action, IP..." className="pl-9 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <Select value={moduleFilter} onValueChange={setModuleFilter}>
                        <SelectTrigger className="w-[180px] h-9">
                            <Filter className="h-3.5 w-3.5 mr-1" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {modules.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground">{filtered.length} entrées</span>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="w-[150px]">Date / Heure</TableHead>
                                <TableHead>Utilisateur</TableHead>
                                <TableHead>Rôle</TableHead>
                                <TableHead>Module</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>IP</TableHead>
                                <TableHead>Détails</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-12">
                                        Aucune entrée d&apos;audit trouvée.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((log: any, i: number) => (
                                    <TableRow key={log._id ?? i} className="hover:bg-slate-50/60">
                                        <TableCell className="text-xs font-mono text-slate-500">{new Date(log.timestamp).toLocaleString("fr-FR")}</TableCell>
                                        <TableCell className="font-medium text-sm">{log.utilisateur}</TableCell>
                                        <TableCell><Badge variant="outline" className="text-[10px] capitalize">{log.role?.replace(/_/g, " ")}</Badge></TableCell>
                                        <TableCell><Badge variant="secondary" className="text-xs">{log.module}</Badge></TableCell>
                                        <TableCell className="text-sm max-w-[250px] truncate">{log.action}</TableCell>
                                        <TableCell className="text-xs font-mono">{log.ipAddress}</TableCell>
                                        <TableCell className="text-xs text-slate-500 max-w-[200px] truncate">{log.details}</TableCell>
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
