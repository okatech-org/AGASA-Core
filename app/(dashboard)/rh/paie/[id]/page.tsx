"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Printer, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function BulletinPaiePage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();

    // We reuse the list query and find the specific one for simplicity, 
    // ideally there's a getBulletin query in the backend.
    const bulletins = useQuery(api.rh.paie.listBulletins, user?._id ? { userId: user._id } : "skip");
    const bulletin = bulletins?.find((b: any) => b._id === params.id);

    if (bulletins === undefined) return <div className="p-8 text-center">Chargement...</div>;
    if (!bulletin) return <div className="p-8 text-center text-red-500">Bulletin introuvable ou accès refusé.</div>;

    const moisStr = new Date(0, bulletin.mois - 1).toLocaleString('fr-FR', { month: 'long' });
    const brut = bulletin.salaireBase + bulletin.primesTerrain + bulletin.indemnitesProvinciales + bulletin.autresPrimes;
    const totalRetenues = bulletin.retenueCNSS + bulletin.retenueImpot + bulletin.autresRetenues;

    const formatCFA = (montant: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(montant);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between no-print">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" /> Imprimer
                    </Button>
                    <Button className="bg-[#1B4F72] hover:bg-[#1B4F72]/90">
                        <Download className="mr-2 h-4 w-4" /> Télécharger PDF
                    </Button>
                </div>
            </div>

            {/* Fiche de paie (Format A4 simulé) */}
            <div className="bg-white text-black p-8 sm:p-12 shadow-md border rounded-sm min-h-[800px] print:shadow-none print:border-none print:p-0">
                {/* Header Détaillé */}
                <div className="flex justify-between items-start border-b-2 border-black pb-8 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-[#1B4F72] rounded-full flex items-center justify-center text-white font-bold text-xl">
                            AGASA
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Agence Gabonaise de Sécurité Alimentaire</h2>
                            <p className="text-sm text-gray-600">Ministère de l'Agriculture et de l'Alimentation</p>
                            <p className="text-xs text-gray-500 mt-1">BP 2026, Libreville - Gabon. NIF: 000123456</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h1 className="text-2xl font-bold uppercase tracking-widest text-[#1B4F72]">Bulletin de Paie</h1>
                        <p className="text-lg font-medium mt-1 uppercase">Période: {moisStr} {bulletin.annee}</p>
                        <div className="mt-2 text-sm text-gray-500">
                            Généré le: {new Date(bulletin.dateGeneration).toLocaleDateString('fr-FR')}
                        </div>
                        {bulletin.statut === "valide" && (
                            <Badge className="mt-2 bg-green-100 text-green-800 border-green-300 font-normal no-print"><ShieldCheck className="w-3 h-3 mr-1" /> Original Validé</Badge>
                        )}
                    </div>
                </div>

                {/* Info Agent */}
                <div className="grid grid-cols-2 gap-8 mb-8 border border-gray-300 p-4 rounded-sm">
                    <div>
                        <h3 className="font-bold text-sm text-gray-500 uppercase mb-2">Employeur</h3>
                        <p className="font-semibold">AGASA - Siège Central</p>
                        <p className="text-sm">Direction : {bulletin.agent?.direction}</p>
                        <p className="text-sm">Service : {bulletin.agent?.service}</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-gray-500 uppercase mb-2">Employé</h3>
                        <p className="font-bold text-lg">{bulletin.user?.nom} {bulletin.user?.prenom}</p>
                        <p className="text-sm"><span className="text-gray-500">Matricule:</span> {bulletin.user?.matricule}</p>
                        <div className="flex justify-between text-sm mt-1 w-3/4">
                            <span><span className="text-gray-500">Fonction:</span> {bulletin.agent?.poste}</span>
                            <span><span className="text-gray-500">Grade:</span> {bulletin.agent?.grade}</span>
                        </div>
                        <div className="flex justify-between text-sm w-3/4">
                            <span><span className="text-gray-500">Contrat:</span> {bulletin.agent?.contratType}</span>
                            <span><span className="text-gray-500">Échelon:</span> {bulletin.agent?.echelon}</span>
                        </div>
                    </div>
                </div>

                {/* Corps du bulletin */}
                <table className="w-full text-sm border-collapse mb-8">
                    <thead>
                        <tr className="bg-gray-100 border-y-2 border-black">
                            <th className="py-2 px-3 text-left">Désignation</th>
                            <th className="py-2 px-3 text-right">Base</th>
                            <th className="py-2 px-3 text-right">Taux</th>
                            <th className="py-2 px-3 text-right">Gains (+)</th>
                            <th className="py-2 px-3 text-right">Retenues (-)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-200">
                            <td className="py-3 px-3 font-medium">Salaire de Base</td>
                            <td className="py-3 px-3 text-right">-</td>
                            <td className="py-3 px-3 text-right">-</td>
                            <td className="py-3 px-3 text-right font-medium">{formatCFA(bulletin.salaireBase)}</td>
                            <td className="py-3 px-3 text-right"></td>
                        </tr>
                        {bulletin.primesTerrain > 0 && (
                            <tr className="border-b border-gray-200">
                                <td className="py-3 px-3">Prime de Terrain (Risque Sanitaire)</td>
                                <td className="py-3 px-3 text-right">-</td>
                                <td className="py-3 px-3 text-right">-</td>
                                <td className="py-3 px-3 text-right">{formatCFA(bulletin.primesTerrain)}</td>
                                <td className="py-3 px-3 text-right"></td>
                            </tr>
                        )}
                        {bulletin.indemnitesProvinciales > 0 && (
                            <tr className="border-b border-gray-200">
                                <td className="py-3 px-3">Indemnité de Sujétion Provinciale</td>
                                <td className="py-3 px-3 text-right">-</td>
                                <td className="py-3 px-3 text-right">-</td>
                                <td className="py-3 px-3 text-right">{formatCFA(bulletin.indemnitesProvinciales)}</td>
                                <td className="py-3 px-3 text-right"></td>
                            </tr>
                        )}
                        {bulletin.autresPrimes > 0 && (
                            <tr className="border-b border-gray-200">
                                <td className="py-3 px-3">Prime d'Ancienneté / Échelon</td>
                                <td className="py-3 px-3 text-right">-</td>
                                <td className="py-3 px-3 text-right">-</td>
                                <td className="py-3 px-3 text-right">{formatCFA(bulletin.autresPrimes)}</td>
                                <td className="py-3 px-3 text-right"></td>
                            </tr>
                        )}

                        <tr className="border-b border-black">
                            <td className="py-3 px-3 font-bold text-gray-500 col-span-5 italic">Retenues Sociales & Fiscales</td>
                            <td></td><td></td><td></td><td></td>
                        </tr>

                        <tr className="border-b border-gray-200">
                            <td className="py-3 px-3">CNSS (Caisse Nationale de Sécurité Sociale)</td>
                            <td className="py-3 px-3 text-right">{formatCFA(brut)}</td>
                            <td className="py-3 px-3 text-right">2.50%</td>
                            <td className="py-3 px-3 text-right"></td>
                            <td className="py-3 px-3 text-right text-red-600">{formatCFA(bulletin.retenueCNSS)}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                            <td className="py-3 px-3">IRPP (Impôt Fiscal sur le Revenu) - Simulé</td>
                            <td className="py-3 px-3 text-right">{formatCFA(brut)}</td>
                            <td className="py-3 px-3 text-right">15.00%</td>
                            <td className="py-3 px-3 text-right"></td>
                            <td className="py-3 px-3 text-right text-red-600">{formatCFA(bulletin.retenueImpot)}</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-100 border-t-2 border-black font-bold">
                            <td className="py-3 px-3" colSpan={3}>Totaux</td>
                            <td className="py-3 px-3 text-right text-green-700">{formatCFA(brut)}</td>
                            <td className="py-3 px-3 text-right text-red-600">{formatCFA(totalRetenues)}</td>
                        </tr>
                    </tfoot>
                </table>

                {/* Footer Net à Payer */}
                <div className="flex justify-between items-end">
                    <div className="w-1/2 text-sm text-gray-500 italic border p-3 rounded-sm">
                        <p>Pour faire valoir ce que de droit.</p>
                        <p className="mt-2 text-xs">A conserver sans limitation de durée.</p>
                        {bulletin.statut !== "valide" && (
                            <p className="text-red-500 font-bold mt-2 uppercase">Spécimen - Non validé</p>
                        )}
                    </div>

                    <div className="w-[40%]">
                        <div className="bg-[#1B4F72] text-white p-4 rounded-sm flex justify-between items-center shadow-md">
                            <span className="text-lg font-medium">NET À PAYER</span>
                            <span className="text-2xl font-bold">{formatCFA(bulletin.netAPayer)}</span>
                        </div>
                        <div className="mt-4 text-xs text-center text-gray-400">
                            Virement bancaire (compte domicilié)
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
