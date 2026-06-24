import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente de Supabase para usar en Server Components, Route Handlers
 * y Server Actions. Lee y escribe la sesión a través de las cookies
 * de Next.js (App Router).
 *
 * Nota: desde Next.js 15, `cookies()` es asíncrono, por eso esta
 * función también lo es. Cada llamado debe hacer `await createClient()`.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Se llama desde un Server Component: Next.js no permite
            // escribir cookies ahí. El middleware se encarga de refrescar
            // la sesión en esos casos, así que es seguro ignorar el error.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Ver comentario arriba.
          }
        },
      },
    }
  );
}
