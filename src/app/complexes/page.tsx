"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Complex } from "@/types/complex";

export default function ComplexesPage() {
  const { userId, isOwner, loading: authLoading } = useAuth();
  const [complexes, setComplexes] = useState<Complex[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !userId) return;

    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("complexes")
        .select("*")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false });

      setComplexes(data ?? []);
      setLoading(false);
    }

    load();
  }, [userId, authLoading]);

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-linea">Mis complejos</h1>
          <p className="text-sm text-linea-dim">Administrá tus complejos deportivos.</p>
        </div>
        <Link href="/complexes/create">
          <Button>+ Nuevo complejo</Button>
        </Link>
      </div>

      {!isOwner && !authLoading && (
        <p className="text-sm text-linea-dim">Solo las cuentas de organizador pueden tener complejos.</p>
      )}

      {loading ? (
        <p className="text-sm text-linea-dim">Cargando...</p>
      ) : complexes.length === 0 ? (
        <Card>
          <p className="text-sm text-linea-dim">Todavía no creaste ningún complejo.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {complexes.map((complex) => (
            <Link key={complex.id} href={`/complexes/${complex.id}`}>
              <Card className="transition-colors hover:border-cono/40">
                <p className="text-sm font-semibold text-linea">{complex.name}</p>
                {complex.address && <p className="text-xs text-linea-dim">{complex.address}</p>}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
