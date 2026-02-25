"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { BookOpen, Search } from "lucide-react";

const categories = ["microbiologique", "chimique", "physique", "organoleptique"] as const;

const parametres = [
    { code: "MB-001", nom: "Salmonella spp.", categorie: "microbiologique", methode: "ISO 6579-1:2017", unite: "Absence/25g", lq: "—", seuil: "Absence/25g", norme: "Codex Alimentarius", equipement: "Incubateur", delai: 5 },
    { code: "MB-002", nom: "E. coli", categorie: "microbiologique", methode: "ISO 16649-2:2001", unite: "UFC/g", lq: "10", seuil: "100 UFC/g", norme: "Règlement CEMAC", equipement: "Incubateur", delai: 3 },
    { code: "MB-003", nom: "Listeria monocytogenes", categorie: "microbiologique", methode: "ISO 11290-1:2017", unite: "Absence/25g", lq: "—", seuil: "Absence/25g", norme: "Codex Alimentarius", equipement: "Incubateur", delai: 5 },
    { code: "MB-004", nom: "Campylobacter", categorie: "microbiologique", methode: "ISO 10272-1:2017", unite: "UFC/g", lq: "10", seuil: "1000 UFC/g", norme: "Codex Alimentarius", equipement: "Incubateur", delai: 4 },
    { code: "MB-005", nom: "Staphylococcus aureus", categorie: "microbiologique", methode: "ISO 6888-1:2021", unite: "UFC/g", lq: "10", seuil: "100 UFC/g", norme: "Règlement CEMAC", equipement: "Incubateur", delai: 3 },
    { code: "MB-006", nom: "Moisissures et levures", categorie: "microbiologique", methode: "ISO 21527-1:2008", unite: "UFC/g", lq: "10", seuil: "1000 UFC/g", norme: "Règlement CEMAC", equipement: "Incubateur", delai: 5 },
    { code: "CH-001", nom: "Plomb (Pb)", categorie: "chimique", methode: "ISO 17294-2:2016", unite: "mg/kg", lq: "0,01", seuil: "0,1 mg/kg", norme: "Codex STAN 193", equipement: "ICP-MS", delai: 2 },
    { code: "CH-002", nom: "Cadmium (Cd)", categorie: "chimique", methode: "ISO 17294-2:2016", unite: "mg/kg", lq: "0,005", seuil: "0,05 mg/kg", norme: "Codex STAN 193", equipement: "ICP-MS", delai: 2 },
    { code: "CH-003", nom: "Mercure (Hg)", categorie: "chimique", methode: "ISO 17294-2:2016", unite: "mg/kg", lq: "0,005", seuil: "0,5 mg/kg", norme: "Codex STAN 193", equipement: "ICP-MS", delai: 2 },
    { code: "CH-004", nom: "Arsenic (As)", categorie: "chimique", methode: "ISO 17294-2:2016", unite: "mg/kg", lq: "0,01", seuil: "0,1 mg/kg", norme: "Codex STAN 193", equipement: "ICP-MS", delai: 2 },
    { code: "CH-005", nom: "Aflatoxine B1", categorie: "chimique", methode: "ISO 16050:2003", unite: "µg/kg", lq: "0,5", seuil: "5 µg/kg", norme: "Codex STAN 193", equipement: "HPLC", delai: 3 },
    { code: "CH-006", nom: "Aflatoxines totales", categorie: "chimique", methode: "ISO 16050:2003", unite: "µg/kg", lq: "1", seuil: "10 µg/kg", norme: "Codex STAN 193", equipement: "HPLC", delai: 3 },
    { code: "CH-007", nom: "Résidus pesticides", categorie: "chimique", methode: "EN 15662:2018", unite: "mg/kg", lq: "0,01", seuil: "LMR variable", norme: "Codex MRL", equipement: "GC-MS", delai: 5 },
    { code: "CH-008", nom: "Histamine", categorie: "chimique", methode: "AOAC 977.13", unite: "mg/kg", lq: "5", seuil: "200 mg/kg", norme: "Codex STAN 302", equipement: "HPLC", delai: 2 },
    { code: "CH-009", nom: "Sulfites (SO₂)", categorie: "chimique", methode: "ISO 5523:2008", unite: "mg/kg", lq: "2", seuil: "Selon catégorie", norme: "Codex STAN 192", equipement: "Spectrophotomètre", delai: 1 },
    { code: "PH-001", nom: "pH", categorie: "physique", methode: "ISO 1842:1991", unite: "—", lq: "—", seuil: "Selon produit", norme: "—", equipement: "pH-mètre", delai: 0.5 },
    { code: "PH-002", nom: "Température", categorie: "physique", methode: "Thermométrie", unite: "°C", lq: "—", seuil: "Selon catégorie", norme: "—", equipement: "Thermomètre calibré", delai: 0.1 },
    { code: "PH-003", nom: "Humidité", categorie: "physique", methode: "ISO 712:2009", unite: "%", lq: "0,1", seuil: "Selon produit", norme: "—", equipement: "Étuve / Balance", delai: 4 },
    { code: "PH-004", nom: "Viscosité", categorie: "physique", methode: "ISO 2555:2018", unite: "mPa.s", lq: "—", seuil: "—", norme: "—", equipement: "Viscosimètre", delai: 0.5 },
    { code: "OR-001", nom: "Couleur", categorie: "organoleptique", methode: "Panel sensoriel", unite: "—", lq: "—", seuil: "Conforme/Non conforme", norme: "—", equipement: "—", delai: 0.5 },
    { code: "OR-002", nom: "Odeur", categorie: "organoleptique", methode: "Panel sensoriel", unite: "—", lq: "—", seuil: "Conforme/Non conforme", norme: "—", equipement: "—", delai: 0.5 },
    { code: "OR-003", nom: "Texture", categorie: "organoleptique", methode: "Panel sensoriel", unite: "—", lq: "—", seuil: "Conforme/Non conforme", norme: "—", equipement: "—", delai: 0.5 },
    { code: "OR-004", nom: "Goût", categorie: "organoleptique", methode: "Panel sensoriel", unite: "—", lq: "—", seuil: "Conforme/Non conforme", norme: "—", equipement: "—", delai: 0.5 },
];

