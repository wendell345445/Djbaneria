import {
  SubscriptionPlan,
  SubscriptionStatus,
  UsageEventType,
} from "@/generated/prisma/enums";

import { isAdminEmail } from "@/lib/admin";
import { NewBannerForm } from "@/components/new-banner-form";
import {
  buildBillingSummary,
  getBillingPeriodRange,
  hasCreditCyclePaymentConfirmation,
  requiresCreditCyclePaymentConfirmation,
} from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { normalizeLocale, type AppLocale } from "@/lib/i18n";
import { requireCurrentWorkspace } from "@/lib/workspace";

export const dynamic = "force-dynamic";

const newBannerPageCopy = {
  "pt-BR": {
    unlimited: "Ilimitado",
    currentPlan: "Plano atual",
    plan: "Plano",
    usage: "Uso",
    remaining: "Restantes",
    premium: "Premium",
    essential: "Essencial",
    admin: "Admin",
    unlimitedTestUsage: "Uso ilimitado para testes",
    periodUsage: "Consumo do período",
    statuses: {
      TRIALING: "Teste ativo",
      ACTIVE: "Ativo",
      PAST_DUE: "Pagamento pendente",
      CANCELED: "Cancelado",
      EXPIRED: "Expirado",
    },
    adminTestMode: "Modo teste admin",
    adminDescription:
      "Esta conta está liberada para gerar banners sem limite de créditos durante os testes.",
    verificationPending: "Verificação pendente",
    verifyTitle: "Confirme seu e-mail para liberar a geração",
    verifyDescriptionStart:
      "Para proteger os créditos grátis contra abuso, confirme o código enviado para",
    verifyDescriptionEnd:
      "Depois disso, você poderá gerar seus banners normalmente.",
    verifyButton: "Confirmar e-mail",
  },
  en: {
    unlimited: "Unlimited",
    currentPlan: "Current plan",
    plan: "Plan",
    usage: "Usage",
    remaining: "Remaining",
    premium: "Premium",
    essential: "Essential",
    admin: "Admin",
    unlimitedTestUsage: "Unlimited test usage",
    periodUsage: "Period usage",
    statuses: {
      TRIALING: "Trial active",
      ACTIVE: "Active",
      PAST_DUE: "Payment pending",
      CANCELED: "Canceled",
      EXPIRED: "Expired",
    },
    adminTestMode: "Admin test mode",
    adminDescription:
      "This account can generate banners without credit limits during testing.",
    verificationPending: "Verification pending",
    verifyTitle: "Confirm your email to unlock generation",
    verifyDescriptionStart:
      "To protect free credits from abuse, confirm the code sent to",
    verifyDescriptionEnd:
      "After that, you will be able to generate your banners normally.",
    verifyButton: "Confirm email",
  },
  es: {
    unlimited: "Ilimitado",
    currentPlan: "Plan actual",
    plan: "Plan",
    usage: "Uso",
    remaining: "Restantes",
    premium: "Premium",
    essential: "Esencial",
    admin: "Admin",
    unlimitedTestUsage: "Uso ilimitado para pruebas",
    periodUsage: "Consumo del período",
    statuses: {
      TRIALING: "Prueba activa",
      ACTIVE: "Activo",
      PAST_DUE: "Pago pendiente",
      CANCELED: "Cancelado",
      EXPIRED: "Expirado",
    },
    adminTestMode: "Modo de prueba admin",
    adminDescription:
      "Esta cuenta está liberada para generar banners sin límite de créditos durante las pruebas.",
    verificationPending: "Verificación pendiente",
    verifyTitle: "Confirma tu email para liberar la generación",
    verifyDescriptionStart:
      "Para proteger los créditos gratis contra abuso, confirma el código enviado a",
    verifyDescriptionEnd:
      "Después de eso, podrás generar tus banners normalmente.",
    verifyButton: "Confirmar email",
  },
} as const;

type NewBannerPageCopy = (typeof newBannerPageCopy)[AppLocale];

