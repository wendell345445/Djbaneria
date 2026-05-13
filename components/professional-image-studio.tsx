"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  CheckCircle2,
  Download,
  ChevronDown,
  ImageUp,
  Loader2,
  Sparkles,
} from "lucide-react";

type ProfessionalImageLocale = "pt-BR" | "en" | "es";

type ProfessionalPhotoDirectionId =
  | "artist_press"
  | "studio_portrait"
  | "profile_picture"
  | "booking_promo"
  | "editorial_artist"
  | "lifestyle_dj";

const defaultProfessionalPhotoDirection: ProfessionalPhotoDirectionId =
  "artist_press";

const PROFESSIONAL_IMAGE_ACTIVE_JOB_STORAGE_KEY =
  "dj-visuals-active-professional-image-job";

type ProfessionalImageStudioProps = {
  workspaceName?: string | null;
  locale?: ProfessionalImageLocale;
};

type ProfessionalImageJobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

type ProfessionalImageResponse = {
  success?: boolean;
  jobId?: string;
  status?: ProfessionalImageJobStatus;
  progress?: number;
  imageUrl?: string;
  remainingCredits?: number | null;
  error?: string;
  code?: "NO_CREDITS" | "SUBSCRIPTION_INACTIVE" | string;
};

type ProfessionalImageStatusResponse = {
  success?: boolean;
  jobId?: string;
  status?: ProfessionalImageJobStatus;
  progress?: number;
  imageUrl?: string;
  error?: string;
  job?: {
    jobId?: string;
    status?: ProfessionalImageJobStatus;
    progress?: number;
    imageUrl?: string;
    error?: string;
  } | null;
};

