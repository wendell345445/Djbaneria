import Link from "next/link";
import {
  ArrowRight,
  Download,
  Gift,
  Lock,
  Music2,
  Sparkles,
} from "lucide-react";

import { SubscriptionPlan, SubscriptionStatus } from "@/generated/prisma/enums";
import { isAdminEmail } from "@/lib/admin";
import { normalizeLocale, type SupportedLocale } from "@/lib/i18n";
import { requireCurrentWorkspace } from "@/lib/workspace";

export const dynamic = "force-dynamic";

const HOUSE_REMIX_DRIVE_URL =
  process.env.NEXT_PUBLIC_BONUS_DRIVE_URL ||
  "https://drive.google.com/drive/folders/17b9jQV-ulo7veDE3xWHUd8AyD8BDVI2r?usp=sharing";

const FLASHBACK_REMIX_DRIVE_URL =
  process.env.NEXT_PUBLIC_FLASHBACK_BONUS_DRIVE_URL ||
  "https://drive.google.com/drive/folders/1p-EcyVnavND6Sar9mhVWHWPgPuP-0xCi?usp=sharing";

type BonusCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  accessGranted: string;
  accessLocked: string;
  activePlan: string;
  choosePlan: string;
  backDashboard: string;
  securityNote: string;
  cards: Array<{
    key: "house" | "flashback";
    badge: string;
    title: string;
    description: string;
    tracks: string;
    cta: string;
    lockedCta: string;
    valueLabel: string;
  }>;
};

function getBonusCopy(locale: SupportedLocale): BonusCopy {
  if (locale === "pt-BR") {
    return {
      eyebrow: "Bônus exclusivo",
      title: "Baixe seus packs de remix",
      subtitle:
        "Acesse os bônus liberados para assinantes do DJ Visuals AI. Use os packs para sets, conteúdos, ideias de promo e drops de alta energia.",
      accessGranted: "Acesso liberado para sua assinatura",
      accessLocked: "Este bônus é liberado para assinantes ativos.",
      activePlan: "Plano atual",
      choosePlan: "Escolher plano",
      backDashboard: "Voltar ao dashboard",
      securityNote:
        "Esta página fica dentro do seu dashboard. Apenas usuários autenticados conseguem acessar esta área.",
      cards: [
        {
          key: "house",
          badge: "House bonus",
          title: "100 House Remix Music Pack",
          description:
            "Pack com 100 remixes de House Music para DJs que querem mais energia criativa em sets, Reels, Stories e materiais promocionais.",
          tracks: "100 remix tracks",
          cta: "Baixar House Remix Pack",
          lockedCta: "Assine para baixar",
          valueLabel: "Included bonus",
        },
        {
          key: "flashback",
          badge: "Flashback bonus",
          title: "100 Flashback Remix Music Pack",
          description:
            "Pack com remixes flashback exclusivos para criar momentos nostálgicos, sets comerciais e conteúdos com apelo mais amplo.",
          tracks: "100 flashback remixes",
          cta: "Baixar Flashback Remix Pack",
          lockedCta: "Assine para baixar",
          valueLabel: "New bonus",
        },
      ],
    };
  }

  if (locale === "es") {
    return {
      eyebrow: "Bono exclusivo",
      title: "Descarga tus remix packs",
      subtitle:
        "Accede a los bonos liberados para suscriptores de DJ Visuals AI. Usa los packs para sets, contenido, ideas promocionales y drops de alta energía.",
      accessGranted: "Acceso liberado para tu suscripción",
      accessLocked: "Este bono está disponible para suscriptores activos.",
      activePlan: "Plan actual",
      choosePlan: "Elegir plan",
      backDashboard: "Volver al dashboard",
      securityNote:
        "Esta página está dentro de tu dashboard. Solo usuarios autenticados pueden acceder a esta área.",
      cards: [
        {
          key: "house",
          badge: "House bonus",
          title: "100 House Remix Music Pack",
          description:
            "Pack con 100 remixes de House Music para DJs que quieren más energía creativa para sets, Reels, Stories y material promocional.",
          tracks: "100 remix tracks",
          cta: "Descargar House Remix Pack",
          lockedCta: "Suscríbete para descargar",
          valueLabel: "Included bonus",
        },
        {
          key: "flashback",
          badge: "Flashback bonus",
          title: "100 Flashback Remix Music Pack",
          description:
            "Pack con remixes flashback exclusivos para crear momentos nostálgicos, sets comerciales y contenido con mayor alcance.",
          tracks: "100 flashback remixes",
          cta: "Descargar Flashback Remix Pack",
          lockedCta: "Suscríbete para descargar",
          valueLabel: "New bonus",
        },
      ],
    };
  }

  return {
    eyebrow: "Exclusive bonus",
    title: "Download your remix packs",
    subtitle:
      "Access the subscriber bonuses included with DJ Visuals AI. Use these packs for sets, content ideas, promo planning, and high-energy social drops.",
    accessGranted: "Access unlocked for your subscription",
    accessLocked: "This bonus is available for active subscribers.",
    activePlan: "Current plan",
    choosePlan: "Choose a plan",
    backDashboard: "Back to dashboard",
    securityNote:
      "This page is inside your dashboard, so only signed-in users can access this area.",
    cards: [
      {
        key: "house",
        badge: "House bonus",
        title: "100 House Remix Music Pack",
        description:
          "A 100-track House remix pack for DJs who want more creative fuel for sets, Reels, Stories, and promotional content.",
        tracks: "100 remix tracks",
        cta: "Download House Remix Pack",
        lockedCta: "Subscribe to download",
        valueLabel: "Included bonus",
      },
      {
        key: "flashback",
        badge: "Flashback bonus",
        title: "100 Flashback Remix Music Pack",
        description:
          "An exclusive flashback remix pack for nostalgic moments, commercial sets, wider-audience drops, and high-energy content.",
        tracks: "100 flashback remixes",
        cta: "Download Flashback Remix Pack",
        lockedCta: "Subscribe to download",
        valueLabel: "New bonus",
      },
    ],
  };
}

