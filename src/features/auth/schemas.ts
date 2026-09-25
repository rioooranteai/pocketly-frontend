import { z } from "zod";
import { VALIDATION } from "@/lib/constants";

const email = z
  .string()
  .trim()
  .max(VALIDATION.EMAIL_MAX_LENGTH, "Email terlalu panjang.")
  .regex(VALIDATION.EMAIL, "Format email tidak valid.");

const passwordTooLong = `Password maksimal ${VALIDATION.PASSWORD_MAX_LENGTH} karakter.`;

export const loginSchema = z.object({
  email,
  password: z
    .string()
    .min(1, "Password wajib diisi.")
    .max(VALIDATION.PASSWORD_MAX_LENGTH, passwordTooLong),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Nama wajib diisi.")
      .max(
        VALIDATION.NAME_MAX_LENGTH,
        `Nama maksimal ${VALIDATION.NAME_MAX_LENGTH} karakter.`
      ),
    email,
    password: z
      .string()
      .min(
        VALIDATION.PASSWORD_MIN_LENGTH,
        `Password minimal ${VALIDATION.PASSWORD_MIN_LENGTH} karakter.`
      )
      .max(VALIDATION.PASSWORD_MAX_LENGTH, passwordTooLong),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak sama.",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
