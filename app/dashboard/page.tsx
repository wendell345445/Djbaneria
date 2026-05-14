import Link from "next/link";
import {
  BannerStatus,
  MotionRenderStatus,
  ProfessionalImageJobStatus,
  SeedanceVideoStatus,
  SubscriptionPlan,
  SubscriptionStatus,
  UsageEventType,
} from "@/generated/prisma/enums";

import { isAdminEmail } from "@/lib/admin";
import { normalizeLocale, type AppLocale } from "@/lib/i18n";
import {
  buildBillingSummary,
  getBillingPeriodRange,
  hasCreditCyclePaymentConfirmation,
  requiresCreditCyclePaymentConfirmation,
} from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { requireCurrentWorkspace } from "@/lib/workspace";

type DashboardAction = {
  title: string;
  description: string;
  cta: string;
  href: string;
  badge: string;
  icon: string;
  featured?: boolean;
};

type Shortcut = {
  title: string;
  href: string;
  icon: string;
};

type DashboardCopy = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: string;
    primaryHref: string;
    secondaryCta: string;
    secondaryHref: string;
  };
  plan: {
    currentPlan: string;
    creditsLeft: string;
    usedThisCycle: string;
    usage: string;
    unlimited: string;
    admin: string;
    status: string;
    upgradeTitle: string;
    upgradeText: string;
    upgradeCta: string;
    costTitle: string;
    costFlyer: string;
    costImage: string;
    costAiVideo: string;
    costRemotion10: string;
    costRemotion15: string;
  };
  metrics: {
    flyers: string;
    videos: string;
    images: string;
    active: string;
    helperFlyers: string;
    helperVideos: string;
    helperImages: string;
    helperActive: string;
  };
  actions: {
    title: string;
    description: string;
    items: DashboardAction[];
  };
  work: {
    title: string;
    readyTitle: string;
    readyText: string;
    pendingTitle: string;
    pendingText: string;
    pendingFlyers: string;
    pendingVideos: string;
    viewFlyers: string;
    viewVideos: string;
  };
  recent: {
    title: string;
    emptyTitle: string;
    emptyText: string;
    flyerLabel: string;
    videoLabel: string;
    viewAll: string;
  };
  shortcuts: {
    title: string;
    items: Shortcut[];
  };
  recommendation: {
    title: string;
    text: string;
    cta: string;
  };
  adminNotice: {
    title: string;
    text: string;
  };
  status: Record<SubscriptionStatus, string>;
  plans: Record<SubscriptionPlan, string>;
};

