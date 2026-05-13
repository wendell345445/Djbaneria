"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  ImageIcon,
  Info,
  Layers3,
  Loader2,
  Music2,
  PlayCircle,
  UploadCloud,
  Video,
  Wand2,
  Zap,
} from "lucide-react";

import { normalizeLocale } from "@/lib/i18n";

type Resolution = "480" | "720";
type SeedanceStatus = "PENDING" | "RENDERING" | "COMPLETED" | "FAILED";

type SeedanceJob = {
  videoId: string;
  status: SeedanceStatus;
  renderProgress: number;
  queuePosition?: number | null;
  outputVideoUrl?: string | null;
  inputImageUrl?: string | null;
  errorMessage?: string | null;
  expiresAt?: string | null;
  resolution?: string | null;
  width?: number | null;
  height?: number | null;
};

type AnimatedFlyerLocale = "pt-BR" | "en" | "es";

type StandaloneSeedanceGeneratorProps = {
  locale?: AnimatedFlyerLocale;
  remainingCredits?: number | null;
  isAdminUnlimited?: boolean;
};

const PENDING_SEEDANCE_VIDEO_STORAGE_KEY = "dj_visuals_pending_seedance_video_id";

const animatedFlyerCopy = {
  "pt-BR": {
    steps: {
      one: "Etapa 1",
      two: "Etapa 2",
      three: "Etapa 3",
    },
    upload: {
      title: "Envie o flyer que será animado",
      description:
        "Use uma arte final pronta. A animação trabalha em cima do seu layout atual, sem reescrever textos ou trocar a identidade do design.",
      acceptedFormats: "PNG, JPG ou WEBP",
      selectedTitle: "Flyer selecionado",
      emptyTitle: "Clique para enviar seu flyer",
      emptyDescription:
        "Arquivos de imagem até 18 MB. Para melhor resultado, use uma arte com boa resolução.",
      changeFile: "Trocar arquivo",
      selectFile: "Selecionar",
      sentPreview: "Preview enviado",
      readyToAnimate: "Pronto para animar",
      previewAlt: "Preview do flyer enviado",
    },
    quality: {
      title: "Escolha a qualidade do vídeo",
      description:
        "A qualidade define o custo em créditos. O formato do vídeo acompanha automaticamente a proporção do flyer enviado.",
      creditsPerVideo: "créditos por vídeo",
      durationLabel: "10 segundos de vídeo",
    },
    resolutionOptions: [
      {
        value: "480" as const,
        label: "480p",
        description: "Ideal para testar o estilo do motion com menor custo.",
        credits: 5,
        bestFor: "Prévia rápida",
      },
      {
        value: "720" as const,
        label: "720p HD",
        description: "Recomendado para publicar com mais nitidez mantendo o formato original.",
        credits: 12,
        bestFor: "Melhor entrega",
      },
    ],
    motion: {
      title: "Direção de motion opcional",
      description:
        "O padrão profissional já aplica animação em camadas, glow, partículas, parallax e trilha automática. Use este campo apenas para reforçar uma preferência específica.",
      label: "Complemento opcional",
      placeholder:
        "Ex: quero mais energia neon, entrada suave no título e movimento de câmera mais elegante.",
      suggestions: [
        "Mais energia neon e luzes pulsando no ritmo da música.",
        "Entrada sutil dos textos, mantendo tudo legível.",
        "Câmera com movimento suave e parallax leve.",
        "Mais partículas, reflexos e atmosfera de evento premium.",
      ],
    },
    music: {
      title: "A música é criada automaticamente",
      description:
        "Você não precisa enviar áudio. A IA decide uma trilha compatível com a energia visual do flyer.",
    },
    submit: {
      working: "Geração em andamento...",
      generate: "GERAR VÍDEO",
      credits: "créditos",
    },
    upgrade: {
      title: "Créditos insuficientes",
      description:
        "Você precisa de {requiredCredits} créditos para gerar este vídeo, mas tem {remainingCredits}. Faça uma assinatura ou atualize seu plano para continuar criando flyers animados profissionais.",
      zeroDescription:
        "Seus créditos acabaram. Escolha uma assinatura para continuar gerando vídeos animados profissionais para seus eventos.",
      cta: "Ver planos",
      secondary: "Planos pagos liberam mais créditos, qualidade superior e mais liberdade para criar.",
    },
    preview: {
      eyebrow: "Preview",
      title: "Resultado do vídeo",
      emptyTitle: "Envie um flyer para começar",
      emptyDescription:
        "O vídeo animado aparecerá aqui automaticamente quando a geração terminar.",
      uploadedAlt: "Flyer enviado",
      statusPrefix: "Status:",
      queuePosition: "Posição na fila:",
      availableUntil: "Disponível até",
      viewMyVideos: "Ver em Meus vídeos",
      downloadVideo: "Baixar vídeo",
      expirationFallback: "Disponível por 24 horas",
      processingNotice:
        "Tempo estimado: 2 a 4 minutos para renderizar o vídeo. Você pode sair desta tela sem atrapalhar o progresso; quando voltar, o acompanhamento continuará automaticamente.",
    },
    statusLabels: {
      PENDING: "Na fila",
      RENDERING: "Criando vídeo",
      COMPLETED: "Vídeo pronto",
      FAILED: "Falhou",
      DEFAULT: "Aguardando flyer",
    },
    statusDescriptions: {
      PENDING:
        "Seu vídeo entrou na fila de geração. A prévia será atualizada automaticamente.",
      RENDERING:
        "A IA está aplicando motion, profundidade, efeitos visuais e trilha automática.",
      COMPLETED:
        "Seu flyer animado está pronto para baixar e usar nas divulgações.",
      FAILED:
        "Não foi possível finalizar este vídeo. Confira a mensagem de erro e tente novamente.",
      DEFAULT: "Envie um flyer pronto para transformar em vídeo animado.",
    },
    credits: {
      title: "Custo por geração",
      description: "O crédito só é reservado ao iniciar o vídeo.",
      video: "Vídeo",
      credits: "créditos",
    },
    preserves: {
      title: "O que a IA preserva",
      items: [
        "textos, título, data, local e logo do flyer",
        "rosto, pose e identidade visual do artista",
        "cores, composição e hierarquia do design",
        "estrutura original, sem transformar em outra arte",
      ],
    },
    temporaryFiles: {
      title: "Arquivos temporários",
      description:
        "Os vídeos ficam disponíveis por 24 horas para download em “Meus vídeos”. Após esse período, o arquivo é removido automaticamente.",
    },
    errors: {
      statusFetch: "Não foi possível consultar o vídeo.",
      statusGeneric: "Erro ao consultar o vídeo.",
      generationInProgress:
        "Já existe uma geração em andamento. Aguarde o vídeo terminar antes de criar outro.",
      waitBeforeRetry:
        "Aguarde alguns segundos antes de iniciar outra geração. Isso evita limite temporário da API de vídeo.",
      missingFlyer: "Envie o flyer que será animado.",
      rateLimited:
        "A geração foi limitada temporariamente. Aguarde alguns segundos e tente novamente.",
      generationConflict:
        "Já existe uma geração em andamento. Aguarde o vídeo atual terminar antes de iniciar outro.",
      startFailed: "Não foi possível iniciar o vídeo.",
      missingVideoId: "A API não retornou o ID do vídeo.",
      submitGeneric: "Erro ao iniciar o vídeo.",
    },
  },
  en: {
    steps: {
      one: "Step 1",
      two: "Step 2",
      three: "Step 3",
    },
    upload: {
      title: "Upload the flyer to animate",
      description:
        "Use a finished artwork. The animation is built on top of your current layout without rewriting text or changing the design identity.",
      acceptedFormats: "PNG, JPG or WEBP",
      selectedTitle: "Flyer selected",
      emptyTitle: "Click to upload your flyer",
      emptyDescription:
        "Image files up to 18 MB. For best results, use high-resolution artwork.",
      changeFile: "Change file",
      selectFile: "Select",
      sentPreview: "Uploaded preview",
      readyToAnimate: "Ready to animate",
      previewAlt: "Uploaded flyer preview",
    },
    quality: {
      title: "Choose the video quality",
      description:
        "Quality defines the credit cost. The video format automatically follows the aspect ratio of the uploaded flyer.",
      creditsPerVideo: "credits per video",
      durationLabel: "10-second video",
    },
    resolutionOptions: [
      {
        value: "480" as const,
        label: "480p",
        description: "Best for testing the motion style at a lower cost.",
        credits: 5,
        bestFor: "Quick preview",
      },
      {
        value: "720" as const,
        label: "720p HD",
        description: "Recommended for sharper output while keeping the original format.",
        credits: 12,
        bestFor: "Best output",
      },
    ],
    motion: {
      title: "Optional motion direction",
      description:
        "The professional default already applies layered animation, glow, particles, parallax and automatic music. Use this field only to reinforce a specific preference.",
      label: "Optional notes",
      placeholder:
        "Example: more neon energy, a smooth title entrance and a more elegant camera movement.",
      suggestions: [
        "More neon energy and lights pulsing to the rhythm of the music.",
        "Subtle text entrances while keeping everything readable.",
        "Smooth camera movement and light parallax.",
        "More particles, reflections and premium event atmosphere.",
      ],
    },
    music: {
      title: "Music is created automatically",
      description:
        "You do not need to upload audio. AI chooses a soundtrack that matches the visual energy of the flyer.",
    },
    submit: {
      working: "Generation in progress...",
      generate: "GENERATE VIDEO",
      credits: "credits",
    },
    upgrade: {
      title: "Not enough credits",
      description:
        "You need {requiredCredits} credits to generate this video, but you have {remainingCredits}. Subscribe or upgrade your plan to keep creating professional animated flyers.",
      zeroDescription:
        "You are out of credits. Choose a subscription to keep generating professional animated videos for your events.",
      cta: "View plans",
      secondary: "Paid plans unlock more credits, higher quality and more creative freedom.",
    },
    preview: {
      eyebrow: "Preview",
      title: "Video result",
      emptyTitle: "Upload a flyer to start",
      emptyDescription:
        "The animated video will appear here automatically when the generation finishes.",
      uploadedAlt: "Uploaded flyer",
      statusPrefix: "Status:",
      queuePosition: "Queue position:",
      availableUntil: "Available until",
      viewMyVideos: "View in My videos",
      downloadVideo: "Download video",
      expirationFallback: "Available for 24 hours",
      processingNotice:
        "Estimated time: 2 to 4 minutes to render the video. You can leave this screen without interrupting progress; when you come back, tracking will continue automatically.",
    },
    statusLabels: {
      PENDING: "Queued",
      RENDERING: "Creating video",
      COMPLETED: "Video ready",
      FAILED: "Failed",
      DEFAULT: "Waiting for flyer",
    },
    statusDescriptions: {
      PENDING:
        "Your video entered the generation queue. The preview will update automatically.",
      RENDERING:
        "AI is applying motion, depth, visual effects and automatic music.",
      COMPLETED:
        "Your animated flyer is ready to download and use in promotions.",
      FAILED:
        "This video could not be finished. Check the error message and try again.",
      DEFAULT: "Upload a finished flyer to turn it into an animated video.",
    },
    credits: {
      title: "Cost per generation",
      description: "Credits are reserved only when the video starts.",
      video: "Video",
      credits: "credits",
    },
    preserves: {
      title: "What AI preserves",
      items: [
        "flyer text, title, date, venue and logo",
        "artist face, pose and visual identity",
        "colors, composition and design hierarchy",
        "original structure without turning it into a different artwork",
      ],
    },
    temporaryFiles: {
      title: "Temporary files",
      description:
        "Videos are available for download in “My videos” for 24 hours. After that period, the file is removed automatically.",
    },
    errors: {
      statusFetch: "Could not check the video status.",
      statusGeneric: "Error while checking the video.",
      generationInProgress:
        "There is already a generation in progress. Wait for the video to finish before creating another one.",
      waitBeforeRetry:
        "Wait a few seconds before starting another generation. This helps avoid temporary video API limits.",
      missingFlyer: "Upload the flyer that will be animated.",
      rateLimited:
        "Generation was temporarily limited. Wait a few seconds and try again.",
      generationConflict:
        "There is already a generation in progress. Wait for the current video to finish before starting another one.",
      startFailed: "Could not start the video.",
      missingVideoId: "The API did not return the video ID.",
      submitGeneric: "Error while starting the video.",
    },
  },
  es: {
    steps: {
      one: "Paso 1",
      two: "Paso 2",
      three: "Paso 3",
    },
    upload: {
      title: "Sube el flyer que será animado",
      description:
        "Usa un arte final listo. La animación trabaja sobre tu layout actual, sin reescribir textos ni cambiar la identidad del diseño.",
      acceptedFormats: "PNG, JPG o WEBP",
      selectedTitle: "Flyer seleccionado",
      emptyTitle: "Haz clic para subir tu flyer",
      emptyDescription:
        "Archivos de imagen de hasta 18 MB. Para mejores resultados, usa un arte con buena resolución.",
      changeFile: "Cambiar archivo",
      selectFile: "Seleccionar",
      sentPreview: "Preview enviado",
      readyToAnimate: "Listo para animar",
      previewAlt: "Preview del flyer enviado",
    },
    quality: {
      title: "Elige la calidad del video",
      description:
        "La calidad define el costo en créditos. El formato del video sigue automáticamente la proporción del flyer enviado.",
      creditsPerVideo: "créditos por video",
      durationLabel: "video de 10 segundos",
    },
    resolutionOptions: [
      {
        value: "480" as const,
        label: "480p",
        description: "Ideal para probar el estilo de motion con menor costo.",
        credits: 5,
        bestFor: "Preview rápido",
      },
      {
        value: "720" as const,
        label: "720p HD",
        description: "Recomendado para publicar con más nitidez manteniendo el formato original.",
        credits: 12,
        bestFor: "Mejor entrega",
      },
    ],
    motion: {
      title: "Dirección de motion opcional",
      description:
        "El estándar profesional ya aplica animación en capas, glow, partículas, parallax y música automática. Usa este campo solo para reforzar una preferencia específica.",
      label: "Complemento opcional",
      placeholder:
        "Ej: quiero más energía neon, entrada suave del título y movimiento de cámara más elegante.",
      suggestions: [
        "Más energía neon y luces pulsando al ritmo de la música.",
        "Entrada sutil de los textos, manteniendo todo legible.",
        "Cámara con movimiento suave y parallax ligero.",
        "Más partículas, reflejos y atmósfera de evento premium.",
      ],
    },
    music: {
      title: "La música se crea automáticamente",
      description:
        "No necesitas enviar audio. La IA decide una pista compatible con la energía visual del flyer.",
    },
    submit: {
      working: "Generación en curso...",
      generate: "GENERAR VIDEO",
      credits: "créditos",
    },
    upgrade: {
      title: "Créditos insuficientes",
      description:
        "Necesitas {requiredCredits} créditos para generar este video, pero tienes {remainingCredits}. Suscríbete o actualiza tu plan para seguir creando flyers animados profesionales.",
      zeroDescription:
        "Tus créditos se acabaron. Elige una suscripción para seguir generando videos animados profesionales para tus eventos.",
      cta: "Ver planes",
      secondary: "Los planes pagos liberan más créditos, mayor calidad y más libertad para crear.",
    },
    preview: {
      eyebrow: "Preview",
      title: "Resultado del video",
      emptyTitle: "Sube un flyer para comenzar",
      emptyDescription:
        "El video animado aparecerá aquí automáticamente cuando termine la generación.",
      uploadedAlt: "Flyer enviado",
      statusPrefix: "Estado:",
      queuePosition: "Posición en la fila:",
      availableUntil: "Disponible hasta",
      viewMyVideos: "Ver en Mis videos",
      downloadVideo: "Descargar video",
      expirationFallback: "Disponible por 24 horas",
      processingNotice:
        "Tiempo estimado: 2 a 4 minutos para renderizar el video. Puedes salir de esta pantalla sin interrumpir el progreso; cuando vuelvas, el seguimiento continuará automáticamente.",
    },
    statusLabels: {
      PENDING: "En fila",
      RENDERING: "Creando video",
      COMPLETED: "Video listo",
      FAILED: "Falló",
      DEFAULT: "Esperando flyer",
    },
    statusDescriptions: {
      PENDING:
        "Tu video entró en la fila de generación. El preview se actualizará automáticamente.",
      RENDERING:
        "La IA está aplicando motion, profundidad, efectos visuales y música automática.",
      COMPLETED:
        "Tu flyer animado está listo para descargar y usar en tus promociones.",
      FAILED:
        "No fue posible finalizar este video. Revisa el mensaje de error e inténtalo nuevamente.",
      DEFAULT: "Sube un flyer listo para convertirlo en video animado.",
    },
    credits: {
      title: "Costo por generación",
      description: "El crédito solo se reserva al iniciar el video.",
      video: "Video",
      credits: "créditos",
    },
    preserves: {
      title: "Lo que la IA preserva",
      items: [
        "textos, título, fecha, ubicación y logo del flyer",
        "rostro, pose e identidad visual del artista",
        "colores, composición y jerarquía del diseño",
        "estructura original, sin convertirlo en otro arte",
      ],
    },
    temporaryFiles: {
      title: "Archivos temporales",
      description:
        "Los videos quedan disponibles por 24 horas para descargar en “Mis videos”. Después de ese período, el archivo se elimina automáticamente.",
    },
    errors: {
      statusFetch: "No fue posible consultar el video.",
      statusGeneric: "Error al consultar el video.",
      generationInProgress:
        "Ya existe una generación en curso. Espera a que el video termine antes de crear otro.",
      waitBeforeRetry:
        "Espera unos segundos antes de iniciar otra generación. Esto evita límites temporales de la API de video.",
      missingFlyer: "Sube el flyer que será animado.",
      rateLimited:
        "La generación fue limitada temporalmente. Espera unos segundos e inténtalo nuevamente.",
      generationConflict:
        "Ya existe una generación en curso. Espera a que el video actual termine antes de iniciar otro.",
      startFailed: "No fue posible iniciar el video.",
      missingVideoId: "La API no devolvió el ID del video.",
      submitGeneric: "Error al iniciar el video.",
    },
  },
} as const;

