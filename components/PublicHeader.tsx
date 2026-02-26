"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

export default function PublicHeader() {
    return (
        <header className="sticky top-0 z-50 border-b border-border/50 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-agasa-primary">
                        <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <span className="text-lg font-bold text-agasa-primary">
                            AGASA-Core
                        </span>
                        <span className="ml-1.5 hidden text-xs text-muted-foreground sm:inline">
                            Sécurité Alimentaire
                        </span>
                    </div>
                </Link>
                <nav className="flex items-center gap-1">
                    <Link
                        href="/a-propos"
                        className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        À propos
                    </Link>
                    <Link
                        href="/demo"
                        className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        Démo
                    </Link>
                    <Link
                        href="/connexion"
                        className="ml-2 rounded-lg bg-agasa-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-agasa-primary/90"
                    >
                        Se connecter
                    </Link>
                </nav>
            </div>
        </header>
    );
}

