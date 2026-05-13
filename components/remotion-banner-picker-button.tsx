"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ImageIcon, Search, Sparkles, X } from "lucide-react";

import type { SupportedLocale } from "@/lib/i18n";

type RemotionPickerBanner = {
  id: string;
  title: string;
  format: string;
  outputImageUrl: string | null;
  createdAt: string;
};

const copyByLocale: Record<
  SupportedLocale,
  {
    trigger: string;
    modalEyebrow: string;
    modalTitle: string;
    modalSubtitle: string;
    searchPlaceholder: string;
    emptyTitle: string;
    emptyText: string;
    select: string;
    close: string;
    noPreview: string;
    sourceLabel: string;
    useThisFlyer: string;
  }
> = {
  "pt-BR": {
    trigger: "Escolher flyer já gerado",
    modalEyebrow: "Biblioteca de flyers",
    modalTitle: "Escolha um flyer da plataforma",
    modalSubtitle:
      "Selecione uma arte pronta para usar no Remotion.",
    searchPlaceholder: "Buscar flyer...",
    emptyTitle: "Nenhum flyer encontrado",
    emptyText: "Tente outro termo ou envie um flyer do seu dispositivo.",
    select: "Selecionado",
    close: "Fechar",
    noPreview: "Sem preview",
    sourceLabel: "Flyer da plataforma",
    useThisFlyer: "Usar este flyer",
  },
  en: {
    trigger: "Choose existing flyer",
    modalEyebrow: "Flyer library",
    modalTitle: "Choose a flyer from the platform",
    modalSubtitle: "Select a ready-made artwork to use in Remotion.",
    searchPlaceholder: "Search flyer...",
    emptyTitle: "No flyers found",
    emptyText: "Try another term or upload a flyer from your device.",
    select: "Selected",
    close: "Close",
    noPreview: "No preview",
    sourceLabel: "Platform flyer",
    useThisFlyer: "Use this flyer",
  },
  es: {
    trigger: "Elegir flyer ya generado",
    modalEyebrow: "Biblioteca de flyers",
    modalTitle: "Elige un flyer de la plataforma",
    modalSubtitle: "Selecciona un arte listo para usar en Remotion.",
    searchPlaceholder: "Buscar flyer...",
    emptyTitle: "No se encontraron flyers",
    emptyText: "Prueba otro término o sube un flyer desde tu dispositivo.",
    select: "Seleccionado",
    close: "Cerrar",
    noPreview: "Sin preview",
    sourceLabel: "Flyer de la plataforma",
    useThisFlyer: "Usar este flyer",
  },
};

const dateLocales: Record<SupportedLocale, string> = {
  "pt-BR": "pt-BR",
  en: "en-US",
  es: "es-ES",
};

