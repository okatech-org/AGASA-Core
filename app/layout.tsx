import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "sonner";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
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
        className={`${cormorant.variable} ${dmSans.variable} font-sans antialiased`}
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
