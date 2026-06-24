"use client";

import { AppShell } from "@/components/layout/AppShell";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { UpcomingMatches } from "@/components/dashboard/UpcomingMatches";
import { useAuth } from "@/hooks/useAuth";
import { useMatches } from "@/hooks/useMatches";

export default function DashboardPage() {
  const { profile, userId, isOwner } = useAuth();
  const { matches, loading } = useMatches({ onlyUpcoming: true });

  const misPartidos = matches.filter((m) => m.players.some((p) => p.player_id === userId));
  const totalAnotados = misPartidos.length;
  const proximosDisponibles = matches.filter((m) => m.players.length < m.capacity).length;

  const stats = isOwner
    ? [
        { label: "Partidos próximos", value: matches.length },
        { label: "Con cupo disponible", value: proximosDisponibles },
        { label: "Completos", value: matches.filter((m) => m.status === "full").length },
        { label: "En lista de espera", value: matches.reduce((acc, m) => acc + m.waiting_list.length, 0) },
      ]
    : [
        { label: "Mis próximos partidos", value: totalAnotados },
        { label: "Partidos con cupo", value: proximosDisponibles },
      ];

  return (
    <AppShell>
      <h1 className="mb-1 font-display text-2xl text-linea">
        Hola, {profile?.full_name?.split(" ")[0] ?? "👋"}
      </h1>
      <p className="mb-6 text-sm text-linea-dim">
        {isOwner ? "Así está la actividad de tus complejos." : "Estos son tus próximos partidos."}
      </p>

      {loading ? (
        <p className="text-sm text-linea-dim">Cargando...</p>
      ) : (
        <div className="flex flex-col gap-6">
          <StatsCards stats={stats} />
          <UpcomingMatches matches={isOwner ? matches : misPartidos.length ? misPartidos : matches} />
        </div>
      )}
    </AppShell>
  );
}
