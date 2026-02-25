"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function NotificationBell() {
    const { user } = useAuth();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    // Skip query if not authenticated
    const unreadCount = useQuery(api.notifications.queries.getUnreadCount, user ? { userId: user._id } : "skip");
    const notifications = useQuery(api.notifications.queries.getMyNotifications, user ? { userId: user._id } : "skip");
    const markAsRead = useMutation(api.notifications.mutations.markAsRead);
    const markAllAsRead = useMutation(api.notifications.mutations.markAllAsRead);

    if (!user) return null;

    const handleRead = async (e: React.MouseEvent, notifId: any) => {
        e.stopPropagation();
        await markAsRead({ notifId });
    };

    const handleReadAll = async () => {
        await markAllAsRead({ userId: user._id });
    };

    const handleNotifClick = async (notif: any) => {
        if (!notif.lue) {
            await markAsRead({ notifId: notif._id });
        }
        setOpen(false);
        if (notif.lien) {
            router.push(notif.lien);
        }
    };

    // Icône dynamique selon le type
    const getIconColor = (type: string) => {
        switch (type) {
            case "alerte": return "bg-rose-100 text-rose-600 border-rose-200";
            case "action": return "bg-indigo-100 text-indigo-600 border-indigo-200";
            case "info": return "bg-sky-100 text-sky-600 border-sky-200";
            case "rappel": return "bg-amber-100 text-amber-600 border-amber-200";
            default: return "bg-slate-100 text-slate-600 border-slate-200";
        }
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 rounded-full transition-colors">
                    <Bell className="h-[1.2rem] w-[1.2rem] text-slate-600" />
                    {typeof unreadCount === "number" && unreadCount > 0 && (
                        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-in zoom-in">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-80 sm:w-96 p-0" align="end" forceMount>
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-900">Notifications</h4>
                        {typeof unreadCount === "number" && unreadCount > 0 && (
                            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 font-bold">
                                {unreadCount} nvx
                            </Badge>
                        )}
                    </div>
                    {typeof unreadCount === "number" && unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="h-8 text-xs text-indigo-600 font-medium px-2 hover:text-indigo-700 hover:bg-indigo-50" onClick={handleReadAll}>
                            <Check className="w-3 h-3 mr-1" />
                            Tout lire
                        </Button>
                    )}
                </div>

                <div className="h-[350px] overflow-y-auto w-full">
                    {(!notifications || notifications.length === 0) ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400 p-6 text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                                <Bell className="w-5 h-5 opacity-50 text-slate-400" />
                            </div>
                            <p className="text-sm">Vous êtes à jour ! Aucune notification détectée.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.slice(0, 8).map((notif: any) => (
                                <div
                                    key={notif._id}
                                    onClick={() => handleNotifClick(notif)}
                                    className={`flex items-start gap-4 p-4 border-b border-slate-50 cursor-pointer transition-colors ${notif.lue ? 'bg-white opacity-70 hover:opacity-100' : 'bg-slate-50/80 hover:bg-slate-100'}`}
                                >
                                    <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${notif.lue ? 'bg-transparent' : 'bg-indigo-500 shadow-sm'}`} />

                                    <div className="flex-1 min-w-0 space-y-1">
                                        <p className={`text-sm tracking-tight ${notif.lue ? 'text-slate-700 font-medium' : 'text-slate-900 font-bold'}`}>
                                            {notif.titre}
                                        </p>
                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                            {notif.message}
                                        </p>
                                        <p className="text-[10px] text-slate-400 uppercase font-medium mt-2 tracking-wider">
                                            {formatDistanceToNow(new Date(notif.dateCreation), { addSuffix: true, locale: fr })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-2 border-t border-slate-100 bg-slate-50">
                    <Link href="/notifications">
                        <Button variant="outline" className="w-full text-sm font-medium border-slate-200">
                            Voir tout l'historique
                        </Button>
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