type AnimatedFlyerCopy = (typeof animatedFlyerCopy)[AnimatedFlyerLocale];

function getAnimatedFlyerCopy(locale: unknown): AnimatedFlyerCopy {
  const normalizedLocale = normalizeLocale(locale) as AnimatedFlyerLocale;
  return animatedFlyerCopy[normalizedLocale];
}

function formatExpiration(
  value: string | null | undefined,
  locale: AnimatedFlyerLocale,
  fallback: string,
) {
  if (!value) return fallback;

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusLabel(status: SeedanceStatus | undefined, copy: AnimatedFlyerCopy) {
  switch (status) {
    case "PENDING":
      return copy.statusLabels.PENDING;
    case "RENDERING":
      return copy.statusLabels.RENDERING;
    case "COMPLETED":
      return copy.statusLabels.COMPLETED;
    case "FAILED":
      return copy.statusLabels.FAILED;
    default:
      return copy.statusLabels.DEFAULT;
  }
}

function getStatusDescription(
  status: SeedanceStatus | undefined,
  copy: AnimatedFlyerCopy,
) {
  switch (status) {
    case "PENDING":
      return copy.statusDescriptions.PENDING;
    case "RENDERING":
      return copy.statusDescriptions.RENDERING;
    case "COMPLETED":
      return copy.statusDescriptions.COMPLETED;
    case "FAILED":
      return copy.statusDescriptions.FAILED;
    default:
      return copy.statusDescriptions.DEFAULT;
  }
}

async function readSafeJsonResponse(response: Response) {
  const text = await response.text().catch(() => "");

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      error:
        text.slice(0, 700) ||
        `Resposta inválida do servidor (${response.status}).`,
    };
  }
}

