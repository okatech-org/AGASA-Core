"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import {
    Inbox, Send, Search, Plus, Filter, FileText, MailOpen, Mail,
    AlertCircle, FileInput, MapPin, Tag, CheckCircle2, Archive, FileArchive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function BoiteReceptionPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("entrant");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatut, setFilterStatut] = useState("tous");
    const [filterPriorite, setFilterPriorite] = useState("toutes");

    const courriers = useQuery(api.ged.courrier.listCourriers, {
        userId: user?._id as any,
        type: activeTab as any,
        statut: filterStatut !== "tous" ? filterStatut : undefined,
        priorite: filterPriorite !== "toutes" ? filterPriorite : undefined
    });

    const getPrioriteColor = (priorite: string) => {
        switch (priorite) {
            case "urgent": return "bg-red-100 text-red-800 border-red-200";
            case "important": return "bg-orange-100 text-orange-800 border-orange-200";
            case "normal": return "bg-green-100 text-green-800 border-green-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getStatutBadge = (statut: string) => {
        switch (statut) {
            case "recu": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Mail className="w-3 h-3 mr-1" /> Reçu</Badge>;
            case "en_traitement": return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200"><AlertCircle className="w-3 h-3 mr-1" /> En traitement</Badge>;
            case "traite": return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Traité</Badge>;
            case "archive": return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200"><FileArchive className="w-3 h-3 mr-1" /> Archivé</Badge>;
            default: return <Badge variant="outline">{statut}</Badge>;
        }
    };

    const filtered = (courriers || []).filter(c => {
        const full = `${c.reference} ${c.objet} ${c.emetteur} ${c.destinataire}`.toLowerCase();
        return full.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tightflex items-center gap-2">
                        <Inbox className="h-6 w-6 text-[#1B4F72] inline-block mr-2" />
                        Boîte de réception
                    </h1>
                    <p className="text-muted-foreground text-sm">Gestion centralisée du courrier AGASA</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button onClick={() => router.push("/ged/courrier/nouveau")} className="bg-[#1B4F72] hover:bg-[#1B4F72]/90 w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" /> Numériser Courrier
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="entrant" className="w-full" onValueChange={setActiveTab}>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b pb-4">
                    <TabsList className="bg-muted/50 p-1 w-full sm:w-auto h-auto">
                        <TabsTrigger value="entrant" className="data-[state=active]:bg-white px-6 py-2">
                            <FileInput className="w-4 h-4 mr-2" /> Courrier Entrant
                        </TabsTrigger>
                        <TabsTrigger value="sortant" className="data-[state=active]:bg-white px-6 py-2">
                            <Send className="w-4 h-4 mr-2" /> Courrier Sortant
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Chercher un objet, référence..."
                                className="pl-8 h-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={filterStatut} onValueChange={setFilterStatut}>
                            <SelectTrigger className="w-[140px] h-9">
                                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="tous">Tous les statuts</SelectItem>
                                <SelectItem value="recu">Reçu</SelectItem>
                                <SelectItem value="en_traitement">En traitement</SelectItem>
                                <SelectItem value="traite">Traité</SelectItem>
                                <SelectItem value="archive">Archivé</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterPriorite} onValueChange={setFilterPriorite}>
                            <SelectTrigger className="w-[130px] h-9">
                                <SelectValue placeholder="Priorité" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="toutes">Toutes</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                                <SelectItem value="important">Important</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mt-4">
                    <div className="bg-white rounded-lg border shadow-sm">
                        {courriers === undefined ? (
                            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B4F72] mb-4"></div>
                                Chargement des courriers...
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="p-16 text-center">
                                <MailOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-muted-foreground">Aucun courrier trouvé</h3>
                                <p className="text-sm text-muted-foreground mt-1">Vous n'avez aucun courrier {activeTab} correspondant à ces filtres.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50 text-xs uppercase tracking-wider">
                                        <TableHead className="w-[200px]">Date & Réf</TableHead>
                                        <TableHead>{activeTab === "entrant" ? "Émetteur" : "Destinataire"}</TableHead>
                                        <TableHead>Objet</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((c) => (
                                        <TableRow key={c._id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push(`/ged/courrier/${c._id}`)}>
                                            <TableCell>
                                                <div className="font-semibold text-sm">{format(c.dateDocument, "dd MMM yyyy", { locale: fr })}</div>
                                                <div className="text-xs text-muted-foreground uppercase flex items-center gap-1 mt-1">
                                                    <Tag className="w-3 h-3" /> {c.reference}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-sm">
                                                    {activeTab === "entrant" ? c.emetteur : c.destinataire}
                                                </div>
                                                <div className="mt-1">
                                                    <Badge variant="outline" className={`font-normal text-[10px] uppercase h-5 rounded-sm ${getPrioriteColor(c.priorite)}`}>
                                                        {c.priorite}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-medium line-clamp-1 text-sm">{c.objet}</p>
                                                <p className="text-xs text-muted-foreground capitalize mt-1 flex gap-2">
                                                    {c.categorie.replace("_", " ")}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                {getStatutBadge(c.statut)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/ged/courrier/${c._id}`); }}>
                                                    Afficher <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </div>
            </Tabs>
        </div>
    );
}

// Manually stubbing ArrowRight here to keep imports clean at top
function ArrowRight(props: any) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>;
}
