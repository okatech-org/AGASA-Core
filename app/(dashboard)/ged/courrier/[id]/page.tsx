"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Mail, Clock, ShieldCheck, Tag, Info, UserRound, Eye, EyeOff, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { useEffect } from "react";

export default function CourrierDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const courrierId = params.id as string;

    const courrier = useQuery(api.ged.courrier.getCourrier, {
        userId: user?._id as any,
        courrierId: courrierId as any
    });

    const marquerLu = useMutation(api.ged.courrier.marquerCommeLu);
    const updateStatut = useMutation(api.ged.courrier.updateStatut);

    // Auto-mark as read
    useEffect(() => {
        if (courrier && user) {
            const maDiffusion = courrier.diffusions?.find((d: any) => d.destinataireId === user._id);
            if (maDiffusion && !maDiffusion.lu) {
                marquerLu({ userId: user._id, courrierId: courrier._id }).catch(console.error);
            }
        }
    }, [courrier, user, marquerLu]);


    if (courrier === undefined) return <div className="p-12 pl-20"><div className="animate-pulse h-8 w-64 bg-slate-200 rounded mb-4"></div></div>;
    if (!courrier) return <div className="p-10 text-center text-red-500">Courrier introuvable ou accès refusé.</div>;

    const handleStatutChange = async (nouveauStatut: string) => {
        if (!user) return;
        try {
            await updateStatut({
                userId: user._id,
                courrierId: courrier._id,
                statut: nouveauStatut as any
            });
            toast.success("Statut mis à jour");
        } catch (e: any) {
            toast.error("Erreur", { description: e.message });
        }
    };

    const getPrioriteBadge = () => {
        switch (courrier.priorite) {
            case "urgent": return <Badge className="bg-red-500 hover:bg-red-600">Urgent</Badge>;
            case "important": return <Badge className="bg-orange-500 hover:bg-orange-600">Important</Badge>;
            case "normal": return <Badge className="bg-green-500 hover:bg-green-600">Normal</Badge>;
            default: return null;
        }
    };

    const getIconForType = () => {
        return courrier.type === "entrant" ?
            <Mail className="w-8 h-8 text-blue-600" /> :
            <Mail className="w-8 h-8 text-emerald-600" />;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-lg border shadow-sm">
                            {getIconForType()}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="uppercase text-[10px] tracking-wider font-semibold border-slate-300">
                                    {courrier.type === "entrant" ? "Arrivée" : "Départ"}
                                </Badge>
                                {courrier.confidentiel && (
                                    <Badge variant="destructive" className="uppercase text-[10px]"><ShieldCheck className="w-3 h-3 mr-1" /> Confidentiel</Badge>
                                )}
                            </div>
                            <h1 className="text-xl md:text-2xl font-bold tracking-tight">{courrier.reference}</h1>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white p-1 rounded-md border shadow-sm">
                    <div className="px-3 py-1.5 text-sm font-medium border-r">
                        Statut :
                    </div>
                    <Select value={courrier.statut} onValueChange={handleStatutChange}>
                        <SelectTrigger className="w-[160px] border-0 focus:ring-0 font-medium">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="recu">Reçu</SelectItem>
                            <SelectItem value="en_traitement">En traitement</SelectItem>
                            <SelectItem value="traite">Traité</SelectItem>
                            <SelectItem value="archive">Archivé</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Colonne gauche (2/3) : PDF Document */}
                <div className="lg:col-span-2 space-y-6 h-full flex flex-col">
                    <Card className="flex-1 flex flex-col overflow-hidden border-2 border-[#1B4F72]/10">
                        <CardHeader className="py-3 px-4 bg-slate-50 border-b flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-[#1B4F72]">
                                <FileText className="w-4 h-4" /> Document Numérisé
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => window.open(courrier.documentUrl ?? '', '_blank')}>
                                <Download className="w-4 h-4 mr-2" /> Télécharger
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 min-h-[600px] relative bg-slate-100/50">
                            {courrier.documentUrl ? (
                                <iframe
                                    src={`${courrier.documentUrl}#view=FitH`}
                                    className="absolute inset-0 w-full h-full border-0"
                                    title="Visionneuse PDF"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                    Document indisponible
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Colonne droite (1/3) : Métadonnées */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Info className="h-4 w-4 text-muted-foreground" />
                                Informations de base
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4 text-sm">
                            <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Objet</h4>
                                <p className="font-medium text-base">{courrier.objet}</p>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Catégorie</h4>
                                    <Badge variant="outline" className="capitalize font-normal border-slate-300">
                                        {courrier.categorie.replace("_", " ")}
                                    </Badge>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Priorité</h4>
                                    {getPrioriteBadge()}
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                        {courrier.type === "entrant" ? "Expéditeur" : "Service Émetteur"}
                                    </h4>
                                    <p className="font-medium bg-slate-50 p-2 rounded border border-slate-100">{courrier.emetteur}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                        Destinataire Principal
                                    </h4>
                                    <p className="font-medium bg-slate-50 p-2 rounded border border-slate-100">{courrier.destinataire}</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> Date Courrier
                                    </h4>
                                    <p>{format(courrier.dateDocument, "dd MMM yyyy", { locale: fr })}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> Enregistré le
                                    </h4>
                                    <p>{format(courrier.dateReception, "dd/MM/yyyy HH:mm")}</p>
                                </div>
                            </div>

                            {courrier.tags && courrier.tags.length > 0 && (
                                <>
                                    <Separator />
                                    <div>
                                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                                            <Tag className="h-3 w-3" /> Mots-clés
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {courrier.tags.map((tag: string, i: number) => (
                                                <Badge key={i} variant="secondary" className="font-normal bg-blue-50 text-blue-700 hover:bg-blue-100">
                                                    #{tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-base flex items-center justify-between">
                                <span className="flex items-center gap-2"><UserRound className="h-4 w-4 text-muted-foreground" /> Diffusion Interne</span>
                                <Badge variant="outline" className="ml-2 font-normal rounded-full h-5 px-2 bg-slate-50">
                                    {courrier.diffusions?.length || 0} agents
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 p-0">
                            {courrier.diffusions && courrier.diffusions.length > 0 ? (
                                <ul className="divide-y divide-border/50">
                                    {courrier.diffusions.map((diff: any) => (
                                        <li key={diff._id} className="p-3 flex items-start gap-3 hover:bg-slate-50/50 transition-colors">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">
                                                    {diff.destinataire?.prenom} {diff.destinataire?.nom}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground truncate">
                                                    {diff.destinataire?.poste} ({diff.destinataire?.direction})
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end shrink-0 pt-0.5">
                                                {diff.lu ? (
                                                    <div className="flex items-center text-emerald-600 space-x-1" title={diff.dateLecture ? format(diff.dateLecture, "dd/MM/yyyy HH:mm") : "Lu"}>
                                                        <Eye className="h-3.5 w-3.5" />
                                                        <span className="text-[10px] font-medium leading-none">Lu</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center text-slate-400 space-x-1">
                                                        <EyeOff className="h-3.5 w-3.5" />
                                                        <span className="text-[10px] font-medium leading-none">Non lu</span>
                                                    </div>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-6 text-center text-sm text-muted-foreground italic">
                                    Aucune diffusion interne définie pour ce courrier.
                                </div>
                            )}
                        </CardContent>
                        <div className="bg-slate-50 border-t p-3 text-xs text-muted-foreground text-center rounded-b-lg">
                            Saisie par {courrier.createur?.prenom} {courrier.createur?.nom}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
