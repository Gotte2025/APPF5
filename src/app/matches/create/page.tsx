"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { createMatch } from "@/lib/matches/createMatch";
import type { Complex } from "@/types/complex";
import type { Field } from "@/types/field";

export default function CreateMatchPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const [complexes, setComplexes] = useState<Complex[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [complexId, setComplexId] = useState("");
  const [fieldId, setFieldId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [capacity, setCapacity] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("complexes").select("*").eq("owner_id", userId);
      setComplexes(data ?? []);
      if (data && data.length > 0) setComplexId(data[0].id);
    }
    load();
  }, [userId]);

  useEffect(() => {
    if (!complexId) return;
    async function loadFields() {
      const supabase = createClient();
      const { data } = await supabase.from("fields").select("*").eq("complex_id", complexId);
      setFields(data ?? []);
      if (data && data.length > 0) {
        setFieldId(data[0].id);
        setCapacity(data[0].capacity);
      } else {
        setFieldId("");
      }
    }
    loadFields();
  }, [complexId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!date || !time || !fieldId || !complexId) {
      setError("Completá todos los campos.");
      return;
    }

    setLoading(true);
    const startsAt = new Date(`${date}T${time}:00`).toISOString();

    const result = await createMatch({
      field_id: fieldId,
      complex_id: complexId,
      starts_at: startsAt,
      duration_minutes: duration,
      capacity,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "No se pudo crear el partido.");
      return;
    }

    router.push(`/matches/${result.matchId}`);
  }

  if (complexes.length === 0) {
    return (
      <AppShell>
        <Card className="max-w-md">
          <p className="text-sm text-linea-dim">Necesitás crear un complejo y una cancha antes de poder crear partidos.</p>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <h1 className="mb-1 font-display text-2xl text-linea">Nuevo partido</h1>
      <p className="mb-6 text-sm text-linea-dim">Programá un turno para que los jugadores se anoten.</p>

      <Card className="max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-linea-dim">Complejo</label>
            <select
              value={complexId}
              onChange={(e) => setComplexId(e.target.value)}
              className="rounded-md border border-white/15 bg-black/20 px-3 py-2.5 text-sm text-linea"
            >
              {complexes.map((c) => (
                <option key={c.id} value={c.id} className="bg-cancha-900">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-linea-dim">Cancha</label>
            <select
              value={fieldId}
              onChange={(e) => {
                setFieldId(e.target.value);
                const f = fields.find((field) => field.id === e.target.value);
                if (f) setCapacity(f.capacity);
              }}
              className="rounded-md border border-white/15 bg-black/20 px-3 py-2.5 text-sm text-linea"
              disabled={fields.length === 0}
            >
              {fields.length === 0 && <option>No hay canchas en este complejo</option>}
              {fields.map((f) => (
                <option key={f.id} value={f.id} className="bg-cancha-900">
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Fecha" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <Input label="Hora" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Duración (min)"
              type="number"
              value={duration}
              min={30}
              max={180}
              step={15}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
            <Input
              label="Cupo"
              type="number"
              value={capacity}
              min={2}
              max={22}
              onChange={(e) => setCapacity(Number(e.target.value))}
            />
          </div>

          {error && <p className="text-xs text-rojo">{error}</p>}
          <Button type="submit" loading={loading} disabled={fields.length === 0}>
            Crear partido
          </Button>
        </form>
      </Card>
    </AppShell>
  );
}
