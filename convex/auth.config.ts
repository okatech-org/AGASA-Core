export default {
    providers: [
        {
            domain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
                ? `https://${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}`
                : "https://your-firebase-project.firebaseapp.com",
            applicationID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "your-firebase-project",
        },
    ],
};