function appendInstruction(current: string, instruction: string) {
  const trimmed = current.trim();
  if (!trimmed) return instruction;
  if (trimmed.includes(instruction)) return trimmed;
  return `${trimmed}\n${instruction}`;
}

function formatUpgradeDescription(
  template: string,
  requiredCredits: number,
  remainingCredits: number,
) {
  return template
    .replace("{requiredCredits}", String(requiredCredits))
    .replace("{remainingCredits}", String(remainingCredits));
}

function normalizeSeedanceJob(
  rawVideo: Record<string, any>,
  fallback?: Partial<SeedanceJob>,
): SeedanceJob {
  const videoId = String(
    rawVideo.videoId || rawVideo.id || fallback?.videoId || "",
  );

  return {
    videoId,
    status: (rawVideo.status || fallback?.status || "PENDING") as SeedanceStatus,
    renderProgress: Number(
      rawVideo.renderProgress ??
        rawVideo.progress ??
        fallback?.renderProgress ??
        0,
    ),
    queuePosition:
      rawVideo.queuePosition ?? fallback?.queuePosition ?? null,
    outputVideoUrl:
      rawVideo.outputVideoUrl ?? fallback?.outputVideoUrl ?? null,
    inputImageUrl:
      rawVideo.inputImageUrl ?? fallback?.inputImageUrl ?? null,
    errorMessage:
      rawVideo.errorMessage ?? fallback?.errorMessage ?? null,
    expiresAt: rawVideo.expiresAt ?? fallback?.expiresAt ?? null,
    resolution: rawVideo.resolution ?? fallback?.resolution ?? null,
    width: rawVideo.width ?? fallback?.width ?? null,
    height: rawVideo.height ?? fallback?.height ?? null,
  };
}