function isActivePaidSubscription(params: {
  plan: SubscriptionPlan;
  status?: SubscriptionStatus | null;
  isAdmin: boolean;
}) {
  if (params.isAdmin) return true;
  if (params.plan === SubscriptionPlan.FREE) return false;

  return (
    params.status === SubscriptionStatus.ACTIVE ||
    params.status === SubscriptionStatus.TRIALING
  );
}

function formatPlanName(plan: SubscriptionPlan) {
  return `${plan.charAt(0)}${plan.slice(1).toLowerCase()}`;
}

function BonusCard({
  card,
  href,
  canDownload,
}: {
  card: BonusCopy["cards"][number];
  href: string;
  canDownload: boolean;
}) {
  const isFlashback = card.key === "flashback";
  const Icon = isFlashback ? Music2 : Sparkles;

  return (
    <article
      className={`bonus-card bonus-corner relative overflow-hidden border p-5 sm:p-6 ${
        isFlashback ? "bonus-card-flashback" : ""
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--cx)] to-[var(--cv)]" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-violet-400/12 blur-3xl" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="bonus-chip bonus-mono">● {card.badge}</span>
          <h2 className="bonus-orb mt-4 text-[22px] font-black uppercase leading-tight tracking-[-0.04em] text-white sm:text-[30px]">
            {card.title}
          </h2>
        </div>

        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-cyan-300/28 bg-cyan-300/10 text-cyan-200 shadow-[0_0_34px_rgba(0,245,255,0.18)]">
          <Icon size={24} />
        </div>
      </div>

      <p className="relative z-10 mt-4 text-sm leading-7 text-white/62 sm:text-[15px]">
        {card.description}
      </p>

      <div className="relative z-10 mt-5 grid gap-3 sm:grid-cols-2">
        <div className="border border-white/10 bg-white/[0.035] px-4 py-3">
          <p className="bonus-mono text-[8px] uppercase tracking-[0.18em] text-white/42">
            Pack size
          </p>
          <p className="mt-1 text-sm font-bold text-white">{card.tracks}</p>
        </div>

        <div className="border border-emerald-300/18 bg-emerald-300/[0.055] px-4 py-3">
          <p className="bonus-mono text-[8px] uppercase tracking-[0.18em] text-emerald-200/70">
            Status
          </p>
          <p className="mt-1 text-sm font-bold text-emerald-100">
            {card.valueLabel}
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-6">
        {canDownload ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="bonus-cta inline-flex min-h-[52px] w-full items-center justify-center gap-2 px-5 text-center"
          >
            <Download size={16} />
            {card.cta}
          </a>
        ) : (
          <Link
            href="/dashboard/billing"
            className="bonus-cta bonus-cta-locked inline-flex min-h-[52px] w-full items-center justify-center gap-2 px-5 text-center"
          >
            <Lock size={16} />
            {card.lockedCta}
          </Link>
        )}
      </div>
    </article>
  );
}

export default async function DashboardBonusPage() {
  const workspace = await requireCurrentWorkspace();
  const locale = normalizeLocale(workspace.user?.preferredLocale);
  const copy = getBonusCopy(locale);

  const currentPlan = workspace.subscription?.plan || SubscriptionPlan.FREE;
  const currentStatus =
    workspace.subscription?.status || SubscriptionStatus.TRIALING;
  const isAdmin = isAdminEmail(workspace.user?.email);
  const canDownload = isActivePaidSubscription({
    plan: currentPlan,
    status: currentStatus,
    isAdmin,
  });

  return (
    <main className="bonus-shell relative min-h-screen overflow-hidden px-4 py-5 text-white sm:px-6 lg:px-8 lg:py-8">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700;800;900&family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
            .bonus-shell {
              --cx: #00f5ff;
              --cv: #bf5fff;
              --cg: #5dffb8;
              background: #03040a;
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
            .bonus-panel,
            .bonus-card {
              background: linear-gradient(145deg, rgba(255,255,255,0.052), rgba(255,255,255,0.018));
              border-color: rgba(255,255,255,0.075);
              box-shadow: 0 24px 90px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.06);
            }
            .bonus-card-flashback {
              border-color: rgba(191,95,255,0.22);
              background: linear-gradient(145deg, rgba(191,95,255,0.075), rgba(255,255,255,0.018), rgba(0,245,255,0.035));
            }
            .bonus-corner::before,
            .bonus-corner::after {
              content: '';
              position: absolute;
              width: 24px;
              height: 24px;
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
              gap: 7px;
              border: 1px solid rgba(0,245,255,0.24);
              background: rgba(0,245,255,0.08);
              color: rgba(0,245,255,0.9);
              padding: 6px 9px;
              font-size: 8px;
              font-weight: 700;
              letter-spacing: 0.18em;
              line-height: 1;
              text-transform: uppercase;
            }
            .bonus-cta {
              position: relative;
              overflow: hidden;
              border: 1px solid rgba(0,245,255,0.82);
              background: var(--cx);
              color: #03040a;
              font-family: 'Orbitron', monospace;
              font-size: 10px;
              font-weight: 900;
              letter-spacing: 0.16em;
              text-transform: uppercase;
              box-shadow: 0 0 42px rgba(0,245,255,0.32), inset 0 1px 0 rgba(255,255,255,0.35);
              transition: transform .25s ease, box-shadow .25s ease;
            }
            .bonus-cta:hover {
              transform: translateY(-2px);
              box-shadow: 0 0 58px rgba(0,245,255,0.55), 0 20px 60px rgba(0,0,0,0.35);
            }
            .bonus-cta-locked {
              border-color: rgba(191,95,255,0.45);
              background: rgba(191,95,255,0.11);
              color: #e8d4ff;
              box-shadow: inset 0 0 24px rgba(191,95,255,0.08);
            }
          `,
        }}
      />

      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(0,245,255,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(191,95,255,0.15),transparent_34%),linear-gradient(180deg,#050712,#03040a_58%,#010208)]" />
      <div className="bonus-grid pointer-events-none fixed inset-0 -z-10 opacity-40" />

      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="bonus-chip bonus-mono">● {copy.eyebrow}</span>
            <h1 className="bonus-orb mt-4 text-[30px] font-black uppercase leading-tight tracking-[-0.05em] text-white sm:text-[48px]">
              {copy.title}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/62 sm:text-base">
              {copy.subtitle}
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex min-h-[42px] items-center justify-center gap-2 border border-white/10 bg-white/[0.035] px-4 text-xs font-bold uppercase tracking-[0.14em] text-white/62 transition hover:border-cyan-300/24 hover:text-white"
          >
            {copy.backDashboard}
            <ArrowRight size={13} />
          </Link>
        </div>

        <section className="bonus-panel bonus-corner relative mb-5 overflow-hidden border p-4 sm:mb-6 sm:p-5">
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-cyan-300/24 bg-cyan-300/10 text-cyan-200">
                {canDownload ? <Gift size={20} /> : <Lock size={20} />}
              </div>
              <div>
                <p className="bonus-orb text-sm font-bold uppercase tracking-[0.1em] text-white">
                  {canDownload ? copy.accessGranted : copy.accessLocked}
                </p>
                <p className="mt-1 text-xs leading-5 text-white/54">
                  {copy.securityNote}
                </p>
              </div>
            </div>

            <div className="border border-white/10 bg-white/[0.035] px-4 py-3 text-left sm:text-right">
              <p className="bonus-mono text-[8px] uppercase tracking-[0.16em] text-white/42">
                {copy.activePlan}
              </p>
              <p className="bonus-orb mt-1 text-lg font-black uppercase text-cyan-100">
                {isAdmin ? "Admin" : formatPlanName(currentPlan)}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <BonusCard
            card={copy.cards[0]}
            href={HOUSE_REMIX_DRIVE_URL}
            canDownload={canDownload}
          />
          <BonusCard
            card={copy.cards[1]}
            href={FLASHBACK_REMIX_DRIVE_URL}
            canDownload={canDownload}
          />
        </section>

        {!canDownload ? (
          <div className="mt-6 flex flex-col items-center justify-center gap-3 border border-violet-300/18 bg-violet-300/[0.055] p-5 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-sm leading-6 text-white/66">
              {copy.accessLocked}
            </p>
            <Link
              href="/dashboard/billing"
              className="bonus-cta bonus-cta-locked inline-flex min-h-[48px] w-full items-center justify-center gap-2 px-5 sm:w-auto"
            >
              {copy.choosePlan}
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}