const categorieLabels: Record<string, string> = {
    microbiologique: "Microbiologique",
    chimique: "Chimique",
    physique: "Physique",
    organoleptique: "Organoleptique",
};

const categorieBadge: Record<string, string> = {
    microbiologique: "bg-red-100 text-red-700",
    chimique: "bg-blue-100 text-blue-700",
    physique: "bg-emerald-100 text-emerald-700",
    organoleptique: "bg-amber-100 text-amber-700",
};

export default function ParametresPage() {
    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState("toutes");

    const filtered = parametres.filter(p => {
        if (search && !p.nom.toLowerCase().includes(search.toLowerCase()) && !p.code.toLowerCase().includes(search.toLowerCase())) return false;
        if (catFilter !== "toutes" && p.categorie !== catFilter) return false;
        return true;
    });

    const stats = {
        total: parametres.length,
        micro: parametres.filter(p => p.categorie === "microbiologique").length,
        chimique: parametres.filter(p => p.categorie === "chimique").length,
        physique: parametres.filter(p => p.categorie === "physique").length,
        organo: parametres.filter(p => p.categorie === "organoleptique").length,
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <BookOpen className="h-7 w-7 text-orange-600" /> Catalogue des paramètres d&apos;analyse
                </h1>
                <p className="text-muted-foreground text-sm">Référentiel des paramètres analytiques accrédités — {parametres.length} paramètres (extrait)</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Card className="shadow-sm"><CardContent className="p-3 text-center"><p className="text-xs text-slate-500">Total</p><p className="text-xl font-bold">{stats.total}</p></CardContent></Card>
                <Card className="shadow-sm"><CardContent className="p-3 text-center"><p className="text-xs text-red-600">Microbiologiques</p><p className="text-xl font-bold text-red-600">{stats.micro}</p></CardContent></Card>
                <Card className="shadow-sm"><CardContent className="p-3 text-center"><p className="text-xs text-blue-600">Chimiques</p><p className="text-xl font-bold text-blue-600">{stats.chimique}</p></CardContent></Card>
                <Card className="shadow-sm"><CardContent className="p-3 text-center"><p className="text-xs text-emerald-600">Physiques</p><p className="text-xl font-bold text-emerald-600">{stats.physique}</p></CardContent></Card>
                <Card className="shadow-sm"><CardContent className="p-3 text-center"><p className="text-xs text-amber-600">Organoleptiques</p><p className="text-xl font-bold text-amber-600">{stats.organo}</p></CardContent></Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Rechercher par nom ou code..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Select value={catFilter} onValueChange={setCatFilter}>
                    <SelectTrigger className="w-[200px]"><SelectValue placeholder="Catégorie" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="toutes">Toutes les catégories</SelectItem>
                        {categories.map(c => <SelectItem key={c} value={c}>{categorieLabels[c]}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <Card className="shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Paramètre</TableHead>
                                <TableHead>Catégorie</TableHead>
                                <TableHead>Méthode accréditée</TableHead>
                                <TableHead>Unité</TableHead>
                                <TableHead>LQ</TableHead>
                                <TableHead>Seuil réglementaire</TableHead>
                                <TableHead>Équipement</TableHead>
                                <TableHead className="text-right">Délai (j)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((p) => (
                                <TableRow key={p.code} className="hover:bg-slate-50/60">
                                    <TableCell className="font-mono text-xs font-semibold">{p.code}</TableCell>
                                    <TableCell className="text-sm font-medium">{p.nom}</TableCell>
                                    <TableCell><Badge className={`text-xs border-0 ${categorieBadge[p.categorie]}`}>{categorieLabels[p.categorie]}</Badge></TableCell>
                                    <TableCell className="text-xs text-slate-500">{p.methode}</TableCell>
                                    <TableCell className="text-sm">{p.unite}</TableCell>
                                    <TableCell className="text-sm text-slate-500">{p.lq}</TableCell>
                                    <TableCell className="text-sm font-medium">{p.seuil}</TableCell>
                                    <TableCell className="text-xs text-slate-500">{p.equipement}</TableCell>
                                    <TableCell className="text-right text-sm">{p.delai}</TableCell>
                                </TableRow>
                            ))}
                            {filtered.length === 0 && (
                                <TableRow><TableCell colSpan={9} className="text-center py-8 text-sm text-slate-400">Aucun paramètre trouvé</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <p className="text-xs text-slate-400 text-right">{filtered.length} paramètre(s) affiché(s) sur {parametres.length}</p>
        </div>
    );
}
