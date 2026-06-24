"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { createFieldSchema } from "@/lib/validations/field";
import type { Complex } from "@/types/complex";

export default function CreateFieldPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const [complexes, setComplexes] = useState<Complex[]>([]);
  const [complexId, setComplexId] = useState("");
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(10);
  const [surface, setSurface] = useState("sintético");
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = createFieldSchema.safeParse({ complex_id: complexId, name, capacity, surface });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Datos inválidos.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("fields")
      .insert(parsed.data)
      .select("id")
      .single();
    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push(`/fields/${data.id}`);
  }

  if (complexes.length === 0) {
    return (
      <AppShell>
        <Card className="max-w-md">
          <p className="text-sm text-linea-dim">
            Necesitás crear un complejo antes de poder agregar canchas.
          </p>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <h1 className="mb-1 font-display text-2xl text-linea">Nueva cancha</h1>
      <p className="mb-6 text-sm text-linea-dim">Agregá una cancha a uno de tus complejos.</p>

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
          <Input label="Nombre de la cancha" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input
            label="Cupo de jugadores"
            type="number"
            name="capacity"
            value={capacity}
            min={2}
            max={22}
            onChange={(e) => setCapacity(Number(e.target.value))}
          />
          <Input label="Superficie" name="surface" value={surface} onChange={(e) => setSurface(e.target.value)} />
          {error && <p className="text-xs text-rojo">{error}</p>}
          <Button type="submit" loading={loading}>
            Crear cancha
          </Button>
        </form>
      </Card>
    </AppShell>
  );
}
