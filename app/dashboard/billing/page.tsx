import Link from "next/link";
import {
  SubscriptionPlan,
  SubscriptionStatus,
  UsageEventType,
} from "@/generated/prisma/enums";

import { BillingCheckoutButton } from "@/components/billing-checkout-button";
import { isAdminEmail } from "@/lib/admin";
import {
  buildBillingSummary,
  getBillingPeriodRange,
  hasCreditCyclePaymentConfirmation,
  requiresCreditCyclePaymentConfirmation,
} from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { isStripePaidPlan, isStripePriceConfigured } from "@/lib/stripe";
import { requireCurrentWorkspace } from "@/lib/workspace";

const planOrder = ["FREE", "PRO", "PROFESSIONAL", "STUDIO"] as const;

type PlanKey = (typeof planOrder)[number];

const planMeta: Record<
  PlanKey,
  {
    title: string;
    monthlyCredits: string;
    description: string;
    highlights: string[];
  }
> = {
  FREE: {
    title: "Free",
    monthlyCredits: "2 créditos/mês",
    description: "Ideal para testar a plataforma e criar as primeiras artes.",
    highlights: [
      "Geração rápida disponível",
      "Feed e Story liberados",
      "Perfeito para conhecer a plataforma",
    ],
  },
  PRO: {
    title: "Pro",
    monthlyCredits: "20 créditos/mês",
    description: "Plano equilibrado para DJs e criadores com uso recorrente.",
    highlights: [
      "Mais créditos mensais",
      "Qualidade rápida e equilibrada",
      "Bom para campanhas e eventos recorrentes",
    ],
  },
  PROFESSIONAL: {
    title: "Professional",
    monthlyCredits: "40 créditos/mês",
    description:
      "Para quem precisa de mais fôlego para gerar, ajustar e testar artes.",
    highlights: [
      "Mais créditos para produção recorrente",
      "Alta qualidade liberada",
      "Mais margem para alterações e refinamentos",
    ],
  },
  STUDIO: {
    title: "Studio",
    monthlyCredits: "80 créditos/mês",
    description: "Pensado para operação intensa e produção em maior volume.",
    highlights: [
      "Alto volume de criação",
      "Alta qualidade liberada",
      "Ótimo para operação profissional contínua",
    ],
  },
};

