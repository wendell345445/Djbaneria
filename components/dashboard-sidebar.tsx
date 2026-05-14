"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  Clapperboard,
  CircleDollarSign,
  CreditCard,
  Film,
  Globe2,
  Grid2X2,
  ImagePlus,
  Images,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";

import {
  getDashboardCopy,
  normalizeLocale,
  type SupportedLocale,
} from "@/lib/i18n";

type NavItemKey =
  | "dashboard"
  | "newBanner"
  | "myBanners"
  | "professionalImage"
  | "animatedFlyer"
  | "animatedFlyerAi"
  | "remotion"
  | "myVideos"
  | "billing"
  | "language"
  | "settings";

type NavItem = {
  key: NavItemKey;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeType?: "ai";
};

const navItems: NavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: Grid2X2 },
  {
    key: "newBanner",
    href: "/dashboard/banners/new",
    icon: ImagePlus,
    badgeType: "ai",
  },
  { key: "myBanners", href: "/dashboard/banners", icon: Images },
  {
    key: "animatedFlyer",
    href: "/dashboard/flyer-animado",
    icon: Clapperboard,
    badgeType: "ai",
  },
  { key: "myVideos", href: "/dashboard/meus-videos", icon: Film },
  {
    key: "professionalImage",
    href: "/dashboard/imagem-profissional",
    icon: Wand2,
    badgeType: "ai",
  },
  { key: "billing", href: "/dashboard/billing", icon: CreditCard },
  { key: "language", href: "/dashboard/settings/language", icon: Globe2 },
  { key: "settings", href: "/dashboard/settings", icon: Settings },
];

const animatedFlyerSubItems: NavItem[] = [
  {
    key: "animatedFlyerAi",
    href: "/dashboard/flyer-animado",
    icon: Sparkles,
    badgeType: "ai",
  },
  {
    key: "remotion",
    href: "/dashboard/remotion",
    icon: Clapperboard,
    badgeType: "ai",
  },
];

const pageNavItems: NavItem[] = [...navItems, ...animatedFlyerSubItems];

function isNavItemActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  if (href === "/dashboard/banners/new") {
    return pathname === "/dashboard/banners/new";
  }

  if (href === "/dashboard/banners") {
    return (
      pathname === "/dashboard/banners" ||
      (pathname.startsWith("/dashboard/banners/") &&
        !pathname.startsWith("/dashboard/banners/new"))
    );
  }

  if (href === "/dashboard/settings") {
    return pathname === "/dashboard/settings";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getProfessionalImageLabel(locale: SupportedLocale) {
  if (locale === "pt-BR") return "Imagem profissional";
  if (locale === "es") return "Imagen profesional";
  return "Professional image";
}

function getAnimatedFlyerLabel(locale: SupportedLocale) {
  if (locale === "pt-BR") return "Flyer animado";
  if (locale === "es") return "Flyer animado";
  return "Animated flyer";
}

function getAnimatedFlyerAiLabel(locale: SupportedLocale) {
  if (locale === "pt-BR") return "Gerar com AI";
  if (locale === "es") return "Generar con AI";
  return "Generate with AI";
}

function getMyVideosLabel(locale: SupportedLocale) {
  if (locale === "pt-BR") return "Meus vídeos";
  if (locale === "es") return "Mis videos";
  return "My videos";
}

function getRemotionLabel(locale: SupportedLocale) {
  if (locale === "pt-BR") return "Remotion Studio";
  if (locale === "es") return "Remotion Studio";
  return "Remotion Studio";
}

function getNewFlyerLabel(locale: SupportedLocale) {
  if (locale === "pt-BR") return "Novo flyer";
  if (locale === "es") return "Nuevo flyer";
  return "New flyer";
}

function getMyFlyersLabel(locale: SupportedLocale) {
  if (locale === "pt-BR") return "Meus flyers";
  if (locale === "es") return "Mis flyers";
  return "My flyers";
}

function getNavItemLabel(
  key: NavItemKey,
  copy: ReturnType<typeof getDashboardCopy>,
  locale: SupportedLocale,
) {
  switch (key) {
    case "dashboard":
      return copy.nav.dashboard;
    case "newBanner":
      return getNewFlyerLabel(locale);
    case "myBanners":
      return getMyFlyersLabel(locale);
    case "professionalImage":
      return getProfessionalImageLabel(locale);
    case "animatedFlyer":
      return getAnimatedFlyerLabel(locale);
    case "animatedFlyerAi":
      return getAnimatedFlyerAiLabel(locale);
    case "myVideos":
      return getMyVideosLabel(locale);
    case "remotion":
      return getRemotionLabel(locale);
    case "billing":
      return copy.nav.billing;
    case "language":
      return copy.nav.language;
    case "settings":
      return copy.nav.settings;
    default:
      return copy.shell.fallbackPage;
  }
}

function getPageLabel(
  pathname: string,
  copy: ReturnType<typeof getDashboardCopy>,
  locale: SupportedLocale,
) {
  const match = pageNavItems.find((item) =>
    isNavItemActive(pathname, item.href),
  );
  return match
    ? getNavItemLabel(match.key, copy, locale)
    : copy.shell.fallbackPage;
}

function getSidebarControlCopy(locale: SupportedLocale) {
  if (locale === "pt-BR") {
    return {
      collapse: "Recolher sidebar",
      expand: "Expandir sidebar",
      compactHint: "Menu compacto",
    };
  }

  if (locale === "es") {
    return {
      collapse: "Contraer sidebar",
      expand: "Expandir sidebar",
      compactHint: "Menú compacto",
    };
  }

  return {
    collapse: "Collapse sidebar",
    expand: "Expand sidebar",
    compactHint: "Compact menu",
  };
}

function getMobileCreditCopy(locale: SupportedLocale) {
  if (locale === "pt-BR") {
    return {
      shortLabel: "Créditos",
      available: "disponíveis",
      unlimited: "ilimitados",
    };
  }

  if (locale === "es") {
    return {
      shortLabel: "Créditos",
      available: "disponibles",
      unlimited: "ilimitados",
    };
  }

  return {
    shortLabel: "Credits",
    available: "available",
    unlimited: "unlimited",
  };
}

export type SidebarCreditInfo = {
  label: string;
  value: string;
  usage: string;
  planLabel: string;
  cycleValue: string;
  progressLabel: string;
  progressPercent: number;
  isUnlimited: boolean;
};

export function DashboardSidebar({
  children,
  locale,
  creditInfo,
}: {
  children: React.ReactNode;
  locale?: SupportedLocale;
  creditInfo?: SidebarCreditInfo;
}) {
  const normalizedLocale = normalizeLocale(locale);
  const copy = useMemo(
    () => getDashboardCopy(normalizedLocale),
    [normalizedLocale],
  );
  const sidebarControlCopy = useMemo(
    () => getSidebarControlCopy(normalizedLocale),
    [normalizedLocale],
  );
  const mobileCreditCopy = useMemo(
    () => getMobileCreditCopy(normalizedLocale),
    [normalizedLocale],
  );
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [liveCreditInfo, setLiveCreditInfo] = useState(creditInfo);
  const displayCreditInfo = liveCreditInfo ?? creditInfo;
  const isAnimatedFlyerRoute =
    isNavItemActive(pathname, "/dashboard/flyer-animado") ||
    isNavItemActive(pathname, "/dashboard/remotion");
  const [animatedFlyerOpen, setAnimatedFlyerOpen] =
    useState(isAnimatedFlyerRoute);
  const pageLabel = useMemo(
    () => getPageLabel(pathname, copy, normalizedLocale),
    [copy, normalizedLocale, pathname],
  );

  useEffect(() => {
    setLiveCreditInfo(creditInfo);
  }, [creditInfo]);

  useEffect(() => {
    let ignore = false;

    async function refreshCredits() {
      try {
        const response = await fetch("/api/billing/summary", {
          cache: "no-store",
        });
        const data = (await response.json().catch(() => ({}))) as {
          creditInfo?: SidebarCreditInfo;
        };

        if (!ignore && response.ok && data.creditInfo) {
          setLiveCreditInfo(data.creditInfo);
        }
      } catch {
        // Keep the last visible value if the refresh fails.
      }
    }

    function handleCreditsUpdated(event: Event) {
      const detail = (event as CustomEvent<{ remainingCredits?: number | null }>).detail;

      if (typeof detail?.remainingCredits === "number") {
        setLiveCreditInfo((current) => {
          if (!current || current.isUnlimited) return current;

          return {
            ...current,
            value: String(Math.max(0, detail.remainingCredits || 0)),
          };
        });
      }

      void refreshCredits();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void refreshCredits();
      }
    }

    function handleWindowFocus() {
      void refreshCredits();
    }

    function getRequestPath(input: RequestInfo | URL) {
      try {
        const rawUrl =
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.toString()
              : input.url;

        return new URL(rawUrl, window.location.origin).pathname;
      } catch {
        return "";
      }
    }

    function isCreditChangingEndpoint(pathname: string) {
      return (
        pathname === "/api/banners/generate" ||
        pathname === "/api/banners/edit" ||
        pathname === "/api/ai/professional-image" ||
        pathname === "/api/seedance/start" ||
        /^\/api\/banners\/[^/]+\/motion\/start$/.test(pathname) ||
        /^\/api\/banners\/status\/[^/]+$/.test(pathname) ||
        /^\/api\/seedance\/status\/[^/]+$/.test(pathname) ||
        /^\/api\/remotion\/status\/[^/]+$/.test(pathname)
      );
    }

    const originalFetch = window.fetch.bind(window);
    const patchedFetch: typeof window.fetch = async (input, init) => {
      const response = await originalFetch(input, init);
      const pathname = getRequestPath(input);

      if (isCreditChangingEndpoint(pathname)) {
        void response
          .clone()
          .json()
          .then((data: { remainingCredits?: unknown }) => {
            if (typeof data?.remainingCredits === "number") {
              handleCreditsUpdated(
                new CustomEvent("dj-credits-updated", {
                  detail: { remainingCredits: data.remainingCredits },
                }),
              );
              return;
            }

            void refreshCredits();
          })
          .catch(() => {
            void refreshCredits();
          });
      }

      return response;
    };

    window.fetch = patchedFetch;

    window.addEventListener("dj-credits-updated", handleCreditsUpdated);
    window.addEventListener("dj-credits-refresh", handleCreditsUpdated);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void refreshCredits();
      }
    }, 8000);

    return () => {
      ignore = true;
      window.removeEventListener("dj-credits-updated", handleCreditsUpdated);
      window.removeEventListener("dj-credits-refresh", handleCreditsUpdated);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (window.fetch === patchedFetch) {
        window.fetch = originalFetch;
      }
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (isAnimatedFlyerRoute) {
      setAnimatedFlyerOpen(true);
    }
  }, [isAnimatedFlyerRoute]);

  useEffect(() => {
    const storedValue = window.localStorage.getItem(
      "dj_visuals_sidebar_collapsed",
    );
    if (storedValue === "1") {
      setDesktopCollapsed(true);
    }
  }, []);

  function toggleDesktopSidebar() {
    setDesktopCollapsed((current) => {
      const nextValue = !current;
      window.localStorage.setItem(
        "dj_visuals_sidebar_collapsed",
        nextValue ? "1" : "0",
      );
      return nextValue;
    });
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore fetch failure and still redirect
    } finally {
      setMobileOpen(false);
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <div className="dashboard-sales-shell min-h-screen text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700;800;900&family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

        .dashboard-sales-shell {
          --cx: #00f5ff;
          --cv: #bf5fff;
          --cg: #5dffb8;
          --surface: rgba(255,255,255,0.035);
          --surface-strong: rgba(255,255,255,0.06);
          --border-x: rgba(0,245,255,0.18);
          --border-v: rgba(191,95,255,0.18);
          --muted: rgba(255,255,255,0.5);
          background: #03040a;
          font-family: 'DM Sans', sans-serif;
        }

        .dashboard-orb { font-family: 'Orbitron', monospace; }
        .dashboard-mono { font-family: 'Space Mono', monospace; }

        .dashboard-grid {
          background-image:
            linear-gradient(rgba(0,245,255,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(191,95,255,0.045) 1px, transparent 1px);
          background-size: 46px 46px;
        }

        .dashboard-hud,
        .dashboard-hud-v {
          position: relative;
          border-radius: 0;
          background: linear-gradient(160deg, rgba(255,255,255,0.052), rgba(255,255,255,0.018));
          border: 1px solid rgba(255,255,255,0.075);
          overflow: hidden;
        }

        .dashboard-hud::before,
        .dashboard-hud::after,
        .dashboard-hud-v::before,
        .dashboard-hud-v::after {
          content: '';
          position: absolute;
          width: 16px;
          height: 16px;
          pointer-events: none;
          z-index: 2;
        }

        .dashboard-hud::before {
          top: -1px;
          left: -1px;
          border-top: 2px solid var(--cx);
          border-left: 2px solid var(--cx);
          box-shadow: -4px -4px 20px rgba(0,245,255,0.16);
        }

        .dashboard-hud::after {
          right: -1px;
          bottom: -1px;
          border-right: 2px solid var(--cv);
          border-bottom: 2px solid var(--cv);
          box-shadow: 4px 4px 20px rgba(191,95,255,0.14);
        }

        .dashboard-hud-v::before {
          top: -1px;
          left: -1px;
          border-top: 2px solid var(--cv);
          border-left: 2px solid var(--cv);
        }

        .dashboard-hud-v::after {
          right: -1px;
          bottom: -1px;
          border-right: 2px solid var(--cx);
          border-bottom: 2px solid var(--cx);
        }

        .dashboard-chip-cx,
        .dashboard-chip-v {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 2px;
          font-family: 'Space Mono', monospace;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.18em;
          line-height: 1;
          padding: 5px 8px;
          text-transform: uppercase;
        }

        .dashboard-chip-cx {
          border: 1px solid rgba(0,245,255,0.26);
          background: rgba(0,245,255,0.08);
          color: var(--cx);
          box-shadow: inset 0 0 18px rgba(0,245,255,0.05);
        }

        .dashboard-chip-v {
          border: 1px solid rgba(191,95,255,0.24);
          background: rgba(191,95,255,0.08);
          color: #d9b2ff;
        }

        .dashboard-scanline {
          background: linear-gradient(90deg, transparent, rgba(0,245,255,0.55), rgba(191,95,255,0.45), transparent);
          animation: dashboardShimmer 4.5s ease-in-out infinite;
        }

        .dashboard-credit-meter {
          background: linear-gradient(90deg, rgba(0,245,255,0.85), rgba(191,95,255,0.78));
          box-shadow: 0 0 22px rgba(0,245,255,0.22);
        }

        .dashboard-mobile-safe-scroll {
          padding-bottom: max(18px, env(safe-area-inset-bottom));
        }

        @keyframes dashboardShimmer {
          0% { transform: translateX(-110%); opacity: 0; }
          18% { opacity: 0.85; }
          50% { opacity: 0.25; }
          100% { transform: translateX(110%); opacity: 0; }
        }
      `}</style>

      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(0,245,255,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(191,95,255,0.15),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(93,255,184,0.055),transparent_28%),linear-gradient(180deg,#050712,#03040a_54%,#010208)]" />
      <div className="dashboard-grid fixed inset-0 -z-10 opacity-35" />
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />

      <div className="lg:flex">
        <aside
          className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:z-40 lg:flex-col lg:border-r lg:border-cyan-300/15 lg:bg-[#03040a]/94 lg:shadow-[24px_0_90px_rgba(0,0,0,0.52)] lg:backdrop-blur-2xl lg:transition-[width] lg:duration-300 ${
            desktopCollapsed ? "lg:w-[92px]" : "lg:w-[304px]"
          }`}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-36 top-8 h-72 w-72 rounded-full bg-cyan-300/14 blur-3xl" />
            <div className="absolute -right-40 top-60 h-72 w-72 rounded-full bg-violet-500/13 blur-3xl" />
            <div className="absolute inset-0 dashboard-grid opacity-30" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/55 to-transparent" />
          </div>

          <button
            type="button"
            onClick={toggleDesktopSidebar}
            className="group absolute right-0 top-[92px] z-[80] hidden h-10 w-10 translate-x-1/2 items-center justify-center border border-cyan-300/28 bg-[#050712] text-cyan-100 shadow-[0_0_32px_rgba(0,245,255,0.24),0_18px_55px_rgba(0,0,0,0.68)] transition hover:border-cyan-200/50 hover:bg-cyan-300/10 hover:text-white lg:inline-flex"
            aria-label={
              desktopCollapsed
                ? sidebarControlCopy.expand
                : sidebarControlCopy.collapse
            }
            title={
              desktopCollapsed
                ? sidebarControlCopy.expand
                : sidebarControlCopy.collapse
            }
          >
            <span className="pointer-events-none absolute inset-1 border border-violet-300/12 transition group-hover:border-violet-200/24" />
            <span className="pointer-events-none absolute -inset-2 -z-10 bg-cyan-300/10 blur-xl opacity-80 transition group-hover:opacity-100" />
            {desktopCollapsed ? (
              <ChevronsRight className="relative h-4 w-4" />
            ) : (
              <ChevronsLeft className="relative h-4 w-4" />
            )}
          </button>

          <div
            className={`relative flex h-full flex-col ${desktopCollapsed ? "p-3" : "p-4"}`}
          >
            <BrandBlock
              studioLabel={copy.brand.studio}
              collapsed={desktopCollapsed}
            />

            {!desktopCollapsed ? (
              <div className="mt-4 flex items-center gap-3 px-1">
                <span className="dashboard-mono text-[9px] font-bold uppercase tracking-[0.24em] text-cyan-200/72">
                  {copy.shell.panel}
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-cyan-300/25 via-violet-300/15 to-transparent" />
              </div>
            ) : null}

            <nav
              className={`flex-1 space-y-2 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${desktopCollapsed ? "mt-4 pr-0" : "mt-3 pr-1"}`}
            >
              {navItems.map((item) =>
                item.key === "animatedFlyer" ? (
                  <AnimatedFlyerNavGroup
                    key={item.key}
                    item={item}
                    label={getNavItemLabel(item.key, copy, normalizedLocale)}
                    subItems={animatedFlyerSubItems}
                    pathname={pathname}
                    locale={normalizedLocale}
                    copy={copy}
                    collapsed={desktopCollapsed}
                    open={animatedFlyerOpen}
                    onToggle={() => {
                      if (desktopCollapsed) {
                        setDesktopCollapsed(false);
                        window.localStorage.setItem(
                          "dj_visuals_sidebar_collapsed",
                          "0",
                        );
                        setAnimatedFlyerOpen(true);
                        return;
                      }

                      setAnimatedFlyerOpen((current) => !current);
                    }}
                    onSubItemClick={() => undefined}
                  />
                ) : (
                  <SidebarLink
                    key={item.href}
                    item={item}
                    label={getNavItemLabel(item.key, copy, normalizedLocale)}
                    pathname={pathname}
                    collapsed={desktopCollapsed}
                    onClick={() => setAnimatedFlyerOpen(false)}
                  />
                ),
              )}
            </nav>

            <div
              className={`mt-5 space-y-3 border-t border-cyan-300/10 pt-4 ${
                desktopCollapsed ? "flex flex-col items-center" : ""
              }`}
            >
              {displayCreditInfo ? (
                desktopCollapsed ? (
                  <CollapsedCreditsPill creditInfo={displayCreditInfo} />
                ) : (
                  <CreditsPanel creditInfo={displayCreditInfo} />
                )
              ) : null}

              <button
                type="button"
                onClick={handleLogout}
                className={`group relative flex min-h-[50px] overflow-hidden border border-white/10 bg-white/[0.025] text-left transition hover:border-red-300/30 hover:bg-red-400/[0.08] ${
                  desktopCollapsed
                    ? "w-12 items-center justify-center px-0"
                    : "w-full items-center gap-3 px-3.5"
                }`}
                aria-label={copy.shell.logout}
                title={desktopCollapsed ? copy.shell.logout : undefined}
              >
                <span className="absolute inset-y-0 left-0 w-px bg-red-300/0 transition group-hover:bg-red-300/55" />
                <span className="inline-flex h-9 w-9 items-center justify-center border border-white/10 bg-white/[0.04] text-white/76 transition group-hover:border-red-300/25 group-hover:bg-red-400/10 group-hover:text-red-100">
                  <LogOut className="h-4 w-4" />
                </span>
                {!desktopCollapsed ? (
                  <span className="dashboard-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/72 transition group-hover:text-red-100">
                    {copy.shell.logout}
                  </span>
                ) : null}
              </button>
            </div>
          </div>
        </aside>

        <div
          className={`flex min-h-screen flex-1 flex-col transition-[margin] duration-300 ${
            desktopCollapsed ? "lg:ml-[92px]" : "lg:ml-[304px]"
          }`}
        >
          <header className="sticky top-0 z-30 border-b border-cyan-300/12 bg-[#03040a]/88 shadow-[0_18px_55px_rgba(0,0,0,0.38)] backdrop-blur-2xl lg:hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,245,255,0.16),transparent_42%),radial-gradient(circle_at_top_right,rgba(191,95,255,0.13),transparent_48%)]" />
            <div className="relative px-3 py-3">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-cyan-300/18 bg-cyan-300/[0.06] text-cyan-100 shadow-[0_0_24px_rgba(0,245,255,0.11)]"
                  aria-label={copy.shell.openMenu}
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div className="min-w-0 flex-1 px-1">
                  <p className="dashboard-mono text-[8px] font-bold uppercase tracking-[0.22em] text-cyan-200/72">
                    DJ Visuals AI
                  </p>
                  <p className="dashboard-orb truncate text-[13px] font-bold uppercase tracking-[0.08em] text-white">
                    {pageLabel}
                  </p>
                </div>

                {displayCreditInfo ? (
                  <button
                    type="button"
                    onClick={() => setMobileOpen(true)}
                    className="group relative inline-flex min-h-11 shrink-0 items-center gap-2 overflow-hidden border border-cyan-300/18 bg-[linear-gradient(135deg,rgba(0,245,255,0.095),rgba(191,95,255,0.055),rgba(255,255,255,0.03))] px-2.5 py-2 text-left shadow-[0_0_24px_rgba(0,245,255,0.10)] transition hover:border-cyan-200/35 hover:bg-cyan-300/[0.09]"
                    aria-label={`${displayCreditInfo.label}: ${displayCreditInfo.value}`}
                  >
                    <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/55 to-transparent" />
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-cyan-300/20 bg-cyan-300/10 text-cyan-100 shadow-[0_0_18px_rgba(0,245,255,0.12)]">
                      <CircleDollarSign className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="dashboard-mono block text-[7px] font-bold uppercase tracking-[0.18em] text-cyan-100/72">
                        {mobileCreditCopy.shortLabel}
                      </span>
                      <span className="mt-0.5 flex items-baseline gap-1.5">
                        <span className="dashboard-orb max-w-[58px] truncate text-[16px] font-black uppercase leading-none text-white">
                          {displayCreditInfo.value}
                        </span>
                        <span className="hidden dashboard-mono text-[7px] font-bold uppercase tracking-[0.12em] text-white/38 min-[380px]:inline">
                          {displayCreditInfo.isUnlimited
                            ? mobileCreditCopy.unlimited
                            : mobileCreditCopy.available}
                        </span>
                      </span>
                    </span>
                  </button>
                ) : null}
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/82 backdrop-blur-sm"
            aria-label={copy.shell.closeMenu}
            onClick={() => setMobileOpen(false)}
          />
          <div className="dashboard-mobile-safe-scroll absolute inset-y-0 left-0 flex w-[92%] max-w-[390px] flex-col overflow-hidden border-r border-cyan-300/15 bg-[#03040a]/96 p-3.5 shadow-[28px_0_100px_rgba(0,0,0,0.68)] backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-28 top-10 h-64 w-64 rounded-full bg-cyan-300/16 blur-3xl" />
              <div className="absolute -right-32 bottom-20 h-64 w-64 rounded-full bg-violet-500/14 blur-3xl" />
              <div className="dashboard-grid absolute inset-0 opacity-32" />
            </div>

            <div className="relative flex items-start justify-between gap-4">
              <BrandBlock studioLabel={copy.brand.studio} />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-white/10 bg-white/[0.04] text-white transition hover:border-cyan-300/25 hover:text-cyan-100"
                aria-label={copy.shell.closeMenu}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="relative mt-5 flex-1 space-y-2 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {navItems.map((item) =>
                item.key === "animatedFlyer" ? (
                  <AnimatedFlyerNavGroup
                    key={item.key}
                    item={item}
                    label={getNavItemLabel(item.key, copy, normalizedLocale)}
                    subItems={animatedFlyerSubItems}
                    pathname={pathname}
                    locale={normalizedLocale}
                    copy={copy}
                    open={animatedFlyerOpen}
                    onToggle={() => setAnimatedFlyerOpen((current) => !current)}
                    onSubItemClick={() => setMobileOpen(false)}
                  />
                ) : (
                  <SidebarLink
                    key={item.href}
                    item={item}
                    label={getNavItemLabel(item.key, copy, normalizedLocale)}
                    pathname={pathname}
                    onClick={() => {
                      setAnimatedFlyerOpen(false);
                      setMobileOpen(false);
                    }}
                  />
                ),
              )}
            </nav>

            <div className="relative mt-5 space-y-3 border-t border-cyan-300/10 pt-4">
              {displayCreditInfo ? (
                <CreditsPanel creditInfo={displayCreditInfo} compact />
              ) : null}

              <button
                type="button"
                onClick={handleLogout}
                className="group relative flex min-h-[50px] w-full items-center gap-3 overflow-hidden border border-white/10 bg-white/[0.025] px-3.5 text-left transition hover:border-red-300/30 hover:bg-red-400/[0.08]"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center border border-white/10 bg-white/[0.04] text-white/76 transition group-hover:border-red-300/25 group-hover:bg-red-400/10 group-hover:text-red-100">
                  <LogOut className="h-4 w-4" />
                </span>
                <span className="dashboard-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/72 transition group-hover:text-red-100">
                  {copy.shell.logout}
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AnimatedFlyerNavGroup({
  item,
  label,
  subItems,
  pathname,
  locale,
  copy,
  collapsed = false,
  open,
  onToggle,
  onSubItemClick,
}: {
  item: NavItem;
  label: string;
  subItems: NavItem[];
  pathname: string;
  locale: SupportedLocale;
  copy: ReturnType<typeof getDashboardCopy>;
  collapsed?: boolean;
  open: boolean;
  onToggle: () => void;
  onSubItemClick: () => void;
}) {
  const active = subItems.some((subItem) =>
    isNavItemActive(pathname, subItem.href),
  );
  const highlighted = active;
  const Icon = item.icon;

  return (
    <div className={collapsed ? "" : "space-y-1"}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={collapsed ? undefined : open}
        title={collapsed ? label : undefined}
        className={`group relative flex min-h-[50px] w-full items-center overflow-hidden text-left transition duration-200 ${
          collapsed ? "justify-center px-0" : "justify-between gap-3 px-3"
        } ${
          collapsed
            ? highlighted
              ? "border border-transparent bg-transparent text-cyan-100"
              : "border border-transparent bg-transparent text-white/64 hover:text-cyan-50"
            : highlighted
              ? "dashboard-hud border-cyan-300/25 bg-[linear-gradient(135deg,rgba(0,245,255,0.12),rgba(191,95,255,0.07),rgba(255,255,255,0.025))] text-white shadow-[0_0_34px_rgba(0,245,255,0.11)]"
              : "border border-transparent bg-transparent text-white/72 hover:border-cyan-300/18 hover:bg-white/[0.04] hover:text-white"
        }`}
      >
        {highlighted && !collapsed ? (
          <>
            <span className="absolute inset-y-2 left-0 w-px bg-cyan-300 shadow-[0_0_16px_rgba(0,245,255,0.72)]" />
            <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_50%,rgba(0,245,255,0.16),transparent_34%)]" />
            <span className="dashboard-scanline pointer-events-none absolute inset-x-0 top-0 h-px" />
          </>
        ) : null}

        {highlighted && collapsed ? (
          <span className="absolute left-1 top-1/2 h-5 w-px -translate-y-1/2 bg-cyan-300 shadow-[0_0_14px_rgba(0,245,255,0.82)]" />
        ) : null}

        <span
          className={`relative flex min-w-0 items-center ${collapsed ? "justify-center" : "gap-3"}`}
        >
          <span
            className={`inline-flex shrink-0 items-center justify-center transition ${
              collapsed
                ? "h-11 w-11 border-0 bg-transparent shadow-none"
                : "h-9 w-9 border"
            } ${
              collapsed
                ? highlighted
                  ? "text-cyan-200"
                  : "text-white/58 group-hover:text-cyan-50"
                : highlighted
                  ? "border-cyan-300/25 bg-cyan-300/10 text-cyan-100 shadow-[0_0_22px_rgba(0,245,255,0.13)]"
                  : "border-white/8 bg-white/[0.035] text-white/64 group-hover:border-cyan-300/24 group-hover:bg-cyan-300/[0.07] group-hover:text-cyan-50"
            }`}
          >
            <Icon className={collapsed ? "h-5 w-5" : "h-4 w-4"} />
          </span>
          {!collapsed ? (
            <span className="dashboard-mono truncate text-[10.5px] font-black uppercase tracking-[0.13em]">
              {label}
            </span>
          ) : null}
        </span>

        {collapsed ? (
          <span className="absolute right-2 top-2 h-1.5 w-1.5 bg-violet-200 shadow-[0_0_12px_rgba(191,95,255,0.9)]" />
        ) : (
          <span className="relative flex items-center gap-2">
            <span
              className={`inline-flex h-7 w-7 shrink-0 items-center justify-center border transition ${
                highlighted
                  ? "border-violet-200/35 bg-violet-300/12 text-violet-100"
                  : "border-violet-300/16 bg-violet-300/7 text-violet-200/78 group-hover:border-violet-200/34 group-hover:text-violet-50"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <ChevronDown
              className={`h-4 w-4 text-cyan-100/76 transition duration-200 ${open ? "rotate-180" : ""}`}
            />
          </span>
        )}
      </button>

      {!collapsed && open ? (
        <div className="ml-5 space-y-1 border-l border-cyan-300/14 pl-3">
          {subItems.map((subItem) => (
            <AnimatedFlyerSubLink
              key={subItem.href}
              item={subItem}
              label={getNavItemLabel(subItem.key, copy, locale)}
              pathname={pathname}
              onClick={onSubItemClick}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function AnimatedFlyerSubLink({
  item,
  label,
  pathname,
  onClick,
}: {
  item: NavItem;
  label: string;
  pathname: string;
  onClick: () => void;
}) {
  const active = isNavItemActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={`group relative flex min-h-[42px] items-center justify-between gap-3 overflow-hidden border px-3 transition ${
        active
          ? "border-cyan-300/20 bg-cyan-300/[0.08] text-cyan-50 shadow-[0_0_24px_rgba(0,245,255,0.08)]"
          : "border-transparent bg-white/[0.018] text-white/68 hover:border-cyan-300/18 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      {active ? (
        <span className="absolute inset-y-2 left-0 w-px bg-cyan-300 shadow-[0_0_14px_rgba(0,245,255,0.7)]" />
      ) : null}
      <span className="relative flex min-w-0 items-center pl-2">
        <span className="dashboard-mono truncate text-[9.5px] font-black uppercase tracking-[0.14em]">
          {label}
        </span>
      </span>

      {item.badgeType === "ai" ? (
        <span
          className={`relative inline-flex h-6 w-6 shrink-0 items-center justify-center border transition ${
            active
              ? "border-violet-200/30 bg-violet-300/12 text-violet-100"
              : "border-violet-300/12 bg-violet-300/[0.055] text-violet-200/72 group-hover:border-violet-200/30 group-hover:text-violet-50"
          }`}
        >
          <Sparkles className="h-3 w-3" />
        </span>
      ) : null}
    </Link>
  );
}

