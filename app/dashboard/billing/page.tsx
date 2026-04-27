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
  price: string;
  priceSuffix: string;
  monthlyCredits: string;
  costPerBanner: string;
  description: string;
  highlights: string[];
};

function getBillingCopy(locale: SupportedLocale) {
  const copies: Record<
    SupportedLocale,
    {
      page: {
        eyebrow: string;
        title: string;
        manageSubscription: string;
        current: string;
        upgrade: string;
        change: string;
        highQualityIncluded: string;
        planInUse: string;
        priceNotConfigured: string;
        changeTo: string;
        switchTo: string;
        subscribeNow: string;
        choosePlan: string;
        freePlan: string;
      };
      summary: {
        eyebrow: string;
        adminTitle: string;
        currentPlanTitle: (plan: string) => string;
        adminDescription: string;
        statusTitle: string;
        adminStatus: string;
        adminStatusDescription: string;
        periodLimit: (limit: number) => string;
        bannersCreated: string;
        bannersCreatedHelper: string;
        periodGenerations: string;
        periodGenerationsHelper: string;
        periodEdits: string;
        periodEditsHelper: string;
        remaining: string;
        currentUsage: (usage: string) => string;
        createBannerNow: string;
        backToDashboard: string;
      };
      rules: {
        creditsTitle: string;
        creditsItems: string[];
        bestPracticesTitle: string;
        bestPracticesItems: string[];
      };
      admin: {
        label: string;
        message: string;
      };
      usage: {
        unlimited: string;
      };
      status: Record<SubscriptionStatus, string>;
      plans: Record<PlanKey, PlanMeta>;
    }
  > = {
    "pt-BR": {
      page: {
        eyebrow: "Assinatura",
        title: "Planos e créditos",
        manageSubscription: "Gerenciar assinatura",
        current: "Atual",
        upgrade: "Upgrade",
        change: "Troca",
        highQualityIncluded: "Alta qualidade inclusa",
        planInUse: "Plano em uso",
        priceNotConfigured: "Preço não configurado",
        changeTo: "Mudar para",
        switchTo: "Trocar para",
        subscribeNow: "Assinar agora",
        choosePlan: "Escolher plano",
        freePlan: "Plano gratuito",
      },
      summary: {
        eyebrow: "Resumo atual",
        adminTitle: "Conta admin com uso liberado",
        currentPlanTitle: (plan) => `Seu plano atual é ${plan}`,
        adminDescription:
          "Durante os testes, esta conta pode gerar e alterar artes sem bloqueio de créditos.",
        statusTitle: "Status do plano",
        adminStatus: "Admin",
        adminStatusDescription: "Modo especial de testes ativo.",
        periodLimit: (limit) =>
          `Limite do período: ${limit} crédito${limit === 1 ? "" : "s"}.`,
        bannersCreated: "Banners criados",
        bannersCreatedHelper: "Total de artes no workspace",
        periodGenerations: "Gerações do período",
        periodGenerationsHelper: "Cada geração consome 1 crédito",
        periodEdits: "Alterações do período",
        periodEditsHelper: "Cada alteração também consome 1 crédito",
        remaining: "Restantes",
        currentUsage: (usage) => `Uso atual: ${usage}`,
        createBannerNow: "Criar banner agora",
        backToDashboard: "Voltar ao dashboard",
      },
      rules: {
        creditsTitle: "Como os créditos funcionam",
        creditsItems: [
          "Cada geração de banner consome 1 crédito.",
          "Cada alteração da arte por IA consome 1 crédito.",
          "Em planos pagos, os créditos seguem o ciclo da assinatura Stripe. No Free, seguem o mês calendário.",
        ],
        bestPracticesTitle: "Boas práticas de uso",
        bestPracticesItems: [
          "Preencha bem o briefing para reduzir retrabalho.",
          "Use alterações da arte só quando quiser refinar a versão atual.",
          "Para comparar muitas ideias, prefira gerar uma base forte primeiro.",
        ],
      },
      admin: {
        label: "Modo teste admin",
        message:
          "Esta conta está liberada para gerar banners sem limite de créditos durante os testes.",
      },
      usage: {
        unlimited: "Ilimitado",
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
          price: "$0",
          priceSuffix: "para começar",
          monthlyCredits: "2 créditos/mês",
          costPerBanner: "Teste grátis com 2 banners iniciais",
          description: "Ideal para testar a plataforma e criar as primeiras artes.",
          highlights: [
            "Geração rápida disponível",
            "Feed e Story liberados",
            "Perfeito para conhecer a plataforma",
          ],
        },
        PRO: {
          title: "Pro",
          price: "$12.99",
          priceSuffix: "por mês",
          monthlyCredits: "20 créditos/mês",
          costPerBanner: "Cada banner sai por aprox. $0.64",
          description: "Plano equilibrado para DJs e criadores com uso recorrente.",
          highlights: [
            "Qualidade rápida e equilibrada",
            "Bom para campanhas e eventos recorrentes",
          ],
        },
        PROFESSIONAL: {
          title: "Professional",
          price: "$24.99",
          priceSuffix: "por mês",
          monthlyCredits: "40 créditos/mês",
          costPerBanner: "Cada banner sai por aprox. $0.62",
          description:
            "Para quem precisa de mais fôlego para gerar, ajustar e testar artes.",
          highlights: [
            "Alta qualidade liberada",
            "Mais margem para alterações e refinamentos",
          ],
        },
        STUDIO: {
          title: "Studio",
          price: "$39.99",
          priceSuffix: "por mês",
          monthlyCredits: "80 créditos/mês",
          costPerBanner: "Cada banner sai por aprox. $0.49",
          description: "Pensado para operação intensa e produção em maior volume.",
          highlights: [
            "Alta qualidade liberada",
            "Ótimo para operação profissional contínua",
          ],
        },
      },
    },
    en: {
      page: {
        eyebrow: "Subscription",
        title: "Plans and credits",
        manageSubscription: "Manage subscription",
        current: "Current",
        upgrade: "Upgrade",
        change: "Change",
        highQualityIncluded: "High quality included",
        planInUse: "Current plan",
        priceNotConfigured: "Price not configured",
        changeTo: "Move to",
        switchTo: "Switch to",
        subscribeNow: "Subscribe now",
        choosePlan: "Choose plan",
        freePlan: "Free plan",
      },
      summary: {
        eyebrow: "Current summary",
        adminTitle: "Admin account with unlimited usage",
        currentPlanTitle: (plan) => `Your current plan is ${plan}`,
        adminDescription:
          "During testing, this account can generate and edit artwork without credit limits.",
        statusTitle: "Plan status",
        adminStatus: "Admin",
        adminStatusDescription: "Special testing mode is active.",
        periodLimit: (limit) =>
          `Period limit: ${limit} credit${limit === 1 ? "" : "s"}.`,
        bannersCreated: "Created banners",
        bannersCreatedHelper: "Total artwork in this workspace",
        periodGenerations: "Period generations",
        periodGenerationsHelper: "Each generation uses 1 credit",
        periodEdits: "Period edits",
        periodEditsHelper: "Each edit also uses 1 credit",
        remaining: "Remaining",
        currentUsage: (usage) => `Current usage: ${usage}`,
        createBannerNow: "Create banner now",
        backToDashboard: "Back to dashboard",
      },
      rules: {
        creditsTitle: "How credits work",
        creditsItems: [
          "Each banner generation uses 1 credit.",
          "Each AI artwork edit uses 1 credit.",
          "For paid plans, credits follow the Stripe subscription cycle. On Free, they follow the calendar month.",
        ],
        bestPracticesTitle: "Best practices",
        bestPracticesItems: [
          "Fill out the briefing clearly to reduce rework.",
          "Use artwork edits when you want to refine the current version.",
          "To compare many ideas, generate a strong base first.",
        ],
      },
      admin: {
        label: "Admin test mode",
        message:
          "This account can generate banners without credit limits during testing.",
      },
      usage: {
        unlimited: "Unlimited",
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
          price: "$0",
          priceSuffix: "to start",
          monthlyCredits: "2 credits/month",
          costPerBanner: "Free test with 2 initial banners",
          description: "Ideal for testing the platform and creating your first artwork.",
          highlights: [
            "Fast generation available",
            "Feed and Story unlocked",
            "Perfect for getting to know the platform",
          ],
        },
        PRO: {
          title: "Pro",
          price: "$12.99",
          priceSuffix: "per month",
          monthlyCredits: "20 credits/month",
          costPerBanner: "Each banner costs approx. $0.64",
          description: "A balanced plan for DJs and creators with recurring usage.",
          highlights: [
            "Fast and balanced quality",
            "Good for recurring campaigns and events",
          ],
        },
        PROFESSIONAL: {
          title: "Professional",
          price: "$24.99",
          priceSuffix: "per month",
          monthlyCredits: "40 credits/month",
          costPerBanner: "Each banner costs approx. $0.62",
          description:
            "For users who need more room to generate, edit, and test artwork.",
          highlights: [
            "High quality unlocked",
            "More room for edits and refinements",
          ],
        },
        STUDIO: {
          title: "Studio",
          price: "$39.99",
          priceSuffix: "per month",
          monthlyCredits: "80 credits/month",
          costPerBanner: "Each banner costs approx. $0.49",
          description: "Built for intense usage and higher-volume production.",
          highlights: [
            "High quality unlocked",
            "Great for continuous professional operation",
          ],
        },
      },
    },
    es: {
      page: {
        eyebrow: "Suscripción",
        title: "Planes y créditos",
        manageSubscription: "Gestionar suscripción",
        current: "Actual",
        upgrade: "Upgrade",
        change: "Cambio",
        highQualityIncluded: "Alta calidad incluida",
        planInUse: "Plan en uso",
        priceNotConfigured: "Precio no configurado",
        changeTo: "Cambiar a",
        switchTo: "Cambiar a",
        subscribeNow: "Suscribirse ahora",
        choosePlan: "Elegir plan",
        freePlan: "Plan gratuito",
      },
      summary: {
        eyebrow: "Resumen actual",
        adminTitle: "Cuenta admin con uso liberado",
        currentPlanTitle: (plan) => `Tu plan actual es ${plan}`,
        adminDescription:
          "Durante las pruebas, esta cuenta puede generar y editar artes sin límite de créditos.",
        statusTitle: "Estado del plan",
        adminStatus: "Admin",
        adminStatusDescription: "Modo especial de pruebas activo.",
        periodLimit: (limit) =>
          `Límite del período: ${limit} crédito${limit === 1 ? "" : "s"}.`,
        bannersCreated: "Banners creados",
        bannersCreatedHelper: "Total de artes en el workspace",
        periodGenerations: "Generaciones del período",
        periodGenerationsHelper: "Cada generación consume 1 crédito",
        periodEdits: "Ediciones del período",
        periodEditsHelper: "Cada edición también consume 1 crédito",
        remaining: "Restantes",
        currentUsage: (usage) => `Uso actual: ${usage}`,
        createBannerNow: "Crear banner ahora",
        backToDashboard: "Volver al dashboard",
      },
      rules: {
        creditsTitle: "Cómo funcionan los créditos",
        creditsItems: [
          "Cada generación de banner consume 1 crédito.",
          "Cada edición de arte con IA consume 1 crédito.",
          "En planes pagos, los créditos siguen el ciclo de la suscripción Stripe. En Free, siguen el mes calendario.",
        ],
        bestPracticesTitle: "Buenas prácticas de uso",
        bestPracticesItems: [
          "Completa bien el briefing para reducir retrabajo.",
          "Usa ediciones de la arte solo cuando quieras refinar la versión actual.",
          "Para comparar muchas ideas, primero genera una base fuerte.",
        ],
      },
      admin: {
        label: "Modo de prueba admin",
        message:
          "Esta cuenta está liberada para generar banners sin límite de créditos durante las pruebas.",
      },
      usage: {
        unlimited: "Ilimitado",
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
          price: "$0",
          priceSuffix: "para empezar",
          monthlyCredits: "2 créditos/mes",
          costPerBanner: "Prueba gratis con 2 banners iniciales",
          description: "Ideal para probar la plataforma y crear las primeras artes.",
          highlights: [
            "Generación rápida disponible",
            "Feed y Story liberados",
            "Perfecto para conocer la plataforma",
          ],
        },
        PRO: {
          title: "Pro",
          price: "$12.99",
          priceSuffix: "por mes",
          monthlyCredits: "20 créditos/mes",
          costPerBanner: "Cada banner cuesta aprox. $0.64",
          description: "Plan equilibrado para DJs y creadores con uso recurrente.",
          highlights: [
            "Calidad rápida y equilibrada",
            "Bueno para campañas y eventos recurrentes",
          ],
        },
        PROFESSIONAL: {
          title: "Professional",
          price: "$24.99",
          priceSuffix: "por mes",
          monthlyCredits: "40 créditos/mes",
          costPerBanner: "Cada banner cuesta aprox. $0.62",
          description:
            "Para quien necesita más margen para generar, editar y probar artes.",
          highlights: [
            "Alta calidad liberada",
            "Más margen para ediciones y refinamientos",
          ],
        },
        STUDIO: {
          title: "Studio",
          price: "$39.99",
          priceSuffix: "por mes",
          monthlyCredits: "80 créditos/mes",
          costPerBanner: "Cada banner cuesta aprox. $0.49",
          description: "Pensado para operación intensa y producción de mayor volumen.",
          highlights: [
            "Alta calidad liberada",
            "Excelente para operación profesional continua",
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

export default async function BillingPage() {
  const workspace = await requireCurrentWorkspace();
  const locale = normalizeLocale(workspace.user?.preferredLocale);
  const copy = getBillingCopy(locale);
  const planMeta = copy.plans;
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
    prisma.banner.count({
      where: { workspaceId: workspace.id },
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
  const remainingLabel = isAdmin
    ? copy.usage.unlimited
    : String(summary.remainingCredits);
  const currentPlanRank = getPlanRank(String(summary.plan));
  const currentPlanMeta = planMeta[String(summary.plan) as PlanKey] ?? planMeta.FREE;
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

  return (
    <main className="mx-auto max-w-[1320px] px-5 py-7">
      <section className="mb-7">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/55">
              {copy.page.eyebrow}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white md:text-[34px]">
              {copy.page.title}
            </h1>
          </div>

          {hasPaidStripeSubscription ? (
            <div className="w-full md:w-auto md:min-w-[230px]">
              <BillingCheckoutButton
                mode="portal"
                label={copy.page.manageSubscription}
                className="inline-flex min-h-[46px] w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm font-semibold text-white transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          {planOrder.map((planKey) => {
            const meta = planMeta[planKey];
            const isCurrent = String(summary.plan) === planKey;
            const isUpgrade = getPlanRank(planKey) > currentPlanRank;
            const isPaidPlan = isStripePaidPlan(planKey);
            const priceConfigured = isPaidPlan
              ? isStripePriceConfigured(planKey)
              : false;
            const isPremium =
              planKey === "PROFESSIONAL" || planKey === "STUDIO";

            return (
              <div
                key={planKey}
                className={`relative overflow-hidden rounded-[26px] border p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] ${
                  isCurrent
                    ? "border-sky-300/30 bg-sky-300/[0.08]"
                    : "border-white/10 bg-white/[0.035]"
                }`}
              >
                <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-sky-300/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-12 left-6 h-28 w-28 rounded-full bg-violet-400/10 blur-3xl" />

                <div className="relative z-10 flex min-h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/55">
                        {meta.title}
                      </p>
                      <div className="mt-2 flex flex-wrap items-end gap-x-2 gap-y-1">
                        <span className="text-[30px] font-semibold leading-none tracking-[-0.04em] text-white">
                          {meta.price}
                        </span>
                        <span className="pb-1 text-xs font-medium text-white/50">
                          {meta.priceSuffix}
                        </span>
                      </div>
                      <h3 className="mt-2 text-sm font-semibold text-cyan-100/85">
                        {meta.monthlyCredits}
                      </h3>
                    </div>

                    {isCurrent ? (
                      <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-sky-100">
                        {copy.page.current}
                      </span>
                    ) : isUpgrade ? (
                      <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-emerald-100">
                        {copy.page.upgrade}
                      </span>
                    ) : hasPaidStripeSubscription && isPaidPlan ? (
                      <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-amber-100">
                        {copy.page.change}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-3 text-sm leading-5 text-white/65">
                    {meta.description}
                  </p>

                  <div className="mt-3 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.07] px-3 py-2 text-sm font-semibold text-cyan-100">
                    {meta.costPerBanner}
                  </div>

                  {isPremium ? (
                    <div className="mt-3 inline-flex w-fit rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100">
                      {copy.page.highQualityIncluded}
                    </div>
                  ) : null}

                  <div className="mt-4 grid gap-2">
                    {meta.highlights.map((highlight) => (
                      <div
                        key={highlight}
                        className="rounded-xl border border-white/8 bg-white/[0.035] px-3 py-2 text-sm text-white/75"
                      >
                        {highlight}
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-5">
                    {isCurrent ? (
                      <BillingCheckoutButton
                        mode={hasStripeCustomer && isPaidPlan ? "portal" : "disabled"}
                        label={copy.page.manageSubscription}
                        disabledLabel={copy.page.planInUse}
                        className="inline-flex min-h-[46px] w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-white/75 transition hover:bg-white/[0.08] disabled:cursor-default disabled:opacity-75"
                      />
                    ) : isPaidPlan && !priceConfigured ? (
                      <BillingCheckoutButton
                        mode="disabled"
                        label={copy.page.priceNotConfigured}
                        disabledLabel={copy.page.priceNotConfigured}
                      />
                    ) : hasPaidStripeSubscription && isPaidPlan ? (
                      <BillingCheckoutButton
                        mode="change"
                        plan={planKey}
                        label={`${isUpgrade ? copy.page.changeTo : copy.page.switchTo} ${meta.title}`}
                      />
                    ) : isPaidPlan ? (
                      <BillingCheckoutButton
                        mode="checkout"
                        plan={planKey}
                        label={isUpgrade ? copy.page.subscribeNow : copy.page.choosePlan}
                      />
                    ) : (
                      <BillingCheckoutButton
                        mode="disabled"
                        label={copy.page.freePlan}
                        disabledLabel={copy.page.freePlan}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_360px]">
        <div>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <span className="inline-flex rounded-full border border-sky-300/15 bg-sky-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-sky-100">
                {copy.summary.eyebrow}
              </span>
              <h2 className="mt-4 text-[28px] font-semibold leading-tight text-white md:text-[34px]">
                {isAdmin
                  ? copy.summary.adminTitle
                  : copy.summary.currentPlanTitle(currentPlanMeta.title)}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
                {isAdmin ? copy.summary.adminDescription : currentPlanMeta.description}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 md:min-w-[260px]">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                {copy.summary.statusTitle}
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                {isAdmin ? copy.summary.adminStatus : getStatusLabel(summary.status, locale)}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/60">
                {isAdmin
                  ? copy.summary.adminStatusDescription
                  : copy.summary.periodLimit(summary.monthlyLimit)}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <UsageCard
              title={copy.summary.bannersCreated}
              value={String(bannerCount)}
              helper={copy.summary.bannersCreatedHelper}
            />
            <UsageCard
              title={copy.summary.periodGenerations}
              value={String(generationUnits)}
              helper={copy.summary.periodGenerationsHelper}
            />
            <UsageCard
              title={copy.summary.periodEdits}
              value={String(editUnits)}
              helper={copy.summary.periodEditsHelper}
            />
            <UsageCard
              title={copy.summary.remaining}
              value={remainingLabel}
              helper={copy.summary.currentUsage(usageLabel)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        <RuleCard title={copy.rules.creditsTitle} items={copy.rules.creditsItems} />
        <RuleCard
          title={copy.rules.bestPracticesTitle}
          items={copy.rules.bestPracticesItems}
        />
      </section>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/dashboard/banners/new"
          className="inline-flex min-h-[50px] items-center justify-center rounded-2xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95"
        >
          {copy.summary.createBannerNow}
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex min-h-[50px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-5 text-sm font-medium text-white transition hover:bg-white/[0.08]"
        >
          {copy.summary.backToDashboard}
        </Link>
      </div>

      {isAdmin ? (
        <section className="mt-5 rounded-3xl border border-white/10 bg-gradient-to-br from-sky-400/8 to-violet-400/10 p-5">
          <p className="m-0 text-xs uppercase tracking-[0.2em] text-white/50">
            {copy.admin.label}
          </p>
          <p className="mt-2 text-sm leading-7 text-white/80">
            {copy.admin.message}
          </p>
        </section>
      ) : null}
    </main>
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
    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
        {title}
      </p>
      <h3 className="mt-2 text-2xl font-semibold text-white">{value}</h3>
      <p className="mt-2 text-sm leading-6 text-white/60">{helper}</p>
    </div>
  );
}

function RuleCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,28,0.96),rgba(5,10,20,0.94))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
        {title}
      </p>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white/75"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
