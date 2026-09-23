"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin, getAuthErrorMessage } from "../hooks";
import { VALIDATION } from "@/lib/constants";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Kata sandi kamu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            error={!!errorMessage}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {errorMessage && (
          <p className="text-sm text-expense">{errorMessage}</p>
        )}

        <Button
          type="submit"
          className="w-full"
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