function SidebarLink({
  item,
  label,
  pathname,
  collapsed = false,
  onClick,
}: {
  item: NavItem;
  label: string;
  pathname: string;
  collapsed?: boolean;
  onClick: () => void;
}) {
  const active = isNavItemActive(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={`group relative flex min-h-[50px] items-center overflow-hidden transition duration-200 ${
        collapsed ? "justify-center px-0" : "justify-between gap-3 px-3"
      } ${
        collapsed
          ? active
            ? "border border-transparent bg-transparent text-cyan-100"
            : "border border-transparent bg-transparent text-white/64 hover:text-cyan-50"
          : active
            ? "dashboard-hud border-cyan-300/25 bg-[linear-gradient(135deg,rgba(0,245,255,0.12),rgba(191,95,255,0.07),rgba(255,255,255,0.025))] text-white shadow-[0_0_34px_rgba(0,245,255,0.11)]"
            : "border border-transparent bg-transparent text-white/72 hover:border-cyan-300/18 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      {active && !collapsed ? (
        <>
          <span className="absolute inset-y-2 left-0 w-px bg-cyan-300 shadow-[0_0_16px_rgba(0,245,255,0.72)]" />
          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_50%,rgba(0,245,255,0.16),transparent_34%)]" />
          <span className="dashboard-scanline pointer-events-none absolute inset-x-0 top-0 h-px" />
        </>
      ) : null}

      {active && collapsed ? (
        <span className="absolute left-1 top-1/2 h-5 w-px -translate-y-1/2 bg-cyan-300 shadow-[0_0_14px_rgba(0,245,255,0.82)]" />
      ) : null}

      <span
        className={`relative flex min-w-0 items-center ${collapsed ? "justify-center" : "gap-3"}`}
      >
        <span
          className={`inline-flex shrink-0 items-center justify-center transition ${
            collapsed
              ? "h-11 w-11 border-0 bg-transparent shadow-none"
              : "h-9 w-9 border"
          } ${
            collapsed
              ? active
                ? "text-cyan-200"
                : "text-white/58 group-hover:text-cyan-50"
              : active
                ? "border-cyan-300/25 bg-cyan-300/10 text-cyan-100 shadow-[0_0_22px_rgba(0,245,255,0.13)]"
                : "border-white/8 bg-white/[0.035] text-white/64 group-hover:border-cyan-300/24 group-hover:bg-cyan-300/[0.07] group-hover:text-cyan-50"
          }`}
        >
          <Icon className={collapsed ? "h-5 w-5" : "h-4 w-4"} />
        </span>
        {!collapsed ? (
          <span className="dashboard-mono truncate text-[10.5px] font-black uppercase tracking-[0.13em]">
            {label}
          </span>
        ) : null}
      </span>

      {collapsed && item.badgeType === "ai" ? (
        <span className="absolute right-2 top-2 h-1.5 w-1.5 bg-violet-200 shadow-[0_0_12px_rgba(191,95,255,0.9)]" />
      ) : item.badgeType === "ai" ? (
        <span
          className={`relative inline-flex h-7 w-7 shrink-0 items-center justify-center border transition ${
            active
              ? "border-violet-200/35 bg-violet-300/12 text-violet-100"
              : "border-violet-300/16 bg-violet-300/7 text-violet-200/78 group-hover:border-violet-200/34 group-hover:text-violet-50"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
        </span>
      ) : item.badge ? (
        <span className="dashboard-chip-v py-1 text-[7px]">{item.badge}</span>
      ) : null}
    </Link>
  );
}

