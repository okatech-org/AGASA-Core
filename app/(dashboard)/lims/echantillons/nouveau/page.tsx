"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Beaker, MapPin, Truck, ShieldAlert, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function LimsNouvelEchantillonPage() {
    const { user } = useAuth();
    const router = useRouter();
    const enregistrer = useMutation(api.lims.echantillons.enregistrerEchantillon as any);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [origine, setOrigine] = useState("inspection");
    const [refSource, setRefSource] = useState("");
    const [matrice, setMatrice] = useState("viande");
    const [description, setDescription] = useState("");
    const [quantite, setQuantite] = useState("");
    const [unite, setUnite] = useState("g");
    const [datePrelevement, setDatePrelevement] = useState(new Date().toISOString().slice(0, 16));
    const [lieuPrelevement, setLieuPrelevement] = useState("");
    const [prelevePar, setPrelevePar] = useState("");

    // Transport & Intégrité
    const [temperature, setTemperature] = useState("");
    const [dureeTransport, setDureeTransport] = useState("");
    const [transportConforme, setTransportConforme] = useState(true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);

        try {
            const eId = await enregistrer({
                userId: user._id as any,
                origine: origine as any,
                referenceSource: refSource || undefined,
                matrice,
                description,
                quantite: parseFloat(quantite),
                unite,
                datePrelevement: new Date(datePrelevement).getTime(),
                lieuPrelevement,
                prelevePar: prelevePar || undefined,
                temperature: temperature ? parseFloat(temperature) : undefined,
                dureeTransport: dureeTransport ? parseInt(dureeTransport) : undefined,
                transportConforme
            });

            toast.success("Échantillon enregistré avec succès au LAA ! Code-barres LIMS généré.");
            router.push(`/lims/echantillons/${eId}`);
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de l'enregistrement");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-slate-100 hover:bg-slate-200">
                    <ArrowLeft className="w-5 h-5 text-slate-700" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 border-l-4 border-purple-600 pl-3">Enregistrement LIMS</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Saisie d'un nouveau prélèvement et conformité de chaîne du froid.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="space-y-6">

                    {/* Identification & Origine */}
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50/50 border-b pb-4">
                            <CardTitle className="text-lg flex items-center gap-2"><Beaker className="w-5 h-5 text-purple-600" /> Informations de l'Échantillon</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Origine du Prélèvement <span className="text-red-500">*</span></Label>
                                <Select value={origine} onValueChange={setOrigine}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez l'origine" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="inspection">Inspection Terrain (AGASA-Inspect)</SelectItem>
                                        <SelectItem value="operateur">Commande Opérateur (AGASA-Pro)</SelectItem>
                                        <SelectItem value="interne">Demande Interne / Recherche</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Référence Source (Numéro de Dossier / Mission)</Label>
                                <Input value={refSource} onChange={e => setRefSource(e.target.value)} placeholder="Ex: INSP-2026-00421" />
                            </div>

                            <div className="space-y-2">
                                <Label>Matrice (Catégorie) <span className="text-red-500">*</span></Label>
                                <Select value={matrice} onValueChange={setMatrice}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Type de matrice" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="viande">Viandes & Produits Carnés</SelectItem>
                                        <SelectItem value="poisson">Produits Halieutiques</SelectItem>
                                        <SelectItem value="fruit_legume">Fruits & Légumes</SelectItem>
                                        <SelectItem value="produit_laitier">Produits Laitiers</SelectItem>
                                        <SelectItem value="cereale">Céréales & Dérivés</SelectItem>
                                        <SelectItem value="eau">Eaux & Boissons</SelectItem>
                                        <SelectItem value="sol">Sols & Engrais</SelectItem>
                                        <SelectItem value="autre">Autre</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Quantité Reçue <span className="text-red-500">*</span></Label>
                                    <Input type="number" step="0.01" value={quantite} onChange={e => setQuantite(e.target.value)} required placeholder="Ex: 500" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Unité de Mesure <span className="text-red-500">*</span></Label>
                                    <Select value={unite} onValueChange={setUnite}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="g">Grammes (g)</SelectItem>
                                            <SelectItem value="kg">Kilogrammes (kg)</SelectItem>
                                            <SelectItem value="ml">Millilitres (ml)</SelectItem>
                                            <SelectItem value="l">Litres (L)</SelectItem>
                                            <SelectItem value="piece">Unité(s)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label>Description de l'échantillon <span className="text-red-500">*</span></Label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} required placeholder="État apparent, marque, lot, conditionnement particulier..." className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none" rows={3} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Traçabilité du Prélèvement */}
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50/50 border-b pb-4">
                            <CardTitle className="text-lg flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-600" /> Traçabilité Spatio-Temporelle</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Date et heure du prélèvement <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input type="datetime-local" className="pl-9" value={datePrelevement} onChange={e => setDatePrelevement(e.target.value)} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Prélevé par (Nom de l'agent ou Opérateur)</Label>
                                <Input value={prelevePar} onChange={e => setPrelevePar(e.target.value)} placeholder="Ex: Insp. Moussavou" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Lieu exact du prélèvement <span className="text-red-500">*</span></Label>
                                <Input value={lieuPrelevement} onChange={e => setLieuPrelevement(e.target.value)} required placeholder="Ex: Marché de Mont-Bouët, Libreville - Stand 42" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Intégrité & Transport */}
                    <Card className="shadow-sm border-slate-200 border-l-4 border-l-orange-500">
                        <CardHeader className="bg-orange-50/30 border-b pb-4">
                            <CardTitle className="text-lg flex items-center gap-2 text-orange-800"><Truck className="w-5 h-5" /> Vérification d'Intégrité au LAA</CardTitle>
                            <CardDescription className="text-orange-700/80">Critères critiques conditionnant la validité des futures analyses.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <Label>Température à réception (°C)</Label>
                                    <Input type="number" step="0.1" value={temperature} onChange={e => setTemperature(e.target.value)} placeholder="Ex: 4.5" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Durée estimée du transit (Heures)</Label>
                                    <Input type="number" value={dureeTransport} onChange={e => setDureeTransport(e.target.value)} placeholder="Ex: 2" />
                                </div>
                            </div>

                            <div className="flex items-start space-x-3 p-4 rounded-md border border-slate-200 bg-slate-50">
                                <Checkbox id="conformite" checked={transportConforme} onCheckedChange={(checked) => setTransportConforme(checked as boolean)} className="mt-1" />
                                <div className="grid gap-1.5 leading-none">
                                    <label htmlFor="conformite" className="text-sm font-medium cursor-pointer text-slate-900 flex items-center gap-2">
                                        Conditions de transport certifiées conformes <ShieldAlert className={`w-4 h-4 ${transportConforme ? 'text-emerald-500' : 'text-red-500'}`} />
                                    </label>
                                    <p className="text-xs text-muted-foreground">
                                        En décochant, l'échantillon sera documenté comme non conforme dès la réception.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50 border-t p-6 flex justify-end">
                            <Button type="button" variant="outline" className="mr-3" onClick={() => router.back()} disabled={isSubmitting}>Annuler</Button>
                            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={isSubmitting}>
                                <Save className="w-4 h-4 mr-2" />
                                {isSubmitting ? "Création du dossier..." : "Générer ECH-LIMS"}
                            </Button>
                        </CardFooter>
                    </Card>

                </div>
            </form>
        </div>
    );
}
