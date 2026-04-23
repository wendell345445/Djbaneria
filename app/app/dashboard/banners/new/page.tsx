import {
  SubscriptionPlan,
  SubscriptionStatus,
  UsageEventType,
} from "@/generated/prisma/enums";

import { NewBannerForm } from "@/components/new-banner-form";
import { buildBillingSummary } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { getOrCreateDemoWorkspace } from "@/lib/workspace";

export default async function NewBannerPage() {
  const workspace = await getOrCreateDemoWorkspace();
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

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "grid", gap: 10, marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, margin: 0 }}>Novo banner</h1>
        <p style={{ opacity: 0.82, margin: 0 }}>
          Preencha as informações do evento e gere um banner completo, profissional e pronto para divulgação.
        </p>
      </div>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "minmax(0, 1fr) 280px", alignItems: "start" }}>
        <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 20, background: "rgba(255,255,255,0.04)" }}>
          <NewBannerForm />
        </div>

        <aside style={{ display: "grid", gap: 16 }}>
          <div style={sideCardStyle}>
            <p style={eyebrowStyle}>Plano atual</p>
            <h2 style={{ margin: "8px 0 6px", fontSize: 28 }}>{summary.plan}</h2>
            <p style={{ margin: 0, opacity: 0.8 }}>Status: {summary.status}</p>
          </div>

          <div style={sideCardStyle}>
            <p style={eyebrowStyle}>Créditos do mês</p>
            <h3 style={{ margin: "8px 0 6px", fontSize: 26 }}>
              {summary.usedThisMonth} / {summary.monthlyLimit}
            </h3>
            <p style={{ margin: 0, opacity: 0.8 }}>Restantes: {summary.remainingCredits}</p>
          </div>
        </aside>
      </div>
    </main>
  );
}

const sideCardStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 24,
  padding: 20,
  background: "rgba(255,255,255,0.04)",
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 1.5,
  opacity: 0.6,
};
