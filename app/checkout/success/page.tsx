import Link from "next/link";
import { MetaPurchaseOnCheckoutSuccess } from "@/components/meta-purchase-on-checkout-success";

type CheckoutSuccessPageProps = {
  searchParams?: Promise<{
    session_id?: string;
  }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const params = await searchParams;
  const sessionId =
    typeof params?.session_id === "string" ? params.session_id : null;

  return (
    <main className="min-h-screen bg-[#060816] bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.14),transparent_28%),linear-gradient(180deg,#060816_0%,#070a18_100%)] px-4 py-8 text-white">
      <MetaPurchaseOnCheckoutSuccess sessionId={sessionId} />

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center justify-center">
        <section className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.98),rgba(7,12,24,0.96))] p-7 text-center shadow-[0_24px_90px_rgba(0,0,0,0.34)] sm:p-10">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/80">
            Payment confirmed
          </p>
          <h1 className="mt-4 text-[32px] font-semibold leading-tight tracking-[-0.04em] sm:text-[46px]">
            Check your email to create your password.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/66">
            Your DJ Banner AI account is being prepared. We sent a secure link
            to the email used at checkout. Create your password, then your first
            login will open the guided tour.
          </p>

          <div className="mt-8 grid gap-3 sm:flex sm:justify-center">
            <Link
              href="/login"
              className="inline-flex min-h-[50px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-6 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
            >
              Go to login
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-[50px] items-center justify-center rounded-2xl bg-gradient-to-r from-sky-300 via-violet-300 to-amber-200 px-6 text-sm font-bold text-slate-950 transition hover:opacity-95"
            >
              Back to site
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