export default async function NewBannerPage() {
  const workspace = await requireCurrentWorkspace();

  const userLanguage = await prisma.user.findUnique({
    where: { id: workspace.userId },
    select: { preferredLocale: true },
  });

  const locale = normalizeLocale(
    userLanguage?.preferredLocale ?? workspace.user?.preferredLocale,
  );
  const copy = newBannerPageCopy[locale];
  const now = new Date();
  const currentPlan = workspace.subscription?.plan || SubscriptionPlan.FREE;

  const billingPeriod = getBillingPeriodRange({
    providerSubscriptionId: workspace.subscription?.providerSubscriptionId,
    currentPeriodStart: workspace.subscription?.currentPeriodStart,
    currentPeriodEnd: workspace.subscription?.currentPeriodEnd,
    now,
  });

  const requiresPaymentConfirmation = requiresCreditCyclePaymentConfirmation({
    plan: currentPlan,
    providerSubscriptionId: workspace.subscription?.providerSubscriptionId,
    currentPeriodStart: workspace.subscription?.currentPeriodStart,
    currentPeriodEnd: workspace.subscription?.currentPeriodEnd,
  });

  const usageEvents = await prisma.usageEvent.findMany({
    where: {
      workspaceId: workspace.id,
      createdAt: {
        gte: billingPeriod.start,
        lt: billingPeriod.end,
      },
      type: {
        in: [
          UsageEventType.BANNER_GENERATION,
          UsageEventType.BANNER_EDIT,
          UsageEventType.BANNER_VARIATION,
        UsageEventType.BANNER_MOTION_RENDER,
],
      },
    },
    select: {
      units: true,
      createdAt: true,
      metadata: true,
    },
  });

  const summary = buildBillingSummary({
    plan: currentPlan,
    status: workspace.subscription?.status || SubscriptionStatus.TRIALING,
    usageEvents,
    requiresPaymentConfirmation,
    creditCyclePaymentConfirmed: hasCreditCyclePaymentConfirmation(usageEvents),
  });

  const isAdmin = isAdminEmail(workspace.user?.email);
  const planLabel = isAdmin
    ? `${getPlanDisplayName(summary.plan)} ${copy.admin}`
    : getPlanDisplayName(summary.plan);
  const usageLabel = isAdmin
    ? `${summary.usedThisMonth} / ∞`
    : `${summary.usedThisMonth} / ${summary.monthlyLimit}`;
  const remainingLabel = isAdmin
    ? copy.unlimited
    : String(summary.remainingCredits);
  const usagePercent = isAdmin
    ? 100
    : summary.monthlyLimit > 0
      ? Math.min(
          100,
          Math.round((summary.usedThisMonth / summary.monthlyLimit) * 100),
        )
      : 0;

  return (
    <main className="new-banner-root relative min-h-screen overflow-hidden px-4 pb-10 pt-4 text-white sm:px-6 lg:px-8 lg:py-8">
      <NewBannerSalesStyle />
      <div className="pointer-events-none absolute inset-0 z-0 nb-grid" />
      <div className="pointer-events-none absolute left-[-130px] top-[-120px] z-0 h-[320px] w-[320px] rounded-full bg-[rgba(0,245,255,0.15)] blur-[95px] nb-float-a" />
      <div className="pointer-events-none absolute right-[-170px] top-[24%] z-0 h-[360px] w-[360px] rounded-full bg-[rgba(191,95,255,0.16)] blur-[105px] nb-float-b" />
      <div className="pointer-events-none absolute bottom-[-190px] left-[22%] z-0 h-[360px] w-[360px] rounded-full bg-[rgba(255,45,107,0.10)] blur-[115px]" />

      <div className="relative z-10 mx-auto w-full max-w-[1320px]">
      {!isAdmin && !workspace.user?.emailVerifiedAt ? (
        <EmailVerificationRequiredCard
          email={workspace.user?.email || ""}
          copy={copy}
        />
      ) : (
        <NewBannerForm
          key={locale}
          currentPlan={summary.plan}
          isAdmin={isAdmin}
          canGenerateBanner={isAdmin || summary.canGenerateBanner}
          initialRemainingCredits={isAdmin ? null : summary.remainingCredits}
          locale={locale}
        />
      )}

      {isAdmin ? (
        <section className="nb-panel mt-5 p-5">
          <p className="m-0 text-xs uppercase tracking-[0.2em] text-white/50">
            {copy.adminTestMode}
          </p>
          <p className="mt-2 text-sm leading-7 text-white/80">
            {copy.adminDescription}
          </p>
        </section>
      ) : null}
      </div>
    </main>
  );
}

