"use client";

import { useEffect, useState } from "react";

import { BannerMotionPanel } from "@/components/banner-motion-panel";
import { RemotionBannerPickerButton } from "@/components/remotion-banner-picker-button";
import { RemotionImageUploadCard } from "@/components/remotion-image-upload-card";
import type { SupportedLocale } from "@/lib/i18n";

export type RemotionFlowCopy = {
  uploadStep: string;
  libraryStep: string;
  editorStep: string;
  remotionTitle: string;
  remotionHint: string;
  fallbackTitle: string;
  noSelectionText: string;
};

type RemotionPickerBanner = {
  id: string;
  title: string;
  format: string;
  outputImageUrl: string | null;
  createdAt: string;
};

type SelectedBanner = {
  id: string;
  title: string | null;
  djName: string | null;
  outputImageUrl: string | null;
};

type UploadedBanner = {
  id: string;
  title: string;
  outputImageUrl: string | null;
};

type MotionItem = {
  id: string;
  preset: any;
  transitionVariant?: string | null;
  status: any;
  renderProgress: number;
  outputVideoUrl?: string | null;
  errorMessage?: string | null;
  durationSeconds: number;
  queuePosition?: number | null;
  createdAt?: string | Date;
};

type SourceType = "manual" | "platform";

type ActiveFlyerSource =
  | {
      type: "manual-pending";
      fileName: string;
    }
  | {
      type: "manual";
      bannerId: string;
      title: string | null;
      outputImageUrl: string | null;
    }
  | {
      type: "platform";
      bannerId: string;
      title: string | null;
      outputImageUrl: string | null;
    }
  | {
      type: "selected";
      bannerId: string;
      title: string | null;
      outputImageUrl: string | null;
    };

const sourceCopyByLocale: Record<
  SupportedLocale,
  {
    sourceEyebrow: string;
    sourceTitle: string;
    emptyTitle: string;
    emptyText: string;
    manualPendingLabel: string;
    manualUploadedLabel: string;
    platformLabel: string;
    selectedLabel: string;
    manualPendingHint: string;
    sourceReadyHint: string;
    manualFileReadyNotice: string;
    platformRemovedNotice: string;
    manualRemovedNotice: string;
    platformSelectedNotice: string;
    manualUploadedNotice: string;
    sourceClearedNotice: string;
    clearSource: string;
    switchSource: string;
    noticeLabel: string;
    editorLockedPendingUpload: string;
  }
