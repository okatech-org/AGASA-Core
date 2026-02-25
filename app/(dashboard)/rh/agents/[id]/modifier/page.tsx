"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { AgentForm } from "@/components/rh/AgentForm";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ModifierAgentPage() {
    const params = useParams();
    const agentId = params.id as string;
    const { user } = useAuth();

    const hasWriteAccess = user?.role === "admin_systeme" || user?.role === "directeur_general" || user?.role === "directeur" || user?.role === "chef_service" || user?.demoSimulatedRole === "admin_systeme" || user?.demoSimulatedRole === "chef_service";

    if (!hasWriteAccess) {
        return (
            <div className="max-w-2xl mx-auto mt-10">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Accès Refusé</AlertTitle>
                    <AlertDescription>
                        Vous n'avez pas les permissions requises pour modifier un profil agent. Veuillez contacter la Direction des Ressources Humaines.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Mise à jour du dossier professionnel</h1>
                <p className="text-muted-foreground text-sm">Modification des informations de l'agent</p>
            </div>

            <AgentForm mode="edit" agentId={agentId} />
        </div>
    );
}
