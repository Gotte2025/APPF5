import { createClient } from "@/lib/supabase/client";

export interface WaitingListResult {
  success: boolean;
  error?: string;
}

/**
 * Saca al usuario actual de la lista de espera de un partido,
 * por si decide desistir antes de que se libere un lugar.
 */
export async function leaveWaitingList(matchId: string): Promise<WaitingListResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Necesitás iniciar sesión." };
  }

  const { error } = await supabase
    .from("waiting_list")
    .delete()
    .eq("match_id", matchId)
    .eq("player_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Devuelve la posición (1-based) del usuario actual en la lista
 * de espera de un partido, o null si no está en la cola.
 */
export async function getWaitingListPosition(matchId: string): Promise<number | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("waiting_list")
    .select("player_id, requested_at")
    .eq("match_id", matchId)
    .order("requested_at", { ascending: true });

  if (error || !data) return null;

  const index = data.findIndex((entry) => entry.player_id === user.id);
  return index === -1 ? null : index + 1;
}
