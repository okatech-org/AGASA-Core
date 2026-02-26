"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    FileText, Mail, PenTool, GitBranch, Archive,
    ArrowRight, Loader2, Inbox, Send,
} from "lucide-react";

const sousModules = [
    { label: "Courrier entrant/sortant", href: "/ged/courrier", icon: Mail, desc: "Numérisation, classement, diffusion" },
    { label: "Signature électronique", href: "/ged/signatures", icon: PenTool, desc: "Parapheurs, horodatage, certificats" },
    { label: "Workflows de validation", href: "/ged/workflows", icon: GitBranch, desc: "Circuits d'approbation multi-niveaux" },
    { label: "Archivage réglementaire", href: "/ged/archives", icon: Archive, desc: "Rétention, destruction, conformité" },
];

export default function GEDPage() {
    const { user } = useAuth();
    const userId = user?._id;

    const courriersEntrants = useQuery(api.ged.courrier.listCourriers, userId ? { userId, type: "entrant" } : "skip");
    const courriersSortants = useQuery(api.ged.courrier.listCourriers, userId ? { userId, type: "sortant" } : "skip");
    const workflows = useQuery(api.ged.workflows.listerWorkflows, userId ? { userId } : "skip");
    const signaturesEnAttente = useQuery(api.ged.signatures.enAttente, userId ? { userId } : "skip");

    const isLoading = courriersEntrants === undefined;

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            </div>
        );
    }

    const entrants = courriersEntrants?.length ?? 0;
    const sortants = courriersSortants?.length ?? 0;
    const enTraitement = courriersEntrants?.filter((c: any) => c.statut === "en_traitement").length ?? 0;
    const wfEnCours = workflows?.filter((w: any) => w.statut === "en_cours").length ?? 0;
    const sigEnAttente = signaturesEnAttente?.length ?? 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                    <FileText className="h-6 w-6 text-amber-600" />
                    Gestion Documentaire (GED)
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Courrier numérisé, signature électronique, workflows et archivage
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm border-blue-100">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase">Courriers entrants</p>
                                <p className="text-2xl font-bold text-blue-700 mt-1">{entrants}</p>
                            </div>
                            <Inbox className="h-5 w-5 text-blue-400" />
                        </div>
                        <p className="text-xs text-slate-400 mt-2">{enTraitement} en traitement</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-emerald-100">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase">Courriers sortants</p>
                                <p className="text-2xl font-bold text-emerald-700 mt-1">{sortants}</p>
                            </div>
                            <Send className="h-5 w-5 text-emerald-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-amber-100">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase">Workflows actifs</p>
                                <p className="text-2xl font-bold text-amber-700 mt-1">{wfEnCours}</p>
                            </div>
                            <GitBranch className="h-5 w-5 text-amber-400" />
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Circuits en cours</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-red-100">
                    <CardContent className="p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase">Signatures en attente</p>
                                <p className="text-2xl font-bold text-red-700 mt-1">{sigEnAttente}</p>
                            </div>
                            <PenTool className="h-5 w-5 text-red-400" />
                        </div>
                        {sigEnAttente > 0 && (
                            <Badge variant="destructive" className="mt-2 text-[10px]">Action requise</Badge>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Access to Sub-Modules */}
            <div>
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Sous-modules</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    {sousModules.map((sm) => (
                        <Link key={sm.href} href={sm.href}>
                            <Card className="hover:shadow-md hover:border-amber-200 transition-all cursor-pointer group">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="rounded-lg bg-amber-50 p-2.5 group-hover:bg-amber-100 transition-colors">
                                        <sm.icon className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm">{sm.label}</p>
                                        <p className="text-xs text-muted-foreground truncate">{sm.desc}</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
