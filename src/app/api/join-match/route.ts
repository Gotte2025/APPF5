import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { joinMatchSchema } from "@/lib/validations/match";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = joinMatchSchema.safeParse(body);

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

  const { match_id } = parsed.data;

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("id, capacity")
    .eq("id", match_id)
    .single();

  if (matchError || !match) {
    return NextResponse.json({ success: false, error: "Partido no encontrado." }, { status: 404 });
  }

  const { count } = await supabase
    .from("match_players")
    .select("id", { count: "exact", head: true })
    .eq("match_id", match_id);

  const isFull = (count ?? 0) >= match.capacity;

  if (isFull) {
    const { error } = await supabase.from("waiting_list").insert({ match_id, player_id: user.id });
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true, joinedWaitingList: true });
  }

  const { error } = await supabase.from("match_players").insert({ match_id, player_id: user.id });
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, joinedWaitingList: false });
}
