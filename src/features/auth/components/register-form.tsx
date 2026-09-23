"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRegister, getAuthErrorMessage } from "../hooks";
import { VALIDATION } from "@/lib/constants";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const register = useRegister();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Nama wajib diisi.");
      return;
    }
    if (!VALIDATION.EMAIL.test(email)) {
      setFormError("Format email tidak valid.");
      return;
    }
    if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      setFormError(`Password minimal ${VALIDATION.PASSWORD_MIN_LENGTH} karakter.`);
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Password tidak sama.");
      return;
    }

    register.mutate({ name, email, password });
  }

  const errorMessage =
    formError ?? (register.isError ? getAuthErrorMessage(register.error) : null);

  return (
    <div className="w-full max-w-sm">
      <p className="text-xs font-medium text-muted-foreground">Get started</p>
      <h1 className="mt-1 text-3xl font-semibold text-foreground">Buat akun</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Mulai lacak keuanganmu dengan bantuan AI Pocketly.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Input
          id="name"
          type="text"
          placeholder="Nama lengkap kamu"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          error={!!errorMessage}
        />

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
            placeholder="Kata sandi (minimal 8 karakter)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
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

        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Konfirmasi kata sandi"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            error={!!errorMessage}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
            aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {errorMessage && (
          <p className="text-sm text-expense">{errorMessage}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={register.isPending}
        >
          {register.isPending ? "Memproses..." : "Daftar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}
