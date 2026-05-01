import Link from "next/link";
import { SetupPasswordForm } from "@/components/setup-password-form";

type SetupPasswordPageProps = {
  searchParams?: Promise<{
    token?: string;
  }>;
};

export default async function SetupPasswordPage({
  searchParams,
}: SetupPasswordPageProps) {
  const params = await searchParams;
  const token = typeof params?.token === "string" ? params.token : "";

  return (
    <main className="min-h-screen bg-[#060816] bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.14),transparent_28%),linear-gradient(180deg,#060816_0%,#070a18_100%)] px-4 py-8 text-white">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/80">
            DJ Banner AI
          </p>
          <h1 className="mt-5 text-[38px] font-semibold leading-tight tracking-[-0.04em] sm:text-[56px]">
            Your account is almost ready.
          </h1>
          <p className="mt-5 text-base leading-7 text-white/66">
            Create your password and you will be redirected to your dashboard to start the guided tour.
          </p>

          <div className="mt-7 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm font-semibold text-white">
              Already created your password?
            </p>
            <Link
              href="/login"
              className="mt-4 inline-flex min-h-[46px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-5 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
            >
              Sign in
            </Link>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[520px]">
          {token ? (
            <SetupPasswordForm token={token} />
          ) : (
            <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 text-white">
              <h2 className="text-xl font-semibold">Invalid setup link</h2>
              <p className="mt-2 text-sm leading-6 text-white/60">
                The setup token is missing. Open the link from your email again.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
