"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { AlertTriangle, MapPin, TrendingUp, TrendingDown, Minus } from "lucide-react";

const contaminantsData = [
    { province: "Estuaire", plomb: 0.08, cadmium: 0.03, mercure: 0.02, aflatoxine: 3.2, pesticides: 0.05, ecoli: 85, salmonella: 2, tendance: "stable" },
    { province: "Haut-Ogooué", plomb: 0.12, cadmium: 0.05, mercure: 0.04, aflatoxine: 4.8, pesticides: 0.08, ecoli: 120, salmonella: 5, tendance: "hausse" },
    { province: "Ogooué-Maritime", plomb: 0.06, cadmium: 0.02, mercure: 0.35, aflatoxine: 2.1, pesticides: 0.03, ecoli: 65, salmonella: 1, tendance: "baisse" },
    { province: "Woleu-Ntem", plomb: 0.15, cadmium: 0.06, mercure: 0.03, aflatoxine: 7.2, pesticides: 0.12, ecoli: 150, salmonella: 4, tendance: "hausse" },
    { province: "Moyen-Ogooué", plomb: 0.05, cadmium: 0.02, mercure: 0.01, aflatoxine: 1.8, pesticides: 0.02, ecoli: 50, salmonella: 0, tendance: "baisse" },
    { province: "Nyanga", plomb: 0.18, cadmium: 0.07, mercure: 0.05, aflatoxine: 8.5, pesticides: 0.15, ecoli: 180, salmonella: 6, tendance: "hausse" },
    { province: "Ngounié", plomb: 0.09, cadmium: 0.04, mercure: 0.02, aflatoxine: 3.5, pesticides: 0.06, ecoli: 90, salmonella: 2, tendance: "stable" },
    { province: "Ogooué-Ivindo", plomb: 0.07, cadmium: 0.03, mercure: 0.02, aflatoxine: 2.8, pesticides: 0.04, ecoli: 70, salmonella: 1, tendance: "stable" },
    { province: "Ogooué-Lolo", plomb: 0.14, cadmium: 0.06, mercure: 0.04, aflatoxine: 6.1, pesticides: 0.10, ecoli: 140, salmonella: 3, tendance: "hausse" },
];

const seuils = {
    plomb: 0.1,
    cadmium: 0.05,
    mercure: 0.5,
    aflatoxine: 5,
    pesticides: 0.1,
    ecoli: 100,
    salmonella: 0,
};

function getRiskLevel(value: number, seuil: number): string {
    if (value > seuil * 1.5) return "critique";
    if (value > seuil) return "depassement";
    if (value > seuil * 0.8) return "vigilance";
    return "conforme";
}

const riskColors: Record<string, string> = {
    conforme: "text-emerald-600",
    vigilance: "text-amber-600",
    depassement: "text-red-600 font-bold",
    critique: "text-red-700 font-bold bg-red-50",
};

const tendanceIcons: Record<string, typeof TrendingUp> = {
    hausse: TrendingUp,
    baisse: TrendingDown,
    stable: Minus,
};

const tendanceColors: Record<string, string> = {
    hausse: "text-red-500",
    baisse: "text-emerald-500",
    stable: "text-slate-400",
};

