import { createClient } from "@/lib/supabase/client";

export interface JoinMatchResult {
  success: boolean;
  error?: string;
  /** true si el partido ya estaba lleno y el jugador quedó en lista de espera */
  joinedWaitingList?: boolean;
}

/**
 * Suma al usuario actual como jugador confirmado del partido.
 * Si ya está completo, lo agrega a la lista de espera en su lugar.
 */
export async function joinMatch(matchId: string): Promise<JoinMatchResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Necesitás iniciar sesión para anotarte." };
  }

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("id, capacity, status")
    .eq("id", matchId)
    .single();

  if (matchError || !match) {
    return { success: false, error: "No se encontró el partido." };
  }

  const { count, error: countError } = await supabase
    .from("match_players")
    .select("id", { count: "exact", head: true })
    .eq("match_id", matchId);

  if (countError) {
    return { success: false, error: countError.message };
  }

  const cupoLleno = (count ?? 0) >= match.capacity;

  if (cupoLleno) {
    const { error: waitError } = await supabase
      .from("waiting_list")
      .insert({ match_id: matchId, player_id: user.id });

    if (waitError) {
      if (waitError.message.includes("duplicate")) {
        return { success: false, error: "Ya estás en la lista de espera de este partido." };
      }
      return { success: false, error: waitError.message };
    }

    return { success: true, joinedWaitingList: true };
  }

  const { error: joinError } = await supabase
    .from("match_players")
    .insert({ match_id: matchId, player_id: user.id });

  if (joinError) {
    if (joinError.message.includes("duplicate")) {
      return { success: false, error: "Ya estás anotado en este partido." };
    }
    return { success: false, error: joinError.message };
  }

  return { success: true, joinedWaitingList: false };
}
