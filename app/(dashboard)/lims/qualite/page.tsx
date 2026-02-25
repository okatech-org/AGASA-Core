"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ShieldCheck, Activity, AlertTriangle, PlusCircle, CheckCircle } from "lucide-react";

export default function LimsQualitePage() {
    const { user } = useAuth();
    // Utilisation des fausses données pour la démonstration de la carte de contrôle Shewhart (ISO 17025)
    // Dans une version finale, ces points sont extraits des historiques de blanc / standards du backend
    const shewhartData = [
        { lot: "L-01", valeur: 10.2 }, { lot: "L-02", valeur: 9.8 }, { lot: "L-03", valeur: 10.5 },
        { lot: "L-04", valeur: 11.1 }, { lot: "L-05", valeur: 9.9 }, { lot: "L-06", valeur: 10.1 },
        { lot: "L-07", valeur: 10.8 }, { lot: "L-08", valeur: 12.5 }, { lot: "L-09", valeur: 10.3 },
        { lot: "L-10", valeur: 9.7 }, { lot: "L-11", valeur: 10.0 }, { lot: "L-12", valeur: 10.6 },
    ];

    // Valeurs cibles de la carte de contrôle
    const cible = 10.0;
    const limiteActionSupp = 12.0;
    const limiteActionInf = 8.0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-rose-600 pl-3">Contrôle Qualité & ISO 17025</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Cartes de contrôle, non-conformités et audits internes.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="bg-white text-slate-700">Audit Check-list</Button>
                    <Button className="bg-rose-600 hover:bg-rose-700 text-white">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Déclarer une Non-Conformité
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Carte de supervision QA */}
                <Card className="shadow-sm border-slate-200 md:col-span-1">
                    <CardHeader className="bg-slate-50/50 border-b p-4">
                        <CardTitle className="text-base text-slate-800 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-600" /> Taux de Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium">Conformité des Procédures</span>
                                    <span className="text-sm font-bold text-emerald-700">98%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full w-[98%]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium">Essais Inter-Laboratoires (Z-Score)</span>
                                    <span className="text-sm font-bold text-emerald-700">100%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full w-[100%]"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium">Clôture des NC (30 jours)</span>
                                    <span className="text-sm font-bold text-amber-600">85%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-amber-500 h-full w-[85%]"></div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Carte de contrôle de Shewhart */}
                <Card className="shadow-sm border-slate-200 md:col-span-2">
                    <CardHeader className="bg-slate-50/50 border-b p-4">
                        <CardTitle className="text-base text-slate-800 flex items-center gap-2"><Activity className="w-5 h-5 text-purple-600" /> Carte de Contrôle (Shewhart)</CardTitle>
                        <CardDescription>Suivi de dérive de l'ICP-OES (Ex: Mesure d'un standard de Plomb 10ppm)</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 h-[300px]">
                        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                            <LineChart data={shewhartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="lot" tick={{ fontSize: 12, fill: '#64748B' }} />
                                <YAxis domain={[6, 14]} tick={{ fontSize: 12, fill: '#64748B' }} />
                                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />

                                {/* Limites de contrôle */}
                                <ReferenceLine y={limiteActionSupp} stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'top', value: 'LCS (12)', fill: '#EF4444', fontSize: 10 }} />
                                <ReferenceLine y={cible} stroke="#22C55E" label={{ position: 'right', value: 'Cible (10)', fill: '#22C55E', fontSize: 10 }} />
                                <ReferenceLine y={limiteActionInf} stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'bottom', value: 'LCI (8)', fill: '#EF4444', fontSize: 10 }} />

                                <Line
                                    type="monotone"
                                    dataKey="valeur"
                                    stroke="#8B5CF6"
                                    strokeWidth={2}
                                    dot={(props: any) => {
                                        const { cx, cy, payload } = props;
                                        // Point rouge si hors limite
                                        if (payload.valeur >= limiteActionSupp || payload.valeur <= limiteActionInf) {
                                            return <circle cx={cx} cy={cy} r={6} fill="#EF4444" stroke="white" strokeWidth={2} />;
                                        }
                                        return <circle cx={cx} cy={cy} r={4} fill="#8B5CF6" />;
                                    }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Registre des Non-Conformités (NC) */}
            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50/50 border-b p-4">
                    <CardTitle className="text-base text-slate-800 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-rose-600" /> Fiches d'Anomalies / Non-Conformités</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/30">
                                <TableHead className="w-[100px]">Code</TableHead>
                                <TableHead>Titre / Description</TableHead>
                                <TableHead>Date Déclaration</TableHead>
                                <TableHead>Responsable (CAPA)</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Alerte</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="hover:bg-slate-50 cursor-pointer">
                                <TableCell className="font-mono font-bold text-slate-700 text-xs">NC-2026-004</TableCell>
                                <TableCell>
                                    <div className="font-medium text-slate-900 border-l-2 border-red-500 pl-2">Dérive instrumentale de l'AAS</div>
                                    <div className="text-xs text-slate-500 pl-2 mt-0.5">Le standard interne montre un Z-score à 3.1 dépassant la limite de tolérance (+/- 2).</div>
                                </TableCell>
                                <TableCell className="text-sm font-medium text-slate-700">14 Mar 2026</TableCell>
                                <TableCell className="text-sm text-slate-600">Tech. Mba</TableCell>
                                <TableCell>
                                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Investigation</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <span className="flex items-center justify-end text-red-600 text-xs font-bold gap-1"><AlertTriangle className="w-3 h-3" /> Mineur</span>
                                </TableCell>
                            </TableRow>

                            <TableRow className="hover:bg-slate-50 cursor-pointer">
                                <TableCell className="font-mono font-bold text-slate-700 text-xs">NC-2026-003</TableCell>
                                <TableCell>
                                    <div className="font-medium text-slate-900 border-l-2 border-emerald-500 pl-2">Rupture chaîne du froid sur lot de Tilapia</div>
                                    <div className="text-xs text-slate-500 pl-2 mt-0.5">Échantillon reçu à 12°C au lieu de 4°C maximum.</div>
                                </TableCell>
                                <TableCell className="text-sm font-medium text-slate-700">01 Mar 2026</TableCell>
                                <TableCell className="text-sm text-slate-600">Resp. Ndong</TableCell>
                                <TableCell>
                                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200"><CheckCircle className="w-3 h-3 mr-1" /> Clôturée</Badge>
                                </TableCell>
                                <TableCell className="text-right text-xs text-slate-400 italic">Corrigé</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>
    );
}
