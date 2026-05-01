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
  Camera,
  ArrowRight,
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
    title: "Launch promos faster",
    description:
      "Create polished event visuals in minutes, so you can promote more often without waiting on a designer.",
  },
  {
    icon: Sparkles,
    title: "Made for DJ marketing",
    description:
      "Generate flyers, stories, and promo graphics built for club nights, lineups, releases, and paid ads.",
  },
  {
    icon: Layers3,
    title: "Create more than one look",
    description:
      "Test different creative directions and refine your visuals until they match the vibe of your event or brand.",
  },
  {
    icon: ImageIcon,
    title: "Improve your promo photos",
    description:
      "Turn casual or low-quality DJ photos into cleaner, sharper images that look more professional online.",
  },
  {
    icon: Gauge,
    title: "No design skills needed",
    description:
      "A simple guided workflow helps you create strong visuals even if you have never used design software.",
  },
  {
    icon: ShieldCheck,
    title: "Built for real users",
    description:
      "Protected signup, email verification, and an account-based workspace made for consistent creative output.",
  },
];

const faqs = [
  {
    question: "Do I need design experience?",
    answer:
      "No. DJ Banner AI is built for DJs, producers, and event promoters who want professional visuals without learning design software.",
  },
  {
    question: "What can I create?",
    answer:
      "You can create DJ banners, event flyers, feed posts, story visuals, ad creatives, and cleaner promo photos for your online presence.",
  },
  {
    question: "Can it improve my existing DJ photos?",
    answer:
      "Yes. You can upload a casual or low-quality photo and use AI to make it look cleaner, sharper, and more professional for social media, ads, and artist profiles.",
  },
  {
    question: "Can I use my own photo in a banner?",
    answer:
      "Yes. You can upload your own image as a reference when creating a banner, so the final visual feels closer to your identity.",
  },
  {
    question: "What happens after I sign up?",
    answer:
      "After creating your account and verifying your email, you can access the dashboard and start creating AI-powered promo visuals.",
  },
];

