import type { MatchPlayer } from "@/types/match";

interface MatchPlayersProps {
  players: MatchPlayer[];
  capacity: number;
  currentUserId?: string | null;
  onRemovePlayer?: (player: MatchPlayer) => void;
}

/**
 * Representa el partido como una mini cancha: cada posición se va
 * llenando con la inicial del jugador anotado a medida que se suman.
 */
export function MatchPlayersGrid({ players, capacity, currentUserId, onRemovePlayer }: MatchPlayersProps) {
  const slots = Array.from({ length: capacity }, (_, i) => players[i] ?? null);
  const half = Math.ceil(capacity / 2);
  const row1 = slots.slice(0, half);
  const row2 = slots.slice(half);

  function renderSlot(player: MatchPlayer | null, index: number) {
    const occupied = !!player;
    const isMine = occupied && currentUserId && player.player_id === currentUserId;

    return (
      <div key={index} className="flex min-w-0 flex-col items-center gap-1.5">
        <div
          className={[
            "relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
            occupied
              ? isMine
                ? "border-linea/50 bg-cono text-white"
                : "border-linea/50 bg-white/15 text-linea"
              : "border-dashed border-white/25 bg-black/15 text-linea-dim",
          ].join(" ")}
        >
          {occupied ? player!.profile?.full_name?.charAt(0).toUpperCase() ?? "?" : index + 1}
          {isMine && onRemovePlayer && (
            <button
              aria-label="Bajarme del partido"
              onClick={() => onRemovePlayer(player!)}
              className="absolute -right-1.5 -top-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full border border-cancha-900 bg-rojo text-[10px] text-white"
            >
              ✕
            </button>
          )}
        </div>
        <span className="max-w-[54px] truncate text-[10.5px] text-linea-dim">
          {occupied ? player!.profile?.full_name?.split(" ")[0] : "libre"}
        </span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-md border border-white/10 bg-cancha-900 px-3 py-4">
      <div className="absolute bottom-0 left-1/2 top-0 w-px bg-white/10" />
      <div className="mb-4 flex justify-around gap-1">{row1.map((p, i) => renderSlot(p, i))}</div>
      <div className="flex justify-around gap-1">{row2.map((p, i) => renderSlot(p, i + half))}</div>
    </div>
  );
}
