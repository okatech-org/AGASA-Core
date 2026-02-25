"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Search, Menu } from "lucide-react";
import { NotificationBell } from "./NotificationBell";

export function Header() {
    const { user, role, logout } = useAuth();

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
    };

    return (
        <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-white px-4 shadow-sm sm:px-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Sidebar</span>
                </Button>
                <div className="hidden lg:flex lg:items-center lg:gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-agasa-primary text-xs font-bold text-white">
                        A
                    </div>
                    <span className="text-lg font-bold text-agasa-primary tracking-tight">
                        AGASA-Core
                    </span>
                </div>
            </div>

            <div className="flex flex-1 items-center justify-end gap-4 lg:justify-between lg:pl-8">
                <div className="hidden max-w-md flex-1 lg:flex">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Rechercher un agent, document, échantillon..."
                            className="w-full bg-muted/50 pl-9 focus-visible:bg-white"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <NotificationBell />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                <Avatar className="h-9 w-9 border border-border">
                                    <AvatarImage src={user?.avatar} alt={user?.nom} />
                                    <AvatarFallback className="bg-agasa-primary/10 text-agasa-primary">
                                        {user ? getInitials(user.prenom, user.nom) : "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {user ? `${user.prenom} ${user.nom}` : "Utilisateur"}
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground mt-1">
                                        {role ? role.replace("_", " ") : "Chargement..."}
                                    </p>
                                    {user?.direction && (
                                        <p className="text-xs leading-none text-muted-foreground mt-1">
                                            {user.direction} - {user.province}
                                        </p>
                                    )}
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Mon Profil</DropdownMenuItem>
                            <DropdownMenuItem>Paramètres</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={logout} className="text-agasa-danger cursor-pointer">
                                Déconnexion
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
