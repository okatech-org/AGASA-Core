"use client";

import { useState } from "react";
import Link from "next/link";
import { auth, sendPasswordResetEmail } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle, AlertCircle, Loader2, Mail } from "lucide-react";

export default function MotDePasseOubliePage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess(false);

        try {
            await sendPasswordResetEmail(auth, email);
            setSuccess(true);
        } catch (err: any) {
            console.error(err);
            if (err.code === "auth/user-not-found") {
                setError("Aucun compte n'est associé à cette adresse e-mail.");
            } else if (err.code === "auth/invalid-email") {
                setError("L'adresse e-mail saisie n'est pas valide.");
            } else if (err.code === "auth/too-many-requests") {
                setError("Trop de tentatives. Veuillez réessayer ultérieurement.");
            } else {
                setError("Une erreur est survenue. Veuillez réessayer.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="shadow-lg">
            <CardHeader className="text-center">
                <CardTitle className="text-xl">Mot de passe oublié</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Saisissez votre adresse e-mail pour recevoir un lien de
                    réinitialisation.
                </p>
            </CardHeader>
            {success ? (
                <CardContent className="space-y-4">
                    <div className="flex flex-col items-center gap-3 rounded-md bg-emerald-50 p-6 text-center">
                        <CheckCircle className="h-10 w-10 text-emerald-600" />
                        <div>
                            <h3 className="font-semibold text-emerald-800">E-mail envoyé !</h3>
                            <p className="text-sm text-emerald-700 mt-1">
                                Si un compte est associé à <strong>{email}</strong>, vous
                                recevrez un lien de réinitialisation dans les prochaines
                                minutes.
                            </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Vérifiez vos spams si vous ne le trouvez pas.
                        </p>
                    </div>
                </CardContent>
            ) : (
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="flex items-center gap-2 rounded-md bg-agasa-danger/10 p-3 text-sm text-agasa-danger">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Adresse e-mail</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="prenom.nom@agasa.ga"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-agasa-primary hover:bg-agasa-primary/90"
                            disabled={isLoading || !email}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Envoi en cours...
                                </>
                            ) : (
                                "Envoyer le lien"
                            )}
                        </Button>
                    </CardContent>
                </form>
            )}
            <CardFooter className="justify-center">
                <Link
                    href="/connexion"
                    className="flex items-center gap-1 text-sm text-agasa-secondary hover:underline"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour à la connexion
                </Link>
            </CardFooter>
        </Card>
    );
}
