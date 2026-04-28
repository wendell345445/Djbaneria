"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, type ReactNode } from "react";
import type { SubscriptionPlan } from "@/generated/prisma/enums";
import {
  getAllowedBannerQualities,
  getDefaultBannerQuality,
  type BannerImageQuality,
} from "@/lib/plans";
import { isBannerStyleProOnly } from "@/lib/banner-style-access";

const stylePresets = [
  { value: "NEON_CLUB", label: "Neon Club" },
  { value: "FESTIVAL_MAINSTAGE", label: "Festival Mainstage" },
  { value: "CYBER_RAVE", label: "Cyber Rave" },
  { value: "DARK_TECHNO", label: "Dark Techno" },
  { value: "CHROME_FUTURE", label: "Chrome Future" },
  { value: "AFRO_HOUSE_SUNSET", label: "Afro House Sunset" },
  { value: "Y2K_CLUB", label: "Y2K Club" },
  { value: "PREMIUM_BLACK", label: "Premium Black" },
  { value: "SUMMER_VIBES", label: "Summer Vibes" },
  { value: "MINIMAL_TECHNO", label: "Minimal Techno" },
  { value: "LUXURY_GOLD", label: "Luxury Gold" },
] as const;

const formats = [
  { value: "POST_FEED", label: "Feed" },
  { value: "STORY", label: "Story" },
] as const;

const generateSteps = [
  "Preparando os dados do banner",
  "Enviando composição para a IA",
  "Gerando o preview visual",
  "Finalizando o resultado",
];

const editSteps = [
  "Analisando a arte atual",
  "Aplicando suas instruções na composição",
  "Renderizando a nova versão",
  "Finalizando os ajustes da arte",
];

const qualityOptions: {
  value: BannerImageQuality;
  label: string;
}[] = [
  {
    value: "low",
    label: "Rápido",
  },
  {
    value: "medium",
    label: "Equilibrado",
  },
  {
    value: "high",
    label: "Alta qualidade",
  },
];

type GenerationResult = {
  imageUrl: string;
  bannerId?: string | null;
  bannerUrl?: string | null;
  saved?: boolean;
};

type BannerStatusResponse = {
  success?: boolean;
  bannerId?: string;
  status?: string;
  imageUrl?: string | null;
  bannerUrl?: string | null;
  progress?: number;
  activeStep?: number;
  remainingCredits?: number | null;
  isAdminUnlimited?: boolean;
  message?: string;
  error?: string;
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Não foi possível ler a imagem enviada."));
        return;
      }
      resolve(result);
    };

    reader.onerror = () => {
      reject(new Error("Não foi possível ler a imagem enviada."));
    };

    reader.readAsDataURL(file);
  });
}

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/50 focus:ring-4 focus:ring-sky-400/10 placeholder:text-white/35";

const selectClassName = `${inputClassName} [color-scheme:dark]`;

function getPreviewAspectClass(format: string) {
  switch (format) {
    case "STORY":
      return "aspect-[2/3]";
    case "POST_FEED":
    default:
      return "aspect-[4/5]";
  }
}

function getFormatLabel(format: string) {
  return formats.find((item) => item.value === format)?.label ?? format;
}

function getLoadingProgress(activeStep: number) {
  switch (activeStep) {
    case 0:
      return 16;
    case 1:
      return 38;
    case 2:
      return 72;
    case 3:
      return 94;
    default:
      return 16;
  }
}

function buildLoadingTexts(mode: "generate" | "edit" | null) {
  if (mode === "edit") {
    return {
      title: "A IA está aplicando sua alteração",
      badge: "Alterando",
      chip: "Edit IA",
      helper:
        "A imagem atual está sendo usada como base para criar uma nova versão.",
    };
  }

  return {
    title: "A IA está montando sua composição",
    badge: "Processando",
    chip: "Render IA",
    helper: "A IA está preparando seu banner com base no briefing informado.",
  };
}

