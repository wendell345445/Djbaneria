import { NextResponse } from "next/server";

import { SubscriptionPlan, SubscriptionStatus, UsageEventType } from "@/generated/prisma/enums";
import { isAdminEmail } from "@/lib/admin";
import { DEFAULT_LOCALE, normalizeLocale, type SupportedLocale } from "@/lib/i18n";
import {
  buildBillingSummary,
  getBillingPeriodRange,
  hasCreditCyclePaymentConfirmation,
  requiresCreditCyclePaymentConfirmation,
} from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/workspace";

export const runtime = "nodejs";

function getCreditCopy(locale: SupportedLocale) {
  if (locale === "pt-BR") {
    return {
      label: "Créditos disponíveis",
      unlimited: "Ilimitado",
      used: "usados neste ciclo",
      adminUsage: "uso admin",
      plan: "Plano",
      cycle: "Ciclo atual",
      resets: "Renova em",
      progress: "Uso do ciclo",
    };
  }

  if (locale === "es") {
    return {
      label: "Créditos disponibles",
      unlimited: "Ilimitado",
      used: "usados en este ciclo",
      adminUsage: "uso admin",
      plan: "Plan",
      cycle: "Ciclo actual",
      resets: "Renueva el",
      progress: "Uso del ciclo",
    };
  }

  return {
    label: "Credits available",
    unlimited: "Unlimited",
    used: "used this cycle",
    adminUsage: "admin usage",
    plan: "Plan",
    cycle: "Current cycle",
    resets: "Resets on",
    progress: "Cycle usage",
  };
}

function formatPlanLabel(plan: SubscriptionPlan, isAdmin: boolean, copy: ReturnType<typeof getCreditCopy>) {
  if (isAdmin) return `${copy.plan} Admin`;
  return `${copy.plan} ${plan.charAt(0)}${plan.slice(1).toLowerCase()}`;
}

function formatCycleDate(date: Date, locale: SupportedLocale) {
  return new Intl.DateTimeFormat(locale === "pt-BR" ? "pt-BR" : locale, {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export async function GET() {
  try {
    const workspace = await getCurrentWorkspace();

    if (!workspace) {
      return NextResponse.json({ error: "User is not authenticated." }, { status: 401 });
    }

    const locale = normalizeLocale(
      workspace.user?.preferredLocale ?? DEFAULT_LOCALE,
    );
    const copy = getCreditCopy(locale);
    const isAdmin = isAdminEmail(workspace.user?.email);
    const currentPlan = workspace.subscription?.plan || SubscriptionPlan.FREE;
    const billingPeriod = getBillingPeriodRange({
      providerSubscriptionId: workspace.subscription?.providerSubscriptionId,
      currentPeriodStart: workspace.subscription?.currentPeriodStart,
      currentPeriodEnd: workspace.subscription?.currentPeriodEnd,
      now: new Date(),
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

    return NextResponse.json({
      creditInfo: {
        label: copy.label,
        value: isAdmin ? copy.unlimited : String(summary.remainingCredits),
        usage: isAdmin
          ? `${summary.usedThisMonth} / ∞ · ${copy.adminUsage}`
          : `${summary.usedThisMonth} / ${summary.monthlyLimit} · ${copy.used}`,
        planLabel: formatPlanLabel(currentPlan, isAdmin, copy),
        cycleValue: `${copy.resets} ${formatCycleDate(billingPeriod.end, locale)}`,
        progressLabel: copy.progress,
        progressPercent,
        isUnlimited: isAdmin,
      },
      summary: {
        remainingCredits: isAdmin ? null : summary.remainingCredits,
        usedThisMonth: summary.usedThisMonth,
        monthlyLimit: summary.monthlyLimit,
        canGenerateBanner: isAdmin || summary.canGenerateBanner,
        isUnlimited: isAdmin,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar resumo de créditos:", error);

    return NextResponse.json(
      { error: "Não foi possível atualizar os créditos." },
      { status: 500 },
    );
  }
}
