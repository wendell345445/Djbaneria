import Link from "next/link";
import {
  SubscriptionPlan,
  SubscriptionStatus,
  UsageEventType,
} from "@/generated/prisma/enums";

import { isAdminEmail } from "@/lib/admin";
import {
  buildBillingSummary,
  getBillingPeriodRange,
  hasCreditCyclePaymentConfirmation,
  requiresCreditCyclePaymentConfirmation,
} from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { requireCurrentWorkspace } from "@/lib/workspace";

export default async function DashboardPage() {
  const workspace = await requireCurrentWorkspace();
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
    ? `${getPlanDisplayName(summary.plan)} Admin`
    : getPlanDisplayName(summary.plan);
  const usageLabel = isAdmin
    ? `${summary.usedThisMonth} / ∞`
    : `${summary.usedThisMonth} / ${summary.monthlyLimit}`;
  const remainingLabel = isAdmin
    ? "Ilimitado"
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
                Ação rápida
              </span>

              <h2 className="mt-4 text-[28px] font-semibold leading-tight text-white">
                Crie um banner profissional em poucos passos
              </h2>

              <p className="mt-3 text-[12px] leading-6 text-white/70">
                Preencha o briefing, gere o preview com IA e baixe a arte pronta
                sem complicação.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <QuickStep
                number="1"
                title="Preencha os dados"
                description="Título, nome do DJ, data e local do evento."
              />
              <QuickStep
                number="2"
                title="Gere o preview"
                description="A IA monta o banner no formato escolhido."
              />
              <QuickStep
                number="3"
                title="Baixe ou ajuste"
                description="Faça alterações e baixe a versão final."
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/dashboard/banners/new"
                className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95"
              >
                Criar banner agora
              </Link>

              <Link
                href="/dashboard/banners"
                className="inline-flex min-h-[52px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-5 text-sm font-medium text-white transition hover:bg-white/[0.08]"
              >
                Ir para meus banners
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <InfoCard
            title="Banners gerados"
            value={String(bannerCount)}
            helper="Total criado no workspace"
          />
          <InfoCard
            title="Créditos do período"
            value={usageLabel}
            helper={
              isAdmin
                ? "Conta admin com uso liberado"
                : "Consumo no ciclo atual"
            }
          />
          <InfoCard
            title="Restantes"
            value={remainingLabel}
            helper="Créditos disponíveis para novas gerações e alterações"
          />
        </div>
      </section>

      {isAdmin ? (
        <section className="mt-5 rounded-3xl border border-white/10 bg-gradient-to-br from-sky-400/8 to-violet-400/10 p-5">
          <p className="m-0 text-xs uppercase tracking-[0.2em] text-white/50">
            Modo teste admin
          </p>
          <p className="mt-2 text-sm leading-7 text-white/80">
            Esta conta está liberada para gerar banners sem limite de créditos
            durante os testes.
          </p>
        </section>
      ) : null}
    </main>
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

function getStatusLabel(status: SubscriptionStatus) {
  const labels: Record<SubscriptionStatus, string> = {
    TRIALING: "Teste ativo",
    ACTIVE: "Ativo",
    PAST_DUE: "Pagamento pendente",
    CANCELED: "Cancelado",
    EXPIRED: "Expirado",
  };

  return labels[status] ?? status;
}

function PlanUsageCard({
  plan,
  planLabel,
  usageLabel,
  remainingLabel,
  usagePercent,
  status,
  isAdmin,
}: {
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
            Plano atual
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
              {isPremium ? "Premium" : "Essencial"}
            </span>
          </div>
        </div>

        <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100">
          {isAdmin ? "Admin" : getStatusLabel(status)}
        </span>
      </div>

      <div className="relative z-10 mt-4 grid grid-cols-3 gap-2">
        <PlanMetric label="Plano" value={planLabel} />
        <PlanMetric label="Uso" value={usageLabel} />
        <PlanMetric label="Restantes" value={remainingLabel} highlight />
      </div>

      <div className="relative z-10 mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
        <div className="mb-2 flex items-center justify-between gap-3 text-[11px] text-white/55">
          <span>{isAdmin ? "Uso ilimitado para testes" : "Consumo do período"}</span>
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
