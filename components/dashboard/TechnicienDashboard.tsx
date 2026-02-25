"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
    Microscope, FlaskConical, ClipboardCheck, Package,
    User, Calendar, Wallet, GraduationCap, AlertTriangle, BookOpen,
} from "lucide-react";

export function TechnicienDashboard() {
    const { user } = useAuth();
    const prenom = user?.prenom || "Technicien";
    const today = new Date().toLocaleDateString("fr-FR", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
    });

    return (
        <div className="space-y-6">
            {/* Bannière */}
            <div className="border-l-4 border-orange-400 pl-4">
                <h1 className="text-2xl font-bold text-slate-900">Bonjour, {prenom} — Laboratoire d&apos;Analyses Alimentaires</h1>
                <p className="text-sm text-muted-foreground capitalize">{today}</p>
            </div>

            {/* Mon travail aujourd'hui */}
            <Card className="bg-blue-50/50 border-blue-200 shadow-sm">
                <CardContent className="p-4">
                    <h3 className="text-sm font-semibold text-blue-800 mb-3">Mon travail aujourd&apos;hui</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                            { title: "Analyses assignées", value: "7", icon: Microscope, color: "bg-orange-100 text-orange-600" },
                            { title: "Résultats à saisir", value: "4", icon: ClipboardCheck, color: "bg-red-100 text-red-600" },
                            { title: "Validations en attente", value: "2", icon: FlaskConical, color: "bg-amber-100 text-amber-600" },
                            { title: "Échantillons reçus (auj.)", value: "3", icon: Package, color: "bg-blue-100 text-blue-600" },
                        ].map((kpi) => (
                            <div key={kpi.title} className="bg-white rounded-lg border p-3 flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${kpi.color}`}>
                                    <kpi.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">{kpi.title}</p>
                                    <p className="text-xl font-bold text-slate-900">{kpi.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Accès rapide */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LIMS */}
                <Card className="shadow-sm border-orange-100">
                    <CardHeader className="bg-orange-50 border-b pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Microscope className="h-4 w-4 text-orange-600" /> Laboratoire
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 space-y-1.5">
                        {[
                            { href: "/lims/echantillons/nouveau", label: "📦 Enregistrer un échantillon", icon: Package },
                            { href: "/lims/analyses/saisie", label: "🔬 Mes analyses", icon: Microscope },
                            { href: "/lims/qualite", label: "📊 Contrôle qualité", icon: ClipboardCheck },
                            { href: "/lims/parametres", label: "📋 Catalogue paramètres", icon: BookOpen },
                        ].map((item) => (
                            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-orange-50 transition-colors">
                                {item.label}
                            </Link>
                        ))}
                    </CardContent>
                </Card>

                {/* Self-service RH */}
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <User className="h-4 w-4 text-slate-600" /> Mon espace RH
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 space-y-1.5">
                        {[
                            { href: "/rh/self-service/profil", label: "👤 Mon profil", icon: User },
                            { href: "/rh/conges?mes_demandes=true", label: "📅 Mes congés", icon: Calendar },
                            { href: "/rh/paie?mes_bulletins=true", label: "💰 Ma paie", icon: Wallet },
                            { href: "/rh/formations", label: "🎓 Formations", icon: GraduationCap },
                        ].map((item) => (
                            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                                {item.label}
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Alertes labo */}
            <Card className="shadow-sm border-amber-100 bg-amber-50/30">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-800">
                        <AlertTriangle className="h-4 w-4" /> Alertes laboratoire
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-sm text-amber-700">⚠️ Dépassement de seuil détecté sur l&apos;échantillon ECH-2026-1006 (Salmonella)</p>
                    <p className="text-sm text-amber-700">🔧 Calibration du spectromètre prévue dans 5 jours</p>
                </CardContent>
            </Card>
        </div>
    );
}
