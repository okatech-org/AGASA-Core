"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { AgentDashboard } from "@/components/dashboard/AgentDashboard";
import { DGDashboard } from "@/components/dashboard/DGDashboard";
import { DirecteurDashboard } from "@/components/dashboard/DirecteurDashboard";
import { TechnicienDashboard } from "@/components/dashboard/TechnicienDashboard";
import { AuditeurDashboard } from "@/components/dashboard/AuditeurDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function TableauDeBordPage() {
    const { role, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <Skeleton className="h-8 w-72" />
                <Skeleton className="h-4 w-96" />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-[130px] rounded-xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-[350px] rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    switch (role) {
        case "admin_systeme":
            return <AdminDashboard />;
        case "directeur_general":
            return <DGDashboard />;
        case "directeur":
            return <DirecteurDashboard />;
        case "agent":
            return <AgentDashboard />;
        case "technicien_laa":
            return <TechnicienDashboard />;
        case "auditeur":
            return <AuditeurDashboard />;
        default:
            // Fallback for demo or unknown roles — show admin for demo
            return <AdminDashboard />;
    }
}
