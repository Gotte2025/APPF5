import { z } from "zod";

export const createFieldSchema = z.object({
  complex_id: z.string().uuid("Elegí un complejo válido."),
  name: z.string().trim().min(2, "Ingresá un nombre para la cancha."),
  capacity: z
    .number({ invalid_type_error: "El cupo debe ser un número." })
    .int()
    .min(2, "El cupo mínimo es 2 jugadores.")
    .max(22, "El cupo máximo es 22 jugadores."),
  surface: z.string().trim().optional(),
});

export type CreateFieldInput = z.infer<typeof createFieldSchema>;