function getPlanRank(plan: string) {
  const index = planOrder.indexOf(plan as PlanKey);
  return index === -1 ? 0 : index;
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

export default async function BillingPage() {
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
      orderBy: { createdAt: "desc" },
      select: {
        type: true,
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
  const usageLabel = isAdmin
    ? `${summary.usedThisMonth} / ∞`
    : `${summary.usedThisMonth} / ${summary.monthlyLimit}`;
  const remainingLabel = isAdmin ? "Ilimitado" : String(summary.remainingCredits);
  const currentPlanRank = getPlanRank(String(summary.plan));
  const currentPlanMeta = planMeta[String(summary.plan) as PlanKey] ?? planMeta.FREE;
  const hasStripeCustomer = Boolean(workspace.subscription?.providerCustomerId);
  const hasPaidStripeSubscription = Boolean(
    workspace.subscription?.providerSubscriptionId &&
      workspace.subscription.plan !== SubscriptionPlan.FREE,
  );

  const generationUnits = usageEvents
    .filter((event) => String(event.type) === "BANNER_GENERATION")
    .reduce((total, event) => total + (event.units || 0), 0);
  const editUnits = usageEvents
    .filter((event) => String(event.type) === "BANNER_EDIT")
    .reduce((total, event) => total + (event.units || 0), 0);
  const variationUnits = usageEvents
    .filter((event) => String(event.type) === "BANNER_VARIATION")
    .reduce((total, event) => total + (event.units || 0), 0);

  return (
    <main className="mx-auto max-w-[1320px] px-5 py-7">
      <section className="mb-7">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/55">
              Assinatura
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white md:text-[34px]">
              Planos e créditos
            </h1>
          </div>

          {hasPaidStripeSubscription ? (
            <div className="w-full md:w-auto md:min-w-[230px]">
              <BillingCheckoutButton
                mode="portal"
                label="Gerenciar assinatura"
                className="inline-flex min-h-[46px] w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          {planOrder.map((planKey) => {
            const meta = planMeta[planKey];
            const isCurrent = String(summary.plan) === planKey;
            const isUpgrade = getPlanRank(planKey) > currentPlanRank;
            const isPaidPlan = isStripePaidPlan(planKey);
            const priceConfigured = isPaidPlan
              ? isStripePriceConfigured(planKey)
              : false;
            const isPremium =
              planKey === "PROFESSIONAL" || planKey === "STUDIO";

            return (
              <div
                key={planKey}
                className={`relative overflow-hidden rounded-[26px] border p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] ${
                  isCurrent
                    ? "border-sky-300/30 bg-sky-300/[0.08]"
                    : "border-white/10 bg-white/[0.035]"
                }`}
              >
                <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-sky-300/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-12 left-6 h-28 w-28 rounded-full bg-violet-400/10 blur-3xl" />

                <div className="relative z-10 flex min-h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/55">
                        {meta.title}
                      </p>
                      <h3 className="mt-2 text-[19px] font-semibold text-white">
                        {meta.monthlyCredits}
                      </h3>
                    </div>

                    {isCurrent ? (
                      <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-sky-100">
                        Atual
                      </span>
                    ) : isUpgrade ? (
                      <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-emerald-100">
                        Upgrade
                      </span>
                    ) : hasPaidStripeSubscription && isPaidPlan ? (
                      <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-amber-100">
                        Troca
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-3 text-sm leading-5 text-white/65">
                    {meta.description}
                  </p>

                  {isPremium ? (
                    <div className="mt-3 inline-flex w-fit rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100">
                      Alta qualidade inclusa
                    </div>
                  ) : null}

                  <div className="mt-4 grid gap-2">
                    {meta.highlights.map((highlight) => (
                      <div
                        key={highlight}
                        className="rounded-xl border border-white/8 bg-white/[0.035] px-3 py-2 text-sm text-white/75"
                      >
                        {highlight}
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-5">
                    {isCurrent ? (
                      <BillingCheckoutButton
                        mode={hasStripeCustomer && isPaidPlan ? "portal" : "disabled"}
                        label="Gerenciar assinatura"
                        disabledLabel="Plano em uso"
                        className="inline-flex min-h-[46px] w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-white/75 transition hover:bg-white/[0.08] disabled:cursor-default disabled:opacity-75"
                      />
                    ) : isPaidPlan && !priceConfigured ? (
                      <BillingCheckoutButton
                        mode="disabled"
                        label="Preço não configurado"
                        disabledLabel="Preço não configurado"
                      />
                    ) : hasPaidStripeSubscription && isPaidPlan ? (
                      <BillingCheckoutButton
                        mode="change"
                        plan={planKey}
                        label={isUpgrade ? `Mudar para ${meta.title}` : `Trocar para ${meta.title}`}
                      />
                    ) : isPaidPlan ? (
                      <BillingCheckoutButton
                        mode="checkout"
                        plan={planKey}
                        label={isUpgrade ? "Assinar agora" : "Escolher plano"}
                      />
                    ) : (
                      <BillingCheckoutButton
                        mode="disabled"
                        label="Plano gratuito"
                        disabledLabel="Plano gratuito"
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_360px]">
        <div>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <span className="inline-flex rounded-full border border-sky-300/15 bg-sky-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-sky-100">
                Resumo atual
              </span>
              <h2 className="mt-4 text-[28px] font-semibold leading-tight text-white md:text-[34px]">
                {isAdmin
                  ? "Conta admin com uso liberado"
                  : `Seu plano atual é ${currentPlanMeta.title}`}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
                {isAdmin
                  ? "Durante os testes, esta conta pode gerar e alterar artes sem bloqueio de créditos."
                  : currentPlanMeta.description}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 md:min-w-[260px]">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                Status do plano
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                {isAdmin ? "Admin" : getStatusLabel(summary.status)}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/60">
                {isAdmin
                  ? "Modo especial de testes ativo."
                  : `Limite do período: ${summary.monthlyLimit} crédito${summary.monthlyLimit === 1 ? "" : "s"}.`}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <UsageCard
              title="Banners criados"
              value={String(bannerCount)}
              helper="Total de artes no workspace"
            />
            <UsageCard
              title="Gerações do período"
              value={String(generationUnits)}
              helper="Cada geração consome 1 crédito"
            />
            <UsageCard
              title="Alterações do período"
              value={String(editUnits)}
              helper="Cada alteração também consome 1 crédito"
            />
            <UsageCard
              title="Restantes"
              value={remainingLabel}
              helper={`Uso atual: ${usageLabel}`}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        <RuleCard
          title="Como os créditos funcionam"
          items={[
            "Cada geração de banner consome 1 crédito.",
            "Cada alteração da arte por IA consome 1 crédito.",
            "Em planos pagos, os créditos seguem o ciclo da assinatura Stripe. No Free, seguem o mês calendário.",
          ]}
        />
        <RuleCard
          title="Boas práticas de uso"
          items={[
            "Preencha bem o briefing para reduzir retrabalho.",
            "Use alterações da arte só quando quiser refinar a versão atual.",
            "Para comparar muitas ideias, prefira gerar uma base forte primeiro.",
          ]}
        />
      </section>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/dashboard/banners/new"
          className="inline-flex min-h-[50px] items-center justify-center rounded-2xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95"
        >
          Criar banner agora
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex min-h-[50px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-5 text-sm font-medium text-white transition hover:bg-white/[0.08]"
        >
          Voltar ao dashboard
        </Link>
      </div>

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

function UsageCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
        {title}
      </p>
      <h3 className="mt-2 text-2xl font-semibold text-white">{value}</h3>
      <p className="mt-2 text-sm leading-6 text-white/60">{helper}</p>
    </div>
  );
}

function RuleCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,28,0.96),rgba(5,10,20,0.94))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
        {title}
      </p>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white/75"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
