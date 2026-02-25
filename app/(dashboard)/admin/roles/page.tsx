"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Users } from "lucide-react";

export default function AdminRolesPage() {
    const { user } = useAuth();
    const roles = useQuery(api.admin.roles.getRolesWithPermissions, user?._id ? { adminId: user._id } : "skip");

    if (!roles) {
        return <div className="flex h-48 items-center justify-center text-muted-foreground">Chargement des rôles...</div>;
    }

    const MODULES = [
        { id: "rh", label: "Ressources Humaines" },
        { id: "finance", label: "Finances & Recouvrement" },
        { id: "ged", label: "GED & Courriers" },
        { id: "lims", label: "LIMS (Laboratoire)" },
        { id: "alertes", label: "Alertes Sanitaires" },
        { id: "bi", label: "Business Intelligence" },
        { id: "admin", label: "Administration" },
    ];

    const handleSave = () => {
        alert("En mode Démo (Phase 2), la modification des rôles cœurs est désactivée. Les permissions sont affichées en lecture seule.");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-agasa-primary">Rôles & Permissions</h1>
                    <p className="text-muted-foreground mt-1">Gérez la matrice d'accès aux modules pour chaque profil utilisateur.</p>
                </div>
                <Button onClick={handleSave} className="bg-agasa-primary hover:bg-agasa-primary/90">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Enregistrer les modifications
                </Button>
            </div>

            <div className="grid gap-6">
                {roles.map((role) => (
                    <Card key={role.id}>
                        <CardHeader className="bg-muted/30 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        {role.nom}
                                        {role.id === "admin_systeme" && <Badge variant="destructive" className="ml-2">Super Admin</Badge>}
                                    </CardTitle>
                                    <CardDescription className="mt-1 flex items-center gap-1">
                                        <Users className="h-3 w-3" /> {role.userCount} utilisateur(s) • Identifiant technique: <code className="bg-muted px-1 py-0.5 rounded text-xs">{role.id}</code>
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="w-[250px]">Module de la plateforme</TableHead>
                                            <TableHead className="text-center">Lecture (Lire)</TableHead>
                                            <TableHead className="text-center">Écriture (Créer/Modif)</TableHead>
                                            <TableHead className="text-center text-amber-600">Validation</TableHead>
                                            <TableHead className="text-center text-red-600">Suppression</TableHead>
                                            <TableHead className="text-center">Export Data</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {MODULES.map((module) => {
                                            const perms = (role.permissions as any)[module.id] || {};

                                            // Si "admin_systeme" on coche tout par défaut pour la démo
                                            const isSuperAdmin = role.id === "admin_systeme";

                                            return (
                                                <TableRow key={module.id}>
                                                    <TableCell className="font-medium">{module.label}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Checkbox checked={isSuperAdmin || !!perms.read} disabled={isSuperAdmin} />
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Checkbox checked={isSuperAdmin || !!perms.write} disabled={isSuperAdmin} />
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Checkbox checked={isSuperAdmin || !!perms.validate} disabled={isSuperAdmin} />
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Checkbox checked={isSuperAdmin || !!perms.delete} disabled={isSuperAdmin} />
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Checkbox checked={isSuperAdmin || !!perms.export} disabled={isSuperAdmin} />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
