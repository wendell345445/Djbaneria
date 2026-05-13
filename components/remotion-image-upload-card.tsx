"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";

import type { SupportedLocale } from "@/lib/i18n";

const copyByLocale: Record<
  SupportedLocale,
  {
    eyebrow: string;
    title: string;
    subtitle: string;
    imageLabel: string;
    chooseImage: string;
    changeImage: string;
    hint: string;
    uploading: string;
    uploaded: string;
    autoUploadHint: string;
    errorFallback: string;
    readyLabel: string;
  }
> = {
  "pt-BR": {
    eyebrow: "Flyer para Remotion",
    title: "Enviar flyer para animar",
    subtitle:
      "Envie um flyer pronto ou arte final em PNG, JPG ou WEBP. Assim que você escolher o arquivo, ele será enviado automaticamente e o editor será liberado logo abaixo.",
    imageLabel: "Arquivo do flyer",
    chooseImage: "Clique para escolher o flyer",
    changeImage: "Clique para trocar o flyer",
    hint: "Envie a arte final do flyer, não uma foto solta. PNG, JPG ou WEBP até 18 MB.",
    uploading: "Enviando flyer automaticamente...",
    uploaded: "Flyer enviado. Liberando editor...",
    autoUploadHint: "O envio começa automaticamente ao escolher o arquivo.",
    errorFallback: "Não foi possível enviar o flyer.",
    readyLabel: "Envio automático",
  },
  en: {
    eyebrow: "Flyer for Remotion",
    title: "Upload a flyer to animate",
    subtitle:
      "Upload a finished flyer or final artwork in PNG, JPG or WEBP. As soon as you choose the file, it will upload automatically and unlock the editor below.",
    imageLabel: "Flyer file",
    chooseImage: "Click to choose the flyer",
    changeImage: "Click to change the flyer",
    hint: "Upload the final flyer artwork, not a loose photo. PNG, JPG or WEBP up to 18 MB.",
    uploading: "Uploading flyer automatically...",
    uploaded: "Flyer uploaded. Unlocking editor...",
    autoUploadHint: "Upload starts automatically when you choose the file.",
    errorFallback: "Could not upload the flyer.",
    readyLabel: "Auto upload",
  },
  es: {
    eyebrow: "Flyer para Remotion",
    title: "Sube un flyer para animar",
    subtitle:
      "Sube un flyer listo o arte final en PNG, JPG o WEBP. En cuanto elijas el archivo, se enviará automáticamente y liberará el editor abajo.",
    imageLabel: "Archivo del flyer",
    chooseImage: "Haz clic para elegir el flyer",
    changeImage: "Haz clic para cambiar el flyer",
    hint: "Sube el arte final del flyer, no una foto suelta. PNG, JPG o WEBP hasta 18 MB.",
    uploading: "Subiendo flyer automáticamente...",
    uploaded: "Flyer enviado. Liberando editor...",
    autoUploadHint: "El envío comienza automáticamente al elegir el archivo.",
    errorFallback: "No fue posible subir el flyer.",
    readyLabel: "Envío automático",
  },
};

type UploadedBanner = {
  id: string;
  title: string;
  outputImageUrl: string | null;
};

type UploadResponse = {
  banner?: UploadedBanner;
  error?: string;
};

