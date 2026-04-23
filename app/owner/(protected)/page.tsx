import Link from "next/link";
import {
  SubscriptionPlan,
  SubscriptionStatus,
  UsageEventType,
} from "@/generated/prisma/enums";

import { prisma } from "@/lib/prisma";

export default async function OwnerPage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    usersCount,
    workspacesCount,
    bannersCount,
    activeSubscriptionsCount,
    usageThisMonth,
    recentUsers,
    subscriptionsByPlan,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.workspace.count(),
    prisma.banner.count(),
    prisma.subscription.count({
      where: {
        status: {
          in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
        },
      },
    }),
    prisma.usageEvent.aggregate({
      where: {
        createdAt: { gte: monthStart },
        type: UsageEventType.BANNER_GENERATION,
      },
      _sum: {
        units: true,
      },
    }),
    prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.subscription.groupBy({
      by: ["plan"],
      _count: {
        _all: true,
      },
      orderBy: {
        plan: "asc",
      },
    }),
  ]);

  const totalUsageThisMonth = usageThisMonth._sum.units || 0;

  return (
    <main className="mx-auto max-w-[1320px] px-5 py-7">
      <div className="mb-7 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/45">
            Owner
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-white xl:text-[40px]">
            Visão geral do sistema
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Acompanhe os principais números da plataforma, crescimento de usuários
            e distribuição de planos.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 xl:justify-end">
          <CompactMetric label="Usuários" value={String(usersCount)} />
          <CompactMetric label="Workspaces" value={String(workspacesCount)} />
          <CompactMetric label="Banners" value={String(bannersCount)} />
          <CompactMetric
            label="Planos ativos"
            value={String(activeSubscriptionsCount)}
            highlight
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
                Resumo operacional
              </span>

              <h2 className="mt-4 text-[28px] font-semibold leading-tight text-white md:text-[34px]">
                Acompanhe o crescimento do produto com visão centralizada
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-7 text-white/70">
                Este painel foi pensado para o criador do sistema acompanhar os
                números principais, validar o uso da plataforma e ter uma base
                para futuras áreas de gestão.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <OwnerStep
                number="01"
                title="Usuários"
                description="Quantidade total de contas cadastradas na plataforma."
              />
              <OwnerStep
                number="02"
                title="Workspaces"
                description="Total de ambientes criados e vinculados aos usuários."
              />
              <OwnerStep
                number="03"
                title="Uso mensal"
                description="Créditos consumidos em geração de banners no mês atual."
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95"
              >
                Voltar ao dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <InfoCard
            title="Uso do mês"
            value={String(totalUsageThisMonth)}
            helper="Total de créditos consumidos em geração no mês atual"
          />
          <InfoCard
            title="Usuários recentes"
            value={String(recentUsers.length)}
            helper="Últimos cadastros listados logo abaixo"
          />
          <InfoCard
            title="Planos com atividade"
            value={String(subscriptionsByPlan.length)}
            helper="Quantidade de faixas de plano com registros"
          />
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,28,0.96),rgba(5,10,20,0.94))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
          <div className="mb-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">
              Contas recentes
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Últimos usuários cadastrados
            </h2>
          </div>

          {recentUsers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
              <p className="text-sm font-medium text-white/85">
                Nenhum usuário encontrado.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {user.name || "Sem nome"}
                      </p>
                      <p className="mt-1 text-sm text-white/55">
                        {user.email}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-2 md:items-end">
                      <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/60">
                        {String(user.role || "USER")}
                      </span>
                      <p className="text-xs text-white/45">
                        {new Intl.DateTimeFormat("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        }).format(user.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-4">
          <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,28,0.96),rgba(5,10,20,0.94))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
              Distribuição por plano
            </p>

            <div className="mt-4 grid gap-3">
              {subscriptionsByPlan.length === 0 ? (
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/65">
                  Nenhum plano registrado ainda.
                </div>
              ) : (
                subscriptionsByPlan.map((item) => (
                  <div
                    key={String(item.plan)}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-white">
                        {getPlanLabel(item.plan)}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/60">
                        {item._count._all}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,28,0.96),rgba(5,10,20,0.94))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
              Próximos passos
            </p>

            <div className="mt-4 grid gap-3">
              {[
                "Criar listagem completa de usuários",
                "Adicionar gerenciamento de workspaces",
                "Criar gestão de planos e assinaturas",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white/75"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
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
      className={`min-w-[132px] rounded-2xl border px-4 py-3 ${
        highlight
          ? "border-sky-300/20 bg-sky-300/[0.08]"
          : "border-white/10 bg-white/[0.04]"
      }`}
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

function OwnerStep({
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

function getPlanLabel(plan: SubscriptionPlan) {
  switch (plan) {
    case SubscriptionPlan.FREE:
      return "Free";
    case SubscriptionPlan.PRO:
      return "Pro";
    case SubscriptionPlan.PROFESSIONAL:
      return "Profissional";
    case SubscriptionPlan.STUDIO:
      return "Studio";
    default:
      return String(plan);
  }
}
