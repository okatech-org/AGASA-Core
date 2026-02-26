"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroActions() {
    return (
        <div className="mt-8 flex flex-wrap gap-4">
            <Button
                asChild
                size="lg"
                className="bg-white text-agasa-primary hover:bg-white/90"
            >
                <Link href="/connexion">
                    Accéder à la plateforme
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
            <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
            >
                <Link href="/demo">
                    Découvrir la démo
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
    );
}

export function CtaActions() {
    return (
        <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
                asChild
                size="lg"
                className="bg-white text-agasa-primary hover:bg-white/90"
            >
                <Link href="/connexion">Se connecter</Link>
            </Button>
            <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
            >
                <Link href="/demo">Explorer la démo</Link>
            </Button>
        </div>
    );
}
