"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { joinMatch } from "@/lib/matches/joinMatch";
import { leaveMatch } from "@/lib/matches/leaveMatch";
import type { MatchWithDetails } from "@/types/match";

export interface UseMatchesOptions {
  /** Filtra partidos de un complejo específico (panel del owner) */
  complexId?: string;
  /** Si es true, solo trae partidos cuyo starts_at sea futuro */
  onlyUpcoming?: boolean;
}

export interface UseMatchesResult {
  matches: MatchWithDetails[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  join: (matchId: string) => Promise<{ success: boolean; error?: string; joinedWaitingList?: boolean }>;
  leave: (matchId: string) => Promise<{ success: boolean; error?: string }>;
}

/**
 * Hook de cliente que trae la lista de partidos con sus relaciones
 * (cancha, complejo, jugadores anotados y lista de espera) y queda
 * suscripto a cambios en tiempo real vía Supabase Realtime.
 */
export function useMatches(options: UseMatchesOptions = {}): UseMatchesResult {
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    setError(null);

    let query = supabase
      .from("matches")
      .select(
        `
        id, field_id, complex_id, starts_at, duration_minutes, capacity, status, created_by, created_at,
        field:fields ( id, name, surface ),
        complex:complexes ( id, name ),
        players:match_players ( id, match_id, player_id, joined_at, profile:profiles ( id, full_name, phone, role, created_at ) ),
        waiting_list ( id, match_id, player_id, requested_at, profile:profiles ( id, full_name, phone, role, created_at ) )
      `
      )
      .order("starts_at", { ascending: true });

    if (options.complexId) {
      query = query.eq("complex_id", options.complexId);
    }
    if (options.onlyUpcoming) {
      query = query.gte("starts_at", new Date().toISOString());
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
      setMatches([]);
    } else {
      setMatches((data ?? []) as unknown as MatchWithDetails[]);
    }

    setLoading(false);
  }, [options.complexId, options.onlyUpcoming]);

  useEffect(() => {
    fetchMatches();

    const supabase = createClient();
    const channel = supabase
      .channel("matches-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "match_players" }, () => {
        fetchMatches();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "waiting_list" }, () => {
        fetchMatches();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "matches" }, () => {
        fetchMatches();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMatches]);

  const join = useCallback(
    async (matchId: string) => {
      const result = await joinMatch(matchId);
      if (result.success) await fetchMatches();
      return result;
    },
    [fetchMatches]
  );

  const leave = useCallback(
    async (matchId: string) => {
      const result = await leaveMatch(matchId);
      if (result.success) await fetchMatches();
      return result;
    },
    [fetchMatches]
  );

  return { matches, loading, error, refresh: fetchMatches, join, leave };
}
