import Link from "next/link";
import { notFound } from "next/navigation";
import {
  SubscriptionPlan,
  SubscriptionStatus,
  UsageEventType,
} from "@/generated/prisma/enums";

import { getMonthlyLimitForPlan } from "@/lib/plans";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function OwnerUserDetailPage({ params }: PageProps) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      workspaces: {
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const workspaceIds = user.workspaces.map((workspace) => workspace.id);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    subscriptions,
    bannersCount,
    usageThisMonth,
    generationUnits,
    editUnits,
    variationUnits,
    recentUsageEvents,
  ] = await Promise.all([
    prisma.subscription.findMany({
      where: {
        workspaceId: {
          in: workspaceIds.length > 0 ? workspaceIds : ["__none__"],
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        workspaceId: true,
        plan: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.banner.count({
      where: {
        workspaceId: {
          in: workspaceIds.length > 0 ? workspaceIds : ["__none__"],
        },
      },
    }),
    prisma.usageEvent.aggregate({
      where: {
        workspaceId: {
          in: workspaceIds.length > 0 ? workspaceIds : ["__none__"],
        },
        createdAt: {
          gte: monthStart,
        },
      },
      _sum: {
        units: true,
      },
    }),
    prisma.usageEvent.aggregate({
      where: {
        workspaceId: {
          in: workspaceIds.length > 0 ? workspaceIds : ["__none__"],
        },
        createdAt: {
          gte: monthStart,
        },
        type: UsageEventType.BANNER_GENERATION,
      },
      _sum: {
        units: true,
      },
    }),
    prisma.usageEvent.aggregate({
      where: {
        workspaceId: {
          in: workspaceIds.length > 0 ? workspaceIds : ["__none__"],
        },
        createdAt: {
          gte: monthStart,
        },
        type: UsageEventType.BANNER_EDIT,
      },
      _sum: {
        units: true,
      },
    }),
    prisma.usageEvent.aggregate({
      where: {
        workspaceId: {
          in: workspaceIds.length > 0 ? workspaceIds : ["__none__"],
        },
        createdAt: {
          gte: monthStart,
        },
        type: UsageEventType.BANNER_VARIATION,
      },
      _sum: {
        units: true,
      },
    }),
    prisma.usageEvent.findMany({
      where: {
        workspaceId: {
          in: workspaceIds.length > 0 ? workspaceIds : ["__none__"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
      select: {
        id: true,
        workspaceId: true,
        type: true,
        units: true,
        createdAt: true,
      },
    }),
  ]);

  const activeOrTrialSubscription =
    subscriptions.find(
      (item) =>
        item.status === SubscriptionStatus.ACTIVE ||
        item.status === SubscriptionStatus.TRIALING,
    ) ?? subscriptions[0] ?? null;

  const usedCreditsThisMonth = usageThisMonth._sum.units || 0;
  const generationCredits = generationUnits._sum.units || 0;
  const editCredits = editUnits._sum.units || 0;
  const variationCredits = variationUnits._sum.units || 0;
  const planLimit = activeOrTrialSubscription
    ? getMonthlyLimitForPlan(activeOrTrialSubscription.plan)
    : 0;
  const remainingCredits = activeOrTrialSubscription
    ? Math.max(planLimit - usedCreditsThisMonth, 0)
    : 0;

  const subscriptionByWorkspaceId = new Map(
    subscriptions.map((item) => [item.workspaceId, item]),
  );

  return (
    <main className="mx-auto max-w-[1320px] px-5 py-7">
      <div className="mb-7 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/45">
            Owner / Usuários / Detalhes
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-white xl:text-[40px]">
            {user.name || "Usuário sem nome"}
          </h1>
          <p className="mt-2 break-all text-sm leading-6 text-white/60">
            {user.email}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 xl:justify-end">
          <CompactMetric
            label="Plano atual"
            value={activeOrTrialSubscription ? getPlanLabel(activeOrTrialSubscription.plan) : "Sem plano"}
          />
          <CompactMetric
            label="Uso do mês"
            value={activeOrTrialSubscription ? `${usedCreditsThisMonth} / ${planLimit}` : String(usedCreditsThisMonth)}
          />
          <CompactMetric
            label="Restantes"
            value={activeOrTrialSubscription ? String(remainingCredits) : "-"}
          />
          <CompactMetric
            label="Banners"
            value={String(bannersCount)}
            highlight
          />
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
        <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.98),rgba(7,12,24,0.96))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <span className="inline-flex rounded-full border border-sky-300/15 bg-sky-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-sky-100">
                Resumo do usuário
              </span>

              <h2 className="mt-4 text-[28px] font-semibold leading-tight text-white md:text-[34px]">
                Plano contratado e consumo de créditos
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
                Aqui você consegue visualizar rapidamente o plano atual da conta,
                o uso de créditos no mês, a quantidade de banners gerados e a
                situação geral dos workspaces vinculados.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 md:min-w-[260px]">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                Status da conta
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                {user.isActive !== false ? "Ativa" : "Inativa"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/60">
                Perfil: {getRoleLabel(String(user.role))}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <UsageCard
              title="Créditos usados"
              value={String(usedCreditsThisMonth)}
              helper="Consumo total do mês atual"
            />
            <UsageCard
              title="Gerações"
              value={String(generationCredits)}
              helper="Créditos usados em geração"
            />
            <UsageCard
              title="Alterações"
              value={String(editCredits)}
              helper="Créditos usados em edição"
            />
            <UsageCard
              title="Variações"
              value={String(variationCredits)}
              helper="Créditos usados em variações"
            />
          </div>
        </div>

        <div className="grid gap-4">
          <InfoCard
            title="Workspaces"
            value={String(user.workspaces.length)}
            helper="Quantidade de ambientes vinculados à conta"
          />
          <InfoCard
            title="Plano principal"
            value={activeOrTrialSubscription ? getPlanLabel(activeOrTrialSubscription.plan) : "Sem plano"}
            helper={
              activeOrTrialSubscription
                ? `Status: ${getStatusLabel(activeOrTrialSubscription.status)}`
                : "Nenhuma assinatura encontrada"
            }
          />
          <InfoCard
            title="Criado em"
            value={new Intl.DateTimeFormat("pt-BR", {
              dateStyle: "short",
            }).format(user.createdAt)}
            helper="Data de criação da conta"
          />
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,28,0.96),rgba(5,10,20,0.94))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">
                Workspaces e planos
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Ambientes vinculados
              </h2>
            </div>

            <Link
              href="/owner/users"
              className="inline-flex min-h-[42px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-white transition hover:bg-white/[0.08]"
            >
              Voltar para usuários
            </Link>
          </div>

          {user.workspaces.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
              <p className="text-sm font-medium text-white/85">
                Nenhum workspace vinculado.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {user.workspaces.map((workspace) => {
                const workspaceSubscription =
                  subscriptionByWorkspaceId.get(workspace.id) ?? null;

                return (
                  <div
                    key={workspace.id}
                    className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-white">
                            {workspace.name}
                          </h3>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${
                              workspace.isActive !== false
                                ? "border-emerald-300/15 bg-emerald-300/10 text-emerald-100"
                                : "border-rose-300/15 bg-rose-300/10 text-rose-100"
                            }`}
                          >
                            {workspace.isActive !== false ? "Ativo" : "Inativo"}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-white/55">
                          {workspace.slug || "Sem slug"}
                        </p>
                      </div>

                      <div className="grid gap-2 text-sm text-white/75 md:text-right">
                        <div>
                          Plano:{" "}
                          <span className="font-medium text-white">
                            {workspaceSubscription
                              ? getPlanLabel(workspaceSubscription.plan)
                              : "Sem assinatura"}
                          </span>
                        </div>
                        <div>
                          Status:{" "}
                          <span className="font-medium text-white">
                            {workspaceSubscription
                              ? getStatusLabel(workspaceSubscription.status)
                              : "-"}
                          </span>
                        </div>
                        <div className="text-white/45">
                          Atualizado em{" "}
                          {workspaceSubscription
                            ? new Intl.DateTimeFormat("pt-BR", {
                                dateStyle: "short",
                                timeStyle: "short",
                              }).format(workspaceSubscription.updatedAt)
                            : "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid gap-4">
          <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,28,0.96),rgba(5,10,20,0.94))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
              Atividade recente
            </p>

            <div className="mt-4 grid gap-3">
              {recentUsageEvents.length === 0 ? (
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/65">
                  Nenhuma movimentação encontrada.
                </div>
              ) : (
                recentUsageEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {getUsageTypeLabel(event.type)}
                        </p>
                        <p className="mt-1 text-xs text-white/45">
                          {new Intl.DateTimeFormat("pt-BR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          }).format(event.createdAt)}
                        </p>
                      </div>

                      <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/60">
                        {event.units || 0} crédito(s)
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
                "Adicionar detalhes do histórico por mês",
                "Permitir abrir os banners gerados da conta",
                "Exibir histórico de mudanças de plano",
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

function getRoleLabel(role: string) {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super admin";
    case "OWNER":
      return "Owner";
    case "USER":
      return "Usuário";
    default:
      return role || "Usuário";
  }
}

function getStatusLabel(status: SubscriptionStatus) {
  switch (status) {
    case SubscriptionStatus.ACTIVE:
      return "Ativa";
    case SubscriptionStatus.TRIALING:
      return "Trial";
    case SubscriptionStatus.PAST_DUE:
      return "Past due";
    case SubscriptionStatus.CANCELED:
      return "Cancelada";
    case SubscriptionStatus.EXPIRED:
      return "Expirada";
    default:
      return String(status);
  }
}

function getUsageTypeLabel(type: UsageEventType) {
  switch (type) {
    case UsageEventType.BANNER_GENERATION:
      return "Geração de banner";
    case UsageEventType.BANNER_EDIT:
      return "Alteração de banner";
    case UsageEventType.BANNER_VARIATION:
      return "Variação de banner";
    default:
      return String(type);
  }
}
