import Link from "next/link";
import { Shield } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Header Public (client component with modal) */}
            <PublicHeader />

            {/* Contenu */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="border-t bg-slate-50">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-agasa-primary" />
                            <span className="text-sm font-semibold text-agasa-primary">
                                AGASA
                            </span>
                            <span className="text-sm text-muted-foreground">
                                — Agence Gabonaise de Sécurité Alimentaire
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <Link href="/" className="hover:text-foreground">
                                Accueil
                            </Link>
                            <Link href="/demo" className="hover:text-foreground">
                                Démo
                            </Link>
                            <Link href="/a-propos" className="hover:text-foreground">
                                À propos
                            </Link>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-col items-center justify-between gap-2 border-t pt-4 text-xs text-muted-foreground md:flex-row">
                        <span>© 2026 AGASA — République Gabonaise</span>
                        <span>
                            Développé par{" "}
                            <span className="font-medium text-foreground">
                                NTSAGUI Digital
                            </span>{" "}
                            — Solutions Numériques &amp; Transformation Digitale
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

