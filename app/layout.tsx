import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AGASA-Core — Plateforme Interne",
    template: "%s | AGASA-Core",
  },
  description:
    "Plateforme interne unifiée de l'Agence Gabonaise de Sécurité Alimentaire. Gestion RH, Finance, Documents, Logistique, Laboratoire, Alertes et Pilotage décisionnel.",
  keywords: [
    "AGASA",
    "sécurité alimentaire",
    "Gabon",
    "ERP",
    "LIMS",
    "gestion interne",
  ],
  authors: [{ name: "NTSAGUI Digital" }],
  robots: "noindex, nofollow", // Application interne
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ConvexClientProvider>
          <AuthProvider>
            <TooltipProvider delayDuration={300}>
              {children}
              <Toaster position="top-right" richColors closeButton />
            </TooltipProvider>
          </AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
