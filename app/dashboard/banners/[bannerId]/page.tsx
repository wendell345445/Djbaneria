import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { normalizeLocale, type SupportedLocale } from "@/lib/i18n";
import { requireCurrentWorkspace } from "@/lib/workspace";

const bannerDetailsCopy: Record<
  SupportedLocale,
  {
    eyebrow: string;
    fallbackTitle: string;
    subtitle: string;
    back: string;
    download: string;
    noPreview: string;
    detailsTitle: string;
    mainText: string;
    djName: string;
    format: string;
    createdAt: string;
    untitled: string;
    noDjName: string;
    unavailable: string;
  }
> = {
  "pt-BR": {
    eyebrow: "Banner gerado",
    fallbackTitle: "Banner sem título",
    subtitle: "Texto principal do banner",
    back: "Voltar",
    download: "Baixar banner",
    noPreview: "Sem preview disponível",
    detailsTitle: "Detalhes da arte",
    mainText: "Texto principal",
    djName: "Nome do DJ",
    format: "Formato",
    createdAt: "Criado em",
    untitled: "Sem título",
    noDjName: "Sem nome do DJ",
    unavailable: "Não informado",
  },
  en: {
    eyebrow: "Generated banner",
    fallbackTitle: "Untitled banner",
    subtitle: "Main banner text",
    back: "Back",
    download: "Download banner",
    noPreview: "No preview available",
    detailsTitle: "Artwork details",
    mainText: "Main text",
    djName: "DJ name",
    format: "Format",
    createdAt: "Created at",
    untitled: "Untitled",
    noDjName: "No DJ name",
    unavailable: "Not provided",
  },
  es: {
    eyebrow: "Banner generado",
    fallbackTitle: "Banner sin título",
    subtitle: "Texto principal del banner",
    back: "Volver",
    download: "Descargar banner",
    noPreview: "Vista previa no disponible",
    detailsTitle: "Detalles del arte",
    mainText: "Texto principal",
    djName: "Nombre del DJ",
    format: "Formato",
    createdAt: "Creado el",
    untitled: "Sin título",
    noDjName: "Sin nombre del DJ",
    unavailable: "No informado",
  },
};

const intlLocales: Record<SupportedLocale, string> = {
  "pt-BR": "pt-BR",
  en: "en-US",
  es: "es-ES",
};

export default async function BannerDetailsPage({
  params,
}: {
  params: Promise<{ bannerId: string }>;
}) {
  const { bannerId } = await params;
  const workspace = await requireCurrentWorkspace();
  const locale = normalizeLocale(workspace.user?.preferredLocale);
  const copy = bannerDetailsCopy[locale];

  const banner = await prisma.banner.findFirst({
    where: {
      id: bannerId,
      workspaceId: workspace.id,
    },
    select: {
      id: true,
      title: true,
      djName: true,
      format: true,
      outputImageUrl: true,
      createdAt: true,
    },
  });

  if (!banner) {
    notFound();
  }

  const title = banner.title || copy.fallbackTitle;
  const formattedDate = new Intl.DateTimeFormat(intlLocales[locale], {
    dateStyle: "short",
    timeStyle: "short",
  }).format(banner.createdAt);

  return (
    <main className="mx-auto max-w-[1200px] px-5 py-7">
      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="m-0 text-[11px] uppercase tracking-[0.22em] text-white/45">
            {copy.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-white md:text-[38px]">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/60">
            {copy.subtitle}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/dashboard/banners" style={secondaryButtonStyle}>
            {copy.back}
          </Link>
          <a href={`/api/banners/download/${banner.id}`} style={primaryButtonStyle}>
            {copy.download}
          </a>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] lg:items-start">
        <section style={panelStyle}>
          {banner.outputImageUrl ? (
            <img
              src={banner.outputImageUrl}
              alt={title}
              style={{
                width: "100%",
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
          ) : (
            <div className="grid aspect-[4/5] place-items-center rounded-[20px] border border-white/10 bg-white/[0.03] text-sm text-white/45">
              {copy.noPreview}
            </div>
          )}
        </section>

        <section style={panelStyle}>
          <h2 style={sectionTitleStyle}>{copy.detailsTitle}</h2>
          <InfoRow label={copy.mainText} value={banner.title || copy.untitled} />
          <InfoRow label={copy.djName} value={banner.djName || copy.noDjName} />
          <InfoRow label={copy.format} value={banner.format || copy.unavailable} />
          <InfoRow label={copy.createdAt} value={formattedDate} />
        </section>
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
        padding: "12px 0",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <span style={{ opacity: 0.64 }}>{label}</span>
      <strong style={{ textAlign: "right" }}>{value}</strong>
    </div>
  );
}

const panelStyle: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 24,
  padding: 20,
  background: "rgba(255,255,255,0.04)",
};

const sectionTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 14,
  fontSize: 20,
};

const primaryButtonStyle: CSSProperties = {
  display: "inline-flex",
  minHeight: 48,
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  color: "#020617",
  background: "linear-gradient(90deg, #7dd3fc, #c4b5fd, #fde68a)",
  borderRadius: 16,
  padding: "13px 18px",
  fontWeight: 700,
};

const secondaryButtonStyle: CSSProperties = {
  ...primaryButtonStyle,
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.1)",
};
