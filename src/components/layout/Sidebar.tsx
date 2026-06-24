"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/hooks/useAuth";

const playerLinks = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/matches", label: "Partidos" },
];

const ownerLinks = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/complexes", label: "Mis complejos" },
  { href: "/fields", label: "Canchas" },
  { href: "/matches", label: "Partidos" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOwner } = useAuth();
  const links = isOwner ? ownerLinks : playerLinks;

  return (
    <aside className="hidden w-56 flex-col border-r border-white/10 bg-cancha-900 p-4 md:flex">
      <nav className="flex flex-col gap-1">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-cono/15 text-cono-light"
                  : "text-linea-dim hover:bg-white/5 hover:text-linea"
              )}
            >
              {link.label}
            </Link>
          );
        })}
        {isOwner && (
          <Link
            href="/complexes/create"
            className="mt-3 rounded-md border border-dashed border-white/20 px-3 py-2 text-center text-sm text-linea-dim hover:bg-white/5"
          >
            + Nuevo complejo
          </Link>
        )}
      </nav>
    </aside>
  );
}
