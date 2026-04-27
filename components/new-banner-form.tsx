"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { SubscriptionPlan } from "@/generated/prisma/enums";
import {
  getAllowedBannerQualities,
  getDefaultBannerQuality,
  type BannerImageQuality,
} from "@/lib/plans";

const stylePresets = [
  { value: "NEON_CLUB", label: "Neon Club" },
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


type NewBannerLocale = "pt-BR" | "en" | "es";

function normalizeNewBannerLocale(locale?: string | null): NewBannerLocale {
  if (locale === "pt-BR" || locale === "en" || locale === "es") return locale;
  return "en";
}

const newBannerCopy = {
  "pt-BR": {
    generateSteps: ["Preparando os dados do banner", "Enviando composição para a IA", "Gerando o preview visual", "Finalizando o resultado"],
    editSteps: ["Analisando a arte atual", "Aplicando suas instruções na composição", "Renderizando a nova versão", "Finalizando os ajustes da arte"],
    qualityLabels: { low: "Rápido", medium: "Equilibrado", high: "Alta qualidade" },
    unavailableInPlan: "indisponível no seu plano",
    loading: {
      generate: { title: "A IA está montando sua composição", badge: "Processando", chip: "Render IA", helper: "A IA está preparando seu banner com base no briefing informado." },
      edit: { title: "A IA está aplicando sua alteração", badge: "Alterando", chip: "Edit IA", helper: "A imagem atual está sendo usada como base para criar uma nova versão." },
    },
    messages: {
      cannotReadImage: "Não foi possível ler a imagem enviada.", cannotTrack: "Não foi possível acompanhar a geração.", completedWithoutImage: "O banner foi concluído, mas a imagem final não foi encontrada.",
      editSuccess: "Alteração aplicada com sucesso.", bannerSuccess: "Banner gerado e salvo com sucesso.", editFailed: "Não foi possível concluir a alteração da arte.", generateFailed: "Não foi possível concluir a geração do banner.",
      editProcessing: "Sua alteração ainda está sendo processada pela IA...", generateProcessing: "Seu banner ainda está sendo processado pela IA...", resumeEdit: "Retomando acompanhamento da alteração em andamento...", resumeGenerate: "Retomando acompanhamento do banner em andamento...",
      noCredits: "Você usou todos os seus créditos deste mês.", preparing: "Preparando os dados do banner...", sending: "Enviando composição para a IA...", drawing: "A IA está desenhando o preview do banner...", finishing: "Ajustando o resultado final. Aguarde mais alguns instantes...",
      cannotGenerate: "Não foi possível gerar o banner.", testPreviewSuccess: "Preview gerado com sucesso no modo de teste.", generateError: "Erro ao gerar banner.", editPromptTooShort: "Descreva a alteração desejada com um pouco mais de detalhe.", analyzing: "Analisando a arte atual para aplicar a alteração...", applying: "Aplicando suas instruções na composição...", rendering: "Renderizando a nova versão da arte...", editFinishing: "Finalizando os ajustes da alteração. Aguarde mais alguns instantes...", cannotEdit: "Não foi possível editar a arte.", editError: "Erro ao editar a arte.", generationStarted: "Geração iniciada. Você pode sair da página e voltar para acompanhar.", editStarted: "Alteração iniciada. Você pode sair da página e voltar para acompanhar.",
    },
    form: { eyebrow: "Briefing criativo", title: "Preencha os dados do banner", description: "Uma estrutura clara para gerar flyers premium sem confusão entre texto principal, nome do DJ e informações do evento.", completionLabel: "Briefing", mainContent: "Conteúdo principal", mainText: "Texto principal do banner", mainTextPlaceholder: "Ex.: Pull Party Fest", djName: "Nome do DJ", djNamePlaceholder: "Ex.: DJ Vitor", secondaryText: "Chamada secundária (opcional)", secondaryTextPlaceholder: "Ex.: Edição especial", eventInfo: "Informações do evento", eventDate: "Data do evento", eventDatePlaceholder: "Ex.: 19/09/2026", eventLocation: "Local do evento", eventLocationPlaceholder: "Ex.: São Paulo Hall - São Paulo", visualDirection: "Direção visual", visualStyle: "Estilo visual", format: "Formato", quality: "Qualidade de geração", djPhoto: "Foto do DJ (opcional)", djPhotoHelper: "Envie uma imagem para a IA usar como referência visual.", noFile: "Nenhum arquivo selecionado", chooseFile: "Escolher arquivo", changeFile: "Trocar arquivo", professionalStructure: "Estrutura profissional", structureDescription: "O texto principal será o maior destaque da arte. O nome do DJ ficará em segundo nível e o bloco complementar será mais discreto e elegante.", remainingCredits: "Créditos restantes", creditsExhausted: "Créditos esgotados", generating: "Gerando preview...", editing: "Aplicando alteração...", submit: "Gerar banner premium" },
    preview: { eyebrow: "Preview", readyTitle: "Preview pronto para revisão", emptyTitle: "Seu banner aparecerá aqui", selectedFormat: "Formato selecionado", completed: "Concluído", waiting: "Aguardando", applyingChanges: "Aplicando alterações", composingLayers: "Compondo camadas", generatingNewVersion: "Gerando nova versão", processingVisual: "Processando visual", imageAlt: "Banner gerado", testPreviewTitle: "Preview gerado no modo de teste", successTitle: "Seu banner foi criado com sucesso", testPreviewDescription: "Neste modo o sistema prioriza velocidade e mostra o preview imediatamente.", successDescription: "A imagem já pode ser baixada ou aberta em uma nova guia.", download: "Baixar imagem", open: "Abrir imagem", editTitle: "Solicitar alteração da arte", editDescription: "Descreva a mudança desejada. Cada alteração consome 1 crédito.", oneCredit: "1 crédito", editPlaceholder: "Ex.: deixe o fundo mais escuro, aumente o destaque do título principal e use um clima mais neon.", editHelper: "A IA usará a imagem atual como base e criará uma nova versão da arte.", editButton: "Solicitar alteração", editingButton: "Alterando arte...", smartPreview: "Preview inteligente", emptyDescription: "Seu banner será gerado aqui.", waitingGeneration: "Aguardando geração" },
    upgrade: { close: "Fechar popup", eyebrow: "Créditos esgotados", title: "Você chegou ao limite de banners deste mês", description: "Faça upgrade do seu plano para liberar mais créditos mensais e continuar criando banners profissionais com IA sem interromper seu fluxo de trabalho.", proBenefit: "O plano Pro aumenta seus créditos, enquanto o Professional libera créditos extras e qualidade superior.", continueBenefit: "Continue gerando banners para eventos, stories e posts de divulgação.", plans: "Ver planos", notNow: "Agora não" },
  },
  en: {
    generateSteps: ["Preparing banner data", "Sending composition to AI", "Generating visual preview", "Finalizing result"],
    editSteps: ["Analyzing current artwork", "Applying your instructions", "Rendering the new version", "Finalizing artwork adjustments"],
    qualityLabels: { low: "Fast", medium: "Balanced", high: "High quality" },
    unavailableInPlan: "unavailable on your plan",
    loading: { generate: { title: "AI is building your composition", badge: "Processing", chip: "AI render", helper: "AI is preparing your banner based on the briefing you provided." }, edit: { title: "AI is applying your change", badge: "Editing", chip: "AI edit", helper: "The current image is being used as the base for a new version." } },
    messages: { cannotReadImage: "Could not read the uploaded image.", cannotTrack: "Could not track the generation.", completedWithoutImage: "The banner was completed, but the final image was not found.", editSuccess: "Change applied successfully.", bannerSuccess: "Banner generated and saved successfully.", editFailed: "Could not complete the artwork edit.", generateFailed: "Could not complete the banner generation.", editProcessing: "Your edit is still being processed by AI...", generateProcessing: "Your banner is still being processed by AI...", resumeEdit: "Resuming the edit in progress...", resumeGenerate: "Resuming the banner generation in progress...", noCredits: "You have used all your credits for this month.", preparing: "Preparing banner data...", sending: "Sending composition to AI...", drawing: "AI is drawing the banner preview...", finishing: "Adjusting the final result. Please wait a little longer...", cannotGenerate: "Could not generate the banner.", testPreviewSuccess: "Preview generated successfully in test mode.", generateError: "Error generating banner.", editPromptTooShort: "Describe the requested change with a bit more detail.", analyzing: "Analyzing the current artwork to apply the change...", applying: "Applying your instructions to the composition...", rendering: "Rendering the new artwork version...", editFinishing: "Finalizing the edit adjustments. Please wait a little longer...", cannotEdit: "Could not edit the artwork.", editError: "Error editing artwork.", generationStarted: "Generation started. You can leave this page and come back to track progress.", editStarted: "Edit started. You can leave this page and come back to track progress." },
    form: { eyebrow: "Creative briefing", title: "Fill in the banner details", description: "A clear structure to generate premium flyers without mixing up the main text, DJ name and event information.", completionLabel: "Briefing", mainContent: "Main content", mainText: "Main banner text", mainTextPlaceholder: "E.g. Pull Party Fest", djName: "DJ name", djNamePlaceholder: "E.g. DJ Vitor", secondaryText: "Secondary headline (optional)", secondaryTextPlaceholder: "E.g. Special edition", eventInfo: "Event information", eventDate: "Event date", eventDatePlaceholder: "E.g. 09/19/2026", eventLocation: "Event location", eventLocationPlaceholder: "E.g. São Paulo Hall - São Paulo", visualDirection: "Visual direction", visualStyle: "Visual style", format: "Format", quality: "Generation quality", djPhoto: "DJ photo (optional)", djPhotoHelper: "Upload an image for AI to use as a visual reference.", noFile: "No file selected", chooseFile: "Choose file", changeFile: "Change file", professionalStructure: "Professional structure", structureDescription: "The main text will be the strongest highlight. The DJ name will be secondary, and the complementary block will be more discreet and elegant.", remainingCredits: "Remaining credits", creditsExhausted: "Credits exhausted", generating: "Generating preview...", editing: "Applying change...", submit: "Generate premium banner" },
    preview: { eyebrow: "Preview", readyTitle: "Preview ready for review", emptyTitle: "Your banner will appear here", selectedFormat: "Selected format", completed: "Completed", waiting: "Waiting", applyingChanges: "Applying changes", composingLayers: "Composing layers", generatingNewVersion: "Generating new version", processingVisual: "Processing visual", imageAlt: "Generated banner", testPreviewTitle: "Preview generated in test mode", successTitle: "Your banner was created successfully", testPreviewDescription: "In this mode, the system prioritizes speed and shows the preview immediately.", successDescription: "The image can now be downloaded or opened in a new tab.", download: "Download image", open: "Open image", editTitle: "Request artwork change", editDescription: "Describe the desired change. Each edit consumes 1 credit.", oneCredit: "1 credit", editPlaceholder: "E.g. make the background darker, highlight the main title more and use a stronger neon mood.", editHelper: "AI will use the current image as the base and create a new version of the artwork.", editButton: "Request change", editingButton: "Editing artwork...", smartPreview: "Smart preview", emptyDescription: "Your banner will be generated here.", waitingGeneration: "Waiting for generation" },
    upgrade: { close: "Close popup", eyebrow: "Credits exhausted", title: "You reached this month's banner limit", description: "Upgrade your plan to unlock more monthly credits and keep creating professional AI banners without interrupting your workflow.", proBenefit: "The Pro plan increases your credits, while Professional unlocks extra credits and higher quality.", continueBenefit: "Keep generating banners for events, stories and promotional posts.", plans: "View plans", notNow: "Not now" },
  },
  es: {
    generateSteps: ["Preparando los datos del banner", "Enviando la composición a la IA", "Generando la vista previa visual", "Finalizando el resultado"], editSteps: ["Analizando el arte actual", "Aplicando tus instrucciones", "Renderizando la nueva versión", "Finalizando los ajustes del arte"], qualityLabels: { low: "Rápido", medium: "Equilibrado", high: "Alta calidad" }, unavailableInPlan: "no disponible en tu plan",
    loading: { generate: { title: "La IA está creando tu composición", badge: "Procesando", chip: "Render IA", helper: "La IA está preparando tu banner según el briefing informado." }, edit: { title: "La IA está aplicando tu cambio", badge: "Editando", chip: "Edit IA", helper: "La imagen actual se está usando como base para crear una nueva versión." } },
    messages: { cannotReadImage: "No fue posible leer la imagen enviada.", cannotTrack: "No fue posible seguir la generación.", completedWithoutImage: "El banner fue concluido, pero no se encontró la imagen final.", editSuccess: "Cambio aplicado con éxito.", bannerSuccess: "Banner generado y guardado con éxito.", editFailed: "No fue posible concluir la edición del arte.", generateFailed: "No fue posible concluir la generación del banner.", editProcessing: "Tu edición todavía está siendo procesada por la IA...", generateProcessing: "Tu banner todavía está siendo procesado por la IA...", resumeEdit: "Retomando el seguimiento de la edición en curso...", resumeGenerate: "Retomando el seguimiento del banner en curso...", noCredits: "Has usado todos tus créditos de este mes.", preparing: "Preparando los datos del banner...", sending: "Enviando la composición a la IA...", drawing: "La IA está dibujando la vista previa del banner...", finishing: "Ajustando el resultado final. Espera unos instantes más...", cannotGenerate: "No fue posible generar el banner.", testPreviewSuccess: "Vista previa generada con éxito en modo de prueba.", generateError: "Error al generar el banner.", editPromptTooShort: "Describe el cambio deseado con un poco más de detalle.", analyzing: "Analizando el arte actual para aplicar el cambio...", applying: "Aplicando tus instrucciones en la composición...", rendering: "Renderizando la nueva versión del arte...", editFinishing: "Finalizando los ajustes de la edición. Espera unos instantes más...", cannotEdit: "No fue posible editar el arte.", editError: "Error al editar el arte.", generationStarted: "Generación iniciada. Puedes salir de la página y volver para seguir el progreso.", editStarted: "Edición iniciada. Puedes salir de la página y volver para seguir el progreso." },
    form: { eyebrow: "Briefing creativo", title: "Completa los datos del banner", description: "Una estructura clara para generar flyers premium sin confundir el texto principal, el nombre del DJ y la información del evento.", completionLabel: "Briefing", mainContent: "Contenido principal", mainText: "Texto principal del banner", mainTextPlaceholder: "Ej.: Pull Party Fest", djName: "Nombre del DJ", djNamePlaceholder: "Ej.: DJ Vitor", secondaryText: "Llamada secundaria (opcional)", secondaryTextPlaceholder: "Ej.: Edición especial", eventInfo: "Información del evento", eventDate: "Fecha del evento", eventDatePlaceholder: "Ej.: 19/09/2026", eventLocation: "Lugar del evento", eventLocationPlaceholder: "Ej.: São Paulo Hall - São Paulo", visualDirection: "Dirección visual", visualStyle: "Estilo visual", format: "Formato", quality: "Calidad de generación", djPhoto: "Foto del DJ (opcional)", djPhotoHelper: "Envía una imagen para que la IA la use como referencia visual.", noFile: "Ningún archivo seleccionado", chooseFile: "Elegir archivo", changeFile: "Cambiar archivo", professionalStructure: "Estructura profesional", structureDescription: "El texto principal será el mayor destaque del arte. El nombre del DJ quedará en segundo nivel y el bloque complementario será más discreto y elegante.", remainingCredits: "Créditos restantes", creditsExhausted: "Créditos agotados", generating: "Generando vista previa...", editing: "Aplicando cambio...", submit: "Generar banner premium" },
    preview: { eyebrow: "Vista previa", readyTitle: "Vista previa lista para revisión", emptyTitle: "Tu banner aparecerá aquí", selectedFormat: "Formato seleccionado", completed: "Concluido", waiting: "Esperando", applyingChanges: "Aplicando cambios", composingLayers: "Componiendo capas", generatingNewVersion: "Generando nueva versión", processingVisual: "Procesando visual", imageAlt: "Banner generado", testPreviewTitle: "Vista previa generada en modo de prueba", successTitle: "Tu banner fue creado con éxito", testPreviewDescription: "En este modo, el sistema prioriza la velocidad y muestra la vista previa inmediatamente.", successDescription: "La imagen ya puede descargarse o abrirse en una nueva pestaña.", download: "Descargar imagen", open: "Abrir imagen", editTitle: "Solicitar cambio del arte", editDescription: "Describe el cambio deseado. Cada edición consume 1 crédito.", oneCredit: "1 crédito", editPlaceholder: "Ej.: deja el fondo más oscuro, destaca más el título principal y usa un clima más neón.", editHelper: "La IA usará la imagen actual como base y creará una nueva versión del arte.", editButton: "Solicitar cambio", editingButton: "Editando arte...", smartPreview: "Vista previa inteligente", emptyDescription: "Tu banner será generado aquí.", waitingGeneration: "Esperando generación" },
    upgrade: { close: "Cerrar popup", eyebrow: "Créditos agotados", title: "Llegaste al límite de banners de este mes", description: "Haz upgrade de tu plan para liberar más créditos mensuales y seguir creando banners profesionales con IA sin interrumpir tu flujo de trabajo.", proBenefit: "El plan Pro aumenta tus créditos, mientras que Professional libera créditos extra y calidad superior.", continueBenefit: "Sigue generando banners para eventos, stories y publicaciones de divulgación.", plans: "Ver planes", notNow: "Ahora no" },
  },
} as const;

type NewBannerFormCopy = (typeof newBannerCopy)[NewBannerLocale];

type GenerationResult = {
  imageUrl: string;
  bannerId?: string | null;
  bannerUrl?: string | null;
  saved?: boolean;
};

type BannerFormState = {
  mainText: string;
  djName: string;
  secondaryText: string;
  eventDate: string;
  eventLocation: string;
  stylePreset: string;
  format: string;
  quality: BannerImageQuality;
};

type ActiveBannerJob = {
  bannerId: string;
  mode: "generate" | "edit";
  bannerUrl?: string | null;
  startedAt: number;
  form: BannerFormState;
};

const ACTIVE_BANNER_JOB_KEY = "dj-banner-active-job";

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

function buildLoadingTexts(mode: "generate" | "edit" | null, copy: NewBannerFormCopy) {
  return mode === "edit" ? copy.loading.edit : copy.loading.generate;
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
  locale?: string | null;
}) {
  const router = useRouter();
  const copy = newBannerCopy[normalizeNewBannerLocale(locale)];
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
  const [showCreditUpgrade, setShowCreditUpgrade] = useState(false);
  const [jobProgress, setJobProgress] = useState<number | null>(null);
  const pollingTimerRef = useRef<number | null>(null);
  const referenceFileInputRef = useRef<HTMLInputElement | null>(null);
  const allowedQualities = useMemo(
    () => getAllowedBannerQualities(currentPlan, isAdmin),
    [currentPlan, isAdmin],
  );

  const [form, setForm] = useState<BannerFormState>({
    mainText: "",
    djName: "",
    secondaryText: "",
    eventDate: "",
    eventLocation: "",
    stylePreset: "LUXURY_GOLD",
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
    () => jobProgress ?? getLoadingProgress(activeStep),
    [activeStep, jobProgress],
  );

  const displayLoading = loading || editLoading;
  const currentSteps = loadingMode === "edit" ? copy.editSteps : copy.generateSteps;
  const loadingTexts = buildLoadingTexts(loadingMode, copy);
  const hasNoCredits =
    !isAdmin &&
    (!canGenerateBanner ||
      (typeof remainingCredits === "number" && remainingCredits <= 0));

  function clearPollingTimer() {
    if (pollingTimerRef.current !== null) {
      window.clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
  }

  function clearActiveBannerJob() {
    clearPollingTimer();
    window.localStorage.removeItem(ACTIVE_BANNER_JOB_KEY);
  }

  function saveActiveBannerJob(job: ActiveBannerJob) {
    window.localStorage.setItem(ACTIVE_BANNER_JOB_KEY, JSON.stringify(job));
  }

  function startBannerJob(params: {
    bannerId: string;
    mode: "generate" | "edit";
    bannerUrl?: string | null;
  }) {
    const job: ActiveBannerJob = {
      bannerId: params.bannerId,
      mode: params.mode,
      bannerUrl: params.bannerUrl || null,
      startedAt: Date.now(),
      form,
    };

    saveActiveBannerJob(job);
    setResult(null);
    setJobProgress(18);
    setActiveStep(1);
    setLoadingMode(params.mode);
    setStatusText(
      params.mode === "edit"
        ? copy.messages.editStarted
        : copy.messages.generationStarted,
    );

    if (params.mode === "edit") {
      setEditLoading(true);
      setLoading(false);
    } else {
      setLoading(true);
      setEditLoading(false);
    }

    pollBannerJob(params.bannerId, params.mode, params.bannerUrl || null);
  }

  async function checkBannerJobStatus(
    bannerId: string,
    mode: "generate" | "edit",
    bannerUrl?: string | null,
  ) {
    const response = await fetch(`/api/banners/status/${bannerId}`, {
      cache: "no-store",
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || copy.messages.cannotTrack);
    }

    if (typeof data.remainingCredits === "number") {
      setRemainingCredits(data.remainingCredits);
    }

    if (data.status === "COMPLETED") {
      if (!data.imageUrl) {
        throw new Error(copy.messages.completedWithoutImage);
      }

      clearActiveBannerJob();
      setJobProgress(100);
      setActiveStep(3);
      setLoading(false);
      setEditLoading(false);
      setLoadingMode(null);
      setStatusText(
        mode === "edit"
          ? copy.messages.editSuccess
          : copy.messages.bannerSuccess,
      );
      setError("");
      setEditError("");
      setResult({
        imageUrl: data.imageUrl,
        bannerId: data.bannerId || bannerId,
        bannerUrl: data.bannerUrl || bannerUrl || null,
        saved: true,
      });

      if (mode === "edit") {
        setEditSuccess(copy.messages.editSuccess);
        setEditPrompt("");
      }

      router.refresh();
      return;
    }

    if (data.status === "FAILED") {
      clearActiveBannerJob();
      setJobProgress(null);
      setActiveStep(0);
      setLoading(false);
      setEditLoading(false);
      setLoadingMode(null);
      setStatusText("");

      const failedMessage =
        data.message ||
        (mode === "edit"
          ? copy.messages.editFailed
          : copy.messages.generateFailed);

      if (mode === "edit") {
        setEditError(failedMessage);
      } else {
        setError(failedMessage);
      }

      router.refresh();
      return;
    }

    const nextProgress =
      typeof data.progress === "number" ? Math.min(data.progress, 94) : null;
    const nextStep =
      typeof data.activeStep === "number" ? data.activeStep : activeStep;

    setJobProgress(nextProgress);
    setActiveStep(nextStep);
    setLoadingMode(mode);
    setStatusText(
      mode === "edit"
        ? copy.messages.editProcessing
        : copy.messages.generateProcessing,
    );

    if (mode === "edit") {
      setEditLoading(true);
    } else {
      setLoading(true);
    }
  }

  function pollBannerJob(
    bannerId: string,
    mode: "generate" | "edit",
    bannerUrl?: string | null,
  ) {
    clearPollingTimer();

    void checkBannerJobStatus(bannerId, mode, bannerUrl).catch((err) => {
      const message =
        err instanceof Error ? err.message : copy.messages.cannotTrack;
      if (mode === "edit") {
        setEditError(message);
      } else {
        setError(message);
      }
    });

    pollingTimerRef.current = window.setInterval(() => {
      void checkBannerJobStatus(bannerId, mode, bannerUrl).catch((err) => {
        const message =
          err instanceof Error
            ? err.message
            : copy.messages.cannotTrack;
        if (mode === "edit") {
          setEditError(message);
        } else {
          setError(message);
        }
      });
    }, 2500);
  }

  useEffect(() => {
    const storedJob = window.localStorage.getItem(ACTIVE_BANNER_JOB_KEY);

    if (!storedJob) {
      return () => clearPollingTimer();
    }

    try {
      const job = JSON.parse(storedJob) as ActiveBannerJob;

      if (!job?.bannerId || !job?.mode) {
        window.localStorage.removeItem(ACTIVE_BANNER_JOB_KEY);
        return () => clearPollingTimer();
      }

      if (job.form) {
        setForm(job.form);
      }

      setResult(null);
      setError("");
      setEditError("");
      setEditSuccess("");
      setShowCreditUpgrade(false);
      setJobProgress(24);
      setActiveStep(1);
      setLoadingMode(job.mode);
      setStatusText(
        job.mode === "edit"
          ? copy.messages.resumeEdit
          : copy.messages.resumeGenerate,
      );

      if (job.mode === "edit") {
        setEditLoading(true);
      } else {
        setLoading(true);
      }

      pollBannerJob(job.bannerId, job.mode, job.bannerUrl || null);
    } catch {
      window.localStorage.removeItem(ACTIVE_BANNER_JOB_KEY);
    }

    return () => clearPollingTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (hasNoCredits) {
      setError(copy.messages.noCredits);
      setShowCreditUpgrade(true);
      setStatusText("");
      setActiveStep(0);
      return;
    }

    setLoading(true);
    setLoadingMode("generate");
    setActiveStep(0);
    setStatusText(copy.messages.preparing);
    setError("");
    setResult(null);
    setShowCreditUpgrade(false);
    setEditPrompt("");
    setEditError("");
    setEditSuccess("");

    let progressTimerA: number | undefined;
    let progressTimerB: number | undefined;
    let progressTimerC: number | undefined;
    let keepLoadingForPolling = false;

    try {
      const referenceImageDataUrl = referenceFile
        ? await readFileAsDataUrl(referenceFile)
        : null;

      progressTimerA = window.setTimeout(() => {
        setActiveStep(1);
        setStatusText(copy.messages.sending);
      }, 900);

      progressTimerB = window.setTimeout(() => {
        setActiveStep(2);
        setStatusText(copy.messages.drawing);
      }, 4200);

      progressTimerC = window.setTimeout(() => {
        setActiveStep(3);
        setStatusText(
          copy.messages.finishing,
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
        throw new Error(data.error || copy.messages.cannotGenerate);
      }

      if (data.status === "PENDING" && data.bannerId) {
        const nextRemainingCredits =
          typeof data.remainingCredits === "number" ? data.remainingCredits : null;

        setRemainingCredits(nextRemainingCredits);
        setShowCreditUpgrade(false);

        keepLoadingForPolling = true;
        startBannerJob({
          bannerId: data.bannerId,
          mode: "generate",
          bannerUrl: data.bannerUrl || null,
        });
        router.refresh();
        return;
      }

      setActiveStep(3);
      setStatusText(
        data.saved === false
          ? copy.messages.testPreviewSuccess
          : copy.messages.bannerSuccess,
      );

      const nextRemainingCredits =
        typeof data.remainingCredits === "number" ? data.remainingCredits : null;

      setRemainingCredits(nextRemainingCredits);
      setShowCreditUpgrade(false);

      setResult({
        imageUrl: data.previewImageUrl || data.imageUrl,
        bannerId: data.bannerId,
        bannerUrl: data.bannerUrl || null,
        saved: data.saved !== false,
      });

      router.refresh();
    } catch (err) {
      if (progressTimerA) window.clearTimeout(progressTimerA);
      if (progressTimerB) window.clearTimeout(progressTimerB);
      if (progressTimerC) window.clearTimeout(progressTimerC);
      const message = err instanceof Error ? err.message : copy.messages.generateError;
      setError(message);
      if (isCreditExhaustedMessage(message)) {
        setRemainingCredits(0);
        setShowCreditUpgrade(true);
      }
      setStatusText("");
      setActiveStep(0);
    } finally {
      if (!keepLoadingForPolling) {
        setLoading(false);
        setLoadingMode(null);
        setJobProgress(null);
      }
    }
  }

  async function handleEdit() {
    if (!result?.imageUrl) return;

    if (hasNoCredits) {
      setEditError(copy.messages.noCredits);
      setShowCreditUpgrade(true);
      return;
    }

    if (editPrompt.trim().length < 4) {
      setEditError(
        copy.messages.editPromptTooShort,
      );
      return;
    }

    setEditLoading(true);
    setLoadingMode("edit");
    setActiveStep(0);
    setEditError("");
    setEditSuccess("");
    setStatusText(copy.messages.analyzing);

    let progressTimerA: number | undefined;
    let progressTimerB: number | undefined;
    let progressTimerC: number | undefined;
    let keepLoadingForPolling = false;

    try {
      progressTimerA = window.setTimeout(() => {
        setActiveStep(1);
        setStatusText(copy.messages.applying);
      }, 900);

      progressTimerB = window.setTimeout(() => {
        setActiveStep(2);
        setStatusText(copy.messages.rendering);
      }, 4200);

      progressTimerC = window.setTimeout(() => {
        setActiveStep(3);
        setStatusText(
          copy.messages.editFinishing,
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
        throw new Error(data.error || copy.messages.cannotEdit);
      }

      if (data.status === "PENDING" && data.bannerId) {
        const nextRemainingAfterEdit =
          typeof data.remainingCredits === "number" ? data.remainingCredits : null;

        setRemainingCredits(nextRemainingAfterEdit);
        setShowCreditUpgrade(false);

        keepLoadingForPolling = true;
        startBannerJob({
          bannerId: data.bannerId,
          mode: "edit",
          bannerUrl: data.bannerUrl || null,
        });
        router.refresh();
        return;
      }

      setActiveStep(3);
      setStatusText(copy.messages.editSuccess);

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
      setShowCreditUpgrade(false);
      setEditSuccess(copy.messages.editSuccess);
      setEditPrompt("");

      router.refresh();
    } catch (err) {
      if (progressTimerA) window.clearTimeout(progressTimerA);
      if (progressTimerB) window.clearTimeout(progressTimerB);
      if (progressTimerC) window.clearTimeout(progressTimerC);
      const message = err instanceof Error ? err.message : copy.messages.editError;
      setEditError(message);
      if (isCreditExhaustedMessage(message)) {
        setRemainingCredits(0);
        setShowCreditUpgrade(true);
      }
      setStatusText("");
      setActiveStep(0);
    } finally {
      if (!keepLoadingForPolling) {
        setEditLoading(false);
        setLoadingMode(null);
        setJobProgress(null);
      }
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
            <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/50">
              {copy.form.eyebrow}
            </p>
            <h2 className="text-[23px] font-semibold leading-tight text-white ">
              {copy.form.title}
            </h2>
            <p className="mt-3 text-[13px] leading-6 text-gray-200">
              {copy.form.description}
            </p>
          </div>

          <div className="px-1 py-1 text-left text-blue-400 md:min-w-[112px] md:text-right">
            <span className="block text-[10px] uppercase tracking-[0.18em] text-white/40 text-center">
              {copy.form.completionLabel}
            </span>
            <strong className="mt-1 block text-xl font-semibold text-center">
              {completion}%
            </strong>
          </div>
        </div>

        <Section title={copy.form.mainContent}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label={copy.form.mainText}>
              <input
                className={inputClassName}
                placeholder={copy.form.mainTextPlaceholder}
                value={form.mainText}
                onChange={(e) =>
                  setForm((c) => ({ ...c, mainText: e.target.value }))
                }
                required
              />
            </Field>

            <Field label={copy.form.djName}>
              <input
                className={inputClassName}
                placeholder={copy.form.djNamePlaceholder}
                value={form.djName}
                onChange={(e) =>
                  setForm((c) => ({ ...c, djName: e.target.value }))
                }
                required
              />
            </Field>
          </div>

          <Field label={copy.form.secondaryText}>
            <input
              className={inputClassName}
              placeholder={copy.form.secondaryTextPlaceholder}
              value={form.secondaryText}
              onChange={(e) =>
                setForm((c) => ({ ...c, secondaryText: e.target.value }))
              }
            />
          </Field>
        </Section>

        <Section title={copy.form.eventInfo}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label={copy.form.eventDate}>
              <input
                className={inputClassName}
                placeholder={copy.form.eventDatePlaceholder}
                value={form.eventDate}
                onChange={(e) =>
                  setForm((c) => ({ ...c, eventDate: e.target.value }))
                }
                required
              />
            </Field>

            <Field label={copy.form.eventLocation}>
              <input
                className={inputClassName}
                placeholder={copy.form.eventLocationPlaceholder}
                value={form.eventLocation}
                onChange={(e) =>
                  setForm((c) => ({ ...c, eventLocation: e.target.value }))
                }
                required
              />
            </Field>
          </div>
        </Section>

        <Section title={copy.form.visualDirection}>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Field label={copy.form.visualStyle}>
              <select
                className={selectClassName}
                value={form.stylePreset}
                onChange={(e) =>
                  setForm((c) => ({ ...c, stylePreset: e.target.value }))
                }
              >
                {stylePresets.map((preset) => (
                  <option
                    key={preset.value}
                    value={preset.value}
                    className="bg-black text-white"
                  >
                    {preset.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={copy.form.format}>
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

            <Field label={copy.form.quality}>
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
                      {copy.qualityLabels[quality.value]}
                      {enabled ? "" : ` — ${copy.unavailableInPlan}`}
                    </option>
                  );
                })}
              </select>
            </Field>
          </div>

          <Field label={copy.form.djPhoto}>
            <input
              ref={referenceFileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="sr-only"
              onChange={(e) => setReferenceFile(e.target.files?.[0] || null)}
            />

            <div className="grid gap-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => referenceFileInputRef.current?.click()}
                  className="inline-flex min-h-[46px] shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
                >
                  {referenceFile ? copy.form.changeFile : copy.form.chooseFile}
                </button>

                <strong className="block min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-sm text-white/85 sm:max-w-[220px] sm:text-right lg:max-w-[280px]">
                  {referenceFile ? referenceFile.name : copy.form.noFile}
                </strong>
              </div>

              <p className="text-xs leading-5 text-white/60">
                {copy.form.djPhotoHelper}
              </p>
            </div>
          </Field>
        </Section>

        <div className="mt-4 flex flex-col gap-3 rounded-[22px] border border-white/10 bg-gradient-to-br from-blue-500/10 to-cyan-400/5 p-4 md:flex-row md:items-start md:justify-between">
          <div>
            <span className="mb-2 inline-flex rounded-full bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-white/75">
              {copy.form.professionalStructure}
            </span>
            <p className="text-sm leading-6 text-white/80">
              {copy.form.structureDescription}
            </p>
          </div>

          {remainingCredits !== null ? (
            <div className="shrink-0 rounded-xl bg-white/8 px-3 py-2 text-sm text-white">
              {copy.form.remainingCredits}: <strong>{remainingCredits}</strong>
            </div>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={displayLoading}
          className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95 disabled:cursor-wait disabled:opacity-70"
        >
          {loading
            ? copy.form.generating
            : editLoading
              ? copy.form.editing
              : copy.form.submit}
        </button>

        {statusText ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85">
            {statusText}
          </div>
        ) : null}

        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
      </form>

      <aside className="rounded-[28px] p-5 xl:sticky xl:top-5">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/50">
              {copy.preview.eyebrow}
            </p>
            <h3 className="text-lg font-semibold leading-snug text-white">
              {displayLoading
                ? loadingTexts.title
                : result
                  ? copy.preview.readyTitle
                  : copy.preview.emptyTitle}
            </h3>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/45">
              {copy.preview.selectedFormat}: {previewFormatLabel}
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
                ? copy.preview.completed
                : copy.preview.waiting}
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
                      ? copy.preview.applyingChanges
                      : copy.preview.composingLayers}
                  </span>
                  <span>
                    {loadingMode === "edit"
                      ? copy.preview.generatingNewVersion
                      : copy.preview.processingVisual}
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
                alt={copy.preview.imageAlt}
              />
            </div>

            <div className="grid gap-2">
              <p className="text-xl font-semibold text-white">
                {result.saved === false
                  ? copy.preview.testPreviewTitle
                  : copy.preview.successTitle}
              </p>
              <p className="text-sm leading-6 text-white/70">
                {result.saved === false
                  ? copy.preview.testPreviewDescription
                  : copy.preview.successDescription}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={result.imageUrl}
                download
                className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-white/10 bg-white/8 px-4 text-sm font-medium text-white transition hover:bg-white/12"
              >
                {copy.preview.download}
              </a>

              <a
                href={result.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-sky-300/15 bg-sky-300/8 px-4 text-sm font-medium text-white transition hover:bg-sky-300/12"
              >
                {copy.preview.open}
              </a>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {copy.preview.editTitle}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/60">
                    {copy.preview.editDescription}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-amber-300/15 bg-amber-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-amber-100">
                  {copy.preview.oneCredit}
                </span>
              </div>

              <textarea
                className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/50 focus:ring-4 focus:ring-sky-400/10 placeholder:text-white/35"
                placeholder={copy.preview.editPlaceholder}
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
              />

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-white/55">
                  {copy.preview.editHelper}
                </p>

                <button
                  type="button"
                  onClick={handleEdit}
                  disabled={displayLoading}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-sky-300/20 bg-sky-300/10 px-4 text-sm font-medium text-white transition hover:bg-sky-300/15 disabled:cursor-wait disabled:opacity-70"
                >
                  {editLoading ? copy.preview.editingButton : copy.preview.editButton}
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
                    {copy.preview.smartPreview}
                  </p>
                  <p className="max-w-sm text-sm leading-6 text-white/70">
                    {copy.preview.emptyDescription}
                  </p>
                  <div className="mx-auto grid w-full max-w-[220px] gap-2">
                    <span className="h-2 overflow-hidden rounded-full bg-white/10">
                      <span className="block h-full w-1/2 rounded-full bg-gradient-to-r from-sky-300 via-violet-300 to-cyan-200 animate-pulse" />
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                      {copy.preview.waitingGeneration}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {showCreditUpgrade ? (
        <CreditUpgradeModal copy={copy} onClose={() => setShowCreditUpgrade(false)} />
      ) : null}
    </div>
  );
}

function CreditUpgradeModal({
  copy,
  onClose,
}: {
  copy: NewBannerFormCopy;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 px-4 py-6 backdrop-blur-md">
      <div className="relative w-full max-w-[520px] overflow-hidden rounded-[30px] border border-amber-200/20 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.16),transparent_38%),linear-gradient(135deg,rgba(18,24,38,0.98),rgba(7,11,22,0.98))] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg leading-none text-white/70 transition hover:bg-white/10 hover:text-white"
          aria-label={copy.upgrade.close}
        >
          ×
        </button>

        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-amber-200/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-14 left-8 h-32 w-32 rounded-full bg-sky-300/10 blur-3xl" />

        <div className="relative z-10 pr-8">
          <span className="inline-flex rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-100">
            {copy.upgrade.eyebrow}
          </span>

          <h3 className="mt-4 text-2xl font-semibold leading-tight text-white">
            {copy.upgrade.title}
          </h3>

          <p className="mt-3 text-sm leading-6 text-white/70">
            {copy.upgrade.description}
          </p>
        </div>

        <div className="relative z-10 mt-5 grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-start gap-3 text-sm text-white/75">
            <span className="mt-[7px] h-2.5 w-2.5 shrink-0 rounded-full bg-amber-200 shadow-[0_0_16px_rgba(251,191,36,0.7)]" />
            <p>
              {copy.upgrade.proBenefit}
            </p>
          </div>
          <div className="flex items-start gap-3 text-sm text-white/75">
            <span className="mt-[7px] h-2.5 w-2.5 shrink-0 rounded-full bg-sky-300 shadow-[0_0_16px_rgba(125,211,252,0.7)]" />
            <p>{copy.upgrade.continueBenefit}</p>
          </div>
        </div>

        <div className="relative z-10 mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href="/dashboard/billing"
            className="inline-flex min-h-[50px] flex-1 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-200 via-sky-200 to-violet-200 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95"
          >
            {copy.upgrade.plans}
          </a>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[50px] flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-5 text-sm font-medium text-white transition hover:bg-white/[0.08]"
          >
            {copy.upgrade.notNow}
          </button>
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
