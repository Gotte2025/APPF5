import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import type { MatchWithDetails } from "@/types/match";

interface UpcomingMatchesProps {
  matches: MatchWithDetails[];
}

export function UpcomingMatches({ matches }: UpcomingMatchesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos partidos</CardTitle>
        <Link href="/matches" className="text-xs text-cono-light hover:underline">
          Ver todos
        </Link>
      </CardHeader>

      {matches.length === 0 ? (
        <p className="text-sm text-linea-dim">No hay partidos próximos todavía.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-white/10">
          {matches.slice(0, 5).map((match) => {
            const date = new Date(match.starts_at);
            return (
              <li key={match.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-linea">
                    {match.field.name} · {match.complex.name}
                  </p>
                  <p className="text-xs text-linea-dim">
                    {date.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "short" })}
                    {" · "}
                    {date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <span className="text-xs font-semibold text-linea-dim">
                  {match.players.length}/{match.capacity}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
