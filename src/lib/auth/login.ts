import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validations/user";

export interface LoginResult {
  success: boolean;
  error?: string;
}

/**
 * Inicia sesión con email/password. Pensado para llamarse desde
 * un Client Component (usa el cliente de browser de Supabase).
 */
export async function login(input: LoginInput): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (error.message.toLowerCase().includes("invalid login credentials")) {
      return { success: false, error: "Email o contraseña incorrectos." };
    }
    return { success: false, error: error.message };
  }

  return { success: true };
}
