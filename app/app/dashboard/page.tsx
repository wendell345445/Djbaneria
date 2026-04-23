import Link from "next/link";
import {
  SubscriptionPlan,
  SubscriptionStatus,
  UsageEventType,
} from "@/generated/prisma/enums";

import { buildBillingSummary } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { getOrCreateDemoWorkspace } from "@/lib/workspace";

export default async function DashboardPage() {
  const workspace = await getOrCreateDemoWorkspace();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [bannerCount, usedResult, latestBanners] = await Promise.all([
    prisma.banner.count({ where: { workspaceId: workspace.id } }),
    prisma.usageEvent.aggregate({
      where: {
        workspaceId: workspace.id,
        createdAt: { gte: monthStart },
        type: UsageEventType.BANNER_GENERATION,
      },
      _sum: { units: true },
    }),
    prisma.banner.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        title: true,
        outputImageUrl: true,
        createdAt: true,
      },
    }),
  ]);

  const summary = buildBillingSummary({
    plan: workspace.subscription?.plan || SubscriptionPlan.FREE,
    status: workspace.subscription?.status || SubscriptionStatus.TRIALING,
    usedThisMonth: usedResult._sum.units || 0,
  });

  return (
    <main style={{ padding: 24, maxWidth: 1180, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 24 }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.4, opacity: 0.6 }}>DJ Banner AI</p>
          <h1 style={{ fontSize: 32, margin: "10px 0 6px" }}>Dashboard</h1>
          <p style={{ opacity: 0.8, margin: 0 }}>Gere banners completos por IA e acompanhe o consumo de créditos.</p>
        </div>
        <Link href="/dashboard/banners/new" style={primaryButtonStyle}>Novo banner</Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 24 }}>
        <MetricCard title="Plano" value={summary.plan} helper={`Status: ${summary.status}`} />
        <MetricCard title="Banners gerados" value={String(bannerCount)} helper="Total no workspace" />
        <MetricCard title="Créditos usados" value={`${summary.usedThisMonth}/${summary.monthlyLimit}`} helper="Consumo no mês atual" />
        <MetricCard title="Restantes" value={String(summary.remainingCredits)} helper="Disponíveis para novas gerações" />
      </div>

      <div style={{ display: "grid", gap: 16, marginTop: 24, gridTemplateColumns: "1.2fr 1fr" }}>
        <section style={panelStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>Últimos banners</h2>
            <Link href="/dashboard/banners" style={secondaryButtonStyle}>Ver todos</Link>
          </div>

          {latestBanners.length === 0 ? (
            <p style={{ opacity: 0.78, marginBottom: 0 }}>Você ainda não gerou nenhum banner.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
              {latestBanners.map((banner) => (
                <Link key={banner.id} href={`/dashboard/banners/${banner.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{ display: "grid", gap: 10 }}>
                    {banner.outputImageUrl ? (
                      <img src={banner.outputImageUrl} alt={banner.title} style={{ width: "100%", aspectRatio: "4 / 5", objectFit: "cover", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)" }} />
                    ) : (
                      <div style={{ width: "100%", aspectRatio: "4 / 5", borderRadius: 16, background: "rgba(255,255,255,0.06)" }} />
                    )}
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16 }}>{banner.title}</h3>
                      <p style={{ margin: "6px 0 0", opacity: 0.64, fontSize: 13 }}>
                        {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(banner.createdAt)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section style={panelStyle}>
          <h2 style={{ marginTop: 0 }}>Atalhos</h2>
          <div style={{ display: "grid", gap: 12 }}>
            <Link href="/dashboard/banners/new" style={shortcutStyle}>
              <strong>Novo banner</strong>
              <span>Preencher os dados do evento e gerar arte final</span>
            </Link>
            <Link href="/dashboard/banners" style={shortcutStyle}>
              <strong>Meus banners</strong>
              <span>Visualizar e baixar banners já gerados</span>
            </Link>
            <Link href="/dashboard/billing" style={shortcutStyle}>
              <strong>Assinatura e créditos</strong>
              <span>Ver plano, consumo mensal e próximos upgrades</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricCard({ title, value, helper }: { title: string; value: string; helper: string }) {
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
  padding: 20,
  background: "rgba(255,255,255,0.04)",
};

const primaryButtonStyle: React.CSSProperties = {
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

const secondaryButtonStyle: React.CSSProperties = {
  ...primaryButtonStyle,
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
};

const shortcutStyle: React.CSSProperties = {
  display: "grid",
  gap: 4,
  textDecoration: "none",
  color: "inherit",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 18,
  padding: 16,
  background: "rgba(255,255,255,0.03)",
};
