"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from "react";
import type { SubscriptionPlan } from "@/generated/prisma/enums";
import {
  getAllowedBannerQualities,
  getDefaultBannerQuality,
  type BannerImageQuality,
} from "@/lib/plans";
import { isBannerStyleProOnly } from "@/lib/banner-style-access";

const stylePresets = [
  {
    value: "NEON_CLUB",
    label: "Neon Club",
    description: "Glow forte, energia de pista e visual vibrante.",
    badge: "Popular",
    image: "/examples/banner-01.webp",
  },
  {
    value: "PREMIUM_BLACK",
    label: "Premium Black",
    description: "Elegante, escuro e com aparência mais refinada.",
    badge: "Novo",
    image: "/examples/card/Premium Black.webp",
  },
  {
    value: "SUMMER_VIBES",
    label: "Summer Vibes",
    description: "Leve, iluminado e ideal para eventos mais abertos.",
    badge: "Novo",
    image: "/examples/card/Summer Vibes.webp",
  },
  {
    value: "MINIMAL_TECHNO",
    label: "Minimal Techno",
    description: "Mais limpo, moderno e com informação bem organizada.",
    badge: "Novo",
    image: "/examples/card/Minimal Techno.webp",
  },
  {
    value: "LUXURY_GOLD",
    label: "Luxury Gold",
    description: "Luxuoso, dourado e com sensação premium.",
    badge: "Novo",
    image: "/examples/banner-05.webp",
  },
  {
    value: "FESTIVAL_MAINSTAGE",
    label: "Festival Mainstage",
    description: "Aparência de grande palco, luzes intensas e impacto premium.",
    badge: "Pro",
    image: "/examples/card/Festival Mainstage.webp",
  },
  {
    value: "CYBER_RAVE",
    label: "Cyber Rave",
    description: "Clima futurista, digital e cheio de personalidade.",
    badge: "Pro",
    image: "/examples/card/Cyber Rave.webp",
  },
  {
    value: "DARK_TECHNO",
    label: "Dark Techno",
    description: "Estética underground, contraste forte e atmosfera noturna.",
    badge: "Pro",
    image: "/examples/card/Dark Techno.webp",
  },
  {
    value: "CHROME_FUTURE",
    label: "Chrome Future",
    description: "Visual metálico, moderno e mais tecnológico.",
    badge: "Pro",
    image: "/examples/card/Chrome Future.webp",
  },
  {
    value: "AFRO_HOUSE_SUNSET",
    label: "Afro House Sunset",
    description: "Tons quentes, vibe sunset e presença sofisticada.",
    badge: "Pro",
    image: "/examples/card/Afro-house.webp",
  },
  {
    value: "Y2K_CLUB",
    label: "Y2K Club",
    description: "Visual jovem, chamativo e com pegada club moderna.",
    badge: "Pro",
    image: "/examples/card/y2k-club.webp",
  },
] as const;

const formats = [
  { value: "POST_FEED", label: "Feed" },
  { value: "STORY", label: "Story" },
] as const;

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

