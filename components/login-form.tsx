"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberSession, setRememberSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          rememberSession,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.error || "Não foi possível entrar. Verifique seus dados.",
        );
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível entrar. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.98),rgba(7,12,24,0.96))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)] sm:p-7">
      <div className="mb-7">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
          Acesso
        </p>
        <h1 className="mt-3 text-[28px] font-semibold leading-tight text-white">
          Entrar no painel
        </h1>
        <p className="mt-2 text-sm leading-6 text-white/60">
          Use seu e-mail e senha para acessar sua área de criação.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5">
        <Field label="E-mail">
          <input
            type="email"
            className={inputClassName}
            placeholder="seuemail@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </Field>

        <Field label="Senha">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className={`${inputClassName} pr-12`}
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/45 transition hover:text-white/80"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </Field>

        <label className="flex items-center gap-3 text-sm text-white/70">
          <input
            type="checkbox"
            checked={rememberSession}
            onChange={(e) => setRememberSession(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-transparent"
          />
          <span>Manter conectado neste dispositivo</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95 disabled:cursor-wait disabled:opacity-80"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      </form>

      <div className="mt-6 grid gap-3 border-t border-white/10 pt-5">
        <Link
          href="/register"
          className="text-sm font-medium text-sky-200 transition hover:text-sky-100"
        >
          Ainda não tem conta? Criar cadastro
        </Link>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3">
      <label className="text-sm font-medium text-white/90">{label}</label>
      {children}
    </div>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/50 focus:ring-4 focus:ring-sky-400/10 placeholder:text-white/35";
