import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Image
        src="/logo.png"
        alt="Escudo APPF5"
        width={140}
        height={140}
        className="rounded-2xl"
        priority
      />
      <span className="font-display text-3xl tracking-wide text-linea">APPF5</span>
      <p className="max-w-md text-sm text-linea-dim">
        Organizá los turnos de tu complejo de fútbol 5 y dejá que los jugadores se anoten solos,
        partido por partido, hasta completar el equipo.
      </p>
      <div className="flex gap-3">
        <Link href="/login">
          <Button variant="primary">Iniciar sesión</Button>
        </Link>
        <Link href="/register">
          <Button variant="secondary">Crear cuenta</Button>
        </Link>
      </div>
    </main>
  );
}