const DASHBOARD_COPY: Record<AppLocale, DashboardCopy> = {
  "pt-BR": {
    hero: {
      eyebrow: "Painel de criação",
      title: "Seu estúdio premium para flyers, vídeos e fotos de DJ.",
      description:
        "Crie artes profissionais, transforme flyers em vídeos animados e organize tudo em um fluxo rápido, visual e pronto para campanhas.",
      primaryCta: "Criar novo flyer",
      primaryHref: "/dashboard/banners/new",
      secondaryCta: "Animar flyer",
      secondaryHref: "/dashboard/flyer-animado",
    },
    plan: {
      currentPlan: "Plano atual",
      creditsLeft: "Créditos disponíveis",
      usedThisCycle: "Usados no ciclo",
      usage: "Uso do ciclo",
      unlimited: "Ilimitado",
      admin: "Admin",
      status: "Status",
      upgradeTitle: "Créditos quase acabando",
      upgradeText: "Faça upgrade para continuar criando sem travar seu fluxo de produção.",
      upgradeCta: "Ver planos",
      costTitle: "Custos por criação",
      costFlyer: "Flyer: 1 crédito",
      costImage: "Imagem profissional: 1 crédito",
      costAiVideo: "Vídeo com AI: 5–12 créditos",
      costRemotion10: "Remotion 10s: 2 créditos",
      costRemotion15: "Remotion 15s: 3 créditos",
    },
    metrics: {
      flyers: "Flyers",
      videos: "Vídeos",
      images: "Imagens",
      active: "Em andamento",
      helperFlyers: "artes criadas",
      helperVideos: "vídeos gerados",
      helperImages: "fotos profissionais",
      helperActive: "processos ativos",
    },
    actions: {
      title: "Comece pela ferramenta certa",
      description: "Atalhos principais para criar, animar e melhorar imagens sem procurar menus.",
      items: [
        {
          title: "Criar flyer",
          description: "Gere uma arte premium para evento, festa, lineup ou campanha.",
          cta: "Começar agora",
          href: "/dashboard/banners/new",
          badge: "1 crédito",
          icon: "✦",
          featured: true,
        },
        {
          title: "Gerar com AI",
          description: "Anime um flyer com IA e gere um vídeo pronto para Reels e Stories.",
          cta: "Animar com AI",
          href: "/dashboard/flyer-animado",
          badge: "5–12 créditos",
          icon: "▶",
        },
        {
          title: "Remotion",
          description: "Crie uma animação com música, cortes e transições controladas.",
          cta: "Abrir Remotion",
          href: "/dashboard/remotion",
          badge: "2–3 créditos",
          icon: "▣",
        },
        {
          title: "Imagem profissional",
          description: "Transforme uma foto comum em imagem promocional para sua marca.",
          cta: "Melhorar foto",
          href: "/dashboard/imagem-profissional",
          badge: "1 crédito",
          icon: "◇",
        },
      ],
    },
    work: {
      title: "Status do estúdio",
      readyTitle: "Tudo pronto para criar",
      readyText: "Nenhuma criação está em processamento agora. Você pode iniciar um novo flyer ou animar uma arte pronta.",
      pendingTitle: "Criações em andamento",
      pendingText: "Alguns arquivos ainda estão sendo processados. Acompanhe na área correta para baixar quando finalizar.",
      pendingFlyers: "flyer em andamento",
      pendingVideos: "vídeo em andamento",
      viewFlyers: "Ver flyers",
      viewVideos: "Ver vídeos",
    },
    recent: {
      title: "Últimas criações",
      emptyTitle: "Nenhuma criação recente",
      emptyText: "Crie seu primeiro flyer ou vídeo para preencher esta área.",
      flyerLabel: "Flyer",
      videoLabel: "Vídeo",
      viewAll: "Ver tudo",
    },
    shortcuts: {
      title: "Navegação rápida",
      items: [
        { title: "Meus flyers", href: "/dashboard/banners", icon: "▣" },
        { title: "Meus vídeos", href: "/dashboard/meus-videos", icon: "▶" },
        { title: "Assinatura", href: "/dashboard/billing", icon: "◆" },
        { title: "Configurações", href: "/dashboard/settings", icon: "⚙" },
      ],
    },
    recommendation: {
      title: "Próximo passo recomendado",
      text: "Escolha o seu melhor flyer e gere uma versão animada. Vídeos curtos tendem a chamar mais atenção em Reels, Stories e anúncios.",
      cta: "Animar um flyer",
    },
    adminNotice: {
      title: "Modo admin ativo",
      text: "Esta conta pode testar flyers, vídeos e imagens sem limite de créditos.",
    },
    status: {
      TRIALING: "Teste ativo",
      ACTIVE: "Ativo",
      PAST_DUE: "Pagamento pendente",
      CANCELED: "Cancelado",
      EXPIRED: "Expirado",
    },
    plans: {
      FREE: "Free",
      PRO: "Pro",
      PROFESSIONAL: "Professional",
      STUDIO: "Studio",
    },
  },
  en: {
    hero: {
      eyebrow: "Creation dashboard",
      title: "Your premium studio for DJ flyers, videos and photos.",
      description:
        "Create professional artwork, turn flyers into animated videos and keep every visual organized in one fast production flow.",
      primaryCta: "Create new flyer",
      primaryHref: "/dashboard/banners/new",
      secondaryCta: "Animate flyer",
      secondaryHref: "/dashboard/flyer-animado",
    },
    plan: {
      currentPlan: "Current plan",
      creditsLeft: "Credits available",
      usedThisCycle: "Used this cycle",
      usage: "Cycle usage",
      unlimited: "Unlimited",
      admin: "Admin",
      status: "Status",
      upgradeTitle: "Credits are running low",
      upgradeText: "Upgrade to keep creating without interrupting your production flow.",
      upgradeCta: "View plans",
      costTitle: "Creation costs",
      costFlyer: "Flyer: 1 credit",
      costImage: "Professional image: 1 credit",
      costAiVideo: "AI video: 5–12 credits",
      costRemotion10: "Remotion 10s: 2 credits",
      costRemotion15: "Remotion 15s: 3 credits",
    },
    metrics: {
      flyers: "Flyers",
      videos: "Videos",
      images: "Images",
      active: "In progress",
      helperFlyers: "artworks created",
      helperVideos: "videos generated",
      helperImages: "professional photos",
      helperActive: "active jobs",
    },
    actions: {
      title: "Start with the right tool",
      description: "Core shortcuts to create, animate and improve images without hunting through menus.",
      items: [
        {
          title: "Create flyer",
          description: "Generate premium artwork for events, parties, lineups or campaigns.",
          cta: "Start now",
          href: "/dashboard/banners/new",
          badge: "1 credit",
          icon: "✦",
          featured: true,
        },
        {
          title: "Generate with AI",
          description: "Animate a flyer with AI and export a video ready for Reels and Stories.",
          cta: "Animate with AI",
          href: "/dashboard/flyer-animado",
          badge: "5–12 credits",
          icon: "▶",
        },
        {
          title: "Remotion",
          description: "Create an animation with music, cuts and controlled transitions.",
          cta: "Open Remotion",
          href: "/dashboard/remotion",
          badge: "2–3 credits",
          icon: "▣",
        },
        {
          title: "Professional image",
          description: "Turn a casual photo into a cleaner promo image for your brand.",
          cta: "Improve photo",
          href: "/dashboard/imagem-profissional",
          badge: "1 credit",
          icon: "◇",
        },
      ],
    },
    work: {
      title: "Studio status",
      readyTitle: "Ready to create",
      readyText: "No creation is processing right now. Start a new flyer or animate an existing artwork.",
      pendingTitle: "Creations in progress",
      pendingText: "Some files are still processing. Open the right area to download them when finished.",
      pendingFlyers: "flyer in progress",
      pendingVideos: "video in progress",
      viewFlyers: "View flyers",
      viewVideos: "View videos",
    },
    recent: {
      title: "Recent creations",
      emptyTitle: "No recent creations",
      emptyText: "Create your first flyer or video to fill this area.",
      flyerLabel: "Flyer",
      videoLabel: "Video",
      viewAll: "View all",
    },
    shortcuts: {
      title: "Quick navigation",
      items: [
        { title: "My flyers", href: "/dashboard/banners", icon: "▣" },
        { title: "My videos", href: "/dashboard/meus-videos", icon: "▶" },
        { title: "Subscription", href: "/dashboard/billing", icon: "◆" },
        { title: "Settings", href: "/dashboard/settings", icon: "⚙" },
      ],
    },
    recommendation: {
      title: "Recommended next step",
      text: "Pick your best flyer and generate an animated version. Short videos usually get more attention on Reels, Stories and ads.",
      cta: "Animate a flyer",
    },
    adminNotice: {
      title: "Admin mode active",
      text: "This account can test flyers, videos and images without credit limits.",
    },
    status: {
      TRIALING: "Trial active",
      ACTIVE: "Active",
      PAST_DUE: "Payment pending",
      CANCELED: "Canceled",
      EXPIRED: "Expired",
    },
    plans: {
      FREE: "Free",
      PRO: "Pro",
      PROFESSIONAL: "Professional",
      STUDIO: "Studio",
    },
  },
  es: {
    hero: {
      eyebrow: "Panel de creación",
      title: "Tu estudio premium para flyers, videos y fotos de DJ.",
      description:
        "Crea artes profesionales, transforma flyers en videos animados y organiza todo en un flujo rápido para campañas.",
      primaryCta: "Crear nuevo flyer",
      primaryHref: "/dashboard/banners/new",
      secondaryCta: "Animar flyer",
      secondaryHref: "/dashboard/flyer-animado",
    },
    plan: {
      currentPlan: "Plan actual",
      creditsLeft: "Créditos disponibles",
      usedThisCycle: "Usados en el ciclo",
      usage: "Uso del ciclo",
      unlimited: "Ilimitado",
      admin: "Admin",
      status: "Estado",
      upgradeTitle: "Tus créditos se están acabando",
      upgradeText: "Actualiza para seguir creando sin interrumpir tu flujo de producción.",
      upgradeCta: "Ver planes",
      costTitle: "Costos por creación",
      costFlyer: "Flyer: 1 crédito",
      costImage: "Imagen profesional: 1 crédito",
      costAiVideo: "Video con AI: 5–12 créditos",
      costRemotion10: "Remotion 10s: 2 créditos",
      costRemotion15: "Remotion 15s: 3 créditos",
    },
    metrics: {
      flyers: "Flyers",
      videos: "Videos",
      images: "Imágenes",
      active: "En progreso",
      helperFlyers: "artes creadas",
      helperVideos: "videos generados",
      helperImages: "fotos profesionales",
      helperActive: "procesos activos",
    },
    actions: {
      title: "Empieza con la herramienta correcta",
      description: "Accesos principales para crear, animar y mejorar imágenes sin buscar menús.",
      items: [
        {
          title: "Crear flyer",
          description: "Genera un arte premium para evento, fiesta, lineup o campaña.",
          cta: "Empezar ahora",
          href: "/dashboard/banners/new",
          badge: "1 crédito",
          icon: "✦",
          featured: true,
        },
        {
          title: "Generar con AI",
          description: "Anima un flyer con IA y exporta un video listo para Reels y Stories.",
          cta: "Animar con AI",
          href: "/dashboard/flyer-animado",
          badge: "5–12 créditos",
          icon: "▶",
        },
        {
          title: "Remotion",
          description: "Crea una animación con música, cortes y transiciones controladas.",
          cta: "Abrir Remotion",
          href: "/dashboard/remotion",
          badge: "2–3 créditos",
          icon: "▣",
        },
        {
          title: "Imagen profesional",
          description: "Convierte una foto común en una imagen promocional para tu marca.",
          cta: "Mejorar foto",
          href: "/dashboard/imagem-profissional",
          badge: "1 crédito",
          icon: "◇",
        },
      ],
    },
    work: {
      title: "Estado del estudio",
      readyTitle: "Todo listo para crear",
      readyText: "No hay ninguna creación procesándose ahora. Crea un nuevo flyer o anima un arte existente.",
      pendingTitle: "Creaciones en progreso",
      pendingText: "Algunos archivos siguen procesándose. Abre el área correcta para descargarlos al finalizar.",
      pendingFlyers: "flyer en progreso",
      pendingVideos: "video en progreso",
      viewFlyers: "Ver flyers",
      viewVideos: "Ver videos",
    },
    recent: {
      title: "Últimas creaciones",
      emptyTitle: "Sin creaciones recientes",
      emptyText: "Crea tu primer flyer o video para llenar esta área.",
      flyerLabel: "Flyer",
      videoLabel: "Video",
      viewAll: "Ver todo",
    },
    shortcuts: {
      title: "Navegación rápida",
      items: [
        { title: "Mis flyers", href: "/dashboard/banners", icon: "▣" },
        { title: "Mis videos", href: "/dashboard/meus-videos", icon: "▶" },
        { title: "Suscripción", href: "/dashboard/billing", icon: "◆" },
        { title: "Configuración", href: "/dashboard/settings", icon: "⚙" },
      ],
    },
    recommendation: {
      title: "Siguiente paso recomendado",
      text: "Elige tu mejor flyer y genera una versión animada. Los videos cortos suelen llamar más atención en Reels, Stories y anuncios.",
      cta: "Animar un flyer",
    },
    adminNotice: {
      title: "Modo admin activo",
      text: "Esta cuenta puede probar flyers, videos e imágenes sin límite de créditos.",
    },
    status: {
      TRIALING: "Prueba activa",
      ACTIVE: "Activo",
      PAST_DUE: "Pago pendiente",
      CANCELED: "Cancelado",
      EXPIRED: "Expirado",
    },
    plans: {
      FREE: "Free",
      PRO: "Pro",
      PROFESSIONAL: "Professional",
      STUDIO: "Studio",
    },
  },
};

