import type { SubscriptionPlan } from "@/generated/prisma/enums";

export const PRO_ONLY_BANNER_STYLE_PRESETS = [
  "FESTIVAL_MAINSTAGE",
  "CYBER_RAVE",
  "DARK_TECHNO",
  "CHROME_FUTURE",
  "AFRO_HOUSE_SUNSET",
  "Y2K_CLUB",
] as const;

export type ProOnlyBannerStylePreset =
  (typeof PRO_ONLY_BANNER_STYLE_PRESETS)[number];

export function isBannerStyleProOnly(stylePreset: string) {
  return PRO_ONLY_BANNER_STYLE_PRESETS.includes(
    stylePreset as ProOnlyBannerStylePreset,
  );
}

export function isBannerStyleAllowedForPlan(params: {
  stylePreset: string;
  plan: SubscriptionPlan | string;
  isAdmin?: boolean;
}) {
  if (params.isAdmin) return true;
  if (!isBannerStyleProOnly(params.stylePreset)) return true;

  return params.plan !== "FREE";
}
