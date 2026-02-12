import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const viewport: Viewport = {
  themeColor: "#1a1a1a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Torneo Calcio Balilla",
    template: "%s | Torneo Calcio Balilla",
  },
  description: "Dashboard per il torneo di calcio balilla — classifiche, calendario e tabellone in tempo reale.",
  openGraph: {
    title: "Torneo Calcio Balilla",
    description: "Segui il torneo di calcio balilla: classifiche, calendario e tabellone in tempo reale.",
    type: "website",
    locale: "it_IT",
  },
  twitter: {
    card: "summary_large_image",
    title: "Torneo Calcio Balilla",
    description: "Segui il torneo di calcio balilla: classifiche, calendario e tabellone in tempo reale.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        {children}
        <Navbar />
      </body>
    </html>
  );
}
