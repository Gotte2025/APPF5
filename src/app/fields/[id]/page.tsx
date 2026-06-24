"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import type { FieldWithComplex } from "@/types/field";
import type { MatchWithDetails } from "@/types/match";

export default function FieldDetailPage() {
  const params = useParams<{ id: string }>();
  const [field, setField] = useState<FieldWithComplex | null>(null);
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [{ data: fieldData }, { data: matchesData }] = await Promise.all([
        supabase.from("fields").select("*, complex:complexes ( id, name )").eq("id", params.id).single(),
        supabase
          .from("matches")
          .select(
            `id, field_id, complex_id, starts_at, duration_minutes, capacity, status, created_by, created_at,
             field:fields ( id, name, surface ), complex:complexes ( id, name ),
             players:match_players ( id, match_id, player_id, joined_at ),
             waiting_list ( id, match_id, player_id, requested_at )`
          )
          .eq("field_id", params.id)
          .gte("starts_at", new Date().toISOString())
          .order("starts_at"),
      ]);

      setField((fieldData ?? null) as unknown as FieldWithComplex | null);
      setMatches((matchesData ?? []) as unknown as MatchWithDetails[]);
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

  if (!field) {
    return (
      <AppShell>
        <p className="text-sm text-linea-dim">No se encontró la cancha.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-linea">{field.name}</h1>
        <p className="text-sm text-linea-dim">
          {field.complex.name} · Cupo {field.capacity} · {field.surface}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximos partidos en esta cancha</CardTitle>
          <Link href="/matches/create">
            <Button size="sm">+ Partido</Button>
          </Link>
        </CardHeader>
        {matches.length === 0 ? (
          <p className="text-sm text-linea-dim">No hay partidos programados.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-white/10">
            {matches.map((match) => (
              <li key={match.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <Link href={`/matches/${match.id}`} className="text-sm text-linea hover:underline">
                  {new Date(match.starts_at).toLocaleString("es-AR", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Link>
                <span className="text-xs text-linea-dim">
                  {match.players.length}/{match.capacity}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </AppShell>
  );
}
