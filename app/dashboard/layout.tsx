import type { ReactNode } from "react";

import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DEFAULT_LOCALE, normalizeLocale } from "@/lib/i18n";
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

  return <DashboardSidebar locale={locale}>{children}</DashboardSidebar>;
}
