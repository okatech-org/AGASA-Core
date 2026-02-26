import { Shield } from "lucide-react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-agasa-primary/5 via-background to-agasa-secondary/5">
            <div className="mb-8 flex flex-col items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-agasa-primary shadow-lg">
                    <Shield className="h-8 w-8 text-white" />
                </div>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-agasa-primary">AGASA-Core</h1>
                    <p className="text-sm text-muted-foreground">
                        Plateforme Interne Unifiée
                    </p>
                </div>
            </div>
            <div className="w-full max-w-md px-4">
                {children}
            </div>
        </div>
    );
}
