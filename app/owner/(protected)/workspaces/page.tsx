import Link from "next/link";

import { OwnerWorkspaceActions } from "@/components/owner-workspace-actions";
import { prisma } from "@/lib/prisma";

type SearchParams = Promise<{
  q?: string;
  status?: string;
  ownerRole?: string;
}>;

export default async function OwnerWorkspacesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const status = (params.status ?? "").trim();
  const ownerRole = (params.ownerRole ?? "").trim();

  const workspaces = await prisma.workspace.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { slug: { contains: q, mode: "insensitive" } },
              { user: { email: { contains: q, mode: "insensitive" } } },
              { user: { name: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
      ...(status === "ACTIVE"
        ? { isActive: true }
        : status === "INACTIVE"
          ? { isActive: false }
          : {}),
      ...(ownerRole && ownerRole !== "ALL"
        ? { user: { role: ownerRole as "USER" | "OWNER" | "SUPER_ADMIN" } }
        : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        },
      },
    },
  });

  const totalWorkspaces = workspaces.length;
  const activeWorkspaces = workspaces.filter(
    (workspace) => workspace.isActive !== false,
  ).length;
  const inactiveWorkspaces = totalWorkspaces - activeWorkspaces;
  const ownerManaged = workspaces.filter(
    (workspace) =>
      workspace.user?.role === "OWNER" || workspace.user?.role === "SUPER_ADMIN",
  ).length;

  return (
    <main className="mx-auto max-w-[1320px] px-5 py-7">
      <div className="mb-7 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/45">
            Owner / Workspaces
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-white xl:text-[40px]">
            Workspaces da plataforma
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Visualize os workspaces criados, identifique o responsável por cada
            conta e acompanhe rapidamente quais ambientes estão ativos.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 xl:justify-end">
          <CompactMetric label="Workspaces" value={String(totalWorkspaces)} />
          <CompactMetric label="Ativos" value={String(activeWorkspaces)} />
          <CompactMetric label="Inativos" value={String(inactiveWorkspaces)} />
          <CompactMetric
            label="Owners"
            value={String(ownerManaged)}
            highlight
          />
        </div>
      </div>

      <section className="mb-6 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,28,0.96),rgba(5,10,20,0.94))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
        <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nome, slug ou e-mail"
            className={inputClassName}
          />

          <select
            name="status"
            defaultValue={status || "ALL"}
            className={inputClassName}
          >
            <option value="ALL" className="bg-slate-950">Todos os status</option>
            <option value="ACTIVE" className="bg-slate-950">Ativos</option>
            <option value="INACTIVE" className="bg-slate-950">Inativos</option>
          </select>

          <select
            name="ownerRole"
            defaultValue={ownerRole || "ALL"}
            className={inputClassName}
          >
            <option value="ALL" className="bg-slate-950">Todos os perfis</option>
            <option value="USER" className="bg-slate-950">Usuário</option>
            <option value="OWNER" className="bg-slate-950">Owner</option>
            <option value="SUPER_ADMIN" className="bg-slate-950">Super admin</option>
          </select>

          <div className="flex gap-3">
            <button
              type="submit"
              className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95"
            >
              Filtrar
            </button>

            <Link
              href="/owner/workspaces"
              className="inline-flex min-h-[46px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-5 text-sm font-medium text-white transition hover:bg-white/[0.08]"
            >
              Limpar
            </Link>
          </div>
        </form>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,28,0.96),rgba(5,10,20,0.94))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">
              Gestão
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Lista de workspaces
            </h2>
          </div>

          <Link
            href="/owner"
            className="inline-flex min-h-[42px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-white transition hover:bg-white/[0.08]"
          >
            Voltar ao overview
          </Link>
        </div>

        {workspaces.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
            <p className="text-sm font-medium text-white/85">
              Nenhum workspace encontrado com os filtros atuais.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-white">
                        {workspace.name || "Sem nome"}
                      </h3>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${
                          workspace.isActive !== false
                            ? "border-emerald-300/15 bg-emerald-300/10 text-emerald-100"
                            : "border-rose-300/15 bg-rose-300/10 text-rose-100"
                        }`}
                      >
                        {workspace.isActive !== false ? "Ativo" : "Inativo"}
                      </span>
                    </div>

                    <p className="mt-2 break-all text-sm text-white/60">
                      {workspace.slug || "Sem slug"}
                    </p>

                    <p className="mt-2 text-xs text-white/45">
                      Criado em{" "}
                      {new Intl.DateTimeFormat("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(workspace.createdAt)}
                    </p>
                  </div>

                  <div className="flex w-full max-w-[520px] flex-col gap-3">
                    <div className="flex items-center justify-end">
                      <OwnerWorkspaceActions
                        workspaceId={workspace.id}
                        isActive={workspace.isActive !== false}
                      />
                    </div>

                    <div>
                      <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-white/45">
                        Responsável
                      </p>

                      <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">
                              {workspace.user?.name || "Sem nome"}
                            </p>
                            <p className="mt-1 break-all text-xs text-white/45">
                              {workspace.user?.email || "Sem e-mail"}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/60">
                              {getRoleLabel(String(workspace.user?.role || "USER"))}
                            </span>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${
                                workspace.user?.isActive !== false
                                  ? "border-emerald-300/15 bg-emerald-300/10 text-emerald-100"
                                  : "border-rose-300/15 bg-rose-300/10 text-rose-100"
                              }`}
                            >
                              {workspace.user?.isActive !== false ? "Conta ativa" : "Conta inativa"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function CompactMetric({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`min-w-[132px] rounded-2xl border px-4 py-3 ${
        highlight
          ? "border-sky-300/20 bg-sky-300/[0.08]"
          : "border-white/10 bg-white/[0.04]"
      }`}
    >
      <p className="m-0 text-[10px] uppercase tracking-[0.18em] text-white/45">
        {label}
      </p>
      <div className="mt-1.5 text-[15px] font-semibold leading-none text-white">
        {value}
      </div>
    </div>
  );
}

function getRoleLabel(role: string) {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super admin";
    case "OWNER":
      return "Owner";
    case "USER":
      return "Usuário";
    default:
      return role || "Usuário";
  }
}

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/50 focus:ring-4 focus:ring-sky-400/10";
