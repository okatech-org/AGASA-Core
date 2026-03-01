"use client";

import Link from "next/link";
import { Shield, Menu, X } from "lucide-react";
import { useState } from "react";

export default function PublicHeader() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="glass sticky top-0 z-50">
            <div className="container-ds flex h-[72px] items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ds-primary)]">
                        <Shield className="h-5 w-5 text-white" strokeWidth={1.8} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-serif text-lg font-semibold tracking-tight text-[var(--ds-primary)]">
                            AGASA
                        </span>
                        <span className="hidden text-[11px] font-medium leading-none text-[var(--ds-text-muted)] sm:block">
                            Sécurité Alimentaire
                        </span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-1 md:flex">
                    <Link
                        href="/a-propos"
                        className="rounded-lg px-4 py-3 text-[15px] font-medium text-[var(--ds-text-muted)] transition-colors duration-200 hover:bg-[var(--ds-bg-muted)] hover:text-[var(--ds-text)]"
                    >
                        À propos
                    </Link>
                    <Link
                        href="/demo"
                        className="rounded-lg px-4 py-3 text-[15px] font-medium text-[var(--ds-text-muted)] transition-colors duration-200 hover:bg-[var(--ds-bg-muted)] hover:text-[var(--ds-text)]"
                    >
                        Démo
                    </Link>
                    <Link
                        href="/connexion"
                        className="btn-primary ml-3"
                    >
                        <Shield className="h-4 w-4" strokeWidth={1.8} />
                        Accéder aux services
                    </Link>
                </nav>

                {/* Mobile Hamburger */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-[var(--ds-text)] transition-colors hover:bg-[var(--ds-bg-muted)] md:hidden"
                    aria-label="Menu de navigation"
                >
                    {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div className="glass border-t border-[var(--ds-border)] md:hidden">
                    <nav className="container-ds flex flex-col gap-1 py-4">
                        <Link
                            href="/a-propos"
                            onClick={() => setMobileOpen(false)}
                            className="rounded-lg px-4 py-3 text-[15px] font-medium text-[var(--ds-text-muted)] transition-colors hover:bg-[var(--ds-bg-muted)] hover:text-[var(--ds-text)]"
                        >
                            À propos
                        </Link>
                        <Link
                            href="/demo"
                            onClick={() => setMobileOpen(false)}
                            className="rounded-lg px-4 py-3 text-[15px] font-medium text-[var(--ds-text-muted)] transition-colors hover:bg-[var(--ds-bg-muted)] hover:text-[var(--ds-text)]"
                        >
                            Démo
                        </Link>
                        <Link
                            href="/connexion"
                            onClick={() => setMobileOpen(false)}
                            className="btn-primary mt-2 justify-center"
                        >
                            <Shield className="h-4 w-4" strokeWidth={1.8} />
                            Accéder aux services
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}
