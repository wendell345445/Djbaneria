import {
  SubscriptionPlan,
  SubscriptionStatus,
  UsageEventType,
} from "@/generated/prisma/enums";

import {
  buildBillingSummary,
  getCreditCycleUsageDateFilter,
  hasCreditCyclePaymentConfirmation,
  requiresCreditCyclePaymentConfirmation,
} from "@/lib/plans";
import { prisma } from "@/lib/prisma";

const SERIALIZABLE_ISOLATION_LEVEL = "Serializable" as never;

export const CREDIT_USAGE_EVENT_TYPES = [
  UsageEventType.BANNER_GENERATION,
  UsageEventType.BANNER_EDIT,
  UsageEventType.BANNER_VARIATION,
  UsageEventType.BANNER_MOTION_RENDER,
] as const;

export class CreditReservationError extends Error {
  code = "INSUFFICIENT_CREDITS" as const;

  constructor(
    message: string,
    public readonly requiredCredits: number,
    public readonly remainingCredits: number,
  ) {
    super(message);
    this.name = "CreditReservationError";
  }
}

function hasPrismaCode(error: unknown, code: string) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === code
  );
}

function buildDefaultInsufficientCreditsMessage(input: {
  requiredCredits: number;
  remainingCredits: number;
}) {
  return `Você precisa de ${input.requiredCredits} créditos para continuar. Créditos disponíveis: ${input.remainingCredits}.`;
}

export async function reserveWorkspaceCredits(params: {
  workspaceId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  providerSubscriptionId?: string | null;
  currentPeriodStart?: Date | string | null;
  currentPeriodEnd?: Date | string | null;
  isAdmin: boolean;
  requiredUnits: number;
  usageEventType: UsageEventType;
  metadata?: Record<string, unknown>;
  insufficientCreditsMessage?: (input: {
    requiredCredits: number;
    remainingCredits: number;
  }) => string;
}) {
  if (params.isAdmin || params.requiredUnits <= 0) {
    return {
      usageEventId: null as string | null,
      remainingCreditsAfterReserve: null as number | null,
      remainingCreditsBeforeReserve: null as number | null,
      isAdminUnlimited: Boolean(params.isAdmin),
    };
  }

  const usageDateFilter = getCreditCycleUsageDateFilter({
    providerSubscriptionId: params.providerSubscriptionId,
    currentPeriodStart: params.currentPeriodStart,
    currentPeriodEnd: params.currentPeriodEnd,
  });

  const requiresPaymentConfirmation = requiresCreditCyclePaymentConfirmation({
    plan: params.plan,
    providerSubscriptionId: params.providerSubscriptionId,
    currentPeriodStart: params.currentPeriodStart,
    currentPeriodEnd: params.currentPeriodEnd,
  });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const usageEvents = await tx.usageEvent.findMany({
            where: {
              workspaceId: params.workspaceId,
              createdAt: usageDateFilter,
              type: { in: [...CREDIT_USAGE_EVENT_TYPES] },
            },
            select: {
              units: true,
              createdAt: true,
              metadata: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          });

          const summary = buildBillingSummary({
            plan: params.plan,
            status: params.status,
            usageEvents,
            requiresPaymentConfirmation,
            creditCyclePaymentConfirmed:
              hasCreditCyclePaymentConfirmation(usageEvents),
          });

          if (
            !summary.canGenerateBanner ||
            summary.remainingCredits < params.requiredUnits
          ) {
            const message =
              params.insufficientCreditsMessage?.({
                requiredCredits: params.requiredUnits,
                remainingCredits: summary.remainingCredits,
              }) ||
              buildDefaultInsufficientCreditsMessage({
                requiredCredits: params.requiredUnits,
                remainingCredits: summary.remainingCredits,
              });

            throw new CreditReservationError(
              message,
              params.requiredUnits,
              summary.remainingCredits,
            );
          }

          const usageEvent = await tx.usageEvent.create({
            data: {
              workspaceId: params.workspaceId,
              type: params.usageEventType,
              units: params.requiredUnits,
              metadata: {
                ...(params.metadata || {}),
                status:
                  typeof params.metadata?.status === "string"
                    ? params.metadata.status
                    : "reserved",
                creditsReserved: params.requiredUnits,
                reservedAt: new Date().toISOString(),
              },
            },
            select: {
              id: true,
            },
          });

          return {
            usageEventId: usageEvent.id,
            remainingCreditsAfterReserve: Math.max(
              summary.remainingCredits - params.requiredUnits,
              0,
            ),
            remainingCreditsBeforeReserve: summary.remainingCredits,
            isAdminUnlimited: false,
          };
        },
        {
          isolationLevel: SERIALIZABLE_ISOLATION_LEVEL,
        },
      );
    } catch (error) {
      if (hasPrismaCode(error, "P2034") && attempt < 2) continue;
      throw error;
    }
  }

  throw new Error("Não foi possível reservar crédito no momento.");
}

export async function refundReservedCredits(
  usageEventId: string | null | undefined,
) {
  if (!usageEventId) return;

  await prisma.usageEvent
    .delete({ where: { id: usageEventId } })
    .catch(() => null);
}
