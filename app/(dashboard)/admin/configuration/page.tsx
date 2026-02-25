"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, Loader2, Mail, Settings, Activity } from "lucide-react";
import { toast } from "sonner";

export default function AdminConfigPage() {
    const { user } = useAuth();
    const config = useQuery(api.admin.config.getSystemConfig, user?._id ? { adminId: user._id } : "skip");
    const updateConfig = useMutation(api.admin.config.updateSystemConfig);

    const [formData, setFormData] = useState<any>(null);
    const [savingSection, setSavingSection] = useState<string | null>(null);

    useEffect(() => {
        if (config && !formData) {
            setFormData(config);
        }
    }, [config, formData]);

    if (!config || !formData) {
        return <div className="flex h-48 items-center justify-center text-muted-foreground">Chargement de la configuration...</div>;
    }

    const handleUpdate = (section: string, field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleSaveSection = async (section: string) => {
        if (!user?._id) return;
        setSavingSection(section);
        try {
            const response = await updateConfig({
                adminId: user._id,
                section,
                nouvellesValeurs: formData[section]
            });
            toast.success(response);
        } catch (error: any) {
            toast.error(error.message || `Erreur lors de l'enregistrement de la section ${section}`);
        } finally {
            setSavingSection(null);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-agasa-primary">Configuration Système</h1>
                <p className="text-muted-foreground mt-1">Paramètres globaux affectant l'ensemble des modules de la plateforme.</p>
            </div>

            <Tabs defaultValue="securite" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                    <TabsTrigger value="securite" className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 hidden sm:block" /> Sécurité</TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2"><Mail className="h-4 w-4 hidden sm:block" /> Notifications</TabsTrigger>
                    <TabsTrigger value="recouvrement" className="flex items-center gap-2"><Activity className="h-4 w-4 hidden sm:block" /> Recouvrement</TabsTrigger>
                    <TabsTrigger value="systeme" className="flex items-center gap-2"><Settings className="h-4 w-4 hidden sm:block" /> Système</TabsTrigger>
                </TabsList>

                {/* ================= SÉCURITÉ ================= */}
                <TabsContent value="securite" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Politique de Sécurité</CardTitle>
                            <CardDescription>Paramètres liés à l'authentification et au contrôle d'accès.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="dureeSessionMinutes">Durée de session max (minutes)</Label>
                                    <Input
                                        id="dureeSessionMinutes"
                                        type="number"
                                        value={formData.securite.dureeSessionMinutes}
                                        onChange={(e) => handleUpdate("securite", "dureeSessionMinutes", Number(e.target.value))}
                                    />
                                    <p className="text-xs text-muted-foreground">Les utilisateurs seront déconnectés automatiquement après cette durée d'inactivité.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxTentativesConnexion">Tentatives de connexion max</Label>
                                    <Input
                                        id="maxTentativesConnexion"
                                        type="number"
                                        value={formData.securite.maxTentativesConnexion}
                                        onChange={(e) => handleUpdate("securite", "maxTentativesConnexion", Number(e.target.value))}
                                    />
                                    <p className="text-xs text-muted-foreground">Avant verrouillage du compte (nécessitant l'intervention d'un admin).</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="longueurMinMotDePasse">Longueur minimale du mot de passe</Label>
                                    <Input
                                        id="longueurMinMotDePasse"
                                        type="number"
                                        value={formData.securite.longueurMinMotDePasse}
                                        onChange={(e) => handleUpdate("securite", "longueurMinMotDePasse", Number(e.target.value))}
                                    />
                                </div>
                                <div className="flex items-center space-x-3 space-y-0 pt-6">
                                    <Switch
                                        id="exiger2FA"
                                        checked={formData.securite.exiger2FA}
                                        onCheckedChange={(c) => handleUpdate("securite", "exiger2FA", c)}
                                    />
                                    <Label htmlFor="exiger2FA" className="font-medium text-sm">Exiger l'Authentification à Deux Facteurs (A2F) globalement (Phase 2)</Label>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50 border-t flex justify-end">
                            <Button onClick={() => handleSaveSection("securite")} disabled={savingSection === "securite"}>
                                {savingSection === "securite" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Enregistrer Sécurité
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* ================= NOTIFICATIONS ================= */}
                <TabsContent value="notifications" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Comportement des Notifications</CardTitle>
                            <CardDescription>Règles d'envoi d'emails transactionnels et alertes système.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center space-x-3 space-y-0">
                                <Switch
                                    id="activerEmail"
                                    checked={formData.notifications.activerEmail}
                                    onCheckedChange={(c) => handleUpdate("notifications", "activerEmail", c)}
                                />
                                <Label htmlFor="activerEmail" className="font-medium">Activer l'envoi d'emails transactionnels</Label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="emailAdmin">Email Administrateur Principal</Label>
                                    <Input
                                        id="emailAdmin"
                                        type="email"
                                        value={formData.notifications.emailAdmin}
                                        onChange={(e) => handleUpdate("notifications", "emailAdmin", e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">Reçoit les alertes de sécurité et d'erreurs critiques.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="frequenceRappelsJours">Fréquence des digests (jours)</Label>
                                    <Input
                                        id="frequenceRappelsJours"
                                        type="number"
                                        value={formData.notifications.frequenceRappelsJours}
                                        onChange={(e) => handleUpdate("notifications", "frequenceRappelsJours", Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50 border-t flex justify-end">
                            <Button onClick={() => handleSaveSection("notifications")} disabled={savingSection === "notifications"}>
                                {savingSection === "notifications" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Enregistrer Notifications
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* ================= RECOUVREMENT ================= */}
                <TabsContent value="recouvrement" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Règles de Recouvrement (Finance)</CardTitle>
                            <CardDescription>Délais automatiques pour la remontée Trésor Public / Relances.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="delaiRelanceJ15">Délai 1ère Relance (Jours)</Label>
                                    <Input
                                        id="delaiRelanceJ15"
                                        type="number"
                                        value={formData.recouvrement.delaiRelanceJ15}
                                        onChange={(e) => handleUpdate("recouvrement", "delaiRelanceJ15", Number(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="delaiRelanceJ30">Délai Mise en Demeure (Jours)</Label>
                                    <Input
                                        id="delaiRelanceJ30"
                                        type="number"
                                        value={formData.recouvrement.delaiRelanceJ30}
                                        onChange={(e) => handleUpdate("recouvrement", "delaiRelanceJ30", Number(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="delaiTresorPublic">Délai Trésor Public (Jours)</Label>
                                    <Input
                                        id="delaiTresorPublic"
                                        type="number"
                                        value={formData.recouvrement.delaiTresorPublic}
                                        onChange={(e) => handleUpdate("recouvrement", "delaiTresorPublic", Number(e.target.value))}
                                    />
                                    <p className="text-xs text-muted-foreground text-red-600 font-medium">Bascule en recouvrement forcé</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50 border-t flex justify-end">
                            <Button onClick={() => handleSaveSection("recouvrement")} disabled={savingSection === "recouvrement"}>
                                {savingSection === "recouvrement" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Enregistrer Règles Finance
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* ================= SYSTÈME ================= */}
                <TabsContent value="systeme" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Identité Système</CardTitle>
                            <CardDescription>Comportement global et maintenance.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="nomApplication">Nom de l'application</Label>
                                    <Input
                                        id="nomApplication"
                                        value={formData.systeme.nomApplication}
                                        onChange={(e) => handleUpdate("systeme", "nomApplication", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="version">Version de Production</Label>
                                    <Input
                                        id="version"
                                        value={formData.systeme.version}
                                        readOnly
                                        className="bg-muted cursor-not-allowed"
                                    />
                                </div>
                                <div className="flex items-center space-x-3 space-y-0 pt-6">
                                    <Switch
                                        id="modeMaintenance"
                                        checked={formData.systeme.modeMaintenance}
                                        onCheckedChange={(c) => handleUpdate("systeme", "modeMaintenance", c)}
                                    />
                                    <div>
                                        <Label htmlFor="modeMaintenance" className="font-medium">Activer le Mode Maintenance</Label>
                                        <p className="text-xs text-muted-foreground">Suspendra l'accès de tous les utilisateurs (sauf Administrateurs).</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50 border-t flex justify-end">
                            <Button onClick={() => handleSaveSection("systeme")} disabled={savingSection === "systeme"}>
                                {savingSection === "systeme" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Enregistrer Paramètres Système
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