function isCreditExhaustedMessage(message: string) {
  const normalized = message.toLowerCase();

  return (
    normalized.includes("crédito") ||
    normalized.includes("créditos") ||
    normalized.includes("credito") ||
    normalized.includes("creditos")
  );
}

type NewBannerFormLocale = "pt-BR" | "en" | "es";

export function NewBannerForm({
  currentPlan,
  isAdmin = false,
  canGenerateBanner = true,
  initialRemainingCredits = null,
  locale = "en",
}: {
  currentPlan: SubscriptionPlan;
  isAdmin?: boolean;
  canGenerateBanner?: boolean;
  initialRemainingCredits?: number | null;
  locale?: NewBannerFormLocale;
}) {
  void locale;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState("");
  const [remainingCredits, setRemainingCredits] = useState<number | null>(
    initialRemainingCredits,
  );
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [loadingMode, setLoadingMode] = useState<"generate" | "edit" | null>(
    null,
  );
  const [editPrompt, setEditPrompt] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [showCreditUpgrade, setShowCreditUpgrade] = useState(
    !isAdmin && !canGenerateBanner,
  );
  const previewRef = useRef<HTMLElement | null>(null);
  const allowedQualities = useMemo(
    () => getAllowedBannerQualities(currentPlan, isAdmin),
    [currentPlan, isAdmin],
  );

  const [form, setForm] = useState({
    mainText: "",
    djName: "",
    secondaryText: "",
    eventDate: "",
    eventLocation: "",
    stylePreset: "NEON_CLUB",
    format: "POST_FEED",
    quality: getDefaultBannerQuality(currentPlan, isAdmin),
  });

  const completion = useMemo(() => {
    const required = [
      form.mainText.trim(),
      form.djName.trim(),
      form.eventDate.trim(),
      form.eventLocation.trim(),
    ];
    const done = required.filter(Boolean).length;
    return Math.round((done / required.length) * 100);
  }, [form]);

  const previewAspectClass = useMemo(
    () => getPreviewAspectClass(form.format),
    [form.format],
  );

  const previewFormatLabel = useMemo(
    () => getFormatLabel(form.format),
    [form.format],
  );

  const loadingProgress = useMemo(
    () => getLoadingProgress(activeStep),
    [activeStep],
  );

  const displayLoading = loading || editLoading;
  const currentSteps = loadingMode === "edit" ? editSteps : generateSteps;
  const loadingTexts = buildLoadingTexts(loadingMode);
  const hasNoCredits =
    !isAdmin &&
    (!canGenerateBanner ||
      (typeof remainingCredits === "number" && remainingCredits <= 0));
  const shouldShowCreditUpgrade = showCreditUpgrade || hasNoCredits;
  const shouldLockProStyles = !isAdmin && currentPlan === "FREE";

  function scrollToPreview() {
    window.setTimeout(() => {
      previewRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 120);
  }

  async function waitForGeneratedBanner(
    bannerId: string,
  ): Promise<GenerationResult> {
    const maxAttempts = 90;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      await new Promise((resolve) =>
        window.setTimeout(resolve, attempt === 0 ? 1200 : 2000),
      );

      const response = await fetch(`/api/banners/status/${bannerId}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as BannerStatusResponse;

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível acompanhar a geração.");
      }

      if (typeof data.activeStep === "number") {
        setActiveStep(Math.min(Math.max(data.activeStep, 0), 3));
      }

      if (typeof data.remainingCredits === "number") {
        setRemainingCredits(data.remainingCredits);
        setShowCreditUpgrade(!isAdmin && data.remainingCredits <= 0);
      }

      if (data.status === "COMPLETED") {
        const imageUrl = data.imageUrl || null;

        if (!imageUrl) {
          throw new Error(
            "O banner foi marcado como concluído, mas a URL da imagem não foi retornada.",
          );
        }

        return {
          imageUrl,
          bannerId: data.bannerId || bannerId,
          bannerUrl: data.bannerUrl || `/dashboard/banners/${bannerId}`,
          saved: true,
        };
      }

      if (data.status === "FAILED") {
        throw new Error(
          data.message || "Não foi possível concluir a geração do banner.",
        );
      }

      setStatusText(
        data.message ||
          "Banner enviado para a IA. Aguardando a finalização da imagem...",
      );
    }

    throw new Error(
      "A geração ainda está em andamento. Abra Meus banners em alguns instantes para conferir o resultado.",
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (hasNoCredits) {
      setError("Você usou todos os seus créditos deste mês.");
      setShowCreditUpgrade(true);
      setStatusText("");
      setActiveStep(0);
      return;
    }

    setLoading(true);
    setLoadingMode("generate");
    setActiveStep(0);
    setStatusText("Preparando os dados do banner...");
    setError("");
    setResult(null);
    setShowCreditUpgrade(false);
    setEditPrompt("");
    setEditError("");
    setEditSuccess("");
    scrollToPreview();

    let progressTimerA: number | undefined;
    let progressTimerB: number | undefined;
    let progressTimerC: number | undefined;

    try {
      const referenceImageDataUrl = referenceFile
        ? await readFileAsDataUrl(referenceFile)
        : null;

      progressTimerA = window.setTimeout(() => {
        setActiveStep(1);
        setStatusText("Enviando composição para a IA...");
      }, 900);

      progressTimerB = window.setTimeout(() => {
        setActiveStep(2);
        setStatusText("A IA está desenhando o preview do banner...");
      }, 4200);

      progressTimerC = window.setTimeout(() => {
        setActiveStep(3);
        setStatusText(
          "Ajustando o resultado final. Aguarde mais alguns instantes...",
        );
      }, 9000);

      const response = await fetch("/api/banners/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mainText: form.mainText,
          djName: form.djName,
          secondaryText: form.secondaryText,
          eventDate: form.eventDate,
          eventLocation: form.eventLocation,
          stylePreset: form.stylePreset,
          format: form.format,
          quality: form.quality,
          referenceImageUrl: referenceFile ? referenceImageDataUrl : null,
        }),
      });

      if (progressTimerA) window.clearTimeout(progressTimerA);
      if (progressTimerB) window.clearTimeout(progressTimerB);
      if (progressTimerC) window.clearTimeout(progressTimerC);

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Não foi possível gerar o banner.");
      }

      const nextRemainingCredits =
        typeof data.remainingCredits === "number" ? data.remainingCredits : null;

      setRemainingCredits(nextRemainingCredits);
      setShowCreditUpgrade(
        !isAdmin &&
          typeof nextRemainingCredits === "number" &&
          nextRemainingCredits <= 0,
      );

      if (response.status === 202 || data.status === "PENDING") {
        if (!data.bannerId) {
          throw new Error(
            "A geração foi iniciada, mas a API não retornou o ID do banner.",
          );
        }

        setStatusText("Banner criado. Aguardando a IA finalizar a imagem...");

        const completedBanner = await waitForGeneratedBanner(data.bannerId);

        setActiveStep(3);
        setStatusText("Banner gerado e salvo com sucesso.");
        setResult(completedBanner);
        router.refresh();
        return;
      }

      const imageUrl = data.previewImageUrl || data.imageUrl || null;

      if (!imageUrl) {
        throw new Error(
          "A API retornou sucesso, mas não enviou a URL da imagem gerada.",
        );
      }

      setActiveStep(3);
      setStatusText(
        data.saved === false
          ? "Preview gerado com sucesso no modo de teste."
          : "Banner gerado e salvo com sucesso.",
      );

      setResult({
        imageUrl,
        bannerId: data.bannerId,
        bannerUrl: data.bannerUrl || null,
        saved: data.saved !== false,
      });

      router.refresh();
    } catch (err) {
      if (progressTimerA) window.clearTimeout(progressTimerA);
      if (progressTimerB) window.clearTimeout(progressTimerB);
      if (progressTimerC) window.clearTimeout(progressTimerC);
      const message =
        err instanceof Error ? err.message : "Erro ao gerar banner.";
      setError(message);
      if (isCreditExhaustedMessage(message)) {
        setRemainingCredits(0);
        setShowCreditUpgrade(true);
      }
      setStatusText("");
      setActiveStep(0);
    } finally {
      setLoading(false);
      setLoadingMode(null);
    }
  }

  async function handleEdit() {
    if (!result?.imageUrl) return;

    if (hasNoCredits) {
      setEditError("Você usou todos os seus créditos deste mês.");
      setShowCreditUpgrade(true);
      return;
    }

    if (editPrompt.trim().length < 4) {
      setEditError(
        "Descreva a alteração desejada com um pouco mais de detalhe.",
      );
      return;
    }

    setEditLoading(true);
    setLoadingMode("edit");
    setActiveStep(0);
    setEditError("");
    setEditSuccess("");
    setStatusText("Analisando a arte atual para aplicar a alteração...");

    let progressTimerA: number | undefined;
    let progressTimerB: number | undefined;
    let progressTimerC: number | undefined;

    try {
      progressTimerA = window.setTimeout(() => {
        setActiveStep(1);
        setStatusText("Aplicando suas instruções na composição...");
      }, 900);

      progressTimerB = window.setTimeout(() => {
        setActiveStep(2);
        setStatusText("Renderizando a nova versão da arte...");
      }, 4200);

      progressTimerC = window.setTimeout(() => {
        setActiveStep(3);
        setStatusText(
          "Finalizando os ajustes da alteração. Aguarde mais alguns instantes...",
        );
      }, 9000);

      const response = await fetch("/api/banners/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bannerId: result.bannerId || null,
          sourceImageUrl: result.imageUrl,
          instructions: editPrompt,
          mainText: form.mainText,
          djName: form.djName,
          secondaryText: form.secondaryText,
          eventDate: form.eventDate,
          eventLocation: form.eventLocation,
          stylePreset: form.stylePreset,
          format: form.format,
          quality: form.quality,
        }),
      });

      if (progressTimerA) window.clearTimeout(progressTimerA);
      if (progressTimerB) window.clearTimeout(progressTimerB);
      if (progressTimerC) window.clearTimeout(progressTimerC);

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Não foi possível editar a arte.");
      }

      setActiveStep(3);
      setStatusText("Alteração aplicada com sucesso.");

      setResult({
        imageUrl: data.previewImageUrl || data.imageUrl,
        bannerId: data.bannerId ?? result.bannerId,
        bannerUrl: data.bannerUrl ?? result.bannerUrl,
        saved: data.saved !== false,
      });

      const nextRemainingAfterEdit =
        typeof data.remainingCredits === "number"
          ? data.remainingCredits
          : typeof remainingCredits === "number"
            ? Math.max(remainingCredits - 1, 0)
            : null;

      setRemainingCredits(nextRemainingAfterEdit);
      setShowCreditUpgrade(
        !isAdmin &&
          typeof nextRemainingAfterEdit === "number" &&
          nextRemainingAfterEdit <= 0,
      );
      setEditSuccess("Alteração aplicada com sucesso.");
      setEditPrompt("");

      router.refresh();
    } catch (err) {
      if (progressTimerA) window.clearTimeout(progressTimerA);
      if (progressTimerB) window.clearTimeout(progressTimerB);
      if (progressTimerC) window.clearTimeout(progressTimerC);
      const message =
        err instanceof Error ? err.message : "Erro ao editar a arte.";
      setEditError(message);
      if (isCreditExhaustedMessage(message)) {
        setRemainingCredits(0);
        setShowCreditUpgrade(true);
      }
      setStatusText("");
      setActiveStep(0);
    } finally {
      setEditLoading(false);
      setLoadingMode(null);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <form
        onSubmit={handleSubmit}
        className="rounded-[28px]  border-white/10 "
      >
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/50 Briefing criativo">
              Briefing criativo
            </p>
            <h2 className="text-[23px] font-semibold leading-tight text-white ">
              Preencha os dados do banner
            </h2>
            <p className="mt-3 text-[13px] leading-6 text-gray-200">
              Uma estrutura clara para gerar flyers premium sem confusão entre
              texto principal, nome do DJ e informações do evento.
            </p>
          </div>

          <div className="px-1 py-1 text-left text-blue-400 md:min-w-[112px] md:text-right">
            <span className="block text-[10px] uppercase tracking-[0.18em] text-white/40 text-center">
              Briefing
            </span>
            <strong className="mt-1 block text-xl font-semibold text-center">
              {completion}%
            </strong>
          </div>
        </div>

        <Section title="Conteúdo principal">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Texto principal do banner">
              <input
                className={inputClassName}
                placeholder="Ex.: Pull Party Fest"
                value={form.mainText}
                onChange={(e) =>
                  setForm((c) => ({ ...c, mainText: e.target.value }))
                }
                required
              />
            </Field>

            <Field label="Nome do DJ">
              <input
                className={inputClassName}
                placeholder="Ex.: DJ Vitor"
                value={form.djName}
                onChange={(e) =>
                  setForm((c) => ({ ...c, djName: e.target.value }))
                }
                required
              />
            </Field>
          </div>

          <Field label="Chamada secundária (opcional)">
            <input
              className={inputClassName}
              placeholder="Ex.: Edição especial"
              value={form.secondaryText}
              onChange={(e) =>
                setForm((c) => ({ ...c, secondaryText: e.target.value }))
              }
            />
          </Field>
        </Section>

        <Section title="Informações do evento">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Data do evento">
              <input
                className={inputClassName}
                placeholder="Ex.: 19/09/2026"
                value={form.eventDate}
                onChange={(e) =>
                  setForm((c) => ({ ...c, eventDate: e.target.value }))
                }
                required
              />
            </Field>

            <Field label="Local do evento">
              <input
                className={inputClassName}
                placeholder="Ex.: São Paulo Hall - São Paulo"
                value={form.eventLocation}
                onChange={(e) =>
                  setForm((c) => ({ ...c, eventLocation: e.target.value }))
                }
                required
              />
            </Field>
          </div>
        </Section>

        <Section title="Direção visual">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Field label="Estilo visual">
              <select
                className={selectClassName}
                value={form.stylePreset}
                onChange={(e) => {
                  const nextStylePreset = e.target.value;

                  if (
                    shouldLockProStyles &&
                    isBannerStyleProOnly(nextStylePreset)
                  ) {
                    setShowCreditUpgrade(true);
                    return;
                  }

                  setForm((c) => ({ ...c, stylePreset: nextStylePreset }));
                }}
              >
                {stylePresets.map((preset) => {
                  const locked =
                    shouldLockProStyles && isBannerStyleProOnly(preset.value);

                  return (
                    <option
                      key={preset.value}
                      value={preset.value}
                      disabled={locked}
                      className="bg-black text-white"
                    >
                      {preset.label}
                      {locked ? " — Pro+" : ""}
                    </option>
                  );
                })}
              </select>

              {shouldLockProStyles ? (
                <p className="text-xs leading-5 text-white/55">
                  Premium visual styles are available from the Pro plan and
                  higher.
                </p>
              ) : null}
            </Field>

            <Field label="Formato">
              <select
                className={selectClassName}
                value={form.format}
                onChange={(e) =>
                  setForm((c) => ({ ...c, format: e.target.value }))
                }
              >
                {formats.map((format) => (
                  <option
                    key={format.value}
                    value={format.value}
                    className="bg-black text-white"
                  >
                    {format.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Qualidade de geração">
              <select
                className={selectClassName}
                value={form.quality}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    quality: e.target.value as BannerImageQuality,
                  }))
                }
              >
                {qualityOptions.map((quality) => {
                  const enabled = allowedQualities.includes(quality.value);
                  return (
                    <option
                      key={quality.value}
                      value={quality.value}
                      disabled={!enabled}
                      className="bg-black text-white"
                    >
                      {quality.label}
                      {enabled ? "" : " — indisponível no seu plano"}
                    </option>
                  );
                })}
              </select>
            </Field>
          </div>

          <Field label="Foto do DJ (opcional)">
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className={`${inputClassName} file:mr-4 file:rounded-xl file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-white/15`}
              onChange={(e) => setReferenceFile(e.target.files?.[0] || null)}
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/60">
              <span>
                Envie uma imagem para a IA usar como referência visual.
              </span>
              <strong className="text-white/85">
                {referenceFile
                  ? referenceFile.name
                  : "Nenhum arquivo selecionado"}
              </strong>
            </div>
          </Field>
        </Section>

        <div className="mt-4 flex flex-col gap-3 rounded-[22px] border border-white/10 bg-gradient-to-br from-blue-500/10 to-cyan-400/5 p-4 md:flex-row md:items-start md:justify-between">
          <div>
            <span className="mb-2 inline-flex rounded-full bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-white/75">
              Estrutura profissional
            </span>
            <p className="text-sm leading-6 text-white/80">
              O texto principal será o maior destaque da arte. O nome do DJ
              ficará em segundo nível e o bloco complementar será mais discreto
              e elegante.
            </p>
          </div>

          {remainingCredits !== null ? (
            <div className="shrink-0 rounded-xl bg-white/8 px-3 py-2 text-sm text-white">
              Créditos restantes: <strong>{remainingCredits}</strong>
            </div>
          ) : null}
        </div>

        {shouldShowCreditUpgrade ? (
          <CreditUpgradeCard currentPlan={currentPlan} />
        ) : null}

        <button
          type="submit"
          disabled={displayLoading || hasNoCredits}
          className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {hasNoCredits
            ? "Créditos esgotados"
            : loading
              ? "Gerando preview..."
              : editLoading
                ? "Aplicando alteração..."
                : "Gerar banner premium"}
        </button>

        {statusText ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85">
            {statusText}
          </div>
        ) : null}

        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
      </form>

      <aside
        ref={previewRef}
        className="rounded-[28px] p-5 xl:sticky xl:top-5"
      >
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/50">
              Preview
            </p>
            <h3 className="text-lg font-semibold leading-snug text-white">
              {displayLoading
                ? loadingTexts.title
                : result
                  ? "Preview pronto para revisão"
                  : "Seu banner aparecerá aqui"}
            </h3>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/45">
              Formato selecionado: {previewFormatLabel}
            </p>
          </div>

          <div
            className={`inline-flex w-fit items-center justify-center rounded-2xl border px-4 py-2 text-[11px] uppercase tracking-[0.16em] ${
              displayLoading
                ? "border-sky-400/35 bg-sky-400/10 text-white animate-pulse"
                : "border-white/10 bg-white/5 text-white/80"
            }`}
          >
            {displayLoading
              ? loadingTexts.badge
              : result
                ? "Concluído"
                : "Aguardando"}
          </div>
        </div>

        {displayLoading ? (
          <div className="grid gap-4">
            <div
              className={`relative isolate w-full overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_42%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.12),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] ${previewAspectClass}`}
            >
              <div className="absolute inset-0">
                <div className="absolute -left-16 top-10 h-32 w-32 rounded-full bg-sky-400/10 blur-3xl animate-pulse" />
                <div className="absolute -right-10 bottom-16 h-32 w-32 rounded-full bg-violet-400/10 blur-3xl animate-pulse" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />
                <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />
                <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
              </div>

              <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/75 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-sky-300 animate-pulse" />
                  {loadingTexts.chip}
                </span>
                <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/55 backdrop-blur">
                  {loadingProgress}%
                </span>
              </div>

              <div className="absolute inset-0 flex items-center justify-center px-6">
                <div className="relative flex h-[148px] w-[148px] items-center justify-center">
                  <div className="absolute h-full w-full rounded-full border border-sky-300/20 animate-ping" />
                  <div className="absolute h-[128px] w-[128px] rounded-full border border-violet-300/15 animate-pulse" />
                  <div className="absolute h-[108px] w-[108px] rounded-full border-2 border-dashed border-sky-300/35 animate-spin" />
                  <div className="absolute h-[78px] w-[78px] rounded-full bg-white/[0.04] shadow-[inset_0_0_30px_rgba(125,211,252,0.12)]" />
                  <div className="absolute h-3 w-3 rounded-full bg-sky-300 shadow-[0_0_18px_rgba(125,211,252,0.9)]" />
                </div>
              </div>

              <div className="absolute bottom-20 left-1/2 w-[68%] -translate-x-1/2">
                <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-white/45">
                  <span>
                    {loadingMode === "edit"
                      ? "Aplicando alterações"
                      : "Compondo camadas"}
                  </span>
                  <span>
                    {loadingMode === "edit"
                      ? "Gerando nova versão"
                      : "Processando visual"}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-300 via-violet-300 to-cyan-200 transition-all duration-500"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <p className="text-sm leading-6 text-white/70">
                {loadingTexts.helper}
              </p>
            </div>

            <div className="grid gap-2.5">
              {currentSteps.map((step, index) => {
                const state =
                  index < activeStep
                    ? "done"
                    : index === activeStep
                      ? "active"
                      : "idle";

                return (
                  <div
                    key={step}
                    className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition ${
                      state === "active"
                        ? "border-sky-300/25 bg-sky-300/8 text-white"
                        : state === "done"
                          ? "border-violet-300/20 bg-violet-300/8 text-white/90"
                          : "border-white/8 bg-white/[0.03] text-white/45"
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full border ${
                        state === "active"
                          ? "border-sky-300 bg-sky-300 shadow-[0_0_0_5px_rgba(125,211,252,0.12)]"
                          : state === "done"
                            ? "border-violet-300 bg-violet-300"
                            : "border-white/20 bg-white/10"
                      }`}
                    />
                    <span>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : result ? (
          <div className="grid gap-4">
            <div
              className={`w-full overflow-hidden rounded-3xl border border-white/10 ${previewAspectClass}`}
            >
              <img
                className="h-full w-full object-cover"
                src={result.imageUrl}
                alt="Banner gerado"
              />
            </div>

            <div className="grid gap-2">
              <p className="text-xl font-semibold text-white">
                {result.saved === false
                  ? "Preview gerado no modo de teste"
                  : "Seu banner foi criado com sucesso"}
              </p>
              <p className="text-sm leading-6 text-white/70">
                {result.saved === false
                  ? "Neste modo o sistema prioriza velocidade e mostra o preview imediatamente."
                  : "A imagem já pode ser baixada ou aberta em uma nova guia."}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={result.imageUrl}
                download
                className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-white/10 bg-white/8 px-4 text-sm font-medium text-white transition hover:bg-white/12"
              >
                Baixar imagem
              </a>

              <a
                href={result.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-sky-300/15 bg-sky-300/8 px-4 text-sm font-medium text-white transition hover:bg-sky-300/12"
              >
                Abrir imagem
              </a>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Solicitar alteração da arte
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/60">
                    Descreva a mudança desejada. Cada alteração consome 1
                    crédito.
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-amber-300/15 bg-amber-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-amber-100">
                  1 crédito
                </span>
              </div>

              <textarea
                className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/50 focus:ring-4 focus:ring-sky-400/10 placeholder:text-white/35"
                placeholder="Ex.: deixe o fundo mais escuro, aumente o destaque do título principal e use um clima mais neon."
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
              />

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-white/55">
                  A IA usará a imagem atual como base e criará uma nova versão
                  da arte.
                </p>

                <button
                  type="button"
                  onClick={handleEdit}
                  disabled={displayLoading || hasNoCredits}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-sky-300/20 bg-sky-300/10 px-4 text-sm font-medium text-white transition hover:bg-sky-300/15 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {hasNoCredits
                    ? "Créditos esgotados"
                    : editLoading
                      ? "Alterando arte..."
                      : "Solicitar alteração"}
                </button>
              </div>

              {editError ? (
                <p className="mt-3 text-sm text-rose-300">{editError}</p>
              ) : null}
              {editSuccess ? (
                <p className="mt-3 text-sm text-emerald-300">{editSuccess}</p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 text-center">
            <div
              className={`relative grid w-full place-items-center overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] ${previewAspectClass}`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_45%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.08),transparent_40%)]" />
              <div className="absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-16deg] bg-gradient-to-r from-transparent via-sky-300/20 to-transparent animate-pulse" />
              <div className="absolute h-28 w-28 rounded-full border border-sky-300/20 animate-ping" />
              <div className="absolute h-40 w-40 rounded-full border border-violet-300/10 animate-pulse" />
              <div className="relative z-10 grid place-items-center gap-5 px-6 text-center">
                <div className="relative grid place-items-center">
                  <div className="h-24 w-24 rounded-full border border-indigo-400/20 shadow-[inset_0_0_0_8px_rgba(99,102,241,0.04)]" />
                  <div className="absolute h-14 w-14 rounded-full border border-sky-300/30" />
                </div>
                <div className="grid gap-3">
                  <p className="text-xl font-semibold text-white">
                    Preview inteligente
                  </p>
                  <p className="max-w-sm text-sm leading-6 text-white/70">
                    Seu baner será gerado aqui.
                  </p>
                  <div className="mx-auto grid w-full max-w-[220px] gap-2">
                    <span className="h-2 overflow-hidden rounded-full bg-white/10">
                      <span className="block h-full w-1/2 rounded-full bg-gradient-to-r from-sky-300 via-violet-300 to-cyan-200 animate-pulse" />
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                      Aguardando geração
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

function CreditUpgradeCard({ currentPlan }: { currentPlan: SubscriptionPlan }) {
  const isFreePlan = currentPlan === "FREE";

  return (
    <div className="mt-5 overflow-hidden rounded-[26px] border border-amber-200/20 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.14),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <span className="inline-flex rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-100">
            Créditos esgotados
          </span>
          <h3 className="mt-3 text-lg font-semibold leading-tight text-white">
            Libere mais banners e continue criando sem pausa
          </h3>
          <p className="mt-2 text-sm leading-6 text-white/68">
            Faça upgrade do seu plano para receber mais créditos mensais e
            desbloquear opções melhores de geração para seus banners.
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col">
          <a
            href="/dashboard/billing"
            className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-gradient-to-r from-amber-200 via-sky-200 to-violet-200 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95"
          >
            Ver planos
          </a>
          <span className="text-center text-[11px] leading-5 text-white/50">
            {isFreePlan
              ? "Pro libera mais créditos. Professional libera alta qualidade."
              : "Escolha um plano maior para aumentar seus créditos."}
          </span>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-4 grid gap-4 rounded-[22px] border border-white/8 bg-white/[0.025] p-4">
      <h3 className="text-[11px] uppercase tracking-[0.2em] text-white/60">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <label className="text-sm font-medium leading-[1.35] text-white/90">
        {label}
      </label>
      {children}
    </div>
  );
}