function NewBannerSalesStyle() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

          .new-banner-root {
            --cx: #00F5FF;
            --cv: #BF5FFF;
            --ce: #FF2D6B;
            --cg: #00FF9F;
            background:
              radial-gradient(circle at 18% 0%, rgba(0,245,255,0.10), transparent 30%),
              radial-gradient(circle at 88% 18%, rgba(191,95,255,0.13), transparent 34%),
              linear-gradient(180deg, #03040A 0%, #060816 45%, #03040A 100%);
            color: #E8EAF0;
            font-family: 'DM Sans', sans-serif;
          }

          .nb-orb { font-family: 'Orbitron', monospace; }
          .nb-mono { font-family: 'Space Mono', monospace; }

          .nb-grid {
            background-image:
              linear-gradient(rgba(0,245,255,0.018) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,245,255,0.018) 1px, transparent 1px);
            background-size: 42px 42px;
            mask-image: linear-gradient(to bottom, black, rgba(0,0,0,0.74), transparent);
          }

          @keyframes nbFloatA {
            0%,100% { transform: translate(0,0) scale(1); }
            45% { transform: translate(32px,-18px) scale(1.05); }
            75% { transform: translate(-18px,18px) scale(0.98); }
          }

          @keyframes nbFloatB {
            0%,100% { transform: translate(0,0) scale(1); }
            45% { transform: translate(-24px,22px) scale(1.04); }
            75% { transform: translate(18px,-12px) scale(0.97); }
          }

          .nb-float-a { animation: nbFloatA 22s ease-in-out infinite; }
          .nb-float-b { animation: nbFloatB 28s ease-in-out infinite; }

          .nb-panel {
            position: relative;
            border: 1px solid rgba(0,245,255,0.16);
            background:
              linear-gradient(135deg, rgba(255,255,255,0.065), rgba(255,255,255,0.022)),
              radial-gradient(circle at top left, rgba(0,245,255,0.06), transparent 34%),
              rgba(3,4,10,0.78);
            box-shadow:
              0 22px 80px rgba(0,0,0,0.38),
              inset 0 1px 0 rgba(255,255,255,0.06);
            backdrop-filter: blur(18px);
          }

          .nb-panel::before,
          .nb-panel::after,
          .nb-inner-panel::before,
          .nb-inner-panel::after {
            content: '';
            position: absolute;
            width: 18px;
            height: 18px;
            pointer-events: none;
            opacity: 0.78;
          }

          .nb-panel::before,
          .nb-inner-panel::before {
            top: -1px;
            left: -1px;
            border-top: 2px solid var(--cx);
            border-left: 2px solid var(--cx);
          }

          .nb-panel::after,
          .nb-inner-panel::after {
            right: -1px;
            bottom: -1px;
            border-right: 2px solid var(--cv);
            border-bottom: 2px solid var(--cv);
          }

          .nb-inner-panel {
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.10);
            background:
              radial-gradient(circle at top left, rgba(0,245,255,0.04), transparent 34%),
              rgba(255,255,255,0.032);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
          }

          .nb-chip {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(0,245,255,0.24);
            background: rgba(0,245,255,0.08);
            color: var(--cx);
            font-family: 'Space Mono', monospace;
            font-size: 8px;
            font-weight: 700;
            letter-spacing: 0.14em;
            line-height: 1;
            padding: 8px 10px;
            text-transform: uppercase;
          }

          .nb-section-label {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .nb-section-label::before {
            content: '';
            display: block;
            width: 24px;
            height: 1px;
            background: var(--cx);
            box-shadow: 0 0 8px var(--cx);
          }

          .nb-input {
            background: rgba(3,4,10,0.62) !important;
            border-color: rgba(255,255,255,0.12) !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
          }

          .nb-input:focus {
            border-color: rgba(0,245,255,0.46) !important;
            box-shadow: 0 0 0 4px rgba(0,245,255,0.10), inset 0 1px 0 rgba(255,255,255,0.05) !important;
          }

          .nb-primary-btn {
            border: 1px solid var(--cx);
            background: var(--cx);
            color: #03040A;
            font-family: 'Space Mono', monospace;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            box-shadow: 0 0 30px rgba(0,245,255,0.28), 0 18px 46px rgba(0,0,0,0.32);
          }

          .nb-primary-btn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 0 40px rgba(0,245,255,0.42), 0 22px 60px rgba(0,0,0,0.38);
          }

          @media (max-width: 640px) {
            .nb-panel::before,
            .nb-panel::after,
            .nb-inner-panel::before,
            .nb-inner-panel::after {
              width: 14px;
              height: 14px;
            }
          }
        `,
      }}
    />
  );
}

function getPlanDisplayName(plan: SubscriptionPlan) {
  const labels: Record<SubscriptionPlan, string> = {
    FREE: "Free",
    PRO: "Pro",
    PROFESSIONAL: "Professional",
    STUDIO: "Studio",
  };

  return labels[plan] ?? plan;
}

function getStatusLabel(status: SubscriptionStatus, copy: NewBannerPageCopy) {
  return copy.statuses[status] ?? status;
}

function PlanUsageCard({
  plan,
  planLabel,
  usageLabel,
  remainingLabel,
  usagePercent,
  status,
  isAdmin,
  copy,
}: {
  plan: SubscriptionPlan;
  planLabel: string;
  usageLabel: string;
  remainingLabel: string;
  usagePercent: number;
  status: SubscriptionStatus;
  isAdmin: boolean;
  copy: NewBannerPageCopy;
}) {
  const isPremium =
    plan === SubscriptionPlan.PROFESSIONAL || plan === SubscriptionPlan.STUDIO;

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025))] p-4 shadow-[0_24px_90px_rgba(0,0,0,0.25)] backdrop-blur">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-sky-200/70 to-transparent" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-sky-300/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 left-8 h-28 w-28 rounded-full bg-violet-400/10 blur-3xl" />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
            {copy.currentPlan}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <strong className="text-xl font-semibold leading-none text-white">
              {planLabel}
            </strong>
            <span
              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                isPremium
                  ? "border-amber-200/30 bg-amber-200/10 text-amber-100"
                  : "border-sky-200/25 bg-sky-200/10 text-sky-100"
              }`}
            >
              {isPremium ? copy.premium : copy.essential}
            </span>
          </div>
        </div>

        <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100">
          {isAdmin ? copy.admin : getStatusLabel(status, copy)}
        </span>
      </div>

      <div className="relative z-10 mt-4 grid grid-cols-3 gap-2">
        <PlanMetric label={copy.plan} value={planLabel} />
        <PlanMetric label={copy.usage} value={usageLabel} />
        <PlanMetric label={copy.remaining} value={remainingLabel} highlight />
      </div>

      <div className="relative z-10 mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
        <div className="mb-2 flex items-center justify-between gap-3 text-[11px] text-white/55">
          <span>{isAdmin ? copy.unlimitedTestUsage : copy.periodUsage}</span>
          <strong className="text-white/85">
            {isAdmin ? "∞" : `${usagePercent}%`}
          </strong>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 transition-all duration-700"
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>
    </section>
  );
}

