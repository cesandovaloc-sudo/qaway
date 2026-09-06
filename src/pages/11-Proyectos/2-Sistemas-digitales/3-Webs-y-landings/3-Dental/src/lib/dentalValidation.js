import { z } from "zod";

export const dentalLeadSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Ingresa tu nombre completo (mínimo 3 caracteres)"),
  phone: z
    .string()
    .trim()
    .min(8, "Ingresa un número telefónico o WhatsApp válido (mínimo 8 dígitos)"),
  email: z
    .string()
    .trim()
    .email("Ingresa un correo electrónico válido"),
  age: z
    .string()
    .trim()
    .optional(),
  treatmentInterest: z
    .string()
    .min(1, "Selecciona un tratamiento de interés"),
  message: z
    .string()
    .trim()
    .optional(),
  acceptedPrivacy: z
    .boolean()
    .refine((val) => val === true, {
      message: "Debes aceptar la política de privacidad para continuar",
    }),
});
