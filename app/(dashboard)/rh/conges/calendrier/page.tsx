"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function CalendrierEquipePage() {
    const { user } = useAuth();
    const router = useRouter();
    const conges = useQuery(api.rh.conges.list, user?._id ? { userId: user._id } : "skip");

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const days = getDaysInMonth(currentYear, currentMonth);
    const firstDayStr = new Date(currentYear, currentMonth, 1).toLocaleDateString('fr-FR', { weekday: 'short' });

    // Filtre des congés approuvés du mois courant
    const congesCalendrier = conges?.filter((c: any) => {
        const debut = new Date(c.dateDebut);
        const fin = new Date(c.dateFin);
        return (c.statut === "approuve_drh" || c.statut === "approuve_n1") &&
            (debut.getMonth() === currentMonth || fin.getMonth() === currentMonth);
    }) || [];

    const isOnLeave = (agentId: string, day: number) => {
        const currentDate = new Date(currentYear, currentMonth, day).getTime();
        return congesCalendrier.some((c: any) =>
            c.agentId === agentId &&
            currentDate >= c.dateDebut &&
            currentDate <= c.dateFin
        );
    };

    const agentsInLeaveThisMonth = Array.from(new Set(congesCalendrier.map((c: any) => c.agentId)));

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Calendrier d'équipe</h1>
                    <p className="text-muted-foreground text-sm">Aperçu mensuel des absences planifiées</p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/20 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-blue-600" />
                        {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).toUpperCase()}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    {agentsInLeaveThisMonth.length > 0 ? (
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-muted/10 border-b">
                                    <th className="p-3 text-left w-48 sticky left-0 bg-card border-r shadow-sm">Agent</th>
                                    {Array.from({ length: days }).map((_, i) => (
                                        <th key={i} className="p-2 min-w-[30px] text-center border-r font-medium text-xs text-muted-foreground">
                                            {i + 1}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {agentsInLeaveThisMonth.map((agentId, idx) => {
                                    const cRef = congesCalendrier.find((c: any) => c.agentId === agentId);
                                    return (
                                        <tr key={idx} className="border-b hover:bg-muted/5">
                                            <td className="p-3 sticky left-0 bg-card border-r shadow-sm font-medium truncate">
                                                {cRef?.user?.prenom} {cRef?.user?.nom}
                                            </td>
                                            {Array.from({ length: days }).map((_, i) => (
                                                <td key={i} className={`p-1 border-r border-dashed ${isOnLeave(agentId as string, i + 1) ? 'bg-[#27AE60]/20' : ''}`}>
                                                    {isOnLeave(agentId as string, i + 1) && (
                                                        <div className="w-full h-full bg-[#27AE60] rounded-sm opacity-80 min-h-[24px]"></div>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-10 text-center text-muted-foreground">
                            Aucune absence planifiée dans votre équipe pour ce mois-ci.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
