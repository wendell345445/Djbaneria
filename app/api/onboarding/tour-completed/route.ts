import { NextResponse } from "next/server";

import { UsageEventType } from "@/generated/prisma/enums";
import { requireUser } from "@/lib/auth";
import { sendOwnerTourCompletedEmail } from "@/lib/owner-notifications";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/rate-limit";
import { validateMutationOrigin } from "@/lib/request-security";

const TOUR_COMPLETED_EVENT_TYPE = UsageEventType.ONBOARDING_TOUR_COMPLETED;
const TOUR_COMPLETED_METADATA_KIND = "NEW_BANNER_TOUR_COMPLETED";

export async function POST(request: Request) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  try {
    const user = await requireUser();
    const workspace = user.workspaces[0] ?? null;

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found." },
        { status: 404 },
      );
    }

    const alreadyTracked = await prisma.usageEvent.findFirst({
      where: {
        workspaceId: workspace.id,
        type: TOUR_COMPLETED_EVENT_TYPE,
        metadata: {
          path: ["kind"],
          equals: TOUR_COMPLETED_METADATA_KIND,
        },
      },
      select: {
        id: true,
      },
    });

    if (alreadyTracked) {
      return NextResponse.json({
        success: true,
        alreadyTracked: true,
        emailSent: false,
        reason: "Tour completion was already tracked for this workspace.",
      });
    }

    await prisma.usageEvent.create({
      data: {
        workspaceId: workspace.id,
        type: TOUR_COMPLETED_EVENT_TYPE,
        units: 0,
        metadata: {
          kind: TOUR_COMPLETED_METADATA_KIND,
          userId: user.id,
          userEmail: user.email,
          completedAt: new Date().toISOString(),
        },
      },
    });

    const emailResult = await sendOwnerTourCompletedEmail({
      name: user.name,
      email: user.email,
      workspaceName: workspace.name,
      workspaceId: workspace.id,
      ip: getClientIp(request),
    });

    return NextResponse.json({
      success: true,
      alreadyTracked: false,
      emailSent: emailResult.sent,
      emailSkipped: emailResult.skipped,
    });
  } catch (error) {
    console.error("Error tracking new banner tour completion:", error);

    return NextResponse.json(
      { error: "Could not track tour completion." },
      { status: 500 },
    );
  }
}
