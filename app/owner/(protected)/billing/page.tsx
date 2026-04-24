import Link from "next/link";
import { SubscriptionPlan, SubscriptionStatus } from "@/generated/prisma/enums";

import { OwnerSubscriptionActions } from "@/components/owner-subscription-actions";
import { prisma } from "@/lib/prisma";

const planOrder = [
  SubscriptionPlan.FREE,
  SubscriptionPlan.PRO,
  SubscriptionPlan.PROFESSIONAL,
  SubscriptionPlan.STUDIO,
] as const;

type SearchParams = Promise<{
  q?: string;
  plan?: string;
  status?: string;
}>;

export default async function OwnerBillingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const plan = (params.plan ?? "").trim();
  const status = (params.status ?? "").trim();

  const subscriptions = await prisma.subscription.findMany({
    where: {
      ...(plan && plan !== "ALL"
        ? { plan: plan as SubscriptionPlan }
        : {}),
      ...(status && status !== "ALL"
        ? { status: status as SubscriptionStatus }
        : {}),
      ...(q
        ? {
            OR: [
              { workspace: { name: { contains: q, mode: "insensitive" } } },
              { workspace: { slug: { contains: q, mode: "insensitive" } } },
              { workspace: { user: { email: { contains: q, mode: "insensitive" } } } },
              { workspace: { user: { name: { contains: q, mode: "insensitive" } } } },
            ],
          }
        : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      plan: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true,
            },
          },
        },
      },
    },
  });

  const totalSubscriptions = subscriptions.length;
  const activeSubscriptions = subscriptions.filter(
    (item) =>
      item.status === SubscriptionStatus.ACTIVE ||
      item.status === SubscriptionStatus.TRIALING,
  ).length;
  const canceledSubscriptions = subscriptions.filter(
    (item) => item.status === SubscriptionStatus.CANCELED,
  ).length;
  const pastDueSubscriptions = subscriptions.filter(
    (item) => item.status === SubscriptionStatus.PAST_DUE,
  ).length;

  const plansSummary = planOrder.map((itemPlan) => ({
    plan: itemPlan,
    count: subscriptions.filter((item) => item.plan === itemPlan).length,
  }));

  return (
    <main className="mx-auto max-w-[1320px] px-5 py-7">
      <div className="mb-7 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/45">
            Owner / Assinaturas
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-white xl:text-[40px]">
            Planos e assinaturas
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Acompanhe os planos ativos da plataforma, identifique assinaturas em
            risco e visualize rapidamente a distribuição por faixa.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 xl:justify-end">
          <CompactMetric label="Assinaturas" value={String(totalSubscriptions)} />
          <CompactMetric label="Ativas" value={String(activeSubscriptions)} />
          <CompactMetric label="Canceladas" value={String(canceledSubscriptions)} />
          <CompactMetric
            label="Past due"
            value={String(pastDueSubscriptions)}
            highlight
          />
        </div>
      </div>

      <section className="mb-6 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,28,0.96),rgba(5,10,20,0.94))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
        <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por workspace, slug ou e-mail"
            className={inputClassName}
          />

          <select
            name="plan"
            defaultValue={plan || "ALL"}
            className={inputClassName}
          >
            <option value="ALL" className="bg-slate-950">Todos os planos</option>
            <option value="FREE" className="bg-slate-950">FREE</option>
            <option value="PRO" className="bg-slate-950">PRO</option>
            <option value="PROFESSIONAL" className="bg-slate-950">PROFESSIONAL</option>
            <option value="STUDIO" className="bg-slate-950">STUDIO</option>
          </select>

          <select
            name="status"
            defaultValue={status || "ALL"}
            className={inputClassName}
          >
            <option value="ALL" className="bg-slate-950">Todos os status</option>
            <option value="TRIALING" className="bg-slate-950">TRIALING</option>
            <option value="ACTIVE" className="bg-slate-950">ACTIVE</option>
            <option value="PAST_DUE" className="bg-slate-950">PAST_DUE</option>
            <option value="CANCELED" className="bg-slate-950">CANCELED</option>
            <option value="EXPIRED" className="bg-slate-950">EXPIRED</option>
          </select>

          <div className="flex gap-3">
            <button
              type="submit"
              className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95"
            >
              Filtrar
            </button>

            <Link
              href="/owner/billing"
              className="inline-flex min-h-[46px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-5 text-sm font-medium text-white transition hover:bg-white/[0.08]"
            >
              Limpar
            </Link>
          </div>
        </form>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,28,0.96),rgba(5,10,20,0.94))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">
                Gestão
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Lista de assinaturas
              </h2>
            </div>

            <Link
              href="/owner"
              className="inline-flex min-h-[42px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-white transition hover:bg-white/[0.08]"
            >
              Voltar ao overview
            </Link>
          </div>

          {subscriptions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
              <p className="text-sm font-medium text-white/85">
                Nenhuma assinatura encontrada com os filtros atuais.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {subscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-white">
                          {subscription.workspace?.name || "Workspace sem nome"}
                        </h3>

                        <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/60">
                          {getPlanLabel(subscription.plan)}
                        </span>

                        <span className={getStatusClassName(subscription.status)}>
                          {getStatusLabel(subscription.status)}
                        </span>
                      </div>

                      <p className="mt-2 break-all text-sm text-white/60">
                        {subscription.workspace?.slug || "Sem slug"}
                      </p>

                      <p className="mt-2 text-xs text-white/45">
                        Atualizado em{" "}
                        {new Intl.DateTimeFormat("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        }).format(subscription.updatedAt)}
                      </p>
                    </div>

                    <div className="flex w-full max-w-[540px] flex-col gap-3">
                      <div className="flex justify-end">
                        <OwnerSubscriptionActions
                          subscriptionId={subscription.id}
                          currentPlan={subscription.plan}
                          currentStatus={subscription.status}
                        />
                      </div>

                      <div>
                        <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-white/45">
                          Responsável pela conta
                        </p>

                        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-white">
                                {subscription.workspace?.user?.name || "Sem nome"}
                              </p>
                              <p className="mt-1 break-all text-xs text-white/45">
                                {subscription.workspace?.user?.email || "Sem e-mail"}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/60">
                                {getRoleLabel(String(subscription.workspace?.user?.role || "USER"))}
                              </span>

                              <span
                                className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${
                                  subscription.workspace?.user?.isActive !== false
                                    ? "border-emerald-300/15 bg-emerald-300/10 text-emerald-100"
                                    : "border-rose-300/15 bg-rose-300/10 text-rose-100"
                                }`}
                              >
                                {subscription.workspace?.user?.isActive !== false ? "Conta ativa" : "Conta inativa"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
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
              {plansSummary.map((item) => (
                <div
                  key={item.plan}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-white">
                      {getPlanLabel(item.plan)}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/60">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,28,0.96),rgba(5,10,20,0.94))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
              Próximos passos
            </p>

            <div className="mt-4 grid gap-3">
              {[
                "Adicionar auditoria de mudanças",
                "Permitir exportação por filtros",
                "Criar histórico de alterações por assinatura",
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

function getStatusClassName(status: SubscriptionStatus) {
  switch (status) {
    case SubscriptionStatus.ACTIVE:
      return "rounded-full border border-emerald-300/15 bg-emerald-300/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-emerald-100";
    case SubscriptionStatus.TRIALING:
      return "rounded-full border border-sky-300/15 bg-sky-300/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-sky-100";
    case SubscriptionStatus.PAST_DUE:
      return "rounded-full border border-amber-300/15 bg-amber-300/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-amber-100";
    case SubscriptionStatus.CANCELED:
    case SubscriptionStatus.EXPIRED:
      return "rounded-full border border-rose-300/15 bg-rose-300/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-rose-100";
    default:
      return "rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/60";
  }
}

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/50 focus:ring-4 focus:ring-sky-400/10";