const newBannerFormCopy = {
  "pt-BR": {
    briefingEyebrow: "Briefing criativo",
    briefingTitle: "Preencha os dados do banner",
    briefingDescription:
      "Uma estrutura clara para gerar flyers premium sem confusão entre texto principal, nome do DJ e informações do evento.",
    briefingProgress: "Briefing",
    guidedEyebrow: "Comece mais rápido",
    guidedTitle: "Crie seu primeiro banner grátis em poucos cliques",
    guidedDescription:
      "Use o passo a passo abaixo ou gere um banner de exemplo agora para ver o resultado da plataforma sem travar no preenchimento.",
    guidedSteps: [
      {
        title: "Escolha um estilo",
        description: "Selecione um visual pronto para festa, agenda ou divulgação.",
        helper:
          "Role os cards de estilo abaixo e toque em um card para ativá-lo. Se aparecer cadeado, aquele estilo exige plano Pro.",
      },
      {
        title: "Preencha os dados",
        description: "Informe evento, DJ, data e local. Você também pode usar o exemplo automático.",
        helper:
          "Complete o texto principal, nome do DJ, data e local. Se quiser acelerar, use o botão de preencher exemplo.",
      },
      {
        title: "Envie sua foto e gere",
        description: "Adicione sua foto para a IA usar como referência e gere o preview.",
        helper:
          "Na seção Foto do DJ, envie uma imagem nítida do seu rosto. O teste guiado vai usar a sua própria foto para gerar o banner.",
      },
    ],
    stepStatusDone: "Concluído",
    stepStatusCurrent: "Etapa atual",
    stepStatusPending: "Próxima etapa",
    stepActionGo: "Ir para esta etapa",
    guidedPhotoHint:
      "Para o teste guiado, envie sua própria foto do DJ. Assim a IA cria um preview mais próximo da sua identidade.",
    tourGenerateTitle: "Clique para gerar",
    tourGenerateDescription:
      "Depois de escolher o estilo, preencher os dados e enviar a foto, clique no botão de gerar. O preview aparecerá ao lado.",
    tourSkip: "Pular guia",
    tourBack: "Voltar",
    tourNext: "Próximo",
    tourDone: "Concluir",
    tourStepLabel: "Passo",
    tourIncompleteDefault:
      "Conclua esta etapa antes de continuar.",
    tourIncompleteStyle:
      "Escolha um estilo visual para continuar.",
    tourIncompleteDetails:
      "Preencha texto principal, nome do DJ, data e local para continuar.",
    tourIncompleteMainText:
      "Preencha o texto principal do banner para continuar.",
    tourIncompleteDjName:
      "Preencha o nome do DJ para continuar.",
    tourIncompleteEventDate:
      "Preencha a data do evento para continuar.",
    tourIncompleteEventLocation:
      "Preencha o local do evento para continuar.",
    tourMainTextDescription:
      "Digite o título principal que deve aparecer com maior destaque no banner.",
    tourDjNameDescription:
      "Digite o nome artístico do DJ que será usado na composição.",
    tourEventDateDescription:
      "Informe quando o evento acontece. Pode ser uma data exata ou algo como Este sábado.",
    tourEventLocationDescription:
      "Informe o local, cidade ou nome da casa onde o evento será divulgado.",
    tourIncompletePhoto:
      "Envie sua foto do DJ para continuar.",
    tourIncompleteGenerate:
      "Clique no botão Gerar banner para finalizar o guia.",
    typingSuggestions: {
      mainText: "Ex.: Neon Friday Party",
      djName: "Ex.: DJ Vision",
      secondaryText: "Ex.: Special AI Edition",
      eventDate: "Ex.: Este sábado",
      eventLocation: "Ex.: Downtown Club",
    },
    sampleButton: "Gerar banner de teste grátis",
    fillSampleButton: "Preencher exemplo",
    sampleBadge: "Recomendado para primeiro acesso",
    mainSection: "Conteúdo principal",
    mainTextLabel: "Texto principal do banner",
    mainTextPlaceholder: "Ex.: Pull Party Fest",
    djNameLabel: "Nome do DJ",
    djNamePlaceholder: "Ex.: DJ Vitor",
    secondaryTextLabel: "Chamada secundária (opcional)",
    secondaryTextPlaceholder: "Ex.: Edição especial",
    eventSection: "Informações do evento",
    eventDateLabel: "Data do evento",
    eventDatePlaceholder: "Ex.: 19/09/2026",
    eventLocationLabel: "Local do evento",
    eventLocationPlaceholder: "Ex.: São Paulo Hall - São Paulo",
    visualSection: "Direção visual",
    visualStyleLabel: "Estilo visual",
    previousStyles: "Ver estilos anteriores",
    nextStyles: "Ver próximos estilos",
    selected: "Selecionado",
    proOnly: "🔒 Somente Pro",
    availableFromPro: "Disponível a partir do Pro",
    activeStyle: "Estilo ativo",
    tapToChoose: "Toque para escolher",
    upgrade: "Faça upgrade",
    slideMore: "Deslize para ver mais",
    carouselHint:
      "No computador, use as setas ou a roda do mouse. No celular, deslize para o lado.",
    proHint:
      "Os estilos Pro continuam visíveis para gerar desejo, mas só podem ser usados no plano Pro ou superior.",
    formatLabel: "Formato",
    qualityLabel: "Qualidade de geração",
    unavailablePlan: " — indisponível no seu plano",
    photoLabel: "Foto do DJ (opcional)",
    photoHelper: "Envie uma imagem para a IA usar como referência visual.",
    noFileSelected: "Nenhum arquivo selecionado",
    importedProfessionalPhoto: "Imagem profissional conectada",
    importedProfessionalPhotoHelp:
      "Essa imagem foi trazida da tela Imagem profissional e será usada como referência no banner. Se quiser, você pode enviar outro arquivo para substituir.",
    createProfessionalPhotoCta: "Melhorar minha foto com IA",
    professionalPhotoModalTitle: "Melhorar foto com IA",
    professionalPhotoModalDescription:
      "Envie sua foto, gere uma versão mais profissional e depois escolha se quer usar no banner ou baixar a imagem.",
    professionalPhotoSelectLabel: "Escolha a foto base",
    professionalPhotoSelectHelper:
      "Use uma foto nítida do rosto para obter um resultado melhor.",
    professionalPhotoDirectionTitle: "Escolha o tipo de foto profissional",
    professionalPhotoDirectionDescription:
      "Selecione como você quer aparecer online. A IA usa essa direção para melhorar sua foto com um resultado mais adequado ao seu objetivo.",
    professionalPhotoDirections: [
      {
        id: "artist_press",
        title: "Artist Press Photo",
        description: "Foto oficial para divulgação, release, booking e perfil profissional.",
        badge: "Press",
      },
      {
        id: "studio_portrait",
        title: "Studio Portrait",
        description: "Retrato limpo com iluminação de estúdio e aparência premium.",
        badge: "Clean",
      },
      {
        id: "profile_picture",
        title: "Profile Picture",
        description: "Imagem forte para Instagram, TikTok, Spotify e redes sociais.",
        badge: "Social",
      },
      {
        id: "booking_promo",
        title: "Booking Promo Photo",
        description: "Visual profissional para aumentar valor percebido em contratações.",
        badge: "Booking",
      },
      {
        id: "editorial_artist",
        title: "Editorial Artist Photo",
        description: "Retrato sofisticado com aparência de revista e portfólio.",
        badge: "Premium",
      },
      {
        id: "lifestyle_dj",
        title: "Lifestyle DJ Photo",
        description: "Foto mais natural, moderna e autêntica para redes sociais.",
        badge: "Natural",
      },
    ],
    professionalPhotoGenerateButton: "Gerar imagem profissional",
    professionalPhotoGeneratingButton: "Gerando imagem...",
    professionalPhotoUseButton: "Usar imagem no banner",
    professionalPhotoDownloadButton: "Baixar imagem",
    professionalPhotoCloseButton: "Fechar",
    professionalPhotoReadyTitle: "Imagem profissional pronta",
    professionalPhotoReadyDescription:
      "Agora você pode usar essa imagem no banner ou baixar o arquivo.",
    professionalPhotoSourceTitle: "Foto enviada",
    professionalPhotoResultTitle: "Resultado gerado",
    professionalPhotoChooseButton: "Escolher foto",
    professionalPhotoChangeButton: "Trocar foto",
    professionalPhotoGenerateHint:
      "Envie a foto dentro deste modal e gere a versão aprimorada sem sair do fluxo.",
    professionalPhotoStepUpload: "1. Envie sua foto",
    professionalPhotoStepGenerate: "2. Gere a versão profissional",
    professionalPhotoStepApply: "3. Use no banner ou baixe",
    professionalPhotoUseHint:
      "Se gostar do resultado, conecte a imagem ao banner com um clique.",
    professionalStructure: "Estrutura profissional",
    professionalStructureText:
      "O texto principal será o maior destaque da arte. O nome do DJ ficará em segundo nível e o bloco complementar será mais discreto e elegante.",
    remainingCredits: "Créditos restantes",
    noCreditsButton: "Créditos esgotados",
    generatingButton: "Gerando preview...",
    editingButton: "Aplicando alteração...",
    generateButton: "Gerar banner premium",
    previewEyebrow: "Preview",
    previewLoadingTitle: "A IA está montando sua composição",
    previewEditTitle: "A IA está aplicando sua alteração",
    previewReadyTitle: "Preview pronto para revisão",
    previewEmptyTitle: "Seu banner aparecerá aqui",
    selectedFormat: "Formato selecionado",
    processingBadge: "Processando",
    editingBadge: "Alterando",
    completedBadge: "Concluído",
    waitingBadge: "Aguardando",
    renderChip: "Render IA",
    editChip: "Edit IA",
    composingLayers: "Compondo camadas",
    applyingChanges: "Aplicando alterações",
    processingVisual: "Processando visual",
    generatingNewVersion: "Gerando nova versão",
    loadingHelper:
      "A IA está preparando seu banner com base no briefing informado.",
    editLoadingHelper:
      "A imagem atual está sendo usada como base para criar uma nova versão.",
    generatedAlt: "Banner gerado",
    testPreviewTitle: "Preview gerado no modo de teste",
    successTitle: "Seu banner foi criado com sucesso",
    testPreviewDescription:
      "Neste modo o sistema prioriza velocidade e mostra o preview imediatamente.",
    successDescription:
      "A imagem já pode ser baixada ou aberta em uma nova guia.",
    downloadImage: "Baixar imagem",
    openImage: "Abrir imagem",
    editTitle: "Solicitar alteração da arte",
    editDescription:
      "Descreva a mudança desejada. Cada alteração consome 1 crédito.",
    oneCredit: "1 crédito",
    editPlaceholder:
      "Ex.: deixe o fundo mais escuro, aumente o destaque do título principal e use um clima mais neon.",
    editHelper:
      "A IA usará a imagem atual como base e criará uma nova versão da arte.",
    editButton: "Solicitar alteração",
    editingButtonShort: "Alterando arte...",
    smartPreview: "Preview inteligente",
    smartPreviewDescription: "Seu banner será gerado aqui.",
    awaitingGeneration: "Aguardando geração",
    generateSteps: [
      "Preparando os dados do banner",
      "Enviando composição para a IA",
      "Gerando o preview visual",
      "Finalizando o resultado",
    ],
    editSteps: [
      "Analisando a arte atual",
      "Aplicando suas instruções na composição",
      "Renderizando a nova versão",
      "Finalizando os ajustes da arte",
    ],
    qualityLabels: {
      low: "Rápido",
      medium: "Equilibrado",
      high: "Alta qualidade",
    },
    badges: {
      Popular: "Popular",
      Novo: "Novo",
      Pro: "Pro",
    },
    styleDescriptions: {
      NEON_CLUB: "Glow forte, energia de pista e visual vibrante.",
      PREMIUM_BLACK: "Elegante, escuro e com aparência mais refinada.",
      SUMMER_VIBES: "Leve, iluminado e ideal para eventos mais abertos.",
      MINIMAL_TECHNO: "Mais limpo, moderno e com informação bem organizada.",
      LUXURY_GOLD: "Luxuoso, dourado e com sensação premium.",
      FESTIVAL_MAINSTAGE:
        "Aparência de grande palco, luzes intensas e impacto premium.",
      CYBER_RAVE: "Clima futurista, digital e cheio de personalidade.",
      DARK_TECHNO: "Estética underground, contraste forte e atmosfera noturna.",
      CHROME_FUTURE: "Visual metálico, moderno e mais tecnológico.",
      AFRO_HOUSE_SUNSET: "Tons quentes, vibe sunset e presença sofisticada.",
      Y2K_CLUB: "Visual jovem, chamativo e com pegada club moderna.",
    },
    errors: {
      fileRead: "Não foi possível ler a imagem enviada.",
      trackGeneration: "Não foi possível acompanhar a geração.",
      completedNoImage:
        "O banner foi marcado como concluído, mas a URL da imagem não foi retornada.",
      failedGeneration: "Não foi possível concluir a geração do banner.",
      timeout:
        "A geração ainda está em andamento. Abra Meus banners em alguns instantes para conferir o resultado.",
      noCredits: "Você usou todos os seus créditos deste mês.",
      generate: "Não foi possível gerar o banner.",
      missingBannerId:
        "A geração foi iniciada, mas a API não retornou o ID do banner.",
      missingImage:
        "A API retornou sucesso, mas não enviou a URL da imagem gerada.",
      sampleNeedsPhoto:
        "Envie sua foto do DJ antes de usar o teste guiado.",
      generateFallback: "Erro ao gerar banner.",
      editPrompt: "Descreva a alteração desejada com um pouco mais de detalhe.",
      edit: "Não foi possível editar a arte.",
      editFallback: "Erro ao editar a arte.",
    },
    status: {
      waitingAi:
        "Banner enviado para a IA. Aguardando a finalização da imagem...",
      preparing: "Preparando os dados do banner...",
      sending: "Enviando composição para a IA...",
      drawing: "A IA está desenhando o preview do banner...",
      finishing:
        "Ajustando o resultado final. Aguarde mais alguns instantes...",
      created: "Banner criado. Aguardando a IA finalizar a imagem...",
      success: "Banner gerado e salvo com sucesso.",
      testSuccess: "Preview gerado com sucesso no modo de teste.",
      editAnalyzing: "Analisando a arte atual para aplicar a alteração...",
      editApplying: "Aplicando suas instruções na composição...",
      editRendering: "Renderizando a nova versão da arte...",
      editFinishing:
        "Finalizando os ajustes da alteração. Aguarde mais alguns instantes...",
      editSuccess: "Alteração aplicada com sucesso.",
    },

    upgradeCard: {
      label: "Créditos esgotados",
      title: "Libere mais banners e continue criando sem pausa",
      description:
        "Faça upgrade do seu plano para receber mais créditos mensais e desbloquear opções melhores de geração para seus banners.",
      button: "Ver planos",
      freeHelp: "Pro libera mais créditos. Professional libera alta qualidade.",
      paidHelp: "Escolha um plano maior para aumentar seus créditos.",
    },
  },
  en: {
    briefingEyebrow: "Creative brief",
    briefingTitle: "Fill in your banner details",
    briefingDescription:
      "A clear structure to generate premium flyers without mixing up the main title, DJ name, and event details.",
    briefingProgress: "Briefing",
    guidedEyebrow: "Start faster",
    guidedTitle: "Create your first free banner in a few clicks",
    guidedDescription:
      "Follow the steps below or generate a sample banner now to see the platform result without getting stuck on the form.",
    guidedSteps: [
      {
        title: "Choose a style",
        description: "Select a ready-made visual direction for a party, schedule, or promotion.",
        helper:
          "Scroll through the style cards below and click one to activate it. If you see a lock, that style requires a Pro plan.",
      },
      {
        title: "Add event details",
        description: "Enter the event, DJ, date, and location. You can also use the automatic example.",
        helper:
          "Fill in the main title, DJ name, date, and venue. If you want to move faster, use the fill example button.",
      },
      {
        title: "Upload your photo and generate",
        description: "Add your photo so AI can use it as a reference and generate the preview.",
        helper:
          "In the DJ Photo section, upload a clear photo of your face. The guided test will use your own photo to generate the banner.",
      },
    ],
    stepStatusDone: "Done",
    stepStatusCurrent: "Current step",
    stepStatusPending: "Next step",
    stepActionGo: "Go to this step",
    guidedPhotoHint:
      "For the guided test, upload your own DJ photo so AI can create a preview closer to your identity.",
    tourGenerateTitle: "Click generate",
    tourGenerateDescription:
      "After choosing the style, filling in the details, and uploading your photo, click the generate button. The preview will appear on the side.",
    tourSkip: "Skip guide",
    tourBack: "Back",
    tourNext: "Next",
    tourDone: "Done",
    tourStepLabel: "Step",
    tourIncompleteDefault:
      "Complete this step before continuing.",
    tourIncompleteStyle:
      "Choose a visual style to continue.",
    tourIncompleteDetails:
      "Fill in the main title, DJ name, date, and location to continue.",
    tourIncompleteMainText:
      "Fill in the main banner text to continue.",
    tourIncompleteDjName:
      "Fill in the DJ name to continue.",
    tourIncompleteEventDate:
      "Fill in the event date to continue.",
    tourIncompleteEventLocation:
      "Fill in the event location to continue.",
    tourMainTextDescription:
      "Type the main title that should stand out most in the banner.",
    tourDjNameDescription:
      "Type the DJ artist name that will appear in the composition.",
    tourEventDateDescription:
      "Enter when the event happens. It can be an exact date or something like This Saturday.",
    tourEventLocationDescription:
      "Enter the venue, city, or club name for the event promotion.",
    tourIncompletePhoto:
      "Upload your DJ photo to continue.",
    tourIncompleteGenerate:
      "Click the Generate banner button to finish the guide.",
    typingSuggestions: {
      mainText: "Ex.: Neon Friday Party",
      djName: "Ex.: DJ Vision",
      secondaryText: "Ex.: Special AI Edition",
      eventDate: "Ex.: This Saturday",
      eventLocation: "Ex.: Downtown Club",
    },
    sampleButton: "Generate free sample banner",
    fillSampleButton: "Fill example",
    sampleBadge: "Recommended for first visit",
    mainSection: "Main content",
    mainTextLabel: "Main banner text",
    mainTextPlaceholder: "Ex.: Pull Party Fest",
    djNameLabel: "DJ name",
    djNamePlaceholder: "Ex.: DJ Vitor",
    secondaryTextLabel: "Secondary line (optional)",
    secondaryTextPlaceholder: "Ex.: Special edition",
    eventSection: "Event information",
    eventDateLabel: "Event date",
    eventDatePlaceholder: "Ex.: 09/19/2026",
    eventLocationLabel: "Event location",
    eventLocationPlaceholder: "Ex.: São Paulo Hall - São Paulo",
    visualSection: "Visual direction",
    visualStyleLabel: "Visual style",
    previousStyles: "View previous styles",
    nextStyles: "View next styles",
    selected: "Selected",
    proOnly: "🔒 Pro only",
    availableFromPro: "Available from Pro",
    activeStyle: "Active style",
    tapToChoose: "Tap to choose",
    upgrade: "Upgrade",
    slideMore: "Swipe for more",
    carouselHint:
      "On desktop, use the arrows or mouse wheel. On mobile, swipe sideways.",
    proHint:
      "Pro styles stay visible to create desire, but can only be used on the Pro plan or higher.",
    formatLabel: "Format",
    qualityLabel: "Generation quality",
    unavailablePlan: " — unavailable on your plan",
    photoLabel: "DJ photo (optional)",
    photoHelper: "Upload an image for the AI to use as a visual reference.",
    noFileSelected: "No file selected",
    importedProfessionalPhoto: "Professional image connected",
    importedProfessionalPhotoHelp:
      "This image was imported from the Professional image page and will be used as the banner reference. If you want, upload another file to replace it.",
    createProfessionalPhotoCta: "Improve my photo with AI",
    professionalPhotoModalTitle: "Improve photo with AI",
    professionalPhotoModalDescription:
      "Upload your photo, generate a more professional version, then choose whether to use it in the banner or download it.",
    professionalPhotoSelectLabel: "Choose the source photo",
    professionalPhotoSelectHelper:
      "Use a clear face photo to get a better result.",
    professionalPhotoDirectionTitle: "Choose the type of professional photo",
    professionalPhotoDirectionDescription:
      "Select how you want to appear online. AI uses this direction to enhance your photo with a result that fits your goal.",
    professionalPhotoDirections: [
      {
        id: "artist_press",
        title: "Artist Press Photo",
        description: "Official photo for promotion, press kits, booking and professional profiles.",
        badge: "Press",
      },
      {
        id: "studio_portrait",
        title: "Studio Portrait",
        description: "Clean portrait with studio lighting and a premium look.",
        badge: "Clean",
      },
      {
        id: "profile_picture",
        title: "Profile Picture",
        description: "Strong image for Instagram, TikTok, Spotify and social media.",
        badge: "Social",
      },
      {
        id: "booking_promo",
        title: "Booking Promo Photo",
        description: "Professional visual to increase perceived value for bookings.",
        badge: "Booking",
      },
      {
        id: "editorial_artist",
        title: "Editorial Artist Photo",
        description: "Sophisticated portrait with a magazine and portfolio look.",
        badge: "Premium",
      },
      {
        id: "lifestyle_dj",
        title: "Lifestyle DJ Photo",
        description: "Natural, modern and authentic photo for social media.",
        badge: "Natural",
      },
    ],
    professionalPhotoGenerateButton: "Generate professional image",
    professionalPhotoGeneratingButton: "Generating image...",
    professionalPhotoUseButton: "Use image in banner",
    professionalPhotoDownloadButton: "Download image",
    professionalPhotoCloseButton: "Close",
    professionalPhotoReadyTitle: "Professional image ready",
    professionalPhotoReadyDescription:
      "You can now use this image in the banner or download the file.",
    professionalPhotoSourceTitle: "Uploaded photo",
    professionalPhotoResultTitle: "Generated result",
    professionalPhotoChooseButton: "Choose photo",
    professionalPhotoChangeButton: "Change photo",
    professionalPhotoGenerateHint:
      "Upload the photo inside this modal and generate the enhanced version without leaving the flow.",
    professionalPhotoStepUpload: "1. Upload your photo",
    professionalPhotoStepGenerate: "2. Generate the professional version",
    professionalPhotoStepApply: "3. Use it in the banner or download it",
    professionalPhotoUseHint:
      "If you like the result, connect the image to the banner with one click.",
    professionalStructure: "Professional structure",
    professionalStructureText:
      "The main text will be the biggest visual highlight. The DJ name will appear as a secondary element and the complementary details will be more discreet and elegant.",
    remainingCredits: "Remaining credits",
    noCreditsButton: "No credits left",
    generatingButton: "Generating preview...",
    editingButton: "Applying edit...",
    generateButton: "Generate premium banner",
    previewEyebrow: "Preview",
    previewLoadingTitle: "AI is building your composition",
    previewEditTitle: "AI is applying your edit",
    previewReadyTitle: "Preview ready for review",
    previewEmptyTitle: "Your banner will appear here",
    selectedFormat: "Selected format",
    processingBadge: "Processing",
    editingBadge: "Editing",
    completedBadge: "Completed",
    waitingBadge: "Waiting",
    renderChip: "AI render",
    editChip: "AI edit",
    composingLayers: "Composing layers",
    applyingChanges: "Applying changes",
    processingVisual: "Processing visual",
    generatingNewVersion: "Generating new version",
    loadingHelper: "AI is preparing your banner from the brief you provided.",
    editLoadingHelper:
      "The current image is being used as the base to create a new version.",
    generatedAlt: "Generated banner",
    testPreviewTitle: "Preview generated in test mode",
    successTitle: "Your banner was created successfully",
    testPreviewDescription:
      "In this mode, the system prioritizes speed and shows the preview immediately.",
    successDescription:
      "The image can now be downloaded or opened in a new tab.",
    downloadImage: "Download image",
    openImage: "Open image",
    editTitle: "Request an artwork edit",
    editDescription: "Describe the change you want. Each edit uses 1 credit.",
    oneCredit: "1 credit",
    editPlaceholder:
      "Ex.: make the background darker, highlight the main title more, and use a more neon mood.",
    editHelper:
      "AI will use the current image as the base and create a new version of the artwork.",
    editButton: "Request edit",
    editingButtonShort: "Editing artwork...",
    smartPreview: "Smart preview",
    smartPreviewDescription: "Your banner will be generated here.",
    awaitingGeneration: "Waiting for generation",
    generateSteps: [
      "Preparing banner data",
      "Sending composition to AI",
      "Generating visual preview",
      "Finalizing the result",
    ],
    editSteps: [
      "Analyzing current artwork",
      "Applying your instructions",
      "Rendering the new version",
      "Finalizing artwork edits",
    ],
    qualityLabels: {
      low: "Fast",
      medium: "Balanced",
      high: "High quality",
    },
    badges: {
      Popular: "Popular",
      Novo: "New",
      Pro: "Pro",
    },
    styleDescriptions: {
      NEON_CLUB: "Strong glow, club energy, and a vibrant look.",
      PREMIUM_BLACK: "Elegant, dark, and more refined.",
      SUMMER_VIBES: "Light, bright, and ideal for open-air events.",
      MINIMAL_TECHNO: "Cleaner, modern, and well organized.",
      LUXURY_GOLD: "Luxurious, golden, and premium-looking.",
      FESTIVAL_MAINSTAGE: "Mainstage look, intense lights, and premium impact.",
      CYBER_RAVE: "Futuristic, digital, and full of personality.",
      DARK_TECHNO: "Underground aesthetic, heavy contrast, and night mood.",
      CHROME_FUTURE: "Metallic, modern, and more technological.",
      AFRO_HOUSE_SUNSET: "Warm tones, sunset vibe, and sophisticated presence.",
      Y2K_CLUB: "Young, bold, and modern club-inspired look.",
    },
    errors: {
      fileRead: "Could not read the uploaded image.",
      trackGeneration: "Could not track the generation.",
      completedNoImage:
        "The banner was marked as completed, but the image URL was not returned.",
      failedGeneration: "Could not complete banner generation.",
      timeout:
        "Generation is still running. Open My banners in a few moments to check the result.",
      noCredits: "You have used all your credits for this month.",
      generate: "Could not generate the banner.",
      missingBannerId:
        "Generation was started, but the API did not return the banner ID.",
      missingImage:
        "The API returned success, but did not send the generated image URL.",
      sampleNeedsPhoto:
        "Upload your DJ photo before using the guided test.",
      generateFallback: "Error generating banner.",
      editPrompt: "Describe the desired edit with a little more detail.",
      edit: "Could not edit the artwork.",
      editFallback: "Error editing artwork.",
    },
    status: {
      waitingAi: "Banner sent to AI. Waiting for the image to finish...",
      preparing: "Preparing banner data...",
      sending: "Sending composition to AI...",
      drawing: "AI is drawing the banner preview...",
      finishing:
        "Adjusting the final result. Please wait a few more moments...",
      created: "Banner created. Waiting for AI to finish the image...",
      success: "Banner generated and saved successfully.",
      testSuccess: "Preview generated successfully in test mode.",
      editAnalyzing: "Analyzing the current artwork to apply your edit...",
      editApplying: "Applying your instructions to the composition...",
      editRendering: "Rendering the new artwork version...",
      editFinishing: "Finalizing the edit. Please wait a few more moments...",
      editSuccess: "Edit applied successfully.",
    },
    upgradeCard: {
      label: "No credits left",
      title: "Unlock more banners and keep creating without pauses",
      description:
        "Upgrade your plan to receive more monthly credits and unlock better generation options for your banners.",
      button: "View plans",
      freeHelp: "Pro unlocks more credits. Professional unlocks high quality.",
      paidHelp: "Choose a larger plan to increase your credits.",
    },
  },
  es: {
    briefingEyebrow: "Brief creativo",
    briefingTitle: "Completa los datos del banner",
    briefingDescription:
      "Una estructura clara para generar flyers premium sin confundir el texto principal, el nombre del DJ y los datos del evento.",
    briefingProgress: "Briefing",
    guidedEyebrow: "Empieza más rápido",
    guidedTitle: "Crea tu primer banner gratis en pocos clics",
    guidedDescription:
      "Sigue el paso a paso o genera un banner de ejemplo ahora para ver el resultado de la plataforma sin quedarte atascado en el formulario.",
    guidedSteps: [
      {
        title: "Elige un estilo",
        description: "Selecciona una dirección visual lista para fiesta, agenda o promoción.",
        helper:
          "Desliza las tarjetas de estilo de abajo y toca una para activarla. Si ves un candado, ese estilo requiere plan Pro.",
      },
      {
        title: "Agrega los datos",
        description: "Informa evento, DJ, fecha y lugar. También puedes usar el ejemplo automático.",
        helper:
          "Completa el título principal, nombre del DJ, fecha y lugar. Si quieres ir más rápido, usa el botón de completar ejemplo.",
      },
      {
        title: "Sube tu foto y genera",
        description: "Agrega tu foto para que la IA la use como referencia y genere el preview.",
        helper:
          "En la sección Foto del DJ, sube una imagen clara de tu rostro. La prueba guiada usará tu propia foto para generar el banner.",
      },
    ],
    stepStatusDone: "Completado",
    stepStatusCurrent: "Paso actual",
    stepStatusPending: "Siguiente paso",
    stepActionGo: "Ir a este paso",
    guidedPhotoHint:
      "Para la prueba guiada, sube tu propia foto de DJ. Así la IA crea un preview más cercano a tu identidad.",
    tourGenerateTitle: "Haz clic para generar",
    tourGenerateDescription:
      "Después de elegir el estilo, completar los datos y subir tu foto, haz clic en generar. El preview aparecerá al lado.",
    tourSkip: "Saltar guía",
    tourBack: "Volver",
    tourNext: "Siguiente",
    tourDone: "Finalizar",
    tourStepLabel: "Paso",
    tourIncompleteDefault:
      "Completa este paso antes de continuar.",
    tourIncompleteStyle:
      "Elige un estilo visual para continuar.",
    tourIncompleteDetails:
      "Completa el título principal, nombre del DJ, fecha y lugar para continuar.",
    tourIncompleteMainText:
      "Completa el texto principal del banner para continuar.",
    tourIncompleteDjName:
      "Completa el nombre del DJ para continuar.",
    tourIncompleteEventDate:
      "Completa la fecha del evento para continuar.",
    tourIncompleteEventLocation:
      "Completa el lugar del evento para continuar.",
    tourMainTextDescription:
      "Escribe el título principal que debe tener más destaque en el banner.",
    tourDjNameDescription:
      "Escribe el nombre artístico del DJ que aparecerá en la composición.",
    tourEventDateDescription:
      "Indica cuándo será el evento. Puede ser una fecha exacta o algo como Este sábado.",
    tourEventLocationDescription:
      "Indica el local, ciudad o nombre del club para la promoción del evento.",
    tourIncompletePhoto:
      "Sube tu foto de DJ para continuar.",
    tourIncompleteGenerate:
      "Haz clic en el botón Generar banner para finalizar la guía.",
    typingSuggestions: {
      mainText: "Ej.: Neon Friday Party",
      djName: "Ej.: DJ Vision",
      secondaryText: "Ej.: Special AI Edition",
      eventDate: "Ej.: Este sábado",
      eventLocation: "Ej.: Downtown Club",
    },
    sampleButton: "Generar banner de prueba gratis",
    fillSampleButton: "Completar ejemplo",
    sampleBadge: "Recomendado para primer acceso",
    mainSection: "Contenido principal",
    mainTextLabel: "Texto principal del banner",
    mainTextPlaceholder: "Ej.: Pull Party Fest",
    djNameLabel: "Nombre del DJ",
    djNamePlaceholder: "Ej.: DJ Vitor",
    secondaryTextLabel: "Frase secundaria (opcional)",
    secondaryTextPlaceholder: "Ej.: Edición especial",
    eventSection: "Información del evento",
    eventDateLabel: "Fecha del evento",
    eventDatePlaceholder: "Ej.: 19/09/2026",
    eventLocationLabel: "Lugar del evento",
    eventLocationPlaceholder: "Ej.: São Paulo Hall - São Paulo",
    visualSection: "Dirección visual",
    visualStyleLabel: "Estilo visual",
    previousStyles: "Ver estilos anteriores",
    nextStyles: "Ver siguientes estilos",
    selected: "Seleccionado",
    proOnly: "🔒 Solo Pro",
    availableFromPro: "Disponible desde Pro",
    activeStyle: "Estilo activo",
    tapToChoose: "Toca para elegir",
    upgrade: "Actualizar",
    slideMore: "Desliza para ver más",
    carouselHint:
      "En computadora, usa las flechas o la rueda del mouse. En celular, desliza hacia los lados.",
    proHint:
      "Los estilos Pro siguen visibles para generar deseo, pero solo se pueden usar en el plan Pro o superior.",
    formatLabel: "Formato",
    qualityLabel: "Calidad de generación",
    unavailablePlan: " — no disponible en tu plan",
    photoLabel: "Foto del DJ (opcional)",
    photoHelper:
      "Sube una imagen para que la IA la use como referencia visual.",
    noFileSelected: "Ningún archivo seleccionado",
    importedProfessionalPhoto: "Imagen profesional conectada",
    importedProfessionalPhotoHelp:
      "Esta imagen fue importada desde la pantalla Imagen profesional y se usará como referencia del banner. Si quieres, puedes subir otro archivo para reemplazarla.",
    createProfessionalPhotoCta: "Mejorar mi foto con IA",
    professionalPhotoModalTitle: "Mejorar foto con IA",
    professionalPhotoModalDescription:
      "Sube tu foto, genera una versión más profesional y luego elige si quieres usarla en el banner o descargar la imagen.",
    professionalPhotoSelectLabel: "Elige la foto base",
    professionalPhotoSelectHelper:
      "Usa una foto clara del rostro para obtener un mejor resultado.",
    professionalPhotoDirectionTitle: "Elige el tipo de foto profesional",
    professionalPhotoDirectionDescription:
      "Selecciona cómo quieres aparecer online. La IA usa esta dirección para mejorar tu foto con un resultado más adecuado a tu objetivo.",
    professionalPhotoDirections: [
      {
        id: "artist_press",
        title: "Artist Press Photo",
        description: "Foto oficial para promoción, press kit, booking y perfil profesional.",
        badge: "Press",
      },
      {
        id: "studio_portrait",
        title: "Studio Portrait",
        description: "Retrato limpio con iluminación de estudio y apariencia premium.",
        badge: "Clean",
      },
      {
        id: "profile_picture",
        title: "Profile Picture",
        description: "Imagen fuerte para Instagram, TikTok, Spotify y redes sociales.",
        badge: "Social",
      },
      {
        id: "booking_promo",
        title: "Booking Promo Photo",
        description: "Visual profesional para aumentar el valor percibido en contrataciones.",
        badge: "Booking",
      },
      {
        id: "editorial_artist",
        title: "Editorial Artist Photo",
        description: "Retrato sofisticado con apariencia de revista y portafolio.",
        badge: "Premium",
      },
      {
        id: "lifestyle_dj",
        title: "Lifestyle DJ Photo",
        description: "Foto más natural, moderna y auténtica para redes sociales.",
        badge: "Natural",
      },
    ],
    professionalPhotoGenerateButton: "Generar imagen profesional",
    professionalPhotoGeneratingButton: "Generando imagen...",
    professionalPhotoUseButton: "Usar imagen en el banner",
    professionalPhotoDownloadButton: "Descargar imagen",
    professionalPhotoCloseButton: "Cerrar",
    professionalPhotoReadyTitle: "Imagen profesional lista",
    professionalPhotoReadyDescription:
      "Ahora puedes usar esta imagen en el banner o descargar el archivo.",
    professionalPhotoSourceTitle: "Foto subida",
    professionalPhotoResultTitle: "Resultado generado",
    professionalPhotoChooseButton: "Elegir foto",
    professionalPhotoChangeButton: "Cambiar foto",
    professionalPhotoGenerateHint:
      "Sube la foto dentro de este modal y genera la versión mejorada sin salir del flujo.",
    professionalPhotoStepUpload: "1. Sube tu foto",
    professionalPhotoStepGenerate: "2. Genera la versión profesional",
    professionalPhotoStepApply: "3. Úsala en el banner o descárgala",
    professionalPhotoUseHint:
      "Si te gusta el resultado, conecta la imagen al banner con un clic.",
    professionalStructure: "Estructura profesional",
    professionalStructureText:
      "El texto principal será el mayor destaque visual. El nombre del DJ quedará en segundo nivel y el bloque complementario será más discreto y elegante.",
    remainingCredits: "Créditos restantes",
    noCreditsButton: "Créditos agotados",
    generatingButton: "Generando preview...",
    editingButton: "Aplicando edición...",
    generateButton: "Generar banner premium",
    previewEyebrow: "Preview",
    previewLoadingTitle: "La IA está montando tu composición",
    previewEditTitle: "La IA está aplicando tu edición",
    previewReadyTitle: "Preview listo para revisar",
    previewEmptyTitle: "Tu banner aparecerá aquí",
    selectedFormat: "Formato seleccionado",
    processingBadge: "Procesando",
    editingBadge: "Editando",
    completedBadge: "Concluido",
    waitingBadge: "Esperando",
    renderChip: "Render IA",
    editChip: "Edit IA",
    composingLayers: "Componiendo capas",
    applyingChanges: "Aplicando cambios",
    processingVisual: "Procesando visual",
    generatingNewVersion: "Generando nueva versión",
    loadingHelper:
      "La IA está preparando tu banner con base en el brief informado.",
    editLoadingHelper:
      "La imagen actual se está usando como base para crear una nueva versión.",
    generatedAlt: "Banner generado",
    testPreviewTitle: "Preview generado en modo de prueba",
    successTitle: "Tu banner fue creado con éxito",
    testPreviewDescription:
      "En este modo el sistema prioriza velocidad y muestra el preview inmediatamente.",
    successDescription:
      "La imagen ya se puede descargar o abrir en una nueva pestaña.",
    downloadImage: "Descargar imagen",
    openImage: "Abrir imagen",
    editTitle: "Solicitar edición del arte",
    editDescription:
      "Describe el cambio deseado. Cada edición consume 1 crédito.",
    oneCredit: "1 crédito",
    editPlaceholder:
      "Ej.: deja el fondo más oscuro, aumenta el destaque del título principal y usa un clima más neón.",
    editHelper:
      "La IA usará la imagen actual como base y creará una nueva versión del arte.",
    editButton: "Solicitar edición",
    editingButtonShort: "Editando arte...",
    smartPreview: "Preview inteligente",
    smartPreviewDescription: "Tu banner se generará aquí.",
    awaitingGeneration: "Esperando generación",
    generateSteps: [
      "Preparando los datos del banner",
      "Enviando composición a la IA",
      "Generando el preview visual",
      "Finalizando el resultado",
    ],
    editSteps: [
      "Analizando el arte actual",
      "Aplicando tus instrucciones",
      "Renderizando la nueva versión",
      "Finalizando los ajustes del arte",
    ],
    qualityLabels: {
      low: "Rápido",
      medium: "Equilibrado",
      high: "Alta calidad",
    },
    badges: {
      Popular: "Popular",
      Novo: "Nuevo",
      Pro: "Pro",
    },
    styleDescriptions: {
      NEON_CLUB: "Glow fuerte, energía de pista y visual vibrante.",
      PREMIUM_BLACK: "Elegante, oscuro y con apariencia más refinada.",
      SUMMER_VIBES: "Ligero, iluminado e ideal para eventos al aire libre.",
      MINIMAL_TECHNO: "Más limpio, moderno y con información bien organizada.",
      LUXURY_GOLD: "Lujoso, dorado y con sensación premium.",
      FESTIVAL_MAINSTAGE:
        "Apariencia de gran escenario, luces intensas e impacto premium.",
      CYBER_RAVE: "Futurista, digital y lleno de personalidad.",
      DARK_TECHNO: "Estética underground, contraste fuerte y clima nocturno.",
      CHROME_FUTURE: "Visual metálico, moderno y más tecnológico.",
      AFRO_HOUSE_SUNSET: "Tonos cálidos, vibe sunset y presencia sofisticada.",
      Y2K_CLUB: "Visual joven, llamativo y con estilo club moderno.",
    },
    errors: {
      fileRead: "No fue posible leer la imagen enviada.",
      trackGeneration: "No fue posible acompañar la generación.",
      completedNoImage:
        "El banner fue marcado como concluido, pero no se devolvió la URL de la imagen.",
      failedGeneration: "No fue posible concluir la generación del banner.",
      timeout:
        "La generación aún está en curso. Abre Mis banners en unos instantes para ver el resultado.",
      noCredits: "Usaste todos tus créditos de este mes.",
      generate: "No fue posible generar el banner.",
      missingBannerId:
        "La generación fue iniciada, pero la API no devolvió el ID del banner.",
      missingImage:
        "La API devolvió éxito, pero no envió la URL de la imagen generada.",
      sampleNeedsPhoto:
        "Sube tu foto de DJ antes de usar la prueba guiada.",
      generateFallback: "Error al generar banner.",
      editPrompt: "Describe la edición deseada con un poco más de detalle.",
      edit: "No fue posible editar el arte.",
      editFallback: "Error al editar el arte.",
    },
    status: {
      waitingAi:
        "Banner enviado a la IA. Esperando la finalización de la imagen...",
      preparing: "Preparando los datos del banner...",
      sending: "Enviando composición a la IA...",
      drawing: "La IA está dibujando el preview del banner...",
      finishing: "Ajustando el resultado final. Espera unos instantes más...",
      created: "Banner creado. Esperando que la IA finalice la imagen...",
      success: "Banner generado y guardado con éxito.",
      testSuccess: "Preview generado con éxito en modo de prueba.",
      editAnalyzing: "Analizando el arte actual para aplicar la edición...",
      editApplying: "Aplicando tus instrucciones en la composición...",
      editRendering: "Renderizando la nueva versión del arte...",
      editFinishing:
        "Finalizando los ajustes de la edición. Espera unos instantes más...",
      editSuccess: "Edición aplicada con éxito.",
    },
    upgradeCard: {
      label: "Créditos agotados",
      title: "Libera más banners y sigue creando sin pausa",
      description:
        "Actualiza tu plan para recibir más créditos mensuales y desbloquear mejores opciones de generación para tus banners.",
      button: "Ver planes",
      freeHelp: "Pro libera más créditos. Professional libera alta calidad.",
      paidHelp: "Elige un plan mayor para aumentar tus créditos.",
    },
  },
} as const;

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

