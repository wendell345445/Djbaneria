import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

export default async function BannerDetailsPage({
  params,
}: {
  params: Promise<{ bannerId: string }>;
}) {
  const { bannerId } = await params;

  const banner = await prisma.banner.findUnique({
    where: { id: bannerId },
  });

  if (!banner) {
    notFound();
  }

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "flex-start",
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              opacity: 0.64,
              textTransform: "uppercase",
              letterSpacing: 1.4,
              fontSize: 12,
            }}
          >
            Banner gerado
          </p>
          <h1 style={{ fontSize: 34, margin: "10px 0 6px" }}>{banner.title}</h1>
          <p style={{ margin: 0, opacity: 0.8 }}>
            Texto principal do banner
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/dashboard/banners" style={secondaryButtonStyle}>
            Voltar
          </Link>
          <a href={`/api/banners/download/${banner.id}`} style={primaryButtonStyle}>
            Baixar banner
          </a>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gap: 20,
          gridTemplateColumns: "minmax(0, 520px) minmax(0, 1fr)",
          alignItems: "start",
        }}
      >
        <div style={panelStyle}>
          {banner.outputImageUrl ? (
            <img
              src={banner.outputImageUrl}
              alt={banner.title}
              style={{
                width: "100%",
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
          ) : null}
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <section style={panelStyle}>
            <h2 style={sectionTitleStyle}>Informações do banner</h2>
            <InfoRow label="Texto principal do banner" value={banner.title} />
            <InfoRow label="Nome do DJ" value={banner.djName || "-"} />
            <InfoRow
              label="Chamada secundária"
              value={banner.eventName || "-"}
            />
            <InfoRow label="Data do evento" value={banner.eventDate || "-"} />
            <InfoRow
              label="Local do evento"
              value={banner.eventLocation || "-"}
            />
            <InfoRow label="Estilo visual" value={banner.stylePreset} />
            <InfoRow label="Formato" value={banner.format} />
            <InfoRow label="Modelo" value={banner.modelName} />
            <InfoRow label="Status" value={banner.status} />
            <InfoRow
              label="Tempo de geração"
              value={banner.generationSeconds ? `${banner.generationSeconds}s` : "-"}
            />
            <InfoRow
              label="Criado em"
              value={new Intl.DateTimeFormat("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
              }).format(banner.createdAt)}
            />
          </section>

          <section style={panelStyle}>
            <h2 style={sectionTitleStyle}>Prompt enviado</h2>
            <pre style={preStyle}>{banner.prompt}</pre>
          </section>

          {banner.revisedPrompt ? (
            <section style={panelStyle}>
              <h2 style={sectionTitleStyle}>Prompt revisado pela OpenAI</h2>
              <pre style={preStyle}>{banner.revisedPrompt}</pre>
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        padding: "10px 0",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <span style={{ opacity: 0.64 }}>{label}</span>
      <strong style={{ textAlign: "right" }}>{value}</strong>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 24,
  padding: 20,
  background: "rgba(255,255,255,0.04)",
};

const sectionTitleStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 14,
  fontSize: 20,
};

const preStyle: React.CSSProperties = {
  margin: 0,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  fontFamily: "inherit",
  fontSize: 14,
  lineHeight: 1.6,
  opacity: 0.88,
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
