"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search, Download, FileSearch, Filter,
} from "lucide-react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

const demoLogs = [
    { date: "25/02/2026 14:22", utilisateur: "M. Obiang", role: "admin_systeme", module: "Utilisateurs", action: "Modification du rôle de Mme Nzé", ip: "41.158.22.11", details: "agent → directeur" },
    { date: "25/02/2026 13:10", utilisateur: "DG", role: "directeur_general", module: "Workflows", action: "Validation du workflow WF-2026-0045", ip: "41.158.22.44", details: "Marché de réactifs — 12M FCFA" },
    { date: "25/02/2026 11:45", utilisateur: "Mme Nzé", role: "technicien_laa", module: "LIMS", action: "Saisie résultat analyse AN-2026-0089", ip: "41.158.22.56", details: "Salmonella — CONFORME" },
    { date: "25/02/2026 10:30", utilisateur: "M. Ondo", role: "directeur", module: "RH", action: "Validation congé — Ndong Paul (3j)", ip: "41.158.45.22", details: "Congé annuel approuvé" },
    { date: "25/02/2026 09:15", utilisateur: "Admin Système", role: "admin_systeme", module: "Configuration", action: "Modification politique mot de passe", ip: "41.158.22.11", details: "Longueur min 12 → 14" },
    { date: "24/02/2026 18:00", utilisateur: "DG", role: "directeur_general", module: "Signatures", action: "Signature document DOC-2026-0123", ip: "41.158.22.44", details: "Décision N°12/DG — Réorganisation LAA" },
    { date: "24/02/2026 16:45", utilisateur: "Mme Mouele", role: "agent", module: "RH", action: "Soumission demande de congé", ip: "41.158.45.33", details: "Congé annuel — 5 jours" },
    { date: "24/02/2026 15:20", utilisateur: "M. Obiang", role: "admin_systeme", module: "Sécurité", action: "Déverrouillage compte marc.mba@agasa.ga", ip: "41.158.22.11", details: "Compte bloqué après 7 tentatives" },
    { date: "24/02/2026 14:00", utilisateur: "Mme Nzé", role: "technicien_laa", module: "LIMS", action: "Enregistrement échantillon ECH-2026-00456", ip: "41.158.22.56", details: "Viande bovine — Inspection terrain" },
    { date: "24/02/2026 12:30", utilisateur: "M. Bongo", role: "directeur", module: "Finance", action: "Consultation budget DAF", ip: "41.158.12.78", details: "Budget Q1 2026 — 85% consommé" },
    { date: "24/02/2026 11:00", utilisateur: "Admin Système", role: "admin_systeme", module: "API Gateway", action: "Redémarrage flux F3 (AGASA-Inspect)", ip: "41.158.22.11", details: "Erreur timeout résolu" },
    { date: "24/02/2026 09:30", utilisateur: "DG", role: "directeur_general", module: "BI", action: "Export rapport mensuel — Février 2026", ip: "41.158.22.44", details: "Format PDF — Rapport opérationnel" },
];

const modules = ["Tous", "Utilisateurs", "Workflows", "LIMS", "RH", "Configuration", "Signatures", "Sécurité", "Finance", "API Gateway", "BI"];

export default function AuditJournalPage() {
    const [search, setSearch] = useState("");
    const [moduleFilter, setModuleFilter] = useState("Tous");

    const filtered = demoLogs.filter(log => {
        const matchSearch = `${log.utilisateur} ${log.action} ${log.details} ${log.ip}`.toLowerCase().includes(search.toLowerCase());
        const matchModule = moduleFilter === "Tous" || log.module === moduleFilter;
        return matchSearch && matchModule;
    });

    const handleExport = () => {
        const csv = [
            "Date;Utilisateur;Rôle;Module;Action;IP;Détails",
            ...filtered.map(l => `${l.date};${l.utilisateur};${l.role};${l.module};${l.action};${l.ip};${l.details}`)
        ].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit_journal_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
    };

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
                            {filtered.map((log, i) => (
                                <TableRow key={i} className="hover:bg-slate-50/60">
                                    <TableCell className="text-xs font-mono text-slate-500">{log.date}</TableCell>
                                    <TableCell className="font-medium text-sm">{log.utilisateur}</TableCell>
                                    <TableCell><Badge variant="outline" className="text-[10px] capitalize">{log.role.replace(/_/g, " ")}</Badge></TableCell>
                                    <TableCell><Badge variant="secondary" className="text-xs">{log.module}</Badge></TableCell>
                                    <TableCell className="text-sm max-w-[250px] truncate">{log.action}</TableCell>
                                    <TableCell className="text-xs font-mono">{log.ip}</TableCell>
                                    <TableCell className="text-xs text-slate-500 max-w-[200px] truncate">{log.details}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
