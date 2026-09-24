import { z } from "zod";
import { VALIDATION } from "@/lib/constants";

const email = z
  .string()
  .trim()
  .regex(VALIDATION.EMAIL, "Format email tidak valid.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password wajib diisi."),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Nama wajib diisi."),
    email,
    password: z
      .string()
      .min(
        VALIDATION.PASSWORD_MIN_LENGTH,
        `Password minimal ${VALIDATION.PASSWORD_MIN_LENGTH} karakter.`
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak sama.",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
