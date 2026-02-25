import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchX, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8">
                {/* Icône illustrative */}
                <div className="relative mx-auto w-24 h-24 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center mb-8">
                    <SearchX className="w-12 h-12 text-agasa-primary" />
                    <div className="absolute -bottom-2 -right-2 bg-agasa-danger text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                        404
                    </div>
                </div>

                {/* Textes */}
                <div className="space-y-3">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                        Page introuvable
                    </h1>
                    <p className="text-base text-slate-500 max-w-sm mx-auto">
                        Le document, module ou l'agent que vous recherchez n'existe pas ou a été déplacé dans le système AGASA-Core.
                    </p>
                </div>

                {/* Actions */}
                <div className="pt-6">
                    <Link href="/">
                        <Button className="w-full sm:w-auto bg-agasa-primary hover:bg-agasa-primary/90 text-white rounded-xl h-12 px-8 font-medium shadow-sm transition-all focus:ring-2 focus:ring-agasa-primary focus:ring-offset-2">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Retourner à l'accueil
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
