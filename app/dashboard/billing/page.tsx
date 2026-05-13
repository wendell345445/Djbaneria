import Link from "next/link";
import {
  SubscriptionPlan,
  SubscriptionStatus,
  UsageEventType,
} from "@/generated/prisma/enums";

import { BillingCheckoutButton } from "@/components/billing-checkout-button";
import { isAdminEmail } from "@/lib/admin";
import { normalizeLocale, type SupportedLocale } from "@/lib/i18n";
import {
  buildBillingSummary,
  getBillingPeriodRange,
  hasCreditCyclePaymentConfirmation,
  requiresCreditCyclePaymentConfirmation,
} from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { isStripePaidPlan, isStripePriceConfigured } from "@/lib/stripe";
import { requireCurrentWorkspace } from "@/lib/workspace";

const planOrder = ["FREE", "PRO", "PROFESSIONAL", "STUDIO"] as const;

type PlanKey = (typeof planOrder)[number];

type PlanMeta = {
  title: string;
  label: string;
  price: string;
  priceSuffix: string;
  monthlyCredits: string;
  costPerCredit: string;
  description: string;
  highlights: string[];
};

type BillingCopy = {
  page: {
    eyebrow: string;
    title: string;
    subtitle: string;
    manageSubscription: string;
    current: string;
    upgrade: string;
    change: string;
    popular: string;
    included: string;
    planInUse: string;
    priceNotConfigured: string;
    changeTo: string;
    switchTo: string;
    subscribeNow: string;
    choosePlan: string;
    freePlan: string;
    currentPlan: string;
    creditsAvailable: string;
    usedThisCycle: string;
    renewal: string;
    unlimited: string;
    createNow: string;
    backDashboard: string;
  };
  summary: {
    title: string;
    adminTitle: string;
    description: string;
    adminDescription: string;
    statusTitle: string;
    adminStatus: string;
    periodLimit: (limit: number) => string;
    bannersCreated: string;
    periodGenerations: string;
    periodEdits: string;
    periodVideos: string;
    remaining: string;
    currentUsage: (usage: string) => string;
  };
  rules: {
    title: string;
    subtitle: string;
    staticFlyer: string;
    proImage: string;
    video480: string;
    video720: string;
    monthlyCycle: string;
    productionTipTitle: string;
    productionTip: string;
  };
  admin: {
    label: string;
    message: string;
  };
  status: Record<SubscriptionStatus, string>;
  plans: Record<PlanKey, PlanMeta>;
};

