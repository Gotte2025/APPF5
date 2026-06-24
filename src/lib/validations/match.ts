import { z } from "zod";

export const createMatchSchema = z.object({
  field_id: z.string().uuid("Elegí una cancha válida."),
  complex_id: z.string().uuid("Elegí un complejo válido."),
  starts_at: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Ingresá una fecha y hora válidas.")
    .refine((val) => new Date(val).getTime() > Date.now(), "La fecha debe ser futura."),
  duration_minutes: z.number().int().min(30).max(180).default(60),
  capacity: z.number().int().min(2).max(22).default(10),
});

export type CreateMatchInput = z.infer<typeof createMatchSchema>;

export const joinMatchSchema = z.object({
  match_id: z.string().uuid("Partido inválido."),
});

export const leaveMatchSchema = z.object({
  match_id: z.string().uuid("Partido inválido."),
});
