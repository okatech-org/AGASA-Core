"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, Shield, X } from "lucide-react";

interface ConnexionModalProps {
    open: boolean;
    onClose: () => void;
}

export default function ConnexionModal({ open, onClose }: ConnexionModalProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const lockAccount = useMutation(api.auth.lockAccount);
    const resetAttempts = useMutation(api.auth.resetLoginAttempts);

    // We need to import auth from firebase directly here
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { auth, signInWithEmailAndPassword } = require("@/lib/firebase");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await signInWithEmailAndPassword(auth, email, password);
            await resetAttempts({ email });
            router.replace("/tableau-de-bord");
        } catch (err: any) {
            console.error(err);
            await lockAccount({ email });

            if (
                err.code === "auth/user-not-found" ||
                err.code === "auth/wrong-password" ||
                err.code === "auth/invalid-credential"
            ) {
                setError("Identifiants incorrects. Veuillez réessayer.");
            } else if (err.code === "auth/too-many-requests") {
                setError(
                    "Ce compte a été temporairement bloqué en raison de trop nombreuses tentatives. Contactez l'administrateur."
                );
            } else {
                setError(
                    "Une erreur est survenue lors de la connexion. Contactez le support."
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md px-4 animate-in fade-in zoom-in-95 duration-300">
                {/* Header with logo */}
                <div className="mb-6 flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-agasa-primary shadow-lg shadow-agasa-primary/30">
                        <Shield className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white">
                            AGASA-Core
                        </h2>
                        <p className="text-sm text-white/60">
                            Plateforme Interne Unifiée
                        </p>
                    </div>
                </div>

                {/* Card */}
                <Card className="relative border border-white/10 bg-background/95 shadow-2xl backdrop-blur-md">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label="Fermer"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">Connexion</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Accédez à votre espace AGASA-Core
                        </p>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {error && (
                                <div className="flex items-center gap-2 rounded-md bg-agasa-danger/10 p-3 text-sm text-agasa-danger">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="modal-email">
                                    Adresse e-mail
                                </Label>
                                <Input
                                    id="modal-email"
                                    type="email"
                                    placeholder="prenom.nom@agasa.ga"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="modal-password">
                                        Mot de passe
                                    </Label>
                                    <Link
                                        href="/mot-de-passe-oublie"
                                        className="text-xs text-agasa-secondary hover:underline"
                                        onClick={onClose}
                                    >
                                        Mot de passe oublié ?
                                    </Link>
                                </div>
                                <Input
                                    id="modal-password"
                                    type="password"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    disabled={isLoading}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-agasa-primary hover:bg-agasa-primary/90"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Connexion en cours...
                                    </>
                                ) : (
                                    "Se connecter"
                                )}
                            </Button>
                        </CardContent>
                    </form>
                    <CardFooter className="justify-center">
                        <p className="text-xs text-muted-foreground">
                            Contactez votre administrateur si vous n&apos;avez
                            pas encore de compte.
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
