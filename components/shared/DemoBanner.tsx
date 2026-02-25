"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { AlertTriangle, LogOut } from "lucide-react";

export function DemoBanner() {
    const { simulatedRole, logout } = useAuth();

    if (!simulatedRole) return null;

    return (
        <div className="sticky top-0 z-[100] flex min-h-[40px] w-full items-center justify-between bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950 shadow-md sm:px-6">
            <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <p>
                    <span className="font-bold">[MODE DÉMO]</span> Vous explorez AGASA-Core en tant que{" "}
                    <span className="font-bold underline decoration-amber-950/30 underline-offset-2">
                        {simulatedRole.replace("_", " ")}
                    </span>
                    . Les modifications ne sont pas enregistrées.
                </p>
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="ml-4 h-8 shrink-0 border-amber-700 bg-amber-500/20 text-amber-950 hover:bg-amber-600 hover:text-white"
            >
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Quitter
            </Button>
        </div>
    );
}
