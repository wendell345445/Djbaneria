import {
  SubscriptionPlan,
  SubscriptionStatus,
  UsageEventType,
} from "@/generated/prisma/enums";

import { isAdminEmail } from "@/lib/admin";
import { NewBannerForm } from "@/components/new-banner-form";
import { buildBillingSummary } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { requireCurrentWorkspace } from "@/lib/workspace";

export default async function NewBannerPage() {
  const workspace = await requireCurrentWorkspace();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const usedResult = await prisma.usageEvent.aggregate({
    where: {
      workspaceId: workspace.id,
      createdAt: { gte: monthStart },
      type: UsageEventType.BANNER_GENERATION,
    },
    _sum: { units: true },
  });

  const summary = buildBillingSummary({
    plan: workspace.subscription?.plan || SubscriptionPlan.FREE,
    status: workspace.subscription?.status || SubscriptionStatus.TRIALING,
    usedThisMonth: usedResult._sum.units || 0,
  });

  const isAdmin = isAdminEmail(workspace.user?.email);
  const planLabel = isAdmin ? `${summary.plan} (Admin)` : summary.plan;
  const usageLabel = isAdmin ? `${summary.usedThisMonth} / ∞` : `${summary.usedThisMonth} / ${summary.monthlyLimit}`;
  const remainingLabel = isAdmin ? "Ilimitado" : String(summary.remainingCredits);

  return (
    <main className="mx-auto max-w-[1320px] px-5 py-7">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-semibold leading-tight text-white xl:text-[40px]">
            Criar banner premium
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Monte seu briefing e gere o preview com IA.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 xl:justify-end">
          <CompactMetric label="Plano" value={planLabel} />
          <CompactMetric label="Uso" value={usageLabel} />
          <CompactMetric label="Restantes" value={remainingLabel} highlight />
        </div>
      </div>

      <NewBannerForm />

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
    <div className={`min-w-[132px] rounded-2xl border px-4 py-3 backdrop-blur-sm ${highlight ? "border-sky-300/20 bg-sky-300/[0.08]" : "border-white/10 bg-white/[0.04]"}`}>
      <p className="m-0 text-[10px] uppercase tracking-[0.18em] text-white/45">{label}</p>
      <div className="mt-1.5 text-[15px] font-semibold leading-none text-white">{value}</div>
    </div>
  );
}
