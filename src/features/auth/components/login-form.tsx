"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { FieldError } from "@/components/ui/field-error";
import { useLogin } from "@/features/auth/hooks";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas";
import { getErrorMessage } from "@/lib/api-client";
import { ROUTES } from "@/lib/constants";
import { getFieldErrors, type FieldErrors } from "@/lib/validation";

export function LoginForm() {
  const [values, setValues] = useState<LoginFormValues>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FieldErrors<LoginFormValues>>({});

  const login = useLogin();

  function setField(field: keyof LoginFormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const result = loginSchema.safeParse(values);
    if (!result.success) {
      setErrors(getFieldErrors(result.error));
      return;
    }

    setErrors({});
    login.mutate(result.data);
  }

  return (
    <div className="w-full max-w-sm">
      <p className="text-xs font-medium text-muted-foreground">Welcome back</p>
      <h1 className="mt-1 text-3xl font-semibold text-foreground">Masuk</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Masukkan email dan password untuk lanjut ke dashboard kamu.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
        <div>
          <Label htmlFor="email" className="sr-only">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Alamat email kamu"
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
            autoComplete="email"
            error={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          <FieldError id="email-error" message={errors.email} />
        </div>

        <div>
          <Label htmlFor="password" className="sr-only">
            Password
          </Label>
          <PasswordInput
            id="password"
            placeholder="Kata sandi kamu"
            value={values.password}
            onChange={(e) => setField("password", e.target.value)}
            autoComplete="current-password"
            error={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          <FieldError id="password-error" message={errors.password} />
        </div>

        {login.isError && (
          <p role="alert" className="text-sm text-expense">
            {getErrorMessage(login.error, "Terjadi kesalahan. Coba lagi.")}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={login.isPending}>
          {login.isPending ? "Memproses..." : "Masuk"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link
          href={ROUTES.AUTH.REGISTER}
          className="font-medium text-primary hover:underline"
        >
          Daftar
        </Link>
      </p>
    </div>
  );
}
