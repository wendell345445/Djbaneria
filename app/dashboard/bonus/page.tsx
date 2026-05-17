import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  Gift,
  Lock,
  Music2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { SubscriptionPlan, SubscriptionStatus } from "@/generated/prisma/enums";
import { isAdminEmail } from "@/lib/admin";
import { normalizeLocale, type SupportedLocale } from "@/lib/i18n";
import { requireCurrentWorkspace } from "@/lib/workspace";

const BONUS_DOWNLOAD_URL =
  process.env.NEXT_PUBLIC_BONUS_DRIVE_URL ||
  "https://drive.google.com/drive/folders/17b9jQV-ulo7veDE3xWHUd8AyD8BDVI2r?usp=sharing";

type BonusCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  unlocked: string;
  locked: string;
  downloadButton: string;
  choosePlanButton: string;
  driveNotConfigured: string;
  openBilling: string;
  includedTitle: string;
  includedItems: string[];
  howItWorksTitle: string;
  howItWorks: string[];
};

function getBonusCopy(locale: SupportedLocale): BonusCopy {
  if (locale === "pt-BR") {
    return {
      eyebrow: "Bônus exclusivo",
      title: "Baixe o pack com 100 House Remixes",
      subtitle:
        "Um bônus para assinantes ativos: 100 faixas remix house para inspirar sets, conteúdo e ideias promocionais.",
      unlocked: "Bônus liberado para sua assinatura",
      locked: "Disponível apenas para assinantes ativos",
      downloadButton: "Baixar bônus 100 House Remix",
      choosePlanButton: "Escolher um plano",
      driveNotConfigured:
        "Configure NEXT_PUBLIC_BONUS_DRIVE_URL na Vercel para liberar o botão de download.",
      openBilling: "Ver planos",
      includedTitle: "O que está incluído",
      includedItems: [
        "100 músicas/remixes house em um pack exclusivo",
        "Acesso via link seguro do Google Drive",
        "Bônus liberado para qualquer plano pago ativo",
      ],
      howItWorksTitle: "Como acessar",
      howItWorks: [
        "Mantenha uma assinatura paga ativa.",
        "Clique no botão de download nesta página.",
        "Abra o Google Drive e baixe o pack completo.",
      ],
    };
  }

  if (locale === "es") {
    return {
      eyebrow: "Bono exclusivo",
      title: "Descarga el pack con 100 House Remixes",
      subtitle:
        "Un bono para suscriptores activos: 100 tracks remix house para inspirar sets, contenido e ideas promocionales.",
      unlocked: "Bono liberado para tu suscripción",
      locked: "Disponible solo para suscriptores activos",
      downloadButton: "Descargar bono 100 House Remix",
      choosePlanButton: "Elegir un plan",
      driveNotConfigured:
        "Configura NEXT_PUBLIC_BONUS_DRIVE_URL en Vercel para liberar el botón de descarga.",
      openBilling: "Ver planes",
      includedTitle: "Qué incluye",
      includedItems: [
        "100 músicas/remixes house en un pack exclusivo",
        "Acceso por link seguro de Google Drive",
        "Bono liberado para cualquier plan pago activo",
      ],
      howItWorksTitle: "Cómo acceder",
      howItWorks: [
        "Mantén una suscripción paga activa.",
        "Haz clic en el botón de descarga en esta página.",
        "Abre Google Drive y descarga el pack completo.",
      ],
    };
  }

  return {
    eyebrow: "Exclusive bonus",
    title: "Download the 100 House Remix Pack",
    subtitle:
      "A subscriber-only bonus: 100 house remix tracks to fuel your sets, promo ideas, content planning, and high-energy social drops.",
    unlocked: "Bonus unlocked for your subscription",
    locked: "Available for active subscribers only",
    downloadButton: "Download 100 House Remix Pack",
    choosePlanButton: "Choose a plan",
    driveNotConfigured:
      "Set NEXT_PUBLIC_BONUS_DRIVE_URL in Vercel to enable the download button.",
    openBilling: "View plans",
    includedTitle: "What you get",
    includedItems: [
      "100 house remix tracks in one exclusive pack",
      "Secure Google Drive access link",
      "Unlocked for any active paid subscription",
    ],
    howItWorksTitle: "How to access",
    howItWorks: [
      "Keep an active paid subscription.",
      "Click the download button on this page.",
      "Open Google Drive and download the full pack.",
    ],
  };
}

