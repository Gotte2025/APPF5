import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Ingresá tu nombre completo."),
  phone: z.string().trim().min(6, "Ingresá un teléfono válido."),
  email: z.string().trim().email("Ingresá un email válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  role: z.enum(["owner", "player"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Ingresá un email válido."),
  password: z.string().min(1, "Ingresá tu contraseña."),
});

export type LoginInput = z.infer<typeof loginSchema>;
