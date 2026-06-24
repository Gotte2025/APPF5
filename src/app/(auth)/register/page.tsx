"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { register } from "@/lib/auth/register";
import type { UserRole } from "@/types/user";

// Clave secreta para poder registrarse como Organizador.
// Cambiala por la que quieras, y compartísela solo a quien
// quieras que pueda crear complejos/canchas/partidos.
const ORGANIZER_SECRET = "B3B37162CCC91";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("player");
  const [organizerCode, setOrganizerCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (role === "owner" && organizerCode !== ORGANIZER_SECRET) {
      setError("La clave de organizador es incorrecta.");
      return;
    }

    setLoading(true);

    const result = await register({ fullName, phone, email, password, role });

    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "No se pudo crear la cuenta.");
      return;
    }

    if (result.needsEmailConfirmation) {
      setConfirmationSent(true);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (confirmationSent) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-sm text-center">
          <h1 className="mb-2 font-display text-xl text-linea">Revisá tu correo</h1>
          <p className="text-sm text-linea-dim">
            Te enviamos un link de confirmación a {email}. Confirmá tu cuenta para poder iniciar sesión.
          </p>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-1 font-display text-xl text-linea">Crear cuenta</h1>
        <p className="mb-6 text-sm text-linea-dim">Sumate a Turnos F5 como jugador u organizador.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nombre completo"
            name="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            label="Teléfono"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-linea-dim">Tipo de cuenta</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("player")}
                className={`rounded-md border px-3 py-2 text-sm ${
                  role === "player" ? "border-cono bg-cono/15 text-cono-light" : "border-white/15 text-linea-dim"
                }`}
              >
                Jugador
              </button>
              <button
                type="button"
                onClick={() => setRole("owner")}
                className={`rounded-md border px-3 py-2 text-sm ${
                  role === "owner" ? "border-cono bg-cono/15 text-cono-light" : "border-white/15 text-linea-dim"
                }`}
              >
                Organizador
              </button>
            </div>
          </div>

          {role === "owner" && (
            <Input
              label="Clave de organizador"
              type="password"
              name="organizerCode"
              value={organizerCode}
              onChange={(e) => setOrganizerCode(e.target.value)}
              placeholder="Pedísela al administrador"
              required
            />
          )}

          {error && <p className="text-xs text-rojo">{error}</p>}
          <Button type="submit" loading={loading} className="mt-2">
            Crear cuenta
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-linea-dim">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-cono-light hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </Card>
    </main>
  );
}
