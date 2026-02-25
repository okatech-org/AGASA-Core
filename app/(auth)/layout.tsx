import { Shield } from "lucide-react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {/* Backdrop overlay */}
            <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />

            {/* Floating modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
                    <div className="mb-6 flex flex-col items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-agasa-primary shadow-lg shadow-agasa-primary/30">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-white">AGASA-Core</h1>
                            <p className="text-sm text-white/60">
                                Plateforme Interne Unifiée
                            </p>
                        </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-background/95 p-1 shadow-2xl backdrop-blur-md">
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}
