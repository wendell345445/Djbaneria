import Link from "next/link";
import { SubscriptionPlan, SubscriptionStatus } from "@/generated/prisma/enums";

import { isAdminEmail } from "@/lib/admin";
import { buildBillingSummary } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { requireCurrentWorkspace } from "@/lib/workspace";

const planOrder = ["FREE", "PRO", "PROFESSIONAL", "STUDIO"] as const;

const planMeta: Record<
  (typeof planOrder)[number],
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
      "Geração de banners com IA",
      "Preview e download da arte",
      "Fluxo simples para usuários iniciantes",
    ],
  },
  PRO: {
    title: "Pro",
    monthlyCredits: "20 créditos/mês",
    description: "Plano equilibrado para DJs e criadores com uso recorrente.",
    highlights: [
      "Mais créditos mensais",
      "Bom para campanhas e eventos recorrentes",
      "Ideal para uso frequente",
    ],
  },
  PROFESSIONAL: {
    title: "Profissional",
    monthlyCredits: "40 créditos/mês",
    description:
      "Para quem precisa de mais fôlego para gerar, ajustar e testar artes.",
    highlights: [
      "Mais créditos para produção recorrente",
      "Melhor para quem trabalha com vários materiais",
      "Mais margem para alterações e refinamentos",
    ],
  },
  STUDIO: {
    title: "Studio",
    monthlyCredits: "80 créditos/mês",
    description: "Pensado para operação intensa e produção em maior volume.",
    highlights: [
      "Alto volume de criação",
      "Ótimo para operação profissional contínua",
      "Mais espaço para testes, versões e ajustes",
    ],
  },
};

function getPlanRank(plan: string) {
  const index = planOrder.indexOf(plan as (typeof planOrder)[number]);
  return index === -1 ? 0 : index;
}

export default async function BillingPage() {
  const workspace = await requireCurrentWorkspace();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [bannerCount, usageEvents] = await Promise.all([
    prisma.banner.count({
      where: { workspaceId: workspace.id },
    }),
    prisma.usageEvent.findMany({
      where: {
        workspaceId: workspace.id,
        createdAt: { gte: monthStart },
      },
      orderBy: { createdAt: "desc" },
      select: {
        type: true,
        units: true,
        createdAt: true,
      },
    }),
  ]);

  const usedThisMonth = usageEvents.reduce(
    (total, event) => total + (event.units || 0),
    0,
  );

  const summary = buildBillingSummary({
    plan: workspace.subscription?.plan || SubscriptionPlan.FREE,
    status: workspace.subscription?.status || SubscriptionStatus.TRIALING,
    usedThisMonth,
  });

  const isAdmin = isAdminEmail(workspace.user?.email);
  const planLabel = isAdmin ? `${summary.plan} (Admin)` : summary.plan;
  const usageLabel = isAdmin
    ? `${summary.usedThisMonth} / ∞`
    : `${summary.usedThisMonth} / ${summary.monthlyLimit}`;
  const remainingLabel = isAdmin
    ? "Ilimitado"
    : String(summary.remainingCredits);

  const generationUnits = usageEvents
    .filter((event) => String(event.type) === "BANNER_GENERATION")
    .reduce((total, event) => total + (event.units || 0), 0);
  const editUnits = usageEvents
    .filter((event) => String(event.type) === "BANNER_EDIT")
    .reduce((total, event) => total + (event.units || 0), 0);
  const variationUnits = usageEvents
    .filter((event) => String(event.type) === "BANNER_VARIATION")
    .reduce((total, event) => total + (event.units || 0), 0);

  const currentPlanRank = getPlanRank(String(summary.plan));

  return (
    <main className="mx-auto max-w-[1320px] px-5 py-7">
      <div className="mb-7 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <section className="mt-6">
          <div className="">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white font-bold">
                  Planos
                </p>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-4">
              {planOrder.map((planKey) => {
                const meta = planMeta[planKey];
                const isCurrent = String(summary.plan) === planKey;
                const isUpgrade = getPlanRank(planKey) > currentPlanRank;

                return (
                  <div
                    key={planKey}
                    className={`rounded-[24px] border p-5 ${isCurrent ? "border-sky-300/20 bg-sky-300/[0.08]" : "border-white/10 bg-white/[0.03]"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white font-black">
                          {meta.title}
                        </p>
                        <h3 className="mt-2 text-[18px] font-semibold text-white">
                          {meta.monthlyCredits}
                        </h3>
                      </div>

                      {isCurrent ? (
                        <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-sky-100">
                          Plano atual
                        </span>
                      ) : isUpgrade ? (
                        <span className="rounded-full border border-violet-300/20 bg-green-500 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-gray-900 font-bold ">
                          Upgrade
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-3 text-sm leading-4 text-white/65">
                      {meta.description}
                    </p>

                    <div className="mt-4 grid gap-2">
                      {meta.highlights.map((highlight) => (
                        <div
                          key={highlight}
                          className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-white/75"
                        >
                          {highlight}
                        </div>
                      ))}
                    </div>

                    <div className="mt-5">
                      {isCurrent ? (
                        <button
                          type="button"
                          disabled
                          className="inline-flex min-h-[46px] w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-white/70"
                        >
                          Plano em uso
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="inline-flex min-h-[46px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-4 text-sm font-bold text-slate-950 transition hover:opacity-95"
                        >
                          Upgrade em breve
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_360px]">
        <div className=" ">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <span className="inline-flex rounded-full border border-sky-300/15 bg-sky-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-sky-100">
                Resumo atual
              </span>
              <h2 className="mt-4 text-[28px] font-semibold leading-tight text-white md:text-[34px]">
                {isAdmin
                  ? "Conta admin com uso liberado"
                  : `Seu plano atual é ${planMeta[String(summary.plan) as keyof typeof planMeta]?.title ?? summary.plan}`}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
                {isAdmin
                  ? "Durante os testes, esta conta pode gerar e alterar artes sem bloqueio de créditos."
                  : (planMeta[String(summary.plan) as keyof typeof planMeta]
                      ?.description ??
                    "Seu plano define quantos créditos você pode usar por mês.")}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 md:min-w-[260px]">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                Status do plano
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                {summary.status}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/60">
                {isAdmin
                  ? "Modo especial de testes ativo."
                  : `Limite do mês: ${summary.monthlyLimit} crédito${summary.monthlyLimit === 1 ? "" : "s"}.`}
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
              title="Gerações do mês"
              value={String(generationUnits)}
              helper="Cada geração consome 1 crédito"
            />
            <UsageCard
              title="Alterações do mês"
              value={String(editUnits)}
              helper="Cada alteração também consome 1 crédito"
            />
            <UsageCard
              title="Variações"
              value={String(variationUnits)}
              helper="Fluxos alternativos da arte"
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
            "Os créditos são contabilizados por período mensal.",
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

function CompactMetric({
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
      className={`min-w-[12px]  rounded-2xl  px-4 py-3  ${highlight ? "" : ""}`}
    >
      <p className="m-0 text-[10px] uppercase tracking-[0.18em] text-white/45">
        {label}
      </p>
      <div className="mt-1.5 text-[15px] font-semibold leading-none text-white">
        {value}
      </div>
    </div>
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
