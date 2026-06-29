"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const { profile, email, signOut, loading } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/10 bg-cancha-900 px-6">
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="font-display text-lg tracking-wide text-linea">APPF5</span>
      </Link>

      <div className="flex items-center gap-4">
        {!loading && profile && (
          <div className="text-right">
            <p className="text-sm font-medium text-linea">{profile.full_name}</p>
            <p className="text-xs text-linea-dim">{email}</p>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          Salir
        </Button>
      </div>
    </header>
  );
}