export function StandaloneSeedanceGenerator({
  locale,
  remainingCredits = null,
  isAdminUnlimited = false,
}: StandaloneSeedanceGeneratorProps) {
  const normalizedLocale = normalizeLocale(locale);
  const copy = useMemo(
    () => getAnimatedFlyerCopy(normalizedLocale),
    [normalizedLocale],
  );
  const resolutionOptions = copy.resolutionOptions;
  const motionSuggestions = copy.motion.suggestions;

  const [flyerFile, setFlyerFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [flyerAspectRatio, setFlyerAspectRatio] = useState("3 / 4");
  const [resolution, setResolution] = useState<Resolution>("480");
  const [motionInstructions, setMotionInstructions] = useState("");
  const [motion, setMotion] = useState<SeedanceJob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverCreditError, setServerCreditError] = useState<{
    requiredCredits: number;
    remainingCredits: number;
  } | null>(null);

  const isSubmittingRef = useRef(false);
  const lastSubmitAtRef = useRef(0);

  const selectedResolution = useMemo(
    () =>
      resolutionOptions.find((option) => option.value === resolution) ||
      resolutionOptions[0],
    [resolution, resolutionOptions],
  );

  const normalizedRemainingCredits =
    typeof remainingCredits === "number" ? Math.max(0, remainingCredits) : null;
  const hasInsufficientCredits =
    !isAdminUnlimited &&
    typeof normalizedRemainingCredits === "number" &&
    normalizedRemainingCredits < selectedResolution.credits;
  const upgradePromptCredits = serverCreditError ||
    (hasInsufficientCredits && typeof normalizedRemainingCredits === "number"
      ? {
          requiredCredits: selectedResolution.credits,
          remainingCredits: normalizedRemainingCredits,
        }
      : null);
  const shouldShowUpgradePrompt = Boolean(upgradePromptCredits);
  const upgradeDescription = upgradePromptCredits
    ? upgradePromptCredits.remainingCredits === 0
      ? copy.upgrade.zeroDescription
      : formatUpgradeDescription(
          copy.upgrade.description,
          upgradePromptCredits.requiredCredits,
          upgradePromptCredits.remainingCredits,
        )
    : null;

  const progress = Math.max(
    0,
    Math.min(100, Math.round(motion?.renderProgress || 0)),
  );
  const previewAspectRatio = motion?.width && motion?.height ? `${motion.width} / ${motion.height}` : flyerAspectRatio;
  const displayedImageUrl = previewUrl || motion?.inputImageUrl || null;
  const isWorking = Boolean(
    motion && ["PENDING", "RENDERING"].includes(motion.status),
  );
  const shouldShowProcessingNotice = isWorking;

  const panelClass =
    "av-hud av-scan relative overflow-hidden rounded-none bg-[#050713]/90 backdrop-blur-xl";
  const subtlePanelClass =
    "av-hud-v relative overflow-hidden rounded-none bg-[#050713]/78 backdrop-blur-xl";

  useEffect(() => {
    setServerCreditError(null);
  }, [resolution]);

  useEffect(() => {
    let cancelled = false;

    async function loadVideoFromEndpoint(url: string) {
      const response = await fetch(url, { cache: "no-store" });
      const data = await readSafeJsonResponse(response);

      if (!response.ok) {
        throw new Error(data?.error || copy.errors.statusGeneric);
      }

      if (!data?.video) {
        return null;
      }

      return normalizeSeedanceJob(data.video);
    }

    async function restoreActiveVideo() {
      const storedVideoId = window.localStorage.getItem(
        PENDING_SEEDANCE_VIDEO_STORAGE_KEY,
      );

      if (storedVideoId) {
        try {
          const storedVideo = await loadVideoFromEndpoint(
            `/api/seedance/status/${storedVideoId}`,
          );

          if (!cancelled && storedVideo?.videoId) {
            setMotion(storedVideo);
            return;
          }
        } catch {
          window.localStorage.removeItem(PENDING_SEEDANCE_VIDEO_STORAGE_KEY);
        }
      }

      try {
        const activeVideo = await loadVideoFromEndpoint("/api/seedance/current");

        if (!cancelled && activeVideo?.videoId) {
          setMotion(activeVideo);
        }
      } catch {
        // Silent restore: normal page usage should not show an error just because
        // there is no active generation to resume.
      }
    }

    restoreActiveVideo();

    return () => {
      cancelled = true;
    };
  }, [copy.errors.statusGeneric]);

  useEffect(() => {
    if (!motion?.videoId) return;

    if (["PENDING", "RENDERING"].includes(motion.status)) {
      window.localStorage.setItem(
        PENDING_SEEDANCE_VIDEO_STORAGE_KEY,
        motion.videoId,
      );
      return;
    }

    if (motion.status === "COMPLETED" || motion.status === "FAILED") {
      window.localStorage.removeItem(PENDING_SEEDANCE_VIDEO_STORAGE_KEY);
    }
  }, [motion?.videoId, motion?.status]);

  useEffect(() => {
    if (!flyerFile) {
      setPreviewUrl(null);
      setFlyerAspectRatio("3 / 4");
      return;
    }

    const objectUrl = URL.createObjectURL(flyerFile);
    setPreviewUrl(objectUrl);

    const image = new window.Image();
    image.onload = () => {
      if (image.naturalWidth && image.naturalHeight) {
        setFlyerAspectRatio(`${image.naturalWidth} / ${image.naturalHeight}`);
      }
    };
    image.src = objectUrl;

    return () => {
      image.onload = null;
      URL.revokeObjectURL(objectUrl);
    };
  }, [flyerFile]);

  useEffect(() => {
    if (!motion?.videoId) return;
    if (motion.status === "COMPLETED" || motion.status === "FAILED") return;

    const activeVideoId = motion.videoId;
    const fallbackMotion = motion;
    let cancelled = false;

    async function pollStatus() {
      try {
        const response = await fetch(`/api/seedance/status/${activeVideoId}`, {
          cache: "no-store",
        });
        const data = await readSafeJsonResponse(response);

        if (!response.ok) {
          throw new Error(data?.error || copy.errors.statusFetch);
        }

        if (!cancelled && data?.video) {
          setMotion((current) =>
            normalizeSeedanceJob(data.video, {
              ...(current || fallbackMotion),
              videoId: activeVideoId,
            }),
          );
        }
      } catch (pollError) {
        if (!cancelled) {
          setError(
            pollError instanceof Error
              ? pollError.message
              : copy.errors.statusGeneric,
          );
        }
      }
    }

    pollStatus();
    const interval = window.setInterval(pollStatus, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [copy.errors.statusFetch, copy.errors.statusGeneric, motion?.videoId, motion?.status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setServerCreditError(null);

    if (isSubmittingRef.current || isSubmitting) {
      return;
    }

    if (isWorking) {
      setError(copy.errors.generationInProgress);
      return;
    }

    if (hasInsufficientCredits) {
      setError(copy.upgrade.title);
      return;
    }

    const now = Date.now();
    const secondsSinceLastSubmit = (now - lastSubmitAtRef.current) / 1000;
    if (lastSubmitAtRef.current && secondsSinceLastSubmit < 8) {
      setError(copy.errors.waitBeforeRetry);
      return;
    }

    if (!flyerFile) {
      setError(copy.errors.missingFlyer);
      return;
    }

    isSubmittingRef.current = true;
    lastSubmitAtRef.current = Date.now();
    setIsSubmitting(true);
    setMotion(null);

    try {
      const formData = new FormData();
      formData.set("flyer", flyerFile);
      formData.set("resolution", resolution);
      formData.set("motionInstructions", motionInstructions.trim());

      const response = await fetch("/api/seedance/start", {
        method: "POST",
        body: formData,
      });
      const data = await readSafeJsonResponse(response);

      if (!response.ok) {
        if (response.status === 403 && data?.code === "INSUFFICIENT_CREDITS") {
          setServerCreditError({
            requiredCredits: Number(data.requiredCredits || selectedResolution.credits),
            remainingCredits: Math.max(0, Number(data.remainingCredits || 0)),
          });
          return;
        }

        if (response.status === 429) {
          throw new Error(data?.error || copy.errors.rateLimited);
        }

        if (response.status === 409 && data?.videoId) {
          setMotion(
            normalizeSeedanceJob(data, {
              videoId: data.videoId,
              status: data.status || "PENDING",
              renderProgress: Number(data.renderProgress || 0),
              expiresAt: data.expiresAt || null,
              resolution: `${resolution}p`,
            }),
          );
          return;
        }

        if (response.status === 409) {
          throw new Error(data?.error || copy.errors.generationConflict);
        }

        throw new Error(data?.error || copy.errors.startFailed);
      }

      if (!data?.videoId) {
        throw new Error(data?.error || copy.errors.missingVideoId);
      }

      setMotion(
        normalizeSeedanceJob(data, {
          videoId: data.videoId,
          status: data.status || "PENDING",
          renderProgress: Number(data.renderProgress || 0),
          queuePosition: data.queuePosition ?? null,
          expiresAt: data.expiresAt ?? null,
          resolution: `${resolution}p`,
          width: data.width ?? null,
          height: data.height ?? null,
        }),
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : copy.errors.submitGeneric,
      );
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] pb-8">
      <div className="grid gap-4 lg:gap-5 xl:grid-cols-[minmax(0,0.98fr)_minmax(390px,0.64fr)]">
        <form onSubmit={handleSubmit} className="grid gap-5">
          <section className={`${panelClass} p-4 sm:p-6`}>
            <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-cyan-300/10 blur-3xl" />
            <div className="relative z-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="av-mono text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200/55">
                  {copy.steps.one}
                </p>
                <h2 className="av-orb mt-1 text-lg font-black uppercase tracking-[0.03em] text-white sm:text-2xl">
                  {copy.upload.title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
                  {copy.upload.description}
                </p>
              </div>

              <span className="av-mono inline-flex w-fit items-center gap-2 border border-cyan-200/16 bg-cyan-200/[0.045] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-50/65">
                <ImageIcon className="h-3.5 w-3.5" />
                {copy.upload.acceptedFormats}
              </span>
            </div>

            <label className="group mt-5 block cursor-pointer overflow-hidden border border-dashed border-cyan-200/22 bg-black/36 transition hover:border-cyan-200/55 hover:bg-cyan-200/[0.045] hover:shadow-[0_0_50px_rgba(0,245,255,0.12)]">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) =>
                  setFlyerFile(event.target.files?.[0] || null)
                }
              />

              <div className="grid gap-4 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:p-5">
                <span className="inline-flex h-14 w-14 items-center justify-center border border-cyan-200/18 bg-cyan-200/[0.08] text-cyan-100 sm:h-14 sm:w-14">
                  <UploadCloud className="h-6 w-6" />
                </span>

                <span>
                  <strong className="av-orb block text-sm font-bold uppercase tracking-[0.06em] text-white">
                    {flyerFile ? copy.upload.selectedTitle : copy.upload.emptyTitle}
                  </strong>
                  <span className="mt-1 block text-sm leading-6 text-white/50">
                    {flyerFile ? flyerFile.name : copy.upload.emptyDescription}
                  </span>
                </span>

                <span className="av-btn-solid inline-flex w-fit items-center justify-center px-4 py-2 text-[10px] font-black transition group-hover:shadow-[0_0_32px_rgba(0,245,255,0.30)]">
                  {flyerFile ? copy.upload.changeFile : copy.upload.selectFile}
                </span>
              </div>
            </label>

            {previewUrl ? (
              <div className="mt-5 overflow-hidden rounded-none border border-cyan-200/14 bg-black/35 p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
                <div className="mb-3 flex items-center justify-between gap-3 px-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/36">
                    {copy.upload.sentPreview}
                  </p>
                  <span className="rounded-none bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                    {copy.upload.readyToAnimate}
                  </span>
                </div>
                <img
                  src={previewUrl}
                  alt={copy.upload.previewAlt}
                  className="max-h-[420px] w-full object-contain"
                />
              </div>
            ) : null}
            </div>
          </section>

          <section className={`${panelClass} p-4 sm:p-6`}>
            <div className="pointer-events-none absolute -left-16 bottom-0 h-44 w-44 rounded-full bg-violet-400/10 blur-3xl" />
            <div className="relative z-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="av-mono text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200/55">
                  {copy.steps.two}
                </p>
                <h2 className="av-orb mt-1 text-lg font-black uppercase tracking-[0.03em] text-white sm:text-2xl">
                  {copy.quality.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/50">
                  {copy.quality.description}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {resolutionOptions.map((option) => {
                const active = option.value === resolution;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setResolution(option.value)}
                    className={`relative overflow-hidden border p-4 text-left transition sm:p-5 ${
                      active
                        ? "border-cyan-300/60 bg-cyan-300/[0.08] shadow-[0_0_58px_rgba(0,245,255,0.18)]"
                        : "border-white/10 bg-black/30 hover:border-cyan-300/32 hover:bg-cyan-300/[0.035]"
                    }`}
                  >
                    {active ? (
                      <span className="absolute right-4 top-4 inline-flex h-6 w-6 items-center justify-center bg-cyan-300 text-[#03040A]">
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                    ) : null}

                    <span className="av-mono inline-flex border border-cyan-300/20 bg-cyan-300/[0.06] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-50/70">
                      {option.bestFor}
                    </span>
                    <strong className="av-orb mt-4 block text-2xl font-black uppercase tracking-[0.02em] text-white">
                      {option.label}
                    </strong>
                    <span className="av-mono mt-2 inline-flex border border-white/10 bg-black/40 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/55">
                      {copy.quality.durationLabel}
                    </span>
                    <span className="mt-3 block text-sm leading-6 text-white/55">
                      {option.description}
                    </span>
                    <span className="av-mono mt-5 inline-flex border border-fuchsia-300/24 bg-fuchsia-300/[0.07] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-fuchsia-50">
                      {option.credits} {copy.quality.creditsPerVideo}
                    </span>
                  </button>
                );
              })}
            </div>

            </div>
          </section>

          <section className={`${panelClass} p-4 sm:p-6`}>
            <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-fuchsia-400/10 blur-3xl" />
            <div className="relative z-10">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-none border border-violet-200/18 bg-violet-200/10 text-violet-100 shadow-[0_0_30px_rgba(168,85,247,0.12)]">
                <Wand2 className="h-5 w-5" />
              </span>
              <div>
                <p className="av-mono text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200/55">
                  {copy.steps.three}
                </p>
                <h2 className="av-orb mt-1 text-lg font-black uppercase tracking-[0.03em] text-white sm:text-2xl">
                  {copy.motion.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/50">
                  {copy.motion.description}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {motionSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() =>
                    setMotionInstructions((current) =>
                      appendInstruction(current, suggestion),
                    )
                  }
                  className="av-mono border border-cyan-300/14 bg-black/34 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-white/62 transition hover:border-cyan-300/42 hover:bg-cyan-300/[0.055] hover:text-white"
                >
                  + {suggestion}
                </button>
              ))}
            </div>

            <label className="mt-5 grid gap-2">
              <span className="av-mono text-xs font-bold uppercase tracking-[0.16em] text-white/68">
                {copy.motion.label}
              </span>
              <textarea
                value={motionInstructions}
                onChange={(event) => setMotionInstructions(event.target.value)}
                maxLength={900}
                rows={4}
                placeholder={copy.motion.placeholder}
                className="min-h-[136px] resize-y border border-cyan-300/16 bg-black/40 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/50 focus:bg-black/55 focus:shadow-[0_0_44px_rgba(0,245,255,0.12)]"
              />
              <span className="text-right text-xs text-white/35">
                {motionInstructions.length}/900
              </span>
            </label>

            <div className="mt-4 rounded-none border border-emerald-200/16 bg-emerald-200/[0.06] p-4 shadow-[0_0_36px_rgba(16,185,129,0.08)]">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-none border border-emerald-200/18 bg-emerald-200/10 text-emerald-100">
                  <Music2 className="h-4 w-4" />
                </span>
                <div>
                  <p className="av-orb text-xs font-bold uppercase tracking-[0.08em] text-white">
                    {copy.music.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/52">
                    {copy.music.description}
                  </p>
                </div>
              </div>
            </div>
            </div>
          </section>

          {shouldShowUpgradePrompt ? (
            <div className="av-hud-v relative overflow-hidden bg-fuchsia-300/[0.055] p-4 sm:p-5">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-fuchsia-300/15 blur-3xl" />
              <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-11 w-11 flex-none items-center justify-center border border-fuchsia-200/18 bg-fuchsia-200/10 text-fuchsia-100">
                    <Zap className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="av-orb text-sm font-black uppercase tracking-[0.08em] text-white">
                      {copy.upgrade.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/64">
                      {upgradeDescription}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-fuchsia-50/55">
                      {copy.upgrade.secondary}
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/billing"
                  className="av-btn-solid inline-flex min-h-[48px] w-full items-center justify-center gap-2 px-5 text-[10px] font-black sm:w-auto"
                >
                  {copy.upgrade.cta}
                </Link>
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="flex items-start gap-3 border border-red-300/20 bg-red-400/10 p-4 text-sm leading-6 text-red-100 shadow-[0_0_40px_rgba(248,113,113,0.08)]">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
              <span>{error}</span>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || isWorking || !flyerFile || shouldShowUpgradePrompt}
            className="av-btn-solid inline-flex min-h-[62px] w-full items-center justify-center gap-2 px-6 text-[11px] font-black transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-55 sm:text-xs"
          >
            {isSubmitting || isWorking ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <PlayCircle className="h-5 w-5" />
            )}
            {isWorking
              ? copy.submit.working
              : copy.submit.generate}
          </button>
        </form>

        <aside className="grid content-start gap-5 xl:sticky xl:top-6">
          <section className={`${panelClass} p-4 sm:p-5`}>
            <div className="pointer-events-none absolute -right-12 top-16 h-44 w-44 rounded-full bg-cyan-300/10 blur-3xl" />
            <div className="relative z-10">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="av-mono text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200/55">
                  {copy.preview.eyebrow}
                </p>
                <h2 className="av-orb mt-1 text-lg font-black uppercase tracking-[0.03em] text-white">
                  {copy.preview.title}
                </h2>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-none border border-cyan-200/15 bg-cyan-200/10 text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.10)]">
                <Video className="h-5 w-5" />
              </span>
            </div>

            <div className="overflow-hidden rounded-none border border-cyan-200/14 bg-black/52 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.025)]">
              {motion?.status === "COMPLETED" && motion.outputVideoUrl ? (
                <video
                  src={motion.outputVideoUrl}
                  controls
                  playsInline
                  className="w-full bg-black object-contain"
                  style={{ aspectRatio: previewAspectRatio }}
                />
              ) : displayedImageUrl ? (
                <div className="relative bg-black" style={{ aspectRatio: previewAspectRatio }}>
                  <img
                    src={displayedImageUrl}
                    alt={copy.preview.uploadedAlt}
                    className="h-full w-full object-contain opacity-72"
                  />
                  <div className="absolute inset-0 grid place-items-center bg-black/52 p-6 text-center backdrop-blur-[1px]">
                    <div>
                      <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-none border border-cyan-200/16 bg-cyan-200/[0.08] text-white shadow-[0_0_55px_rgba(34,211,238,0.18)]">
                        {isWorking ? (
                          <Loader2 className="h-7 w-7 animate-spin" />
                        ) : (
                          <Video className="h-7 w-7" />
                        )}
                      </div>
                      <p className="text-base font-bold text-white">
                        {getStatusLabel(motion?.status, copy)}
                      </p>
                      <p className="mt-2 max-w-[260px] text-xs leading-5 text-white/58">
                        {getStatusDescription(motion?.status, copy)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid place-items-center p-8 text-center" style={{ aspectRatio: previewAspectRatio }}>
                  <div>
                    <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-none border border-cyan-200/14 bg-cyan-200/[0.06] text-white/78">
                      <UploadCloud className="h-7 w-7" />
                    </div>
                    <p className="text-base font-bold text-white">
                      {copy.preview.emptyTitle}
                    </p>
                    <p className="mt-2 max-w-[260px] text-xs leading-5 text-white/50">
                      {copy.preview.emptyDescription}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {motion ? (
              <div className="mt-4 rounded-none border border-cyan-200/14 bg-black/28 p-4">
                <div className="flex items-center justify-between gap-3 text-xs text-white/55">
                  <span>
                    {copy.preview.statusPrefix}{" "}
                    <strong className="text-white">
                      {getStatusLabel(motion.status, copy)}
                    </strong>
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-none bg-white/10">
                  <div
                    className="h-full rounded-none bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-200 transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {shouldShowProcessingNotice ? (
                  <div className="mt-3 flex items-start gap-2 border border-cyan-200/14 bg-cyan-200/[0.055] p-3 text-xs leading-5 text-cyan-50/72">
                    <Info className="mt-0.5 h-4 w-4 flex-none text-cyan-100" />
                    <p>{copy.preview.processingNotice}</p>
                  </div>
                ) : null}
                {motion.queuePosition && motion.queuePosition > 0 ? (
                  <p className="mt-3 text-xs text-white/45">
                    {copy.preview.queuePosition} {motion.queuePosition}
                  </p>
                ) : null}
                {motion.status === "COMPLETED" ? (
                  <div className="mt-3 space-y-3">
                    <p className="flex items-center gap-2 text-xs text-emerald-100">
                      <CheckCircle2 className="h-4 w-4" />
                      {copy.preview.availableUntil}{" "}
                      {formatExpiration(
                        motion.expiresAt,
                        normalizedLocale,
                        copy.preview.expirationFallback,
                      )}
                    </p>
                    <a
                      href={`/api/seedance/download/${motion.videoId}`}
                      download
                      className="av-btn-solid inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-[10px] font-black transition hover:opacity-95"
                    >
                      <Download className="h-4 w-4" />
                      {copy.preview.downloadVideo}
                    </a>
                    <Link
                      href="/dashboard/meus-videos"
                      className="av-mono inline-flex w-full items-center justify-center border border-cyan-300/16 bg-cyan-300/[0.055] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-cyan-300/[0.09]"
                    >
                      {copy.preview.viewMyVideos}
                    </Link>
                  </div>
                ) : null}
                {motion.status === "FAILED" && motion.errorMessage ? (
                  <p className="mt-3 text-xs leading-5 text-red-100">
                    {motion.errorMessage}
                  </p>
                ) : null}
              </div>
            ) : null}
            </div>
          </section>

          <section className={`${subtlePanelClass} p-4 sm:p-5`}>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-none border border-cyan-200/14 bg-cyan-200/10 text-cyan-100">
                <Zap className="h-4 w-4" />
              </span>
              <div>
                <p className="av-orb text-xs font-bold uppercase tracking-[0.08em] text-white">
                  {copy.credits.title}
                </p>
                <p className="text-xs text-white/45">
                  {copy.credits.description}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              {resolutionOptions.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center justify-between rounded-none border border-white/10 bg-black/28 px-4 py-3 text-sm"
                >
                  <span className="text-white/70">
                    <span className="block">
                      {copy.credits.video} {option.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-white/38">
                      {copy.quality.durationLabel}
                    </span>
                  </span>
                  <strong className="text-white">
                    {option.credits} {copy.credits.credits}
                  </strong>
                </div>
              ))}
            </div>
          </section>

          <section className={`${subtlePanelClass} border-violet-200/15 bg-violet-200/[0.045] p-4 sm:p-5`}>
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-none border border-violet-200/14 bg-violet-200/10 text-violet-100">
                <Layers3 className="h-4 w-4" />
              </span>
              <div>
                <p className="av-orb text-xs font-bold uppercase tracking-[0.08em] text-white">
                  {copy.preserves.title}
                </p>
                <ul className="mt-3 space-y-2 text-xs leading-5 text-white/54">
                  {copy.preserves.items.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className={`${subtlePanelClass} bg-black/22 p-4 sm:p-5`}>
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-none border border-white/10 bg-white/[0.06] text-white/80">
                <Info className="h-4 w-4" />
              </span>
              <div>
                <p className="av-orb text-xs font-bold uppercase tracking-[0.08em] text-white">
                  {copy.temporaryFiles.title}
                </p>
                <p className="mt-2 text-xs leading-5 text-white/48">
                  {copy.temporaryFiles.description}
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