function PlanMetric({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border px-3 py-3 text-center ${
        highlight
          ? "border-sky-200/20 bg-sky-200/10"
          : "border-white/10 bg-white/[0.045]"
      }`}
    >
      <p className="m-0 text-[9px] uppercase tracking-[0.16em] text-white/42">
        {label}
      </p>
      <div className="mt-1.5 truncate text-[13px] font-semibold leading-none text-white">
        {value}
      </div>
    </div>
  );
}

function EmailVerificationRequiredCard({
  email,
  copy,
}: {
  email: string;
  copy: NewBannerPageCopy;
}) {
  return (
    <section className="relative overflow-hidden rounded-[30px] border border-amber-200/20 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.14),transparent_34%),linear-gradient(180deg,rgba(10,16,32,0.98),rgba(7,12,24,0.96))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="relative z-10 max-w-2xl">
        <span className="inline-flex rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-amber-100">
          {copy.verificationPending}
        </span>
        <h2 className="mt-4 text-2xl font-semibold leading-tight text-white">
          {copy.verifyTitle}
        </h2>
        <p className="mt-3 text-sm leading-7 text-white/70">
          {copy.verifyDescriptionStart}{" "}
          <strong className="text-white">{email}</strong>.{" "}
          {copy.verifyDescriptionEnd}
        </p>
        <a
          href={`/verify-email?email=${encodeURIComponent(email)}`}
          className="mt-5 inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95"
        >
          {copy.verifyButton}
        </a>
      </div>
    </section>
  );
}
