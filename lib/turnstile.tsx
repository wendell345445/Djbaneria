"use client";

import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

type RegisterFormData = {
  name: string;
  artistName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();

export function RegisterForm() {
  const router = useRouter();
  const turnstileRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [form, setForm] = useState<RegisterFormData>({
    name: "",
    artistName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const shouldShowTurnstile = Boolean(turnstileSiteKey);

  useEffect(() => {
    if (!shouldShowTurnstile || !turnstileLoaded) return;
    if (!turnstileRef.current || !window.turnstile) return;
    if (turnstileWidgetIdRef.current) return;

    turnstileWidgetIdRef.current = window.turnstile.render(
      turnstileRef.current,
      {
        sitekey: turnstileSiteKey!,
        theme: "dark",
        callback: (token) => {
          setTurnstileToken(token);
        },
        "expired-callback": () => {
          setTurnstileToken("");
        },
        "error-callback": () => {
          setTurnstileToken("");
          setError(
            "Não foi possível carregar a proteção anti-robô. Recarregue a página e tente novamente.",
          );
        },
      },
    );

    return () => {
      if (turnstileWidgetIdRef.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetIdRef.current);
        turnstileWidgetIdRef.current = null;
      }
    };
  }, [shouldShowTurnstile, turnstileLoaded]);

  function resetTurnstile() {
    setTurnstileToken("");

    if (turnstileWidgetIdRef.current && window.turnstile) {
      window.turnstile.reset(turnstileWidgetIdRef.current);
    }
  }

  function updateField<K extends keyof RegisterFormData>(
    field: K,
    value: RegisterFormData[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("A confirmação da senha não confere.");
      setLoading(false);
      return;
    }

    if (shouldShowTurnstile && !turnstileToken) {
      setError("Confirme que você não é um robô para continuar.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          artistName: form.artistName,
          turnstileToken,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        redirectTo?: string;
        devVerificationCode?: string;
      };

      if (!response.ok) {
        resetTurnstile();
        throw new Error(data?.error || "Não foi possível criar sua conta.");
      }

      if (data.devVerificationCode) {
        window.sessionStorage.setItem(
          "djproia_dev_verification_code",
          data.devVerificationCode,
        );
      }

      router.push(data.redirectTo ?? "/verify-email");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro inesperado ao criar sua conta.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.98),rgba(7,12,24,0.96))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)] sm:p-7">
      {shouldShowTurnstile ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={() => setTurnstileLoaded(true)}
        />
      ) : null}

      <div className="mb-7">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
          Cadastro
        </p>
        <h1 className="mt-3 text-[28px] font-semibold leading-tight text-white">
          Criar conta
        </h1>
        <p className="mt-2 text-sm leading-6 text-white/60">
          Crie sua conta e confirme o e-mail para liberar seus créditos grátis.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nome completo">
            <input
              type="text"
              className={inputClassName}
              placeholder="Seu nome"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              autoComplete="name"
              required
            />
          </Field>

          <Field label="Nome artístico">
            <input
              type="text"
              className={inputClassName}
              placeholder="Ex.: DJ Vision"
              value={form.artistName}
              onChange={(e) => updateField("artistName", e.target.value)}
            />
          </Field>
        </div>

        <Field label="E-mail">
          <input
            type="email"
            className={inputClassName}
            placeholder="voce@email.com"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            autoComplete="email"
            required
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Senha">
            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                className={`${inputClassName} pr-12`}
                placeholder="Mínimo de 6 caracteres"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/45 transition hover:text-white/80"
                aria-label={showPasswords ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Field>

          <Field label="Confirmar senha">
            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                className={`${inputClassName} pr-12`}
                placeholder="Repita a senha"
                value={form.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswords((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/45 transition hover:text-white/80"
                aria-label={
                  showPasswords
                    ? "Ocultar confirmação de senha"
                    : "Mostrar confirmação de senha"
                }
              >
                {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Field>
        </div>

        {shouldShowTurnstile ? (
          <div className="grid gap-2">
            <label className="text-sm font-medium text-white/90">
              Verificação de segurança
            </label>
            <div className="min-h-[65px] overflow-hidden rounded-2xl bg-white/[0.03] px-1 py-1">
              <div ref={turnstileRef} />
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95 disabled:cursor-wait disabled:opacity-80"
        >
          {loading ? "Criando conta..." : "Criar conta"}
        </button>
      </form>

      <div className="mt-6 border-t border-white/10 pt-5">
        <p className="text-sm text-white/60">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="font-medium text-sky-200 transition hover:text-sky-100"
          >
            Entrar
          </Link>
        </p>
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
