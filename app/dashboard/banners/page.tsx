import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireCurrentWorkspace } from "@/lib/workspace";

export default async function BannersPage() {
  const workspace = await requireCurrentWorkspace();

  const banners = await prisma.banner.findMany({
    where: {
      workspaceId: workspace.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      djName: true,
      format: true,
      outputImageUrl: true,
      createdAt: true,
    },
  });

  return (
    <main className="mx-auto max-w-[1320px] px-5 py-7">
      <div className="mb-7 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/45">
            Meus banners
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-white xl:text-[40px]">
            Artes do seu workspace
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Visualize os banners criados na sua conta, abra versões recentes e
            acesse rapidamente a criação de uma nova arte.
          </p>
        </div>

        <Link
          href="/dashboard/banners/new"
          className="inline-flex min-h-[50px] items-center justify-center rounded-2xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95"
        >
          Novo banner
        </Link>
      </div>

      {banners.length === 0 ? (
        <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,28,0.96),rgba(5,10,20,0.94))] p-8 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-14 text-center">
            <p className="text-base font-medium text-white/90">
              Você ainda não gerou nenhum banner.
            </p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/55">
              Crie sua primeira arte com IA para começar a montar seu histórico
              de banners neste workspace.
            </p>

            <div className="mt-6">
              <Link
                href="/dashboard/banners/new"
                className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-5 text-sm font-medium text-white transition hover:bg-white/[0.08]"
              >
                Criar meu primeiro banner
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {banners.map((banner) => (
            <Link
              key={banner.id}
              href={`/dashboard/banners/${banner.id}`}
              className="group overflow-hidden rounded-[24px] border border-white/8 bg-white/[0.03] transition hover:border-white/15 hover:bg-white/[0.05]"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-white/[0.02]">
                {banner.outputImageUrl ? (
                  <img
                    src={banner.outputImageUrl}
                    alt={banner.title || "Banner"}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-sm text-white/45">
                    Sem preview
                  </div>
                )}
              </div>

              <div className="grid gap-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="line-clamp-1 text-base font-semibold text-white">
                      {banner.title || "Sem título"}
                    </h2>
                    <p className="mt-1 text-sm text-white/55">
                      {banner.djName || "Sem nome do DJ"}
                    </p>
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/60">
                    {banner.format}
                  </span>
                </div>

                <p className="text-xs text-white/45">
                  {new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(banner.createdAt)}
                </p>
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
