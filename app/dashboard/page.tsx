import Link from "next/link";
import {
  SubscriptionPlan,
  SubscriptionStatus,
  UsageEventType,
} from "@/generated/prisma/enums";

import { isAdminEmail } from "@/lib/admin";
import { normalizeLocale, type AppLocale } from "@/lib/i18n";
import {
  buildBillingSummary,
  getBillingPeriodRange,
  hasCreditCyclePaymentConfirmation,
  requiresCreditCyclePaymentConfirmation,
} from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { requireCurrentWorkspace } from "@/lib/workspace";

type DashboardPageCopy = {
  plan: {
    adminSuffix: string;
    unlimited: string;
    currentPlan: string;
    premium: string;
    essential: string;
    admin: string;
    metricPlan: string;
    metricUsage: string;
    metricRemaining: string;
    unlimitedTesting: string;
    periodConsumption: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
  };
  steps: Array<{
    number: string;
    title: string;
    description: string;
  }>;
  cards: {
    generatedTitle: string;
    generatedHelper: string;
    creditsTitle: string;
    creditsAdminHelper: string;
    creditsHelper: string;
    remainingTitle: string;
    remainingHelper: string;
  };
  adminNotice: {
    eyebrow: string;
    description: string;
  };
  status: Record<SubscriptionStatus, string>;
  plans: Record<SubscriptionPlan, string>;
};

const DASHBOARD_PAGE_COPY: Record<AppLocale, DashboardPageCopy> = {
  en: {
    plan: {
      adminSuffix: "Admin",
      unlimited: "Unlimited",
      currentPlan: "Current plan",
      premium: "Premium",
      essential: "Essential",
      admin: "Admin",
      metricPlan: "Plan",
      metricUsage: "Usage",
      metricRemaining: "Remaining",
      unlimitedTesting: "Unlimited usage for tests",
      periodConsumption: "Period consumption",
    },
    hero: {
      eyebrow: "Quick action",
      title: "Create a professional banner in a few steps",
      description:
        "Fill in the brief, generate the AI preview and download the final artwork without complication.",
      primaryCta: "Create banner now",
      secondaryCta: "Go to my banners",
    },
    steps: [
      {
        number: "1",
        title: "Fill in the details",
        description: "Title, DJ name, date and event location.",
      },
      {
        number: "2",
        title: "Generate the preview",
        description: "AI creates the banner in the selected format.",
      },
      {
        number: "3",
        title: "Download or adjust",
        description: "Make changes and download the final version.",
      },
    ],
    cards: {
      generatedTitle: "Generated banners",
      generatedHelper: "Total created in this workspace",
      creditsTitle: "Period credits",
      creditsAdminHelper: "Admin account with unrestricted usage",
      creditsHelper: "Usage in the current cycle",
      remainingTitle: "Remaining",
      remainingHelper: "Credits available for new generations and edits",
    },
    adminNotice: {
      eyebrow: "Admin test mode",
      description:
        "This account is allowed to generate banners without credit limits during tests.",
    },
    status: {
      TRIALING: "Trial active",
      ACTIVE: "Active",
      PAST_DUE: "Payment pending",
      CANCELED: "Canceled",
      EXPIRED: "Expired",
    },
    plans: {
      FREE: "Free",
      PRO: "Pro",
      PROFESSIONAL: "Professional",
      STUDIO: "Studio",
    },
  },
  "pt-BR": {
    plan: {
      adminSuffix: "Admin",
      unlimited: "Ilimitado",
      currentPlan: "Plano atual",
      premium: "Premium",
      essential: "Essencial",
      admin: "Admin",
      metricPlan: "Plano",
      metricUsage: "Uso",
      metricRemaining: "Restantes",
      unlimitedTesting: "Uso ilimitado para testes",
      periodConsumption: "Consumo do período",
    },
    hero: {
      eyebrow: "Ação rápida",
      title: "Crie um banner profissional em poucos passos",
      description:
        "Preencha o briefing, gere o preview com IA e baixe a arte pronta sem complicação.",
      primaryCta: "Criar banner agora",
      secondaryCta: "Ir para meus banners",
    },
    steps: [
      {
        number: "1",
        title: "Preencha os dados",
        description: "Título, nome do DJ, data e local do evento.",
      },
      {
        number: "2",
        title: "Gere o preview",
        description: "A IA monta o banner no formato escolhido.",
      },
      {
        number: "3",
        title: "Baixe ou ajuste",
        description: "Faça alterações e baixe a versão final.",
      },
    ],
    cards: {
      generatedTitle: "Banners gerados",
      generatedHelper: "Total criado no workspace",
      creditsTitle: "Créditos do período",
      creditsAdminHelper: "Conta admin com uso liberado",
      creditsHelper: "Consumo no ciclo atual",
      remainingTitle: "Restantes",
      remainingHelper: "Créditos disponíveis para novas gerações e alterações",
    },
    adminNotice: {
      eyebrow: "Modo teste admin",
      description:
        "Esta conta está liberada para gerar banners sem limite de créditos durante os testes.",
    },
    status: {
      TRIALING: "Teste ativo",
      ACTIVE: "Ativo",
      PAST_DUE: "Pagamento pendente",
      CANCELED: "Cancelado",
      EXPIRED: "Expirado",
    },
    plans: {
      FREE: "Free",
      PRO: "Pro",
      PROFESSIONAL: "Professional",
      STUDIO: "Studio",
    },
  },
  es: {
    plan: {
      adminSuffix: "Admin",
      unlimited: "Ilimitado",
      currentPlan: "Plan actual",
      premium: "Premium",
      essential: "Esencial",
      admin: "Admin",
      metricPlan: "Plan",
      metricUsage: "Uso",
      metricRemaining: "Restantes",
      unlimitedTesting: "Uso ilimitado para pruebas",
      periodConsumption: "Consumo del período",
    },
    hero: {
      eyebrow: "Acción rápida",
      title: "Crea un banner profesional en pocos pasos",
      description:
        "Completa el briefing, genera la vista previa con IA y descarga el arte final sin complicaciones.",
      primaryCta: "Crear banner ahora",
      secondaryCta: "Ir a mis banners",
    },
    steps: [
      {
        number: "1",
        title: "Completa los datos",
        description: "Título, nombre del DJ, fecha y lugar del evento.",
      },
      {
        number: "2",
        title: "Genera la vista previa",
        description: "La IA crea el banner en el formato seleccionado.",
      },
      {
        number: "3",
        title: "Descarga o ajusta",
        description: "Haz cambios y descarga la versión final.",
      },
    ],
    cards: {
      generatedTitle: "Banners generados",
      generatedHelper: "Total creado en el workspace",
      creditsTitle: "Créditos del período",
      creditsAdminHelper: "Cuenta admin con uso liberado",
      creditsHelper: "Consumo en el ciclo actual",
      remainingTitle: "Restantes",
      remainingHelper: "Créditos disponibles para nuevas generaciones y ediciones",
    },
    adminNotice: {
      eyebrow: "Modo prueba admin",
      description:
        "Esta cuenta puede generar banners sin límite de créditos durante las pruebas.",
    },
    status: {
      TRIALING: "Prueba activa",
      ACTIVE: "Activo",
      PAST_DUE: "Pago pendiente",
      CANCELED: "Cancelado",
      EXPIRED: "Expirado",
    },
    plans: {
      FREE: "Free",
      PRO: "Pro",
      PROFESSIONAL: "Professional",
      STUDIO: "Studio",
    },
  },
};

