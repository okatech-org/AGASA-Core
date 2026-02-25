"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
    MoreHorizontal, Plus, Search, ShieldOff, ShieldCheck, UserX, Eye, Edit
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export default function AdminUsersPage() {
    const { user } = useAuth();
    const users = useQuery(api.admin.users.list, user?._id ? { userId: user._id } : "skip");
    const toggleStatus = useMutation(api.admin.users.toggleStatus);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("tous");

    if (!users) {
        return <div className="flex h-48 items-center justify-center text-muted-foreground">Chargement des utilisateurs...</div>;
    }

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.matricule.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "tous" || user.statut === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getRoleLabel = (role: string) => {
        const map: Record<string, string> = {
            admin_systeme: "Admin Système",
            directeur_general: "Directeur Général",
            directeur: "Directeur",
            chef_service: "Chef de Service",
            agent: "Agent",
            technicien_laa: "Technicien LAA",
            auditeur: "Auditeur",
            demo: "Mode Démo"
        };
        return map[role] || role;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "actif": return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80 border-0">Actif</Badge>;
            case "inactif": return <Badge variant="secondary" className="bg-slate-100 text-slate-800 hover:bg-slate-100/80 border-0">Inactif</Badge>;
            case "verrouille": return <Badge variant="destructive" className="bg-rose-100 text-rose-800 hover:bg-rose-100/80 border-0">Verrouillé</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleToggleStatus = async (targetUserId: Id<"users">, newStatus: "actif" | "inactif" | "verrouille") => {
        if (!user?._id) return;
        try {
            await toggleStatus({ adminId: user._id, userId: targetUserId, nouveauStatut: newStatus });
        } catch (error: any) {
            alert(error.message || "Erreur lors de la modification du statut");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-agasa-primary">Gestion des Utilisateurs</h1>
                    <p className="text-muted-foreground mt-1">Gérez les accès, les rôles et le statut des comptes.</p>
                </div>
                <Link href="/admin/utilisateurs/nouveau">
                    <Button className="bg-agasa-primary hover:bg-agasa-primary/90">
                        <Plus className="mr-2 h-4 w-4" />
                        Nouvel Utilisateur
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
                <div className="relative w-full sm:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher (nom, email, matricule)..."
                        className="pl-9 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="tous">Tous les statuts</option>
                        <option value="actif">Actifs uniquement</option>
                        <option value="verrouille">Verrouillés</option>
                        <option value="inactif">Inactifs</option>
                    </select>
                </div>
            </div>

            <div className="rounded-md border bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Matricule</TableHead>
                            <TableHead>Utilisateur</TableHead>
                            <TableHead>Rôle & Direction</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="hidden md:table-cell">Dernière Connexion</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    Aucun utilisateur trouvé.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user._id}>
                                    <TableCell className="font-medium text-xs font-mono">{user.matricule}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{user.prenom} {user.nom}</span>
                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm">{user.demoSimulatedRole ? getRoleLabel(user.demoSimulatedRole) : getRoleLabel(user.role)}</span>
                                            <span className="text-xs text-muted-foreground">{user.direction || "Général"} - {user.province}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(user.statut)}</TableCell>
                                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                        {user.derniereConnexion
                                            ? new Date(user.derniereConnexion).toLocaleDateString("fr-GA")
                                            : "Jamais"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Ouvrir le menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => alert("Profil complet bientôt disponible")}>
                                                    <Eye className="mr-2 h-4 w-4 text-muted-foreground" /> Voir le profil
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />

                                                {user.statut === "actif" && (
                                                    <DropdownMenuItem onClick={() => handleToggleStatus(user._id, "verrouille")}>
                                                        <ShieldOff className="mr-2 h-4 w-4 text-amber-500" /> Verrouiller le système
                                                    </DropdownMenuItem>
                                                )}
                                                {user.statut === "verrouille" && (
                                                    <DropdownMenuItem onClick={() => handleToggleStatus(user._id, "actif")}>
                                                        <ShieldCheck className="mr-2 h-4 w-4 text-emerald-500" /> Déverrouiller
                                                    </DropdownMenuItem>
                                                )}

                                                {user.statut !== "inactif" ? (
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggleStatus(user._id, "inactif")}
                                                        className="text-red-600 focus:text-red-600"
                                                    >
                                                        <UserX className="mr-2 h-4 w-4" /> Désactiver le compte
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggleStatus(user._id, "actif")}
                                                        className="text-emerald-600 focus:text-emerald-600"
                                                    >
                                                        <ShieldCheck className="mr-2 h-4 w-4" /> Réactiver le compte
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <p>Affichage de {filteredUsers.length} utilisateur(s)</p>
            </div>
        </div>
    );
}
