"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_LOCALE,
  LANGUAGE_OPTIONS,
  getAppCopy,
  normalizeLocale,
  type AppLocale,
} from "@/lib/i18n";

type LanguageSettingsFormProps = {
  initialLocale?: string | null;
};

export function LanguageSettingsForm({
  initialLocale,
}: LanguageSettingsFormProps) {
  const normalizedInitialLocale = useMemo(
    () => normalizeLocale(initialLocale),
    [initialLocale],
  );

  const [locale, setLocale] = useState<AppLocale>(
    normalizedInitialLocale ?? DEFAULT_LOCALE,
  );
  const copy = useMemo(() => getAppCopy(locale), [locale]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const response = await fetch("/api/settings/language", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ locale }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || copy.common.error);
      }

      setSuccess(data.message || copy.settings.saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.common.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.98),rgba(7,12,24,0.96))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
        <div className="mb-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">
            {copy.common.language}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            {copy.settings.languageTitle}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
            {copy.settings.languageDescription}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {LANGUAGE_OPTIONS.map((option) => {
            const active = locale === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setLocale(option.value)}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  active
                    ? "border-cyan-300/55 bg-cyan-300/10 shadow-[0_0_35px_rgba(34,211,238,0.12)]"
                    : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-white">
                    {option.nativeLabel}
                  </span>
                  <span
                    className={`h-3 w-3 rounded-full ${
                      active
                        ? "bg-cyan-200 shadow-[0_0_18px_rgba(103,232,249,0.75)]"
                        : "bg-white/18"
                    }`}
                  />
                </div>
                <p className="mt-3 text-xs leading-5 text-white/55">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-[50px] items-center justify-center rounded-2xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95 disabled:cursor-wait disabled:opacity-80"
          >
            {loading ? copy.common.saving : copy.common.saveLanguage}
          </button>

          {success ? <p className="text-sm text-emerald-300">{success}</p> : null}
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        </div>
      </section>
    </form>
  );
}
