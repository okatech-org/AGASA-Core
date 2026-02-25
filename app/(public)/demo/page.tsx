"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "@/lib/firebase";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Building2,
    ShieldCheck,
    Users,
    Microscope,
    LineChart,
    Settings,
    ArrowRight,
    Loader2
} from "lucide-react";

const DEMO_ACCOUNTS = [
    {
        role: "Administrateur Système",
        icon: Settings,
        email: "demo-admin@agasa.ga",
        description: "Gestion complète de la plateforme : utilisateurs, rôles, configuration, audit, sécurité.",
        modules: "Tous les modules",
        color: "bg-slate-100 text-slate-700",
    },
    {
        role: "Directeur Général",
        icon: Building2,
        email: "demo-dg@agasa.ga",
        description: "Pilotage stratégique, tableaux de bord BI, validation des décisions majeures.",
        modules: "BI, Alertes, Validation",
        color: "bg-blue-100 text-blue-700",
    },
    {
        role: "Directeur (DERSP)",
        icon: ShieldCheck,
        email: "demo-directeur@agasa.ga",
        description: "Gestion de votre direction, validation des demandes, rapports d'activité.",
        modules: "RH, Finance, GED direction",
        color: "bg-emerald-100 text-emerald-700",
    },
    {
        role: "Agent AGASA",
        icon: Users,
        email: "demo-agent@agasa.ga",
        description: "Portail self-service : fiche de paie, congés, formations, annuaire.",
        modules: "Self-service RH",
        color: "bg-amber-100 text-amber-700",
    },
    {
        role: "Technicien Laboratoire",
        icon: Microscope,
        email: "demo-technicien@agasa.ga",
        description: "Enregistrement des échantillons, saisie des résultats d'analyse, contrôle qualité.",
        modules: "LIMS",
        color: "bg-purple-100 text-purple-700",
    },
    {
        role: "Auditeur",
        icon: LineChart,
        email: "demo-auditeur@agasa.ga",
        description: "Consultation des journaux d'audit, rapports financiers, traçabilité.",
        modules: "Audit logs, Rapports (lecture seule)",
        color: "bg-rose-100 text-rose-700",
    },
];

export default function DemoPage() {
    const router = useRouter();
    const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
    const syncUser = useMutation(api.auth.syncUser);
    const { auth } = require("@/lib/firebase");

    const handleDemoLogin = async (email: string, simulatedRole: string) => {
        setLoadingEmail(email);
        try {
            // Create user context silently via firebase
            const { user } = await signInWithEmailAndPassword(auth, email, "agasa-demo-2026!");

            // Force sync with the assigned simulated role
            await syncUser({
                firebaseUid: user.uid,
                email: email,
                nom: "Demo",
                prenom: "Comptes",
                demoSimulatedRole: simulatedRole,
            });

            // Redirect depending on role
            if (simulatedRole === "admin_systeme") router.push("/admin");
            else if (simulatedRole === "directeur_general") router.push("/bi");
            else router.push("/tableau-de-bord");

        } catch (error) {
            console.error("Demo login failed:", error);
            alert("Erreur de connexion démo. Veuillez contacter l'administrateur.");
        } finally {
            setLoadingEmail(null);
        }
    };

    const mapEmailToRole = (email: string) => {
        switch (email) {
            case "demo-admin@agasa.ga": return "admin_systeme";
            case "demo-dg@agasa.ga": return "directeur_general";
            case "demo-directeur@agasa.ga": return "directeur";
            case "demo-agent@agasa.ga": return "agent";
            case "demo-technicien@agasa.ga": return "technicien_laa";
            case "demo-auditeur@agasa.ga": return "auditeur";
            default: return "demo";
        }
    };

    return (
        <div className="container mx-auto max-w-6xl px-4 py-16">
            <div className="mb-12 text-center">
                <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-agasa-primary sm:text-5xl">
                    Découvrez AGASA-Core en action
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                    Explorez chaque espace de la plateforme avec des comptes de démonstration pré-configurés.
                </p>
                <div className="mx-auto mt-6 inline-flex max-w-xl items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900 shadow-sm">
                    <div className="mt-0.5 text-amber-500">🔒</div>
                    <p>
                        <strong>Important :</strong> Les comptes de démonstration sont partagés et en lecture seule.
                        Aucune donnée réelle n&apos;est affectée et les de modifications sont désactivées.
                        Connectez-vous avec vos identifiants réels pour le travail de production.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {DEMO_ACCOUNTS.map((account) => {
                    const isLoading = loadingEmail === account.email;
                    const assignedRole = mapEmailToRole(account.email);

                    return (
                        <Card key={account.email} className="flex flex-col border-muted hover:border-agasa-secondary/50 hover:shadow-md transition-all">
                            <CardHeader>
                                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${account.color}`}>
                                    <account.icon className="h-6 w-6" />
                                </div>
                                <CardTitle className="text-xl">{account.role}</CardTitle>
                                <CardDescription className="text-sm font-medium">{account.email}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="mb-4 text-sm text-muted-foreground">
                                    {account.description}
                                </p>
                                <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                                    <span className="font-semibold text-foreground">Accès :</span> {account.modules}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    onClick={() => handleDemoLogin(account.email, assignedRole)}
                                    disabled={isLoading || loadingEmail !== null}
                                    className="w-full bg-agasa-primary hover:bg-agasa-primary/90"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Connexion...
                                        </>
                                    ) : (
                                        <>
                                            Explorer {account.role === "Agent AGASA" ? "l'espace Agent" : `l'espace ${account.role.split(' ')[0]}`}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