const PENDING_BANNER_STORAGE_KEY = "djproia_pending_banner_generation";
const FIRST_ACCESS_TOUR_STORAGE_KEY = "djproia_new_banner_first_access_tour_seen";
const PENDING_BANNER_MAX_AGE_MS = 1000 * 60 * 60 * 3;

type PendingBannerGeneration = {
  bannerId: string;
  createdAt: number;
  format?: string;
};

function savePendingBannerGeneration({
  bannerId,
  format,
}: {
  bannerId: string;
  format?: string;
}) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    PENDING_BANNER_STORAGE_KEY,
    JSON.stringify({
      bannerId,
      createdAt: Date.now(),
      format,
    }),
  );
}

function readPendingBannerGeneration(): PendingBannerGeneration | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(PENDING_BANNER_STORAGE_KEY);
    if (!raw) return null;

    const pending = JSON.parse(raw) as Partial<PendingBannerGeneration>;
    if (!pending.bannerId || typeof pending.bannerId !== "string") {
      window.localStorage.removeItem(PENDING_BANNER_STORAGE_KEY);
      return null;
    }

    const createdAt =
      typeof pending.createdAt === "number" ? pending.createdAt : Date.now();

    if (Date.now() - createdAt > PENDING_BANNER_MAX_AGE_MS) {
      window.localStorage.removeItem(PENDING_BANNER_STORAGE_KEY);
      return null;
    }

    return {
      bannerId: pending.bannerId,
      createdAt,
      format: typeof pending.format === "string" ? pending.format : undefined,
    };
  } catch {
    window.localStorage.removeItem(PENDING_BANNER_STORAGE_KEY);
    return null;
  }
}

