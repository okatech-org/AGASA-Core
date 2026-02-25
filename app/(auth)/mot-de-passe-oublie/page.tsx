import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export default function MotDePasseOubliePage() {
    return (
        <Card className="shadow-lg">
            <CardHeader className="text-center">
                <CardTitle className="text-xl">Mot de passe oublié</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Saisissez votre adresse e-mail pour recevoir un lien de
                    réinitialisation.
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Adresse e-mail</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="prenom.nom@agasa.ga"
                        autoComplete="email"
                    />
                </div>
                <Button className="w-full bg-agasa-primary hover:bg-agasa-primary/90">
                    Envoyer le lien
                </Button>
            </CardContent>
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
