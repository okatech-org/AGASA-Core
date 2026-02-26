import { initializeApp, getApps, getApp } from "firebase/app";
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence,
    sendPasswordResetEmail as firebaseSendPasswordResetEmail,
} from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if we are using the dummy config (for dev/demo mode)
const isDummyConfig = firebaseConfig.apiKey === "dummy-api-key-for-dev-only-not-for-prod";

let app: any;
let auth: any;
let customSignIn: typeof signInWithEmailAndPassword;
let customSignOut: typeof signOut;
let customOnAuthStateChanged: typeof onAuthStateChanged;
let customSendPasswordResetEmail: (auth: any, email: string) => Promise<void>;

if (isDummyConfig) {
    console.log("⚠️ USING MOCK FIREBASE AUTH FOR DEVELOPMENT ⚠️");
    app = {} as any;
    auth = {} as any;

    // Simple state machine for mock auth
    let currentUser: any = null;

    // Try to load mock session from localStorage
    if (typeof window !== "undefined") {
        try {
            const stored = localStorage.getItem("mock_firebase_user");
            if (stored) currentUser = JSON.parse(stored);
        } catch (e) { }
    }

    const listeners: Array<(user: any) => void> = [];
    const notifyListeners = () => listeners.forEach((l) => l(currentUser));

    customSignIn = async (authObj: any, email: string, password: string) => {
        return new Promise((resolve) => {
            // Simulate network delay
            setTimeout(() => {
                currentUser = {
                    uid: "mock-uid-" + email.replace(/[^a-zA-Z0-9]/g, ""),
                    email: email,
                    displayName: email.split("@")[0]
                };
                if (typeof window !== "undefined") {
                    localStorage.setItem("mock_firebase_user", JSON.stringify(currentUser));
                }
                notifyListeners();
                resolve({ user: currentUser } as any);
            }, 600);
        });
    };

    customSendPasswordResetEmail = async (_authObj: any, email: string) => {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                console.log(`📧 [MOCK] Lien de réinitialisation envoyé à ${email}`);
                resolve();
            }, 800);
        });
    };

    customSignOut = async (authObj: any) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                currentUser = null;
                if (typeof window !== "undefined") {
                    localStorage.removeItem("mock_firebase_user");
                }
                notifyListeners();
                resolve();
            }, 300);
        });
    };

    customOnAuthStateChanged = (authObj: any, callback: any) => {
        listeners.push(callback);
        // Fire immediately with current state
        setTimeout(() => callback(currentUser), 0);
        return () => {
            const idx = listeners.indexOf(callback);
            if (idx > -1) listeners.splice(idx, 1);
        };
    };
} else {
    // Initialize Real Firebase
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);

    // Use local persistence by default
    setPersistence(auth, browserLocalPersistence).catch((error) => {
        console.error("Error setting Firebase Auth persistence:", error);
    });

    customSignIn = signInWithEmailAndPassword;
    customSignOut = signOut;
    customOnAuthStateChanged = onAuthStateChanged;
    customSendPasswordResetEmail = (authObj: any, email: string) => firebaseSendPasswordResetEmail(authObj, email);
}

export {
    app,
    auth,
    customSignIn as signInWithEmailAndPassword,
    customSignOut as signOut,
    customOnAuthStateChanged as onAuthStateChanged,
    customSendPasswordResetEmail as sendPasswordResetEmail,
};
