"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CreditCard,
  Globe2,
  Grid2X2,
  ImagePlus,
  Images,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  X,
} from "lucide-react";

import {
  getDashboardCopy,
  normalizeLocale,
  type SupportedLocale,
} from "@/lib/i18n";

type NavItem = {
  key:
    | "dashboard"
    | "newBanner"
    | "myBanners"
    | "billing"
    | "language"
    | "settings";
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
  { key: "billing", href: "/dashboard/billing", icon: CreditCard },
  { key: "language", href: "/dashboard/settings/language", icon: Globe2 },
  { key: "settings", href: "/dashboard/settings", icon: Settings },
];

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

function getPageLabel(
  pathname: string,
  copy: ReturnType<typeof getDashboardCopy>,
) {
  const match = navItems.find((item) => isNavItemActive(pathname, item.href));
  return match ? copy.nav[match.key] : copy.shell.fallbackPage;
}

export function DashboardSidebar({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale?: SupportedLocale;
}) {
  const normalizedLocale = normalizeLocale(locale);
  const copy = useMemo(
    () => getDashboardCopy(normalizedLocale),
    [normalizedLocale],
  );
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pageLabel = useMemo(
    () => getPageLabel(pathname, copy),
    [copy, pathname],
  );

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
    <div className="min-h-screen bg-[#050916] text-white">
      <div className="lg:flex">
        <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-[280px] lg:flex-col lg:border-r lg:border-white/10 lg:bg-[linear-gradient(180deg,rgba(8,12,24,0.98),rgba(5,8,18,0.96))]">
          <div className="flex h-full flex-col p-5">
            <BrandBlock studioLabel={copy.brand.studio} />
            <nav className="mt-8 flex-1 space-y-2">
              {navItems.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  label={copy.nav[item.key]}
                  pathname={pathname}
                  onClick={() => undefined}
                />
              ))}
            </nav>

            <div className="mt-6 border-t border-white/10 pt-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                  {copy.shell.workspace}
                </p>
                <p className="mt-2 text-sm font-medium text-white/90">
                  DJ Banner AI
                </p>
                <p className="mt-1 text-xs leading-5 text-white/50">
                  {copy.shell.workspaceDescription}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 flex min-h-[48px] w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white/90 transition hover:bg-white/[0.08]"
              >
                <LogOut className="h-4 w-4" />
                <span>{copy.shell.logout}</span>
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col lg:ml-[280px]">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-[rgba(5,9,22,0.88)] backdrop-blur lg:hidden">
            <div className="flex items-center justify-between px-4 py-4">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white"
                aria-label={copy.shell.openMenu}
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="text-center">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                  {copy.shell.panel}
                </p>
                <p className="text-sm font-semibold text-white">{pageLabel}</p>
              </div>

              <Link
                href="/dashboard/banners/new"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-4 text-sm font-bold text-slate-950"
              >
                {copy.shell.new}
              </Link>
            </div>
          </header>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label={copy.shell.closeMenu}
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-[320px] flex-col border-r border-white/10 bg-[linear-gradient(180deg,rgba(8,12,24,0.99),rgba(4,8,18,0.98))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <BrandBlock studioLabel={copy.brand.studio} />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white"
                aria-label={copy.shell.closeMenu}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-8 flex-1 space-y-2 overflow-y-auto">
              {navItems.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  label={copy.nav[item.key]}
                  pathname={pathname}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </nav>

            <div className="mt-6 border-t border-white/10 pt-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                  {copy.shell.information}
                </p>
                <p className="mt-2 text-sm font-medium text-white/90">
                  {copy.shell.informationTitle}
                </p>
                <p className="mt-1 text-xs leading-5 text-white/50">
                  {copy.shell.informationDescription}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 flex min-h-[48px] w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white/90 transition hover:bg-white/[0.08]"
              >
                <LogOut className="h-4 w-4" />
                <span>{copy.shell.logout}</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SidebarLink({
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
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`group flex min-h-[52px] items-center justify-between gap-3 rounded-2xl px-4 transition ${
        active
          ? "border border-sky-300/20 bg-sky-300/[0.08] text-white"
          : "border border-transparent text-white/70 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${
            active
              ? "bg-sky-300/10 text-sky-200"
              : "bg-white/[0.04] text-white/65 group-hover:text-white"
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="truncate text-sm font-medium">{label}</span>
      </span>

      {item.badgeType === "ai" ? (
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-violet-300/20 bg-violet-300/10 text-violet-200">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
      ) : item.badge ? (
        <span className="rounded-full border border-white/10 bg-white/[0.06] px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-white/60">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

function BrandBlock({ studioLabel }: { studioLabel: string }) {
  return (
    <Link
      href="/dashboard"
      className="block rounded-3xl border border-white/10 bg-white/[0.04] p-4"
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-300 via-violet-300 to-amber-200 text-slate-950 shadow-[0_0_28px_rgba(125,211,252,0.22)]">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-white">DJ Banner AI</p>
          <p className="text-xs text-white/45">{studioLabel}</p>
        </div>
      </div>
    </Link>
  );
}
