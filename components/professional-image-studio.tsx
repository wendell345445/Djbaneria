"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState, useTransition } from "react";
import {
  CheckCircle2,
  Download,
  ImageUp,
  Loader2,
  Sparkles,
  Wand2,
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

type ProfessionalImageStudioProps = {
  workspaceName?: string | null;
  locale?: ProfessionalImageLocale;
};

type ProfessionalImageResponse = {
  success?: boolean;
  imageUrl?: string;
  remainingCredits?: number | null;
  error?: string;
  code?: "NO_CREDITS" | "SUBSCRIPTION_INACTIVE" | string;
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
      artist_press: "Foto oficial para divulgação, release, booking e perfil profissional.",
      studio_portrait: "Retrato limpo com iluminação de estúdio e aparência premium.",
      profile_picture: "Imagem forte para Instagram, TikTok, Spotify e redes sociais.",
      booking_promo: "Visual profissional para aumentar valor percebido em contratações.",
      editorial_artist: "Retrato sofisticado com aparência de revista e portfólio.",
      lifestyle_dj: "Foto mais natural, moderna e autêntica para redes sociais.",
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
      artist_press: "Official photo for promotion, press kits, booking and professional profiles.",
      studio_portrait: "Clean portrait with studio lighting and a premium look.",
      profile_picture: "Strong image for Instagram, TikTok, Spotify and social media.",
      booking_promo: "Professional visual to increase perceived value for bookings.",
      editorial_artist: "Sophisticated portrait with a magazine and portfolio look.",
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
      artist_press: "Foto oficial para promoción, press kit, booking y perfil profesional.",
      studio_portrait: "Retrato limpio con iluminación de estudio y apariencia premium.",
      profile_picture: "Imagen fuerte para Instagram, TikTok, Spotify y redes sociales.",
      booking_promo: "Visual profesional para aumentar el valor percibido en contrataciones.",
      editorial_artist: "Retrato sofisticado con apariencia de revista y portafolio.",
      lifestyle_dj: "Foto más natural, moderna y auténtica para redes sociales.",
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
  workspaceName,
  locale = "en",
}: ProfessionalImageStudioProps) {
  const normalizedLocale = normalizeProfessionalImageLocale(locale);
  const copy = professionalImageCopy[normalizedLocale];
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [professionalPhotoDirection, setProfessionalPhotoDirection] =
    useState<ProfessionalPhotoDirectionId>(defaultProfessionalPhotoDirection);
  const [resultUrl, setResultUrl] = useState("");
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showUpgradeCard, setShowUpgradeCard] = useState(false);
  const [isPending, startTransition] = useTransition();

  const sourcePreviewUrl = useMemo(
    () => getFilePreview(sourceFile),
    [sourceFile],
  );

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

        const data = (await response.json().catch(() => ({}))) as ProfessionalImageResponse;

        if (!response.ok) {
          if (
            response.status === 403 &&
            (data.code === "NO_CREDITS" || data.code === "SUBSCRIPTION_INACTIVE")
          ) {
            setShowUpgradeCard(true);
          }

          throw new Error(data.error || copy.errors.generate);
        }

        if (!data.imageUrl) {
          throw new Error(copy.errors.missingUrl);
        }

        setResultUrl(data.imageUrl);
        setRemainingCredits(
          typeof data.remainingCredits === "number" ? data.remainingCredits : null,
        );
        setSuccessMessage(copy.success);
      } catch (err) {
        setError(err instanceof Error ? err.message : copy.errors.generate);
      }
    });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/15 bg-sky-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100">
          <Wand2 className="h-4 w-4" />
          {copy.badge}
        </div>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {copy.title}
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
          {copy.description}
        </p>

        {workspaceName ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/60">
            {copy.workspace}: <strong className="text-white">{workspaceName}</strong>
          </div>
        ) : null}

        <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black shadow-[0_14px_34px_rgba(255,255,255,0.15)]">
              <ImageUp className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-white">
                {copy.artistPhoto}
              </h2>
              <p className="mt-1 text-sm text-white/55">
                {copy.artistPhotoDescription}
              </p>
            </div>
          </div>

          <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <label
                htmlFor="professional-photo-direction"
                className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55"
              >
                {copy.photoDirectionLabel}
              </label>

              <select
                id="professional-photo-direction"
                value={professionalPhotoDirection}
                onChange={(event) =>
                  setProfessionalPhotoDirection(
                    event.target.value as ProfessionalPhotoDirectionId,
                  )
                }
                className="min-h-[42px] w-full rounded-2xl border border-white/10 bg-[#08101d] px-3 text-sm font-medium text-white outline-none transition focus:border-sky-400/50 focus:ring-4 focus:ring-sky-400/10 sm:w-[260px]"
              >
                {copy.photoDirections.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                    className="bg-[#08101d] text-white"
                  >
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <p className="mt-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-xs leading-5 text-white/52">
              {copy.photoDirectionDescriptions[professionalPhotoDirection]}
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-base text-white outline-none transition file:mr-4 file:rounded-xl file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-base file:font-medium file:text-white hover:file:bg-white/15 focus:border-sky-400/50 focus:ring-4 focus:ring-sky-400/10 sm:text-sm sm:file:text-sm"
            onChange={(event) => {
              const file = event.target.files?.[0] || null;
              setSourceFile(file);
              setError("");
              setSuccessMessage("");
              setShowUpgradeCard(false);
              setResultUrl("");
            }}
          />

          <div className="mt-4 rounded-[20px] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-medium text-white">{copy.howItWorks}</p>
            <div className="mt-2 space-y-2 text-sm leading-6 text-white/60">
              {copy.steps.map((step, index) => (
                <p key={step}>
                  {index + 1}. {step}
                </p>
              ))}
            </div>
          </div>

          {sourcePreviewUrl ? (
            <div className="mt-4 overflow-hidden rounded-[22px] border border-white/10 bg-black/25">
              <div className="relative aspect-[4/5] w-full max-w-[260px]">
                <Image
                  src={sourcePreviewUrl}
                  alt={copy.alt.source}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          {successMessage ? (
            <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {successMessage}
            </div>
          ) : null}

          {showUpgradeCard ? (
            <div className="mt-4 rounded-[22px] border border-amber-300/20 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {copy.upgradeTitle}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-white/62">
                    {copy.upgradeDescription}
                  </p>
                </div>

                <Link
                  href="/dashboard/billing"
                  className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-200 via-sky-200 to-violet-200 px-4 text-sm font-bold text-slate-950 transition hover:opacity-95"
                >
                  {copy.upgradeButton}
                </Link>
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isPending}
            className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {copy.generating}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {copy.generate}
              </>
            )}
          </button>

          {remainingCredits !== null ? (
            <p className="mt-3 text-center text-xs text-white/45">
              {copy.remainingCredits}:{" "}
              <strong className="text-white">{remainingCredits}</strong>
            </p>
          ) : null}
        </div>
      </section>

      <aside className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-6 xl:sticky xl:top-5">
        <h2 className="text-lg font-semibold text-white">{copy.result}</h2>
        <p className="mt-2 text-sm leading-6 text-white/60">
          {copy.resultDescription}
        </p>

        <div className="mt-5 overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
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
          ) : (
            <div className="flex aspect-[4/5] w-full flex-col items-center justify-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-black shadow-[0_14px_34px_rgba(255,255,255,0.15)]">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="mt-4 text-sm font-medium text-white">
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
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm font-medium text-white transition hover:bg-white/[0.1]"
            >
              <Download className="h-4 w-4" />
              {copy.openImage}
            </a>

            <Link
              href={{
                pathname: "/dashboard/banners/new",
                query: { professionalImageUrl: resultUrl },
              }}
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-semibold text-slate-950 transition hover:opacity-90"
            >
              {copy.useInBanner}
            </Link>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
