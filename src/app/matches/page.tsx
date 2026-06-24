"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { MatchCard } from "@/components/matches/MatchCard";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useMatches } from "@/hooks/useMatches";

export default function MatchesPage() {
  const { userId, isOwner } = useAuth();
  const { matches, loading, join, leave } = useMatches({ onlyUpcoming: true });

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-linea">Partidos</h1>
          <p className="text-sm text-linea-dim">Anotate a un partido o gestioná los próximos turnos.</p>
        </div>
        {isOwner && (
          <Link href="/matches/create">
            <Button>+ Nuevo partido</Button>
          </Link>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-linea-dim">Cargando...</p>
      ) : matches.length === 0 ? (
        <p className="text-sm text-linea-dim">No hay partidos próximos todavía.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} currentUserId={userId} onJoin={join} onLeave={leave} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
