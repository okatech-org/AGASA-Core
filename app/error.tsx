"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ServerCrash, RefreshCcw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Erreur critique AGASA-Core interceptée :", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white border border-rose-100 rounded-3xl p-8 text-center space-y-6 shadow-sm">

                <div className="mx-auto w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center">
                    <ServerCrash className="w-8 h-8 text-rose-500" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-slate-900">
                        Erreur serveur inattendue
                    </h2>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Une erreur technique s'est produite lors de l'exécution de ce module. Nos systèmes ont été notifiés (Code 500).
                    </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <Button
                        onClick={() => reset()}
                        variant="outline"
                        className="w-full bg-white border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium"
                    >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Réessayer la page
                    </Button>
                </div>
            </div>
        </div>
    );
}