const professionalImageCopy = {
  "pt-BR": {
    badge: "Imagem profissional",
    title: "Transforme uma foto comum em imagem profissional",
    description:
      "Envie uma foto nítida do DJ e a IA melhora iluminação, enquadramento e acabamento visual para usar em banners, perfil e divulgação.",
    workspace: "Workspace",
    artistPhoto: "Foto do artista",
    artistPhotoDescription: "Use uma foto com rosto visível e boa nitidez.",
    photoDirectionLabel: "Tipo de foto",
    photoDirectionDescriptions: {
      artist_press:
        "Foto oficial para divulgação, release, booking e perfil profissional.",
      studio_portrait:
        "Retrato limpo com iluminação de estúdio e aparência premium.",
      profile_picture:
        "Imagem forte para Instagram, TikTok, Spotify e redes sociais.",
      booking_promo:
        "Visual profissional para aumentar valor percebido em contratações.",
      editorial_artist:
        "Retrato sofisticado com aparência de revista e portfólio.",
      lifestyle_dj:
        "Foto mais natural, moderna e autêntica para redes sociais.",
    },
    photoDirections: [
      { id: "artist_press", title: "Artist Press Photo" },
      { id: "studio_portrait", title: "Studio Portrait" },
      { id: "profile_picture", title: "Profile Picture" },
      { id: "booking_promo", title: "Booking Promo Photo" },
      { id: "editorial_artist", title: "Editorial Artist Photo" },
      { id: "lifestyle_dj", title: "Lifestyle DJ Photo" },
    ],
    howItWorks: "Como funciona",
    steps: [
      "Você envia uma foto comum.",
      "A IA preserva o rosto e melhora o visual.",
      "A imagem final fica pronta para usar nos banners.",
    ],
    generate: "Gerar imagem profissional",
    generating: "Gerando imagem profissional...",
    previewGeneratingTitle: "Gerando sua imagem profissional",
    previewGeneratingDescription:
      "Tempo estimado: 1 a 3 minutos. A IA está melhorando iluminação, enquadramento e acabamento visual enquanto prepara o resultado final. Você pode sair desta tela sem atrapalhar o progresso; quando voltar, o acompanhamento continuará automaticamente.",
    result: "Resultado",
    resultDescription: "A imagem profissional gerada aparece aqui.",
    emptyResultTitle: "Sua imagem profissional vai aparecer aqui",
    emptyResultDescription:
      "Envie uma foto e clique em gerar para visualizar o resultado final.",
    openImage: "Abrir imagem",
    useInBanner: "Usar em um banner",
    remainingCredits: "Créditos restantes",
    upgradeTitle: "Seus créditos acabaram",
    upgradeDescription:
      "Faça upgrade para continuar gerando imagens profissionais e banners premium para seus eventos.",
    upgradeButton: "Ver planos",
    success: "Imagem profissional gerada com sucesso.",
    errors: {
      missingPhoto: "Envie uma foto para gerar a imagem profissional.",
      fileRead: "Não foi possível ler a imagem enviada.",
      generate: "Não foi possível gerar a imagem profissional.",
      missingUrl: "A API não retornou a URL da imagem profissional.",
    },
    alt: {
      source: "Foto enviada",
      result: "Imagem profissional gerada",
    },
  },
  en: {
    badge: "Professional image",
    title: "Turn a regular photo into a professional image",
    description:
      "Upload a clear DJ photo and AI improves lighting, framing, and visual polish for banners, profile images, and promotion.",
    workspace: "Workspace",
    artistPhoto: "Artist photo",
    artistPhotoDescription: "Use a clear photo where your face is visible.",
    photoDirectionLabel: "Photo type",
    photoDirectionDescriptions: {
      artist_press:
        "Official photo for promotion, press kits, booking and professional profiles.",
      studio_portrait:
        "Clean portrait with studio lighting and a premium look.",
      profile_picture:
        "Strong image for Instagram, TikTok, Spotify and social media.",
      booking_promo:
        "Professional visual to increase perceived value for bookings.",
      editorial_artist:
        "Sophisticated portrait with a magazine and portfolio look.",
      lifestyle_dj: "Natural, modern and authentic photo for social media.",
    },
    photoDirections: [
      { id: "artist_press", title: "Artist Press Photo" },
      { id: "studio_portrait", title: "Studio Portrait" },
      { id: "profile_picture", title: "Profile Picture" },
      { id: "booking_promo", title: "Booking Promo Photo" },
      { id: "editorial_artist", title: "Editorial Artist Photo" },
      { id: "lifestyle_dj", title: "Lifestyle DJ Photo" },
    ],
    howItWorks: "How it works",
    steps: [
      "You upload a regular photo.",
      "AI preserves the face and improves the visual.",
      "The final image is ready to use in your banners.",
    ],
    generate: "Generate professional image",
    generating: "Generating professional image...",
    previewGeneratingTitle: "Generating your professional image",
    previewGeneratingDescription:
      "Estimated time: 1 to 3 minutes. AI is improving lighting, framing and visual polish while preparing the final result. You can leave this page without interrupting progress; when you come back, tracking will resume automatically.",
    result: "Result",
    resultDescription: "Your generated professional image appears here.",
    emptyResultTitle: "Your professional image will appear here",
    emptyResultDescription:
      "Upload a photo and click generate to preview the final result.",
    openImage: "Open image",
    useInBanner: "Use in a banner",
    remainingCredits: "Remaining credits",
    upgradeTitle: "You’re out of credits",
    upgradeDescription:
      "Upgrade to keep generating professional images and premium banners for your events.",
    upgradeButton: "View plans",
    success: "Professional image generated successfully.",
    errors: {
      missingPhoto: "Upload a photo to generate the professional image.",
      fileRead: "Could not read the uploaded image.",
      generate: "Could not generate the professional image.",
      missingUrl: "The API did not return the professional image URL.",
    },
    alt: {
      source: "Uploaded photo",
      result: "Generated professional image",
    },
  },
  es: {
    badge: "Imagen profesional",
    title: "Convierte una foto común en una imagen profesional",
    description:
      "Sube una foto clara del DJ y la IA mejora iluminación, encuadre y acabado visual para banners, perfil y promoción.",
    workspace: "Workspace",
    artistPhoto: "Foto del artista",
    artistPhotoDescription: "Usa una foto clara donde el rostro sea visible.",
    photoDirectionLabel: "Tipo de foto",
    photoDirectionDescriptions: {
      artist_press:
        "Foto oficial para promoción, press kit, booking y perfil profesional.",
      studio_portrait:
        "Retrato limpio con iluminación de estudio y apariencia premium.",
      profile_picture:
        "Imagen fuerte para Instagram, TikTok, Spotify y redes sociales.",
      booking_promo:
        "Visual profesional para aumentar el valor percibido en contrataciones.",
      editorial_artist:
        "Retrato sofisticado con apariencia de revista y portafolio.",
      lifestyle_dj:
        "Foto más natural, moderna y auténtica para redes sociales.",
    },
    photoDirections: [
      { id: "artist_press", title: "Artist Press Photo" },
      { id: "studio_portrait", title: "Studio Portrait" },
      { id: "profile_picture", title: "Profile Picture" },
      { id: "booking_promo", title: "Booking Promo Photo" },
      { id: "editorial_artist", title: "Editorial Artist Photo" },
      { id: "lifestyle_dj", title: "Lifestyle DJ Photo" },
    ],
    howItWorks: "Cómo funciona",
    steps: [
      "Subes una foto común.",
      "La IA preserva el rostro y mejora el visual.",
      "La imagen final queda lista para usar en tus banners.",
    ],
    generate: "Generar imagen profesional",
    generating: "Generando imagen profesional...",
    previewGeneratingTitle: "Generando tu imagen profesional",
    previewGeneratingDescription:
      "Tiempo estimado: 1 a 3 minutos. La IA está mejorando iluminación, encuadre y acabado visual mientras prepara el resultado final. Puedes salir de esta pantalla sin interrumpir el progreso; al volver, el seguimiento continuará automáticamente.",
    result: "Resultado",
    resultDescription: "La imagen profesional generada aparece aquí.",
    emptyResultTitle: "Tu imagen profesional aparecerá aquí",
    emptyResultDescription:
      "Sube una foto y haz clic en generar para ver el resultado final.",
    openImage: "Abrir imagen",
    useInBanner: "Usar en un banner",
    remainingCredits: "Créditos restantes",
    upgradeTitle: "Te quedaste sin créditos",
    upgradeDescription:
      "Haz upgrade para seguir generando imágenes profesionales y banners premium para tus eventos.",
    upgradeButton: "Ver planes",
    success: "Imagen profesional generada correctamente.",
    errors: {
      missingPhoto: "Sube una foto para generar la imagen profesional.",
      fileRead: "No fue posible leer la imagen enviada.",
      generate: "No fue posible generar la imagen profesional.",
      missingUrl: "La API no devolvió la URL de la imagen profesional.",
    },
    alt: {
      source: "Foto enviada",
      result: "Imagen profesional generada",
    },
  },
} as const;

