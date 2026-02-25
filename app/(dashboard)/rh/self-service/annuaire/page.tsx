"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Search, MapPin, Mail, Phone, Building2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export default function AnnuairePage() {
    const router = useRouter();
    const annuaire = useQuery(api.rh.selfService.getAnnuaire);
    const [searchTerm, setSearchTerm] = useState("");

    if (annuaire === undefined) {
        return <div className="p-8 text-center text-muted-foreground">Chargement de l'annuaire...</div>;
    }

    const filtered = annuaire.filter((agent: any) => {
        const str = `${agent.nom} ${agent.prenom} ${agent.poste} ${agent.direction} ${agent.province}`.toLowerCase();
        return str.includes(searchTerm.toLowerCase());
    });

    const getInitials = (nom: string, prenom: string) => `${prenom?.[0] || ""}${nom?.[0] || ""}`;

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Annuaire des Collaborateurs</h1>
                        <p className="text-muted-foreground text-sm">Trouvez rapidement les coordonnées de vos collègues AGASA</p>
                    </div>
                </div>
            </div>

            <div className="relative max-w-md mx-auto sm:mx-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Chercher un nom, un poste, une direction..."
                    className="pl-10 h-12 text-base shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                    <Building2 className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    Aucun collaborateur trouvé pour "{searchTerm}"
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((agent: any) => (
                        <Card key={agent.id} className="overflow-hidden hover:shadow-md transition-shadow border-muted/60">
                            <CardContent className="p-0">
                                <div className="h-16 bg-[#1B4F72]/5 w-full border-b" />
                                <div className="px-6 pb-6 pt-0 relative">
                                    <Avatar className="h-16 w-16 border-4 border-background absolute -top-8 shadow-sm">
                                        <AvatarImage src={agent.avatar} />
                                        <AvatarFallback className="text-lg bg-secondary text-secondary-foreground font-semibold">
                                            {getInitials(agent.nom, agent.prenom)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="mt-10 space-y-1">
                                        <h3 className="font-bold text-lg leading-tight">{agent.prenom} {agent.nom}</h3>
                                        <p className="text-[#1B4F72] font-medium text-sm line-clamp-1">{agent.poste}</p>
                                        <div className="text-xs font-semibold text-muted-foreground mt-0.5">
                                            {agent.direction} {agent.service ? `- ${agent.service}` : ''}
                                        </div>
                                    </div>

                                    <div className="mt-5 space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            <a href={`mailto:${agent.email}`} className="hover:text-blue-600 hover:underline truncate">{agent.email}</a>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            <span>{agent.telephone || "Non renseigné"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            <span>{agent.province}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
