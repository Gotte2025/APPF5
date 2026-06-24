"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function CreateComplexPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) {
      setError("Necesitás iniciar sesión.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("complexes")
      .insert({ name, address: address || null, phone: phone || null, owner_id: userId })
      .select("id")
      .single();

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push(`/complexes/${data.id}`);
  }

  return (
    <AppShell>
      <h1 className="mb-1 font-display text-2xl text-linea">Nuevo complejo</h1>
      <p className="mb-6 text-sm text-linea-dim">Creá un complejo para empezar a agregar canchas.</p>

      <Card className="max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Nombre" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Dirección" name="address" value={address} onChange={(e) => setAddress(e.target.value)} />
          <Input label="Teléfono" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          {error && <p className="text-xs text-rojo">{error}</p>}
          <Button type="submit" loading={loading}>
            Crear complejo
          </Button>
        </form>
      </Card>
    </AppShell>
  );
}
