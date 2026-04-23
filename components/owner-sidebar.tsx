"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Shield, Sparkles } from "lucide-react";

export function OwnerSidebar({
  children,
  userName,
  userEmail,
}: {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  const ownerActive = pathname === "/owner";

  return (
    <div className="min-h-screen bg-[#050916] text-white lg:flex">
      <aside className="lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-[280px] lg:flex-col lg:border-r lg:border-white/10 lg:bg-[linear-gradient(180deg,rgba(8,12,24,0.98),rgba(5,8,18,0.96))]">
        <div className="flex h-full flex-col p-5">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-300 via-violet-300 to-amber-200 text-slate-950">
                <Shield className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                  Owner
                </p>
                <h1 className="text-sm font-semibold text-white">Painel do sistema</h1>
              </div>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            <Link
              href="/owner"
              className={`group flex min-h-[52px] items-center justify-between gap-3 rounded-2xl px-4 transition ${
                ownerActive
                  ? "border border-sky-300/20 bg-sky-300/[0.08] text-white"
                  : "border border-transparent text-white/70 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${
                    ownerActive
                      ? "bg-sky-300/10 text-sky-200"
                      : "bg-white/[0.04] text-white/65 group-hover:text-white"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium">Visão geral</span>
              </span>

              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-violet-300/20 bg-violet-300/10 text-violet-200">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
            </Link>

            <Link
              href="/dashboard"
              className="group flex min-h-[52px] items-center gap-3 rounded-2xl border border-transparent px-4 text-white/70 transition hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-white/65 group-hover:text-white">
                <LayoutDashboard className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium">Voltar ao dashboard</span>
            </Link>
          </nav>

          <div className="mt-auto border-t border-white/10 pt-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                Conta atual
              </p>
              <p className="mt-2 text-sm font-medium text-white/90">{userName}</p>
              <p className="mt-1 break-all text-xs leading-5 text-white/50">
                {userEmail}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 flex min-h-[48px] w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white/90 transition hover:bg-white/[0.08]"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="min-h-screen flex-1 lg:ml-[280px]">
        {children}
      </div>
    </div>
  );
}
