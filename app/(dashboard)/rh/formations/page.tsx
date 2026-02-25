"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { BookOpen, Calendar, Clock, MapPin, Users, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function FormationsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const formations = useQuery(api.rh.formations.list);

    const isDAF = user?.role === "admin_systeme" || user?.direction === "DAF" || user?.demoSimulatedRole === "admin_systeme";

    if (formations === undefined) {
        return <div className="p-8 text-center text-muted-foreground">Chargement du catalogue...</div>;
    }

    const formationsActives = formations.filter((f: any) => f.statut !== "annulee");

    const getCategoryBadgeColor = (cat: string) => {
        switch (cat) {
            case "HACCP": return "bg-orange-100 text-orange-800 border-orange-200";
            case "ISO_22000": return "bg-blue-100 text-blue-800 border-blue-200";
            case "ISO_17025": return "bg-indigo-100 text-indigo-800 border-indigo-200";
            case "culture_numerique": return "bg-purple-100 text-purple-800 border-purple-200";
            case "securite": return "bg-red-100 text-red-800 border-red-200";
            case "management": return "bg-green-100 text-green-800 border-green-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                        Catalogue de Formations
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Développement des compétences et formations continues</p>
                </div>
                {isDAF && (
                    <Button onClick={() => router.push("/rh/formations/nouvelle")} className="bg-[#1B4F72] hover:bg-[#1B4F72]/90">
                        <Plus className="mr-2 h-4 w-4" /> Planifier une session
                    </Button>
                )}
            </div>

            {formationsActives.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                    <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    Aucune formation planifiée pour le moment.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {formationsActives.map((f: any) => (
                        <Card key={f._id} className="flex flex-col h-full border shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3 border-b bg-muted/10">
                                <div className="flex justify-between items-start">
                                    <Badge className={`${getCategoryBadgeColor(f.categorie)} font-normal uppercase text-[10px]`}>
                                        {f.categorie.replace("_", " ")}
                                    </Badge>
                                    <Badge variant="outline" className={f.statut === "terminee" ? "text-gray-500" : "text-green-600"}>
                                        {f.statut}
                                    </Badge>
                                </div>
                                <CardTitle className="text-lg mt-3 line-clamp-2 leading-tight">{f.titre}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow pt-4 space-y-3 text-sm">
                                <div className="flex items-center text-muted-foreground">
                                    <Calendar className="mr-2 h-4 w-4 shrink-0" />
                                    <span>Du {new Date(f.dateDebut).toLocaleDateString('fr-FR')} au {new Date(f.dateFin).toLocaleDateString('fr-FR')}</span>
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                    <Clock className="mr-2 h-4 w-4 shrink-0" />
                                    <span>{f.duree} heures</span>
                                </div>
                                <div className="flex items-center text-muted-foreground line-clamp-1">
                                    <MapPin className="mr-2 h-4 w-4 shrink-0" />
                                    <span className="truncate">{f.lieu}</span>
                                </div>
                                <div className="flex items-center text-muted-foreground">
                                    <Users className="mr-2 h-4 w-4 shrink-0" />
                                    <span>Capacité : {f.capaciteMax} participants max</span>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-4 border-t">
                                <Button className="w-full text-[#1B4F72] border-[#1B4F72]/30 hover:bg-[#1B4F72]/5" variant="outline" onClick={() => router.push(`/rh/formations/${f._id}`)}>
                                    Voir les détails & Inscription <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
