"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface JoinButtonProps {
  alreadyJoined: boolean;
  isFull: boolean;
  onJoin: () => Promise<{ success: boolean; error?: string; joinedWaitingList?: boolean }>;
  onLeave: () => Promise<{ success: boolean; error?: string }>;
}

export function JoinButton({ alreadyJoined, isFull, onJoin, onLeave }: JoinButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waitingMessage, setWaitingMessage] = useState<string | null>(null);

  async function handleJoin() {
    setLoading(true);
    setError(null);
    setWaitingMessage(null);
    const result = await onJoin();
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "No se pudo completar la acción.");
      return;
    }
    if (result.joinedWaitingList) {
      setWaitingMessage("El partido está completo. Quedaste en lista de espera.");
    }
  }

  async function handleLeave() {
    setLoading(true);
    setError(null);
    const result = await onLeave();
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "No se pudo completar la acción.");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {alreadyJoined ? (
        <Button variant="secondary" size="md" onClick={handleLeave} loading={loading}>
          Bajarme del partido
        </Button>
      ) : (
        <Button variant="primary" size="md" onClick={handleJoin} loading={loading}>
          {isFull ? "Anotarme en lista de espera" : "Anotarme a este partido"}
        </Button>
      )}
      {error && <span className="text-xs text-rojo">{error}</span>}
      {waitingMessage && <span className="text-xs text-amarillo">{waitingMessage}</span>}
    </div>
  );
}
