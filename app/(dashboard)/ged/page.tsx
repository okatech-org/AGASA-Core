import { FileText, Mail, PenTool, GitBranch, Archive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const sousModules = [
    { label: "Courrier entrant/sortant", icon: Mail, phase: "Phase 5.1" },
    { label: "Signature électronique", icon: PenTool, phase: "Phase 5.1" },
    { label: "Workflows de validation", icon: GitBranch, phase: "Phase 5.2" },
    { label: "Archivage réglementaire", icon: Archive, phase: "Phase 5.2" },
];

export default function GEDPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="flex items-center gap-2 text-2xl font-bold">
                    <FileText className="h-6 w-6 text-amber-600" />
                    Gestion Documentaire (GED)
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Courrier numérisé, signature électronique, workflows et archivage
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