function clearPendingBannerGeneration(bannerId?: string) {
  if (typeof window === "undefined") return;

  if (!bannerId) {
    window.localStorage.removeItem(PENDING_BANNER_STORAGE_KEY);
    return;
  }

  try {
    const raw = window.localStorage.getItem(PENDING_BANNER_STORAGE_KEY);
    if (!raw) return;

    const pending = JSON.parse(raw) as Partial<PendingBannerGeneration>;
    if (pending.bannerId === bannerId) {
      window.localStorage.removeItem(PENDING_BANNER_STORAGE_KEY);
    }
  } catch {
    window.localStorage.removeItem(PENDING_BANNER_STORAGE_KEY);
  }
}

function readFileAsDataUrl(file: File, errorMessage: string) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error(errorMessage));
        return;
      }
      resolve(result);
    };

    reader.onerror = () => {
      reject(new Error(errorMessage));
    };

    reader.readAsDataURL(file);
  });
}


const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-base text-white outline-none transition focus:border-sky-400/50 focus:ring-4 focus:ring-sky-400/10 placeholder:text-white/35 sm:text-sm";

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

type FirstAccessTourTarget =
  | "visual"
  | "mainText"
  | "djName"
  | "eventDate"
  | "eventLocation"
  | "photo"
  | "generate";

type ProfessionalPhotoDirectionId =
  | "artist_press"
  | "studio_portrait"
  | "profile_picture"
  | "booking_promo"
  | "editorial_artist"
  | "lifestyle_dj";

