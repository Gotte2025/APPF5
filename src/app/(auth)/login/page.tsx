"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { login } from "@/lib/auth/login";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login({ email, password });

    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "No se pudo iniciar sesión.");
      return;
    }

    const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <Card className="w-full max-w-sm">
      <h1 className="mb-1 font-display text-xl text-linea">Iniciar sesión</h1>
      <p className="mb-6 text-sm text-linea-dim">Entrá a tu cuenta de Turnos F5.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        {error && <p className="text-xs text-rojo">{error}</p>}
        <Button type="submit" loading={loading} className="mt-2">
          Entrar
        </Button>
      </form>

      <p className="mt-5 text-center text-xs text-linea-dim">
        ¿No tenés cuenta?{" "}
        <Link href="/register" className="text-cono-light hover:underline">
          Registrate
        </Link>
      </p>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Suspense fallback={<p className="text-sm text-linea-dim">Cargando...</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
