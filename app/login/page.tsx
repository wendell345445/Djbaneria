import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#050916] text-white">
      <div className="mx-auto grid min-h-screen max-w-[1280px] items-center gap-8 px-5 py-8 lg:grid-cols-[minmax(0,1.05fr)_480px]">
        <section className="relative hidden overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,32,0.98),rgba(7,12,24,0.96))] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.35)] lg:block">
          <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />
          <div className="absolute -bottom-16 left-8 h-56 w-56 rounded-full bg-violet-400/10 blur-3xl" />

          <div className="relative z-10 flex h-full flex-col justify-between gap-8">
            <div className="max-w-2xl">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                DJ Banner AI
              </p>
              <h1 className="mt-4 text-[42px] font-semibold leading-[1.02] text-white">
                Sign in and create professional AI banners for your events
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/68">
                A workflow designed for DJs and creators who want to generate
                artwork quickly, request AI adjustments, and download final
                versions without friction.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <FeatureCard
                number="01"
                title="Simple briefing"
                description="Add the title, DJ name, event date, and location."
              />
              <FeatureCard
                number="02"
                title="AI preview"
                description="Preview your artwork in the selected format before downloading."
              />
              <FeatureCard
                number="03"
                title="Fast edits"
                description="Request artwork changes and create refined versions."
              />
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[480px]">
          <LoginForm />
        </section>
      </div>
    </main>
  );
}

function FeatureCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
        {number}
      </p>
      <h2 className="mt-2 text-sm font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-white/60">{description}</p>
    </div>
  );
}
