import { DollarSign, PiggyBank, Receipt, CreditCard, Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const sousModules = [
    { label: "Gestion budgétaire", icon: PiggyBank, phase: "Phase 4.1" },
    { label: "Redevances & Amendes", icon: Receipt, phase: "Phase 4.1" },
    { label: "Comptabilité publique", icon: Landmark, phase: "Phase 4.2" },
    { label: "Passerelle paiement", icon: CreditCard, phase: "Phase 4.2" },
];

export default function FinancePage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="flex items-center gap-2 text-2xl font-bold">
                    <DollarSign className="h-6 w-6 text-emerald-600" />
                    Finance & Comptabilité
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Budget, redevances, amendes, recouvrement et comptabilité publique
                </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                {sousModules.map((sm) => (
                    <Card key={sm.label} className="border-dashed">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center justify-between text-base">
                                <span className="flex items-center gap-2">
                                    <sm.icon className="h-4 w-4 text-muted-foreground" />
                                    {sm.label}
                                </span>
                                <Badge variant="outline" className="text-xs">{sm.phase}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Ce sous-module sera implémenté en {sm.phase}.
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