function isPaidSubscriptionActive(
  plan?: SubscriptionPlan | null,
  status?: SubscriptionStatus | null,
) {
  if (!plan || plan === SubscriptionPlan.FREE) return false;

  return (
    status === SubscriptionStatus.ACTIVE ||
    status === SubscriptionStatus.TRIALING
  );
}

export default async function BonusPage() {
  const workspace = await requireCurrentWorkspace();
  const locale = normalizeLocale(workspace.user?.preferredLocale);
  const copy = getBonusCopy(locale);

  const isAdmin = isAdminEmail(workspace.user?.email);
  const hasAccess =
    isAdmin ||
    isPaidSubscriptionActive(
      workspace.subscription?.plan,
      workspace.subscription?.status,
    );

  const canDownload = hasAccess && Boolean(BONUS_DOWNLOAD_URL);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#03040A] px-4 py-5 text-white sm:px-6 lg:px-8 lg:py-8">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

            .bonus-shell {
              --cx: #00F5FF;
              --cv: #BF5FFF;
              --cg: #5DFFB8;
              --ce: #FF2D6B;
              font-family: 'DM Sans', sans-serif;
            }

            .bonus-orb { font-family: 'Orbitron', monospace; }
            .bonus-mono { font-family: 'Space Mono', monospace; }

            .bonus-grid {
              background-image:
                linear-gradient(rgba(0,245,255,0.052) 1px, transparent 1px),
                linear-gradient(90deg, rgba(191,95,255,0.045) 1px, transparent 1px);
              background-size: 44px 44px;
              mask-image: radial-gradient(circle at 50% 18%, black 0%, transparent 72%);
            }

            .bonus-panel {
              position: relative;
              overflow: hidden;
              border: 1px solid rgba(255,255,255,0.075);
              background: linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.018));
              border-radius: 0;
              box-shadow: 0 24px 90px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.06);
            }

            .bonus-panel::before {
              content: '';
              position: absolute;
              inset: 0 0 auto 0;
              height: 1px;
              background: linear-gradient(90deg, transparent, var(--cx), var(--cv), transparent);
              opacity: 0.7;
            }

            .bonus-corner::before,
            .bonus-corner::after {
              content: '';
              position: absolute;
              width: 26px;
              height: 26px;
              pointer-events: none;
              z-index: 2;
            }

            .bonus-corner::before {
              left: 0;
              top: 0;
              border-left: 1px solid rgba(0,245,255,0.62);
              border-top: 1px solid rgba(0,245,255,0.62);
            }

            .bonus-corner::after {
              right: 0;
              bottom: 0;
              border-right: 1px solid rgba(191,95,255,0.55);
              border-bottom: 1px solid rgba(191,95,255,0.55);
            }

            .bonus-chip {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              border: 1px solid rgba(0,245,255,0.26);
              background: rgba(0,245,255,0.08);
              padding: 6px 10px;
              font-family: 'Space Mono', monospace;
              font-size: 8px;
              font-weight: 700;
              letter-spacing: 0.18em;
              line-height: 1;
              text-transform: uppercase;
              color: rgba(0,245,255,0.92);
            }

            .bonus-cta {
              position: relative;
              min-height: 54px;
              overflow: hidden;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
              border-radius: 0;
              background: var(--cx);
              color: #03040A;
              font-family: 'Orbitron', monospace;
              font-size: 10px;
              font-weight: 800;
              letter-spacing: 0.16em;
              text-transform: uppercase;
              box-shadow: 0 0 42px rgba(0,245,255,0.42), inset 0 1px 0 rgba(255,255,255,0.32);
              transition: transform .25s ease, box-shadow .25s ease;
            }

            .bonus-cta:hover {
              transform: translateY(-2px);
              box-shadow: 0 0 58px rgba(0,245,255,0.64), 0 18px 54px rgba(0,0,0,0.42);
            }

            .bonus-cta-disabled {
              cursor: not-allowed;
              border: 1px solid rgba(255,255,255,0.10);
              background: rgba(255,255,255,0.045);
              color: rgba(255,255,255,0.36);
              box-shadow: none;
            }
          `,
        }}
      />

      <div className="bonus-shell relative mx-auto w-full max-w-7xl">
        <div className="bonus-grid pointer-events-none fixed inset-0 opacity-40" />
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,245,255,0.14),transparent_34%),radial-gradient(circle_at_top_right,rgba(191,95,255,0.14),transparent_36%),linear-gradient(180deg,#050712,#03040a_58%,#010208)]" />

        <div className="relative z-10">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/dashboard"
              className="bonus-mono text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-100/62 transition hover:text-cyan-100"
            >
              ← Dashboard
            </Link>

            <span className="bonus-chip">
              <Gift className="h-3.5 w-3.5" />
              {copy.eyebrow}
            </span>
          </div>

          <section className="bonus-panel bonus-corner p-5 sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-cyan-300/12 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -left-28 h-80 w-80 rounded-full bg-violet-400/14 blur-3xl" />

            <div className="relative z-10 grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
              <div>
                <div
                  className={`mb-5 inline-flex items-center gap-2 border px-3 py-2 text-[8px] font-bold uppercase tracking-[0.18em] ${
                    hasAccess
                      ? "border-emerald-300/24 bg-emerald-300/8 text-emerald-200"
                      : "border-rose-300/24 bg-rose-300/8 text-rose-200"
                  }`}
                >
                  {hasAccess ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Lock className="h-3.5 w-3.5" />
                  )}
                  {hasAccess ? copy.unlocked : copy.locked}
                </div>

                <h1 className="bonus-orb max-w-4xl text-[30px] font-black uppercase leading-[0.98] tracking-[-0.05em] text-white sm:text-[48px] lg:text-[64px]">
                  {copy.title}
                </h1>

                <p className="mt-5 max-w-2xl text-[15px] leading-7 text-white/68 sm:text-[17px]">
                  {copy.subtitle}
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  {canDownload ? (
                    <a
                      href={BONUS_DOWNLOAD_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="bonus-cta px-5 py-4"
                    >
                      <Download className="h-4 w-4" />
                      {copy.downloadButton}
                    </a>
                  ) : hasAccess ? (
                    <button
                      type="button"
                      disabled
                      className="bonus-cta bonus-cta-disabled px-5 py-4"
                    >
                      <Download className="h-4 w-4" />
                      {copy.downloadButton}
                    </button>
                  ) : (
                    <Link href="/dashboard/billing" className="bonus-cta px-5 py-4">
                      {copy.choosePlanButton}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}

                  {!hasAccess ? (
                    <Link
                      href="/dashboard/billing"
                      className="inline-flex min-h-[54px] items-center justify-center border border-white/10 bg-white/[0.035] px-5 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-white/72 transition hover:border-cyan-300/24 hover:text-white"
                    >
                      {copy.openBilling}
                    </Link>
                  ) : null}
                </div>

                {hasAccess && !BONUS_DOWNLOAD_URL ? (
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-amber-200/88">
                    {copy.driveNotConfigured}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-4">
                <div className="bonus-panel p-5 sm:p-6">
                  <div className="mb-5 flex items-center gap-4 border-b border-cyan-300/14 pb-5">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-cyan-100 shadow-[0_0_32px_rgba(0,245,255,0.18)]">
                      <Music2 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="bonus-mono text-[8px] font-bold uppercase tracking-[0.18em] text-cyan-100/72">
                        Bonus pack
                      </p>
                      <p className="mt-1 text-4xl font-black leading-none text-white">
                        100
                        <span className="ml-2 text-base font-semibold uppercase tracking-[0.12em] text-cyan-100/70">
                          tracks
                        </span>
                      </p>
                    </div>
                  </div>

                  <h2 className="bonus-orb text-lg font-bold uppercase tracking-[-0.02em] text-white">
                    {copy.includedTitle}
                  </h2>

                  <div className="mt-4 grid gap-3">
                    {copy.includedItems.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cg)]" />
                        <p className="text-sm leading-6 text-white/66">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bonus-panel p-5 sm:p-6">
                  <h2 className="bonus-orb text-lg font-bold uppercase tracking-[-0.02em] text-white">
                    {copy.howItWorksTitle}
                  </h2>

                  <div className="mt-4 grid gap-3">
                    {copy.howItWorks.map((item, index) => (
                      <div key={item} className="flex gap-3">
                        <span className="bonus-mono grid h-7 w-7 shrink-0 place-items-center border border-violet-300/22 bg-violet-300/8 text-[10px] font-bold text-violet-100">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <p className="pt-0.5 text-sm leading-6 text-white/66">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-emerald-300/18 bg-emerald-300/[0.055] p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cg)]" />
                    <p className="text-sm leading-6 text-white/68">
                      This page is inside your dashboard, so only signed-in users can access it.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
