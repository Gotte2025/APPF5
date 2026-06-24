"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { MatchPlayersGrid } from "@/components/matches/MatchPlayers";
import { JoinButton } from "@/components/matches/JoinButton";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { joinMatch } from "@/lib/matches/joinMatch";
import { leaveMatch } from "@/lib/matches/leaveMatch";
import type { MatchWithDetails } from "@/types/match";

export default function MatchDetailPage() {
  const params = useParams<{ id: string }>();
  const { userId } = useAuth();
  const [match, setMatch] = useState<MatchWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("matches")
      .select(
        `id, field_id, complex_id, starts_at, duration_minutes, capacity, status, created_by, created_at,
         field:fields ( id, name, surface ), complex:complexes ( id, name ),
         players:match_players ( id, match_id, player_id, joined_at, profile:profiles ( id, full_name, phone, role, created_at ) ),
         waiting_list ( id, match_id, player_id, requested_at, profile:profiles ( id, full_name, phone, role, created_at ) )`
      )
      .eq("id", params.id)
      .single();

    setMatch((data ?? null) as unknown as MatchWithDetails | null);
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    load();

    const supabase = createClient();
    const channel = supabase
      .channel(`match-${params.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "match_players", filter: `match_id=eq.${params.id}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "waiting_list", filter: `match_id=eq.${params.id}` }, load)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.id, load]);

  if (loading) {
    return (
      <AppShell>
        <p className="text-sm text-linea-dim">Cargando...</p>
      </AppShell>
    );
  }

  if (!match) {
    return (
      <AppShell>
        <p className="text-sm text-linea-dim">No se encontró el partido.</p>
      </AppShell>
    );
  }

  const isFull = match.status === "full" || match.players.length >= match.capacity;
  const alreadyJoined = !!userId && match.players.some((p) => p.player_id === userId);
  const date = new Date(match.starts_at);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-linea">
          {match.field.name} · {match.complex.name}
        </h1>
        <p className="text-sm text-linea-dim">
          {date.toLocaleString("es-AR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          · {match.duration_minutes} min
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <Card className="flex-1">
          <MatchPlayersGrid players={match.players} capacity={match.capacity} currentUserId={userId} />
          <div className="mt-4">
            <JoinButton
              alreadyJoined={alreadyJoined}
              isFull={isFull}
              onJoin={() => joinMatch(match.id)}
              onLeave={() => leaveMatch(match.id)}
            />
          </div>
        </Card>

        <Card className="w-full lg:w-72">
          <h3 className="mb-3 text-sm font-semibold text-linea">Lista de espera</h3>
          {match.waiting_list.length === 0 ? (
            <p className="text-xs text-linea-dim">No hay nadie en espera.</p>
          ) : (
            <ol className="flex flex-col gap-2">
              {match.waiting_list.map((entry, i) => (
                <li key={entry.id} className="flex items-center gap-2 text-sm text-linea-dim">
                  <span className="text-cono-light">{i + 1}.</span>
                  {entry.profile?.full_name ?? "Jugador"}
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
