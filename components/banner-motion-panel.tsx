"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SupportedLocale = "pt-BR" | "en" | "es";

type MotionPreset =
  | "NEON_PULSE"
  | "CLUB_FLASH"
  | "CINEMATIC_ZOOM"
  | "FESTIVAL_LIGHTS"
  | "DARK_TECHNO_GLITCH";

type TransitionVariant =
  | "AUTO"
  | "ROTATE_ZOOM"
  | "WHIP_ZOOM"
  | "SPIN_BLUR"
  | "FLASH_CUT"
  | "GLITCH_ZOOM"
  | "VIRAL_SHAKE";

type MotionStatus = "PENDING" | "RENDERING" | "COMPLETED" | "FAILED";

type MotionItem = {
  id: string;
  preset: MotionPreset;
  transitionVariant?: string | null;
  status: MotionStatus;
  renderProgress: number;
  outputVideoUrl?: string | null;
  errorMessage?: string | null;
  durationSeconds: number;
  createdAt?: string | Date;
};

type BannerMotionPanelProps = {
  bannerId: string;
  locale: SupportedLocale;
  disabled?: boolean;
  initialMotions?: MotionItem[];
};

const copyByLocale = {
  "pt-BR": {
    title: "Criar vídeo animado",
    subtitle:
      "Envie uma música, escolha um estilo e a VPS vai renderizar um MP4 sincronizado com o áudio.",
    music: "Música",
    musicHint: "MP3, WAV, M4A, AAC ou OGG até 30 MB.",
    motionStyle: "Estilo da animação",
    transitionStyle: "Transição premium",
    duration: "Duração",
    generate: "Gerar vídeo animado",
    generating: "Enviando e criando job...",
    queued: "Na fila",
    rendering: "Renderizando na VPS",
    completed: "Vídeo pronto",
    failed: "Falhou",
    download: "Baixar vídeo",
    preview: "Preview do vídeo",
    chooseFile: "Escolha uma música antes de continuar.",
    noBanner: "Este banner ainda não possui imagem final para animar.",
    previous: "Vídeos criados",
    empty: "Nenhum vídeo criado ainda.",
    errorFallback: "Não foi possível iniciar o vídeo.",
  },
  en: {
    title: "Create animated video",
    subtitle:
      "Upload a track, choose a style and the VPS will render a beat-synced MP4.",
    music: "Music",
    musicHint: "MP3, WAV, M4A, AAC or OGG up to 30 MB.",
    motionStyle: "Motion style",
    transitionStyle: "Premium transition",
    duration: "Duration",
    generate: "Generate animated video",
    generating: "Uploading and creating job...",
    queued: "Queued",
    rendering: "Rendering on VPS",
    completed: "Video ready",
    failed: "Failed",
    download: "Download video",
    preview: "Video preview",
    chooseFile: "Choose a music file before continuing.",
    noBanner: "This banner does not have a final image to animate yet.",
    previous: "Created videos",
    empty: "No videos created yet.",
    errorFallback: "Could not start the video.",
  },
  es: {
    title: "Crear video animado",
    subtitle:
      "Sube una música, elige un estilo y la VPS renderizará un MP4 sincronizado.",
    music: "Música",
    musicHint: "MP3, WAV, M4A, AAC u OGG hasta 30 MB.",
    motionStyle: "Estilo de animación",
    transitionStyle: "Transición premium",
    duration: "Duración",
    generate: "Generar video animado",
    generating: "Subiendo y creando job...",
    queued: "En cola",
    rendering: "Renderizando en VPS",
    completed: "Video listo",
    failed: "Falló",
    download: "Descargar video",
    preview: "Vista previa del video",
    chooseFile: "Elige una música antes de continuar.",
    noBanner: "Este banner aún no tiene una imagen final para animar.",
    previous: "Videos creados",
    empty: "Ningún video creado aún.",
    errorFallback: "No fue posible iniciar el video.",
  },
} satisfies Record<SupportedLocale, Record<string, string>>;

