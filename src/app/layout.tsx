import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";

const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Turnos F5 · Organizá tus partidos de fútbol 5",
  description: "Gestioná complejos, canchas y turnos de fútbol 5. Anotate a un partido en segundos.",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${anton.variable} ${inter.variable}`}>
      <body className="font-sans text-linea antialiased">{children}</body>
    </html>
  );
}