function getBillingCopy(locale: SupportedLocale): BillingCopy {
  const copies: Record<SupportedLocale, BillingCopy> = {
    "pt-BR": {
      page: {
        eyebrow: "Assinatura",
        title: "Escolha o plano para continuar criando",
        subtitle:
          "Use créditos para gerar flyers, imagens profissionais e vídeos animados com aparência premium para seus eventos.",
        manageSubscription: "Gerenciar assinatura",
        current: "Atual",
        upgrade: "Upgrade",
        change: "Troca",
        popular: "Mais escolhido",
        included: "Incluído",
        planInUse: "Plano em uso",
        priceNotConfigured: "Preço não configurado",
        changeTo: "Mudar para",
        switchTo: "Trocar para",
        subscribeNow: "Assinar agora",
        choosePlan: "Escolher plano",
        freePlan: "Plano gratuito",
        currentPlan: "Plano atual",
        creditsAvailable: "Créditos disponíveis",
        usedThisCycle: "Usados neste ciclo",
        renewal: "Renovação",
        unlimited: "Ilimitado",
        createNow: "Criar agora",
        backDashboard: "Voltar ao dashboard",
      },
      summary: {
        title: "Resumo do ciclo atual",
        adminTitle: "Conta admin com créditos ilimitados",
        description:
          "Acompanhe seu uso, créditos disponíveis e geração de materiais neste ciclo.",
        adminDescription:
          "Esta conta está liberada para testar o fluxo sem bloqueio de créditos.",
        statusTitle: "Status",
        adminStatus: "Admin",
        periodLimit: (limit) => `Limite do ciclo: ${limit} crédito${limit === 1 ? "" : "s"}.`,
        bannersCreated: "Flyers criados",
        periodGenerations: "Gerações",
        periodEdits: "Edições",
        periodVideos: "Vídeos animados",
        remaining: "Restantes",
        currentUsage: (usage) => `Uso atual: ${usage}`,
      },
      rules: {
        title: "Como os créditos são usados",
        subtitle:
          "O sistema consome créditos conforme o tipo de criação escolhido dentro do seu workspace.",
        staticFlyer: "Flyer estático: 1 crédito",
        proImage: "Imagem profissional: 1 crédito",
        video480: "Vídeo animado 480p: 5 créditos",
        video720: "Vídeo animado 720p: 12 créditos",
        monthlyCycle:
          "Nos planos pagos, os créditos seguem o ciclo da assinatura. No Free, seguem o mês calendário.",
        productionTipTitle: "Dica para economizar créditos",
        productionTip:
          "Gere primeiro uma versão forte do flyer. Depois use animação quando a arte já estiver pronta para divulgação.",
      },
      admin: {
        label: "Modo admin",
        message:
          "Sua conta usa créditos ilimitados para testes. Usuários finais continuam seguindo os limites do plano contratado.",
      },
      status: {
        TRIALING: "Teste ativo",
        ACTIVE: "Ativo",
        PAST_DUE: "Pagamento pendente",
        CANCELED: "Cancelado",
        EXPIRED: "Expirado",
      },
      plans: {
        FREE: {
          title: "Free",
          label: "Comece testando",
          price: "$0",
          priceSuffix: "para começar",
          monthlyCredits: "2 créditos/mês",
          costPerCredit: "Teste grátis com 2 créditos iniciais",
          description:
            "Para conhecer a plataforma e testar os primeiros resultados com IA.",
          highlights: [
            "Geração de flyer com IA",
            "Acesso ao dashboard criativo",
            "Ideal para validar o fluxo",
          ],
        },
        PRO: {
          title: "Pro",
          label: "Uso recorrente",
          price: "$12.99",
          priceSuffix: "por mês",
          monthlyCredits: "20 créditos/mês",
          costPerCredit: "Aprox. $0.65 por crédito",
          description:
            "Para DJs que querem criar flyers, imagens e alguns vídeos todos os meses.",
          highlights: [
            "20 créditos todo mês",
            "Flyers e imagem profissional",
            "Vídeos animados em 480p e 720p",
          ],
        },
        PROFESSIONAL: {
          title: "Professional",
          label: "Mais recomendado",
          price: "$24.99",
          priceSuffix: "por mês",
          monthlyCredits: "40 créditos/mês",
          costPerCredit: "Aprox. $0.62 por crédito",
          description:
            "O plano ideal para quem divulga eventos, testa variações e cria vídeos com frequência.",
          highlights: [
            "40 créditos todo mês",
            "Mais margem para vídeos animados",
            "Alta qualidade liberada",
          ],
        },
        STUDIO: {
          title: "Studio",
          label: "Alta produção",
          price: "$39.99",
          priceSuffix: "por mês",
          monthlyCredits: "80 créditos/mês",
          costPerCredit: "Aprox. $0.50 por crédito",
          description:
            "Para produção intensa, equipes, agências, coletivos e promoters com alto volume.",
          highlights: [
            "80 créditos todo mês",
            "Melhor custo por crédito",
            "Criado para volume e consistência",
          ],
        },
      },
    },
    en: {
      page: {
        eyebrow: "Subscription",
        title: "Choose the plan to keep creating",
        subtitle:
          "Use credits to create premium flyers, professional images and animated videos for your events.",
        manageSubscription: "Manage subscription",
        current: "Current",
        upgrade: "Upgrade",
        change: "Change",
        popular: "Most popular",
        included: "Included",
        planInUse: "Current plan",
        priceNotConfigured: "Price not configured",
        changeTo: "Move to",
        switchTo: "Switch to",
        subscribeNow: "Subscribe now",
        choosePlan: "Choose plan",
        freePlan: "Free plan",
        currentPlan: "Current plan",
        creditsAvailable: "Available credits",
        usedThisCycle: "Used this cycle",
        renewal: "Renewal",
        unlimited: "Unlimited",
        createNow: "Create now",
        backDashboard: "Back to dashboard",
      },
      summary: {
        title: "Current cycle summary",
        adminTitle: "Admin account with unlimited credits",
        description:
          "Track usage, available credits and creative output in the current cycle.",
        adminDescription:
          "This account is enabled for testing without credit limits.",
        statusTitle: "Status",
        adminStatus: "Admin",
        periodLimit: (limit) => `Cycle limit: ${limit} credit${limit === 1 ? "" : "s"}.`,
        bannersCreated: "Flyers created",
        periodGenerations: "Generations",
        periodEdits: "Edits",
        periodVideos: "Animated videos",
        remaining: "Remaining",
        currentUsage: (usage) => `Current usage: ${usage}`,
      },
      rules: {
        title: "How credits are used",
        subtitle:
          "Credits are consumed based on the type of creative generated inside your workspace.",
        staticFlyer: "Static flyer: 1 credit",
        proImage: "Professional image: 1 credit",
        video480: "Animated video 480p: 5 credits",
        video720: "Animated video 720p: 12 credits",
        monthlyCycle:
          "Paid plans follow the Stripe subscription cycle. Free accounts follow the calendar month.",
        productionTipTitle: "Credit-saving tip",
        productionTip:
          "Create a strong flyer first. Animate it once the artwork is ready for promotion.",
      },
      admin: {
        label: "Admin mode",
        message:
          "Your account uses unlimited credits for testing. End users still follow their subscribed plan limits.",
      },
      status: {
        TRIALING: "Trial active",
        ACTIVE: "Active",
        PAST_DUE: "Payment pending",
        CANCELED: "Canceled",
        EXPIRED: "Expired",
      },
      plans: {
        FREE: {
          title: "Free",
          label: "Start testing",
          price: "$0",
          priceSuffix: "to start",
          monthlyCredits: "2 credits/month",
          costPerCredit: "Free test with 2 initial credits",
          description:
            "For testing the platform and generating the first AI results.",
          highlights: [
            "AI flyer generation",
            "Creative dashboard access",
            "Ideal for validating the workflow",
          ],
        },
        PRO: {
          title: "Pro",
          label: "Recurring use",
          price: "$12.99",
          priceSuffix: "per month",
          monthlyCredits: "20 credits/month",
          costPerCredit: "Approx. $0.65 per credit",
          description:
            "For DJs who want flyers, images and occasional videos every month.",
          highlights: [
            "20 credits every month",
            "Flyers and professional images",
            "Animated videos in 480p and 720p",
          ],
        },
        PROFESSIONAL: {
          title: "Professional",
          label: "Recommended",
          price: "$24.99",
          priceSuffix: "per month",
          monthlyCredits: "40 credits/month",
          costPerCredit: "Approx. $0.62 per credit",
          description:
            "Best for users promoting events, testing variations and creating videos frequently.",
          highlights: [
            "40 credits every month",
            "More room for animated videos",
            "High quality unlocked",
          ],
        },
        STUDIO: {
          title: "Studio",
          label: "High production",
          price: "$39.99",
          priceSuffix: "per month",
          monthlyCredits: "80 credits/month",
          costPerCredit: "Approx. $0.50 per credit",
          description:
            "For high-volume production, teams, agencies, collectives and promoters.",
          highlights: [
            "80 credits every month",
            "Best cost per credit",
            "Built for volume and consistency",
          ],
        },
      },
    },
    es: {
      page: {
        eyebrow: "Suscripción",
        title: "Elige el plan para seguir creando",
        subtitle:
          "Usa créditos para crear flyers, imágenes profesionales y videos animados premium para tus eventos.",
        manageSubscription: "Gestionar suscripción",
        current: "Actual",
        upgrade: "Upgrade",
        change: "Cambio",
        popular: "Más elegido",
        included: "Incluido",
        planInUse: "Plan en uso",
        priceNotConfigured: "Precio no configurado",
        changeTo: "Cambiar a",
        switchTo: "Cambiar a",
        subscribeNow: "Suscribirse ahora",
        choosePlan: "Elegir plan",
        freePlan: "Plan gratuito",
        currentPlan: "Plan actual",
        creditsAvailable: "Créditos disponibles",
        usedThisCycle: "Usados este ciclo",
        renewal: "Renovación",
        unlimited: "Ilimitado",
        createNow: "Crear ahora",
        backDashboard: "Volver al dashboard",
      },
      summary: {
        title: "Resumen del ciclo actual",
        adminTitle: "Cuenta admin con créditos ilimitados",
        description:
          "Acompaña tu uso, créditos disponibles y materiales creados en este ciclo.",
        adminDescription:
          "Esta cuenta está habilitada para pruebas sin límite de créditos.",
        statusTitle: "Estado",
        adminStatus: "Admin",
        periodLimit: (limit) => `Límite del ciclo: ${limit} crédito${limit === 1 ? "" : "s"}.`,
        bannersCreated: "Flyers creados",
        periodGenerations: "Generaciones",
        periodEdits: "Ediciones",
        periodVideos: "Videos animados",
        remaining: "Restantes",
        currentUsage: (usage) => `Uso actual: ${usage}`,
      },
      rules: {
        title: "Cómo se usan los créditos",
        subtitle:
          "Los créditos se consumen según el tipo de creación generado dentro de tu workspace.",
        staticFlyer: "Flyer estático: 1 crédito",
        proImage: "Imagen profesional: 1 crédito",
        video480: "Video animado 480p: 5 créditos",
        video720: "Video animado 720p: 12 créditos",
        monthlyCycle:
          "En planes pagos, los créditos siguen el ciclo de Stripe. En Free, siguen el mes calendario.",
        productionTipTitle: "Consejo para ahorrar créditos",
        productionTip:
          "Primero crea un flyer fuerte. Anímalo cuando el arte ya esté listo para promocionar.",
      },
      admin: {
        label: "Modo admin",
        message:
          "Tu cuenta usa créditos ilimitados para pruebas. Los usuarios finales siguen los límites del plan contratado.",
      },
      status: {
        TRIALING: "Prueba activa",
        ACTIVE: "Activo",
        PAST_DUE: "Pago pendiente",
        CANCELED: "Cancelado",
        EXPIRED: "Expirado",
      },
      plans: {
        FREE: {
          title: "Free",
          label: "Empieza probando",
          price: "$0",
          priceSuffix: "para empezar",
          monthlyCredits: "2 créditos/mes",
          costPerCredit: "Prueba gratis con 2 créditos iniciales",
          description:
            "Para conocer la plataforma y probar los primeros resultados con IA.",
          highlights: [
            "Generación de flyer con IA",
            "Acceso al dashboard creativo",
            "Ideal para validar el flujo",
          ],
        },
        PRO: {
          title: "Pro",
          label: "Uso recurrente",
          price: "$12.99",
          priceSuffix: "por mes",
          monthlyCredits: "20 créditos/mes",
          costPerCredit: "Aprox. $0.65 por crédito",
          description:
            "Para DJs que quieren crear flyers, imágenes y algunos videos todos los meses.",
          highlights: [
            "20 créditos cada mes",
            "Flyers e imagen profesional",
            "Videos animados en 480p y 720p",
          ],
        },
        PROFESSIONAL: {
          title: "Professional",
          label: "Recomendado",
          price: "$24.99",
          priceSuffix: "por mes",
          monthlyCredits: "40 créditos/mes",
          costPerCredit: "Aprox. $0.62 por crédito",
          description:
            "Ideal para quienes promocionan eventos, prueban variaciones y crean videos con frecuencia.",
          highlights: [
            "40 créditos cada mes",
            "Más margen para videos animados",
            "Alta calidad liberada",
          ],
        },
        STUDIO: {
          title: "Studio",
          label: "Alta producción",
          price: "$39.99",
          priceSuffix: "por mes",
          monthlyCredits: "80 créditos/mes",
          costPerCredit: "Aprox. $0.50 por crédito",
          description:
            "Para alto volumen, equipos, agencias, colectivos y promoters profesionales.",
          highlights: [
            "80 créditos cada mes",
            "Mejor costo por crédito",
            "Creado para volumen y consistencia",
          ],
        },
      },
    },
  };

  return copies[locale];
}

