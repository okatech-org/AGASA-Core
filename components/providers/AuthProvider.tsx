"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, onAuthStateChanged, signOut } from "@/lib/firebase";
import { User as FirebaseUser } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type AuthContextType = {
    user: any | null; // Convex user object
    firebaseUser: FirebaseUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    role: string | null;
    permissions: string[];
    simulatedRole: string | null;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    firebaseUser: null,
    isLoading: true,
    isAuthenticated: false,
    role: null,
    permissions: [],
    simulatedRole: null,
    logout: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Call convex to get the user based on Firebase UID
    // Skip if no firebaseUser to prevent unnecessary queries
    const convexUser = useQuery(
        api.auth.getUser,
        firebaseUser ? { firebaseUid: firebaseUser.uid } : "skip"
    );

    const syncUserApi = useMutation(api.auth.syncUser);
    const logLoginApi = useMutation(api.auth.logLogin);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setFirebaseUser(user);

            if (user) {
                // We sync the user to Convex database.
                // The demo logic will handle sync directly on login, 
                // but for normal accounts it ensures they exist.
                try {
                    const syncedUser = await syncUserApi({
                        firebaseUid: user.uid,
                        email: user.email || "",
                        nom: user.displayName?.split(" ")[1] || "Utilisateur",
                        prenom: user.displayName?.split(" ")[0] || "Agent",
                    });

                    // Log login if it's a fresh session (could use sessionStorage to track if already logged for this session)
                    if (syncedUser && !sessionStorage.getItem("hasLoggedLogin")) {
                        await logLoginApi({
                            userId: syncedUser._id,
                            ipAddress: "Client Browser", // Would use CF headers in prod API
                            userAgent: window.navigator.userAgent,
                        });
                        sessionStorage.setItem("hasLoggedLogin", "true");
                    }
                } catch (error) {
                    console.error("Failed to sync user to Convex", error);
                }
            } else {
                sessionStorage.removeItem("hasLoggedLogin");
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [syncUserApi, logLoginApi]);

    // Route protection logic
    useEffect(() => {
        if (!isLoading) {
            const isPublicPath = ["/", "/connexion", "/mot-de-passe-oublie", "/demo", "/a-propos"].includes(pathname);
            const isDashboardPath = pathname.startsWith("/tableau-de-bord") ||
                pathname.startsWith("/rh") ||
                pathname.startsWith("/finance") ||
                pathname.startsWith("/ged") ||
                pathname.startsWith("/logistique") ||
                pathname.startsWith("/lims") ||
                pathname.startsWith("/alertes") ||
                pathname.startsWith("/bi") ||
                pathname.startsWith("/admin") ||
                pathname.startsWith("/audit") ||
                pathname.startsWith("/notifications");

            if (firebaseUser && pathname === "/connexion") {
                router.replace("/tableau-de-bord");
            } else if (!firebaseUser && isDashboardPath) {
                router.replace("/connexion");
            }
        }
    }, [firebaseUser, isLoading, pathname, router]);

    const logout = async () => {
        await signOut(auth);
        router.replace("/connexion");
    };

    const actualRole = convexUser?.role || null;
    const simulatedRole = convexUser?.demoSimulatedRole || null;
    const activeRole = simulatedRole || actualRole; // Use simulated role if in demo mode

    return (
        <AuthContext.Provider
            value={{
                user: convexUser || null,
                firebaseUser,
                isLoading: isLoading || (firebaseUser !== null && convexUser === undefined),
                isAuthenticated: !!firebaseUser && !!convexUser,
                role: activeRole,
                permissions: convexUser?.permissions || [],
                simulatedRole,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
