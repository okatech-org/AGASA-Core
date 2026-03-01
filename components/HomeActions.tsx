"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

export function HeroActions() {
    return (
        <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/connexion" className="btn-primary">
                Accéder à la plateforme
                <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
            </Link>
            <Link href="/demo" className="btn-outline btn-outline-dark">
                Découvrir la démo
                <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
            </Link>
        </div>
    );
}

export function CtaActions() {
    return (
        <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/connexion" className="btn-primary">
                Se connecter
                <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
            </Link>
            <Link href="/demo" className="btn-outline btn-outline-dark">
                Explorer la démo
                <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
            </Link>
        </div>
    );
}
