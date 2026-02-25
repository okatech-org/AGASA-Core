import { Truck, Car, Package, Wrench, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const sousModules = [
    { label: "Flotte de véhicules", icon: Car, phase: "Phase 6.1" },
    { label: "Suivi GPS", icon: MapPin, phase: "Phase 6.1" },
    { label: "Stocks & Réactifs", icon: Package, phase: "Phase 6.2" },
    { label: "Maintenances", icon: Wrench, phase: "Phase 6.2" },
];

export default function LogistiquePage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="flex items-center gap-2 text-2xl font-bold">
                    <Truck className="h-6 w-6 text-orange-600" />
                    Logistique
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Flotte de véhicules, stocks de réactifs et maintenance des équipements
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
