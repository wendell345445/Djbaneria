import {
  SubscriptionPlan,
  SubscriptionStatus,
  UsageEventType,
} from "@/generated/prisma/enums";

import { isAdminEmail } from "@/lib/admin";
import { NewBannerForm } from "@/components/new-banner-form";
import { buildBillingSummary } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { requireCurrentWorkspace } from "@/lib/workspace";

export default async function NewBannerPage() {
  const workspace = await requireCurrentWorkspace();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const usageEvents = await prisma.usageEvent.findMany({
    where: {
      workspaceId: workspace.id,
      createdAt: { gte: monthStart },
      type: {
        in: [
          UsageEventType.BANNER_GENERATION,
          UsageEventType.BANNER_EDIT,
          UsageEventType.BANNER_VARIATION,
        ],
      },
    },
    select: {
      units: true,
      createdAt: true,
      metadata: true,
    },
  });

  const summary = buildBillingSummary({
    plan: workspace.subscription?.plan || SubscriptionPlan.FREE,
    status: workspace.subscription?.status || SubscriptionStatus.TRIALING,
    usageEvents,
  });

  const isAdmin = isAdminEmail(workspace.user?.email);
  const planLabel = isAdmin
    ? `${getPlanDisplayName(summary.plan)} Admin`
    : getPlanDisplayName(summary.plan);
  const usageLabel = isAdmin
    ? `${summary.usedThisMonth} / ∞`
    : `${summary.usedThisMonth} / ${summary.monthlyLimit}`;
  const remainingLabel = isAdmin ? "Ilimitado" : String(summary.remainingCredits);
  const usagePercent = isAdmin
    ? 100
    : summary.monthlyLimit > 0
      ? Math.min(
          100,
          Math.round((summary.usedThisMonth / summary.monthlyLimit) * 100),
        )
      : 0;

  return (
    <main className="mx-auto max-w-[1320px] px-5 py-7">
      <div className="mb-7 flex justify-center xl:justify-end">
        <PlanUsageCard
          plan={summary.plan}
          planLabel={planLabel}
          usageLabel={usageLabel}
          remainingLabel={remainingLabel}
          usagePercent={usagePercent}
          status={summary.status}
          isAdmin={isAdmin}
        />
      </div>

      {!isAdmin && !workspace.user?.emailVerifiedAt ? (
        <EmailVerificationRequiredCard email={workspace.user?.email || ""} />
      ) : (
        <NewBannerForm
          currentPlan={summary.plan}
          isAdmin={isAdmin}
          canGenerateBanner={isAdmin || summary.canGenerateBanner}
          initialRemainingCredits={isAdmin ? null : summary.remainingCredits}
        />
      )}

      {isAdmin ? (
        <section className="mt-5 rounded-3xl border border-sky-300/15 bg-gradient-to-br from-sky-400/10 via-white/[0.03] to-violet-400/10 p-5 shadow-[0_24px_80px_rgba(56,189,248,0.08)]">
          <p className="m-0 text-xs uppercase tracking-[0.2em] text-white/50">
            Modo teste admin
          </p>
          <p className="mt-2 text-sm leading-7 text-white/80">
            Esta conta está liberada para gerar banners sem limite de créditos
            durante os testes.
          </p>
        </section>
      ) : null}
    </main>
  );
}

function getPlanDisplayName(plan: SubscriptionPlan) {
  const labels: Record<SubscriptionPlan, string> = {
    FREE: "Free",
    PRO: "Pro",
    PROFESSIONAL: "Professional",
    STUDIO: "Studio",
  };

  return labels[plan] ?? plan;
}

function getStatusLabel(status: SubscriptionStatus) {
  const labels: Record<SubscriptionStatus, string> = {
    TRIALING: "Teste ativo",
    ACTIVE: "Ativo",
    PAST_DUE: "Pagamento pendente",
    CANCELED: "Cancelado",
    EXPIRED: "Expirado",
  };

  return labels[status] ?? status;
}

function PlanUsageCard({
  plan,
  planLabel,
  usageLabel,
  remainingLabel,
  usagePercent,
  status,
  isAdmin,
}: {
  plan: SubscriptionPlan;
  planLabel: string;
  usageLabel: string;
  remainingLabel: string;
  usagePercent: number;
  status: SubscriptionStatus;
  isAdmin: boolean;
}) {
  const isPremium =
    plan === SubscriptionPlan.PROFESSIONAL || plan === SubscriptionPlan.STUDIO;

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025))] p-4 shadow-[0_24px_90px_rgba(0,0,0,0.25)] backdrop-blur">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-sky-200/70 to-transparent" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-sky-300/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 left-8 h-28 w-28 rounded-full bg-violet-400/10 blur-3xl" />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
            Plano atual
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <strong className="text-xl font-semibold leading-none text-white">
              {planLabel}
            </strong>
            <span
              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                isPremium
                  ? "border-amber-200/30 bg-amber-200/10 text-amber-100"
                  : "border-sky-200/25 bg-sky-200/10 text-sky-100"
              }`}
            >
              {isPremium ? "Premium" : "Essencial"}
            </span>
          </div>
        </div>

        <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100">
          {isAdmin ? "Admin" : getStatusLabel(status)}
        </span>
      </div>

      <div className="relative z-10 mt-4 grid grid-cols-3 gap-2">
        <PlanMetric label="Plano" value={planLabel} />
        <PlanMetric label="Uso" value={usageLabel} />
        <PlanMetric label="Restantes" value={remainingLabel} highlight />
      </div>

      <div className="relative z-10 mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
        <div className="mb-2 flex items-center justify-between gap-3 text-[11px] text-white/55">
          <span>{isAdmin ? "Uso ilimitado para testes" : "Consumo mensal"}</span>
          <strong className="text-white/85">
            {isAdmin ? "∞" : `${usagePercent}%`}
          </strong>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 transition-all duration-700"
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>
    </section>
  );
}

function PlanMetric({
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
      className={`rounded-2xl border px-3 py-3 text-center ${
        highlight
          ? "border-sky-200/20 bg-sky-200/10"
          : "border-white/10 bg-white/[0.045]"
      }`}
    >
      <p className="m-0 text-[9px] uppercase tracking-[0.16em] text-white/42">
        {label}
      </p>
      <div className="mt-1.5 truncate text-[13px] font-semibold leading-none text-white">
        {value}
      </div>
    </div>
  );
}


function EmailVerificationRequiredCard({ email }: { email: string }) {
  return (
    <section className="relative overflow-hidden rounded-[30px] border border-amber-200/20 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.14),transparent_34%),linear-gradient(180deg,rgba(10,16,32,0.98),rgba(7,12,24,0.96))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="relative z-10 max-w-2xl">
        <span className="inline-flex rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-amber-100">
          Verificação pendente
        </span>
        <h2 className="mt-4 text-2xl font-semibold leading-tight text-white">
          Confirme seu e-mail para liberar a geração
        </h2>
        <p className="mt-3 text-sm leading-7 text-white/70">
          Para proteger os créditos grátis contra abuso, confirme o código enviado para <strong className="text-white">{email}</strong>. Depois disso, você poderá gerar seus banners normalmente.
        </p>
        <a
          href={`/verify-email?email=${encodeURIComponent(email)}`}
          className="mt-5 inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95"
        >
          Confirmar e-mail
        </a>
      </div>
    </section>
  );
}
