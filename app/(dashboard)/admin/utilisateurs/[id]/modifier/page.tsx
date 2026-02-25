"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Shield } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const roles = [
    { value: "admin_systeme", label: "Administrateur Système" },
    { value: "directeur_general", label: "Directeur Général" },
    { value: "directeur", label: "Directeur" },
    { value: "chef_service", label: "Chef de Service" },
    { value: "agent", label: "Agent AGASA" },
    { value: "technicien_laa", label: "Technicien LAA" },
    { value: "auditeur", label: "Auditeur" },
];

const directions = ["DG", "DERSP", "DICSP", "DAF", "LAA"];
const provinces = ["Estuaire", "Haut-Ogooué", "Moyen-Ogooué", "Ngounié", "Nyanga", "Ogooué-Ivindo", "Ogooué-Lolo", "Ogooué-Maritime", "Woleu-Ntem", "Siège"];

const modules = ["RH", "Finance", "GED", "Logistique", "LIMS", "Alertes", "BI", "Admin"];
const actions = ["Lire", "Créer", "Modifier", "Supprimer", "Valider", "Exporter"];

export default function ModifierUtilisateurPage() {
    const params = useParams();
    const router = useRouter();

    const [form, setForm] = useState({
        nom: "Obiang Ndong",
        prenom: "Jean-Pierre",
        email: "jp.obiang@agasa.ga",
        telephone: "+241 77 12 34 56",
        matricule: "AGASA-2024-0015",
        role: "directeur",
        direction: "DERSP",
        province: "Estuaire",
        statut: "actif",
    });

    const [perms, setPerms] = useState<Record<string, string[]>>({
        RH: ["Lire", "Créer", "Modifier", "Valider"],
        Finance: ["Lire"],
        GED: ["Lire", "Créer", "Modifier", "Valider"],
        BI: ["Lire"],
        Logistique: [],
        LIMS: [],
        Alertes: ["Lire"],
        Admin: [],
    });

    const togglePerm = (mod: string, action: string) => {
        setPerms(prev => {
            const current = prev[mod] || [];
            return {
                ...prev,
                [mod]: current.includes(action) ? current.filter(a => a !== action) : [...current, action],
            };
        });
    };

    const handleSave = () => {
        toast.success("Modifications enregistrées avec succès");
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center gap-3">
                <Link href={`/admin/utilisateurs/${params.id}`}>
                    <Button variant="ghost" size="sm" className="gap-1"><ArrowLeft className="h-4 w-4" /> Retour</Button>
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">Modifier l&apos;utilisateur</h1>
            </div>

            {/* Identity */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Identité</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nom">Nom</Label>
                            <Input id="nom" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="prenom">Prénom</Label>
                            <Input id="prenom" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="telephone">Téléphone</Label>
                            <Input id="telephone" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="matricule">Matricule</Label>
                            <Input id="matricule" value={form.matricule} disabled className="bg-slate-50" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Role & Affectation */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Rôle et affectation</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Rôle</Label>
                            <Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {roles.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Direction</Label>
                            <Select value={form.direction} onValueChange={v => setForm({ ...form, direction: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {directions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Province</Label>
                            <Select value={form.province} onValueChange={v => setForm({ ...form, province: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Statut</Label>
                        <Select value={form.statut} onValueChange={v => setForm({ ...form, statut: v })}>
                            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="actif">Actif</SelectItem>
                                <SelectItem value="inactif">Inactif</SelectItem>
                                <SelectItem value="verrouille">Verrouillé</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Permissions Matrix */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Shield className="h-4 w-4" /> Permissions granulaires
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 pr-4 font-medium text-slate-500">Module</th>
                                    {actions.map(a => <th key={a} className="text-center py-2 px-2 font-medium text-slate-500 text-xs">{a}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {modules.map(mod => (
                                    <tr key={mod} className="border-b last:border-0">
                                        <td className="py-2 pr-4 font-medium">{mod}</td>
                                        {actions.map(action => (
                                            <td key={action} className="text-center py-2 px-2">
                                                <input
                                                    type="checkbox"
                                                    checked={(perms[mod] || []).includes(action)}
                                                    onChange={() => togglePerm(mod, action)}
                                                    className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <Link href={`/admin/utilisateurs/${params.id}`}>
                    <Button variant="outline">Annuler</Button>
                </Link>
                <Button className="gap-1" onClick={handleSave}>
                    <Save className="h-4 w-4" /> Enregistrer les modifications
                </Button>
            </div>
        </div>
    );
}
