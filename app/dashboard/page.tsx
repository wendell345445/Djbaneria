import Link from "next/link";
import {
  SubscriptionPlan,
  SubscriptionStatus,
  UsageEventType,
} from "@/generated/prisma/enums";

import { isAdminEmail } from "@/lib/admin";
import { buildBillingSummary } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { requireCurrentWorkspace } from "@/lib/workspace";

export default async function DashboardPage() {
  const workspace = await requireCurrentWorkspace();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [bannerCount, usedResult] = await Promise.all([
    prisma.banner.count({
      where: { workspaceId: workspace.id },
    }),
    prisma.usageEvent.aggregate({
      where: {
        workspaceId: workspace.id,
        createdAt: { gte: monthStart },
        type: UsageEventType.BANNER_GENERATION,
      },
      _sum: { units: true },
    }),
  ]);

  const summary = buildBillingSummary({
    plan: workspace.subscription?.plan || SubscriptionPlan.FREE,
    status: workspace.subscription?.status || SubscriptionStatus.TRIALING,
    usedThisMonth: usedResult._sum.units || 0,
  });

  const isAdmin = isAdminEmail(workspace.user?.email);
  const planLabel = isAdmin ? `${summary.plan} (Admin)` : summary.plan;
  const usageLabel = isAdmin
    ? `${summary.usedThisMonth} / ∞`
    : `${summary.usedThisMonth} / ${summary.monthlyLimit}`;
  const remainingLabel = isAdmin ? "Ilimitado" : String(summary.remainingCredits);

  return (
    <main className="mx-auto max-w-[1320px] px-5 py-7">
      <div className="mb-7 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/45">
            Dashboard
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-white xl:text-[40px]">
            Painel de criação
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Gere banners, acompanhe seus créditos e acesse rapidamente a criação de novas artes.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 xl:justify-end">
          <CompactMetric label="Plano" value={planLabel} />
          <CompactMetric label="Uso" value={usageLabel} />
          <CompactMetric label="Restantes" value={remainingLabel} highlight />
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

              <h2 className="mt-4 text-[28px] font-semibold leading-tight text-white md:text-[34px]">
                Crie um banner profissional em poucos passos
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-7 text-white/70">
                Ideal para usuários mais leigos: preencha o briefing, gere o preview com IA e baixe a arte pronta sem complicação.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <QuickStep number="1" title="Preencha os dados" description="Título, nome do DJ, data e local do evento." />
              <QuickStep number="2" title="Gere o preview" description="A IA monta o banner no formato escolhido." />
              <QuickStep number="3" title="Baixe ou ajuste" description="Faça alterações e baixe a versão final." />
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
          <InfoCard title="Banners gerados" value={String(bannerCount)} helper="Total criado no workspace" />
          <InfoCard title="Créditos do mês" value={usageLabel} helper={isAdmin ? "Conta admin com uso liberado" : "Consumo no período atual"} />
          <InfoCard title="Restantes" value={remainingLabel} helper="Créditos disponíveis para novas gerações e alterações" />
        </div>
      </section>

      {isAdmin ? (
        <section className="mt-5 rounded-3xl border border-white/10 bg-gradient-to-br from-sky-400/8 to-violet-400/10 p-5">
          <p className="m-0 text-xs uppercase tracking-[0.2em] text-white/50">
            Modo teste admin
          </p>
          <p className="mt-2 text-sm leading-7 text-white/80">
            Esta conta está liberada para gerar banners sem limite de créditos durante os testes.
          </p>
        </section>
      ) : null}
    </main>
  );
}

function CompactMetric({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`min-w-[132px] rounded-2xl border px-4 py-3 ${highlight ? "border-sky-300/20 bg-sky-300/[0.08]" : "border-white/10 bg-white/[0.04]"}`}>
      <p className="m-0 text-[10px] uppercase tracking-[0.18em] text-white/45">{label}</p>
      <div className="mt-1.5 text-[15px] font-semibold leading-none text-white">{value}</div>
    </div>
  );
}

function QuickStep({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
      <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-sm font-semibold text-white">{number}</div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/60">{description}</p>
    </div>
  );
}

function InfoCard({ title, value, helper }: { title: string; value: string; helper: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,28,0.96),rgba(5,10,20,0.94))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">{title}</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">{value}</h3>
      <p className="mt-2 text-sm leading-6 text-white/60">{helper}</p>
    </div>
  );
}