export default function ContaminantsPage() {
    const [typeFilter, setTypeFilter] = useState("tous");

    const alertes = contaminantsData.reduce((acc, d) => {
        if (d.plomb > seuils.plomb) acc++;
        if (d.cadmium > seuils.cadmium) acc++;
        if (d.aflatoxine > seuils.aflatoxine) acc++;
        if (d.pesticides > seuils.pesticides) acc++;
        if (d.ecoli > seuils.ecoli) acc++;
        if (d.salmonella > seuils.salmonella) acc++;
        return acc;
    }, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <AlertTriangle className="h-7 w-7 text-orange-600" /> Base de données des contaminants
                    </h1>
                    <p className="text-muted-foreground text-sm">Cartographie des contaminations par province — Données agrégées des analyses LAA</p>
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[220px]"><SelectValue placeholder="Type de contaminant" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="tous">Tous les contaminants</SelectItem>
                        <SelectItem value="metaux">Métaux lourds</SelectItem>
                        <SelectItem value="mycotoxines">Mycotoxines</SelectItem>
                        <SelectItem value="pesticides">Pesticides</SelectItem>
                        <SelectItem value="microbiologiques">Microbiologiques</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="shadow-sm border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                        <p className="text-xs text-slate-500">Dépassements détectés</p>
                        <p className="text-2xl font-bold text-red-600">{alertes}</p>
                        <p className="text-xs text-slate-400">sur l&apos;ensemble des provinces</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-xs text-slate-500">Provinces analysées</p>
                        <p className="text-2xl font-bold">{contaminantsData.length}</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-xs text-slate-500">Province la plus exposée</p>
                        <p className="text-lg font-bold text-red-600">Nyanga</p>
                        <p className="text-xs text-slate-400">6 dépassements</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                    <CardContent className="p-4">
                        <p className="text-xs text-slate-500">Province la plus saine</p>
                        <p className="text-lg font-bold text-emerald-600">Moyen-Ogooué</p>
                        <p className="text-xs text-slate-400">0 dépassement</p>
                    </CardContent>
                </Card>
            </div>

            {/* Seuils */}
            <Card className="shadow-sm bg-amber-50 border-amber-200">
                <CardContent className="p-4 text-sm">
                    <p className="font-semibold text-amber-800 mb-2">📋 Seuils réglementaires (Codex Alimentarius — STAN 193)</p>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs text-amber-700">
                        <span>Pb : ≤ {seuils.plomb} mg/kg</span>
                        <span>Cd : ≤ {seuils.cadmium} mg/kg</span>
                        <span>Hg : ≤ {seuils.mercure} mg/kg</span>
                        <span>Afla. B1 : ≤ {seuils.aflatoxine} µg/kg</span>
                        <span>Pesticides : ≤ {seuils.pesticides} mg/kg</span>
                        <span>E. coli : ≤ {seuils.ecoli} UFC/g</span>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="shadow-sm">
                <CardHeader className="bg-slate-50 border-b pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Niveaux de contamination par province
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead>Province</TableHead>
                                {(typeFilter === "tous" || typeFilter === "metaux") && <TableHead className="text-right">Pb (mg/kg)</TableHead>}
                                {(typeFilter === "tous" || typeFilter === "metaux") && <TableHead className="text-right">Cd (mg/kg)</TableHead>}
                                {(typeFilter === "tous" || typeFilter === "metaux") && <TableHead className="text-right">Hg (mg/kg)</TableHead>}
                                {(typeFilter === "tous" || typeFilter === "mycotoxines") && <TableHead className="text-right">Afla. B1 (µg/kg)</TableHead>}
                                {(typeFilter === "tous" || typeFilter === "pesticides") && <TableHead className="text-right">Pesticides (mg/kg)</TableHead>}
                                {(typeFilter === "tous" || typeFilter === "microbiologiques") && <TableHead className="text-right">E. coli (UFC/g)</TableHead>}
                                {(typeFilter === "tous" || typeFilter === "microbiologiques") && <TableHead className="text-right">Salmonella</TableHead>}
                                <TableHead>Tendance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {contaminantsData.map((d) => {
                                const TIcon = tendanceIcons[d.tendance];
                                return (
                                    <TableRow key={d.province} className="hover:bg-slate-50/60">
                                        <TableCell className="font-medium text-sm">{d.province}</TableCell>
                                        {(typeFilter === "tous" || typeFilter === "metaux") && <TableCell className={`text-right text-sm ${riskColors[getRiskLevel(d.plomb, seuils.plomb)]}`}>{d.plomb.toFixed(2)}</TableCell>}
                                        {(typeFilter === "tous" || typeFilter === "metaux") && <TableCell className={`text-right text-sm ${riskColors[getRiskLevel(d.cadmium, seuils.cadmium)]}`}>{d.cadmium.toFixed(3)}</TableCell>}
                                        {(typeFilter === "tous" || typeFilter === "metaux") && <TableCell className={`text-right text-sm ${riskColors[getRiskLevel(d.mercure, seuils.mercure)]}`}>{d.mercure.toFixed(2)}</TableCell>}
                                        {(typeFilter === "tous" || typeFilter === "mycotoxines") && <TableCell className={`text-right text-sm ${riskColors[getRiskLevel(d.aflatoxine, seuils.aflatoxine)]}`}>{d.aflatoxine.toFixed(1)}</TableCell>}
                                        {(typeFilter === "tous" || typeFilter === "pesticides") && <TableCell className={`text-right text-sm ${riskColors[getRiskLevel(d.pesticides, seuils.pesticides)]}`}>{d.pesticides.toFixed(2)}</TableCell>}
                                        {(typeFilter === "tous" || typeFilter === "microbiologiques") && <TableCell className={`text-right text-sm ${riskColors[getRiskLevel(d.ecoli, seuils.ecoli)]}`}>{d.ecoli}</TableCell>}
                                        {(typeFilter === "tous" || typeFilter === "microbiologiques") && <TableCell className={`text-right text-sm ${d.salmonella > 0 ? "text-red-600 font-bold" : "text-emerald-600"}`}>{d.salmonella > 0 ? `${d.salmonella} cas` : "0"}</TableCell>}
                                        <TableCell>
                                            <span className={`flex items-center gap-1 text-xs font-medium ${tendanceColors[d.tendance]}`}>
                                                <TIcon className="h-3.5 w-3.5" />
                                                {d.tendance === "hausse" ? "↑ Hausse" : d.tendance === "baisse" ? "↓ Baisse" : "— Stable"}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <p className="text-xs text-slate-400">Données agrégées sur les 90 derniers jours — Moyennes pondérées des résultats d&apos;analyses LAA. Les valeurs en rouge dépassent les seuils réglementaires.</p>
        </div>
    );
}