const defaultProfessionalPhotoDirection: ProfessionalPhotoDirectionId =
  "artist_press";

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
  const copy = newBannerFormCopy[locale] ?? newBannerFormCopy.en;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState("");
  const [remainingCredits, setRemainingCredits] = useState<number | null>(
    initialRemainingCredits,
  );
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [connectedProfessionalImageUrl, setConnectedProfessionalImageUrl] =
    useState<string | null>(null);
  const [showProfessionalImageModal, setShowProfessionalImageModal] =
    useState(false);
  const [professionalImageSourceFile, setProfessionalImageSourceFile] =
    useState<File | null>(null);
  const [professionalImageSourcePreview, setProfessionalImageSourcePreview] =
    useState<string>("");
  const [professionalImageResultUrl, setProfessionalImageResultUrl] =
    useState<string>("");
  const [professionalImageLoading, setProfessionalImageLoading] =
    useState(false);
  const [professionalImageError, setProfessionalImageError] = useState("");
  const [professionalPhotoDirection, setProfessionalPhotoDirection] =
    useState<ProfessionalPhotoDirectionId>(defaultProfessionalPhotoDirection);
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
  const [tourError, setTourError] = useState("");
  const [typingIndex, setTypingIndex] = useState(0);
  const [dismissedSuggestionFields, setDismissedSuggestionFields] = useState<
    Partial<Record<keyof BannerFormState, boolean>>
  >({});
  const previewRef = useRef<HTMLElement | null>(null);
  const styleCarouselRef = useRef<HTMLDivElement | null>(null);
  const mainContentScrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const eventInfoScrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const detailsSectionRef = useRef<HTMLDivElement | null>(null);
  const visualSectionRef = useRef<HTMLDivElement | null>(null);
  const mainTextFieldRef = useRef<HTMLDivElement | null>(null);
  const djNameFieldRef = useRef<HTMLDivElement | null>(null);
  const eventDateFieldRef = useRef<HTMLDivElement | null>(null);
  const eventLocationFieldRef = useRef<HTMLDivElement | null>(null);
  const photoFieldRef = useRef<HTMLDivElement | null>(null);
  const generateButtonContainerRef = useRef<HTMLDivElement | null>(null);
  const generateButtonRef = useRef<HTMLButtonElement | null>(null);
  const restoringPendingRef = useRef(false);
  const [showFirstAccessTour, setShowFirstAccessTour] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [tourBannerGenerationStarted, setTourBannerGenerationStarted] =
    useState(false);
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
  const currentSteps =
    loadingMode === "edit" ? copy.editSteps : copy.generateSteps;
  const loadingTexts =
    loadingMode === "edit"
      ? {
          title: copy.previewEditTitle,
          badge: copy.editingBadge,
          chip: copy.editChip,
          helper: copy.editLoadingHelper,
        }
      : {
          title: copy.previewLoadingTitle,
          badge: copy.processingBadge,
          chip: copy.renderChip,
          helper: copy.loadingHelper,
        };
  const hasNoCredits =
    !isAdmin &&
    (!canGenerateBanner ||
      (typeof remainingCredits === "number" && remainingCredits <= 0));
  const shouldShowCreditUpgrade = showCreditUpgrade || hasNoCredits;
  const shouldLockProStyles = !isAdmin && currentPlan === "FREE";
  const hasSelectedStyle = Boolean(form.stylePreset);
  const hasMainText = Boolean(form.mainText.trim());
  const hasDjName = Boolean(form.djName.trim());
  const hasEventDate = Boolean(form.eventDate.trim());
  const hasEventLocation = Boolean(form.eventLocation.trim());
  const hasRequiredDetails = Boolean(
    hasMainText && hasDjName && hasEventDate && hasEventLocation,
  );
  const hasUploadedPhoto = Boolean(referenceFile || connectedProfessionalImageUrl);
  const canFinishTour =
    hasSelectedStyle &&
    hasRequiredDetails &&
    hasUploadedPhoto &&
    tourBannerGenerationStarted;

  const tourStepCompletion = useMemo(
    () => [
      hasSelectedStyle,
      hasMainText,
      hasDjName,
      hasEventDate,
      hasEventLocation,
      hasUploadedPhoto,
      canFinishTour,
    ],
    [
      hasSelectedStyle,
      hasMainText,
      hasDjName,
      hasEventDate,
      hasEventLocation,
      hasUploadedPhoto,
      canFinishTour,
    ],
  );

  const firstAccessTourSteps = useMemo(
    () => [
      {
        target: "visual" as const,
        title: copy.guidedSteps[0].title,
        description: copy.guidedSteps[0].helper,
        ref: visualSectionRef,
      },
      {
        target: "mainText" as const,
        title: copy.mainTextLabel,
        description: copy.tourMainTextDescription,
        ref: mainTextFieldRef,
      },
      {
        target: "djName" as const,
        title: copy.djNameLabel,
        description: copy.tourDjNameDescription,
        ref: djNameFieldRef,
      },
      {
        target: "eventDate" as const,
        title: copy.eventDateLabel,
        description: copy.tourEventDateDescription,
        ref: eventDateFieldRef,
      },
      {
        target: "eventLocation" as const,
        title: copy.eventLocationLabel,
        description: copy.tourEventLocationDescription,
        ref: eventLocationFieldRef,
      },
      {
        target: "photo" as const,
        title: copy.guidedSteps[2].title,
        description: copy.guidedSteps[2].helper,
        ref: photoFieldRef,
      },
      {
        target: "generate" as const,
        title: copy.tourGenerateTitle,
        description: copy.tourGenerateDescription,
        ref: generateButtonContainerRef,
      },
    ],
    [copy],
  );

  const activeTourTarget = showFirstAccessTour
    ? firstAccessTourSteps[tourStepIndex]?.target
    : null;

  function dismissTypingSuggestion(field: keyof BannerFormState) {
    setDismissedSuggestionFields((current) => ({
      ...current,
      [field]: true,
    }));
  }

  function getTypedPlaceholder(field: keyof BannerFormState, fallback: string) {
    const suggestion = copy.typingSuggestions[field as keyof typeof copy.typingSuggestions];

    if (!suggestion || form[field] || dismissedSuggestionFields[field]) {
      return dismissedSuggestionFields[field] ? "" : fallback;
    }

    return suggestion.slice(0, Math.max(1, Math.min(typingIndex, suggestion.length)));
  }

  function getTourIncompleteMessage(stepIndex: number) {
    const target = firstAccessTourSteps[stepIndex]?.target;

    if (target === "visual") return copy.tourIncompleteStyle;
    if (target === "mainText") return copy.tourIncompleteMainText;
    if (target === "djName") return copy.tourIncompleteDjName;
    if (target === "eventDate") return copy.tourIncompleteEventDate;
    if (target === "eventLocation") return copy.tourIncompleteEventLocation;
    if (target === "photo") return copy.tourIncompletePhoto;
    if (target === "generate") return copy.tourIncompleteGenerate;

    return copy.tourIncompleteDefault;
  }

  function getTourTargetClass(target: FirstAccessTourTarget) {
    const shouldHide = showFirstAccessTour && activeTourTarget !== target;

    return `${shouldHide ? "hidden" : ""} scroll-mt-24 sm:scroll-mt-28 transition`;
  }

  function getInputClassForTour(target: FirstAccessTourTarget) {
    const isActive = showFirstAccessTour && activeTourTarget === target;

    return `${inputClassName} ${
      isActive
        ? "border-sky-200/35 bg-white/[0.065] shadow-[0_0_0_1px_rgba(125,211,252,0.16)]"
        : ""
    }`;
  }

  function shouldShowTourTarget(target: FirstAccessTourTarget) {
    return !showFirstAccessTour || activeTourTarget === target;
  }

  const shouldShowMainSection =
    !showFirstAccessTour || activeTourTarget === "mainText" || activeTourTarget === "djName";
  const shouldShowEventSection =
    !showFirstAccessTour ||
    activeTourTarget === "eventDate" ||
    activeTourTarget === "eventLocation";
  const shouldShowVisualSection =
    !showFirstAccessTour || activeTourTarget === "visual" || activeTourTarget === "photo";

  function scrollTourTargetToTop(
    ref: RefObject<HTMLElement | HTMLDivElement | HTMLButtonElement | null>,
    delay = 120,
    target?: FirstAccessTourTarget,
  ) {
    window.setTimeout(() => {
      const element = ref.current;
      if (!element) return;

      const isMobile = window.matchMedia("(max-width: 640px)").matches;
      const topOffset =
        target === "generate" && isMobile ? 54 : isMobile ? 12 : 72;
      const elementTop = element.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: Math.max(elementTop - topOffset, 0),
        behavior: "smooth",
      });
    }, delay);
  }

  function getTourScrollRef(
    target: FirstAccessTourTarget,
    fallback: RefObject<HTMLElement | HTMLDivElement | HTMLButtonElement | null>,
  ) {
    if (target === "mainText" || target === "djName") {
      return mainContentScrollAnchorRef;
    }

    if (target === "eventDate" || target === "eventLocation") {
      return eventInfoScrollAnchorRef;
    }

    if (target === "visual" || target === "photo") {
      return visualSectionRef;
    }

    if (target === "generate") {
      return generateButtonContainerRef;
    }

    return fallback;
  }

  function goToTourStep(stepIndex: number) {
    setTourError("");
    setTourStepIndex(stepIndex);
  }

  function advanceFirstAccessTour() {
    if (!tourStepCompletion[tourStepIndex]) {
      setTourError(getTourIncompleteMessage(tourStepIndex));
      const currentStep = firstAccessTourSteps[tourStepIndex];
      if (currentStep) {
        scrollTourTargetToTop(
          getTourScrollRef(currentStep.target, currentStep.ref),
          80,
          currentStep.target,
        );
      }
      return;
    }

    setTourError("");

    if (tourStepIndex >= firstAccessTourSteps.length - 1) {
      completeFirstAccessTour();
      return;
    }

    goToTourStep(Math.min(tourStepIndex + 1, firstAccessTourSteps.length - 1));
  }

  function scrollToPreview() {
    window.setTimeout(() => {
      previewRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 120);
  }

  function scrollToSection(ref: RefObject<HTMLElement | HTMLDivElement | null>) {
    window.setTimeout(() => {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 120);
  }

  function scrollStyleCarousel(direction: "left" | "right") {
    const carousel = styleCarouselRef.current;
    if (!carousel) return;

    carousel.scrollBy({
      left: direction === "left" ? -320 : 320,
      behavior: "smooth",
    });
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
        throw new Error(data.error || copy.errors.trackGeneration);
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
          throw new Error(copy.errors.completedNoImage);
        }

        clearPendingBannerGeneration(bannerId);

        return {
          imageUrl,
          bannerId: data.bannerId || bannerId,
          bannerUrl: data.bannerUrl || `/dashboard/banners/${bannerId}`,
          saved: true,
        };
      }

      if (data.status === "FAILED") {
        clearPendingBannerGeneration(bannerId);
        throw new Error(data.message || copy.errors.failedGeneration);
      }

      setStatusText(copy.status.waitingAi);
    }

    throw new Error(copy.errors.timeout);
  }

  useEffect(() => {
    if (restoringPendingRef.current || loading || editLoading || result) return;

    const pending = readPendingBannerGeneration();
    if (!pending) return;

    restoringPendingRef.current = true;

    if (pending.format === "POST_FEED" || pending.format === "STORY") {
      setForm((current) => ({
        ...current,
        format: pending.format || current.format,
      }));
    }

    setLoading(true);
    setLoadingMode("generate");
    setActiveStep(0);
    setStatusText(copy.status.created);
    setError("");
    setResult(null);
    setEditPrompt("");
    setEditError("");
    setEditSuccess("");
    scrollToPreview();

    let cancelled = false;

    waitForGeneratedBanner(pending.bannerId)
      .then((completedBanner) => {
        if (cancelled) return;

        setActiveStep(3);
        setStatusText(copy.status.success);
        setResult(completedBanner);
        router.refresh();
      })
      .catch((err) => {
        if (cancelled) return;

        const message =
          err instanceof Error ? err.message : copy.errors.generateFallback;

        setError(message);
        if (isCreditExhaustedMessage(message)) {
          setRemainingCredits(0);
          setShowCreditUpgrade(true);
        }
        setStatusText("");
        setActiveStep(0);
      })
      .finally(() => {
        if (cancelled) return;

        setLoading(false);
        setLoadingMode(null);
        restoringPendingRef.current = false;
      });

    return () => {
      cancelled = true;
    };
    // This effect should only try to restore the pending banner once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const professionalImageUrl = searchParams.get("professionalImageUrl");

    if (professionalImageUrl) {
      setConnectedProfessionalImageUrl(professionalImageUrl);
    } else {
      setConnectedProfessionalImageUrl(null);
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const forceTour =
      new URLSearchParams(window.location.search).get("tour") === "1";

    if (forceTour) {
      setTourBannerGenerationStarted(false);
      setShowFirstAccessTour(true);
      setTourStepIndex(0);
    }
  }, []);

  useEffect(() => {
    const values = Object.values(copy.typingSuggestions);
    const maxLength = Math.max(...values.map((value) => value.length));
    const timer = window.setTimeout(() => {
      setTypingIndex((current) => (current >= maxLength + 18 ? 0 : current + 1));
    }, typingIndex > maxLength ? 80 : 45);

    return () => window.clearTimeout(timer);
  }, [copy.typingSuggestions, typingIndex]);

  useEffect(() => {
    if (!showFirstAccessTour) return;

    const currentStep = firstAccessTourSteps[tourStepIndex];
    if (!currentStep) return;

    scrollTourTargetToTop(
      getTourScrollRef(currentStep.target, currentStep.ref),
      160,
      currentStep.target,
    );
  }, [firstAccessTourSteps, showFirstAccessTour, tourStepIndex]);

  useEffect(() => {
    if (!showFirstAccessTour || !tourError) return;

    if (tourStepCompletion[tourStepIndex]) {
      setTourError("");
    }
  }, [showFirstAccessTour, tourError, tourStepCompletion, tourStepIndex]);

  function markFirstAccessTourAsSeen() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(FIRST_ACCESS_TOUR_STORAGE_KEY, "1");
    }
  }

  function notifyFirstAccessTourCompleted() {
    void fetch("/api/onboarding/tour-completed", {
      method: "POST",
      keepalive: true,
    }).catch((err) => {
      console.error("Error notifying tour completion:", err);
    });
  }

  function removeFirstAccessTourQueryParam() {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    url.searchParams.delete("tour");

    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function completeFirstAccessTour() {
    markFirstAccessTourAsSeen();
    removeFirstAccessTourQueryParam();
    setTourError("");
    setShowFirstAccessTour(false);
    notifyFirstAccessTourCompleted();

    window.setTimeout(() => {
      scrollToPreview();
    }, 180);
  }

  function closeFirstAccessTour() {
    markFirstAccessTourAsSeen();
    removeFirstAccessTourQueryParam();
    setTourError("");
    setShowFirstAccessTour(false);
  }

  async function runBannerGeneration({
    formSnapshot,
    referenceFileForGeneration,
    connectedProfessionalImageUrlForGeneration,
  }: {
    formSnapshot: BannerFormState;
    referenceFileForGeneration: File | null;
    connectedProfessionalImageUrlForGeneration: string | null;
  }) {
    if (hasNoCredits) {
      setError(copy.errors.noCredits);
      setShowCreditUpgrade(true);
      setStatusText("");
      setActiveStep(0);
      return;
    }

    setLoading(true);
    setLoadingMode("generate");
    setActiveStep(0);
    setStatusText(copy.status.preparing);
    setError("");
    setResult(null);
    setShowCreditUpgrade(false);
    setEditPrompt("");
    setEditError("");
    setEditSuccess("");
    scrollToPreview();

    if (showFirstAccessTour && activeTourTarget === "generate") {
      setTourBannerGenerationStarted(true);
      completeFirstAccessTour();
    }

    let progressTimerA: number | undefined;
    let progressTimerB: number | undefined;
    let progressTimerC: number | undefined;

    try {
      const referenceImageUrl = referenceFileForGeneration
        ? await readFileAsDataUrl(referenceFileForGeneration, copy.errors.fileRead)
        : connectedProfessionalImageUrlForGeneration || null;

      progressTimerA = window.setTimeout(() => {
        setActiveStep(1);
        setStatusText(copy.status.sending);
      }, 900);

      progressTimerB = window.setTimeout(() => {
        setActiveStep(2);
        setStatusText(copy.status.drawing);
      }, 4200);

      progressTimerC = window.setTimeout(() => {
        setActiveStep(3);
        setStatusText(copy.status.finishing);
      }, 9000);

      const response = await fetch("/api/banners/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mainText: formSnapshot.mainText,
          djName: formSnapshot.djName,
          secondaryText: formSnapshot.secondaryText,
          eventDate: formSnapshot.eventDate,
          eventLocation: formSnapshot.eventLocation,
          stylePreset: formSnapshot.stylePreset,
          format: formSnapshot.format,
          quality: formSnapshot.quality,
          referenceImageUrl,
        }),
      });

      if (progressTimerA) window.clearTimeout(progressTimerA);
      if (progressTimerB) window.clearTimeout(progressTimerB);
      if (progressTimerC) window.clearTimeout(progressTimerC);

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || copy.errors.generate);
      }

      const nextRemainingCredits =
        typeof data.remainingCredits === "number"
          ? data.remainingCredits
          : null;

      setRemainingCredits(nextRemainingCredits);
      setShowCreditUpgrade(
        !isAdmin &&
          typeof nextRemainingCredits === "number" &&
          nextRemainingCredits <= 0,
      );

      if (response.status === 202 || data.status === "PENDING") {
        if (!data.bannerId) {
          throw new Error(copy.errors.missingBannerId);
        }

        setStatusText(copy.status.created);
        savePendingBannerGeneration({
          bannerId: data.bannerId,
          format: formSnapshot.format,
        });

        const completedBanner = await waitForGeneratedBanner(data.bannerId);

        setActiveStep(3);
        setStatusText(copy.status.success);
        setResult(completedBanner);
        router.refresh();
        return;
      }

      const imageUrl = data.previewImageUrl || data.imageUrl || null;

      if (!imageUrl) {
        throw new Error(copy.errors.missingImage);
      }

      setActiveStep(3);
      setStatusText(
        data.saved === false ? copy.status.testSuccess : copy.status.success,
      );

      if (data.bannerId) {
        clearPendingBannerGeneration(data.bannerId);
      }

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
        err instanceof Error ? err.message : copy.errors.generateFallback;
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

  function openProfessionalImageModal() {
    setProfessionalImageError("");
    setProfessionalImageSourceFile(null);
    setProfessionalImageSourcePreview("");
    setProfessionalImageResultUrl("");
    setShowProfessionalImageModal(true);
  }

  function closeProfessionalImageModal() {
    if (professionalImageLoading) {
      return;
    }

    setShowProfessionalImageModal(false);
  }

  async function handleProfessionalImageFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0] || null;
    setProfessionalImageSourceFile(file);
    setProfessionalImageError("");
    setProfessionalImageResultUrl("");

    if (!file) {
      setProfessionalImageSourcePreview("");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file, copy.errors.fileRead);
      setProfessionalImageSourcePreview(dataUrl);
    } catch (fileError) {
      setProfessionalImageSourcePreview("");
      setProfessionalImageError(
        fileError instanceof Error ? fileError.message : copy.errors.fileRead,
      );
    }
  }

  async function handleGenerateProfessionalImage() {
    if (!professionalImageSourcePreview) {
      setProfessionalImageError(copy.errors.fileRead);
      return;
    }

    try {
      setProfessionalImageLoading(true);
      setProfessionalImageError("");

      const response = await fetch("/api/ai/professional-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageDataUrl: professionalImageSourcePreview,
          locale,
          photoDirection: professionalPhotoDirection,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        imageUrl?: string;
        remainingCredits?: number | null;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || copy.errors.generate);
      }

      if (!data.imageUrl) {
        throw new Error(copy.errors.missingImage);
      }

      setProfessionalImageResultUrl(data.imageUrl);
      if (typeof data.remainingCredits === "number") {
        setRemainingCredits(data.remainingCredits);
      }
    } catch (generateError) {
      const message =
        generateError instanceof Error
          ? generateError.message
          : copy.errors.generate;
      setProfessionalImageError(message);
      if (message === copy.errors.noCredits) {
        setShowCreditUpgrade(true);
      }
    } finally {
      setProfessionalImageLoading(false);
    }
  }

  function handleUseProfessionalImage() {
    if (!professionalImageResultUrl) {
      return;
    }

    setConnectedProfessionalImageUrl(professionalImageResultUrl);
    setReferenceFile(null);
    if (activeTourTarget === "photo") {
      setTourError("");
    }
    setShowProfessionalImageModal(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runBannerGeneration({
      formSnapshot: form,
      referenceFileForGeneration: referenceFile,
      connectedProfessionalImageUrlForGeneration: connectedProfessionalImageUrl,
    });
  }

  async function handleEdit() {
    if (!result?.imageUrl) return;

    if (hasNoCredits) {
      setEditError(copy.errors.noCredits);
      setShowCreditUpgrade(true);
      return;
    }

    if (editPrompt.trim().length < 4) {
      setEditError(copy.errors.editPrompt);
      return;
    }

    setEditLoading(true);
    setLoadingMode("edit");
    setActiveStep(0);
    setEditError("");
    setEditSuccess("");
    setStatusText(copy.status.editAnalyzing);

    let progressTimerA: number | undefined;
    let progressTimerB: number | undefined;
    let progressTimerC: number | undefined;

    try {
      progressTimerA = window.setTimeout(() => {
        setActiveStep(1);
        setStatusText(copy.status.editApplying);
      }, 900);

      progressTimerB = window.setTimeout(() => {
        setActiveStep(2);
        setStatusText(copy.status.editRendering);
      }, 4200);

      progressTimerC = window.setTimeout(() => {
        setActiveStep(3);
        setStatusText(copy.status.editFinishing);
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

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || copy.errors.edit);
      }

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

      if (response.status === 202 || data.status === "PENDING") {
        if (!data.bannerId) {
          throw new Error(copy.errors.missingBannerId);
        }

        setActiveStep(2);
        setStatusText(copy.status.waitingAi);
        savePendingBannerGeneration({
          bannerId: data.bannerId,
          format: form.format,
        });

        const completedBanner = await waitForGeneratedBanner(data.bannerId);

        setActiveStep(3);
        setStatusText(copy.status.editSuccess);
        setResult({
          ...completedBanner,
          bannerUrl: completedBanner.bannerUrl || data.bannerUrl || result.bannerUrl,
        });
        setEditSuccess(copy.status.editSuccess);
        setEditPrompt("");
        router.refresh();
        return;
      }

      const editedImageUrl =
        data.previewImageUrl ||
        data.imageUrl ||
        data.outputImageUrl ||
        data.banner?.outputImageUrl ||
        null;

      if (!editedImageUrl) {
        throw new Error(copy.errors.missingImage);
      }

      setActiveStep(3);
      setStatusText(copy.status.editSuccess);

      if (data.bannerId) {
        clearPendingBannerGeneration(data.bannerId);
      }

      setResult({
        imageUrl: editedImageUrl,
        bannerId: data.bannerId ?? result.bannerId,
        bannerUrl: data.bannerUrl ?? result.bannerUrl,
        saved: data.saved !== false,
      });

      setEditSuccess(copy.status.editSuccess);
      setEditPrompt("");

      router.refresh();
    } catch (err) {
      if (progressTimerA) window.clearTimeout(progressTimerA);
      if (progressTimerB) window.clearTimeout(progressTimerB);
      if (progressTimerC) window.clearTimeout(progressTimerC);
      const message =
        err instanceof Error ? err.message : copy.errors.editFallback;
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
    <div
      className={`grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px] ${
        showFirstAccessTour ? "pb-[150px] sm:pb-0" : ""
      }`}
    >
      <form
        onSubmit={handleSubmit}
        className="rounded-[28px]  border-white/10 "
      >
        {!showFirstAccessTour ? (
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/50">
                {copy.briefingEyebrow}
              </p>
              <h2 className="text-[23px] font-semibold leading-tight text-white ">
                {copy.briefingTitle}
              </h2>
              <p className="mt-3 text-[13px] leading-6 text-gray-200">
                {copy.briefingDescription}
              </p>
            </div>

            <div className="px-1 py-1 text-left text-blue-400 md:min-w-[112px] md:text-right">
              <span className="block text-[10px] uppercase tracking-[0.18em] text-white/40 text-center">
                {copy.briefingProgress}
              </span>
              <strong className="mt-1 block text-xl font-semibold text-center">
                {completion}%
              </strong>
            </div>
          </div>
        ) : null}

        {showFirstAccessTour && (activeTourTarget === "mainText" || activeTourTarget === "djName") ? (
          <div
            ref={mainContentScrollAnchorRef}
            className="h-20 scroll-mt-0"
            aria-hidden="true"
          />
        ) : null}

        <div
          ref={detailsSectionRef}
          className={
            shouldShowMainSection || shouldShowEventSection
              ? "scroll-mt-28 transition"
              : "hidden"
          }
        >
          {shouldShowMainSection ? (
            <Section title={copy.mainSection}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div
                  ref={mainTextFieldRef}
                  className={getTourTargetClass("mainText")}
                >
                  <Field label={copy.mainTextLabel}>
                    <input
                      className={getInputClassForTour("mainText")}
                      placeholder={getTypedPlaceholder(
                        "mainText",
                        copy.mainTextPlaceholder,
                      )}
                      value={form.mainText}
                      onFocus={() => dismissTypingSuggestion("mainText")}
                      onClick={() => dismissTypingSuggestion("mainText")}
                      onChange={(e) => {
                        setForm((c) => ({ ...c, mainText: e.target.value }));
                        if (activeTourTarget === "mainText") setTourError("");
                      }}
                      required
                    />
                  </Field>
                </div>

                <div
                  ref={djNameFieldRef}
                  className={getTourTargetClass("djName")}
                >
                  <Field label={copy.djNameLabel}>
                    <input
                      className={getInputClassForTour("djName")}
                      placeholder={getTypedPlaceholder(
                        "djName",
                        copy.djNamePlaceholder,
                      )}
                      value={form.djName}
                      onFocus={() => dismissTypingSuggestion("djName")}
                      onClick={() => dismissTypingSuggestion("djName")}
                      onChange={(e) => {
                        setForm((c) => ({ ...c, djName: e.target.value }));
                        if (activeTourTarget === "djName") setTourError("");
                      }}
                      required
                    />
                  </Field>
                </div>
              </div>

              {!showFirstAccessTour ? (
                <Field label={copy.secondaryTextLabel}>
                  <input
                    className={inputClassName}
                    placeholder={getTypedPlaceholder(
                      "secondaryText",
                      copy.secondaryTextPlaceholder,
                    )}
                    value={form.secondaryText}
                    onFocus={() => dismissTypingSuggestion("secondaryText")}
                    onClick={() => dismissTypingSuggestion("secondaryText")}
                    onChange={(e) =>
                      setForm((c) => ({ ...c, secondaryText: e.target.value }))
                    }
                  />
                </Field>
              ) : null}
            </Section>
          ) : null}

          {showFirstAccessTour && (activeTourTarget === "eventDate" || activeTourTarget === "eventLocation") ? (
            <div
              ref={eventInfoScrollAnchorRef}
              className="h-20 scroll-mt-0"
              aria-hidden="true"
            />
          ) : null}

          {shouldShowEventSection ? (
            <Section title={copy.eventSection}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div
                  ref={eventDateFieldRef}
                  className={getTourTargetClass("eventDate")}
                >
                  <Field label={copy.eventDateLabel}>
                    <input
                      className={getInputClassForTour("eventDate")}
                      placeholder={getTypedPlaceholder(
                        "eventDate",
                        copy.eventDatePlaceholder,
                      )}
                      value={form.eventDate}
                      onFocus={() => dismissTypingSuggestion("eventDate")}
                      onClick={() => dismissTypingSuggestion("eventDate")}
                      onChange={(e) => {
                        setForm((c) => ({ ...c, eventDate: e.target.value }));
                        if (activeTourTarget === "eventDate") setTourError("");
                      }}
                      required
                    />
                  </Field>
                </div>

                <div
                  ref={eventLocationFieldRef}
                  className={getTourTargetClass("eventLocation")}
                >
                  <Field label={copy.eventLocationLabel}>
                    <input
                      className={getInputClassForTour("eventLocation")}
                      placeholder={getTypedPlaceholder(
                        "eventLocation",
                        copy.eventLocationPlaceholder,
                      )}
                      value={form.eventLocation}
                      onFocus={() => dismissTypingSuggestion("eventLocation")}
                      onClick={() => dismissTypingSuggestion("eventLocation")}
                      onChange={(e) => {
                        setForm((c) => ({
                          ...c,
                          eventLocation: e.target.value,
                        }));
                        if (activeTourTarget === "eventLocation") {
                          setTourError("");
                        }
                      }}
                      required
                    />
                  </Field>
                </div>
              </div>
            </Section>
          ) : null}
        </div>

        <div
          ref={visualSectionRef}
          className={
            shouldShowVisualSection
              ? `${
                  showFirstAccessTour && activeTourTarget === "photo"
                    ? "scroll-mt-16"
                    : "scroll-mt-28"
                } transition`
              : "hidden"
          }
        >
          <Section title={copy.visualSection}>
            {shouldShowTourTarget("visual") ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="lg:col-span-3">
                  <Field label={copy.visualStyleLabel}>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => scrollStyleCarousel("left")}
                        className="absolute left-0 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/70 text-lg font-semibold text-white shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur transition hover:bg-black/90 md:inline-flex"
                        aria-label={copy.previousStyles}
                      >
                        ‹
                      </button>

                      <div
                        ref={styleCarouselRef}
                        onWheel={(event) => {
                          if (
                            Math.abs(event.deltaY) <= Math.abs(event.deltaX)
                          ) {
                            return;
                          }
                          event.currentTarget.scrollLeft += event.deltaY;
                        }}
                        className="-mx-1 overflow-x-auto scroll-smooth pb-2 pl-1 pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:px-12"
                      >
                        <div className="flex min-w-max gap-3 pr-1">
                          {stylePresets.map((preset) => {
                            const locked =
                              shouldLockProStyles &&
                              isBannerStyleProOnly(preset.value);
                            const selected =
                              !locked && form.stylePreset === preset.value;

                            return (
                              <button
                                key={preset.value}
                                type="button"
                                onClick={() => {
                                  if (locked) {
                                    router.push("/dashboard/billing");
                                    return;
                                  }

                                  setForm((current) => ({
                                    ...current,
                                    stylePreset: preset.value,
                                  }));
                                  if (activeTourTarget === "visual") {
                                    setTourError("");
                                  }
                                }}
                                className={`group relative min-w-[250px] max-w-[250px] overflow-hidden rounded-[24px] border text-left transition sm:min-w-[285px] sm:max-w-[285px] ${
                                  selected
                                    ? "border-sky-300/45 bg-sky-300/10 shadow-[0_0_0_1px_rgba(125,211,252,0.18)]"
                                    : locked
                                      ? "cursor-pointer border-amber-300/35 bg-white/[0.045] hover:border-amber-300/55 hover:bg-amber-300/[0.06]"
                                      : "border-white/10 bg-white/[0.045] hover:border-white/20 hover:bg-white/[0.07]"
                                }`}
                                aria-label={
                                  locked
                                    ? `${preset.label} ${copy.availableFromPro}. ${copy.upgrade}.`
                                    : `${copy.tapToChoose}: ${preset.label}`
                                }
                              >
                                <div className="relative aspect-[4/5] overflow-hidden">
                                  <img
                                    src={preset.image}
                                    alt={preset.label}
                                    className={`h-full w-full object-cover transition duration-500 ${
                                      locked
                                        ? "brightness-[0.82]"
                                        : "group-hover:scale-[1.03]"
                                    }`}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.12),transparent_34%)]" />

                                  <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-3">
                                    <span
                                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] backdrop-blur ${
                                        selected
                                          ? "bg-sky-300/18 text-sky-100"
                                          : locked
                                            ? "bg-amber-200/18 text-amber-100"
                                            : "bg-black/35 text-white/80"
                                      }`}
                                    >
                                      {locked
                                        ? "Pro+"
                                        : copy.badges[preset.badge]}
                                    </span>

                                    {selected ? (
                                      <span className="rounded-full bg-sky-300/18 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100 backdrop-blur">
                                        {copy.selected}
                                      </span>
                                    ) : locked ? (
                                      <span className="px-1 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100">
                                        {copy.proOnly}
                                      </span>
                                    ) : null}
                                  </div>

                                  <div className="absolute inset-x-0 bottom-0 p-4">
                                    <p className="text-base font-semibold text-white">
                                      {preset.label}
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-white/70">
                                      {copy.styleDescriptions[preset.value]}
                                    </p>
                                  </div>
                                </div>

                                <div className="relative z-10 flex items-center justify-between gap-3 p-4">
                                  <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs ${
                                      selected
                                        ? "border border-sky-300/30 bg-sky-300/10 text-sky-100"
                                        : locked
                                          ? "text-amber-100/90"
                                          : "text-white/60"
                                    }`}
                                  >
                                    {locked
                                      ? copy.availableFromPro
                                      : selected
                                        ? copy.activeStyle
                                        : copy.tapToChoose}
                                  </span>

                                  {locked ? (
                                    <span className="text-xs font-medium text-amber-100/90">
                                      {copy.upgrade}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-white/45">
                                      {copy.slideMore}
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => scrollStyleCarousel("right")}
                        className="absolute right-0 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/70 text-lg font-semibold text-white shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur transition hover:bg-black/90 md:inline-flex"
                        aria-label={copy.nextStyles}
                      >
                        ›
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs leading-5 text-white/55">
                      <p>{copy.carouselHint}</p>
                      {shouldLockProStyles ? <p>{copy.proHint}</p> : null}
                    </div>
                  </Field>
                </div>

                {!showFirstAccessTour ? (
                  <>
                    <Field label={copy.formatLabel}>
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

                    <Field label={copy.qualityLabel}>
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
                          const enabled = allowedQualities.includes(
                            quality.value,
                          );
                          return (
                            <option
                              key={quality.value}
                              value={quality.value}
                              disabled={!enabled}
                              className="bg-black text-white"
                            >
                              {copy.qualityLabels[quality.value]}
                              {enabled ? "" : copy.unavailablePlan}
                            </option>
                          );
                        })}
                      </select>
                    </Field>
                  </>
                ) : null}
              </div>
            ) : null}

            {shouldShowTourTarget("photo") ? (
              <div ref={photoFieldRef} className={getTourTargetClass("photo")}>
                {showFirstAccessTour && activeTourTarget === "photo" ? (
                  <div className="mb-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs leading-5 text-white/65">
                    {copy.photoHelper}
                  </div>
                ) : null}

                <Field label={copy.photoLabel}>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className={`${getInputClassForTour("photo")} file:mr-4 file:rounded-xl file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-base file:font-medium sm:file:text-sm file:text-white hover:file:bg-white/15`}
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setReferenceFile(file);
                      if (file) {
                        setConnectedProfessionalImageUrl(null);
                      }
                      if ((file || connectedProfessionalImageUrl) && activeTourTarget === "photo") {
                        setTourError("");
                      }
                    }}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/60">
                    <span>
                      {connectedProfessionalImageUrl && !referenceFile
                        ? copy.importedProfessionalPhotoHelp
                        : copy.photoHelper}
                    </span>
                    <strong className="text-white/85">
                      {referenceFile
                        ? referenceFile.name
                        : connectedProfessionalImageUrl
                          ? copy.importedProfessionalPhoto
                          : copy.noFileSelected}
                    </strong>
                  </div>

                  {connectedProfessionalImageUrl && !referenceFile ? (
                    <div className="mt-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs leading-5 text-emerald-100">
                      {copy.importedProfessionalPhotoHelp}
                    </div>
                  ) : null}

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    {connectedProfessionalImageUrl ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={connectedProfessionalImageUrl}
                          alt={copy.importedProfessionalPhoto}
                          className="h-11 w-11 rounded-xl object-cover"
                        />
                        <span className="text-xs text-white/65">
                          {copy.importedProfessionalPhoto}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-white/45">
                        {copy.createProfessionalPhotoCta}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={openProfessionalImageModal}
                      className="text-xs font-medium text-sky-200 transition hover:text-sky-100"
                    >
                      {copy.createProfessionalPhotoCta}
                    </button>
                  </div>
                </Field>
              </div>
            ) : null}
          </Section>
        </div>

        {!showFirstAccessTour ? (
          <div className="mt-4 flex flex-col gap-3 rounded-[22px] border border-white/10 bg-gradient-to-br from-blue-500/10 to-cyan-400/5 p-4 md:flex-row md:items-start md:justify-between">
            <div>
              <span className="mb-2 inline-flex rounded-full bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-white/75">
                {copy.professionalStructure}
              </span>
              <p className="text-sm leading-6 text-white/80">
                {copy.professionalStructureText}
              </p>
            </div>

            {remainingCredits !== null ? (
              <div className="shrink-0 rounded-xl bg-white/8 px-3 py-2 text-sm text-white">
                {copy.remainingCredits}: <strong>{remainingCredits}</strong>
              </div>
            ) : null}
          </div>
        ) : null}

        {shouldShowCreditUpgrade ? (
          <CreditUpgradeCard currentPlan={currentPlan} locale={locale} />
        ) : null}

        <div
          ref={generateButtonContainerRef}
          className={`${
            showFirstAccessTour && activeTourTarget === "generate"
              ? "pt-8 sm:pt-0"
              : ""
          }`}
        >
          <button
            ref={generateButtonRef}
            type="submit"
            onClick={() => {
              if (!displayLoading && !hasNoCredits) {
                window.setTimeout(scrollToPreview, 80);
              }
            }}
            disabled={displayLoading || hasNoCredits}
            className={`mt-5 min-h-[52px] w-full scroll-mt-28 items-center justify-center rounded-2xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70 ${
              showFirstAccessTour && activeTourTarget !== "generate"
                ? "hidden"
                : "inline-flex"
            } ${
              activeTourTarget === "generate"
                ? "shadow-[0_0_0_1px_rgba(125,211,252,0.18)]"
                : ""
            }`}
          >
            {hasNoCredits
              ? copy.noCreditsButton
              : loading
                ? copy.generatingButton
                : editLoading
                  ? copy.editingButton
                  : copy.generateButton}
          </button>
        </div>

        {statusText ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85">
            {statusText}
          </div>
        ) : null}

        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
      </form>

      <aside ref={previewRef} className="rounded-[28px] p-5 xl:sticky xl:top-5">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/50">
              {copy.previewEyebrow}
            </p>
            <h3 className="text-lg font-semibold leading-snug text-white">
              {displayLoading
                ? loadingTexts.title
                : result
                  ? copy.previewReadyTitle
                  : copy.previewEmptyTitle}
            </h3>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/45">
              {copy.selectedFormat}: {previewFormatLabel}
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
                ? copy.completedBadge
                : copy.waitingBadge}
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
                      ? copy.applyingChanges
                      : copy.composingLayers}
                  </span>
                  <span>
                    {loadingMode === "edit"
                      ? copy.generatingNewVersion
                      : copy.processingVisual}
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
                alt={copy.generatedAlt}
              />
            </div>

            <div className="grid gap-2">
              <p className="text-xl font-semibold text-white">
                {result.saved === false
                  ? copy.testPreviewTitle
                  : copy.successTitle}
              </p>
              <p className="text-sm leading-6 text-white/70">
                {result.saved === false
                  ? copy.testPreviewDescription
                  : copy.successDescription}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={result.imageUrl}
                download
                className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-white/10 bg-white/8 px-4 text-sm font-medium text-white transition hover:bg-white/12"
              >
                {copy.downloadImage}
              </a>

              <a
                href={result.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-sky-300/15 bg-sky-300/8 px-4 text-sm font-medium text-white transition hover:bg-sky-300/12"
              >
                {copy.openImage}
              </a>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {copy.editTitle}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/60">
                    {copy.editDescription}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-amber-300/15 bg-amber-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-amber-100">
                  {copy.oneCredit}
                </span>
              </div>

              <textarea
                className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-base text-white outline-none transition focus:border-sky-400/50 focus:ring-4 focus:ring-sky-400/10 placeholder:text-white/35 sm:text-sm"
                placeholder={copy.editPlaceholder}
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
              />

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-white/55">{copy.editHelper}</p>

                <button
                  type="button"
                  onClick={handleEdit}
                  disabled={displayLoading || hasNoCredits}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-sky-300/20 bg-sky-300/10 px-4 text-sm font-medium text-white transition hover:bg-sky-300/15 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {hasNoCredits
                    ? copy.noCreditsButton
                    : editLoading
                      ? copy.editingButtonShort
                      : copy.editButton}
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
                    {copy.smartPreview}
                  </p>
                  <p className="max-w-sm text-sm leading-6 text-white/70">
                    {copy.smartPreviewDescription}
                  </p>
                  <div className="mx-auto grid w-full max-w-[220px] gap-2">
                    <span className="h-2 overflow-hidden rounded-full bg-white/10">
                      <span className="block h-full w-1/2 rounded-full bg-gradient-to-r from-sky-300 via-violet-300 to-cyan-200 animate-pulse" />
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                      {copy.awaitingGeneration}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {showFirstAccessTour ? (
        <FirstAccessTourPopup
          copy={copy}
          currentStep={tourStepIndex}
          totalSteps={firstAccessTourSteps.length}
          title={firstAccessTourSteps[tourStepIndex]?.title ?? ""}
          description={firstAccessTourSteps[tourStepIndex]?.description ?? ""}
          error={tourError}
          canContinue={Boolean(tourStepCompletion[tourStepIndex])}
          onBack={() => goToTourStep(Math.max(tourStepIndex - 1, 0))}
          onNext={advanceFirstAccessTour}
          onClose={closeFirstAccessTour}
        />
      ) : null}

      {showProfessionalImageModal ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/82 p-0 backdrop-blur-md sm:items-center sm:p-6">
          <div className="flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-[28px] border border-white/10 bg-[#07111f] shadow-[0_-24px_80px_rgba(0,0,0,0.48)] sm:max-w-5xl sm:rounded-[30px] sm:shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
            <div className="shrink-0 border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_34%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_28%)] px-4 py-4 sm:px-6 sm:py-5">
              <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-white/18 sm:hidden" />

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-200/75 sm:text-[11px]">
                    {copy.createProfessionalPhotoCta}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold leading-tight text-white sm:text-2xl">
                    {copy.professionalPhotoModalTitle}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-white/60 sm:text-sm sm:leading-6">
                    {copy.professionalPhotoModalDescription}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeProfessionalImageModal}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-lg text-white/75 transition hover:bg-white/[0.1] hover:text-white"
                  aria-label={copy.professionalPhotoCloseButton}
                >
                  ×
                </button>
              </div>

              <div className="mt-4 hidden gap-2 sm:grid sm:grid-cols-3">
                {[
                  copy.professionalPhotoStepUpload,
                  copy.professionalPhotoStepGenerate,
                  copy.professionalPhotoStepApply,
                ].map((step) => (
                  <div
                    key={step}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/75"
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:p-6">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                <div className="grid gap-4">
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-4 sm:rounded-[26px] sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white sm:text-base">
                          {copy.professionalPhotoSelectLabel}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-white/50 sm:text-sm sm:leading-6">
                          {copy.professionalPhotoSelectHelper}
                        </p>
                      </div>

                      <span className="hidden rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-100 sm:inline-flex">
                        AI
                      </span>
                    </div>

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="mt-4 block w-full rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-3 text-base text-white outline-none file:mr-3 file:rounded-xl file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-white/[0.16] sm:text-sm"
                      onChange={handleProfessionalImageFileChange}
                    />

                    {professionalImageSourceFile ? (
                      <p className="mt-3 truncate text-xs text-white/45">
                        {professionalImageSourceFile.name}
                      </p>
                    ) : null}

                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
                            {copy.professionalPhotoDirectionTitle}
                          </p>
                        </div>

                        <select
                          value={professionalPhotoDirection}
                          onChange={(event) =>
                            setProfessionalPhotoDirection(
                              event.target.value as ProfessionalPhotoDirectionId,
                            )
                          }
                          className="min-h-[42px] w-full rounded-2xl border border-white/10 bg-[#08101d] px-3 text-sm font-medium text-white outline-none transition focus:border-cyan-300/35 focus:ring-4 focus:ring-cyan-300/10 sm:w-[260px]"
                        >
                          {copy.professionalPhotoDirections.map((item) => (
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
                        {
                          copy.professionalPhotoDirections.find(
                            (item) => item.id === professionalPhotoDirection,
                          )?.description
                        }
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateProfessionalImage}
                      disabled={professionalImageLoading || !professionalImageSourcePreview}
                      className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-4 text-sm font-bold text-slate-950 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {professionalImageLoading
                        ? copy.professionalPhotoGeneratingButton
                        : copy.professionalPhotoGenerateButton}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="rounded-[20px] border border-white/10 bg-[#08101d] p-2.5 sm:rounded-[24px] sm:p-3">
                      <p className="mb-2 truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50 sm:text-xs">
                        {copy.professionalPhotoSourceTitle}
                      </p>
                      <div className="aspect-[4/5] overflow-hidden rounded-[16px] border border-white/10 bg-white/[0.03] sm:rounded-[20px]">
                        {professionalImageSourcePreview ? (
                          <img
                            src={professionalImageSourcePreview}
                            alt={copy.professionalPhotoSourceTitle}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="grid h-full place-items-center px-3 text-center text-[11px] leading-4 text-white/35 sm:px-5 sm:text-sm sm:leading-6">
                            {copy.professionalPhotoChooseButton}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-[20px] border border-white/10 bg-[#08101d] p-2.5 sm:rounded-[24px] sm:p-3">
                      <p className="mb-2 truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50 sm:text-xs">
                        {copy.professionalPhotoResultTitle}
                      </p>
                      <div className="aspect-[4/5] overflow-hidden rounded-[16px] border border-white/10 bg-white/[0.03] sm:rounded-[20px]">
                        {professionalImageResultUrl ? (
                          <img
                            src={professionalImageResultUrl}
                            alt={copy.professionalPhotoResultTitle}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="grid h-full place-items-center px-3 text-center text-[11px] leading-4 text-white/35 sm:px-5 sm:text-sm sm:leading-6">
                            {professionalImageLoading
                              ? copy.professionalPhotoGeneratingButton
                              : copy.professionalPhotoReadyTitle}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {professionalImageError ? (
                    <p className="rounded-2xl border border-rose-300/15 bg-rose-300/10 px-4 py-3 text-sm text-rose-200">
                      {professionalImageError}
                    </p>
                  ) : null}
                </div>

                <div className="hidden flex-col gap-4 xl:flex">
                  <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
                    <span className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100">
                      {copy.professionalPhotoReadyTitle}
                    </span>
                    <p className="mt-3 text-sm leading-6 text-white/68">
                      {copy.professionalPhotoUseHint}
                    </p>
                  </div>

                  <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-sm font-semibold text-white">
                      {copy.professionalStructure}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/60">
                      {copy.professionalStructureText}
                    </p>
                    <div className="mt-4 rounded-2xl border border-white/10 bg-[#08101d] p-4 text-sm leading-6 text-white/52">
                      {copy.professionalPhotoGenerateHint}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-white/10 bg-[#07111f]/98 px-4 py-3 backdrop-blur sm:px-6 sm:py-4">
              {professionalImageResultUrl ? (
                <div className="grid gap-2 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={handleUseProfessionalImage}
                    className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-4 text-sm font-bold text-slate-950 transition hover:opacity-95"
                  >
                    {copy.professionalPhotoUseButton}
                  </button>

                  <a
                    href={professionalImageResultUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-[46px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-white transition hover:bg-white/[0.08]"
                  >
                    {copy.professionalPhotoDownloadButton}
                  </a>

                  <button
                    type="button"
                    onClick={closeProfessionalImageModal}
                    className="inline-flex min-h-[46px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white/85 transition hover:bg-white/[0.08]"
                  >
                    {copy.professionalPhotoCloseButton}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={closeProfessionalImageModal}
                  className="inline-flex min-h-[46px] w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white/85 transition hover:bg-white/[0.08]"
                >
                  {copy.professionalPhotoCloseButton}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FirstAccessTourPopup({
  copy,
  currentStep,
  totalSteps,
  title,
  description,
  error,
  canContinue,
  onBack,
  onNext,
  onClose,
}: {
  copy: (typeof newBannerFormCopy)[NewBannerFormLocale];
  currentStep: number;
  totalSteps: number;
  title: string;
  description: string;
  error: string;
  canContinue: boolean;
  onBack: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const isLastStep = currentStep >= totalSteps - 1;

  return (
    <div className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.5rem)] z-50 mx-auto max-h-[34dvh] max-w-md overflow-y-auto rounded-[18px] border border-sky-300/12 bg-[#08111f]/96 p-3 text-white shadow-[0_16px_55px_rgba(0,0,0,0.46)] backdrop-blur-xl sm:inset-x-4 sm:bottom-4 sm:max-h-[52dvh] sm:rounded-[26px] sm:p-5 md:bottom-6 md:left-auto md:right-6 md:mx-0 md:max-h-none md:rounded-[28px]">
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0">
          <span className="inline-flex rounded-full border border-sky-200/15 bg-sky-200/8 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-sky-100 sm:px-3 sm:py-1 sm:text-[10px]">
            {copy.tourStepLabel} {currentStep + 1}/{totalSteps}
          </span>
          <h3 className="mt-2 text-sm font-semibold leading-tight text-white sm:mt-3 sm:text-lg">
            {title}
          </h3>
          <p className="mt-1.5 text-[11px] leading-4 text-white/68 sm:mt-2 sm:text-sm sm:leading-6">
            {description}
          </p>
          {error ? (
            <p className="mt-2 rounded-xl border border-amber-300/20 bg-amber-300/10 px-2.5 py-1.5 text-[11px] leading-4 text-amber-100 sm:mt-3 sm:rounded-2xl sm:px-3 sm:py-2 sm:text-xs sm:leading-5">
              {error}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-sm leading-none text-white/70 transition hover:bg-white/[0.1] hover:text-white sm:h-9 sm:w-9 sm:text-lg"
          aria-label={copy.tourSkip}
        >
          ×
        </button>
      </div>

      <div className="mt-2.5 flex items-center justify-center gap-1 sm:mt-5 sm:gap-1.5">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <span
            key={index}
            className={`h-1 rounded-full transition-all sm:h-1.5 ${
              index === currentStep ? "w-5 bg-sky-300 sm:w-6" : "w-1 bg-white/20 sm:w-1.5"
            }`}
          />
        ))}
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={currentStep === 0}
          className="inline-flex min-h-[36px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] px-2.5 text-xs font-medium text-white transition hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-[42px] sm:rounded-2xl sm:px-3 sm:text-sm"
        >
          {copy.tourBack}
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={isLastStep && !canContinue}
          className={`inline-flex min-h-[36px] items-center justify-center rounded-xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-2.5 text-xs font-bold text-slate-950 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-55 sm:min-h-[42px] sm:rounded-2xl sm:px-3 sm:text-sm ${
            canContinue ? "" : "ring-1 ring-amber-200/25 sm:ring-2"
          }`}
        >
          {isLastStep ? copy.tourDone : copy.tourNext}
        </button>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-2 w-full text-center text-[11px] font-medium text-white/42 transition hover:text-white/75 sm:mt-3 sm:text-xs"
      >
        {copy.tourSkip}
      </button>
    </div>
  );
}

function CreditUpgradeCard({
  currentPlan,
  locale,
}: {
  currentPlan: SubscriptionPlan;
  locale: NewBannerFormLocale;
}) {
  const copy = newBannerFormCopy[locale] ?? newBannerFormCopy.en;
  const isFreePlan = currentPlan === "FREE";

  return (
    <div className="mt-5 overflow-hidden rounded-[26px] border border-amber-200/20 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.14),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <span className="inline-flex rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-100">
            {copy.upgradeCard.label}
          </span>
          <h3 className="mt-3 text-lg font-semibold leading-tight text-white">
            {copy.upgradeCard.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-white/68">
            {copy.upgradeCard.description}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col">
          <a
            href="/dashboard/billing"
            className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-gradient-to-r from-amber-200 via-sky-200 to-violet-200 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95"
          >
            {copy.upgradeCard.button}
          </a>
          <span className="text-center text-[11px] leading-5 text-white/50">
            {isFreePlan ? copy.upgradeCard.freeHelp : copy.upgradeCard.paidHelp}
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
