"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin, getAuthErrorMessage } from "../hooks";
import { VALIDATION } from "@/lib/constants";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const login = useLogin();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!VALIDATION.EMAIL.test(email)) {
      setFormError("Format email tidak valid.");
      return;
    }
    if (!password) {
      setFormError("Password wajib diisi.");
      return;
    }

    login.mutate({ email, password });
  }

  const errorMessage = formError ?? (login.isError ? getAuthErrorMessage(login.error) : null);

  return (
    <div className="w-full max-w-sm">
      <p className="text-xs font-medium text-muted-foreground">Welcome back</p>
      <h1 className="mt-1 text-3xl font-semibold text-foreground">Masuk</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Masukkan email dan password untuk lanjut ke dashboard kamu.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Input
          id="email"
          type="email"
          placeholder="Alamat email kamu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          error={!!errorMessage}
        />

        <Input
          id="password"
          type="password"
          placeholder="Kata sandi kamu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          error={!!errorMessage}
        />

        {errorMessage && (
          <p className="text-sm text-expense">{errorMessage}</p>
        )}

        <Button
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:bg-primary-hover"
          disabled={login.isPending}
        >
          {login.isPending ? "Memproses..." : "Masuk"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Daftar
        </Link>
      </p>
    </div>
  );
}
