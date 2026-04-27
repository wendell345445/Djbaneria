"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Check, Globe2, Loader2 } from "lucide-react";

import {
  DEFAULT_LOCALE,
  LANGUAGE_OPTIONS,
  getAppCopy,
  normalizeLocale,
  type AppLocale,
} from "@/lib/i18n";

type LanguageSelectionFormProps = {
  initialLocale?: AppLocale | string | null;
  variant?: "onboarding" | "settings";
  returnTo?: string;
};

export function LanguageSelectionForm({
  initialLocale = DEFAULT_LOCALE,
  variant = "settings",
  returnTo = "/dashboard",
}: LanguageSelectionFormProps) {
  const router = useRouter();
  const [selectedLocale, setSelectedLocale] = useState<AppLocale>(() =>
    normalizeLocale(initialLocale),
  );
  const copy = useMemo(() => getAppCopy(selectedLocale), [selectedLocale]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/settings/language", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locale: selectedLocale,
          completeOnboarding: true,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || copy.common.error);
      }

      setSuccess(true);

      if (variant === "onboarding") {
        router.push(returnTo || "/dashboard");
        router.refresh();
        return;
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.common.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.98),rgba(7,12,24,0.96))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] sm:p-7"
    >
      <div className="mb-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/10 text-cyan-100">
          <Globe2 size={22} />
        </div>

        <p className="mt-5 text-[11px] uppercase tracking-[0.22em] text-white/45">
          {variant === "onboarding"
            ? copy.onboarding.eyebrow
            : copy.language.eyebrow}
        </p>
        <h1 className="mt-3 text-[28px] font-semibold leading-tight text-white sm:text-[34px]">
          {variant === "onboarding"
            ? copy.onboarding.title
            : copy.language.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
          {variant === "onboarding"
            ? copy.onboarding.description
            : copy.language.description}
        </p>
      </div>

      <div className="grid gap-3">
        {LANGUAGE_OPTIONS.map((option) => {
          const active = selectedLocale === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelectedLocale(option.value)}
              className={`flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-cyan-300/35 bg-cyan-300/[0.1] shadow-[0_0_34px_rgba(34,211,238,0.08)]"
                  : "border-white/10 bg-white/[0.035] hover:border-white/18 hover:bg-white/[0.055]"
              }`}
            >
              <span className="min-w-0">
                <span className="block text-base font-semibold text-white">
                  {option.nativeLabel}
                </span>
                <span className="mt-1 block text-sm leading-6 text-white/55">
                  {option.description}
                </span>
              </span>

              <span
                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                  active
                    ? "border-cyan-200/40 bg-cyan-200/15 text-cyan-100"
                    : "border-white/10 bg-white/[0.04] text-white/30"
                }`}
              >
                {active ? <Check size={16} /> : null}
              </span>
            </button>
          );
        })}
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      {success && variant === "settings" ? (
        <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {copy.settings.saved}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95 disabled:cursor-wait disabled:opacity-80"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 size={17} className="animate-spin" />
            {copy.common.saving}
          </span>
        ) : variant === "onboarding" ? (
          copy.onboarding.continue
        ) : (
          copy.common.saveLanguage
        )}
      </button>
    </form>
  );
}
