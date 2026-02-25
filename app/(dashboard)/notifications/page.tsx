"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import {
    Bell, Check, Trash2, Calendar, FileText, AlertTriangle,
    FlaskConical, Car, Banknote, ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NotificationsPage() {
    const { user } = useAuth();
    const router = useRouter();

    const notifications = useQuery(api.notifications.queries.getMyNotifications, user ? { userId: user._id } : "skip");
    const markAsRead = useMutation(api.notifications.mutations.markAsRead);
    const markAllAsRead = useMutation(api.notifications.mutations.markAllAsRead);
    const deleteNotification = useMutation(api.notifications.mutations.deleteNotification);

    if (!user) return <div className="p-8 text-center animate-pulse">Chargement Profil...</div>;
    if (notifications === undefined) return <div className="p-8 text-center animate-pulse">Synchronisation Hub...</div>;

    const nonLues = notifications.filter(n => !n.lue).length;

    const handleReadAll = async () => {
        try {
            await markAllAsRead({ userId: user._id });
            toast.success("Toutes les notifications ont été marquées comme lues.");
        } catch (error) {
            toast.error("Erreur de synchronisation réseau.");
        }
    };

    const handleNotifClick = async (notif: any) => {
        if (!notif.lue) {
            await markAsRead({ notifId: notif._id });
        }
        if (notif.lien) {
            router.push(notif.lien);
        }
    };

    const handleDelete = async (e: React.MouseEvent, notif: any) => {
        e.stopPropagation();
        try {
            await deleteNotification({ notifId: notif._id });
            toast.success("Notification supprimée de l'historique.");
        } catch (e) {
            toast.error("Échec de suppression.");
        }
    };

    // Hériter l'icône selon la description empirique
    const getIconModule = (titre: string) => {
        const t = titre.toLowerCase();
        if (t.includes('congé') || t.includes('paie') || t.includes('rh')) return <Calendar className="w-5 h-5 text-emerald-600" />;
        if (t.includes('budget') || t.includes('redevance') || t.includes('finance')) return <Banknote className="w-5 h-5 text-emerald-600" />;
        if (t.includes('contrôle') || t.includes('alerte') || t.includes('citoyen')) return <AlertTriangle className="w-5 h-5 text-rose-600" />;
        if (t.includes('labo') || t.includes('échantillon')) return <FlaskConical className="w-5 h-5 text-indigo-600" />;
        if (t.includes('véhicule') || t.includes('stock')) return <Car className="w-5 h-5 text-sky-600" />;
        if (t.includes('courrier') || t.includes('workflow')) return <FileText className="w-5 h-5 text-amber-600" />;

        return <Bell className="w-5 h-5 text-slate-500" />;
    };

    const NotifRow = ({ notif }: { notif: any }) => (
        <div
            className={`group flex items-start sm:items-center gap-4 p-4 sm:p-5 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${notif.lue ? 'bg-white border-slate-200 hover:border-indigo-300' : 'bg-indigo-50/40 border-indigo-100'}`}
            onClick={() => handleNotifClick(notif)}
        >
            {/* Icon Module */}
            <div className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl ${notif.lue ? 'bg-slate-100' : 'bg-white shadow-sm ring-1 ring-indigo-100'}`}>
                {getIconModule(notif.titre)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        {!notif.lue && <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0 shadow-sm" />}
                        <h4 className={`text-base tracking-tight truncate pr-4 ${notif.lue ? 'font-medium text-slate-700' : 'font-bold text-slate-900'}`}>{notif.titre}</h4>
                    </div>
                    <p className={`text-sm md:text-base line-clamp-2 ${notif.lue ? 'text-slate-500' : 'text-slate-700'}`}>
                        {notif.message}
                    </p>
                </div>

                {/* Metabox droite */}
                <div className="shrink-0 flex items-center justify-between sm:flex-col sm:items-end gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                        {format(new Date(notif.dateCreation), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                    </span>
                    <div className="flex items-center gap-2">
                        {notif.type === 'alerte' && <Badge variant="destructive" className="font-bold border-rose-200">Urgence</Badge>}
                        {notif.type === 'action' && <Badge variant="default" className="bg-indigo-600 border-indigo-500">Action Requise</Badge>}

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => handleDelete(e, notif)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header View */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-900 rounded-xl text-white shadow-sm ring-1 ring-slate-800/10">
                        <Bell className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Centre de Notifications</h1>
                        <p className="text-muted-foreground mt-1 text-base">Historique des alertes métier et des flux inter-applicatifs.</p>
                    </div>
                </div>

                {nonLues > 0 && (
                    <Button onClick={handleReadAll} variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium whitespace-nowrap">
                        <Check className="w-4 h-4 mr-2" />
                        Tout marquer comme lu ({nonLues})
                    </Button>
                )}
            </div>

            {notifications.length === 0 ? (
                <Card className="border-dashed border-2 bg-slate-50/50 shadow-none">
                    <CardContent className="flex flex-col justify-center items-center py-24 text-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border shadow-sm mb-6 relative">
                            <ShieldAlert className="w-10 h-10 text-slate-400" />
                            <Check className="absolute -bottom-1 -right-1 w-6 h-6 text-emerald-500 bg-white rounded-full p-0.5" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Parfait ! Vous êtes à jour.</h3>
                        <p className="text-slate-500 max-w-md">
                            Aucun événement récent ou action métier requise n'a été détecté par le Hub Central AGASA-Core.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="mb-4 bg-transparent border-b rounded-none w-full justify-start h-12 p-0 space-x-6">
                        <TabsTrigger value="all" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none h-12 text-base px-0 font-semibold text-slate-500">
                            Toutes les notifications
                        </TabsTrigger>
                        <TabsTrigger value="unread" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-rose-500 rounded-none h-12 text-base px-0 font-semibold text-slate-500">
                            Non-lues
                            {nonLues > 0 && <span className="ml-2 bg-rose-100 text-rose-700 py-0.5 px-2 rounded-full text-xs">{nonLues}</span>}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-6 space-y-3">
                        {notifications.map((notif: any) => <NotifRow key={notif._id} notif={notif} />)}
                    </TabsContent>

                    <TabsContent value="unread" className="mt-6 space-y-3">
                        {nonLues === 0 ? (
                            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed">
                                Super ! Aucune notification en attente de lecture.
                            </div>
                        ) : (
                            notifications.filter((n: any) => !n.lue).map((notif: any) => <NotifRow key={notif._id} notif={notif} />)
                        )}
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