export function RemotionBannerPickerButton({
  locale,
  banners,
}: {
  locale: SupportedLocale;
  banners: RemotionPickerBanner[];
}) {
  const copy = copyByLocale[locale] || copyByLocale.en;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredBanners = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return banners;

    return banners.filter((banner) => {
      return `${banner.title} ${banner.format}`.toLowerCase().includes(normalizedQuery);
    });
  }, [banners, query]);

  function selectBanner(bannerId: string) {
    setOpen(false);
    router.replace(`/dashboard/remotion?bannerId=${bannerId}&source=platform`);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative inline-flex min-h-11 w-full items-center justify-center gap-2 overflow-hidden border border-[rgba(0,245,255,0.2)] bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] px-4 text-center font-mono text-[10px] font-black uppercase tracking-[0.16em] text-cyan-50 transition hover:border-[rgba(0,245,255,0.38)] hover:bg-[linear-gradient(160deg,rgba(0,245,255,0.12),rgba(191,95,255,0.08))]"
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,245,255,0.75)] to-transparent" />
        <ImageIcon size={14} className="text-cyan-200" />
        {copy.trigger}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-[rgba(2,4,10,0.82)] px-3 pb-3 pt-10 backdrop-blur-xl sm:items-center sm:p-5">
          <div className="relative flex max-h-[85dvh] w-full max-w-2xl flex-col overflow-hidden rounded-[24px] border border-[rgba(0,245,255,0.2)] bg-[#050713] shadow-[0_0_60px_rgba(0,245,255,0.12),0_32px_120px_rgba(0,0,0,0.72)] sm:rounded-[28px]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,245,255,0.85)] to-transparent" />
            <div className="pointer-events-none absolute -right-20 top-0 h-40 w-40 rounded-full bg-[rgba(0,245,255,0.12)] blur-3xl" />
            <div className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-[rgba(191,95,255,0.14)] blur-3xl" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(0,245,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,245,255,0.04)_1px,transparent_1px)] [background-size:24px_24px]" />

            <div className="relative flex items-start justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 border border-[rgba(0,245,255,0.16)] bg-[rgba(0,245,255,0.06)] px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-100/80">
                  <Sparkles size={10} />
                  {copy.modalEyebrow}
                </div>
                <h2 className="mt-3 text-lg font-black uppercase tracking-[-0.03em] text-white sm:text-xl">
                  {copy.modalTitle}
                </h2>
                <p className="mt-1 text-xs leading-5 text-white/52 sm:text-sm">
                  {copy.modalSubtitle}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={copy.close}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/66 transition hover:border-[rgba(0,245,255,0.34)] hover:text-cyan-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative border-b border-white/10 px-4 py-3 sm:px-5">
              <label className="relative block">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cyan-100/45"
                />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={copy.searchPlaceholder}
                  className="h-11 w-full rounded-full border border-[rgba(0,245,255,0.16)] bg-black/30 pl-10 pr-4 text-sm font-medium text-white outline-none placeholder:text-white/28 focus:border-[rgba(0,245,255,0.42)]"
                />
              </label>
            </div>

            <div className="relative min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
              {filteredBanners.length > 0 ? (
                <div className="grid gap-3">
                  {filteredBanners.map((banner) => (
                    <button
                      key={banner.id}
                      type="button"
                      onClick={() => selectBanner(banner.id)}
                      className="group relative overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-3 text-left transition hover:border-[rgba(0,245,255,0.28)] hover:bg-[linear-gradient(160deg,rgba(0,245,255,0.08),rgba(191,95,255,0.06))]"
                    >
                      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,245,255,0.55)] to-transparent opacity-0 transition group-hover:opacity-100" />

                      <div className="flex items-center gap-3">
                        <div className="h-[84px] w-[68px] shrink-0 overflow-hidden rounded-[16px] border border-white/10 bg-black/30 sm:h-[96px] sm:w-[76px]">
                          {banner.outputImageUrl ? (
                            <img
                              src={banner.outputImageUrl}
                              alt={banner.title}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                            />
                          ) : (
                            <div className="grid h-full place-items-center px-2 text-center text-[10px] text-white/35">
                              {copy.noPreview}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center border border-[rgba(0,245,255,0.16)] bg-[rgba(0,245,255,0.06)] px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-cyan-100/78">
                              {copy.sourceLabel}
                            </span>
                            <span className="inline-flex items-center border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white/58">
                              {banner.format}
                            </span>
                          </div>

                          <p className="mt-2 line-clamp-2 text-sm font-black leading-5 text-white sm:text-[15px]">
                            {banner.title}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-white/42 sm:text-xs">
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays size={12} className="text-cyan-100/50" />
                              {new Intl.DateTimeFormat(dateLocales[locale], {
                                day: "2-digit",
                                month: "short",
                              }).format(new Date(banner.createdAt))}
                            </span>
                          </div>
                        </div>

                        <span className="hidden shrink-0 items-center justify-center rounded-full border border-[rgba(0,245,255,0.22)] bg-cyan-300 px-3 py-2 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-[#031013] shadow-[0_0_30px_rgba(0,245,255,0.16)] sm:inline-flex">
                          {copy.useThisFlyer}
                        </span>
                      </div>

                      <span className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-full border border-[rgba(0,245,255,0.2)] bg-[rgba(0,245,255,0.08)] font-mono text-[10px] font-black uppercase tracking-[0.14em] text-cyan-100 transition group-hover:border-[rgba(0,245,255,0.36)] group-hover:bg-cyan-300 group-hover:text-[#031013] sm:hidden">
                        {copy.useThisFlyer}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] px-5 py-8 text-center">
                  <p className="text-base font-black uppercase tracking-[-0.03em] text-white sm:text-lg">
                    {copy.emptyTitle}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/48">{copy.emptyText}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
