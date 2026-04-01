"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword } from "@/lib/firebase";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";

export default function ConnexionPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const lockAccount = useMutation(api.auth.lockAccount);
    const resetAttempts = useMutation(api.auth.resetLoginAttempts);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await signInWithEmailAndPassword(auth, email, password);
            await resetAttempts({ email }); // Reset attempts on success
            router.replace("/tableau-de-bord");
        } catch (err: any) {
            console.error(err);

            // Increment failed attempts and potentially lock account
            await lockAccount({ email });

            if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
                setError("Identifiants incorrects. Veuillez réessayer.");
            } else if (err.code === "auth/too-many-requests") {
                setError("Ce compte a été temporairement bloqué en raison de trop nombreuses tentatives. Contactez l'administrateur.");
            } else {
                setError("Une erreur est survenue lors de la connexion. Contactez le support.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // We need to import auth from firebase directly here because signInWithEmailAndPassword needs it
    // Let's rely on the destructured import
    const { auth } = require("@/lib/firebase");

    return (
        <Card className="shadow-lg">
            <CardHeader className="text-center">
                <CardTitle className="text-xl">Connexion</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Accédez à votre espace AGASA-Admin
                </p>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 rounded-md bg-agasa-danger/10 p-3 text-sm text-agasa-danger">
                            <AlertCircle className="h-4 w-4" />
                            <span>{error}</span>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="email">Adresse e-mail</Label>
                        <Input
                            id="email"
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
                            <Label htmlFor="password">Mot de passe</Label>
                            <Link
                                href="/mot-de-passe-oublie"
                                className="text-xs text-agasa-secondary hover:underline"
                            >
                                Mot de passe oublié ?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                    Contactez votre administrateur si vous n&apos;avez pas encore de
                    compte.
                </p>
            </CardFooter>
        </Card>
    );
}