function normalizeProfessionalImageLocale(
  locale?: string,
): ProfessionalImageLocale {
  if (locale === "pt-BR" || locale === "en" || locale === "es") return locale;
  return "en";
}

function readFileAsDataUrl(file: File, errorMessage: string) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error(errorMessage));
    };

    reader.onerror = () => {
      reject(new Error(errorMessage));
    };

    reader.readAsDataURL(file);
  });
}

function getFilePreview(file: File | null) {
  if (!file) return "";

  return URL.createObjectURL(file);
}

export function ProfessionalImageStudio({
  locale = "en",
}: ProfessionalImageStudioProps) {
  const normalizedLocale = normalizeProfessionalImageLocale(locale);
  const copy = professionalImageCopy[normalizedLocale];
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [professionalPhotoDirection, setProfessionalPhotoDirection] =
    useState<ProfessionalPhotoDirectionId>(defaultProfessionalPhotoDirection);
  const [isDirectionSelectOpen, setIsDirectionSelectOpen] = useState(false);
  const selectedDirection =
    copy.photoDirections.find(
      (item) => item.id === professionalPhotoDirection,
    ) || copy.photoDirections[0];
  const [resultUrl, setResultUrl] = useState("");
  const [activeJobId, setActiveJobId] = useState("");
  const [activeJobStatus, setActiveJobStatus] =
    useState<ProfessionalImageJobStatus | null>(null);
  const [activeJobProgress, setActiveJobProgress] = useState(0);
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showUpgradeCard, setShowUpgradeCard] = useState(false);
  const [isPending, startTransition] = useTransition();

  const sourcePreviewUrl = useMemo(
    () => getFilePreview(sourceFile),
    [sourceFile],
  );

  const isJobGenerating =
    activeJobStatus === "PENDING" || activeJobStatus === "PROCESSING";
  const isGenerating = isPending || isJobGenerating;

  function clearActiveJob() {
    setActiveJobId("");
    setActiveJobStatus(null);
    setActiveJobProgress(0);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(PROFESSIONAL_IMAGE_ACTIVE_JOB_STORAGE_KEY);
    }
  }

  function persistActiveJob(jobId: string) {
    setActiveJobId(jobId);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        PROFESSIONAL_IMAGE_ACTIVE_JOB_STORAGE_KEY,
        jobId,
      );
    }
  }

  async function fetchJobStatus(jobId: string) {
    const response = await fetch(`/api/ai/professional-image/status/${jobId}`, {
      cache: "no-store",
    });

    const data = (await response
      .json()
      .catch(() => ({}))) as ProfessionalImageStatusResponse;

    if (!response.ok) {
      throw new Error(data.error || copy.errors.generate);
    }

    setActiveJobStatus(data.status || null);
    setActiveJobProgress(typeof data.progress === "number" ? data.progress : 0);

    if (data.status === "COMPLETED" && data.imageUrl) {
      setResultUrl(data.imageUrl);
      setSuccessMessage(copy.success);
      clearActiveJob();
      return;
    }

    if (data.status === "FAILED") {
      setError(data.error || copy.errors.generate);
      clearActiveJob();
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function restoreJob() {
      try {
        const storedJobId =
          typeof window !== "undefined"
            ? window.localStorage.getItem(
                PROFESSIONAL_IMAGE_ACTIVE_JOB_STORAGE_KEY,
              )
            : null;

        if (storedJobId) {
          if (cancelled) return;
          persistActiveJob(storedJobId);
          await fetchJobStatus(storedJobId);
          return;
        }

        const response = await fetch("/api/ai/professional-image/current", {
          cache: "no-store",
        });

        const data = (await response
          .json()
          .catch(() => ({}))) as ProfessionalImageStatusResponse;

        if (!response.ok || !data.job?.jobId || cancelled) return;

        persistActiveJob(data.job.jobId);
        setActiveJobStatus(data.job.status || null);
        setActiveJobProgress(
          typeof data.job.progress === "number" ? data.job.progress : 0,
        );

        if (data.job.status === "COMPLETED" && data.job.imageUrl) {
          setResultUrl(data.job.imageUrl);
          setSuccessMessage(copy.success);
          clearActiveJob();
        }
      } catch {
        // Keep the page usable even if resume check fails.
      }
    }

    restoreJob();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedLocale]);

  useEffect(() => {
    if (!activeJobId || !isJobGenerating) return;

    const intervalId = window.setInterval(() => {
      fetchJobStatus(activeJobId).catch((err) => {
        setError(err instanceof Error ? err.message : copy.errors.generate);
      });
    }, 3500);

    return () => window.clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeJobId, isJobGenerating]);

  async function handleGenerate() {
    if (!sourceFile) {
      setError(copy.errors.missingPhoto);
      setShowUpgradeCard(false);
      inputRef.current?.click();
      return;
    }

    setError("");
    setSuccessMessage("");
    setShowUpgradeCard(false);
    setResultUrl("");
    clearActiveJob();

    startTransition(async () => {
      try {
        const imageDataUrl = await readFileAsDataUrl(
          sourceFile,
          copy.errors.fileRead,
        );

        const response = await fetch("/api/ai/professional-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageDataUrl,
            locale: normalizedLocale,
            photoDirection: professionalPhotoDirection,
          }),
        });

        const data = (await response
          .json()
          .catch(() => ({}))) as ProfessionalImageResponse;

        if (!response.ok) {
          if (
            response.status === 403 &&
            (data.code === "NO_CREDITS" ||
              data.code === "SUBSCRIPTION_INACTIVE")
          ) {
            setShowUpgradeCard(true);
          }

          throw new Error(data.error || copy.errors.generate);
        }

        if (!data.jobId) {
          throw new Error(copy.errors.generate);
        }

        persistActiveJob(data.jobId);
        setActiveJobStatus(data.status || "PENDING");
        setActiveJobProgress(typeof data.progress === "number" ? data.progress : 12);
        setRemainingCredits(
          typeof data.remainingCredits === "number"
            ? data.remainingCredits
            : null,
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : copy.errors.generate);
      }
    });
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_410px]">
        <section className="relative overflow-hidden border border-white/10 bg-white/[0.035] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.26)] sm:p-5 lg:p-6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-100/70">
                01 / Upload
              </p>
              <h2 className="mt-2 text-xl font-black uppercase tracking-[-0.03em] text-white">
                {copy.artistPhoto}
              </h2>
              <p className="mt-1 text-sm leading-6 text-white/55">
                {copy.artistPhotoDescription}
              </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-cyan-300/20 bg-cyan-300/10 text-cyan-100 shadow-[0_0_34px_rgba(34,211,238,0.1)]">
              <ImageUp className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-5 border border-white/10 bg-black/25 p-3 sm:p-4">
            <label
              htmlFor="professional-photo-direction"
              className="block text-[11px] font-black uppercase tracking-[0.2em] text-white/45"
            >
              {copy.photoDirectionLabel}
            </label>

            <div
              className="relative mt-3"
              onBlur={(event) => {
                const nextFocus = event.relatedTarget as Node | null;

                if (!nextFocus || !event.currentTarget.contains(nextFocus)) {
                  setIsDirectionSelectOpen(false);
                }
              }}
            >
              <button
                id="professional-photo-direction"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isDirectionSelectOpen}
                onClick={() => setIsDirectionSelectOpen((current) => !current)}
                className="group flex min-h-[48px] w-full items-center justify-between gap-3 border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(5,8,18,0.96),rgba(11,18,35,0.94))] px-3 py-3 text-left text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_28px_rgba(34,211,238,0.08)] outline-none transition hover:border-cyan-300/40 focus:border-cyan-300/70 focus:ring-4 focus:ring-cyan-300/10"
              >
                <span className="truncate">{selectedDirection.title}</span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-cyan-300/20 bg-cyan-300/10 text-cyan-100 transition group-hover:border-cyan-300/40 group-hover:bg-cyan-300/15">
                  <ChevronDown
                    className={`h-4 w-4 transition ${
                      isDirectionSelectOpen ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </button>

              {isDirectionSelectOpen ? (
                <div
                  role="listbox"
                  aria-labelledby="professional-photo-direction"
                  className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 overflow-hidden border border-cyan-300/20 bg-[#050812] shadow-[0_24px_70px_rgba(0,0,0,0.62),0_0_40px_rgba(34,211,238,0.12)]"
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />

                  {copy.photoDirections.map((item) => {
                    const isActive = item.id === professionalPhotoDirection;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onClick={() => {
                          setProfessionalPhotoDirection(
                            item.id as ProfessionalPhotoDirectionId,
                          );
                          setIsDirectionSelectOpen(false);
                        }}
                        className={`flex w-full items-center justify-between gap-3 border-b border-white/8 px-3 py-3 text-left text-sm font-bold transition last:border-b-0 ${
                          isActive
                            ? "bg-cyan-300/12 text-cyan-100"
                            : "bg-transparent text-white/72 hover:bg-white/[0.055] hover:text-white"
                        }`}
                      >
                        <span className="truncate">{item.title}</span>
                        {isActive ? (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.75)]" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <p className="mt-3 border border-white/8 bg-white/[0.035] px-3 py-2 text-xs leading-5 text-white/52">
              {copy.photoDirectionDescriptions[professionalPhotoDirection]}
            </p>
          </div>

          <div className="mt-4 border border-dashed border-cyan-300/25 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.1),transparent_34%),rgba(255,255,255,0.025)] p-4">
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="w-full cursor-pointer border border-white/10 bg-black/35 px-3 py-3 text-sm text-white outline-none transition file:mr-3 file:border-0 file:bg-cyan-300 file:px-3 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-[0.14em] file:text-slate-950 hover:file:bg-cyan-200 focus:border-cyan-400/55 focus:ring-4 focus:ring-cyan-400/10"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setSourceFile(file);
                setError("");
                setSuccessMessage("");
                setShowUpgradeCard(false);
                setResultUrl("");
                clearActiveJob();
              }}
            />

            {sourcePreviewUrl ? (
              <div className="mt-4 grid gap-4 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
                <div className="overflow-hidden border border-white/10 bg-black/35">
                  <div className="relative aspect-[4/5] w-full">
                    <Image
                      src={sourcePreviewUrl}
                      alt={copy.alt.source}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>

                <div className="border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-bold text-white">
                    {copy.artistPhoto}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    {
                      copy.photoDirectionDescriptions[
                        professionalPhotoDirection
                      ]
                    }
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {copy.steps.map((step, index) => (
              <div
                key={step}
                className="border border-white/10 bg-white/[0.03] p-3"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100/50">
                  0{index + 1}
                </span>
                <p className="mt-2 text-xs leading-5 text-white/58">{step}</p>
              </div>
            ))}
          </div>

          {error ? (
            <div className="mt-4 border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          {successMessage ? (
            <div className="mt-4 border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
              {successMessage}
            </div>
          ) : null}

          {showUpgradeCard ? (
            <div className="mt-4 border border-amber-300/24 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_38%),rgba(255,255,255,0.035)] p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.08em] text-white">
                    {copy.upgradeTitle}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-white/62">
                    {copy.upgradeDescription}
                  </p>
                </div>

                <Link
                  href="/dashboard/billing"
                  className="inline-flex min-h-[44px] shrink-0 items-center justify-center bg-cyan-300 px-5 text-xs font-black uppercase tracking-[0.16em] text-slate-950 transition hover:bg-cyan-200"
                >
                  {copy.upgradeButton}
                </Link>
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="group relative mt-5 inline-flex min-h-[54px] w-full items-center justify-center gap-2 overflow-hidden bg-cyan-300 px-5 text-sm font-black uppercase tracking-[0.16em] text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="pointer-events-none absolute inset-y-0 left-[-30%] w-[28%] skew-x-[-22deg] bg-white/35 transition duration-700 group-hover:left-[120%]" />
            {isGenerating ? (
              <>
                <Loader2 className="relative h-4 w-4 animate-spin" />
                <span className="relative">{copy.generating}</span>
              </>
            ) : (
              <>
                <Sparkles className="relative h-4 w-4" />
                <span className="relative">{copy.generate}</span>
              </>
            )}
          </button>

          {remainingCredits !== null ? (
            <p className="mt-3 text-center text-xs text-white/45">
              {copy.remainingCredits}:{" "}
              <strong className="text-cyan-100">{remainingCredits}</strong>
            </p>
          ) : null}
        </section>

        <aside className="relative overflow-hidden border border-white/10 bg-white/[0.035] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.26)] sm:p-5 xl:sticky xl:top-5 xl:self-start">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/50 to-transparent" />

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-violet-100/65">
                02 / Preview
              </p>
              <h2 className="mt-2 text-xl font-black uppercase tracking-[-0.03em] text-white">
                {copy.result}
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/58">
                {copy.resultDescription}
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-violet-300/20 bg-violet-300/10 text-violet-100">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-5 overflow-hidden border border-white/10 bg-black/35">
            {resultUrl ? (
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={resultUrl}
                  alt={copy.alt.result}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : isGenerating ? (
              <div className="relative flex aspect-[4/5] w-full flex-col items-center justify-center overflow-hidden px-6 text-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(34,211,238,0.22),transparent_34%),radial-gradient(circle_at_50%_80%,rgba(168,85,247,0.18),transparent_36%),linear-gradient(135deg,rgba(2,6,23,0.96),rgba(5,8,18,0.98))]" />
                <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:28px_28px]" />
                <div className="absolute inset-x-[-30%] top-0 h-32 animate-pulse bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent blur-2xl" />
                <div className="absolute left-[-35%] top-0 h-full w-[30%] skew-x-[-18deg] animate-[pulse_1.8s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-cyan-200/18 to-transparent" />
                <div className="absolute inset-5 border border-cyan-300/20 shadow-[inset_0_0_32px_rgba(34,211,238,0.1),0_0_46px_rgba(168,85,247,0.08)]" />
                <div className="absolute inset-x-8 top-8 h-px bg-gradient-to-r from-transparent via-cyan-300/65 to-transparent" />
                <div className="absolute inset-x-8 bottom-8 h-px bg-gradient-to-r from-transparent via-violet-300/65 to-transparent" />

                <div className="relative flex h-24 w-24 items-center justify-center text-cyan-100">
                  <div className="absolute inset-0 rounded-full border border-cyan-300/15 bg-cyan-300/10 shadow-[0_0_46px_rgba(34,211,238,0.22)]" />
                  <div className="absolute inset-[-8px] rounded-full border border-transparent border-t-cyan-200 border-r-cyan-300/55 animate-spin" />
                  <div className="absolute inset-[-18px] rounded-full border border-transparent border-b-violet-300/75 border-l-violet-300/30 animate-[spin_2.4s_linear_infinite_reverse]" />
                  <div className="absolute inset-3 rounded-full border border-white/10 bg-black/35" />
                  <Loader2 className="relative h-8 w-8 animate-spin text-cyan-100" />
                </div>

                <div className="relative mt-5 inline-flex items-center gap-2 border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100 shadow-[0_0_26px_rgba(34,211,238,0.12)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.85)]" />
                  1–3 min
                </div>

                <p className="relative mt-4 text-sm font-black uppercase tracking-[0.14em] text-white">
                  {copy.previewGeneratingTitle}
                </p>
                <p className="relative mt-3 max-w-sm text-sm leading-6 text-white/58">
                  {copy.previewGeneratingDescription}
                </p>

                <div className="relative mt-6 grid w-full max-w-xs gap-2">
                  <div className="h-2 overflow-hidden bg-white/8">
                    <div
                      className="h-full animate-pulse bg-gradient-to-r from-cyan-300 via-white to-violet-300"
                      style={{ width: `${Math.max(activeJobProgress, 18)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
                    <span>AI</span>
                    <span>RENDER</span>
                    <span>PREVIEW</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex aspect-[4/5] w-full flex-col items-center justify-center px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center border border-cyan-300/20 bg-cyan-300/10 text-cyan-100 shadow-[0_0_34px_rgba(34,211,238,0.12)]">
                  <Sparkles className="h-6 w-6" />
                </div>
                <p className="mt-4 text-sm font-bold text-white">
                  {copy.emptyResultTitle}
                </p>
                <p className="mt-2 max-w-sm text-sm leading-6 text-white/50">
                  {copy.emptyResultDescription}
                </p>
              </div>
            )}
          </div>

          {resultUrl ? (
            <div className="mt-4 grid gap-3">
              <a
                href={resultUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[46px] items-center justify-center gap-2 border border-white/10 bg-white/[0.055] px-4 text-sm font-bold text-white transition hover:bg-white/[0.1]"
              >
                <Download className="h-4 w-4" />
                {copy.openImage}
              </a>

              <Link
                href={{
                  pathname: "/dashboard/banners/new",
                  query: { professionalImageUrl: resultUrl },
                }}
                className="inline-flex min-h-[46px] items-center justify-center gap-2 bg-white px-4 text-xs font-black uppercase tracking-[0.14em] text-slate-950 transition hover:bg-cyan-100"
              >
                {copy.useInBanner}
              </Link>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
