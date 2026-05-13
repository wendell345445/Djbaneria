import Link from "next/link";

import { DashboardLibraryStyle } from "@/components/dashboard-library-style";
import { normalizeLocale, type AppLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { requireCurrentWorkspace } from "@/lib/workspace";

const bannersPageCopy = {
  "pt-BR": {
    eyebrow: "Biblioteca de flyers",
    title: "Seus flyers profissionais em um só lugar",
    description:
      "Acesse, revise e reutilize as artes geradas para seus eventos. Tudo organizado para você abrir pelo celular e continuar criando rápido.",
    newBanner: "Criar novo flyer",
    totalLabel: "Flyers criados",
    readyLabel: "Com preview",
    formatLabel: "Formatos usados",
    libraryTitle: "Últimos flyers",
    libraryDescription: "Abra qualquer arte para visualizar, editar ou baixar novamente.",
    emptyTitle: "Sua biblioteca ainda está vazia",
    emptyDescription:
      "Crie seu primeiro flyer com IA e comece a montar um histórico visual premium para suas divulgações.",
    firstBanner: "Criar meu primeiro flyer",
    noPreview: "Sem preview",
    fallbackTitle: "Flyer sem título",
    fallbackDjName: "Nome do DJ não informado",
    fallbackAlt: "Flyer gerado",
    open: "Abrir flyer",
    dateLocale: "pt-BR",
  },
  en: {
    eyebrow: "Flyer library",
    title: "Your professional flyers in one place",
    description:
      "Access, review and reuse the artwork generated for your events. Everything is organized for fast mobile creation.",
    newBanner: "Create new flyer",
    totalLabel: "Flyers created",
    readyLabel: "With preview",
    formatLabel: "Formats used",
    libraryTitle: "Latest flyers",
    libraryDescription: "Open any artwork to preview, edit or download it again.",
    emptyTitle: "Your library is still empty",
    emptyDescription:
      "Create your first AI flyer and start building a premium visual history for your promotions.",
    firstBanner: "Create my first flyer",
    noPreview: "No preview",
    fallbackTitle: "Untitled flyer",
    fallbackDjName: "No DJ name provided",
    fallbackAlt: "Generated flyer",
    open: "Open flyer",
    dateLocale: "en-US",
  },
  es: {
    eyebrow: "Biblioteca de flyers",
    title: "Tus flyers profesionales en un solo lugar",
    description:
      "Accede, revisa y reutiliza las artes generadas para tus eventos. Todo organizado para crear rápido desde el móvil.",
    newBanner: "Crear nuevo flyer",
    totalLabel: "Flyers creados",
    readyLabel: "Con vista previa",
    formatLabel: "Formatos usados",
    libraryTitle: "Últimos flyers",
    libraryDescription: "Abre cualquier arte para verla, editarla o descargarla de nuevo.",
    emptyTitle: "Tu biblioteca aún está vacía",
    emptyDescription:
      "Crea tu primer flyer con IA y empieza a construir un historial visual premium para tus promociones.",
    firstBanner: "Crear mi primer flyer",
    noPreview: "Sin vista previa",
    fallbackTitle: "Flyer sin título",
    fallbackDjName: "Nombre del DJ no informado",
    fallbackAlt: "Flyer generado",
    open: "Abrir flyer",
    dateLocale: "es-ES",
  },
} as const;

const REMOTION_UPLOAD_MODEL_NAME = "user-upload-remotion";

export default async function BannersPage() {
  const workspace = await requireCurrentWorkspace();
  const locale = normalizeLocale(workspace.user?.preferredLocale);
  const copy = bannersPageCopy[locale] ?? bannersPageCopy.en;

  const banners = await prisma.banner.findMany({
    where: {
      workspaceId: workspace.id,
      NOT: {
        modelName: REMOTION_UPLOAD_MODEL_NAME,
      },
    },
    orderBy: {
      createdAt: "desc",
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

  const readyCount = banners.filter((banner) => Boolean(banner.outputImageUrl)).length;
  const formatCount = new Set(banners.map((banner) => banner.format)).size;

  return (
    <main className="library-root relative min-h-screen overflow-hidden px-4 pb-10 pt-4 text-white sm:px-6 lg:px-8 lg:py-8">
      <DashboardLibraryStyle />
      <div className="pointer-events-none absolute inset-0 z-0 library-grid-bg" />
      <div className="pointer-events-none absolute left-[-120px] top-[-120px] z-0 h-[320px] w-[320px] rounded-full bg-[rgba(0,245,255,0.16)] blur-[90px] library-glow-a" />
      <div className="pointer-events-none absolute right-[-160px] top-[24%] z-0 h-[360px] w-[360px] rounded-full bg-[rgba(191,95,255,0.17)] blur-[100px] library-glow-b" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[18%] z-0 h-[360px] w-[360px] rounded-full bg-[rgba(255,45,107,0.10)] blur-[110px]" />

      <div className="relative z-10 mx-auto w-full max-w-[1320px]">
        <section id="flyers" className="library-panel p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="library-mono text-[9px] uppercase tracking-[0.24em] text-[rgba(0,245,255,0.52)]">
                {copy.libraryTitle}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/58">
                {copy.libraryDescription}
              </p>
            </div>

            {banners.length > 0 ? (
              <Link
                href="/dashboard/banners/new"
                className="library-btn min-h-[44px] px-4 text-[9px]"
              >
                {copy.newBanner}
              </Link>
            ) : null}
          </div>

          {banners.length === 0 ? (
            <div className="mt-5 border border-dashed border-[rgba(0,245,255,0.18)] bg-[rgba(0,245,255,0.035)] p-6 text-center sm:p-10">
              <p className="library-orb text-lg font-bold uppercase text-white sm:text-2xl">
                {copy.emptyTitle}
              </p>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/58">
                {copy.emptyDescription}
              </p>

              <Link
                href="/dashboard/banners/new"
                className="library-btn-solid mt-6 inline-flex min-h-[48px] px-5 text-[10px]"
              >
                {copy.firstBanner}
              </Link>
            </div>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {banners.map((banner) => (
                <BannerLibraryCard
                  key={banner.id}
                  banner={banner}
                  copy={copy}
                  locale={locale}
                />
              ))}
            </div>
          )}
        </section>

        <section className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="library-panel library-hero relative overflow-hidden p-5 sm:p-6 lg:p-7">
            <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[var(--cx)] to-transparent opacity-70" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[rgba(0,245,255,0.12)] blur-3xl" />

            <div className="relative z-10">
              <div className="library-section-label">
                <span className="library-chip">● {copy.eyebrow}</span>
              </div>

              <h1 className="library-orb mt-5 max-w-4xl text-[30px] font-black uppercase leading-[0.96] tracking-[-0.05em] text-white sm:text-5xl lg:text-[62px]">
                {copy.title}
              </h1>

              <p className="mt-4 max-w-2xl text-[14px] leading-7 text-white/58 sm:text-[15px]">
                {copy.description}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard/banners/new"
                  className="library-btn-solid min-h-[50px] px-5 text-[10px]"
                >
                  {copy.newBanner}
                </Link>
              </div>
            </div>
          </div>

          <aside className="library-panel relative overflow-hidden p-5">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[rgba(191,95,255,0.14)] blur-3xl" />
            <div className="relative z-10 grid gap-3">
              <LibraryMetric label={copy.totalLabel} value={String(banners.length)} tone="cyan" />
              <LibraryMetric label={copy.readyLabel} value={String(readyCount)} tone="violet" />
              <LibraryMetric label={copy.formatLabel} value={String(formatCount)} tone="green" />
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function LibraryMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "violet" | "green";
}) {
  const toneClass =
    tone === "cyan"
      ? "text-[var(--cx)]"
      : tone === "violet"
        ? "text-[var(--cv)]"
        : "text-[var(--cg)]";

  return (
    <div className="library-soft-panel p-4">
      <p className={`library-mono text-[9px] uppercase tracking-[0.2em] ${toneClass}`}>
        {label}
      </p>
      <p className="library-orb mt-2 text-3xl font-black text-white sm:text-4xl">
        {value}
      </p>
    </div>
  );
}

function BannerLibraryCard({
  banner,
  copy,
  locale,
}: {
  banner: {
    id: string;
    title: string | null;
    djName: string | null;
    format: string;
    outputImageUrl: string | null;
    createdAt: Date;
  };
  copy: (typeof bannersPageCopy)[AppLocale];
  locale: AppLocale;
}) {
  const title = banner.title || copy.fallbackTitle;

  return (
    <Link
      href={`/dashboard/banners/${banner.id}`}
      className="library-card group block active:scale-[0.99]"
    >
      <div className="library-media relative aspect-[4/5] overflow-hidden">
        {banner.outputImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={banner.outputImageUrl}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-white/45">
            {copy.noPreview}
          </div>
        )}

        <span className="library-chip absolute left-3 top-3 z-10 bg-black/55 backdrop-blur">
          {formatBannerFormat(banner.format)}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-white">
              {title}
            </h2>
            <p className="mt-1 truncate text-sm text-white/50">
              {banner.djName || copy.fallbackDjName}
            </p>
          </div>
        </div>

        <p className="library-mono mt-3 text-[9px] uppercase tracking-[0.12em] text-white/36">
          {formatDate(banner.createdAt, locale)}
        </p>

        <span className="library-btn mt-4 flex min-h-[40px] w-full px-3 text-[9px]">
          {copy.open}
        </span>
      </div>
    </Link>
  );
}

function formatBannerFormat(value: string) {
  return value.replace(/_/g, " ");
}

function formatDate(date: Date, locale: AppLocale) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
