"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from "react";

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
      "Envie uma música, selecione o trecho mais forte e a VPS renderiza um MP4 sincronizado com o áudio.",
    music: "Música",
    musicHint: "MP3, WAV, M4A, AAC ou OGG até 30 MB. Apenas o trecho selecionado será enviado.",
    selectedClip: "Trecho selecionado",
    startAt: "Início",
    endAt: "Fim",
    clipDuration: "Duração do vídeo",
    listenClip: "Ouvir trecho",
    stopClip: "Parar",
    trimUnavailable: "Carregue uma música para escolher o trecho.",
    trimming: "Cortando áudio no navegador...",
    motionStyle: "Estilo da animação",
    transitionStyle: "Transição premium",
    generate: "Gerar vídeo animado",
    generating: "Enviando trecho e criando job...",
    queued: "Na fila",
    rendering: "Renderizando na VPS",
    completed: "Vídeo pronto",
    failed: "Falhou",
    download: "Baixar vídeo",
    preview: "Preview do vídeo",
    chooseFile: "Escolha uma música antes de continuar.",
    noBanner: "Este flyer ainda não possui imagem final para animar.",
    previous: "Vídeos criados",
    empty: "Nenhum vídeo criado ainda.",
    errorFallback: "Não foi possível iniciar o vídeo.",
    cropError: "Não foi possível cortar esse áudio. Tente outro arquivo MP3 ou WAV.",
    progressHint: "O progresso abaixo vem do render real da VPS.",
    trimModalTitle: "Escolha o melhor trecho da música",
    trimModalSubtitle: "Abrimos um corte com a duração escolhida. Mova a janela até a parte mais forte da música antes de gerar o vídeo.",
    selectedFile: "Arquivo selecionado",
    editClip: "Editar corte",
    confirmClip: "Usar este trecho",
    close: "Fechar",
    clipReady: "Trecho definido",
    chooseBestPart: "Mova o corte para o drop, refrão ou parte mais forte da música.",
    loadingAudio: "Carregando duração do áudio...",
    confirmClipFirst: "Confirme o trecho da música antes de gerar o vídeo.",
  },
  en: {
    title: "Create animated video",
    subtitle:
      "Upload a track, pick the strongest part and the VPS will render a beat-synced MP4.",
    music: "Music",
    musicHint: "MP3, WAV, M4A, AAC or OGG up to 30 MB. Only the selected clip will be uploaded.",
    selectedClip: "Selected clip",
    startAt: "Start",
    endAt: "End",
    clipDuration: "Video duration",
    listenClip: "Preview clip",
    stopClip: "Stop",
    trimUnavailable: "Upload a track to choose the clip.",
    trimming: "Trimming audio in the browser...",
    motionStyle: "Motion style",
    transitionStyle: "Premium transition",
    generate: "Generate animated video",
    generating: "Uploading clip and creating job...",
    queued: "Queued",
    rendering: "Rendering on VPS",
    completed: "Video ready",
    failed: "Failed",
    download: "Download video",
    preview: "Video preview",
    chooseFile: "Choose a music file before continuing.",
    noBanner: "This flyer does not have a final image to animate yet.",
    previous: "Created videos",
    empty: "No videos created yet.",
    errorFallback: "Could not start the video.",
    cropError: "Could not trim this audio. Try another MP3 or WAV file.",
    progressHint: "The progress below comes from the real VPS render.",
    trimModalTitle: "Pick the best part of the track",
    trimModalSubtitle: "We open a clip using the selected duration. Move the window to the strongest part of the track before rendering.",
    selectedFile: "Selected file",
    editClip: "Edit clip",
    confirmClip: "Use this clip",
    close: "Close",
    clipReady: "Clip selected",
    chooseBestPart: "Move the clip to the drop, hook or strongest part.",
    loadingAudio: "Loading audio duration...",
    confirmClipFirst: "Confirm the music clip before generating the video.",
  },
  es: {
    title: "Crear video animado",
    subtitle:
      "Sube una música, elige el mejor trecho y la VPS renderizará un MP4 sincronizado.",
    music: "Música",
    musicHint: "MP3, WAV, M4A, AAC u OGG hasta 30 MB. Solo se subirá el trecho seleccionado.",
    selectedClip: "Trecho seleccionado",
    startAt: "Inicio",
    endAt: "Fin",
    clipDuration: "Duración del video",
    listenClip: "Escuchar trecho",
    stopClip: "Parar",
    trimUnavailable: "Sube una música para elegir el trecho.",
    trimming: "Cortando audio en el navegador...",
    motionStyle: "Estilo de animación",
    transitionStyle: "Transición premium",
    generate: "Generar video animado",
    generating: "Subiendo trecho y creando job...",
    queued: "En cola",
    rendering: "Renderizando en VPS",
    completed: "Video listo",
    failed: "Falló",
    download: "Descargar video",
    preview: "Vista previa del video",
    chooseFile: "Elige una música antes de continuar.",
    noBanner: "Este flyer aún no tiene imagen final para animar.",
    previous: "Videos creados",
    empty: "Ningún video creado aún.",
    errorFallback: "No fue posible iniciar el video.",
    cropError: "No fue posible cortar este audio. Prueba otro MP3 o WAV.",
    progressHint: "El progreso abajo viene del render real de la VPS.",
    trimModalTitle: "Elige la mejor parte de la música",
    trimModalSubtitle: "Abrimos un corte con la duración elegida. Mueve la ventana hasta la parte más fuerte antes de renderizar.",
    selectedFile: "Archivo seleccionado",
    editClip: "Editar corte",
    confirmClip: "Usar este trecho",
    close: "Cerrar",
    clipReady: "Trecho definido",
    chooseBestPart: "Mueve el corte al drop, coro o parte más fuerte.",
    loadingAudio: "Cargando duración del audio...",
    confirmClipFirst: "Confirma el trecho de la música antes de generar el video.",
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

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = Math.floor(safeSeconds % 60);
  const tenths = Math.floor((safeSeconds % 1) * 10);
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}.${tenths}`;
}

function getBaseFileName(fileName: string) {
  const withoutExtension = fileName.replace(/\.[^.]+$/, "");
  return (
    withoutExtension
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9-_]+/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 70) || "audio"
  );
}

function writeString(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}

function audioBufferSegmentToWav(audioBuffer: AudioBuffer, startSeconds: number, durationSeconds: number) {
  const sampleRate = audioBuffer.sampleRate;
  const numberOfChannels = Math.min(audioBuffer.numberOfChannels, 2);
  const startSample = Math.max(0, Math.floor(startSeconds * sampleRate));
  const requestedFrameCount = Math.floor(durationSeconds * sampleRate);
  const availableFrameCount = Math.max(0, audioBuffer.length - startSample);
  const frameCount = Math.min(requestedFrameCount, availableFrameCount);

  if (frameCount <= 0) {
    throw new Error("Invalid audio clip range.");
  }

  const bytesPerSample = 2;
  const blockAlign = numberOfChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = frameCount * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  const channelData = Array.from({ length: numberOfChannels }, (_, channel) =>
    audioBuffer.getChannelData(channel),
  );

  for (let sample = 0; sample < frameCount; sample += 1) {
    for (let channel = 0; channel < numberOfChannels; channel += 1) {
      const sourceValue = channelData[channel]?.[startSample + sample] || 0;
      const clampedValue = Math.max(-1, Math.min(1, sourceValue));
      const intValue = clampedValue < 0 ? clampedValue * 0x8000 : clampedValue * 0x7fff;
      view.setInt16(offset, intValue, true);
      offset += 2;
    }
  }

  return buffer;
}

async function trimAudioFile(file: File, startSeconds: number, durationSeconds: number) {
  const AudioContextConstructor =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextConstructor) {
    throw new Error("AudioContext is not supported in this browser.");
  }

  const audioContext = new AudioContextConstructor();

  try {
    const arrayBuffer = await file.arrayBuffer();
    const decodedAudio = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    const wavBuffer = audioBufferSegmentToWav(decodedAudio, startSeconds, durationSeconds);
    const clipName = `${getBaseFileName(file.name)}-clip-${Math.round(startSeconds)}s-${durationSeconds}s.wav`;

    return new File([wavBuffer], clipName, { type: "audio/wav" });
  } finally {
    await audioContext.close().catch(() => undefined);
  }
}

export function BannerMotionPanel({
  bannerId,
  locale,
  disabled = false,
  initialMotions = [],
}: BannerMotionPanelProps) {
  const copy = copyByLocale[locale] || copyByLocale.en;
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioObjectUrl, setAudioObjectUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [trimStartSeconds, setTrimStartSeconds] = useState(0);
  const [isTrimModalOpen, setIsTrimModalOpen] = useState(false);
  const [clipConfirmed, setClipConfirmed] = useState(false);
  const [isPreviewingClip, setIsPreviewingClip] = useState(false);
  const [isTrimmingAudio, setIsTrimmingAudio] = useState(false);
  const [preset, setPreset] = useState<MotionPreset>("FESTIVAL_LIGHTS");
  const [transitionVariant, setTransitionVariant] = useState<TransitionVariant>("AUTO");
  const [durationSeconds, setDurationSeconds] = useState<number>(15);
  const [motions, setMotions] = useState<MotionItem[]>(initialMotions);
  const [activeMotionId, setActiveMotionId] = useState<string | null>(
    initialMotions.find((motion) => ["PENDING", "RENDERING"].includes(motion.status))?.id ||
      initialMotions[0]?.id ||
      null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const [isDraggingClip, setIsDraggingClip] = useState(false);
  const autoPreviewTimeoutRef = useRef<number | null>(null);
  const previewStartRef = useRef(0);
  const previewEndRef = useRef(0);

  const maxTrimStart = Math.max(0, audioDuration - durationSeconds);
  const trimEndSeconds = Math.min(audioDuration || durationSeconds, trimStartSeconds + durationSeconds);
  const effectiveClipDuration = Math.max(0, trimEndSeconds - trimStartSeconds);
  const clipLeftPercent = audioDuration > 0 ? (trimStartSeconds / audioDuration) * 100 : 0;
  const clipWidthPercent = audioDuration > 0 ? (effectiveClipDuration / audioDuration) * 100 : 100;
  const canUseClip = Boolean(audioFile && audioObjectUrl && audioDuration > 0);

  const activeMotion = useMemo(
    () => motions.find((motion) => motion.id === activeMotionId) || motions[0] || null,
    [activeMotionId, motions],
  );

  useEffect(() => {
    return () => {
      if (audioObjectUrl) URL.revokeObjectURL(audioObjectUrl);
      if (autoPreviewTimeoutRef.current) {
        window.clearTimeout(autoPreviewTimeoutRef.current);
      }
    };
  }, [audioObjectUrl]);

  useEffect(() => {
    previewStartRef.current = trimStartSeconds;
    previewEndRef.current = trimEndSeconds;
  }, [trimEndSeconds, trimStartSeconds]);

  useEffect(() => {
    setTrimStartSeconds((current) => Math.min(current, maxTrimStart));
  }, [maxTrimStart]);

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
    }, 1500);

    return () => window.clearInterval(timer);
  }, [activeMotionId, bannerId, motions]);

  function handleAudioFileChange(file: File | null) {
    setAudioFile(file);
    setAudioDuration(0);
    setTrimStartSeconds(0);
    setIsPreviewingClip(false);
    setIsTrimModalOpen(Boolean(file));
    setClipConfirmed(false);
    setError(null);

    if (audioObjectUrl) {
      URL.revokeObjectURL(audioObjectUrl);
    }

    if (!file) {
      setAudioObjectUrl(null);
      return;
    }

    setAudioObjectUrl(URL.createObjectURL(file));
  }

  function stopClipPreview(options?: { resetToStart?: boolean }) {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    if (options?.resetToStart) {
      audio.currentTime = previewStartRef.current;
    }
    setIsPreviewingClip(false);
  }

  async function playClipPreview(startSeconds = trimStartSeconds) {
    const audio = audioRef.current;
    if (!audio || !audioObjectUrl || !audioDuration) return;

    const safeStart = Math.max(0, Math.min(startSeconds, maxTrimStart));
    const safeEnd = Math.min(audioDuration, safeStart + durationSeconds);

    previewStartRef.current = safeStart;
    previewEndRef.current = safeEnd;

    audio.pause();
    audio.currentTime = safeStart;

    try {
      await audio.play();
      setIsPreviewingClip(true);
    } catch {
      setIsPreviewingClip(false);
    }
  }

  function scheduleAutoPreview(startSeconds: number) {
    if (!audioObjectUrl || !audioDuration) return;

    if (autoPreviewTimeoutRef.current) {
      window.clearTimeout(autoPreviewTimeoutRef.current);
    }

    autoPreviewTimeoutRef.current = window.setTimeout(() => {
      void playClipPreview(startSeconds);
    }, 90);
  }

  function getStartFromTimelineClientX(clientX: number, options?: { centerClip?: boolean }) {
    const timeline = timelineRef.current;
    if (!timeline || !audioDuration) return trimStartSeconds;

    const rect = timeline.getBoundingClientRect();
    if (rect.width <= 0) return trimStartSeconds;

    const rawSeconds = ((clientX - rect.left) / rect.width) * audioDuration;
    const adjustedSeconds = options?.centerClip ? rawSeconds - durationSeconds / 2 : rawSeconds;

    return Math.max(0, Math.min(maxTrimStart, adjustedSeconds));
  }

  function applyTrimStart(nextStart: number, options?: { preview?: boolean }) {
    const safeStart = Math.max(0, Math.min(maxTrimStart, nextStart));

    setTrimStartSeconds(safeStart);
    setClipConfirmed(false);

    if (options?.preview !== false) {
      scheduleAutoPreview(safeStart);
    }
  }

  function handleTimelinePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!audioDuration || disabled || isSubmitting) return;

    const nextStart = getStartFromTimelineClientX(event.clientX, { centerClip: true });
    applyTrimStart(nextStart);
  }

  function handleSelectedClipPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!audioDuration || disabled || isSubmitting || !timelineRef.current) return;

    event.preventDefault();
    event.stopPropagation();

    const timeline = timelineRef.current;
    const rect = timeline.getBoundingClientRect();
    const dragStartX = event.clientX;
    const initialStart = trimStartSeconds;
    let latestStart = initialStart;

    setIsDraggingClip(true);
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (rect.width <= 0) return;

      const deltaSeconds = ((moveEvent.clientX - dragStartX) / rect.width) * audioDuration;
      latestStart = Math.max(0, Math.min(maxTrimStart, initialStart + deltaSeconds));
      applyTrimStart(latestStart);
    };

    const handlePointerUp = () => {
      setIsDraggingClip(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      scheduleAutoPreview(latestStart);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }

  async function handlePreviewClip() {
    if (isPreviewingClip) {
      stopClipPreview({ resetToStart: true });
      return;
    }

    await playClipPreview(trimStartSeconds);
  }

  function handleAudioTimeUpdate() {
    const audio = audioRef.current;
    if (!audio || !isPreviewingClip) return;

    if (audio.currentTime >= previewEndRef.current || audio.ended) {
      audio.pause();
      audio.currentTime = previewStartRef.current;
      setIsPreviewingClip(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

    if (!clipConfirmed) {
      setError(copy.confirmClipFirst);
      setIsTrimModalOpen(true);
      return;
    }

    let uploadAudioFile = audioFile;

    try {
      setIsSubmitting(true);
      setIsTrimmingAudio(true);
      uploadAudioFile = await trimAudioFile(audioFile, trimStartSeconds, durationSeconds);
    } catch (trimError) {
      setError(trimError instanceof Error ? trimError.message || copy.cropError : copy.cropError);
      setIsSubmitting(false);
      setIsTrimmingAudio(false);
      return;
    }

    setIsTrimmingAudio(false);

    const formData = new FormData();
    formData.append("audio", uploadAudioFile);
    formData.append("originalAudioName", audioFile.name);
    formData.append("audioTrimStartSeconds", String(trimStartSeconds));
    formData.append("audioTrimEndSeconds", String(trimStartSeconds + durationSeconds));
    formData.append("audioWasTrimmed", "true");
    formData.append("preset", preset);
    formData.append("transitionVariant", transitionVariant);
    formData.append("durationSeconds", String(durationSeconds));

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
      handleAudioFileChange(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : copy.errorFallback);
    } finally {
      setIsSubmitting(false);
      setIsTrimmingAudio(false);
    }
  }

  const currentProgress = Math.max(0, Math.min(100, activeMotion?.renderProgress || 0));

  return (
    <section id="motion" className="mt-5 scroll-mt-6 rounded-[24px] border border-cyan-300/15 bg-white/[0.045] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
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
            onChange={(event) => handleAudioFileChange(event.target.files?.[0] || null)}
            className="block w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-200 file:px-4 file:py-2 file:text-sm file:font-bold file:text-slate-950 disabled:opacity-50"
          />
          <span className="text-xs font-normal text-white/42">{copy.musicHint}</span>
        </label>

        {audioObjectUrl ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <audio
              ref={audioRef}
              src={audioObjectUrl}
              preload="metadata"
              onLoadedMetadata={(event) => setAudioDuration(event.currentTarget.duration || 0)}
              onTimeUpdate={handleAudioTimeUpdate}
              onPause={() => setIsPreviewingClip(false)}
              className="hidden"
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="m-0 text-sm font-bold text-white">{copy.clipReady}</p>
                <p className="mt-1 text-xs text-white/45">
                  {audioFile?.name ? `${copy.selectedFile}: ${audioFile.name}` : copy.selectedClip}
                </p>
                <p className="mt-1 text-xs text-cyan-100/75">
                  {audioDuration > 0
                    ? `${copy.startAt}: ${formatTime(trimStartSeconds)} · ${copy.endAt}: ${formatTime(trimEndSeconds)} · ${Math.round(effectiveClipDuration)}s`
                    : copy.loadingAudio}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!audioDuration || disabled || isSubmitting}
                  onClick={handlePreviewClip}
                  className="min-h-10 rounded-xl border border-cyan-200/25 bg-cyan-200/10 px-4 text-xs font-black uppercase tracking-[0.12em] text-cyan-100 disabled:opacity-50"
                >
                  {isPreviewingClip ? copy.stopClip : copy.listenClip}
                </button>

                <button
                  type="button"
                  disabled={disabled || isSubmitting}
                  onClick={() => setIsTrimModalOpen(true)}
                  className="min-h-10 rounded-xl border border-white/10 bg-white/[0.06] px-4 text-xs font-black uppercase tracking-[0.12em] text-white/80 disabled:opacity-50"
                >
                  {copy.editClip}
                </button>
              </div>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-200 via-violet-200 to-amber-200"
                style={{
                  marginLeft: `${clipLeftPercent}%`,
                  width: `${clipWidthPercent}%`,
                }}
              />
            </div>
          </div>
        ) : null}

        <div className="grid gap-2 text-sm font-medium text-white/80">
          {copy.clipDuration}
          <div className="grid grid-cols-3 gap-2">
            {durations.map((duration) => (
              <button
                key={duration}
                type="button"
                disabled={disabled || isSubmitting}
                onClick={() => {
                  setDurationSeconds(duration);
                  setClipConfirmed(false);
                  if (isTrimModalOpen && audioDuration > 0) {
                    scheduleAutoPreview(Math.min(trimStartSeconds, Math.max(0, audioDuration - duration)));
                  }
                }}
                className={`rounded-2xl border px-3 py-2.5 text-sm font-bold transition sm:px-4 sm:py-3 ${
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

        {activeMotion && ["PENDING", "RENDERING"].includes(activeMotion.status) ? (
          <div className="rounded-2xl border border-cyan-200/15 bg-cyan-200/[0.06] p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="m-0 text-sm font-bold text-white">
                  {getStatusLabel(activeMotion.status, copy)}
                </p>
                <p className="mt-1 text-xs text-white/45">{copy.progressHint}</p>
              </div>
              <strong className="text-lg text-cyan-100">{currentProgress}%</strong>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-200 via-violet-200 to-amber-200 transition-[width] duration-500"
                style={{ width: `${currentProgress}%` }}
              />
            </div>
          </div>
        ) : null}

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
          {isTrimmingAudio ? copy.trimming : isSubmitting ? copy.generating : copy.generate}
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
                      {getStatusLabel(motion.status, copy)} · {progress}%
                    </span>
                  </div>

                  {motion.status !== "COMPLETED" ? (
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-200 to-violet-200 transition-[width] duration-500"
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

      {audioObjectUrl && isTrimModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/[0.78] px-3 pb-3 pt-8 backdrop-blur-xl sm:items-center sm:px-4 sm:py-6"
          role="dialog"
          aria-modal="true"
          aria-label={copy.trimModalTitle}
        >
          <div className="relative max-h-[92vh] w-full max-w-[720px] overflow-y-auto rounded-t-[28px] border border-cyan-200/[0.18] bg-[#070914] p-4 shadow-[0_30px_120px_rgba(0,0,0,0.65)] sm:rounded-[28px] sm:p-6">
            <button
              type="button"
              onClick={() => setIsTrimModalOpen(false)}
              className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-lg font-black text-white/70 hover:bg-white/[0.1] sm:right-4 sm:top-4"
              aria-label={copy.close}
            >
              ×
            </button>

            <div className="pr-10 sm:pr-12">
              <p className="m-0 text-[10px] uppercase tracking-[0.2em] text-cyan-200/70 sm:text-[11px] sm:tracking-[0.22em]">
                Audio cut
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white sm:text-2xl">{copy.trimModalTitle}</h3>
              <p className="mt-2 text-xs leading-5 text-white/58 sm:text-sm sm:leading-6">{copy.trimModalSubtitle}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-100/75">
                {copy.clipDuration}: {durationSeconds}s
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/[0.24] p-3 sm:mt-5 sm:p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="m-0 text-sm font-bold text-white">{copy.selectedClip}</p>
                  <p className="mt-1 text-xs text-white/45">
                    {audioDuration > 0
                      ? `${copy.startAt}: ${formatTime(trimStartSeconds)} · ${copy.endAt}: ${formatTime(trimEndSeconds)}`
                      : copy.loadingAudio}
                  </p>
                </div>
                <div className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-cyan-100">
                  {Math.round(effectiveClipDuration || durationSeconds)}s
                </div>
              </div>

              <div className="mt-4 rounded-[22px] border border-white/10 bg-[#050711] p-3 sm:mt-5 sm:p-4">
                <div
                  ref={timelineRef}
                  onPointerDown={handleTimelinePointerDown}
                  className="relative h-20 cursor-crosshair overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-amber-400/10 sm:h-24"
                >
                  <div className="absolute inset-0 opacity-55">
                    {Array.from({ length: 72 }).map((_, index) => {
                      const height = 18 + Math.abs(Math.sin(index * 1.73)) * 52;
                      return (
                        <span
                          key={index}
                          className="absolute bottom-1/2 w-[2px] translate-y-1/2 rounded-full bg-cyan-100/40 sm:w-[3px] sm:bg-cyan-100/45"
                          style={{
                            left: `${(index / 71) * 100}%`,
                            height,
                          }}
                        />
                      );
                    })}
                  </div>

                  <div
                    role="slider"
                    aria-label={copy.selectedClip}
                    aria-valuemin={0}
                    aria-valuemax={Math.round(maxTrimStart)}
                    aria-valuenow={Math.round(trimStartSeconds)}
                    tabIndex={0}
                    onPointerDown={handleSelectedClipPointerDown}
                    onKeyDown={(event) => {
                      if (!audioDuration || disabled || isSubmitting) return;

                      const step = event.shiftKey ? 5 : 0.5;

                      if (event.key === "ArrowLeft") {
                        event.preventDefault();
                        applyTrimStart(trimStartSeconds - step);
                      }

                      if (event.key === "ArrowRight") {
                        event.preventDefault();
                        applyTrimStart(trimStartSeconds + step);
                      }
                    }}
                    className={`absolute bottom-0 top-0 select-none rounded-2xl border-2 border-cyan-200 bg-cyan-200/18 shadow-[0_0_42px_rgba(125,211,252,0.34)] ${
                      isDraggingClip ? "cursor-grabbing scale-[1.01]" : "cursor-grab"
                    }`}
                    style={{
                      left: `${clipLeftPercent}%`,
                      width: `${clipWidthPercent}%`,
                      touchAction: "none",
                    }}
                  >
                    <div className="absolute -left-1 top-0 h-full w-3 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.8)] sm:w-2" />
                    <div className="absolute -right-1 top-0 h-full w-3 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.8)] sm:w-2" />
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="flex items-center gap-1 rounded-full border border-white/15 bg-black/25 px-3 py-2 backdrop-blur-sm">
                        <span className="h-5 w-[2px] rounded-full bg-white/70" />
                        <span className="h-5 w-[2px] rounded-full bg-white/45" />
                        <span className="h-5 w-[2px] rounded-full bg-white/70" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  <input
                    type="range"
                    min={0}
                    max={maxTrimStart || 0}
                    step={0.1}
                    value={Math.min(trimStartSeconds, maxTrimStart)}
                    disabled={!audioDuration || disabled || isSubmitting}
                    onChange={(event) => {
                      applyTrimStart(Number(event.target.value));
                    }}
                    className="w-full accent-cyan-200"
                  />
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-white/38">
                    <span>00:00.0</span>
                    <span>{formatTime(audioDuration)}</span>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-[11px] leading-5 text-white/46 sm:mt-4 sm:text-xs">{copy.chooseBestPart}</p>

              <div className="mt-5 grid gap-2 text-sm font-medium text-white/80">
                {copy.clipDuration}
                <div className="grid grid-cols-3 gap-2">
                  {durations.map((duration) => (
                    <button
                      key={duration}
                      type="button"
                      disabled={disabled || isSubmitting}
                      onClick={() => {
                        const nextStart = Math.min(trimStartSeconds, Math.max(0, audioDuration - duration));
                        setDurationSeconds(duration);
                        setClipConfirmed(false);
                        window.setTimeout(() => applyTrimStart(nextStart), 0);
                      }}
                      className={`rounded-2xl border px-3 py-2.5 text-sm font-bold transition sm:px-4 sm:py-3 ${
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

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={!canUseClip || disabled || isSubmitting}
                  onClick={handlePreviewClip}
                  className="min-h-11 flex-1 rounded-2xl border border-cyan-200/25 bg-cyan-200/10 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-cyan-100 disabled:opacity-50 sm:min-h-12 sm:px-5 sm:text-sm sm:tracking-[0.13em]"
                >
                  {isPreviewingClip ? copy.stopClip : copy.listenClip}
                </button>

                <button
                  type="button"
                  disabled={!canUseClip || disabled || isSubmitting}
                  onClick={() => {
                    setClipConfirmed(true);
                    stopClipPreview();
                    setIsTrimModalOpen(false);
                  }}
                  className="min-h-11 flex-1 rounded-2xl bg-gradient-to-r from-cyan-200 via-violet-200 to-amber-200 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-950 shadow-[0_18px_60px_rgba(125,211,252,0.18)] disabled:opacity-50 sm:min-h-12 sm:px-5 sm:text-sm sm:tracking-[0.13em]"
                >
                  {copy.confirmClip}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