> = {
  "pt-BR": {
    sourceEyebrow: "Fonte atual do flyer",
    sourceTitle: "Imagem ativa para animação",
    emptyTitle: "Nenhum flyer selecionado ainda",
    emptyText:
      "Envie uma imagem do dispositivo ou escolha um flyer já gerado. O editor Remotion será liberado quando existir uma fonte ativa.",
    manualPendingLabel: "Upload manual pronto para envio",
    manualUploadedLabel: "Upload manual selecionado",
    platformLabel: "Flyer da plataforma selecionado",
    selectedLabel: "Flyer selecionado",
    manualPendingHint:
      "Este arquivo substituiu qualquer flyer anterior. O envio começou automaticamente e o editor será liberado ao finalizar.",
    sourceReadyHint:
      "Esta é a única imagem ativa no fluxo. Agora configure o motion logo abaixo.",
    manualFileReadyNotice:
      "Arquivo manual selecionado. Qualquer flyer anterior foi removido do fluxo.",
    platformRemovedNotice:
      "Arquivo manual selecionado. O flyer da plataforma anterior foi removido.",
    manualRemovedNotice:
      "Flyer da plataforma selecionado. O upload manual anterior foi removido.",
    platformSelectedNotice: "Flyer da plataforma selecionado com sucesso.",
    manualUploadedNotice:
      "Upload manual salvo com sucesso. Agora configure o motion.",
    sourceClearedNotice:
      "Fonte removida. Escolha ou envie um novo flyer para continuar.",
    clearSource: "Remover fonte",
    switchSource: "Troque a fonte acima se quiser usar outro flyer.",
    noticeLabel: "Atualização do fluxo",
    editorLockedPendingUpload:
      "O flyer escolhido está sendo enviado automaticamente. Aguarde para liberar o Editor Remotion.",
  },
  en: {
    sourceEyebrow: "Current flyer source",
    sourceTitle: "Active image for animation",
    emptyTitle: "No flyer selected yet",
    emptyText:
      "Upload an image from your device or choose a generated flyer. The Remotion editor unlocks when there is an active source.",
    manualPendingLabel: "Manual upload ready to send",
    manualUploadedLabel: "Manual upload selected",
    platformLabel: "Platform flyer selected",
    selectedLabel: "Flyer selected",
    manualPendingHint:
      "This file replaced any previous flyer. Upload started automatically and the editor will unlock when it finishes.",
    sourceReadyHint:
      "This is the only active image in the flow. Now configure the motion below.",
    manualFileReadyNotice:
      "Manual file selected. Any previous flyer was removed from the flow.",
    platformRemovedNotice:
      "Manual file selected. The previous platform flyer was removed.",
    manualRemovedNotice:
      "Platform flyer selected. The previous manual upload was removed.",
    platformSelectedNotice: "Platform flyer selected successfully.",
    manualUploadedNotice:
      "Manual upload saved successfully. Now configure the motion.",
    sourceClearedNotice:
      "Source removed. Choose or upload a new flyer to continue.",
    clearSource: "Remove source",
    switchSource: "Switch the source above if you want to use another flyer.",
    noticeLabel: "Flow update",
    editorLockedPendingUpload:
      "The chosen flyer is uploading automatically. Wait for it to unlock the Remotion editor.",
  },
  es: {
    sourceEyebrow: "Fuente actual del flyer",
    sourceTitle: "Imagen activa para animación",
    emptyTitle: "Aún no hay flyer seleccionado",
    emptyText:
      "Sube una imagen del dispositivo o elige un flyer ya generado. El editor Remotion se libera cuando exista una fuente activa.",
    manualPendingLabel: "Carga manual lista para enviar",
    manualUploadedLabel: "Carga manual seleccionada",
    platformLabel: "Flyer de la plataforma seleccionado",
    selectedLabel: "Flyer seleccionado",
    manualPendingHint:
      "Este archivo sustituyó cualquier flyer anterior. El envío comenzó automáticamente y el editor se liberará al finalizar.",
    sourceReadyHint:
      "Esta es la única imagen activa en el flujo. Ahora configura el motion abajo.",
    manualFileReadyNotice:
      "Archivo manual seleccionado. Cualquier flyer anterior fue removido del flujo.",
    platformRemovedNotice:
      "Archivo manual seleccionado. El flyer anterior de la plataforma fue removido.",
    manualRemovedNotice:
      "Flyer de la plataforma seleccionado. La carga manual anterior fue removida.",
    platformSelectedNotice: "Flyer de la plataforma seleccionado con éxito.",
    manualUploadedNotice:
      "Carga manual guardada con éxito. Ahora configura el motion.",
    sourceClearedNotice:
      "Fuente removida. Elige o sube un nuevo flyer para continuar.",
    clearSource: "Remover fuente",
    switchSource: "Cambia la fuente arriba si quieres usar otro flyer.",
    noticeLabel: "Actualización del flujo",
    editorLockedPendingUpload:
      "El flyer elegido se está subiendo automáticamente. Espera para liberar el Editor Remotion.",
  },
};

function removeBannerIdFromAddressBar() {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  url.searchParams.delete("bannerId");
  url.searchParams.delete("source");
  const query = url.searchParams.toString();
  const nextUrl = `${url.pathname}${query ? `?${query}` : ""}${url.hash}`;
  window.history.replaceState(null, "", nextUrl);
}

function buildInitialSource(
  selectedBanner: SelectedBanner | null,
  sourceType: SourceType | null,
): ActiveFlyerSource | null {
  if (!selectedBanner) return null;

  const shared = {
    bannerId: selectedBanner.id,
    title: selectedBanner.title || selectedBanner.djName,
    outputImageUrl: selectedBanner.outputImageUrl,
  };

  if (sourceType === "manual") {
    return {
      type: "manual",
      ...shared,
    };
  }

  if (sourceType === "platform") {
    return {
      type: "platform",
      ...shared,
    };
  }

  return {
    type: "selected",
    ...shared,
  };
}

function getSourceDisplay({
  source,
  fallbackTitle,
  copy,
}: {
  source: ActiveFlyerSource;
  fallbackTitle: string;
  copy: (typeof sourceCopyByLocale)[SupportedLocale];
}) {
  if (source.type === "manual-pending") {
    return {
      label: copy.manualPendingLabel,
      title: source.fileName,
      hint: copy.manualPendingHint,
      tone: "cyan",
    };
  }

  if (source.type === "manual") {
    return {
      label: copy.manualUploadedLabel,
      title: source.title || fallbackTitle,
      hint: copy.sourceReadyHint,
      tone: "cyan",
    };
  }

  if (source.type === "platform") {
    return {
      label: copy.platformLabel,
      title: source.title || fallbackTitle,
      hint: copy.sourceReadyHint,
      tone: "violet",
    };
  }

  return {
    label: copy.selectedLabel,
    title: source.title || fallbackTitle,
    hint: copy.sourceReadyHint,
    tone: "amber",
  };
}

