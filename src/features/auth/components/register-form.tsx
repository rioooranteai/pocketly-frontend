"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { FieldError } from "@/components/ui/field-error";
import { useRegister } from "@/features/auth/hooks";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/schemas";
import { getErrorMessage } from "@/lib/api-client";
import { ROUTES, VALIDATION } from "@/lib/constants";
import { getFieldErrors, type FieldErrors } from "@/lib/validation";

export function RegisterForm() {
  const [values, setValues] = useState<RegisterFormValues>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FieldErrors<RegisterFormValues>>({});

  const register = useRegister();

  function setField(field: keyof RegisterFormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const result = registerSchema.safeParse(values);
    if (!result.success) {
      setErrors(getFieldErrors(result.error));
      return;
    }

    setErrors({});
    const { name, email, password } = result.data;
    register.mutate({ name, email, password });
  }

  /** Props shared by every field: value binding + error wiring. */
  function fieldProps(field: keyof RegisterFormValues) {
    return {
      id: field,
      value: values[field],
      onChange: (e: ChangeEvent<HTMLInputElement>) =>
        setField(field, e.target.value),
      error: !!errors[field],
      "aria-describedby": errors[field] ? `${field}-error` : undefined,
    };
  }

  return (
    <div className="w-full max-w-sm">
      <p className="text-xs font-medium text-muted-foreground">Get started</p>
      <h1 className="mt-1 text-3xl font-semibold text-foreground">Buat akun</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Mulai lacak keuanganmu dengan bantuan AI Pocketly.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
        <div>
          <Label htmlFor="name" className="sr-only">
            Nama lengkap
          </Label>
          <Input
            {...fieldProps("name")}
            type="text"
            placeholder="Nama lengkap kamu"
            autoComplete="name"
          />
          <FieldError id="name-error" message={errors.name} />
        </div>

        <div>
          <Label htmlFor="email" className="sr-only">
            Email
          </Label>
          <Input
            {...fieldProps("email")}
            type="email"
            placeholder="Alamat email kamu"
            autoComplete="email"
          />
          <FieldError id="email-error" message={errors.email} />
        </div>

        <div>
          <Label htmlFor="password" className="sr-only">
            Password
          </Label>
          <PasswordInput
            {...fieldProps("password")}
            placeholder={`Kata sandi (minimal ${VALIDATION.PASSWORD_MIN_LENGTH} karakter)`}
            autoComplete="new-password"
          />
          <FieldError id="password-error" message={errors.password} />
        </div>

        <div>
          <Label htmlFor="confirmPassword" className="sr-only">
            Konfirmasi password
          </Label>
          <PasswordInput
            {...fieldProps("confirmPassword")}
            placeholder="Konfirmasi kata sandi"
            autoComplete="new-password"
          />
          <FieldError
            id="confirmPassword-error"
            message={errors.confirmPassword}
          />
        </div>

        {register.isError && (
          <p role="alert" className="text-sm text-expense">
            {getErrorMessage(register.error, "Terjadi kesalahan. Coba lagi.")}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={register.isPending}>
          {register.isPending ? "Memproses..." : "Daftar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <Link
          href={ROUTES.AUTH.LOGIN}
          className="font-medium text-primary hover:underline"
        >
          Masuk
        </Link>
      </p>
    </div>
  );
}
