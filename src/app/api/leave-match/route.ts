import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { leaveMatchSchema } from "@/lib/validations/match";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = leaveMatchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "No autenticado." }, { status: 401 });
  }

  const { error } = await supabase
    .from("match_players")
    .delete()
    .eq("match_id", parsed.data.match_id)
    .eq("player_id", user.id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  // El trigger `on_match_player_leave` en Supabase promueve automáticamente
  // al primero de la waiting_list si corresponde; no se necesita lógica extra aquí.
  return NextResponse.json({ success: true });
}