export default async function DashboardPage() {
  const workspace = await requireCurrentWorkspace();
  const locale = normalizeLocale(workspace.user?.preferredLocale);
  const copy = DASHBOARD_COPY[locale];
  const now = new Date();

  const billingPeriod = getBillingPeriodRange({
    providerSubscriptionId: workspace.subscription?.providerSubscriptionId,
    currentPeriodStart: workspace.subscription?.currentPeriodStart,
    currentPeriodEnd: workspace.subscription?.currentPeriodEnd,
    now,
  });

  const currentPlan = workspace.subscription?.plan || SubscriptionPlan.FREE;
  const requiresPaymentConfirmation = requiresCreditCyclePaymentConfirmation({
    plan: currentPlan,
    providerSubscriptionId: workspace.subscription?.providerSubscriptionId,
    currentPeriodStart: workspace.subscription?.currentPeriodStart,
    currentPeriodEnd: workspace.subscription?.currentPeriodEnd,
  });

  const visibleBannerWhere = {
    workspaceId: workspace.id,
    modelName: { not: "user-upload-remotion" },
  };

  const [
    bannerCount,
    seedanceVideoCount,
    remotionVideoCount,
    professionalImageCount,
    pendingBannerCount,
    pendingSeedanceVideoCount,
    pendingRemotionVideoCount,
    latestBanners,
    latestSeedanceVideos,
    latestRemotionVideos,
    usageEvents,
  ] = await Promise.all([
    prisma.banner.count({ where: visibleBannerWhere }),
    prisma.seedanceVideo.count({
      where: {
        workspaceId: workspace.id,
        status: SeedanceVideoStatus.COMPLETED,
        outputVideoUrl: { not: null },
      },
    }),
    prisma.bannerMotion.count({
      where: {
        workspaceId: workspace.id,
        status: MotionRenderStatus.COMPLETED,
        outputVideoUrl: { not: null },
      },
    }),
    prisma.professionalImageJob.count({
      where: {
        workspaceId: workspace.id,
        status: ProfessionalImageJobStatus.COMPLETED,
      },
    }),
    prisma.banner.count({
      where: {
        ...visibleBannerWhere,
        status: BannerStatus.PENDING,
      },
    }),
    prisma.seedanceVideo.count({
      where: {
        workspaceId: workspace.id,
        status: { in: [SeedanceVideoStatus.PENDING, SeedanceVideoStatus.RENDERING] },
      },
    }),
    prisma.bannerMotion.count({
      where: {
        workspaceId: workspace.id,
        status: { in: [MotionRenderStatus.PENDING, MotionRenderStatus.RENDERING] },
      },
    }),
    prisma.banner.findMany({
      where: {
        ...visibleBannerWhere,
        status: BannerStatus.COMPLETED,
      },
      orderBy: { createdAt: "desc" },
      take: 2,
      select: {
        id: true,
        title: true,
        createdAt: true,
        outputImageUrl: true,
      },
    }),
    prisma.seedanceVideo.findMany({
      where: {
        workspaceId: workspace.id,
        status: SeedanceVideoStatus.COMPLETED,
        outputVideoUrl: { not: null },
      },
      orderBy: { createdAt: "desc" },
      take: 2,
      select: {
        id: true,
        createdAt: true,
        outputVideoUrl: true,
        resolution: true,
      },
    }),
    prisma.bannerMotion.findMany({
      where: {
        workspaceId: workspace.id,
        status: MotionRenderStatus.COMPLETED,
        outputVideoUrl: { not: null },
      },
      orderBy: { createdAt: "desc" },
      take: 2,
      select: {
        id: true,
        createdAt: true,
        durationSeconds: true,
        outputVideoUrl: true,
      },
    }),
    prisma.usageEvent.findMany({
      where: {
        workspaceId: workspace.id,
        createdAt: { gte: billingPeriod.start, lt: billingPeriod.end },
        type: {
          in: [
            UsageEventType.BANNER_GENERATION,
            UsageEventType.BANNER_EDIT,
            UsageEventType.BANNER_VARIATION,
            UsageEventType.BANNER_MOTION_RENDER,
          ],
        },
      },
      select: {
        units: true,
        createdAt: true,
        metadata: true,
      },
    }),
  ]);

  const summary = buildBillingSummary({
    plan: currentPlan,
    status: workspace.subscription?.status || SubscriptionStatus.TRIALING,
    usageEvents,
    requiresPaymentConfirmation,
    creditCyclePaymentConfirmed: hasCreditCyclePaymentConfirmation(usageEvents),
  });

  const isAdmin = isAdminEmail(workspace.user?.email);
  const usedCredits = Number(summary.usedThisMonth || 0);
  const remainingCredits = Number(summary.remainingCredits || 0);
  const creditLimit = Math.max(
    Number(summary.monthlyLimit || 0),
    usedCredits + remainingCredits,
  );
  const usagePercent = isAdmin
    ? 100
    : creditLimit > 0
      ? Math.min(100, Math.round((usedCredits / creditLimit) * 100))
      : 0;

  const planLabel = isAdmin
    ? `${getPlanDisplayName(summary.plan, copy)} ${copy.plan.admin}`
    : getPlanDisplayName(summary.plan, copy);
  const remainingLabel = isAdmin ? copy.plan.unlimited : String(remainingCredits);
  const usedLabel = isAdmin ? `${usedCredits} / ∞` : `${usedCredits} / ${creditLimit}`;
  const videoCount = seedanceVideoCount + remotionVideoCount;
  const pendingVideoCount = pendingSeedanceVideoCount + pendingRemotionVideoCount;
  const pendingTotal = pendingBannerCount + pendingVideoCount;
  const lowCredits = !isAdmin && remainingCredits <= 3;

  const latestItems = [
    ...latestBanners.map((banner) => ({
      id: banner.id,
      title: banner.title,
      label: copy.recent.flyerLabel,
      href: `/dashboard/banners/${banner.id}`,
      createdAt: banner.createdAt,
      mediaUrl: banner.outputImageUrl,
      kind: "image" as const,
    })),
    ...latestSeedanceVideos.map((video) => ({
      id: video.id,
      title: `AI video · ${video.resolution}`,
      label: copy.recent.videoLabel,
      href: "/dashboard/meus-videos",
      createdAt: video.createdAt,
      mediaUrl: video.outputVideoUrl,
      kind: "video" as const,
    })),
    ...latestRemotionVideos.map((video) => ({
      id: video.id,
      title: `Remotion · ${video.durationSeconds}s`,
      label: copy.recent.videoLabel,
      href: "/dashboard/meus-videos",
      createdAt: video.createdAt,
      mediaUrl: video.outputVideoUrl,
      kind: "video" as const,
    })),
  ]
    .sort((first, second) => second.createdAt.getTime() - first.createdAt.getTime())
    .slice(0, 4);

  return (
    <main className="dashboard-shell relative min-h-screen overflow-hidden px-4 pb-10 pt-4 text-white sm:px-6 lg:px-8 lg:py-8">
      <DashboardStyle />
      <div className="pointer-events-none absolute inset-0 z-0 dashboard-grid" />
      <div className="pointer-events-none absolute -left-32 -top-28 z-0 h-80 w-80 rounded-full bg-cyan-400/14 blur-[90px]" />
      <div className="pointer-events-none absolute -right-40 top-44 z-0 h-96 w-96 rounded-full bg-violet-500/14 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[22%] z-0 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-[120px]" />

      <div className="relative z-10 mx-auto w-full max-w-[1320px] space-y-5">
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <HeroPanel copy={copy} />
          <CreditPanel
            copy={copy}
            planLabel={planLabel}
            status={summary.status}
            remainingLabel={remainingLabel}
            usedLabel={usedLabel}
            usagePercent={usagePercent}
            lowCredits={lowCredits}
          />
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title={copy.metrics.flyers}
            value={String(bannerCount)}
            helper={copy.metrics.helperFlyers}
            tone="cyan"
          />
          <MetricCard
            title={copy.metrics.videos}
            value={String(videoCount)}
            helper={copy.metrics.helperVideos}
            tone="violet"
          />
          <MetricCard
            title={copy.metrics.images}
            value={String(professionalImageCount)}
            helper={copy.metrics.helperImages}
            tone="green"
          />
          <MetricCard
            title={copy.metrics.active}
            value={String(pendingTotal)}
            helper={copy.metrics.helperActive}
            tone="pink"
          />
        </section>

        <section className="dashboard-panel p-4 sm:p-5 lg:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="dashboard-eyebrow text-cyan-100/70">{copy.actions.title}</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                {copy.actions.description}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {copy.actions.items.map((action) => (
              <ActionCard key={action.href} action={action} />
            ))}
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <StudioStatusCard
            copy={copy}
            pendingBannerCount={pendingBannerCount}
            pendingVideoCount={pendingVideoCount}
          />
          <RecentCreationsCard copy={copy} items={latestItems} locale={locale} />
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <RecommendationCard copy={copy} />
          <ShortcutsCard copy={copy} />
        </section>

        {isAdmin ? (
          <section className="dashboard-panel p-5">
            <p className="dashboard-eyebrow text-emerald-200/75">{copy.adminNotice.title}</p>
            <p className="mt-2 text-sm leading-7 text-white/68">{copy.adminNotice.text}</p>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function getPlanDisplayName(plan: SubscriptionPlan, copy: DashboardCopy) {
  return copy.plans[plan] ?? plan;
}

function getStatusLabel(status: SubscriptionStatus, copy: DashboardCopy) {
  return copy.status[status] ?? status;
}

function HeroPanel({ copy }: { copy: DashboardCopy }) {
  return (
    <section className="dashboard-hero dashboard-panel relative min-h-[330px] overflow-hidden p-5 sm:p-7 lg:p-8">
      <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 bg-[radial-gradient(circle,rgba(0,245,255,0.16),transparent_62%)]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 bg-[radial-gradient(circle,rgba(191,95,255,0.12),transparent_62%)]" />

      <div className="relative z-10 flex min-h-[290px] flex-col justify-between gap-8">
        <div>
          <div className="dashboard-kicker">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(0,245,255,0.9)]" />
            {copy.hero.eyebrow}
          </div>

          <h1 className="dashboard-title mt-5 max-w-5xl text-[32px] font-black uppercase leading-[0.96] tracking-[-0.055em] text-white sm:text-5xl lg:text-[66px]">
            {copy.hero.title}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/62 sm:text-[15px]">
            {copy.hero.description}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href={copy.hero.primaryHref} className="dashboard-cta-primary min-h-[50px] px-5 text-[10px]">
            {copy.hero.primaryCta}
            <span aria-hidden="true">→</span>
          </Link>
          <Link href={copy.hero.secondaryHref} className="dashboard-cta-secondary min-h-[50px] px-5 text-[10px]">
            {copy.hero.secondaryCta}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function CreditPanel({
  copy,
  planLabel,
  status,
  remainingLabel,
  usedLabel,
  usagePercent,
  lowCredits,
}: {
  copy: DashboardCopy;
  planLabel: string;
  status: SubscriptionStatus;
  remainingLabel: string;
  usedLabel: string;
  usagePercent: number;
  lowCredits: boolean;
}) {
  return (
    <section className="dashboard-panel relative overflow-hidden p-5 sm:p-6">
      <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/80 to-transparent" />
      <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-cyan-300/12 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-violet-400/14 blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="dashboard-eyebrow text-white/48">{copy.plan.creditsLeft}</p>
            <strong className="dashboard-title mt-3 block text-[48px] font-black leading-none text-white sm:text-[58px]">
              {remainingLabel}
            </strong>
          </div>
          <span className="dashboard-status-chip">{getStatusLabel(status, copy)}</span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <MiniStat label={copy.plan.currentPlan} value={planLabel} />
          <MiniStat label={copy.plan.usedThisCycle} value={usedLabel} />
        </div>

        <div className="mt-5 border border-cyan-300/16 bg-black/30 p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="dashboard-eyebrow text-white/44">{copy.plan.usage}</span>
            <strong className="font-mono text-[10px] text-cyan-200">{usagePercent}%</strong>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-400 to-fuchsia-400 shadow-[0_0_20px_rgba(0,245,255,0.55)]"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>

        <div className="mt-5">
          <p className="dashboard-eyebrow text-cyan-100/62">{copy.plan.costTitle}</p>
          <div className="mt-3 grid gap-2 text-[11px] text-white/68">
            <CostLine text={copy.plan.costFlyer} />
            <CostLine text={copy.plan.costImage} />
            <CostLine text={copy.plan.costAiVideo} />
            <CostLine text={copy.plan.costRemotion10} />
            <CostLine text={copy.plan.costRemotion15} />
          </div>
        </div>

        {lowCredits ? (
          <div className="mt-5 border border-amber-200/24 bg-amber-300/10 p-4">
            <p className="text-sm font-bold text-amber-50">{copy.plan.upgradeTitle}</p>
            <p className="mt-1 text-xs leading-5 text-amber-50/72">{copy.plan.upgradeText}</p>
            <Link href="/dashboard/billing" className="dashboard-cta-primary mt-3 min-h-[44px] w-full px-4 text-[10px]">
              {copy.plan.upgradeCta}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-white/[0.035] px-3 py-3">
      <p className="dashboard-eyebrow truncate text-white/40">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function CostLine({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border border-white/10 bg-white/[0.028] px-3 py-2">
      <span>{text}</span>
      <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(0,245,255,0.8)]" />
    </div>
  );
}

function MetricCard({
  title,
  value,
  helper,
  tone,
}: {
  title: string;
  value: string;
  helper: string;
  tone: "cyan" | "violet" | "green" | "pink";
}) {
  const toneClass = {
    cyan: "from-cyan-300/18 text-cyan-100 border-cyan-300/22",
    violet: "from-violet-400/18 text-violet-100 border-violet-300/22",
    green: "from-emerald-300/18 text-emerald-100 border-emerald-300/22",
    pink: "from-fuchsia-400/18 text-fuchsia-100 border-fuchsia-300/22",
  }[tone];

  return (
    <div className={`dashboard-panel min-h-[132px] overflow-hidden border bg-gradient-to-br to-transparent p-4 ${toneClass}`}>
      <p className="dashboard-eyebrow text-white/48">{title}</p>
      <strong className="dashboard-title mt-3 block text-4xl font-black leading-none text-white">
        {value}
      </strong>
      <p className="mt-3 text-xs leading-5 text-white/52">{helper}</p>
    </div>
  );
}

function ActionCard({ action }: { action: DashboardAction }) {
  return (
    <Link
      href={action.href}
      className={`dashboard-action group relative min-h-[190px] overflow-hidden p-4 transition duration-200 active:scale-[0.99] ${
        action.featured ? "dashboard-action-featured" : ""
      }`}
    >
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <span className="dashboard-icon-box">{action.icon}</span>
        <span className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 font-mono text-[8px] font-black uppercase tracking-[0.12em] text-white/66">
          {action.badge}
        </span>
      </div>
      <h2 className="dashboard-title mt-5 text-[16px] font-black uppercase tracking-[-0.03em] text-white">
        {action.title}
      </h2>
      <p className="mt-2 text-[13px] leading-6 text-white/56">{action.description}</p>
      <span className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-cyan-200">
        {action.cta}
        <span aria-hidden="true" className="transition group-hover:translate-x-1">→</span>
      </span>
    </Link>
  );
}

function StudioStatusCard({
  copy,
  pendingBannerCount,
  pendingVideoCount,
}: {
  copy: DashboardCopy;
  pendingBannerCount: number;
  pendingVideoCount: number;
}) {
  const hasPending = pendingBannerCount > 0 || pendingVideoCount > 0;

  return (
    <section className="dashboard-panel p-5 sm:p-6">
      <p className="dashboard-eyebrow text-cyan-100/68">{copy.work.title}</p>
      <h2 className="dashboard-title mt-3 text-2xl font-black uppercase tracking-[-0.04em] text-white">
        {hasPending ? copy.work.pendingTitle : copy.work.readyTitle}
      </h2>
      <p className="mt-3 text-sm leading-7 text-white/60">
        {hasPending ? copy.work.pendingText : copy.work.readyText}
      </p>

      {hasPending ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {pendingBannerCount > 0 ? (
            <span className="dashboard-pill">{pendingBannerCount} {copy.work.pendingFlyers}</span>
          ) : null}
          {pendingVideoCount > 0 ? (
            <span className="dashboard-pill dashboard-pill-violet">{pendingVideoCount} {copy.work.pendingVideos}</span>
          ) : null}
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-3 gap-2">
          <PulseDot />
          <PulseDot delay="120ms" />
          <PulseDot delay="240ms" />
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link href="/dashboard/banners" className="dashboard-cta-secondary min-h-[46px] px-4 text-[10px]">
          {copy.work.viewFlyers}
        </Link>
        <Link href="/dashboard/meus-videos" className="dashboard-cta-secondary min-h-[46px] px-4 text-[10px]">
          {copy.work.viewVideos}
        </Link>
      </div>
    </section>
  );
}

function PulseDot({ delay = "0ms" }: { delay?: string }) {
  return (
    <div className="border border-white/10 bg-white/[0.03] p-3">
      <div
        className="mx-auto h-2 w-full rounded-full bg-gradient-to-r from-cyan-300/25 via-cyan-300 to-violet-400/25 shadow-[0_0_18px_rgba(0,245,255,0.28)] dashboard-pulse-line"
        style={{ animationDelay: delay }}
      />
    </div>
  );
}

type LatestItem = {
  id: string;
  title: string;
  label: string;
  href: string;
  createdAt: Date;
  mediaUrl: string | null;
  kind: "image" | "video";
};

function RecentCreationsCard({
  copy,
  items,
  locale,
}: {
  copy: DashboardCopy;
  items: LatestItem[];
  locale: AppLocale;
}) {
  return (
    <section className="dashboard-panel p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="dashboard-eyebrow text-violet-100/74">{copy.recent.title}</p>
        <Link href="/dashboard/meus-videos" className="font-mono text-[9px] font-black uppercase tracking-[0.16em] text-cyan-200 hover:text-white">
          {copy.recent.viewAll}
        </Link>
      </div>

      {items.length > 0 ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <Link
              key={`${item.kind}-${item.id}`}
              href={item.href}
              className="group grid grid-cols-[74px_minmax(0,1fr)] gap-3 border border-white/10 bg-white/[0.03] p-3 transition hover:border-cyan-300/26 hover:bg-cyan-300/[0.055]"
            >
              <div className="aspect-[4/5] overflow-hidden border border-white/10 bg-black/30">
                {item.mediaUrl ? (
                  item.kind === "image" ? (
                    <img src={item.mediaUrl} alt={item.title} className="h-full w-full object-cover transition group-hover:scale-[1.03]" />
                  ) : (
                    <video src={item.mediaUrl} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                  )
                ) : (
                  <div className="grid h-full place-items-center text-[10px] text-white/34">—</div>
                )}
              </div>
              <div className="min-w-0">
                <span className="dashboard-pill px-2 py-1 text-[8px]">{item.label}</span>
                <p className="mt-2 line-clamp-2 text-sm font-bold leading-5 text-white">{item.title}</p>
                <p className="mt-2 text-xs text-white/40">{formatDate(item.createdAt, locale)}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-5 border border-white/10 bg-white/[0.03] p-5 text-center">
          <p className="text-sm font-bold text-white">{copy.recent.emptyTitle}</p>
          <p className="mt-2 text-xs leading-5 text-white/50">{copy.recent.emptyText}</p>
        </div>
      )}
    </section>
  );
}

function RecommendationCard({ copy }: { copy: DashboardCopy }) {
  return (
    <section className="dashboard-panel relative overflow-hidden p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-violet-400/16 blur-3xl" />
      <div className="relative z-10">
        <p className="dashboard-eyebrow text-fuchsia-100/78">{copy.recommendation.title}</p>
        <p className="mt-3 text-sm leading-7 text-white/62">{copy.recommendation.text}</p>
        <Link href="/dashboard/flyer-animado" className="dashboard-cta-primary mt-5 min-h-[48px] w-full px-5 text-[10px] sm:w-auto">
          {copy.recommendation.cta}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}

function ShortcutsCard({ copy }: { copy: DashboardCopy }) {
  return (
    <section className="dashboard-panel p-5 sm:p-6">
      <p className="dashboard-eyebrow text-cyan-100/70">{copy.shortcuts.title}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {copy.shortcuts.items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex min-h-[58px] items-center justify-between gap-3 border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-cyan-300/28 hover:bg-cyan-300/[0.06]"
          >
            <span className="flex items-center gap-3">
              <span className="dashboard-small-icon">{item.icon}</span>
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.13em] text-white/72">
                {item.title}
              </span>
            </span>
            <span aria-hidden="true" className="text-cyan-200 transition group-hover:translate-x-1">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function formatDate(date: Date, locale: AppLocale) {
  const dateLocale = locale === "pt-BR" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US";
  return new Intl.DateTimeFormat(dateLocale, {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function DashboardStyle() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          .dashboard-shell {
            --cx: #00f5ff;
            --cv: #bf5fff;
            --cp: #ff2d6b;
            --cg: #00ff9f;
            background:
              radial-gradient(circle at 18% 0%, rgba(0,245,255,0.11), transparent 30%),
              radial-gradient(circle at 86% 16%, rgba(191,95,255,0.12), transparent 34%),
              linear-gradient(180deg, #03040a 0%, #060815 46%, #03040a 100%);
          }

          .dashboard-grid {
            background-image:
              linear-gradient(rgba(0,245,255,0.022) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,245,255,0.022) 1px, transparent 1px);
            background-size: 42px 42px;
            mask-image: linear-gradient(to bottom, black, rgba(0,0,0,0.72), transparent);
          }

          .dashboard-title {
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          .dashboard-eyebrow {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
            font-size: 9px;
            font-weight: 900;
            letter-spacing: 0.2em;
            line-height: 1;
            text-transform: uppercase;
          }

          .dashboard-panel,
          .dashboard-action {
            position: relative;
            border: 1px solid rgba(0,245,255,0.16);
            background:
              linear-gradient(135deg, rgba(255,255,255,0.062), rgba(255,255,255,0.022)),
              radial-gradient(circle at top left, rgba(0,245,255,0.055), transparent 36%),
              rgba(3,4,10,0.80);
            box-shadow:
              0 24px 90px rgba(0,0,0,0.42),
              inset 0 1px 0 rgba(255,255,255,0.065);
            backdrop-filter: blur(18px);
          }

          .dashboard-panel::before,
          .dashboard-panel::after,
          .dashboard-action::before,
          .dashboard-action::after {
            content: "";
            position: absolute;
            width: 17px;
            height: 17px;
            pointer-events: none;
            opacity: 0.78;
          }

          .dashboard-panel::before,
          .dashboard-action::before {
            top: -1px;
            left: -1px;
            border-left: 2px solid var(--cx);
            border-top: 2px solid var(--cx);
          }

          .dashboard-panel::after,
          .dashboard-action::after {
            right: -1px;
            bottom: -1px;
            border-right: 2px solid var(--cv);
            border-bottom: 2px solid var(--cv);
          }

          .dashboard-hero {
            border-color: rgba(0,245,255,0.24);
            box-shadow:
              0 0 90px rgba(0,245,255,0.10),
              0 30px 110px rgba(0,0,0,0.55),
              inset 0 1px 0 rgba(255,255,255,0.07);
          }

          .dashboard-kicker {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            border: 1px solid rgba(0,245,255,0.18);
            background: rgba(0,245,255,0.065);
            padding: 9px 11px;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
            font-size: 9px;
            font-weight: 900;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: rgba(207, 250, 254, 0.86);
          }

          .dashboard-status-chip,
          .dashboard-pill {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(0,255,159,0.25);
            background: rgba(0,255,159,0.08);
            color: #b8ffe5;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
            font-size: 9px;
            font-weight: 900;
            letter-spacing: 0.12em;
            line-height: 1;
            padding: 9px 10px;
            text-transform: uppercase;
          }

          .dashboard-pill {
            border-color: rgba(0,245,255,0.24);
            background: rgba(0,245,255,0.075);
            color: #aefbff;
          }

          .dashboard-pill-violet {
            border-color: rgba(191,95,255,0.26);
            background: rgba(191,95,255,0.095);
            color: #efd9ff;
          }

          .dashboard-action {
            border-color: rgba(255,255,255,0.10);
          }

          .dashboard-action:hover {
            border-color: rgba(0,245,255,0.30);
            transform: translateY(-2px);
            box-shadow:
              0 0 56px rgba(0,245,255,0.10),
              0 24px 80px rgba(0,0,0,0.46),
              inset 0 1px 0 rgba(255,255,255,0.08);
          }

          .dashboard-action-featured {
            border-color: rgba(0,245,255,0.30);
            background:
              linear-gradient(135deg, rgba(0,245,255,0.105), rgba(191,95,255,0.055)),
              rgba(3,4,10,0.84);
          }

          .dashboard-icon-box,
          .dashboard-small-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(0,245,255,0.20);
            background: rgba(0,245,255,0.075);
            color: var(--cx);
            box-shadow: inset 0 0 20px rgba(0,245,255,0.05);
          }

          .dashboard-icon-box {
            height: 44px;
            width: 44px;
            font-size: 18px;
          }

          .dashboard-small-icon {
            height: 30px;
            width: 30px;
            font-size: 12px;
          }

          .dashboard-cta-primary,
          .dashboard-cta-secondary {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            border: 1px solid rgba(0,245,255,0.34);
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
            font-weight: 900;
            letter-spacing: 0.16em;
            text-align: center;
            text-transform: uppercase;
            transition: all 180ms ease;
          }

          .dashboard-cta-primary {
            background: var(--cx);
            color: #03040a;
            box-shadow: 0 0 30px rgba(0,245,255,0.26), 0 18px 46px rgba(0,0,0,0.35);
          }

          .dashboard-cta-primary:hover {
            transform: translateY(-1px);
            background: #ffffff;
            box-shadow: 0 0 38px rgba(0,245,255,0.44), 0 20px 52px rgba(0,0,0,0.38);
          }

          .dashboard-cta-secondary {
            background: rgba(0,245,255,0.058);
            color: #aefbff;
          }

          .dashboard-cta-secondary:hover {
            border-color: rgba(0,245,255,0.48);
            background: rgba(0,245,255,0.11);
            color: #ffffff;
          }

          @keyframes dashboardPulseLine {
            0%, 100% { opacity: 0.35; transform: scaleX(0.78); }
            50% { opacity: 1; transform: scaleX(1); }
          }

          .dashboard-pulse-line {
            animation: dashboardPulseLine 1.6s ease-in-out infinite;
          }

          @media (max-width: 640px) {
            .dashboard-panel::before,
            .dashboard-panel::after,
            .dashboard-action::before,
            .dashboard-action::after {
              width: 13px;
              height: 13px;
            }
          }
        `,
      }}
    />
  );
}
