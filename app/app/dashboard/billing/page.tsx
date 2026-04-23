import Link from "next/link";
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/generated/prisma/enums";

import { buildBillingSummary } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { getOrCreateDemoWorkspace } from "@/lib/workspace";

export default async function BillingPage() {
  const workspace = await getOrCreateDemoWorkspace();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const usedResult = await prisma.usageEvent.aggregate({
    where: {
      workspaceId: workspace.id,
      createdAt: { gte: monthStart },
    },
    _sum: { units: true },
  });

  const summary = buildBillingSummary({
    plan: workspace.subscription?.plan || SubscriptionPlan.FREE,
    status: workspace.subscription?.status || SubscriptionStatus.TRIALING,
    usedThisMonth: usedResult._sum.units || 0,
  });

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 32, margin: 0 }}>Assinatura e créditos</h1>
          <p style={{ opacity: 0.8 }}>
            Resumo atual do plano e consumo mensal do workspace.
          </p>
        </div>
        <Link href="/dashboard/banners/new" style={buttonStyle}>Gerar banner</Link>
      </div>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <Card title="Plano atual" value={summary.plan} helper={`Status: ${summary.status}`} />
        <Card title="Limite mensal" value={String(summary.monthlyLimit)} helper="Créditos disponíveis por mês" />
        <Card title="Usados neste mês" value={String(summary.usedThisMonth)} helper="Somando todas as gerações" />
        <Card title="Restantes" value={String(summary.remainingCredits)} helper="Disponíveis agora" />
      </div>

      <div style={{ ...panelStyle, marginTop: 18 }}>
        <h2 style={{ marginTop: 0 }}>Próximo passo</h2>
        <p style={{ opacity: 0.82, marginBottom: 0 }}>
          Na próxima etapa vamos ligar essa tela ao Stripe para upgrade, downgrade e portal de assinatura.
        </p>
      </div>
    </main>
  );
}

function Card({ title, value, helper }: { title: string; value: string; helper: string }) {
  return (
    <div style={panelStyle}>
      <p style={{ margin: 0, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.4, opacity: 0.6 }}>{title}</p>
      <h2 style={{ margin: "10px 0 8px", fontSize: 32 }}>{value}</h2>
      <p style={{ margin: 0, opacity: 0.78 }}>{helper}</p>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 24,
  padding: 24,
  background: "rgba(255,255,255,0.04)",
};

const buttonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  color: "#000",
  background: "#fff",
  borderRadius: 14,
  padding: "14px 18px",
  fontWeight: 700,
};
