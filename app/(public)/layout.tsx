import Link from "next/link";
import { Shield, MapPin, Phone, Mail } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const enableDemoMode = process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === "true";
    const quickLinks = [
        { href: "/", label: "Accueil" },
        { href: "/a-propos", label: "À propos" },
        ...(enableDemoMode ? [{ href: "/demo", label: "Démo" }] : []),
    ];

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header Public */}
            <PublicHeader />

            {/* Contenu */}
            <main className="flex-1">{children}</main>

            {/* Footer — §7.I */}
            <footer className="border-t border-[var(--ds-border)] bg-[var(--ds-bg-card)]">
                <div className="container-ds section-padding">
                    {/* 4 colonnes desktop / 1 colonne mobile */}
                    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Col 1 — Logo + description */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--ds-primary)]">
                                    <Shield className="h-5 w-5 text-white" strokeWidth={1.8} />
                                </div>
                                <div>
                                    <span className="font-serif text-lg font-semibold text-[var(--ds-primary)]">
                                        AGASA
                                    </span>
                                </div>
                            </div>
                            <p className="text-[13px] leading-[1.55] text-[var(--ds-text-muted)]">
                                Agence Gabonaise de Sécurité Alimentaire — Protéger la santé
                                publique par le contrôle qualité et la traçabilité des produits alimentaires.
                            </p>
                        </div>

                        {/* Col 2 — Liens rapides */}
                        <div>
                            <h4 className="mb-4 text-sm font-semibold text-[var(--ds-text)]">
                                Liens rapides
                            </h4>
                            <nav className="flex flex-col gap-2.5">
                                {quickLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="text-[13px] text-[var(--ds-text-muted)] transition-colors duration-200 hover:text-[var(--ds-emerald)]"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* Col 3 — Contact */}
                        <div>
                            <h4 className="mb-4 text-sm font-semibold text-[var(--ds-text)]">
                                Contact
                            </h4>
                            <div className="flex flex-col gap-3 text-[13px] text-[var(--ds-text-muted)]">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 shrink-0 text-[var(--ds-emerald)]" strokeWidth={1.8} />
                                    <span>Libreville, Gabon</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 shrink-0 text-[var(--ds-emerald)]" strokeWidth={1.8} />
                                    <span>+241 XX XX XX XX</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 shrink-0 text-[var(--ds-emerald)]" strokeWidth={1.8} />
                                    <span>contact@agasa.ga</span>
                                </div>
                            </div>
                        </div>

                        {/* Col 4 — Applications */}
                        <div>
                            <h4 className="mb-4 text-sm font-semibold text-[var(--ds-text)]">
                                Applications
                            </h4>
                            <nav className="flex flex-col gap-2.5">
                                {[
                                    { label: "AGASA-Admin", color: "var(--ds-blue)" },
                                    { label: "AGASA-Pro", color: "var(--ds-emerald)" },
                                    { label: "AGASA-Inspect", color: "var(--ds-amber)" },
                                    { label: "AGASA-Citoyen", color: "var(--ds-rose)" },
                                ].map((app) => (
                                    <span
                                        key={app.label}
                                        className="flex items-center gap-2 text-[13px] text-[var(--ds-text-muted)]"
                                    >
                                        <span
                                            className="h-2 w-2 rounded-full"
                                            style={{ background: app.color }}
                                        />
                                        {app.label}
                                    </span>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Barre inférieure */}
                    <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[var(--ds-border)] pt-6 text-[12px] text-[var(--ds-text-muted)] md:flex-row">
                        <span>© 2026 AGASA — République Gabonaise</span>
                        <span>
                            Développé par{" "}
                            <span className="font-medium text-[var(--ds-text)]">
                                NTSAGUI Digital
                            </span>{" "}
                            — Solutions Numériques & Transformation Digitale
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
