"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import {
    Users, Plus, Search, Filter, Download, LayoutGrid, List,
    MoreHorizontal, Eye, Edit, Trash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";

export default function RHAgentList() {
    const { user } = useAuth();
    const router = useRouter();
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [directionFilter, setDirectionFilter] = useState("Toutes");
    const [provinceFilter, setProvinceFilter] = useState("Toutes");

    // We pass explicit filters to the backend to optimize, but search is done client-side for immediate feedback
    const agents = useQuery(api.rh.agents.listAgents, user?._id ? {
        userId: user._id,
        direction: directionFilter !== "Toutes" ? directionFilter : undefined,
        province: provinceFilter !== "Toutes" ? provinceFilter : undefined,
    } : "skip");

    const hasWriteAccess = user?.role === "admin_systeme" || user?.role === "directeur_general" || user?.role === "directeur" || user?.role === "chef_service" || user?.demoSimulatedRole === "admin_systeme" || user?.demoSimulatedRole === "chef_service";

    // Client-side filtering for Search, Grade, Statut
    const filteredAgents = agents?.filter((agent: any) => {
        const matchesSearch =
            agent.user?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.user?.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.user?.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.poste.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    }) || [];

    const getStatusColor = (statut: string) => {
        switch (statut) {
            case "en_poste": return "bg-green-100 text-green-800 border-green-200";
            case "détaché": return "bg-blue-100 text-blue-800 border-blue-200";
            case "suspendu": return "bg-red-100 text-red-800 border-red-200";
            case "retraité": return "bg-gray-100 text-gray-800 border-gray-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getInitials = (nom: string, prenom: string) => {
        return `${prenom?.[0] || ""}${nom?.[0] || ""}`;
    };

    const exportToCSV = () => {
        if (!filteredAgents.length) return;
        const headers = ["Matricule", "Nom", "Prénom", "Poste", "Direction", "Province", "Statut", "Type Contrat"];

        const escapeCSV = (str: string) => {
            if (!str) return '""';
            const stringified = String(str);
            if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n')) {
                return `"${stringified.replace(/"/g, '""')}"`;
            }
            return `"${stringified}"`;
        };

        const rows = filteredAgents.map((a: any) => [
            a.user?.matricule || "",
            a.user?.nom || "",
            a.user?.prenom || "",
            a.poste || "",
            a.direction || "",
            a.province || "",
            a.statut || "",
            a.contratType || ""
        ].map(escapeCSV).join(','));

        const csvContent = "\uFEFF" + headers.map(escapeCSV).join(",") + "\n" + rows.join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `agents_agasa_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Gestion des Agents</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Organigramme et fiches du personnel AGASA</p>
                </div>
                {hasWriteAccess && (
                    <Button onClick={() => router.push("/rh/agents/nouveau")} className="bg-[#1B4F72] hover:bg-[#1B4F72]/90">
                        <Plus className="mr-2 h-4 w-4" />
                        Nouvel Agent
                    </Button>
                )}
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between bg-card p-4 rounded-lg border shadow-sm">
                <div className="flex flex-1 flex-col sm:flex-row gap-4">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher nom, matricule, poste..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Select value={directionFilter} onValueChange={setDirectionFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Direction" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Toutes">Toutes les directions</SelectItem>
                            <SelectItem value="DG">Direction Générale</SelectItem>
                            <SelectItem value="DERSP">DERSP</SelectItem>
                            <SelectItem value="DICSP">DICSP</SelectItem>
                            <SelectItem value="DAF">DAF</SelectItem>
                            <SelectItem value="LAA">Laboratoire (LAA)</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={provinceFilter} onValueChange={setProvinceFilter}>
                        <SelectTrigger className="w-full sm:w-[150px]">
                            <SelectValue placeholder="Province" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Toutes">Toutes provinces</SelectItem>
                            <SelectItem value="Siège">Siège (Estuaire)</SelectItem>
                            <SelectItem value="Estuaire">Estuaire</SelectItem>
                            <SelectItem value="Haut-Ogooué">Haut-Ogooué</SelectItem>
                            <SelectItem value="Ogooué-Maritime">Ogooué-Maritime</SelectItem>
                            {/* ...autres provinces */}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setViewMode("list")} className={viewMode === "list" ? "bg-accent" : ""}>
                        <List className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setViewMode("grid")} className={viewMode === "grid" ? "bg-accent" : ""}>
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={exportToCSV}>
                        <Download className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                </div>
            </div>

            {/* Agents List/Grid */}
            {!agents ? (
                <div className="flex h-48 items-center justify-center text-muted-foreground">Chargement des agents...</div>
            ) : filteredAgents.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-center text-muted-foreground bg-card border border-dashed rounded-lg">
                    <Users className="h-10 w-10 mb-2 opacity-20" />
                    <p>Aucun agent trouvé avec ces critères.</p>
                </div>
            ) : viewMode === "list" ? (
                // TABLE VIEW
                <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Agent</TableHead>
                                <TableHead>Poste / Service</TableHead>
                                <TableHead>Direction</TableHead>
                                <TableHead>Province</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAgents.map((agent: any) => (
                                <TableRow key={agent._id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={agent.user?.avatar} />
                                                <AvatarFallback className="bg-primary/10 text-primary uppercase text-xs">
                                                    {getInitials(agent.user?.nom, agent.user?.prenom)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span>{agent.user?.prenom} {agent.user?.nom}</span>
                                                <span className="text-xs text-muted-foreground">{agent.user?.matricule}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{agent.poste}</span>
                                            <span className="text-xs text-muted-foreground">{agent.service}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{agent.direction}</TableCell>
                                    <TableCell>{agent.province}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`${getStatusColor(agent.statut)} uppercase text-[10px]`}>
                                            {agent.statut.replace("_", " ")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Ouvrir menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => router.push(`/rh/agents/${agent._id}`)}>
                                                    <Eye className="mr-2 h-4 w-4" /> Voir le profil
                                                </DropdownMenuItem>
                                                {hasWriteAccess && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => router.push(`/rh/agents/${agent._id}/modifier`)}>
                                                            <Edit className="mr-2 h-4 w-4" /> Modifier profil
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-100">
                                                            <Trash className="mr-2 h-4 w-4" /> Archiver l'agent
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {/* Fake Pagination Footer */}
                    <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
                        <div>Affichage de 1 à {filteredAgents.length} sur {filteredAgents.length} agents</div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" disabled>Précédent</Button>
                            <Button variant="outline" size="sm" disabled>Suivant</Button>
                        </div>
                    </div>
                </div>
            ) : (
                // GRID VIEW
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredAgents.map((agent: any) => (
                        <Card key={agent._id} className="overflow-hidden group hover:shadow-md transition-shadow relative">
                            <div className="absolute top-3 right-3 z-10">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="secondary" className="h-8 w-8 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white backdrop-blur-sm border shadow-sm">
                                            <MoreHorizontal className="h-4 w-4 text-foreground" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => router.push(`/rh/agents/${agent._id}`)}>
                                            <Eye className="mr-2 h-4 w-4" /> Voir le profil
                                        </DropdownMenuItem>
                                        {hasWriteAccess && (
                                            <DropdownMenuItem onClick={() => router.push(`/rh/agents/${agent._id}/modifier`)}>
                                                <Edit className="mr-2 h-4 w-4" /> Modifier
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="h-20 bg-gradient-to-r from-slate-100 to-slate-200" />
                            <CardContent className="p-5 pt-0 text-center flex flex-col items-center">
                                <Avatar className="h-20 w-20 border-4 border-background -mt-10 mb-3 bg-secondary">
                                    <AvatarImage src={agent.user?.avatar} />
                                    <AvatarFallback className="text-xl bg-[#1B4F72] text-white">
                                        {getInitials(agent.user?.nom, agent.user?.prenom)}
                                    </AvatarFallback>
                                </Avatar>
                                <h3 className="font-semibold text-lg leading-tight truncate w-full">
                                    {agent.user?.prenom} {agent.user?.nom}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-1">{agent.user?.matricule}</p>
                                <Badge variant="secondary" className="mb-3 font-normal">
                                    {agent.poste}
                                </Badge>
                                <div className="grid grid-cols-2 w-full text-xs text-left gap-2 mb-4 bg-muted/50 p-2 rounded-md">
                                    <div>
                                        <span className="text-muted-foreground block text-[10px] uppercase">Direction</span>
                                        <span className="font-medium truncate block" title={agent.direction}>{agent.direction}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block text-[10px] uppercase">Province</span>
                                        <span className="font-medium truncate block" title={agent.province}>{agent.province}</span>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full text-sm h-8" onClick={() => router.push(`/rh/agents/${agent._id}`)}>
                                    Voir détails
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