function getPlanRank(plan: string) {
  const index = planOrder.indexOf(plan as PlanKey);
  return index === -1 ? 0 : index;
}

function getStatusLabel(status: SubscriptionStatus, locale: SupportedLocale) {
  return getBillingCopy(locale).status[status] ?? status;
}

function formatRenewalDate(date: Date, locale: SupportedLocale) {
  return new Intl.DateTimeFormat(
    locale === "pt-BR" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US",
    { month: "short", day: "2-digit" },
  ).format(date);
}

export default async function BillingPage() {
  const workspace = await requireCurrentWorkspace();
  const locale = normalizeLocale(workspace.user?.preferredLocale);
  const copy = getBillingCopy(locale);
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

  const [bannerCount, usageEvents] = await Promise.all([
    prisma.banner.count({ where: { workspaceId: workspace.id } }),
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
      orderBy: { createdAt: "desc" },
      select: {
        type: true,
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
  const usageLabel = isAdmin
    ? `${summary.usedThisMonth} / ∞`
    : `${summary.usedThisMonth} / ${summary.monthlyLimit}`;
  const remainingLabel = isAdmin ? "∞" : String(summary.remainingCredits);
  const currentPlanRank = getPlanRank(String(summary.plan));
  const currentPlanMeta = copy.plans[String(summary.plan) as PlanKey] ?? copy.plans.FREE;
  const hasStripeCustomer = Boolean(workspace.subscription?.providerCustomerId);
  const hasPaidStripeSubscription = Boolean(
    workspace.subscription?.providerSubscriptionId &&
      workspace.subscription.plan !== SubscriptionPlan.FREE,
  );

  const generationUnits = usageEvents
    .filter((event) => String(event.type) === "BANNER_GENERATION")
    .reduce((total, event) => total + (event.units || 0), 0);
  const editUnits = usageEvents
    .filter((event) => String(event.type) === "BANNER_EDIT")
    .reduce((total, event) => total + (event.units || 0), 0);
  const motionUnits = usageEvents
    .filter((event) => String(event.type) === "BANNER_MOTION_RENDER")
    .reduce((total, event) => total + (event.units || 0), 0);
  const renewalLabel = isAdmin
    ? copy.page.unlimited
    : formatRenewalDate(billingPeriod.end, locale);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#03040A] px-4 py-5 text-white sm:px-6 lg:px-8 lg:py-8">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
            .billing-shell {
              --cx: #00F5FF;
              --cv: #BF5FFF;
              --cg: #B4FF39;
              --border-x: rgba(0,245,255,0.28);
              --border-v: rgba(191,95,255,0.25);
              font-family: 'DM Sans', sans-serif;
            }
            .billing-orb { font-family: 'Orbitron', monospace; }
            .billing-mono { font-family: 'Space Mono', monospace; }
            .billing-grid {
              background-image:
                linear-gradient(rgba(0,245,255,0.052) 1px, transparent 1px),
                linear-gradient(90deg, rgba(191,95,255,0.045) 1px, transparent 1px);
              background-size: 44px 44px;
              mask-image: radial-gradient(circle at 50% 18%, black 0%, transparent 72%);
            }
            .billing-panel {
              position: relative;
              overflow: hidden;
              border: 1px solid rgba(255,255,255,0.07);
              background: linear-gradient(145deg, rgba(255,255,255,0.047), rgba(255,255,255,0.018));
              border-radius: 0;
              box-shadow: 0 24px 90px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.06);
            }
            .billing-panel::before {
              content: '';
              position: absolute;
              inset: 0 0 auto 0;
              height: 1px;
              background: linear-gradient(90deg, transparent, var(--cx), var(--cv), transparent);
              opacity: 0.65;
            }
            .billing-summary-clean {
              background: rgba(7,10,20,0.96) !important;
              isolation: isolate;
            }
            .billing-summary-clean::before,
            .billing-summary-clean::after {
              display: none !important;
              content: none !important;
            }
            .billing-corner::before,
            .billing-corner::after {
              content: '';
              position: absolute;
              width: 26px;
              height: 26px;
              pointer-events: none;
            }
            .billing-corner::before {
              left: 0;
              top: 0;
              border-left: 1px solid rgba(0,245,255,0.62);
              border-top: 1px solid rgba(0,245,255,0.62);
            }
            .billing-corner::after {
              right: 0;
              bottom: 0;
              border-right: 1px solid rgba(191,95,255,0.55);
              border-bottom: 1px solid rgba(191,95,255,0.55);
            }
            .billing-chip-cx,
            .billing-chip-v {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              border: 1px solid rgba(255,255,255,0.08);
              background: rgba(255,255,255,0.035);
              padding: 5px 9px;
              font-family: 'Space Mono', monospace;
              font-size: 7px;
              letter-spacing: 0.15em;
              text-transform: uppercase;
              color: rgba(255,255,255,0.62);
            }
            .billing-chip-cx { border-color: rgba(0,245,255,0.22); color: rgba(0,245,255,0.88); }
            .billing-chip-v { border-color: rgba(191,95,255,0.22); color: rgba(222,196,255,0.9); }
            .billing-plan-card {
              position: relative;
              overflow: hidden;
              border: 1px solid rgba(255,255,255,0.075);
              background: linear-gradient(160deg, rgba(255,255,255,0.046), rgba(255,255,255,0.018));
              border-radius: 0;
              transition: border-color .3s ease, transform .3s ease, background .3s ease, box-shadow .3s ease;
            }
            .billing-plan-card::before {
              content: '';
              position: absolute;
              inset: 0 0 auto 0;
              height: 1px;
              background: linear-gradient(90deg, transparent, rgba(0,245,255,0.65), rgba(191,95,255,0.45), transparent);
              opacity: 0;
              transition: opacity .3s ease;
            }
            .billing-plan-card:hover {
              transform: translateY(-4px);
              border-color: rgba(0,245,255,0.24);
              background: linear-gradient(160deg, rgba(0,245,255,0.045), rgba(255,255,255,0.018));
              box-shadow: 0 26px 70px rgba(0,0,0,0.42), 0 0 44px rgba(0,245,255,0.08);
            }
            .billing-plan-card:hover::before { opacity: 1; }
            .billing-plan-featured {
              border-color: rgba(0,245,255,0.42);
              background: linear-gradient(160deg, rgba(0,245,255,0.105), rgba(255,255,255,0.025) 48%, rgba(191,95,255,0.06));
              box-shadow: 0 28px 90px rgba(0,245,255,0.12), inset 0 0 0 1px rgba(0,245,255,0.08);
            }
            .billing-plan-featured::before { opacity: 1; }
            .billing-plan-current { border-color: rgba(191,95,255,0.4); background: linear-gradient(160deg, rgba(191,95,255,0.1), rgba(255,255,255,0.02)); }
            .billing-cta {
              position: relative;
              min-height: 46px;
              width: 100%;
              overflow: hidden;
              border-radius: 0;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              padding: 0 14px;
              font-family: 'Orbitron', monospace;
              font-size: 9px;
              font-weight: 800;
              letter-spacing: 0.18em;
              text-transform: uppercase;
              transition: transform .25s ease, box-shadow .25s ease, background .25s ease, border-color .25s ease;
            }
            .billing-cta::after {
              content: '';
              position: absolute;
              inset: 0;
              width: 60%;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
              transform: translateX(-130%) skewX(-18deg);
              animation: billingScan 3.2s ease-in-out infinite;
              pointer-events: none;
            }
            .billing-cta-pro {
              border: 1px solid var(--cx);
              background: transparent;
              color: var(--cx);
              box-shadow: 0 0 18px rgba(0,245,255,0.18), inset 0 0 18px rgba(0,245,255,0.05);
            }
            .billing-cta-pro:hover { background: rgba(0,245,255,0.09); color: white; transform: translateY(-2px); box-shadow: 0 0 44px rgba(0,245,255,0.46); }
            .billing-cta-featured {
              border: 1px solid rgba(0,245,255,0.86);
              background: var(--cx);
              color: #03040A;
              box-shadow: 0 0 0 1px rgba(0,245,255,0.5), 0 0 42px rgba(0,245,255,0.42), inset 0 1px 0 rgba(255,255,255,0.38);
            }
            .billing-cta-featured:hover { transform: translateY(-3px); box-shadow: 0 0 55px rgba(0,245,255,0.68), 0 0 95px rgba(0,245,255,0.24); }
            .billing-cta-studio {
              border: 1px solid var(--cv);
              background: transparent;
              color: var(--cv);
              box-shadow: 0 0 20px rgba(191,95,255,0.22), inset 0 0 18px rgba(191,95,255,0.06);
            }
            .billing-cta-studio:hover { background: rgba(191,95,255,0.1); color: white; transform: translateY(-2px); box-shadow: 0 0 44px rgba(191,95,255,0.48); }
            .billing-cta-muted {
              border: 1px solid rgba(255,255,255,0.1);
              background: rgba(255,255,255,0.04);
              color: rgba(255,255,255,0.58);
            }
            .billing-cta:disabled { cursor: default; opacity: .68; transform: none; }
            .billing-cta:disabled::after { display: none; }
            .billing-stat {
              border: 1px solid rgba(255,255,255,0.075);
              background: rgba(255,255,255,0.032);
              border-radius: 0;
            }
            @keyframes billingScan {
              0%, 30% { transform: translateX(-140%) skewX(-18deg); opacity: 0; }
              38% { opacity: 1; }
              72% { opacity: 1; }
              86%, 100% { transform: translateX(220%) skewX(-18deg); opacity: 0; }
            }
          `,
        }}
      />

      <div className="billing-shell pointer-events-none absolute inset-0">
        <div className="billing-grid absolute inset-0 opacity-70" />
        <div className="absolute -left-56 top-24 h-[620px] w-[620px] rounded-full bg-cyan-400/[0.075] blur-[120px]" />
        <div className="absolute -right-44 top-[22%] h-[560px] w-[560px] rounded-full bg-violet-500/[0.082] blur-[130px]" />
        <div className="absolute left-1/2 top-0 h-[340px] w-px -translate-x-1/2 bg-gradient-to-b from-cyan-300/35 to-transparent" />
      </div>

      <div className="billing-shell relative z-10 mx-auto max-w-[1240px]">
        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="billing-mono text-[9px] uppercase tracking-[0.18em] text-cyan-100/52">
                {copy.page.choosePlan}
              </p>
              <h2 className="billing-orb mt-2 text-2xl font-black uppercase tracking-[-0.04em] text-white sm:text-3xl">
                {copy.page.upgrade}
              </h2>
            </div>
            <p className="hidden max-w-md text-right text-sm leading-6 text-white/42 md:block">
              {copy.rules.monthlyCycle}
            </p>
          </div>

          <div className="grid gap-3 xl:grid-cols-4">
            {planOrder.map((planKey) => {
              const meta = copy.plans[planKey];
              const isCurrent = String(summary.plan) === planKey;
              const isUpgrade = getPlanRank(planKey) > currentPlanRank;
              const isPaidPlan = isStripePaidPlan(planKey);
              const priceConfigured = isPaidPlan
                ? isStripePriceConfigured(planKey)
                : false;
              const isFeatured = planKey === "PROFESSIONAL";
              const isStudio = planKey === "STUDIO";
              const cardClassName = `billing-plan-card p-3.5 sm:p-4 ${
                isFeatured ? "billing-plan-featured" : isCurrent ? "billing-plan-current" : ""
              }`;
              const buttonClassName = isCurrent
                ? "billing-cta billing-cta-muted"
                : isFeatured
                  ? "billing-cta billing-cta-featured"
                  : isStudio
                    ? "billing-cta billing-cta-studio"
                    : "billing-cta billing-cta-pro";

              return (
                <article key={planKey} className={cardClassName}>
                  <div className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-cyan-300/10 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-16 left-4 h-36 w-36 rounded-full bg-violet-400/10 blur-3xl" />

                  <div className="relative z-10 flex min-h-full flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="billing-mono text-[8px] uppercase tracking-[0.18em] text-cyan-100/52">
                          {meta.label}
                        </p>
                        <h3 className="billing-orb mt-2 text-[19px] font-black uppercase tracking-[-0.03em] text-white">
                          {meta.title}
                        </h3>
                      </div>
                      {isFeatured ? (
                        <span className="billing-chip-cx whitespace-nowrap">{copy.page.popular}</span>
                      ) : isCurrent ? (
                        <span className="billing-chip-v whitespace-nowrap">{copy.page.current}</span>
                      ) : null}
                    </div>

                    <div className="mt-4 flex flex-wrap items-end gap-x-2 gap-y-1">
                      <span className="billing-orb text-[34px] font-black leading-none tracking-[-0.08em] text-white">
                        {meta.price}
                      </span>
                      <span className="billing-mono pb-1 text-[8px] uppercase tracking-[0.13em] text-white/38">
                        {meta.priceSuffix}
                      </span>
                    </div>

                    <div className="mt-3 border border-cyan-300/14 bg-cyan-300/[0.065] px-3 py-2.5">
                      <p className="text-[13px] font-bold text-cyan-50">{meta.monthlyCredits}</p>
                      <p className="mt-1 text-[11px] leading-4 text-cyan-100/55">{meta.costPerCredit}</p>
                    </div>

                    <p className="mt-3 text-[13px] leading-5 text-white/58">
                      {meta.description}
                    </p>


                    <div className="mt-3 grid gap-1.5">
                      {meta.highlights.map((highlight) => (
                        <div
                          key={highlight}
                          className="border border-white/[0.07] bg-black/20 px-3 py-1.5 text-[12px] leading-5 text-white/68"
                        >
                          <span className="mr-2 text-cyan-200">✦</span>
                          {highlight}
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto pt-4">
                      {isCurrent ? (
                        <BillingCheckoutButton
                          mode="disabled"
                          label={copy.page.planInUse}
                          disabledLabel={copy.page.planInUse}
                          className={buttonClassName}
                        />
                      ) : isPaidPlan && !priceConfigured ? (
                        <BillingCheckoutButton
                          mode="disabled"
                          label={copy.page.priceNotConfigured}
                          disabledLabel={copy.page.priceNotConfigured}
                          className="billing-cta billing-cta-muted"
                        />
                      ) : hasPaidStripeSubscription && isPaidPlan ? (
                        <BillingCheckoutButton
                          mode="change"
                          plan={planKey}
                          label={`${isUpgrade ? copy.page.changeTo : copy.page.switchTo} ${meta.title}`}
                          className={buttonClassName}
                        />
                      ) : isPaidPlan ? (
                        <BillingCheckoutButton
                          mode="checkout"
                          plan={planKey}
                          label={isUpgrade ? copy.page.subscribeNow : copy.page.choosePlan}
                          className={buttonClassName}
                        />
                      ) : (
                        <BillingCheckoutButton
                          mode="disabled"
                          label={copy.page.freePlan}
                          disabledLabel={copy.page.freePlan}
                          className="billing-cta billing-cta-muted"
                        />
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {hasStripeCustomer ? (
            <div className="mt-5 flex justify-center">
              <div className="w-full sm:w-auto sm:min-w-[280px]">
                <BillingCheckoutButton
                  mode="portal"
                  label={copy.page.manageSubscription}
                  className="billing-cta billing-cta-muted"
                />
              </div>
            </div>
          ) : null}
        </section>

        <section className="mt-8 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="billing-panel billing-summary-clean p-4 sm:p-6">
            <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <span className="billing-chip-cx">{copy.summary.statusTitle}</span>
                <h2 className="billing-orb mt-4 text-2xl font-black uppercase tracking-[-0.04em] text-white sm:text-3xl">
                  {isAdmin ? copy.summary.adminTitle : copy.summary.title}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
                  {isAdmin ? copy.summary.adminDescription : copy.summary.description}
                </p>
              </div>
              <div className="min-w-[220px] border border-cyan-300/14 bg-cyan-300/[0.055] p-4">
                <p className="billing-mono text-[8px] uppercase tracking-[0.16em] text-cyan-100/48">
                  {copy.summary.statusTitle}
                </p>
                <h3 className="billing-orb mt-2 text-2xl font-black text-white">
                  {isAdmin ? copy.summary.adminStatus : getStatusLabel(summary.status, locale)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/54">
                  {isAdmin ? copy.page.unlimited : copy.summary.periodLimit(summary.monthlyLimit)}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <UsageCard title={copy.summary.bannersCreated} value={String(bannerCount)} helper={currentPlanMeta.title} />
              <UsageCard title={copy.summary.periodGenerations} value={String(generationUnits)} helper="AI flyers" />
              <UsageCard title={copy.summary.periodEdits} value={String(editUnits)} helper="AI edits" />
              <UsageCard title={copy.summary.periodVideos} value={String(motionUnits)} helper="MP4 exports" />
              <UsageCard title={copy.summary.remaining} value={remainingLabel} helper={copy.summary.currentUsage(usageLabel)} />
            </div>
          </div>

          <aside className="billing-panel p-4 sm:p-6">
            <div className="relative z-10">
              <span className="billing-chip-v">{copy.rules.title}</span>
              <p className="mt-3 text-[13px] leading-5 text-white/58">
                {copy.rules.subtitle}
              </p>
              <div className="mt-5 grid gap-2">
                {[copy.rules.staticFlyer, copy.rules.proImage, copy.rules.video480, copy.rules.video720].map((item) => (
                  <div key={item} className="border border-white/[0.075] bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/72">
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-5 border border-violet-300/16 bg-violet-300/[0.055] p-4">
                <h3 className="text-sm font-bold text-white">{copy.rules.productionTipTitle}</h3>
                <p className="mt-2 text-sm leading-6 text-white/58">{copy.rules.productionTip}</p>
              </div>
            </div>
          </aside>
        </section>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard/banners/new" className="billing-cta billing-cta-featured sm:w-auto sm:min-w-[220px]">
            {copy.page.createNow}
          </Link>
          <Link href="/dashboard" className="billing-cta billing-cta-muted sm:w-auto sm:min-w-[220px]">
            {copy.page.backDashboard}
          </Link>
        </div>

        {isAdmin ? (
          <section className="billing-panel mt-6 p-4 sm:p-5">
            <div className="relative z-10">
              <span className="billing-chip-cx">{copy.admin.label}</span>
              <p className="mt-3 text-sm leading-7 text-white/68">{copy.admin.message}</p>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="billing-stat px-3 py-2">
      <p className="billing-mono text-[8px] uppercase tracking-[0.14em] text-white/34">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-white/78">{value}</p>
    </div>
  );
}

function UsageCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="billing-stat p-4">
      <p className="billing-mono text-[8px] font-bold uppercase tracking-[0.16em] text-white/36">
        {title}
      </p>
      <h3 className="billing-orb mt-2 text-2xl font-black tracking-[-0.04em] text-white">
        {value}
      </h3>
      <p className="mt-2 text-xs leading-5 text-white/46">{helper}</p>
    </div>
  );
}