export default function HomePage() {
  return (
    <main
      className={`${poppins.className} min-h-screen overflow-x-hidden bg-[#060816] bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.08),transparent_28%),linear-gradient(180deg,#060816_0%,#060816_45%,#070a18_100%)] text-white`}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes djBeforeAfterReveal {
              0%, 8% { clip-path: inset(0 100% 0 0); }
              45%, 55% { clip-path: inset(0 0 0 0); }
              92%, 100% { clip-path: inset(0 100% 0 0); }
            }

            @keyframes djBeforeAfterHandle {
              0%, 8% { left: 0%; }
              45%, 55% { left: 100%; }
              92%, 100% { left: 0%; }
            }

            @keyframes djBeforeAfterGlow {
              0%, 100% { opacity: 0.35; transform: scale(0.96); }
              50% { opacity: 0.8; transform: scale(1.04); }
            }

            @keyframes djBeforeLabel {
              0%, 16% { opacity: 1; transform: translateY(0); }
              32%, 68% { opacity: 0; transform: translateY(-6px); }
              86%, 100% { opacity: 1; transform: translateY(0); }
            }

            @keyframes djAfterLabel {
              0%, 38% { opacity: 0; transform: translateY(-6px); }
              46%, 58% { opacity: 1; transform: translateY(0); }
              72%, 100% { opacity: 0; transform: translateY(-6px); }
            }

            .dj-before-after-after {
              animation: djBeforeAfterReveal 4.8s ease-in-out infinite;
            }

            .dj-before-after-handle {
              animation: djBeforeAfterHandle 4.8s ease-in-out infinite;
            }

            .dj-before-after-glow {
              animation: djBeforeAfterGlow 4.8s ease-in-out infinite;
            }

            .dj-before-label {
              animation: djBeforeLabel 4.8s ease-in-out infinite;
            }

            .dj-after-label {
              animation: djAfterLabel 4.8s ease-in-out infinite;
            }
          `,
        }}
      />

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(66,153,225,0.18),transparent_26%),radial-gradient(circle_at_80%_10%,rgba(236,72,153,0.14),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(251,191,36,0.1),transparent_28%)]" />

        <header className="sticky top-0 z-30 border-b border-white/8 bg-[#060816]/80 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/80">
                DJ Banner AI
              </p>
              <p className="mt-1 hidden text-sm text-white/55 sm:block">
                AI visuals for DJs, events, and music promotion
              </p>
            </div>

            <nav className="hidden items-center gap-7 text-sm text-white/70 md:flex">
              <a href="#vantagens" className="transition hover:text-white">
                What you get
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
              For DJs who need better promo visuals, faster
            </div>

            <h1 className="mt-5 max-w-4xl text-[34px] font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:mt-6 sm:text-[52px] lg:text-[68px]">
              Create premium DJ banners and cleaner promo photos with AI
            </h1>

            <p className="mt-5 max-w-2xl text-[15px] leading-6 text-white/72 sm:mt-6 sm:text-lg sm:leading-8">
              Generate polished visuals for events, social media, and paid ads —
              from premium DJ banners to cleaner, more professional-looking
              promo photos.
            </p>

            <div className="mt-7 grid gap-3 sm:mt-8 sm:flex sm:flex-wrap sm:gap-4">
              <a
                href="#formulario-cadastro"
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95 sm:w-auto sm:min-h-[54px] sm:px-6"
              >
                Start free
              </a>
              <a
                href="#exemplos"
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl border border-white/12 bg-white/[0.03] px-5 text-sm font-semibold text-white/85 transition hover:bg-white/[0.05] sm:w-auto sm:min-h-[54px] sm:px-6"
              >
                See examples
              </a>
            </div>

            <div className="mt-7 grid gap-3 text-sm text-white/72 sm:mt-8 sm:grid-cols-2">
              {[
                "Premium visuals for events, ads, and social media",
                "No design skills required",
                "Test new creative directions fast",
                "Improve casual DJ photos with AI",
                "Start creating online in minutes",
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
                    title="AI built for DJ marketing"
                    description="Create banners, story visuals, and promo graphics built for the way DJs market online."
                  />
                  <FeatureMiniCard
                    icon={Clock3}
                    title="Move faster"
                    description="Go from a rough idea to a polished visual without waiting days for design work."
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                    Best for
                  </p>
                  <ul className="mt-4 space-y-3 text-sm text-white/70">
                    {[
                      "Club nights and event flyers",
                      "Lineups, schedules, and stories",
                      "Paid ads and promo graphics",
                      "DJ, producer, and artist branding",
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
                    Why it matters
                  </p>
                  <div className="mt-4 space-y-4 text-sm text-white/72">
                    <div>
                      <p className="font-semibold text-white">
                        Promote without design delays
                      </p>
                      <p className="mt-1 leading-6 text-white/60">
                        Create fresh visuals when you need to announce an event,
                        test a campaign, or keep your social channels active.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        A more polished online presence
                      </p>
                      <p className="mt-1 leading-5 text-white/60">
                        Keep your flyers, artist photos, and promo graphics looking
                        consistent, credible, and premium.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 sm:pb-12 lg:px-8">
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.13),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16),transparent_36%),linear-gradient(135deg,rgba(10,15,30,0.98),rgba(7,10,24,0.96))] p-5 shadow-[0_28px_100px_rgba(0,0,0,0.35)] sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/8 px-4 py-2 text-xs font-medium text-cyan-100">
                <Camera size={14} className="text-cyan-200" />
                AI photo enhancement for DJ promo images
              </div>

              <h2 className="mt-5 text-[28px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[42px] lg:text-[48px]">
                Make rough DJ photos look ready for promotion.
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-7 text-white/68 sm:text-lg sm:leading-8">
                DJ Banner AI helps you create more than event banners. It can
                also clean up casual or low-quality DJ photos, giving you a
                sharper image for social media, ads, artist profiles, and promo materials.
              </p>

              <div className="mt-7 grid gap-3">
                {[
                  "Clean up casual or low-quality DJ photos",
                  "Look more polished across your online presence",
                  "Create stronger images for profiles, posts, ads, and promos",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3 text-sm text-white/74"
                  >
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                      <BadgeCheck size={12} />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <a
                href="#formulario-cadastro"
                className="mt-7 inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95 sm:w-auto sm:px-6"
              >
                Improve your photo with AI
                <ArrowRight size={16} className="ml-2" />
              </a>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute -left-8 top-8 h-36 w-36 rounded-full bg-cyan-400/15 blur-3xl" />
              <div className="pointer-events-none absolute -right-6 bottom-8 h-40 w-40 rounded-full bg-violet-400/15 blur-3xl" />

              <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#090f1f] p-4 shadow-[0_24px_90px_rgba(34,211,238,0.12)]">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200/75">
                      Before / After
                    </p>
                    <p className="mt-1 text-sm text-white/55">
                      See how a rough photo becomes a cleaner promo image.
                    </p>
                  </div>

                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-cyan-100">
                    AI enhanced
                  </span>
                </div>

                <div className="relative aspect-[4/5] overflow-hidden rounded-[26px] border border-white/10 bg-slate-950 sm:aspect-[5/4]">
                  <img
                    src="/landing/before-after/dj-before.webp"
                    alt="Casual DJ photo before AI enhancement"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-slate-950/20" />

                  <div className="dj-before-label absolute left-4 top-4 z-30 rounded-full border border-white/10 bg-slate-950/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70 backdrop-blur">
                    Before
                  </div>

                  <div className="dj-before-after-after absolute inset-0 z-10">
                    <img
                      src="/landing/before-after/dj-after.jpg"
                      alt="Professional DJ photo after AI enhancement"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-cyan-950/10" />
                  </div>

                  <div className="dj-after-label absolute right-4 top-4 z-30 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100 backdrop-blur">
                    After
                  </div>

                  <div className="dj-before-after-handle absolute top-0 z-20 h-full w-[2px] -translate-x-1/2 bg-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.65)]">
                    <span className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cyan-200/40 bg-slate-950/75 text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.42)] backdrop-blur">
                      ⇆
                    </span>
                  </div>

                  <div className="absolute inset-x-4 bottom-4 z-30 rounded-2xl border border-cyan-300/15 bg-slate-950/65 px-4 py-3 text-xs leading-5 text-white/78 backdrop-blur">
                    From a rough photo to a cleaner DJ image for profiles, posts, ads, and social media.
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      From rough photo to sharper promo image
                    </p>
                    <p className="mt-1 text-sm leading-6 text-white/58">
                      Look more credible before people even hear your set.
                    </p>
                  </div>
                  <Sparkles className="h-6 w-6 text-cyan-200" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="exemplos"
        className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.25em] text-cyan-200/75">
            Visual examples
          </p>
          <h2 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[42px]">
            See what you can create
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-5 text-white/66">
            Create premium-looking visuals for event promotion, artist
            branding, social media, and paid ads — without starting from a blank canvas.
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
              Why DJs choose DJ Banner AI
            </p>
            <h2 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[42px]">
              A faster way to create visuals that make your DJ brand look more professional.
            </h2>
            <p className="mt-4 text-base leading-6 text-white/66">
              DJ Banner AI helps you create better promo assets, improve your
              online presence, and publish stronger content with less friction.
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
              From idea to publish-ready visual in a simple flow.
            </h2>
            <p className="mt-4 text-base leading-7 text-white/66">
              Add your event details, choose a direction, and let AI help you
              create a polished visual for your next promotion.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#0b1020] p-6">
            <p className="text-sm font-semibold text-white">
              Perfect for DJs who want to:
            </p>
            <div className="mt-5 space-y-4 text-sm text-white/70">
              {[
                "promote events with a more professional look",
                "post more often without getting stuck on design",
                "test ads, flyers, and creative angles faster",
                "save time creating social media and promo visuals",
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
            A few quick answers before you start creating.
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
