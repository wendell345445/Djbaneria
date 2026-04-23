import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getOrCreateDemoWorkspace } from "@/lib/workspace";

export default async function BannersPage() {
  const workspace = await getOrCreateDemoWorkspace();
  const banners = await prisma.banner.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
    take: 24,
    select: {
      id: true,
      title: true,
      djName: true,
      eventDate: true,
      format: true,
      stylePreset: true,
      outputImageUrl: true,
      createdAt: true,
    },
  });

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 32, margin: 0 }}>Meus banners</h1>
          <p style={{ opacity: 0.8 }}>Veja e baixe os banners já gerados.</p>
        </div>
        <Link href="/dashboard/banners/new" style={buttonStyle}>
          Novo banner
        </Link>
      </div>

      {banners.length === 0 ? (
        <div style={emptyStateStyle}>
          <h2 style={{ marginTop: 0 }}>Você ainda não gerou nenhum banner.</h2>
          <p style={{ opacity: 0.8 }}>Crie o primeiro banner profissional com IA para começar.</p>
          <Link href="/dashboard/banners/new" style={buttonStyle}>Criar primeiro banner</Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
          {banners.map((banner) => (
            <Link key={banner.id} href={`/dashboard/banners/${banner.id}`} style={cardStyle}>
              {banner.outputImageUrl ? (
                <img src={banner.outputImageUrl} alt={banner.title} style={{ width: "100%", aspectRatio: "4 / 5", objectFit: "cover", borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)" }} />
              ) : (
                <div style={{ width: "100%", aspectRatio: "4 / 5", borderRadius: 18, background: "rgba(255,255,255,0.06)" }} />
              )}
              <div style={{ display: "grid", gap: 6 }}>
                <h2 style={{ margin: 0, fontSize: 18 }}>{banner.title}</h2>
                <p style={{ margin: 0, opacity: 0.75 }}>{banner.djName || "Sem DJ informado"}</p>
                <p style={{ margin: 0, opacity: 0.6, fontSize: 13 }}>
                  {banner.stylePreset} • {banner.format}
                </p>
                <p style={{ margin: 0, opacity: 0.6, fontSize: 13 }}>
                  {new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(banner.createdAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

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

const cardStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  textDecoration: "none",
  color: "inherit",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 24,
  padding: 14,
  background: "rgba(255,255,255,0.04)",
};

const emptyStateStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 24,
  padding: 24,
  background: "rgba(255,255,255,0.04)",
};