export function RemotionFlowCard({
  locale,
  copy,
  pickerBanners,
  initialSelectedBanner,
  initialSourceType,
  initialMotions,
}: {
  locale: SupportedLocale;
  copy: RemotionFlowCopy;
  pickerBanners: RemotionPickerBanner[];
  initialSelectedBanner: SelectedBanner | null;
  initialSourceType?: SourceType | null;
  initialMotions: MotionItem[];
}) {
  const sourceCopy = sourceCopyByLocale[locale] || sourceCopyByLocale.en;
  const [selectedBanner, setSelectedBanner] = useState<SelectedBanner | null>(
    initialSelectedBanner,
  );
  const [selectedMotions, setSelectedMotions] =
    useState<MotionItem[]>(initialMotions);
  const [activeSource, setActiveSource] = useState<ActiveFlyerSource | null>(
    () => buildInitialSource(initialSelectedBanner, initialSourceType || null),
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [uploadResetKey, setUploadResetKey] = useState(0);

  useEffect(() => {
    if (!initialSelectedBanner) {
      setSelectedBanner(null);
      setSelectedMotions([]);
      setActiveSource((currentSource) =>
        currentSource?.type === "manual-pending" ? currentSource : null,
      );
      return;
    }

    setSelectedBanner(initialSelectedBanner);
    setSelectedMotions(initialMotions);
    setActiveSource(
      buildInitialSource(initialSelectedBanner, initialSourceType || null),
    );
  }, [initialSelectedBanner, initialSourceType, initialMotions]);

  useEffect(() => {
    if (!notice) return;

    const timeout = window.setTimeout(() => setNotice(null), 5200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function handleManualImageSelected(fileName: string) {
    setNotice(
      activeSource?.type === "platform" || activeSource?.type === "selected"
        ? sourceCopy.platformRemovedNotice
        : sourceCopy.manualFileReadyNotice,
    );
    setSelectedBanner(null);
    setSelectedMotions([]);
    setActiveSource({
      type: "manual-pending",
      fileName,
    });
    removeBannerIdFromAddressBar();
  }

  function handleManualUploadCompleted(banner: UploadedBanner) {
    setNotice(sourceCopy.manualUploadedNotice);
    setSelectedBanner({
      id: banner.id,
      title: banner.title,
      djName: null,
      outputImageUrl: banner.outputImageUrl,
    });
    setSelectedMotions([]);
    setActiveSource({
      type: "manual",
      bannerId: banner.id,
      title: banner.title,
      outputImageUrl: banner.outputImageUrl,
    });
  }

  function handlePlatformBannerSelected(banner: RemotionPickerBanner) {
    setNotice(
      activeSource?.type === "manual" || activeSource?.type === "manual-pending"
        ? sourceCopy.manualRemovedNotice
        : sourceCopy.platformSelectedNotice,
    );
    setUploadResetKey((currentKey) => currentKey + 1);
    setSelectedBanner({
      id: banner.id,
      title: banner.title,
      djName: null,
      outputImageUrl: banner.outputImageUrl,
    });
    setSelectedMotions([]);
    setActiveSource({
      type: "platform",
      bannerId: banner.id,
      title: banner.title,
      outputImageUrl: banner.outputImageUrl,
    });
  }

  function handleClearSource() {
    setNotice(sourceCopy.sourceClearedNotice);
    setUploadResetKey((currentKey) => currentKey + 1);
    setSelectedBanner(null);
    setSelectedMotions([]);
    setActiveSource(null);
    removeBannerIdFromAddressBar();
  }

  const sourceDisplay = activeSource
    ? getSourceDisplay({
        source: activeSource,
        fallbackTitle: copy.fallbackTitle,
        copy: sourceCopy,
      })
    : null;

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <div className="grid gap-3">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/62">
          {copy.uploadStep}
        </p>
        <RemotionImageUploadCard
          locale={locale}
          embedded
          resetKey={uploadResetKey}
          onManualImageSelected={handleManualImageSelected}
          onUploadCompleted={handleManualUploadCompleted}
        />
      </div>

      {pickerBanners.length > 0 ? (
        <div className="grid gap-3 border-t border-white/10 pt-6">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-violet-100/62">
            {copy.libraryStep}
          </p>
          <RemotionBannerPickerButton
            locale={locale}
            banners={pickerBanners}
            onSelectBanner={handlePlatformBannerSelected}
          />
        </div>
      ) : null}

      <div className="grid gap-3 border-t border-white/10 pt-6">
        <div className="relative overflow-hidden border border-cyan-300/14 bg-black/24 p-4 sm:p-5">
          <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/55 to-transparent" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-60 w-60 rounded-full bg-cyan-300/10 blur-3xl" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-[9px] font-black uppercase tracking-[0.22em] text-cyan-100/58">
                {sourceCopy.sourceEyebrow}
              </p>
              <h3 className="mt-2 text-xl font-black uppercase tracking-[-0.04em] text-white">
                {sourceCopy.sourceTitle}
              </h3>

              {sourceDisplay ? (
                <div className="mt-4 grid gap-2">
                  <span
                    className={
                      sourceDisplay.tone === "violet"
                        ? "w-fit border border-violet-200/25 bg-violet-300/[0.10] px-3 py-1 font-mono text-[9px] font-black uppercase tracking-[0.16em] text-violet-100"
                        : sourceDisplay.tone === "amber"
                          ? "w-fit border border-amber-200/25 bg-amber-300/[0.10] px-3 py-1 font-mono text-[9px] font-black uppercase tracking-[0.16em] text-amber-100"
                          : "w-fit border border-cyan-200/25 bg-cyan-300/[0.10] px-3 py-1 font-mono text-[9px] font-black uppercase tracking-[0.16em] text-cyan-100"
                    }
                  >
                    {sourceDisplay.label}
                  </span>
                  <p className="line-clamp-2 text-base font-black text-white sm:text-lg">
                    {sourceDisplay.title}
                  </p>
                  <p className="max-w-2xl text-xs leading-5 text-white/46 sm:text-sm sm:leading-6">
                    {sourceDisplay.hint}
                  </p>
                </div>
              ) : (
                <div className="mt-4 border border-white/10 bg-white/[0.025] p-4">
                  <p className="text-sm font-black uppercase tracking-[-0.02em] text-white/78">
                    {sourceCopy.emptyTitle}
                  </p>
                  <p className="mt-2 max-w-2xl text-xs leading-5 text-white/45 sm:text-sm sm:leading-6">
                    {sourceCopy.emptyText}
                  </p>
                </div>
              )}
            </div>

            {activeSource ? (
              <button
                type="button"
                onClick={handleClearSource}
                className="inline-flex min-h-10 shrink-0 items-center justify-center border border-white/10 bg-white/[0.035] px-4 font-mono text-[9px] font-black uppercase tracking-[0.16em] text-white/62 transition hover:border-red-300/35 hover:bg-red-500/10 hover:text-red-100"
              >
                {sourceCopy.clearSource}
              </button>
            ) : null}
          </div>

          {notice ? (
            <div className="relative mt-4 border border-emerald-300/18 bg-emerald-300/[0.08] p-3">
              <p className="font-mono text-[8px] font-black uppercase tracking-[0.2em] text-emerald-100/70">
                {sourceCopy.noticeLabel}
              </p>
              <p className="mt-1 text-xs font-semibold leading-5 text-emerald-50/82">
                {notice}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 border-t border-white/10 pt-6">
        <div>
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-amber-100/62">
            {copy.editorStep}
          </p>
          <h3 className="mt-2 text-xl font-black uppercase tracking-[-0.04em] text-white">
            {copy.remotionTitle}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
            {copy.remotionHint}
          </p>
        </div>

        {selectedBanner ? (
          <BannerMotionPanel
            key={selectedBanner.id}
            bannerId={selectedBanner.id}
            locale={locale}
            disabled={!selectedBanner.outputImageUrl}
            embedded
            initialMotions={selectedMotions}
          />
        ) : (
          <div className="border border-white/10 bg-black/22 p-6 text-center text-sm leading-6 text-white/48">
            {activeSource?.type === "manual-pending"
              ? sourceCopy.editorLockedPendingUpload
              : copy.noSelectionText}
          </div>
        )}

        {activeSource ? (
          <p className="text-center text-[11px] leading-5 text-white/34">
            {sourceCopy.switchSource}
          </p>
        ) : null}
      </div>
    </div>
  );
}