const motionPresets: { value: MotionPreset; label: string; hint: string }[] = [
  { value: "FESTIVAL_LIGHTS", label: "Festival Lights", hint: "Lasers, flashes e energia de palco." },
  { value: "NEON_PULSE", label: "Neon Pulse", hint: "Glow neon limpo e batida pulsante." },
  { value: "CLUB_FLASH", label: "Club Flash", hint: "Strobes, flash cuts e vibe balada." },
  { value: "DARK_TECHNO_GLITCH", label: "Dark Techno", hint: "Glitch, RGB split e estética underground." },
  { value: "CINEMATIC_ZOOM", label: "Cinematic Zoom", hint: "Movimento mais premium e suave." },
];

const transitionVariants: { value: TransitionVariant; label: string }[] = [
  { value: "AUTO", label: "Auto Mix" },
  { value: "ROTATE_ZOOM", label: "Rotate Zoom" },
  { value: "WHIP_ZOOM", label: "Whip Zoom" },
  { value: "SPIN_BLUR", label: "Spin Blur" },
  { value: "FLASH_CUT", label: "Flash Cut" },
  { value: "GLITCH_ZOOM", label: "Glitch Zoom" },
  { value: "VIRAL_SHAKE", label: "Viral Shake" },
];

const durations = [6, 10, 15] as const;

function getStatusLabel(status: MotionStatus, copy: Record<string, string>) {
  if (status === "COMPLETED") return copy.completed;
  if (status === "FAILED") return copy.failed;
  if (status === "RENDERING") return copy.rendering;
  return copy.queued;
}

