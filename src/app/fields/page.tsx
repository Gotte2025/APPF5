"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FieldCard } from "@/components/fields/FieldCard";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { FieldWithComplex } from "@/types/field";

export default function FieldsPage() {
  const { userId, loading: authLoading } = useAuth();
  const [fields, setFields] = useState<FieldWithComplex[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !userId) return;

    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("fields")
        .select("*, complex:complexes!inner ( id, name, owner_id )")
        .eq("complex.owner_id", userId)
        .order("name");

      setFields((data ?? []) as unknown as FieldWithComplex[]);
      setLoading(false);
    }

    load();
  }, [userId, authLoading]);

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-linea">Canchas</h1>
          <p className="text-sm text-linea-dim">Todas las canchas de tus complejos.</p>
        </div>
        <Link href="/fields/create">
          <Button>+ Nueva cancha</Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-linea-dim">Cargando...</p>
      ) : fields.length === 0 ? (
        <Card>
          <p className="text-sm text-linea-dim">Todavía no creaste ninguna cancha.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => (
            <FieldCard key={field.id} field={field} complexName={field.complex.name} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
