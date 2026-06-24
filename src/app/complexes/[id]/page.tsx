"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FieldCard } from "@/components/fields/FieldCard";
import { createClient } from "@/lib/supabase/client";
import { useMatches } from "@/hooks/useMatches";
import { useAuth } from "@/hooks/useAuth";
import type { Complex } from "@/types/complex";
import type { Field } from "@/types/field";

export default function ComplexDetailPage() {
  const params = useParams<{ id: string }>();
  const { userId } = useAuth();
  const [complex, setComplex] = useState<Complex | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const { matches, join, leave } = useMatches({ complexId: params.id, onlyUpcoming: true });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [{ data: complexData }, { data: fieldsData }] = await Promise.all([
        supabase.from("complexes").select("*").eq("id", params.id).single(),
        supabase.from("fields").select("*").eq("complex_id", params.id).order("name"),
      ]);
      setComplex(complexData ?? null);
      setFields(fieldsData ?? []);
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <AppShell>
        <p className="text-sm text-linea-dim">Cargando...</p>
      </AppShell>
    );
  }

  if (!complex) {
    return (
      <AppShell>
        <p className="text-sm text-linea-dim">No se encontró el complejo.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-linea">{complex.name}</h1>
        {complex.address && <p className="text-sm text-linea-dim">{complex.address}</p>}
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Canchas</CardTitle>
            <Link href="/fields/create">
              <Button size="sm">+ Cancha</Button>
            </Link>
          </CardHeader>
          {fields.length === 0 ? (
            <p className="text-sm text-linea-dim">Este complejo todavía no tiene canchas.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {fields.map((field) => (
                <FieldCard key={field.id} field={field} />
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos partidos</CardTitle>
            <Link href="/matches/create">
              <Button size="sm">+ Partido</Button>
            </Link>
          </CardHeader>
          {matches.length === 0 ? (
            <p className="text-sm text-linea-dim">No hay partidos programados en este complejo.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-white/10">
              {matches.map((match) => (
                <li key={match.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <span className="text-sm text-linea">
                    {match.field.name} ·{" "}
                    {new Date(match.starts_at).toLocaleString("es-AR", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="text-xs text-linea-dim">
                    {match.players.length}/{match.capacity}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