function CollapsedCreditsPill({
  creditInfo,
}: {
  creditInfo: SidebarCreditInfo;
}) {
  return (
    <div
      className="group relative flex h-12 w-12 items-center justify-center border border-cyan-300/16 bg-cyan-300/[0.055] text-cyan-100 shadow-[0_0_24px_rgba(0,245,255,0.08)]"
      aria-label={`${creditInfo.label}: ${creditInfo.value}`}
      title={`${creditInfo.label}: ${creditInfo.value} · ${creditInfo.usage}`}
    >
      <CircleDollarSign className="h-5 w-5" />
      <span className="absolute -right-1 -top-1 min-w-5 border border-cyan-200/30 bg-[#03040a] px-1 text-center dashboard-mono text-[8px] font-black uppercase leading-4 text-white shadow-[0_0_16px_rgba(0,245,255,0.16)]">
        {creditInfo.isUnlimited ? "∞" : creditInfo.value}
      </span>
    </div>
  );
}

function CreditsPanel({
  creditInfo,
  compact = false,
}: {
  creditInfo: SidebarCreditInfo;
  compact?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden border border-cyan-300/12 bg-white/[0.025] shadow-[0_12px_34px_rgba(0,0,0,0.18)] ${
        compact ? "px-3 py-2" : "px-3 py-2.5"
      }`}
      aria-label={`${creditInfo.label}: ${creditInfo.value}`}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/42 to-transparent" />

      <div className="relative flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-cyan-300/18 bg-cyan-300/[0.07] text-cyan-100 shadow-[0_0_18px_rgba(0,245,255,0.09)]">
            <CircleDollarSign className="h-4 w-4" />
          </span>

          <div className="min-w-0">
            <p className="dashboard-mono truncate text-[8px] font-black uppercase tracking-[0.16em] text-cyan-100/62">
              {creditInfo.label}
            </p>
            <p className="dashboard-mono mt-0.5 truncate text-[7px] font-bold uppercase tracking-[0.12em] text-white/54">
              {creditInfo.planLabel}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="dashboard-orb text-[18px] font-black uppercase leading-none tracking-[-0.04em] text-white">
            {creditInfo.isUnlimited ? "∞" : creditInfo.value}
          </p>
          <p className="dashboard-mono mt-0.5 max-w-[92px] truncate text-[7px] font-bold uppercase tracking-[0.12em] text-white/62">
            {creditInfo.usage}
          </p>
        </div>
      </div>
    </div>
  );
}

function BrandBlock({
  studioLabel,
  collapsed = false,
}: {
  studioLabel: string;
  collapsed?: boolean;
}) {
  if (collapsed) {
    return (
      <Link
        href="/dashboard"
        className="group relative flex h-14 w-full items-center justify-center transition"
        aria-label="DJ Visuals AI"
        title="DJ Visuals AI"
      >
        <span className="relative inline-flex h-12 w-12 shrink-0 items-center justify-center border border-cyan-300/24 bg-cyan-300/10 text-cyan-100 shadow-[0_0_30px_rgba(0,245,255,0.18)] transition group-hover:border-cyan-200/38 group-hover:bg-cyan-300/14">
          <span className="absolute inset-1 border border-violet-300/18" />
          <Sparkles className="relative h-5 w-5" />
        </span>
      </Link>
    );
  }

  return (
    <Link href="/dashboard" className="group relative block p-4 transition">
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <span className="dashboard-chip-cx">● AI Studio</span>
          <span className="dashboard-mono text-[8px] font-bold uppercase tracking-[0.18em] text-white/44">
            v2
          </span>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center border border-cyan-300/24 bg-cyan-300/10 text-cyan-100 shadow-[0_0_30px_rgba(0,245,255,0.18)]">
            <span className="absolute inset-1 border border-violet-300/18" />
            <Sparkles className="relative h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="dashboard-orb truncate text-[15px] font-black uppercase tracking-[0.06em] text-white">
              DJ Visuals AI
            </p>
            <p className="dashboard-mono mt-1 truncate text-[9px] font-bold uppercase tracking-[0.16em] text-cyan-100/72">
              {studioLabel}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
