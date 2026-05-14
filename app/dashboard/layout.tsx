import type { ReactNode } from "react";

import { DashboardSidebar } from "@/components/dashboard-sidebar";
import {
  SubscriptionPlan,
  SubscriptionStatus,
  UsageEventType,
} from "@/generated/prisma/enums";
import { isAdminEmail } from "@/lib/admin";
import {
  DEFAULT_LOCALE,
  normalizeLocale,
  type SupportedLocale,
} from "@/lib/i18n";
import {
  buildBillingSummary,
  getBillingPeriodRange,
  hasCreditCyclePaymentConfirmation,
  requiresCreditCyclePaymentConfirmation,
} from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { requireCurrentWorkspace } from "@/lib/workspace";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const workspace = await requireCurrentWorkspace();

  const userLanguagePreference = await prisma.user.findUnique({
    where: {
      id: workspace.userId,
    },
    select: {
      preferredLocale: true,
    },
  });

  const locale = normalizeLocale(
    userLanguagePreference?.preferredLocale ??
      workspace.user?.preferredLocale ??
      DEFAULT_LOCALE,
  );

  const creditInfo = await getSidebarCreditInfo(workspace, locale);

  return (
    <DashboardSidebar locale={locale} creditInfo={creditInfo}>
      {children}
    </DashboardSidebar>
  );
}

function getSidebarCreditCopy(locale: SupportedLocale) {
  if (locale === "pt-BR") {
    return {
      label: "Créditos disponíveis",
      unlimited: "Ilimitado",
      adminHelper: "Sua conta admin pode criar sem limite de créditos.",
      helper:
        "Use seus créditos para gerar flyers, animar vídeos e criar imagens profissionais.",
      used: "usados neste ciclo",
      adminUsage: "uso admin",
      plan: "Plano",
      cycle: "Ciclo atual",
      resets: "Renova em",
      progress: "Uso do ciclo",
      costs: {
        flyer: "Flyer",
        image: "Imagem",
        video480: "AI 480p",
        video720: "AI 720p",
        remotion10: "Remotion 10s",
        remotion15: "Remotion 15s",
        credit: "crédito",
        credits: "créditos",
      },
    };
  }

  if (locale === "es") {
    return {
      label: "Créditos disponibles",
      unlimited: "Ilimitado",
      adminHelper: "Tu cuenta admin puede crear sin límite de créditos.",
      helper:
        "Usa tus créditos para crear flyers, animar videos e imágenes profesionales.",
      used: "usados en este ciclo",
      adminUsage: "uso admin",
      plan: "Plan",
      cycle: "Ciclo actual",
      resets: "Renueva el",
      progress: "Uso del ciclo",
      costs: {
        flyer: "Flyer",
        image: "Imagen",
        video480: "AI 480p",
        video720: "AI 720p",
        remotion10: "Remotion 10s",
        remotion15: "Remotion 15s",
        credit: "crédito",
        credits: "créditos",
      },
    };
  }

  return {
    label: "Credits available",
    unlimited: "Unlimited",
    adminHelper: "Your admin account can create without credit limits.",
    helper:
      "Use credits to create flyers, animated videos and professional images.",
    used: "used this cycle",
    adminUsage: "admin usage",
    plan: "Plan",
    cycle: "Current cycle",
    resets: "Resets on",
    progress: "Cycle usage",
    costs: {
      flyer: "Flyer",
      image: "Image",
      video480: "AI 480p",
      video720: "AI 720p",
      remotion10: "Remotion 10s",
      remotion15: "Remotion 15s",
      credit: "credit",
      credits: "credits",
    },
  };
}

function formatPlanLabel(
  plan: SubscriptionPlan,
  isAdmin: boolean,
  copy: ReturnType<typeof getSidebarCreditCopy>,
) {
  if (isAdmin) return `${copy.plan} Admin`;
  return `${copy.plan} ${plan.charAt(0)}${plan.slice(1).toLowerCase()}`;
}

function formatCreditCost(
  value: number,
  copy: ReturnType<typeof getSidebarCreditCopy>,
) {
  return `${value} ${value === 1 ? copy.costs.credit : copy.costs.credits}`;
}

function formatCycleDate(date: Date, locale: SupportedLocale) {
  return new Intl.DateTimeFormat(locale === "pt-BR" ? "pt-BR" : locale, {
    day: "2-digit",
    month: "short",
  }).format(date);
}

async function getSidebarCreditInfo(
  workspace: Awaited<ReturnType<typeof requireCurrentWorkspace>>,
  locale: SupportedLocale,
) {
  const copy = getSidebarCreditCopy(locale);
  const isAdmin = isAdminEmail(workspace.user?.email);
  const currentPlan = workspace.subscription?.plan || SubscriptionPlan.FREE;
  const now = new Date();
  const billingPeriod = getBillingPeriodRange({
    providerSubscriptionId: workspace.subscription?.providerSubscriptionId,
    currentPeriodStart: workspace.subscription?.currentPeriodStart,
    currentPeriodEnd: workspace.subscription?.currentPeriodEnd,
    now,
  });
  const requiresPaymentConfirmation = requiresCreditCyclePaymentConfirmation({
    plan: currentPlan,
    providerSubscriptionId: workspace.subscription?.providerSubscriptionId,
    currentPeriodStart: workspace.subscription?.currentPeriodStart,
    currentPeriodEnd: workspace.subscription?.currentPeriodEnd,
  });

  const usageEvents = await prisma.usageEvent.findMany({
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
  });

  const summary = buildBillingSummary({
    plan: currentPlan,
    status: workspace.subscription?.status || SubscriptionStatus.TRIALING,
    usageEvents,
    requiresPaymentConfirmation,
    creditCyclePaymentConfirmed: hasCreditCyclePaymentConfirmation(usageEvents),
  });

  const progressPercent = isAdmin
    ? 100
    : summary.monthlyLimit > 0
      ? Math.round((summary.usedThisMonth / summary.monthlyLimit) * 100)
      : 0;

  return {
    label: copy.label,
    value: isAdmin ? copy.unlimited : String(summary.remainingCredits),
    helper: isAdmin ? copy.adminHelper : copy.helper,
    usage: isAdmin
      ? `${summary.usedThisMonth} / ∞ · ${copy.adminUsage}`
      : `${summary.usedThisMonth} / ${summary.monthlyLimit} · ${copy.used}`,
    planLabel: formatPlanLabel(currentPlan, isAdmin, copy),
    cycleLabel: copy.cycle,
    cycleValue: `${copy.resets} ${formatCycleDate(billingPeriod.end, locale)}`,
    progressLabel: copy.progress,
    progressPercent,
    isUnlimited: isAdmin,
    costs: [
      { label: copy.costs.flyer, value: formatCreditCost(1, copy) },
      { label: copy.costs.image, value: formatCreditCost(1, copy) },
      { label: copy.costs.video480, value: formatCreditCost(5, copy) },
      { label: copy.costs.video720, value: formatCreditCost(12, copy) },
      { label: copy.costs.remotion10, value: formatCreditCost(2, copy) },
      { label: copy.costs.remotion15, value: formatCreditCost(3, copy) },
    ],
  };
}
