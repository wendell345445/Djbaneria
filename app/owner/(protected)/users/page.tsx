import Link from "next/link";

import { OwnerUserActions } from "@/components/owner-user-actions";
import { prisma } from "@/lib/prisma";

type SearchParams = Promise<{
  q?: string;
  role?: string;
  status?: string;
}>;

export default async function OwnerUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const role = (params.role ?? "").trim();
  const status = (params.status ?? "").trim();

  const users = await prisma.user.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(role && role !== "ALL"
        ? {
            role: role as "USER" | "OWNER" | "SUPER_ADMIN",
          }
        : {}),
      ...(status === "ACTIVE"
        ? { isActive: true }
        : status === "INACTIVE"
          ? { isActive: false }
          : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      workspaces: {
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.isActive !== false).length;
  const owners = users.filter(
    (user) => user.role === "OWNER" || user.role === "SUPER_ADMIN",
  ).length;
  const totalWorkspaces = users.reduce(
    (total, user) => total + user.workspaces.length,
    0,
  );

  return (
    <main className="mx-auto max-w-[1320px] px-5 py-7">
      <div className="mb-7 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/45">
            Owner / Usuários
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-white xl:text-[40px]">
            Usuários da plataforma
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Visualize as contas cadastradas, identifique owners e acompanhe os
            workspaces vinculados a cada usuário.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 xl:justify-end">
          <CompactMetric label="Usuários" value={String(totalUsers)} />
          <CompactMetric label="Ativos" value={String(activeUsers)} />
          <CompactMetric label="Owners" value={String(owners)} />
          <CompactMetric
            label="Workspaces"
            value={String(totalWorkspaces)}
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
            placeholder="Buscar por nome ou e-mail"
            className={inputClassName}
          />

          <select
            name="role"
            defaultValue={role || "ALL"}
            className={inputClassName}
          >
            <option value="ALL" className="bg-slate-950">
              Todos os perfis
            </option>
            <option value="USER" className="bg-slate-950">
              Usuário
            </option>
            <option value="OWNER" className="bg-slate-950">
              Owner
            </option>
            <option value="SUPER_ADMIN" className="bg-slate-950">
              Super admin
            </option>
          </select>

          <select
            name="status"
            defaultValue={status || "ALL"}
            className={inputClassName}
          >
            <option value="ALL" className="bg-slate-950">
              Todos os status
            </option>
            <option value="ACTIVE" className="bg-slate-950">
              Ativos
            </option>
            <option value="INACTIVE" className="bg-slate-950">
              Inativos
            </option>
          </select>

          <div className="flex gap-3">
            <button
              type="submit"
              className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95"
            >
              Filtrar
            </button>

            <Link
              href="/owner/users"
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
              Lista de usuários
            </h2>
          </div>

          <Link
            href="/owner"
            className="inline-flex min-h-[42px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-white transition hover:bg-white/[0.08]"
          >
            Voltar ao overview
          </Link>
        </div>

        {users.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
            <p className="text-sm font-medium text-white/85">
              Nenhum usuário encontrado com os filtros atuais.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/owner/users/${user.id}`}
                        className="text-base font-semibold text-white transition hover:text-sky-200"
                      >
                        {user.name || "Sem nome"}
                      </Link>

                      <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/60">
                        {getRoleLabel(String(user.role))}
                      </span>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${
                          user.isActive !== false
                            ? "border-emerald-300/15 bg-emerald-300/10 text-emerald-100"
                            : "border-rose-300/15 bg-rose-300/10 text-rose-100"
                        }`}
                      >
                        {user.isActive !== false ? "Ativo" : "Desativado"}
                      </span>
                    </div>

                    <p className="mt-2 break-all text-sm text-white/60">
                      {user.email}
                    </p>

                    <p className="mt-2 text-xs text-white/45">
                      Criado em{" "}
                      {new Intl.DateTimeFormat("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(user.createdAt)}
                    </p>
                  </div>

                  <div className="flex w-full max-w-[520px] flex-col gap-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/owner/users/${user.id}`}
                        className="inline-flex min-h-[38px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
                      >
                        Ver detalhes
                      </Link>

                      <OwnerUserActions
                        userId={user.id}
                        isActive={user.isActive !== false}
                      />
                    </div>

                    <div>
                      <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-white/45">
                        Workspaces vinculados
                      </p>

                      {user.workspaces.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/55">
                          Nenhum workspace vinculado.
                        </div>
                      ) : (
                        <div className="grid gap-2">
                          {user.workspaces.map((workspace) => (
                            <div
                              key={workspace.id}
                              className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-white">
                                    {workspace.name}
                                  </p>
                                  <p className="mt-1 truncate text-xs text-white/45">
                                    {workspace.slug || "Sem slug"}
                                  </p>
                                </div>

                                <span
                                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${
                                    workspace.isActive !== false
                                      ? "border-emerald-300/15 bg-emerald-300/10 text-emerald-100"
                                      : "border-rose-300/15 bg-rose-300/10 text-rose-100"
                                  }`}
                                >
                                  {workspace.isActive !== false ? "Ativo" : "Desativado"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
