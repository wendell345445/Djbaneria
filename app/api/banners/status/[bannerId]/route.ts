import { NextResponse } from "next/server";
import {
  BannerStatus,
  SubscriptionPlan,
  SubscriptionStatus,
  UsageEventType,
} from "@/generated/prisma/enums";

import { isAdminEmail } from "@/lib/admin";
import { recoverStalePendingBanners } from "@/lib/banner-generation-recovery";
import {
  buildBillingSummary,
  getBillingPeriodRange,
  hasCreditCyclePaymentConfirmation,
  requiresCreditCyclePaymentConfirmation,
} from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspace } from "@/lib/workspace";

export const runtime = "nodejs";

const CREDIT_EVENT_TYPES = [
  UsageEventType.BANNER_GENERATION,
  UsageEventType.BANNER_EDIT,
  UsageEventType.BANNER_VARIATION,
  UsageEventType.BANNER_MOTION_RENDER,
] as const;

function getPendingProgress(createdAt: Date) {
  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - createdAt.getTime()) / 1000),
  );

  const progress = Math.min(94, 18 + Math.floor(elapsedSeconds * 3));

  if (progress < 34) {
    return { progress, activeStep: 0 };
  }

  if (progress < 62) {
    return { progress, activeStep: 1 };
  }

  if (progress < 90) {
    return { progress, activeStep: 2 };
  }

  return { progress, activeStep: 3 };
}

async function getRemainingCredits(
  workspace: NonNullable<Awaited<ReturnType<typeof getCurrentWorkspace>>>,
) {
  const isAdmin = isAdminEmail(workspace.user?.email);

  if (isAdmin) {
    return {
      remainingCredits: 999999,
      isAdminUnlimited: true,
    };
  }

  const billingPeriod = getBillingPeriodRange({
    providerSubscriptionId: workspace.subscription?.providerSubscriptionId,
    currentPeriodStart: workspace.subscription?.currentPeriodStart,
    currentPeriodEnd: workspace.subscription?.currentPeriodEnd,
  });

  const currentPlan = workspace.subscription?.plan || SubscriptionPlan.FREE;
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
      type: { in: [...CREDIT_EVENT_TYPES] },
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

  return {
    remainingCredits: summary.remainingCredits,
    isAdminUnlimited: false,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bannerId: string }> },
) {
  const { bannerId } = await params;
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 });
  }

  await recoverStalePendingBanners({
    workspaceId: workspace.id,
    bannerId,
    userId: workspace.user?.id,
    reason: "status_route_stale_pending_recovery",
  });

  const banner = await prisma.banner.findFirst({
    where: {
      id: bannerId,
      workspaceId: workspace.id,
    },
    select: {
      id: true,
      title: true,
      status: true,
      outputImageUrl: true,
      format: true,
      createdAt: true,
      updatedAt: true,
      generationSeconds: true,
    },
  });

  if (!banner) {
    return NextResponse.json({ error: "Banner não encontrado." }, { status: 404 });
  }

  const credits = await getRemainingCredits(workspace);

  if (banner.status === BannerStatus.COMPLETED) {
    return NextResponse.json({
      success: true,
      bannerId: banner.id,
      status: banner.status,
      imageUrl: banner.outputImageUrl,
      bannerUrl: `/dashboard/banners/${banner.id}`,
      progress: 100,
      activeStep: 3,
      remainingCredits: credits.remainingCredits,
      isAdminUnlimited: credits.isAdminUnlimited,
      message: "Banner concluído.",
    });
  }

  if (banner.status === BannerStatus.FAILED) {
    return NextResponse.json({
      success: true,
      bannerId: banner.id,
      status: banner.status,
      imageUrl: banner.outputImageUrl,
      bannerUrl: `/dashboard/banners/${banner.id}`,
      progress: 0,
      activeStep: 0,
      remainingCredits: credits.remainingCredits,
      isAdminUnlimited: credits.isAdminUnlimited,
      message:
        "A geração demorou mais que o esperado. O crédito reservado foi devolvido automaticamente. Tente gerar novamente.",
    });
  }

  const pending = getPendingProgress(banner.createdAt);

  return NextResponse.json({
    success: true,
    bannerId: banner.id,
    status: banner.status,
    imageUrl: banner.outputImageUrl,
    bannerUrl: `/dashboard/banners/${banner.id}`,
    progress: pending.progress,
    activeStep: pending.activeStep,
    remainingCredits: credits.remainingCredits,
    isAdminUnlimited: credits.isAdminUnlimited,
    message: "Banner ainda está sendo processado.",
  });
}
