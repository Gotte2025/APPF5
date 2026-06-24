import { createClient } from "@/lib/supabase/client";
import { registerSchema, type RegisterInput } from "@/lib/validations/user";

export interface RegisterResult {
  success: boolean;
  error?: string;
  needsEmailConfirmation?: boolean;
}

/**
 * Registra un nuevo usuario. El full_name, phone y role viajan en
 * la metadata del signUp; el trigger `handle_new_user` en Supabase
 * los toma de ahí para crear la fila en `profiles` automáticamente.
 */
export async function register(input: RegisterInput): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
        role: parsed.data.role,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { success: false, error: "Ya existe una cuenta con ese email." };
    }
    return { success: false, error: error.message };
  }

  // Si la confirmación de email está activada en el proyecto Supabase,
  // session viene null hasta que el usuario confirme el correo.
  const needsEmailConfirmation = !data.session;

  return { success: true, needsEmailConfirmation };
}
