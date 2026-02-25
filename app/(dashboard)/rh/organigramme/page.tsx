"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Network, Users, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';

// Import dynamique sans SSR (évite ReferenceError: document is not defined)
const OrganigrammeChart = dynamic(() => import('@/components/rh/OrganigrammeChart'), { ssr: false });

export default function OrganigrammePage() {
    const { user } = useAuth();
    const router = useRouter();
    const organigrammeData = useQuery(api.rh.agents.getOrganigramme, user?._id ? { userId: user._id } : "skip");

    if (organigrammeData === undefined) {
        return <div className="flex h-64 items-center justify-center text-muted-foreground">Chargement de l'organigramme...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <Network className="h-6 w-6 text-blue-600" />
                        Organigramme AGASA
                    </h1>
                    <p className="text-muted-foreground text-sm">Structure hiérarchique et cartographie du personnel</p>
                </div>
            </div>

            <Card className="w-full overflow-hidden border shadow-sm">
                <CardHeader className="bg-muted/30 border-b">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        Vue Structurelle Globale (Siège)
                    </CardTitle>
                    <CardDescription>
                        Cliquez sur la carte d'un agent pour accéder à sa fiche détaillée. Cet organigramme est généré dynamiquement.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8 overflow-x-auto bg-slate-50/50 relative min-h-[600px]">
                    <div className="min-w-fit mx-auto pb-10">
                        {/* Le composant Graphique qui nécessite l'objet "window/document" */}
                        <OrganigrammeChart organigrammeData={organigrammeData} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
