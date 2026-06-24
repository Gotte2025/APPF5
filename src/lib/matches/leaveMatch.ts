import { createClient } from "@/lib/supabase/client";

export interface LeaveMatchResult {
  success: boolean;
  error?: string;
}

/**
 * Saca al usuario actual de un partido confirmado. El trigger
 * `on_match_player_leave` en Supabase se encarga de promover
 * automáticamente al primero de la lista de espera, si hay alguno.
 */
export async function leaveMatch(matchId: string): Promise<LeaveMatchResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Necesitás iniciar sesión." };
  }

  const { error } = await supabase
    .from("match_players")
    .delete()
    .eq("match_id", matchId)
    .eq("player_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
