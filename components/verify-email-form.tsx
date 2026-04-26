"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function VerifyEmailForm({ initialEmail = "" }: { initialEmail?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);

  useEffect(() => {
    const storedCode = window.sessionStorage.getItem("djproia_dev_verification_code");
    if (storedCode) {
      setDevCode(storedCode);
      window.sessionStorage.removeItem("djproia_dev_verification_code");
    }
  }, []);

  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        redirectTo?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível verificar o código.");
      }

      setMessage("E-mail confirmado com sucesso. Redirecionando...");
      router.push(data.redirectTo || "/login?verified=1");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao verificar código.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError("");
    setMessage("");
    setDevCode(null);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        devVerificationCode?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível reenviar o código.");
      }

      if (data.devVerificationCode) {
        setDevCode(data.devVerificationCode);
      }

      setMessage("Enviamos um novo código para o seu e-mail.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao reenviar código.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.98),rgba(7,12,24,0.96))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)] sm:p-7">
      <div className="mb-7">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
          Verificação
        </p>
        <h1 className="mt-3 text-[28px] font-semibold leading-tight text-white">
          Confirme seu e-mail
        </h1>
        <p className="mt-2 text-sm leading-6 text-white/60">
          Digite o código de 6 dígitos enviado para liberar sua conta e seus créditos grátis.
        </p>
      </div>

      <form onSubmit={handleVerify} className="grid gap-5">
        <Field label="E-mail">
          <input
            type="email"
            className={inputClassName}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </Field>

        <Field label="Código de verificação">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            className={`${inputClassName} text-center text-xl font-semibold tracking-[0.35em]`}
            placeholder="000000"
            value={code}
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            required
          />
        </Field>

        {devCode ? (
          <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            Modo desenvolvimento: código <strong>{devCode}</strong>
          </div>
        ) : null}

        {message ? (
          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
            {message}
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
          {loading ? "Verificando..." : "Confirmar e-mail"}
        </button>
      </form>

      <div className="mt-6 grid gap-3 border-t border-white/10 pt-5 text-sm text-white/60">
        <button
          type="button"
          onClick={handleResend}
          disabled={resending || !email}
          className="text-left font-medium text-sky-200 transition hover:text-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resending ? "Reenviando código..." : "Reenviar código"}
        </button>

        <p>
          Já confirmou?{" "}
          <Link href="/login" className="font-medium text-sky-200 hover:text-sky-100">
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
