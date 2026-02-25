"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
    Users, Calendar, Files, PenTool, BarChart3, Clock,
} from "lucide-react";

export function DirecteurDashboard() {
    const { user } = useAuth();
    const prenom = user?.prenom || "Directeur";
    const direction = user?.direction || "Direction";
    const today = new Date().toLocaleDateString("fr-FR", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
    });

    const demoEquipe = [
        { nom: "M. Obiang", poste: "Inspecteur", statut: "En poste" },
        { nom: "Mme Mintsa", poste: "Analyste", statut: "En congé" },
        { nom: "M. Ndong", poste: "Technicien", statut: "En poste" },
        { nom: "M. Mba", poste: "Agent terrain", statut: "En formation" },
        { nom: "Mme Kombila", poste: "Secrétaire", statut: "En poste" },
    ];

    return (
        <div className="space-y-6">
            {/* Bannière */}
            <div className="border-l-4 border-blue-500 pl-4">
                <h1 className="text-2xl font-bold text-slate-900">Bonjour, {prenom} — Direction {direction}</h1>
                <p className="text-sm text-muted-foreground capitalize">{today}</p>
            </div>

            {/* Actions en attente */}
            <Card className="bg-blue-50/50 border-blue-200 shadow-sm">
                <CardContent className="p-4 space-y-2">
                    <h3 className="text-sm font-semibold text-blue-800">Mes actions en attente</h3>
                    <div className="flex flex-wrap gap-4 text-sm">
                        <Link href={`/rh/conges?statut=soumis&direction=${direction}`} className="text-blue-700 hover:underline flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" /> 2 congés à valider
                        </Link>
                        <Link href="/ged/workflows?en_attente_de_moi=true" className="text-blue-700 hover:underline flex items-center gap-1.5">
                            <PenTool className="h-3.5 w-3.5" /> 1 workflow à valider
                        </Link>
                        <Link href={`/ged/courrier?direction=${direction}`} className="text-blue-700 hover:underline flex items-center gap-1.5">
                            <Files className="h-3.5 w-3.5" /> 3 courriers à traiter
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* KPI Direction */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                    { title: "Effectif direction", value: "12 / 14", sub: "agents en poste", icon: Users, color: "bg-blue-100 text-blue-600" },
                    { title: "En congé actuellement", value: "1", sub: "Mme Mintsa", icon: Calendar, color: "bg-amber-100 text-amber-600" },
                    { title: "Demandes en cours", value: "4", sub: "congés + formations", icon: Clock, color: "bg-purple-100 text-purple-600" },
                    { title: "Budget direction", value: "72%", sub: "28% disponible (8.4 M FCFA)", icon: BarChart3, color: "bg-emerald-100 text-emerald-600" },
                ].map((kpi) => (
                    <Card key={kpi.title} className="shadow-sm border-slate-200">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{kpi.title}</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</p>
                                </div>
                                <div className={`p-2.5 rounded-lg ${kpi.color}`}>
                                    <kpi.icon className="w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">{kpi.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Mon équipe */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b pb-3">
                    <CardTitle className="text-sm font-semibold">Mon équipe — {direction}</CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-xs text-slate-500 uppercase">
                                <th className="px-5 py-3 text-left font-medium">Nom</th>
                                <th className="px-5 py-3 text-left font-medium">Poste</th>
                                <th className="px-5 py-3 text-left font-medium">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {demoEquipe.map((agent, i) => (
                                <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="px-5 py-3 font-medium text-slate-900">{agent.nom}</td>
                                    <td className="px-5 py-3 text-slate-600">{agent.poste}</td>
                                    <td className="px-5 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${agent.statut === "En poste" ? 'bg-emerald-100 text-emerald-700' :
                                            agent.statut === "En congé" ? 'bg-amber-100 text-amber-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                            {agent.statut}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
