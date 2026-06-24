import { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";

/**
 * Shell reutilizable para las páginas privadas (dashboard, complexes,
 * fields, matches). Se importa explícitamente en cada page.tsx en
 * lugar de usar un layout de grupo, para respetar la estructura de
 * carpetas pedida (sin (app)/layout.tsx adicional).
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
