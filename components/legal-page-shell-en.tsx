import Link from "next/link";
import type { ReactNode } from "react";

type LegalPageShellEnProps = {
  eyebrow: string;
  title: string;
  description: string;
  lastUpdated: string;
  children: ReactNode;
};

export function LegalPageShellEn({
  eyebrow,
  title,
  description,
  lastUpdated,
  children,
}: LegalPageShellEnProps) {
  return (
    <main className="min-h-screen bg-[#060816] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(168,85,247,0.12),transparent_26%),radial-gradient(circle_at_50%_100%,rgba(251,191,36,0.08),transparent_28%)]" />

      <header className="sticky top-0 z-30 border-b border-white/8 bg-[#060816]/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
          <Link href="/en" className="group">
            <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/80 transition group-hover:text-cyan-100">
              DJ Pro IA
            </p>
            <p className="mt-1 text-sm text-white/55">Legal center</p>
          </Link>

          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/terms"
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-white/75 transition hover:bg-white/[0.07] hover:text-white"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-white/75 transition hover:bg-white/[0.07] hover:text-white"
            >
              Privacy
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative z-10 mx-auto w-full max-w-6xl px-5 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.25em] text-cyan-200/75">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-[34px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[46px]">
            {title}
          </h1>
          <p className="mt-4 text-base leading-7 text-white/66">
            {description}
          </p>
          <p className="mt-5 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/60">
            Last updated: {lastUpdated}
          </p>
        </div>

        <article className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.96),rgba(7,12,24,0.98))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.3)] sm:p-8 lg:p-10">
          <div className="prose prose-invert max-w-none prose-headings:tracking-[-0.03em] prose-headings:text-white prose-p:leading-7 prose-p:text-white/70 prose-li:text-white/70 prose-strong:text-white prose-a:text-cyan-200 prose-hr:border-white/10">
            {children}
          </div>
        </article>
      </section>
    </main>
  );
}