export function BannerMotionPanel({
  bannerId,
  locale,
  disabled = false,
  initialMotions = [],
}: BannerMotionPanelProps) {
  const copy = copyByLocale[locale] || copyByLocale.en;
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<MotionPreset>("FESTIVAL_LIGHTS");
  const [transitionVariant, setTransitionVariant] = useState<TransitionVariant>("AUTO");
  const [durationSeconds, setDurationSeconds] = useState<number>(10);
  const [motions, setMotions] = useState<MotionItem[]>(initialMotions);
  const [activeMotionId, setActiveMotionId] = useState<string | null>(
    initialMotions.find((motion) => ["PENDING", "RENDERING"].includes(motion.status))?.id ||
      initialMotions[0]?.id ||
      null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const activeMotion = useMemo(
    () => motions.find((motion) => motion.id === activeMotionId) || motions[0] || null,
    [activeMotionId, motions],
  );

  useEffect(() => {
    if (!activeMotionId) return;

    const active = motions.find((motion) => motion.id === activeMotionId);
    if (!active || !["PENDING", "RENDERING"].includes(active.status)) return;

    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(
          `/api/banners/${bannerId}/motion/status/${activeMotionId}`,
          { cache: "no-store" },
        );

        if (!response.ok) return;

        const data = (await response.json()) as { motion?: MotionItem };
        if (!data.motion) return;

        setMotions((current) =>
          current.map((motion) =>
            motion.id === data.motion?.id ? { ...motion, ...data.motion } : motion,
          ),
        );
      } catch {
        // Polling should stay silent. The next tick can recover.
      }
    }, 3000);

    return () => window.clearInterval(timer);
  }, [activeMotionId, bannerId, motions]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (disabled) {
      setError(copy.noBanner);
      return;
    }

    if (!audioFile) {
      setError(copy.chooseFile);
      inputRef.current?.focus();
      return;
    }

    const formData = new FormData();
    formData.append("audio", audioFile);
    formData.append("preset", preset);
    formData.append("transitionVariant", transitionVariant);
    formData.append("durationSeconds", String(durationSeconds));

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/banners/${bannerId}/motion/start`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || copy.errorFallback);
      }

      const nextMotion: MotionItem = {
        id: data.motionId,
        preset,
        transitionVariant,
        status: data.status || "PENDING",
        renderProgress: data.renderProgress || 0,
        durationSeconds,
      };

      setMotions((current) => [nextMotion, ...current]);
      setActiveMotionId(nextMotion.id);
      setAudioFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : copy.errorFallback);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-5 rounded-[24px] border border-cyan-300/15 bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
      <div className="flex flex-col gap-2">
        <p className="m-0 text-[11px] uppercase tracking-[0.22em] text-cyan-200/70">
          Motion flyer
        </p>
        <h2 className="m-0 text-2xl font-semibold text-white">{copy.title}</h2>
        <p className="m-0 text-sm leading-6 text-white/58">{copy.subtitle}</p>
      </div>

      {disabled ? (
        <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
          {copy.noBanner}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-white/80">
          {copy.music}
          <input
            ref={inputRef}
            type="file"
            accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/aac,audio/mp4,audio/m4a,audio/ogg"
            disabled={disabled || isSubmitting}
            onChange={(event) => setAudioFile(event.target.files?.[0] || null)}
            className="block w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-200 file:px-4 file:py-2 file:text-sm file:font-bold file:text-slate-950 disabled:opacity-50"
          />
          <span className="text-xs font-normal text-white/42">{copy.musicHint}</span>
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-white/80">
            {copy.motionStyle}
            <select
              value={preset}
              disabled={disabled || isSubmitting}
              onChange={(event) => setPreset(event.target.value as MotionPreset)}
              className="h-12 rounded-2xl border border-white/10 bg-[#090b16] px-4 text-sm text-white outline-none focus:border-cyan-200/60"
            >
              {motionPresets.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <span className="text-xs font-normal text-white/42">
              {motionPresets.find((item) => item.value === preset)?.hint}
            </span>
          </label>

          <label className="grid gap-2 text-sm font-medium text-white/80">
            {copy.transitionStyle}
            <select
              value={transitionVariant}
              disabled={disabled || isSubmitting}
              onChange={(event) => setTransitionVariant(event.target.value as TransitionVariant)}
              className="h-12 rounded-2xl border border-white/10 bg-[#090b16] px-4 text-sm text-white outline-none focus:border-cyan-200/60"
            >
              {transitionVariants.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-2 text-sm font-medium text-white/80">
          {copy.duration}
          <div className="grid grid-cols-3 gap-2">
            {durations.map((duration) => (
              <button
                key={duration}
                type="button"
                disabled={disabled || isSubmitting}
                onClick={() => setDurationSeconds(duration)}
                className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                  durationSeconds === duration
                    ? "border-cyan-200 bg-cyan-200 text-slate-950"
                    : "border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.07]"
                } disabled:opacity-50`}
              >
                {duration}s
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-300/20 bg-red-500/10 p-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={disabled || isSubmitting}
          className="min-h-12 rounded-2xl bg-gradient-to-r from-cyan-200 via-violet-200 to-amber-200 px-5 py-3 text-sm font-black text-slate-950 shadow-[0_18px_60px_rgba(125,211,252,0.18)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? copy.generating : copy.generate}
        </button>
      </form>

      <div className="mt-6 border-t border-white/10 pt-5">
        <h3 className="m-0 text-base font-semibold text-white">{copy.previous}</h3>

        {!motions.length ? (
          <p className="mt-3 text-sm text-white/45">{copy.empty}</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {motions.map((motion) => {
              const isActive = activeMotion?.id === motion.id;
              const progress = Math.max(0, Math.min(100, motion.renderProgress || 0));

              return (
                <button
                  key={motion.id}
                  type="button"
                  onClick={() => setActiveMotionId(motion.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    isActive
                      ? "border-cyan-200/45 bg-cyan-200/[0.08]"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="m-0 text-sm font-bold text-white">
                        {motion.preset?.replaceAll("_", " ") || "Motion flyer"}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/42">
                        {motion.transitionVariant || "AUTO"} · {motion.durationSeconds || 10}s
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-bold text-white/70">
                      {getStatusLabel(motion.status, copy)}
                    </span>
                  </div>

                  {motion.status !== "COMPLETED" ? (
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-200 to-violet-200"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  ) : null}

                  {motion.errorMessage ? (
                    <p className="mt-3 text-sm text-red-200">{motion.errorMessage}</p>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}

        {activeMotion?.status === "COMPLETED" && activeMotion.outputVideoUrl ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-3">
            <p className="mb-3 text-sm font-semibold text-white">{copy.preview}</p>
            <video
              src={activeMotion.outputVideoUrl}
              controls
              playsInline
              className="aspect-[2/3] w-full rounded-xl bg-black object-cover"
            />
            <a
              href={activeMotion.outputVideoUrl}
              download
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-950"
            >
              {copy.download}
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
