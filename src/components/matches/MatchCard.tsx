"use client";

import { Card } from "@/components/ui/Card";
import { MatchPlayersGrid } from "@/components/matches/MatchPlayers";
import { JoinButton } from "@/components/matches/JoinButton";
import type { MatchWithDetails } from "@/types/match";

interface MatchCardProps {
  match: MatchWithDetails;
  currentUserId: string | null;
  onJoin: (matchId: string) => Promise<{ success: boolean; error?: string; joinedWaitingList?: boolean }>;
  onLeave: (matchId: string) => Promise<{ success: boolean; error?: string }>;
}

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function formatStartsAt(iso: string) {
  const date = new Date(iso);
  return {
    dia: DIAS[date.getDay()],
    num: date.getDate(),
    mes: MESES[date.getMonth()],
    hora: date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
  };
}

export function MatchCard({ match, currentUserId, onJoin, onLeave }: MatchCardProps) {
  const { dia, num, mes, hora } = formatStartsAt(match.starts_at);
  const isFull = match.status === "full" || match.players.length >= match.capacity;
  const alreadyJoined = !!currentUserId && match.players.some((p) => p.player_id === currentUserId);
  const isPast = new Date(match.starts_at).getTime() < Date.now() - 60 * 60 * 1000;

  return (
    <Card className={isPast ? "opacity-50" : ""} highlight={isFull}>
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-white/5 px-2.5 py-1.5 text-center">
            <p className="font-display text-xl leading-none text-linea">{num}</p>
            <p className="text-[10px] uppercase text-linea-dim">{mes}</p>
          </div>
          <div>
            <p className="text-sm font-semibold capitalize text-linea">{dia}</p>
            <p className="text-xs text-linea-dim">
              {hora} · {match.field.name} · {match.complex.name}
            </p>
          </div>
        </div>
        <span
          className={[
            "rounded-full px-2.5 py-1 text-[11px] font-semibold",
            isPast
              ? "bg-white/10 text-linea-dim"
              : isFull
                ? "bg-cono/20 text-cono-light"
                : "bg-amarillo/15 text-amarillo",
          ].join(" ")}
        >
          {isPast ? "jugado" : isFull ? "completo" : `${match.players.length}/${match.capacity} jugadores`}
        </span>
      </div>

      <MatchPlayersGrid players={match.players} capacity={match.capacity} currentUserId={currentUserId} />

      {!isPast && (
        <div className="mt-4">
          <JoinButton
            alreadyJoined={alreadyJoined}
            isFull={isFull}
            onJoin={() => onJoin(match.id)}
            onLeave={() => onLeave(match.id)}
          />
        </div>
      )}

      {match.waiting_list.length > 0 && (
        <p className="mt-2 text-xs text-linea-dim">
          {match.waiting_list.length} en lista de espera
        </p>
      )}
    </Card>
  );
}
