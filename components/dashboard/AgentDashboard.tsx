"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
    User, Calendar, Wallet, GraduationCap, BookOpen, ClipboardList, Megaphone,
} from "lucide-react";

function QuickCard({ title, sub, info, icon: Icon, href, cta }: {
    title: string; sub?: string; info?: string; icon: any; href: string; cta?: string;
}) {
    return (
        <Link href={href} className="block">
            <Card className="shadow-sm border-slate-200 hover:border-agasa-primary/30 hover:shadow-md transition-all cursor-pointer h-full">
                <CardContent className="p-5 flex flex-col gap-3">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-emerald-50">
                            <Icon className="h-8 w-8 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900">{title}</h3>
                            {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
                        </div>
                    </div>
                    {info && <p className="text-lg font-bold text-slate-800">{info}</p>}
                    {cta && (
                        <span className="inline-flex items-center text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg px-4 py-2.5 mt-1 transition-colors self-start">
                            {cta}
                        </span>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}

export function AgentDashboard() {
    const { user } = useAuth();
    const prenom = user?.prenom || "Agent";
    const direction = user?.direction || "";
    const province = user?.province || "";

    const today = new Date().toLocaleDateString("fr-FR", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
    });

    return (
        <div className="space-y-6">
            {/* Message d'accueil */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    Bonjour, {prenom} 👋
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {direction && `Direction ${direction}`}{direction && province && " — "}{province && province}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 capitalize">{today}</p>
            </div>

            {/* Grille d'accès rapide */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <QuickCard
                    title="Mon profil"
                    sub={user?.matricule || "AGASA-XXXX"}
                    icon={User}
                    href="/rh/self-service/profil"
                />
                <QuickCard
                    title="Mes congés"
                    info="Solde : 22 jours"
                    sub="Dernière demande : En attente"
                    icon={Calendar}
                    href="/rh/conges?mes_demandes=true"
                    cta="+ Nouvelle demande"
                />
                <QuickCard
                    title="Ma paie"
                    info="477 500 FCFA"
                    sub="Dernier bulletin : Janvier 2026"
                    icon={Wallet}
                    href="/rh/paie?mes_bulletins=true"
                    cta="Voir mon bulletin"
                />
                <QuickCard
                    title="Mes formations"
                    info="1 formation à venir"
                    sub="Prochaine : Nouvel Outil AGASA-Core"
                    icon={GraduationCap}
                    href="/rh/formations?mes_inscriptions=true"
                    cta="Catalogue des formations"
                />
                <QuickCard
                    title="Annuaire"
                    sub="Trouver un collègue"
                    icon={BookOpen}
                    href="/rh/self-service/annuaire"
                />
                <QuickCard
                    title="Mes demandes"
                    info="2 demande(s) en cours"
                    sub="Congé soumis, Formation en attente"
                    icon={ClipboardList}
                    href="/rh/self-service/demandes"
                />
            </div>

            {/* Annonces */}
            <Card className="shadow-sm border-blue-100 bg-blue-50/50">
                <CardContent className="p-4 flex items-start gap-3">
                    <Megaphone className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                        <p className="text-sm text-blue-800">📢 La formation HACCP Niveau 2 est ouverte aux inscriptions — Places limitées !</p>
                        <p className="text-sm text-blue-800">📢 Les bulletins de paie de janvier 2026 sont disponibles.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
