"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Megaphone, Smartphone, Globe, Radio, UploadCloud } from "lucide-react";
import { toast } from "sonner";

export default function NouveauRappelPage() {
    const router = useRouter();
    const { user } = useAuth();

    // Récupérer les alertes "confirmées" pour les lier
    const alertesActives = useQuery(api.alertes.alertes.listerAlertes as any, { userId: user?._id as any })?.filter((a: any) => a.statut === "confirmee") || [];

    const creer = useMutation(api.alertes.rappels.creerRappel as any);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        alerteId: "none",
        produit: "",
        marque: "",
        lot: "",
        motif: "",
        actionRecommandee: "Ne plus consommer et rapporter au point de vente.",
        pointsVente: "",
    });

    const [channels, setChannels] = useState({
        sms: false,
        push: true, // F6 par défaut
        portail: true, // F2 par défaut
        reseauxSociaux: false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.produit || !formData.lot || !formData.motif) {
            toast.error("Veuillez remplir les champs obligatoires (Produit, Lot, Motif).");
            return;
        }

        setIsSubmitting(true);
        try {
            await creer({
                userId: user?._id as any,
                alerteId: formData.alerteId !== "none" ? formData.alerteId : undefined,
                produit: formData.produit,
                marque: formData.marque,
                lot: formData.lot,
                motif: formData.motif,
                actionRecommandee: formData.actionRecommandee,
                pointsVenteConcernes: formData.pointsVente.split(',').map(s => s.trim()).filter(s => s),
                cannauxDiffusion: channels
            });
            toast.success("Procédure de rappel enclenchée avac succès.");
            router.push("/alertes/rappels");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        Déclencher un Rappel de Produit
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Diffusez une alerte interdisant la commercialisation d'un lot dangereux via les flux F2 et F6.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50 border-b">
                        <CardTitle className="text-base text-slate-800">Identification du Produit</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 lg:col-span-2">
                                <Label className="text-slate-600">Lier à une Alerte Nationale (Optionnel)</Label>
                                <Select value={formData.alerteId} onValueChange={(val) => setFormData({ ...formData, alerteId: val })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez une alerte confirmée" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Aucune alerte liée (Rappel direct)</SelectItem>
                                        {alertesActives.map((a: any) => (
                                            <SelectItem key={a._id} value={a._id}>{a.titre} ({a.zoneGeographique})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-600">Nom du produit <span className="text-red-500">*</span></Label>
                                <Input
                                    placeholder="Ex: Yaourt Nature 125g"
                                    value={formData.produit}
                                    onChange={(e) => setFormData({ ...formData, produit: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-600">Marque Commerciale</Label>
                                <Input
                                    placeholder="Ex: Laitière du PK15"
                                    value={formData.marque}
                                    onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-600">Numéro de Lot(s) <span className="text-red-500">*</span></Label>
                                <Input
                                    className="font-mono"
                                    placeholder="Ex: L-48992, L-48993"
                                    value={formData.lot}
                                    onChange={(e) => setFormData({ ...formData, lot: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2 md:row-span-2 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center p-4 bg-slate-50 group hover:border-blue-400 cursor-pointer transition-colors">
                                <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-blue-500 mb-2" />
                                <span className="text-sm font-medium text-slate-600">Photo(s) du produit</span>
                                <span className="text-xs text-slate-400 text-center">Déposez l'image d'emballage ici (JPEG, PNG)</span>
                            </div>
                            <div className="space-y-2 lg:col-span-1">
                                <Label className="text-slate-600">Motif du Retrait <span className="text-red-500">*</span></Label>
                                <Input
                                    placeholder="Ex: Présence de Salmonelle spp."
                                    value={formData.motif}
                                    onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t">
                            <Label className="text-slate-600">Action Recommandée au Consommateur</Label>
                            <Textarea
                                className="h-20"
                                placeholder="..."
                                value={formData.actionRecommandee}
                                onChange={(e) => setFormData({ ...formData, actionRecommandee: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-600">Points de Vente Concernés (Séparés par des virgules)</Label>
                            <Input
                                placeholder="Ex: Supermarché Mbolo (Libreville), CK2..."
                                value={formData.pointsVente}
                                onChange={(e) => setFormData({ ...formData, pointsVente: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Multidiffusion F2/F5 */}
                <Card className="shadow-sm border-blue-200 border-t-4">
                    <CardHeader className="bg-blue-50/50 pb-3">
                        <CardTitle className="text-base text-blue-900 flex items-center gap-2">
                            <Radio className="w-5 h-5" /> Canal de Multidiffusion (Interopérabilité)
                        </CardTitle>
                        <CardDescription>
                            Sélectionnez les plateformes qui recevront et afficheront cette urgence sanitaire.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className={`p-4 rounded-lg flex items-start space-x-3 border-2 transition-colors cursor-pointer ${channels.push ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`} onClick={() => setChannels({ ...channels, push: !channels.push })}>
                                <Checkbox checked={channels.push} id="canal-f6" className="mt-1" />
                                <div className="space-y-1">
                                    <Label htmlFor="canal-f6" className="font-semibold text-slate-900 cursor-pointer flex items-center gap-2">
                                        <Smartphone className="w-4 h-4 text-emerald-600" /> AGASA-Citoyen (Push F6)
                                    </Label>
                                    <p className="text-xs text-slate-500">Notifie directement les téléphones ayant l'application installée.</p>
                                </div>
                            </div>

                            <div className={`p-4 rounded-lg flex items-start space-x-3 border-2 transition-colors cursor-pointer ${channels.portail ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`} onClick={() => setChannels({ ...channels, portail: !channels.portail })}>
                                <Checkbox checked={channels.portail} id="canal-f2" className="mt-1" />
                                <div className="space-y-1">
                                    <Label htmlFor="canal-f2" className="font-semibold text-slate-900 cursor-pointer flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-blue-600" /> Portail AGASA-Pro (F2)
                                    </Label>
                                    <p className="text-xs text-slate-500">Alerte rouge affichée sur le dashboard des opérateurs économiques.</p>
                                </div>
                            </div>

                            <div className={`p-4 rounded-lg flex items-start space-x-3 border-2 transition-colors cursor-pointer ${channels.sms ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`} onClick={() => setChannels({ ...channels, sms: !channels.sms })}>
                                <Checkbox checked={channels.sms} id="canal-sms" className="mt-1" />
                                <div className="space-y-1">
                                    <Label htmlFor="canal-sms" className="font-semibold text-slate-900 cursor-pointer">SMS (Anticipation)</Label>
                                    <p className="text-xs text-slate-500">Envoi de SMS de masse via Opérateur Télécom National (Surcoût).</p>
                                </div>
                            </div>

                            <div className={`p-4 rounded-lg flex items-start space-x-3 border-2 transition-colors cursor-pointer ${channels.reseauxSociaux ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`} onClick={() => setChannels({ ...channels, reseauxSociaux: !channels.reseauxSociaux })}>
                                <Checkbox checked={channels.reseauxSociaux} id="canal-rs" className="mt-1" />
                                <div className="space-y-1">
                                    <Label htmlFor="canal-rs" className="font-semibold text-slate-900 cursor-pointer">Facebook / X.com</Label>
                                    <p className="text-xs text-slate-500">Publication automatisée sur la page officielle (API Meta).</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>Annuler</Button>
                    <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white" disabled={isSubmitting}>
                        {isSubmitting ? "Initialisation du rappel..." : (
                            <><Megaphone className="w-4 h-4 mr-2" /> Préparer l'Ordonnance de Retrait</>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