export function RemotionImageUploadCard({
  locale,
  embedded = false,
  resetKey = 0,
  onManualImageSelected,
  onUploadCompleted,
}: {
  locale: SupportedLocale;
  embedded?: boolean;
  resetKey?: number;
  onManualImageSelected?: (fileName: string) => void;
  onUploadCompleted?: (banner: UploadedBanner) => void;
}) {
  const copy = copyByLocale[locale] || copyByLocale.en;
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const uploadTokenRef = useRef(0);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    uploadTokenRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    setFile(null);
    setError(null);
    setIsUploading(false);
    setHasUploaded(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [resetKey]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  async function uploadFile(nextFile: File) {
    const uploadToken = uploadTokenRef.current + 1;
    uploadTokenRef.current = uploadToken;
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    const formData = new FormData();
    formData.append("image", nextFile);

    try {
      setIsUploading(true);
      setHasUploaded(false);
      setError(null);

      const response = await fetch("/api/remotion/upload-image", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      const data = (await response.json().catch(() => ({}))) as UploadResponse;

      if (uploadToken !== uploadTokenRef.current) {
        return;
      }

      if (!response.ok || !data.banner?.id) {
        throw new Error(data.error || copy.errorFallback);
      }

      setHasUploaded(true);
      onUploadCompleted?.(data.banner);
      router.replace(
        `/dashboard/remotion?bannerId=${data.banner.id}&source=manual`,
      );
      router.refresh();
    } catch (uploadError) {
      if (uploadError instanceof DOMException && uploadError.name === "AbortError") {
        return;
      }

      if (uploadToken !== uploadTokenRef.current) {
        return;
      }

      setError(
        uploadError instanceof Error ? uploadError.message : copy.errorFallback,
      );
    } finally {
      if (uploadToken === uploadTokenRef.current) {
        setIsUploading(false);
      }
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] || null;
    setFile(nextFile);
    setError(null);
    setHasUploaded(false);

    if (!nextFile) {
      return;
    }

    onManualImageSelected?.(nextFile.name);
    void uploadFile(nextFile);
  }

  return (
    <div
      className={
        embedded
          ? "relative overflow-hidden border border-cyan-300/12 bg-black/18 p-4 sm:p-5"
          : "relative overflow-hidden border border-cyan-300/14 bg-white/[0.035] p-4 shadow-[0_24px_90px_rgba(0,0,0,0.30)] sm:p-5"
      }
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/55 to-transparent" />
      <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />

      <div className="relative grid gap-4">
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center border border-cyan-200/25 bg-cyan-200/[0.08] text-cyan-100 shadow-[0_0_24px_rgba(0,245,255,0.12)]">
              <UploadCloud size={19} />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-cyan-100/58">
                {copy.eyebrow}
              </p>
              <h2 className="mt-1 text-lg font-black uppercase tracking-[-0.035em] text-white sm:text-xl">
                {copy.title}
              </h2>
              <p className="mt-2 max-w-2xl text-xs leading-5 text-white/48 sm:text-sm sm:leading-6">
                {copy.subtitle}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-white/62">
            <span>{copy.imageLabel}</span>
            <button
              type="button"
              disabled={isUploading}
              onClick={() => inputRef.current?.click()}
              className="group relative grid min-h-32 place-items-center overflow-hidden border border-dashed border-cyan-200/24 bg-[#050712]/70 p-4 text-center transition hover:border-cyan-200/50 hover:bg-cyan-200/[0.045] disabled:cursor-wait disabled:opacity-70"
            >
              <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,245,255,0.10),transparent_45%)] opacity-0 transition group-hover:opacity-100" />
              <div className="relative min-w-0">
                <p className="truncate text-sm font-black normal-case tracking-normal text-white sm:text-base">
                  {file?.name || copy.chooseImage}
                </p>
                <p className="mt-2 text-[11px] font-medium normal-case tracking-normal text-white/42">
                  {file ? copy.changeImage : copy.hint}
                </p>
                <span className="mt-3 inline-flex border border-cyan-200/25 bg-cyan-300/[0.09] px-3 py-1 font-mono text-[9px] font-black uppercase tracking-[0.16em] text-cyan-100">
                  {isUploading ? copy.uploading : hasUploaded ? copy.uploaded : copy.readyLabel}
                </span>
              </div>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              disabled={isUploading}
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-[11px] font-medium normal-case tracking-normal text-cyan-50/42">
              {copy.autoUploadHint}
            </p>
          </div>
        </div>

        {isUploading || error || hasUploaded ? (
          <div className="grid gap-3">
            {isUploading ? (
              <div className="flex items-center gap-3 border border-cyan-200/18 bg-cyan-300/[0.07] p-3 text-sm leading-5 text-cyan-50/78">
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                <span>{copy.uploading}</span>
              </div>
            ) : null}

            {hasUploaded && !isUploading ? (
              <div className="border border-emerald-300/18 bg-emerald-300/[0.08] p-3 text-sm leading-5 text-emerald-50/82">
                {copy.uploaded}
              </div>
            ) : null}

            {error ? (
              <div className="border border-red-300/20 bg-red-500/10 p-3 text-sm leading-5 text-red-100">
                {error}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