export default async function DashboardPage() {
  const workspace = await requireCurrentWorkspace();
  const locale = normalizeLocale(workspace.user?.preferredLocale);
  const copy = DASHBOARD_PAGE_COPY[locale];
  const now = new Date();
  const billingPeriod = getBillingPeriodRange({
    providerSubscriptionId: workspace.subscription?.providerSubscriptionId,
    currentPeriodStart: workspace.subscription?.currentPeriodStart,
    currentPeriodEnd: workspace.subscription?.currentPeriodEnd,
    now,
  });

  const currentPlan = workspace.subscription?.plan || SubscriptionPlan.FREE;
  const requiresPaymentConfirmation = requiresCreditCyclePaymentConfirmation({
    plan: currentPlan,
    providerSubscriptionId: workspace.subscription?.providerSubscriptionId,
    currentPeriodStart: workspace.subscription?.currentPeriodStart,
    currentPeriodEnd: workspace.subscription?.currentPeriodEnd,
  });

  const [bannerCount, usageEvents] = await Promise.all([
    prisma.banner.count({
      where: { workspaceId: workspace.id },
    }),
    prisma.usageEvent.findMany({
      where: {
        workspaceId: workspace.id,
        createdAt: { gte: billingPeriod.start, lt: billingPeriod.end },
        type: {
          in: [
            UsageEventType.BANNER_GENERATION,
            UsageEventType.BANNER_EDIT,
            UsageEventType.BANNER_VARIATION,
          ],
        },
      },
      select: {
        units: true,
        createdAt: true,
        metadata: true,
      },
    }),
  ]);

  const summary = buildBillingSummary({
    plan: currentPlan,
    status: workspace.subscription?.status || SubscriptionStatus.TRIALING,
    usageEvents,
    requiresPaymentConfirmation,
    creditCyclePaymentConfirmed: hasCreditCyclePaymentConfirmation(usageEvents),
  });

  const isAdmin = isAdminEmail(workspace.user?.email);
  const planLabel = isAdmin
    ? `${getPlanDisplayName(summary.plan, copy)} ${copy.plan.adminSuffix}`
    : getPlanDisplayName(summary.plan, copy);
  const usageLabel = isAdmin
    ? `${summary.usedThisMonth} / ∞`
    : `${summary.usedThisMonth} / ${summary.monthlyLimit}`;
  const remainingLabel = isAdmin
    ? copy.plan.unlimited
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
    <main className="mx-auto max-w-[1320px] px-5 py-7">
      <div className="mb-7 flex justify-center xl:justify-end">
        <div className="w-full xl:max-w-[460px]">
          <PlanUsageCard
            copy={copy}
            plan={summary.plan}
            planLabel={planLabel}
            usageLabel={usageLabel}
            remainingLabel={remainingLabel}
            usagePercent={usagePercent}
            status={summary.status}
            isAdmin={isAdmin}
          />
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
        <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.98),rgba(7,12,24,0.96))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-sky-400/10 blur-3xl" />
          <div className="absolute -bottom-14 left-8 h-44 w-44 rounded-full bg-violet-400/10 blur-3xl" />

          <div className="relative z-10 flex h-full flex-col justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-sky-300/15 bg-sky-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-sky-100">
                {copy.hero.eyebrow}
              </span>

              <h2 className="mt-4 text-[28px] font-semibold leading-tight text-white">
                {copy.hero.title}
              </h2>

              <p className="mt-3 text-[12px] leading-6 text-white/70">
                {copy.hero.description}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {copy.steps.map((step) => (
                <QuickStep
                  key={step.number}
                  number={step.number}
                  title={step.title}
                  description={step.description}
                />
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/dashboard/banners/new"
                className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95"
              >
                {copy.hero.primaryCta}
              </Link>

              <Link
                href="/dashboard/banners"
                className="inline-flex min-h-[52px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-5 text-sm font-medium text-white transition hover:bg-white/[0.08]"
              >
                {copy.hero.secondaryCta}
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <InfoCard
            title={copy.cards.generatedTitle}
            value={String(bannerCount)}
            helper={copy.cards.generatedHelper}
          />
          <InfoCard
            title={copy.cards.creditsTitle}
            value={usageLabel}
            helper={
              isAdmin ? copy.cards.creditsAdminHelper : copy.cards.creditsHelper
            }
          />
          <InfoCard
            title={copy.cards.remainingTitle}
            value={remainingLabel}
            helper={copy.cards.remainingHelper}
          />
        </div>
      </section>

      {isAdmin ? (
        <section className="mt-5 rounded-3xl border border-white/10 bg-gradient-to-br from-sky-400/8 to-violet-400/10 p-5">
          <p className="m-0 text-xs uppercase tracking-[0.2em] text-white/50">
            {copy.adminNotice.eyebrow}
          </p>
          <p className="mt-2 text-sm leading-7 text-white/80">
            {copy.adminNotice.description}
          </p>
        </section>
      ) : null}
    </main>
  );
}

function getPlanDisplayName(plan: SubscriptionPlan, copy: DashboardPageCopy) {
  return copy.plans[plan] ?? plan;
}

function getStatusLabel(status: SubscriptionStatus, copy: DashboardPageCopy) {
  return copy.status[status] ?? status;
}

function PlanUsageCard({
  copy,
  plan,
  planLabel,
  usageLabel,
  remainingLabel,
  usagePercent,
  status,
  isAdmin,
}: {
  copy: DashboardPageCopy;
  plan: SubscriptionPlan;
  planLabel: string;
  usageLabel: string;
  remainingLabel: string;
  usagePercent: number;
  status: SubscriptionStatus;
  isAdmin: boolean;
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
            {copy.plan.currentPlan}
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
              {isPremium ? copy.plan.premium : copy.plan.essential}
            </span>
          </div>
        </div>

        <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100">
          {isAdmin ? copy.plan.admin : getStatusLabel(status, copy)}
        </span>
      </div>

      <div className="relative z-10 mt-4 grid grid-cols-3 gap-2">
        <PlanMetric label={copy.plan.metricPlan} value={planLabel} />
        <PlanMetric label={copy.plan.metricUsage} value={usageLabel} />
        <PlanMetric
          label={copy.plan.metricRemaining}
          value={remainingLabel}
          highlight
        />
      </div>

      <div className="relative z-10 mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
        <div className="mb-2 flex items-center justify-between gap-3 text-[11px] text-white/55">
          <span>
            {isAdmin ? copy.plan.unlimitedTesting : copy.plan.periodConsumption}
          </span>
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

function QuickStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
      <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-sm font-semibold text-white">
        {number}
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/60">{description}</p>
    </div>
  );
}

function InfoCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,28,0.96),rgba(5,10,20,0.94))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
        {title}
      </p>
      <h3 className="mt-2 text-2xl font-semibold text-white">{value}</h3>
      <p className="mt-2 text-sm leading-6 text-white/60">{helper}</p>
    </div>
  );
}
