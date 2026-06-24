import { createClient } from "@/lib/supabase/client";
import { createMatchSchema, type CreateMatchInput } from "@/lib/validations/match";

export interface CreateMatchResult {
  success: boolean;
  error?: string;
  matchId?: string;
}

/**
 * Crea un nuevo partido/turno en una cancha. Solo el owner del
 * complejo dueño de la cancha puede hacerlo (lo aplica RLS).
 */
export async function createMatch(input: CreateMatchInput): Promise<CreateMatchResult> {
  const parsed = createMatchSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Necesitás iniciar sesión." };
  }

  const { data, error } = await supabase
    .from("matches")
    .insert({
      field_id: parsed.data.field_id,
      complex_id: parsed.data.complex_id,
      starts_at: parsed.data.starts_at,
      duration_minutes: parsed.data.duration_minutes,
      capacity: parsed.data.capacity,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, matchId: data.id };
}
