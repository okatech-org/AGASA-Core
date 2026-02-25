"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Save } from "lucide-react";

export default function NouveauUtilisateurPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Note: in a real implementation we would call a Convex mutation to create a Firebase Auth user
    // followed by adding the profile to the users table. For now, since Firebase admin SDK is required
    // for proper account creation (bypassing normal sign-in flow), we will simulate this for the demo phase.

    const handleSimulerCreation = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simuler un appel réseau
        setTimeout(() => {
            setLoading(false);
            alert("En mode Démonstration (Phase 2), la création de compte réel via Firebase Admin SDK est désactivée. L'interface est fonctionnelle pour présentation.");
            router.push("/admin/utilisateurs");
        }, 1500);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-agasa-primary">Nouvel Utilisateur</h1>
                    <p className="text-muted-foreground">Créer un nouveau compte d'accès à la plateforme AGASA-Core</p>
                </div>
            </div>

            <form onSubmit={handleSimulerCreation}>
                <Card>
                    <CardHeader>
                        <CardTitle>Informations Personnelles</CardTitle>
                        <CardDescription>Les identifiants et informations d'état civil de l'agent.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nom">Nom</Label>
                                <Input id="nom" placeholder="Ex: Mba" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="prenom">Prénom</Label>
                                <Input id="prenom" placeholder="Ex: Jean" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Professionnel</Label>
                                <Input id="email" type="email" placeholder="jean.mba@agasa.ga" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="telephone">Téléphone</Label>
                                <Input id="telephone" type="tel" placeholder="+241 77 12 34 56" />
                            </div>
                        </div>
                    </CardContent>

                    <CardHeader className="border-t mt-4 border-slate-100">
                        <CardTitle>Rôle & Affectation</CardTitle>
                        <CardDescription>Définissez les droits d'accès et la localisation de l'agent.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="role">Rôle Système</Label>
                                <select id="role" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" required>
                                    <option value="">-- Sélectionner un rôle --</option>
                                    <option value="agent">Agent (Accès RH/Self-service)</option>
                                    <option value="chef_service">Chef de Service</option>
                                    <option value="directeur">Directeur</option>
                                    <option value="directeur_general">Directeur Général</option>
                                    <option value="technicien_laa">Technicien Laboratoire (LAA)</option>
                                    <option value="auditeur">Auditeur Interne/Externe</option>
                                    <option value="admin_systeme">Administrateur Système</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="direction">Direction Centrale</Label>
                                <select id="direction" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                                    <option value="">Aucune (Siège/Autre)</option>
                                    <option value="DG">Direction Générale</option>
                                    <option value="DERSP">DERSP</option>
                                    <option value="DICSP">DICSP</option>
                                    <option value="DAF">DAF</option>
                                    <option value="LAA">LAA</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="province">Province d'Affectation</Label>
                                <select id="province" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" required>
                                    <option value="Estuaire">Estuaire</option>
                                    <option value="Haut-Ogooué">Haut-Ogooué</option>
                                    <option value="Moyen-Ogooué">Moyen-Ogooué</option>
                                    <option value="Ngounié">Ngounié</option>
                                    <option value="Nyanga">Nyanga</option>
                                    <option value="Ogooué-Ivindo">Ogooué-Ivindo</option>
                                    <option value="Ogooué-Lolo">Ogooué-Lolo</option>
                                    <option value="Ogooué-Maritime">Ogooué-Maritime</option>
                                    <option value="Woleu-Ntem">Woleu-Ntem</option>
                                    <option value="Siège">Siège National (Libreville)</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mt-4 text-sm border border-blue-100">
                            <strong className="block mb-1">Mots de passe et sécurité :</strong>
                            Lors de la création du compte, l'utilisateur recevra automatiquement un email sécurisé l'invitant à définir son propre mot de passe via Firebase Authentication. Un identifiant unique "Matricule" lui sera généré.
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-between border-t border-slate-100 bg-slate-50 rounded-b-lg">
                        <Button variant="ghost" type="button" onClick={() => router.back()}>Annuler</Button>
                        <Button type="submit" disabled={loading} className="bg-agasa-primary hover:bg-agasa-primary/90">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Créer le compte
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
