import type { ComponentType } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Poppins } from "next/font/google";
import {
  BadgeCheck,
  Clock3,
  Gauge,
  ImageIcon,
  Layers3,
  ShieldCheck,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import { landingBannerExamples } from "@/lib/landing-banner-examples";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const RegisterForm = dynamic(
  () => import("@/components/register-form").then((mod) => mod.RegisterForm),
  {
    loading: () => <RegisterFormLoading />,
  },
);

const LandingBannerCarousel = dynamic(
  () =>
    import("@/components/landing-banner-carousel").then(
      (mod) => mod.LandingBannerCarousel,
    ),
  {
    loading: () => <LandingCarouselLoading />,
  },
);

const advantages = [
  {
    icon: Zap,
    title: "Much faster creation",
    description:
      "Add your event details, choose the style, and get a polished visual in minutes to promote your event.",
  },
  {
    icon: Sparkles,
    title: "Visuals built for DJs",
    description:
      "Premium flyer-style layouts designed for visual impact, artist presence, and strong readability on social media.",
  },
  {
    icon: Layers3,
    title: "Variations without starting over",
    description:
      "Test new directions, refine the artwork with AI, and iterate quickly until you find the right version to publish.",
  },
  {
    icon: ImageIcon,
    title: "Use your own photo",
    description:
      "Upload a reference image so the banner feels closer to your identity and more personal.",
  },
  {
    icon: Gauge,
    title: "Simple workflow for everyone",
    description:
      "Even without design experience, you can create professional banners through a guided, intuitive process.",
  },
  {
    icon: ShieldCheck,
    title: "Access control and security",
    description:
      "Email verification, protected signup, and a structure built to scale with more confidence.",
  },
];

const faqs = [
  {
    question: "Do I need design skills to use it?",
    answer:
      "No. The platform is built to help DJs and producers create professional-looking visuals without needing advanced design skills.",
  },
  {
    question: "Can I use my own photo in the banner?",
    answer:
      "Yes. You can upload an image as a reference to generate banners that better match your visual identity.",
  },
  {
    question: "Which formats can I generate?",
    answer:
      "The current workflow is optimized for Feed and Story, the most common formats for events, schedules, and promotional posts.",
  },
  {
    question: "Does signup give me access to the system?",
    answer:
      "After creating your account, you confirm your email with a code and can access the dashboard to start generating AI banners.",
  },
];

export default function HomePage() {
  return (
    <main
      className={`${poppins.className} min-h-screen overflow-x-hidden bg-[#060816] bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.08),transparent_28%),linear-gradient(180deg,#060816_0%,#060816_45%,#070a18_100%)] text-white`}
    >
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(66,153,225,0.18),transparent_26%),radial-gradient(circle_at_80%_10%,rgba(236,72,153,0.14),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(251,191,36,0.1),transparent_28%)]" />

        <header className="sticky top-0 z-30 border-b border-white/8 bg-[#060816]/80 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/80">
                DJ Banner AI
              </p>
              <p className="mt-1 hidden text-sm text-white/55 sm:block">
                Professional AI banners for DJs and events
              </p>
            </div>

            <nav className="hidden items-center gap-7 text-sm text-white/70 md:flex">
              <a href="#vantagens" className="transition hover:text-white">
                Benefits
              </a>
              <a href="#exemplos" className="transition hover:text-white">
                Examples
              </a>
              <a href="#como-funciona" className="transition hover:text-white">
                How it works
              </a>
              <a
                href="#formulario-cadastro"
                className="transition hover:text-white"
              >
                Create account
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden rounded-2xl border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/20 hover:text-white sm:inline-flex"
              >
                Log in
              </Link>
              <a
                href="#formulario-cadastro"
                className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-slate-950 transition hover:opacity-95 sm:px-4 sm:text-sm"
              >
                Start free
              </a>
            </div>
          </div>
        </header>

        <section className="relative mx-auto grid w-full max-w-7xl gap-9 px-4 pb-12 pt-10 sm:gap-14 sm:px-6 sm:pb-16 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-24 lg:pt-20">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/8 px-4 py-2 text-xs font-medium text-cyan-100">
              <BadgeCheck size={14} className="text-cyan-200" />
              Made for DJs, producers, and event promotion
            </div>

            <h1 className="mt-5 max-w-4xl text-[34px] font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:mt-6 sm:text-[52px] lg:text-[68px]">
              Create professional banners for your events in just a few minutes
              using AI
            </h1>

            <p className="mt-5 max-w-2xl text-[15px] leading-6 text-white/72 sm:mt-6 sm:text-lg sm:leading-8">
              Generate high-impact visuals for feed and story, elevate your
              image, promote events faster, and use a simple workflow to create
              professional banners without relying on a designer for every new
              campaign.
            </p>

            <div className="mt-7 grid gap-3 sm:mt-8 sm:flex sm:flex-wrap sm:gap-4">
              <a
                href="#formulario-cadastro"
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95 sm:w-auto sm:min-h-[54px] sm:px-6"
              >
                Create my free account
              </a>
              <a
                href="#exemplos"
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl border border-white/12 bg-white/[0.03] px-5 text-sm font-semibold text-white/85 transition hover:bg-white/[0.05] sm:w-auto sm:min-h-[54px] sm:px-6"
              >
                View banner examples
              </a>
            </div>

            <div className="mt-7 grid gap-3 text-sm text-white/72 sm:mt-8 sm:grid-cols-2">
              {[
                "Generation built for events and schedules",
                "Intuitive workflow for non-designers",
                "Quick AI refinement to test new versions",
                "Simple signup with instant online access",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                    <BadgeCheck size={14} />
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-w-0 lg:pl-6">
            <div className="absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full bg-cyan-400/15 blur-3xl" />
            <div className="relative mx-auto flex w-full max-w-[560px] min-w-0 flex-col gap-4 sm:gap-5">
              <div className="rounded-[24px] sm:rounded-[32px] sm:p-5">
                <div className="flex flex-col gap-3 border-b border-white/8 pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"></div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <FeatureMiniCard
                    icon={Wand2}
                    title="AI focused on flyers"
                    description="Premium-looking visuals for event posts, schedules, and music promotion."
                  />
                  <FeatureMiniCard
                    icon={Clock3}
                    title="Save time"
                    description="Reduce the time between having the idea and publishing the final visual online."
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                    Perfect for
                  </p>
                  <ul className="mt-4 space-y-3 text-sm text-white/70">
                    {[
                      "Party and event promotion",
                      "Weekly schedule stories",
                      "Paid traffic creatives",
                      "DJ and producer promo posts",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-200">
                          <BadgeCheck size={12} />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                    Practical advantage
                  </p>
                  <div className="mt-4 space-y-4 text-sm text-white/72">
                    <div>
                      <p className="font-semibold text-white">
                        Less friction to promote your event
                      </p>
                      <p className="mt-1 leading-6 text-white/60">
                        Always have a new visual ready to promote, reposition
                        your ad, and keep your communication active.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        More visual consistency
                      </p>
                      <p className="mt-1 leading-5 text-white/60">
                        Create banners with an aesthetic aligned with the DJ
                        universe, strengthening your perceived value online.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section
        id="exemplos"
        className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.25em] text-cyan-200/75">
            Visual examples
          </p>
          <h2 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[42px]">
            See banners generated on our platform
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-5 text-white/66">
            Present your events with a more professional aesthetic, highlight
            your identity as a DJ, and publish high-impact visuals in just a few
            minutes.
          </p>
        </div>

        <div className="mt-10 min-h-[520px] sm:min-h-[640px] lg:min-h-[720px]">
          <LandingBannerCarousel examples={landingBannerExamples} />
        </div>
      </section>

      <section
        id="vantagens"
        className="border-y border-white/8 bg-white/[0.02]"
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.25em] text-violet-200/75">
              Platform benefits
            </p>
            <h2 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[42px]">
              Everything you need to create banners faster and with more impact.
            </h2>
            <p className="mt-4 text-base leading-6 text-white/66">
              The platform was designed to reduce friction in creation, improve
              your presentation, and make it easier to promote events and
              schedules.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {advantages.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-[28px] border border-white/10 bg-[#0c1222] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.2)]"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] text-cyan-200">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-white/62">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="como-funciona"
        className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-amber-200/80">
              How it works
            </p>
            <h2 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[42px]">
              From idea to finished banner in a simple flow.
            </h2>
            <p className="mt-4 text-base leading-7 text-white/66">
              No complicated process. You provide what you need, AI creates the
              artwork, and you move to promotion much faster.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#0b1020] p-6">
            <p className="text-sm font-semibold text-white">
              Ideal for anyone who wants to:
            </p>
            <div className="mt-5 space-y-4 text-sm text-white/70">
              {[
                "promote parties with a more professional look",
                "post more often without getting stuck on design",
                "test campaigns and creatives quickly",
                "save time producing social media visuals",
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                    <BadgeCheck size={12} />
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="cadastro"
        className="border-t border-white/8 bg-white/[0.02]"
      >
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div
            id="formulario-cadastro"
            className="min-w-0 scroll-mt-28 lg:scroll-mt-32"
          >
            <div className="min-h-[620px]">
              <RegisterForm locale="en" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.25em] text-cyan-200/75">
            Frequently asked questions
          </p>
          <h2 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[42px]">
            Clear up your doubts before getting started.
          </h2>
        </div>

        <div className="mt-10 space-y-4">
          {faqs.map((item) => (
            <details
              key={item.question}
              className="group rounded-[24px] border border-white/10 bg-white/[0.03] p-6"
            >
              <summary className="cursor-pointer list-none text-left text-lg font-semibold text-white marker:hidden">
                <span className="flex items-center justify-between gap-4">
                  {item.question}
                  <span className="text-white/35 transition group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-4 text-sm leading-7 text-white/62">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/8 bg-[#060816]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-white/50 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© 2026 DJ Banner AI. All rights reserved.</p>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/terms" className="transition hover:text-white">
              Terms of Use
            </Link>
            <Link href="/privacy" className="transition hover:text-white">
              Privacy Policy
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}

function FeatureMiniCard({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.05] text-cyan-200">
        <Icon size={18} />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/58">{description}</p>
    </div>
  );
}

function LandingCarouselLoading() {
  return (
    <div className="mx-auto w-full max-w-[1120px]">
      <div className="relative mx-auto w-full max-w-[420px] sm:max-w-[520px] lg:max-w-[620px]">
        <div className="aspect-[4/5] max-h-[76vh] overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_34%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.16),transparent_34%),linear-gradient(135deg,rgba(15,23,42,1),rgba(2,6,23,1))] shadow-[0_28px_90px_rgba(0,0,0,0.35)] sm:rounded-[34px]">
          <div className="h-full w-full animate-pulse bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent" />
        </div>
      </div>
    </div>
  );
}

function RegisterFormLoading() {
  return (
    <div className="w-full max-w-[560px] rounded-[30px] border border-white/10 bg-[#0b1020] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
      <div className="h-4 w-32 rounded-full bg-white/10" />
      <div className="mt-5 h-8 w-3/4 rounded-2xl bg-white/10" />
      <div className="mt-6 grid gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-12 rounded-2xl border border-white/8 bg-white/[0.045]"
          />
        ))}
      </div>
      <div className="mt-5 h-12 rounded-2xl bg-gradient-to-r from-cyan-300/40 via-sky-300/35 to-violet-300/40" />
    </div>
  );
}

function MiniPill({
  icon: Icon,
  label,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/75">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] text-cyan-200">
        <Icon size={17} />
      </span>
      <span>{label}</span>
    </div>
  );
}
