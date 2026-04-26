import Link from "next/link";
import { redirect } from "next/navigation";

import { EmbeddedCheckoutForm } from "@/components/embedded-checkout-form";
import { isStripePaidPlan } from "@/lib/stripe";

type CheckoutPageProps = {
  searchParams?: Promise<{
    plan?: string;
  }>;
};

const planLabels: Record<string, string> = {
  PRO: "Pro",
  PROFESSIONAL: "Professional",
  STUDIO: "Studio",
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const params = await searchParams;
  const plan = params?.plan;

  if (!plan || !isStripePaidPlan(plan)) {
    redirect("/dashboard/billing");
  }

  return (
    <main className="mx-auto max-w-[1180px] px-5 py-7">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
            Assinatura
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white md:text-[34px]">
            Checkout do plano {planLabels[plan]}
          </h1>
        </div>

        <Link
          href="/dashboard/billing"
          className="inline-flex min-h-[42px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-white transition hover:bg-white/[0.09]"
        >
          Voltar aos planos
        </Link>
      </div>

      <EmbeddedCheckoutForm plan={plan} />
    </main>
  );
}
