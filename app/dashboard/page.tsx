import Link from "next/link";
import {
  BannerStatus,
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

type DashboardPageCopy = {
  header: {
    eyebrow: string;
    title: string;
    description: string;
  };
  plan: {
    adminSuffix: string;
    unlimited: string;
    currentPlan: string;
    premium: string;
    essential: string;
    admin: string;
    metricPlan: string;
    metricUsage: string;
    metricRemaining: string;
    unlimitedTesting: string;
    periodConsumption: string;
    creditsAvailable: string;
    creditsDescription: string;
    lowCreditsTitle: string;
    lowCreditsDescription: string;
    upgradeCta: string;
    costFlyer: string;
    costImage: string;
    costVideo480: string;
    costVideo720: string;
  };
  actions: {
    title: string;
    description: string;
    items: DashboardAction[];
  };
  continue: {
    title: string;
    idleTitle: string;
    idleDescription: string;
    pendingTitle: string;
    pendingDescription: string;
    pendingBanner: string;
    pendingVideo: string;
    viewBanners: string;
    viewVideos: string;
  };
  suggestion: {
    title: string;
    description: string;
    cta: string;
  };
  cards: {
    generatedTitle: string;
    generatedHelper: string;
    videosTitle: string;
    videosHelper: string;
  };
  adminNotice: {
    eyebrow: string;
    description: string;
  };
  status: Record<SubscriptionStatus, string>;
  plans: Record<SubscriptionPlan, string>;
};


const DASHBOARD_PAGE_COPY: Record<AppLocale, DashboardPageCopy> = {
  en: {
    header: {
      eyebrow: "Creative studio",
      title: "Create premium visuals for your next event",
      description:
        "Start a flyer, animate an existing design or improve your DJ photo with AI. Everything is organized for fast mobile creation.",
    },
    plan: {
      adminSuffix: "Admin",
      unlimited: "Unlimited",
      currentPlan: "Current plan",
      premium: "Premium",
      essential: "Essential",
      admin: "Admin",
      metricPlan: "Plan",
      metricUsage: "Used",
      metricRemaining: "Left",
      unlimitedTesting: "Unlimited usage for tests",
      periodConsumption: "Current cycle usage",
      creditsAvailable: "Credits available",
      creditsDescription: "Use credits to create flyers, animated videos and professional images.",
      lowCreditsTitle: "Credits are running low",
      lowCreditsDescription: "Upgrade your plan to keep creating without interruption.",
      upgradeCta: "View plans",
      costFlyer: "Flyer: 1 credit",
      costImage: "Professional image: 1 credit",
      costVideo480: "Animated video 480p: 3 credits",
      costVideo720: "Animated video 720p: 5 credits",
    },
    actions: {
      title: "What do you want to create today?",
      description: "Choose the fastest path and start from the right tool.",
      items: [
        {
          title: "Create flyer",
          description: "Generate a polished flyer for parties, shows and DJ events.",
          cta: "Start flyer",
          href: "/dashboard/banners/new",
          badge: "1 credit",
          icon: "✦",
          featured: true,
        },
        {
          title: "Animate flyer",
          description: "Turn a ready flyer into a 10-second video with motion and automatic music.",
          cta: "Animate now",
          href: "/dashboard/flyer-animado",
          badge: "3–5 credits",
          icon: "▶",
        },
        {
          title: "Professional image",
          description: "Create a cleaner promo photo for flyers, profiles and ads.",
          cta: "Improve photo",
          href: "/dashboard/imagem-profissional",
          badge: "1 credit",
          icon: "◇",
        },
      ],
    },
    continue: {
      title: "Continue your work",
      idleTitle: "Ready for a new creation",
      idleDescription: "No active render right now. Start a new flyer or animate your last design.",
      pendingTitle: "Creation in progress",
      pendingDescription: "One or more creations are still being processed. Open the right area to check progress.",
      pendingBanner: "flyer in progress",
      pendingVideo: "video in progress",
      viewBanners: "View flyers",
      viewVideos: "View videos",
    },
    suggestion: {
      title: "Recommended next step",
      description:
        "Animate your best flyer and use it in Reels, Stories and paid ads to make the creative stand out faster.",
      cta: "Animate a flyer",
    },
    cards: {
      generatedTitle: "Flyers created",
      generatedHelper: "Total in this workspace",
      videosTitle: "Videos created",
      videosHelper: "Animated flyers generated",
    },
    adminNotice: {
      eyebrow: "Admin test mode",
      description:
        "This account can generate flyers, videos and images without credit limits during tests.",
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
  "pt-BR": {
    header: {
      eyebrow: "Estúdio criativo",
      title: "Crie visuais premium para o seu próximo evento",
      description:
        "Comece um flyer, anime uma arte pronta ou melhore sua foto de DJ com IA. Tudo organizado para criar rápido pelo celular.",
    },
    plan: {
      adminSuffix: "Admin",
      unlimited: "Ilimitado",
      currentPlan: "Plano atual",
      premium: "Premium",
      essential: "Essencial",
      admin: "Admin",
      metricPlan: "Plano",
      metricUsage: "Usados",
      metricRemaining: "Restam",
      unlimitedTesting: "Uso ilimitado para testes",
      periodConsumption: "Uso do ciclo atual",
      creditsAvailable: "Créditos disponíveis",
      creditsDescription: "Use seus créditos para criar flyers, vídeos animados e imagens profissionais.",
      lowCreditsTitle: "Seus créditos estão acabando",
      lowCreditsDescription: "Faça upgrade para continuar criando sem interrupções.",
      upgradeCta: "Ver planos",
      costFlyer: "Flyer: 1 crédito",
      costImage: "Imagem profissional: 1 crédito",
      costVideo480: "Vídeo animado 480p: 3 créditos",
      costVideo720: "Vídeo animado 720p: 5 créditos",
    },
    actions: {
      title: "O que você quer criar hoje?",
      description: "Escolha o caminho mais rápido e comece pela ferramenta certa.",
      items: [
        {
          title: "Criar flyer",
          description: "Gere uma arte profissional para festas, shows e eventos de DJ.",
          cta: "Começar flyer",
          href: "/dashboard/banners/new",
          badge: "1 crédito",
          icon: "✦",
          featured: true,
        },
        {
          title: "Animar flyer",
          description: "Transforme um flyer pronto em vídeo de 10 segundos com movimento e música automática.",
          cta: "Animar agora",
          href: "/dashboard/flyer-animado",
          badge: "3–5 créditos",
          icon: "▶",
        },
        {
          title: "Imagem profissional",
          description: "Crie uma foto promocional mais limpa para flyers, perfis e anúncios.",
          cta: "Melhorar foto",
          href: "/dashboard/imagem-profissional",
          badge: "1 crédito",
          icon: "◇",
        },
      ],
    },
    continue: {
      title: "Continue de onde parou",
      idleTitle: "Pronto para uma nova criação",
      idleDescription: "Não há nenhuma geração ativa agora. Crie um novo flyer ou anime sua última arte.",
      pendingTitle: "Criação em andamento",
      pendingDescription: "Uma ou mais criações ainda estão sendo processadas. Abra a área correta para acompanhar.",
      pendingBanner: "flyer em andamento",
      pendingVideo: "vídeo em andamento",
      viewBanners: "Ver flyers",
      viewVideos: "Ver vídeos",
    },
    suggestion: {
      title: "Próximo passo recomendado",
      description:
        "Anime seu melhor flyer e use em Reels, Stories e anúncios para o criativo chamar mais atenção rapidamente.",
      cta: "Animar um flyer",
    },
    cards: {
      generatedTitle: "Flyers criados",
      generatedHelper: "Total neste workspace",
      videosTitle: "Vídeos criados",
      videosHelper: "Flyers animados gerados",
    },
    adminNotice: {
      eyebrow: "Modo teste admin",
      description:
        "Esta conta pode gerar flyers, vídeos e imagens sem limite de créditos durante os testes.",
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
  es: {
    header: {
      eyebrow: "Estudio creativo",
      title: "Crea visuales premium para tu próximo evento",
      description:
        "Empieza un flyer, anima un diseño listo o mejora tu foto de DJ con IA. Todo organizado para crear rápido desde el móvil.",
    },
    plan: {
      adminSuffix: "Admin",
      unlimited: "Ilimitado",
      currentPlan: "Plan actual",
      premium: "Premium",
      essential: "Esencial",
      admin: "Admin",
      metricPlan: "Plan",
      metricUsage: "Usados",
      metricRemaining: "Quedan",
      unlimitedTesting: "Uso ilimitado para pruebas",
      periodConsumption: "Uso del ciclo actual",
      creditsAvailable: "Créditos disponibles",
      creditsDescription: "Usa tus créditos para crear flyers, videos animados e imágenes profesionales.",
      lowCreditsTitle: "Tus créditos se están acabando",
      lowCreditsDescription: "Actualiza tu plan para seguir creando sin interrupciones.",
      upgradeCta: "Ver planes",
      costFlyer: "Flyer: 1 crédito",
      costImage: "Imagen profesional: 1 crédito",
      costVideo480: "Video animado 480p: 3 créditos",
      costVideo720: "Video animado 720p: 5 créditos",
    },
    actions: {
      title: "¿Qué quieres crear hoy?",
      description: "Elige el camino más rápido y empieza con la herramienta correcta.",
      items: [
        {
          title: "Crear flyer",
          description: "Genera una pieza profesional para fiestas, shows y eventos de DJ.",
          cta: "Empezar flyer",
          href: "/dashboard/banners/new",
          badge: "1 crédito",
          icon: "✦",
          featured: true,
        },
        {
          title: "Animar flyer",
          description: "Convierte un flyer listo en un video de 10 segundos con movimiento y música automática.",
          cta: "Animar ahora",
          href: "/dashboard/flyer-animado",
          badge: "3–5 créditos",
          icon: "▶",
        },
        {
          title: "Imagen profesional",
          description: "Crea una foto promocional más limpia para flyers, perfiles y anuncios.",
          cta: "Mejorar foto",
          href: "/dashboard/imagem-profissional",
          badge: "1 crédito",
          icon: "◇",
        },
      ],
    },
    continue: {
      title: "Continúa donde lo dejaste",
      idleTitle: "Listo para una nueva creación",
      idleDescription: "No hay ninguna generación activa ahora. Crea un nuevo flyer o anima tu último diseño.",
      pendingTitle: "Creación en progreso",
      pendingDescription: "Una o más creaciones siguen procesándose. Abre el área correcta para revisar el progreso.",
      pendingBanner: "flyer en progreso",
      pendingVideo: "video en progreso",
      viewBanners: "Ver flyers",
      viewVideos: "Ver videos",
    },
    suggestion: {
      title: "Siguiente paso recomendado",
      description:
        "Anima tu mejor flyer y úsalo en Reels, Stories y anuncios para que el creativo destaque más rápido.",
      cta: "Animar un flyer",
    },
    cards: {
      generatedTitle: "Flyers creados",
      generatedHelper: "Total en este workspace",
      videosTitle: "Videos creados",
      videosHelper: "Flyers animados generados",
    },
    adminNotice: {
      eyebrow: "Modo prueba admin",
      description:
        "Esta cuenta puede generar flyers, videos e imágenes sin límite de créditos durante las pruebas.",
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
  const copy = DASHBOARD_PAGE_COPY[locale];
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

  const [bannerCount, videoCount, usageEvents, pendingBannerCount, pendingVideoCount] =
    await Promise.all([
      prisma.banner.count({ where: { workspaceId: workspace.id } }),
      prisma.seedanceVideo.count({ where: { workspaceId: workspace.id } }),
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
      prisma.banner.count({
        where: { workspaceId: workspace.id, status: BannerStatus.PENDING },
      }),
      prisma.seedanceVideo.count({
        where: {
          workspaceId: workspace.id,
          status: { in: [SeedanceVideoStatus.PENDING, SeedanceVideoStatus.RENDERING] },
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
  const planLabel = isAdmin
    ? `${getPlanDisplayName(summary.plan, copy)} ${copy.plan.adminSuffix}`
    : getPlanDisplayName(summary.plan, copy);
  const dashboardUsedCredits = Number(summary.usedThisMonth || 0);
  const dashboardRemainingCredits = Number(summary.remainingCredits || 0);
  const dashboardCreditLimit = Math.max(
    Number(summary.monthlyLimit || 0),
    dashboardUsedCredits + dashboardRemainingCredits,
  );

  const usageLabel = isAdmin
    ? `${summary.usedThisMonth} / ∞`
    : `${dashboardUsedCredits} / ${dashboardCreditLimit}`;
  const remainingLabel = isAdmin
    ? copy.plan.unlimited
    : String(dashboardRemainingCredits);
  const usagePercent = isAdmin
    ? 100
    : dashboardCreditLimit > 0
      ? Math.min(
          100,
          Math.round((dashboardUsedCredits / dashboardCreditLimit) * 100),
        )
      : 0;

  const hasPendingWork = pendingBannerCount > 0 || pendingVideoCount > 0;
  const lowCredits = !isAdmin && dashboardRemainingCredits <= 3;


  return (
    <main className="dash-root relative min-h-screen overflow-hidden px-4 pb-10 pt-4 text-white sm:px-6 lg:px-8 lg:py-8">
      <DashboardSalesStyle />
      <div className="pointer-events-none absolute inset-0 z-0 dash-grid" />
      <div className="pointer-events-none absolute left-[-120px] top-[-120px] z-0 h-[320px] w-[320px] rounded-full bg-[rgba(0,245,255,0.16)] blur-[90px] dash-float-a" />
      <div className="pointer-events-none absolute right-[-160px] top-[30%] z-0 h-[360px] w-[360px] rounded-full bg-[rgba(191,95,255,0.17)] blur-[100px] dash-float-b" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[18%] z-0 h-[360px] w-[360px] rounded-full bg-[rgba(255,45,107,0.10)] blur-[110px]" />

      <div className="relative z-10 mx-auto w-full max-w-[1320px]">
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_390px] xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="dash-panel dash-hero relative overflow-hidden p-4 sm:p-6 lg:p-7">
            <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[var(--cx)] to-transparent opacity-70" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-[var(--cx)] via-[var(--cv)] to-transparent opacity-35" />

            <div className="relative z-10 flex flex-col gap-5 lg:min-h-[420px] lg:justify-between">
              <div>
                <div className="dash-section-label">
                  <span className="dash-chip">● {copy.header.eyebrow}</span>
                </div>

                <h1 className="dash-orb mt-4 max-w-4xl text-[30px] font-black uppercase leading-[0.95] tracking-[-0.05em] text-white sm:text-5xl lg:text-[64px]">
                  {copy.header.title}
                </h1>

                <p className="mt-4 max-w-2xl text-[14px] leading-7 text-white/58 sm:text-[15px]">
                  {copy.header.description}
                </p>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="dash-mono text-[9px] uppercase tracking-[0.24em] text-[rgba(0,245,255,0.58)]">
                      {copy.actions.title}
                    </p>
                    <p className="mt-1 text-xs text-white/42 sm:text-sm">
                      {copy.actions.description}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {copy.actions.items.map((action) => (
                    <ActionCard key={action.href} action={action} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <PlanUsageCard
            copy={copy}
            plan={summary.plan}
            planLabel={planLabel}
            usageLabel={usageLabel}
            remainingLabel={remainingLabel}
            usagePercent={usagePercent}
            status={summary.status}
            isAdmin={isAdmin}
            lowCredits={lowCredits}
          />
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <ContinueCard
            copy={copy}
            hasPendingWork={hasPendingWork}
            pendingBannerCount={pendingBannerCount}
            pendingVideoCount={pendingVideoCount}
          />

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <InfoCard
              title={copy.cards.generatedTitle}
              value={String(bannerCount)}
              helper={copy.cards.generatedHelper}
              tone="cyan"
            />
            <InfoCard
              title={copy.cards.videosTitle}
              value={String(videoCount)}
              helper={copy.cards.videosHelper}
              tone="violet"
            />
          </div>
        </section>

        <section className="mt-4">
          <SuggestionCard copy={copy} />
        </section>

        {isAdmin ? (
          <section className="dash-panel mt-4 p-5">
            <p className="dash-mono text-[9px] uppercase tracking-[0.24em] text-[var(--cg)]">
              {copy.adminNotice.eyebrow}
            </p>
            <p className="mt-2 text-sm leading-7 text-white/68">
              {copy.adminNotice.description}
            </p>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function getPlanDisplayName(plan: SubscriptionPlan, copy: DashboardPageCopy) {
  return copy.plans[plan] ?? plan;
}

function getStatusLabel(status: SubscriptionStatus, copy: DashboardPageCopy) {
  return copy.status[status] ?? status;
}

function ActionCard({ action }: { action: DashboardAction }) {
  return (
    <Link
      href={action.href}
      className={`dash-action group relative min-h-[154px] overflow-hidden p-4 transition duration-300 active:scale-[0.99] sm:min-h-[188px] ${
        action.featured ? "dash-action-featured" : ""
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--cx)] to-transparent opacity-0 transition group-hover:opacity-70" />
      <div className="flex items-start justify-between gap-3">
        <span className="dash-icon-box">
          {action.icon}
        </span>
        <span className="dash-mono rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-white/62 backdrop-blur">
          {action.badge}
        </span>
      </div>

      <h2 className="dash-orb mt-4 text-[15px] font-bold uppercase tracking-[-0.02em] text-white sm:text-[17px]">
        {action.title}
      </h2>
      <p className="mt-2 text-[12px] leading-5 text-white/56 sm:text-[13px] sm:leading-6">
        {action.description}
      </p>
      <span className="dash-mono mt-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--cx)]">
        {action.cta}
        <span aria-hidden="true" className="transition group-hover:translate-x-1">
          →
        </span>
      </span>
    </Link>
  );
}

function PlanUsageCard({
  copy,
  plan,
  planLabel,
  usageLabel,
  remainingLabel,
  usagePercent,
  status,
  isAdmin,
  lowCredits,
}: {
  copy: DashboardPageCopy;
  plan: SubscriptionPlan;
  planLabel: string;
  usageLabel: string;
  remainingLabel: string;
  usagePercent: number;
  status: SubscriptionStatus;
  isAdmin: boolean;
  lowCredits: boolean;
}) {
  const isPremium =
    plan === SubscriptionPlan.PROFESSIONAL || plan === SubscriptionPlan.STUDIO;

  return (
    <section className="dash-panel relative overflow-hidden p-4 sm:p-5">
      <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[var(--cv)] to-transparent opacity-80" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[rgba(0,245,255,0.12)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-0 h-44 w-44 rounded-full bg-[rgba(191,95,255,0.13)] blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="dash-mono text-[9px] uppercase tracking-[0.24em] text-white/42">
              {copy.plan.creditsAvailable}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <strong className="dash-orb text-[34px] font-black leading-none text-white sm:text-[44px]">
                {remainingLabel}
              </strong>
              <span className="dash-chip-v">{planLabel}</span>
            </div>
          </div>

          <span className="dash-status-chip">
            {isAdmin ? copy.plan.admin : getStatusLabel(status, copy)}
          </span>
        </div>

        <p className="mt-3 text-[13px] leading-6 text-white/58 sm:text-sm">
          {copy.plan.creditsDescription}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <PlanMetric label={copy.plan.metricPlan} value={planLabel} />
          <PlanMetric label={copy.plan.metricUsage} value={usageLabel} />
          <PlanMetric label={copy.plan.metricRemaining} value={remainingLabel} highlight />
        </div>

        <div className="mt-4 rounded-none border border-[rgba(0,245,255,0.16)] bg-black/35 p-3 shadow-[inset_0_0_26px_rgba(0,245,255,0.05)]">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="dash-mono text-[9px] uppercase tracking-[0.16em] text-white/42">
              {isAdmin ? copy.plan.unlimitedTesting : copy.plan.periodConsumption}
            </span>
            <strong className="dash-mono text-[10px] text-[var(--cx)]">
              {isAdmin ? "∞" : `${usagePercent}%`}
            </strong>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--cx)] via-[var(--cv)] to-[var(--ce)] shadow-[0_0_18px_rgba(0,245,255,0.55)] transition-all duration-700"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-2 text-[12px] text-white/62 sm:grid-cols-2">
          <CreditCostPill text={copy.plan.costFlyer} />
          <CreditCostPill text={copy.plan.costImage} />
          <CreditCostPill text={copy.plan.costVideo480} />
          <CreditCostPill text={copy.plan.costVideo720} />
        </div>

        {lowCredits ? (
          <div className="mt-4 border border-[rgba(255,210,80,0.22)] bg-[rgba(255,210,80,0.08)] p-4">
            <p className="text-sm font-semibold text-amber-50">
              {copy.plan.lowCreditsTitle}
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-50/72">
              {copy.plan.lowCreditsDescription}
            </p>
            <Link href="/dashboard/billing" className="dash-btn-solid mt-3 flex min-h-[44px] w-full items-center justify-center px-4 text-[10px]">
              {copy.plan.upgradeCta}
            </Link>
          </div>
        ) : null}
      </div>

      <div className="sr-only">
        {isPremium ? copy.plan.premium : copy.plan.essential}
      </div>
    </section>
  );
}

function PlanMetric({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`border px-2 py-3 text-center ${
        highlight
          ? "border-[rgba(0,245,255,0.25)] bg-[rgba(0,245,255,0.08)]"
          : "border-white/10 bg-white/[0.035]"
      }`}
    >
      <p className="dash-mono m-0 text-[8px] uppercase tracking-[0.14em] text-white/36 sm:text-[9px]">
        {label}
      </p>
      <div className="mt-1.5 truncate text-[12px] font-semibold leading-none text-white sm:text-[13px]">
        {value}
      </div>
    </div>
  );
}

function CreditCostPill({ text }: { text: string }) {
  return (
    <p className="dash-mono border border-white/10 bg-white/[0.035] px-3 py-2 text-[9px] uppercase tracking-[0.08em] text-white/54">
      {text}
    </p>
  );
}

function ContinueCard({
  copy,
  hasPendingWork,
  pendingBannerCount,
  pendingVideoCount,
}: {
  copy: DashboardPageCopy;
  hasPendingWork: boolean;
  pendingBannerCount: number;
  pendingVideoCount: number;
}) {
  return (
    <section className="dash-panel p-5">
      <p className="dash-mono text-[9px] uppercase tracking-[0.24em] text-[rgba(0,245,255,0.52)]">
        {copy.continue.title}
      </p>
      <h2 className="dash-orb mt-3 text-[21px] font-bold uppercase tracking-[-0.03em] text-white">
        {hasPendingWork ? copy.continue.pendingTitle : copy.continue.idleTitle}
      </h2>
      <p className="mt-2 text-sm leading-6 text-white/58">
        {hasPendingWork
          ? copy.continue.pendingDescription
          : copy.continue.idleDescription}
      </p>

      {hasPendingWork ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {pendingBannerCount > 0 ? (
            <span className="dash-chip">{pendingBannerCount} {copy.continue.pendingBanner}</span>
          ) : null}
          {pendingVideoCount > 0 ? (
            <span className="dash-chip-v">{pendingVideoCount} {copy.continue.pendingVideo}</span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Link href="/dashboard/banners" className="dash-btn min-h-[46px] px-4 text-[10px]">
          {copy.continue.viewBanners}
        </Link>
        <Link href="/dashboard/meus-videos" className="dash-btn min-h-[46px] px-4 text-[10px]">
          {copy.continue.viewVideos}
        </Link>
      </div>
    </section>
  );
}

function SuggestionCard({ copy }: { copy: DashboardPageCopy }) {
  return (
    <section className="dash-panel relative overflow-hidden p-5">
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[rgba(191,95,255,0.16)] blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--cv)] to-transparent opacity-70" />
      <div className="relative z-10">
        <p className="dash-mono text-[9px] uppercase tracking-[0.24em] text-[var(--cv)]">
          {copy.suggestion.title}
        </p>
        <p className="mt-3 text-sm leading-7 text-white/64">
          {copy.suggestion.description}
        </p>
        <Link href="/dashboard/flyer-animado" className="dash-btn-solid mt-5 flex min-h-[48px] w-full items-center justify-center px-5 text-[10px]">
          {copy.suggestion.cta}
        </Link>
      </div>
    </section>
  );
}

function InfoCard({
  title,
  value,
  helper,
  tone,
}: {
  title: string;
  value: string;
  helper: string;
  tone: "cyan" | "violet";
}) {
  return (
    <div className="dash-panel p-4 sm:p-5">
      <p className={`dash-mono text-[9px] uppercase tracking-[0.2em] ${tone === "cyan" ? "text-[var(--cx)]" : "text-[var(--cv)]"}`}>
        {title}
      </p>
      <h3 className="dash-orb mt-2 text-3xl font-black text-white sm:text-4xl">
        {value}
      </h3>
      <p className="mt-2 text-xs leading-5 text-white/54 sm:text-sm sm:leading-6">
        {helper}
      </p>
    </div>
  );
}

function DashboardSalesStyle() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

          .dash-root {
            --cx: #00F5FF;
            --cv: #BF5FFF;
            --ce: #FF2D6B;
            --cg: #00FF9F;
            --cx10: rgba(0,245,255,0.10);
            --cv10: rgba(191,95,255,0.10);
            --surface: rgba(255,255,255,0.035);
            --surface2: rgba(255,255,255,0.055);
            background:
              radial-gradient(circle at 18% 0%, rgba(0,245,255,0.10), transparent 30%),
              radial-gradient(circle at 90% 18%, rgba(191,95,255,0.13), transparent 34%),
              linear-gradient(180deg, #03040A 0%, #060816 45%, #03040A 100%);
            color: #E8EAF0;
            font-family: 'DM Sans', sans-serif;
          }

          .dash-orb { font-family: 'Orbitron', monospace; }
          .dash-mono { font-family: 'Space Mono', monospace; }

          .dash-grid {
            background-image:
              linear-gradient(rgba(0,245,255,0.018) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,245,255,0.018) 1px, transparent 1px);
            background-size: 42px 42px;
            mask-image: linear-gradient(to bottom, black, rgba(0,0,0,0.72), transparent);
          }

          @keyframes dashFloatA {
            0%,100% { transform: translate(0,0) scale(1); }
            45% { transform: translate(32px,-18px) scale(1.05); }
            75% { transform: translate(-18px,18px) scale(0.98); }
          }

          @keyframes dashFloatB {
            0%,100% { transform: translate(0,0) scale(1); }
            45% { transform: translate(-24px,22px) scale(1.04); }
            75% { transform: translate(18px,-12px) scale(0.97); }
          }

          .dash-float-a { animation: dashFloatA 22s ease-in-out infinite; }
          .dash-float-b { animation: dashFloatB 28s ease-in-out infinite; }

          .dash-panel,
          .dash-action {
            position: relative;
            border: 1px solid rgba(0,245,255,0.16);
            background:
              linear-gradient(135deg, rgba(255,255,255,0.065), rgba(255,255,255,0.022)),
              radial-gradient(circle at top left, rgba(0,245,255,0.06), transparent 34%),
              rgba(3,4,10,0.78);
            box-shadow:
              0 22px 80px rgba(0,0,0,0.38),
              inset 0 1px 0 rgba(255,255,255,0.06);
            backdrop-filter: blur(18px);
          }

          .dash-panel::before,
          .dash-panel::after,
          .dash-action::before,
          .dash-action::after {
            content: '';
            position: absolute;
            width: 18px;
            height: 18px;
            pointer-events: none;
            opacity: 0.78;
          }

          .dash-panel::before,
          .dash-action::before {
            top: -1px;
            left: -1px;
            border-top: 2px solid var(--cx);
            border-left: 2px solid var(--cx);
          }

          .dash-panel::after,
          .dash-action::after {
            right: -1px;
            bottom: -1px;
            border-right: 2px solid var(--cv);
            border-bottom: 2px solid var(--cv);
          }

          .dash-hero {
            border-color: rgba(0,245,255,0.22);
            box-shadow:
              0 0 90px rgba(0,245,255,0.10),
              0 28px 100px rgba(0,0,0,0.54),
              inset 0 1px 0 rgba(255,255,255,0.065);
          }

          .dash-section-label {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .dash-section-label::before {
            content: '';
            display: block;
            width: 24px;
            height: 1px;
            background: var(--cx);
            box-shadow: 0 0 8px var(--cx);
          }

          .dash-chip,
          .dash-chip-v,
          .dash-status-chip {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(0,245,255,0.24);
            background: rgba(0,245,255,0.08);
            color: var(--cx);
            font-family: 'Space Mono', monospace;
            font-size: 8px;
            font-weight: 700;
            letter-spacing: 0.14em;
            line-height: 1;
            padding: 8px 10px;
            text-transform: uppercase;
          }

          .dash-chip-v {
            border-color: rgba(191,95,255,0.26);
            background: rgba(191,95,255,0.10);
            color: var(--cv);
          }

          .dash-status-chip {
            border-color: rgba(0,255,159,0.24);
            background: rgba(0,255,159,0.08);
            color: var(--cg);
          }

          .dash-action {
            border-color: rgba(255,255,255,0.10);
          }

          .dash-action:hover {
            border-color: rgba(0,245,255,0.30);
            transform: translateY(-2px);
            box-shadow:
              0 0 58px rgba(0,245,255,0.10),
              0 24px 80px rgba(0,0,0,0.44),
              inset 0 1px 0 rgba(255,255,255,0.07);
          }

          .dash-action-featured {
            border-color: rgba(0,245,255,0.30);
            background:
              linear-gradient(135deg, rgba(0,245,255,0.10), rgba(191,95,255,0.055)),
              rgba(3,4,10,0.82);
          }

          .dash-icon-box {
            display: inline-flex;
            height: 44px;
            width: 44px;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(0,245,255,0.18);
            background: rgba(0,245,255,0.07);
            color: var(--cx);
            font-size: 18px;
            box-shadow: inset 0 0 20px rgba(0,245,255,0.05);
          }

          .dash-btn,
          .dash-btn-solid {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(0,245,255,0.28);
            background: rgba(0,245,255,0.055);
            color: var(--cx);
            font-family: 'Space Mono', monospace;
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            transition: all 180ms ease;
          }

          .dash-btn:hover {
            background: rgba(0,245,255,0.10);
            box-shadow: 0 0 28px rgba(0,245,255,0.16);
          }

          .dash-btn-solid {
            border-color: var(--cx);
            background: var(--cx);
            color: #03040A;
            box-shadow: 0 0 28px rgba(0,245,255,0.28);
          }

          .dash-btn-solid:hover {
            transform: translateY(-1px);
            box-shadow: 0 0 34px rgba(0,245,255,0.42), 0 18px 46px rgba(0,0,0,0.35);
          }

          @media (max-width: 640px) {
            .dash-panel::before,
            .dash-panel::after,
            .dash-action::before,
            .dash-action::after {
              width: 14px;
              height: 14px;
            }
          }
        `,
      }}
    />
  );
}
