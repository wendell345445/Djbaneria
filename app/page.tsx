import Link from "next/link";
import dynamic from "next/dynamic";
import { Poppins } from "next/font/google";
import {
  BadgeCheck,
  Gauge,
  ImageIcon,
  Layers3,
  ShieldCheck,
  Sparkles,
  Zap,
  Camera,
  ArrowRight,
  Quote,
} from "lucide-react";
import { landingBannerExamples } from "@/lib/landing-banner-examples";
import { PublicPlanCheckoutButton } from "@/components/public-plan-checkout-button";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

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
      "No. DJ Banner AI is built for DJs, producers, and event promoters who want professional-looking visuals without learning design software.",
  },
  {
    question: "How many credits does one banner use?",
    answer:
      "A new banner generation uses 1 credit. Requesting an edit or variation also uses 1 credit, so you can test different directions and keep the version you like best.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. You can manage or cancel your subscription from your account. Your access remains active until the end of the billing period already paid for.",
  },
  {
    question: "What happens after I pay?",
    answer:
      "After checkout, your account is created from the email used at payment. You receive a secure email link to create your password, then your first login opens the guided tour.",
  },
  {
    question: "Can I use the flyers for paid ads?",
    answer:
      "Yes. The visuals are made for event promotion, social media, stories, and paid ads. Always make sure the final copy and claims match your event and advertising rules.",
  },
  {
    question: "Can I create feed and story versions?",
    answer:
      "Yes. The platform supports feed and story formats, so you can create visuals for Instagram posts, stories, ads, and other DJ promo placements.",
  },
  {
    question: "Can I use my own DJ photo?",
    answer:
      "Yes. You can upload your own photo as a reference when creating a banner, or use the AI photo enhancement flow to make casual photos look more polished for promotion.",
  },
  {
    question: "Can I request changes to a generated banner?",
    answer:
      "Yes. After a banner is generated, you can request edits and test different creative directions. Each edit uses 1 credit.",
  },
];

const pricingPlans = [
  {
    plan: "PRO",
    name: "Pro",
    price: "$12.99",
    period: "/month",
    description:
      "For DJs who need consistent, professional visuals for regular event promotion.",
    credits: "20 credits / month",
    costNote: "About $0.65 per generation",
    cta: "Start Pro",
    highlighted: false,
    features: [
      "20 AI generations per month",
      "Premium DJ flyer and banner creation",
      "AI promo photo enhancement",
      "Feed and story formats",
      "Cancel anytime",
    ],
  },
  {
    plan: "PROFESSIONAL",
    name: "Professional",
    price: "$24.99",
    period: "/month",
    description:
      "Best for DJs running ads, weekly promos, stories, and frequent event announcements.",
    credits: "40 credits / month",
    costNote: "About $0.62 per generation",
    cta: "Start Professional",
    highlighted: true,
    features: [
      "40 AI generations per month",
      "Premium and pro visual styles",
      "High-quality image generation",
      "Professional DJ photo enhancement",
      "Best for paid ads and social media",
    ],
  },
  {
    plan: "STUDIO",
    name: "Studio",
    price: "$39.99",
    period: "/month",
    description:
      "For promoters, agencies, DJ collectives, and creators who need higher volume.",
    credits: "80 credits / month",
    costNote: "About $0.50 per generation",
    cta: "Start Studio",
    highlighted: false,
    features: [
      "80 AI generations per month",
      "High-volume creative output",
      "Premium banners and promo photos",
      "High-quality image generation",
      "Ideal for teams and promoters",
    ],
  },
] as const;

const testimonials = [
  {
    initials: "NW",
    quote:
      "I use this type of artwork a lot, but the agency I had hired was getting very expensive. They charged me $100 for each flyer, and the result was not always exactly what I wanted. With this tool, everything became much easier. I can create banners my way, make changes, test different versions, and the price does not even compare.",
    name: "Noah Walker",
    role: "Open format DJ",
    location: "Miami, FL",
    outcome: "Lower design costs",
    metric: "Creative control",
  },
  {
    initials: "DM",
    quote:
      "DJ Banner AI completely changed my Instagram. After I started using these visuals on my profile, my engagement improved a lot and I received many more event inquiries. It worked for me, and I highly recommend it.",
    name: "Daniel Morgan",
    role: "Club DJ",
    location: "Orlando, FL",
    outcome: "More event inquiries",
    metric: "Higher engagement",
  },
  {
    initials: "TC",
    quote:
      "Before, my monthly flyer costs were around $200 — about $50 per flyer. Now, with DJ Banner AI, I can create flyers with even higher quality at a fraction of the cost. I highly recommend it. Thank you, DJ Banner AI.",
    name: "Tyler Carter",
    role: "Event DJ",
    location: "Los Angeles, CA",
    outcome: "Lower design costs",
    metric: "Higher-quality flyers",
  },
] as const;

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

            @keyframes ambientFloatOne {
              0%, 100% {
                transform: translate3d(0, 0, 0) scale(1);
                opacity: 0.24;
              }
              50% {
                transform: translate3d(20px, 16px, 0) scale(1.06);
                opacity: 0.36;
              }
            }

            @keyframes ambientFloatTwo {
              0%, 100% {
                transform: translate3d(0, 0, 0) scale(1);
                opacity: 0.16;
              }
              50% {
                transform: translate3d(-18px, 14px, 0) scale(1.08);
                opacity: 0.26;
              }
            }

            @keyframes ambientPulseLine {
              0%, 100% {
                opacity: 0.18;
                transform: scaleY(1);
              }
              50% {
                opacity: 0.30;
                transform: scaleY(1.06);
              }
            }

            .ambient-float-one {
              animation: ambientFloatOne 14s ease-in-out infinite;
              will-change: transform, opacity;
            }

            .ambient-float-two {
              animation: ambientFloatTwo 18s ease-in-out infinite;
              will-change: transform, opacity;
            }

            .ambient-pulse-line {
              animation: ambientPulseLine 10s ease-in-out infinite;
              will-change: transform, opacity;
              transform-origin: top center;
            }

            @keyframes ctaGlowPulse {
              0%, 100% {
                box-shadow: 0 10px 34px rgba(34, 211, 238, 0.18);
                transform: translateY(0);
              }
              50% {
                box-shadow: 0 16px 44px rgba(34, 211, 238, 0.28);
                transform: translateY(-1px);
              }
            }

            @keyframes ctaShineSweep {
              0% {
                transform: translateX(-140%) skewX(-20deg);
                opacity: 0;
              }
              10% {
                opacity: 0.18;
              }
              35% {
                transform: translateX(220%) skewX(-20deg);
                opacity: 0;
              }
              100% {
                transform: translateX(220%) skewX(-20deg);
                opacity: 0;
              }
            }

            .cta-animated {
              position: relative;
              overflow: hidden;
              isolation: isolate;
              animation: ctaGlowPulse 3.6s ease-in-out infinite;
              will-change: transform, box-shadow;
            }

            .cta-animated-shine {
              position: absolute;
              inset: 0;
              pointer-events: none;
              overflow: hidden;
            }

            .cta-animated-shine::before {
              content: "";
              position: absolute;
              top: -20%;
              left: 0;
              width: 38%;
              height: 140%;
              background: linear-gradient(
                90deg,
                transparent 0%,
                rgba(255,255,255,0.08) 30%,
                rgba(255,255,255,0.28) 50%,
                rgba(255,255,255,0.08) 70%,
                transparent 100%
              );
              animation: ctaShineSweep 4.8s ease-in-out infinite;
            }
          `,
        }}
      />

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_18%),radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.13),transparent_22%),radial-gradient(circle_at_82%_12%,rgba(192,132,252,0.11),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.06),transparent_24%)]" />
        <div className="ambient-float-one pointer-events-none absolute -left-16 top-20 h-72 w-72 rounded-full bg-cyan-400/12 blur-3xl" />
        <div className="ambient-float-two pointer-events-none absolute right-[-4rem] top-24 h-80 w-80 rounded-full bg-fuchsia-400/10 blur-3xl" />
        <div className="pointer-events-none absolute left-[12%] top-24 h-32 w-32 rounded-full border border-cyan-300/8 bg-cyan-300/[0.03] blur-2xl" />
        <div className="pointer-events-none absolute right-[14%] top-28 h-28 w-28 rounded-full border border-fuchsia-300/8 bg-fuchsia-300/[0.03] blur-2xl" />
        <div className="ambient-pulse-line pointer-events-none absolute left-1/2 top-0 h-[380px] w-px -translate-x-1/2 bg-gradient-to-b from-cyan-200/24 via-white/8 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/14 to-transparent" />

        <header className="sticky top-0 z-30 border-b border-cyan-300/10 bg-[#060816]/76 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4 lg:px-8">
            <div className="min-w-0">
              <p className="truncate text-[10px] uppercase tracking-[0.22em] text-cyan-200/80 sm:text-[11px] sm:tracking-[0.28em]">
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
              <a href="#pricing" className="transition hover:text-white">
                Pricing
              </a>
            </nav>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                className="hidden rounded-2xl border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/20 hover:text-white sm:inline-flex"
              >
                Log in
              </Link>
              <a
                href="#pricing"
                className="cta-animated group inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-2xl border border-cyan-200/20 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-950 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_46px_rgba(34,211,238,0.26)] sm:gap-2 sm:px-4 sm:text-sm"
              >
                <span className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(90deg,#67e8f9_0%,#7dd3fc_45%,#c084fc_100%)]" />
                <span className="cta-animated-shine" />
                <span className="relative z-10">Start Now</span>
                <ArrowRight
                  size={15}
                  className="relative z-10 transition duration-300 group-hover:translate-x-0.5"
                />
              </a>
            </div>
          </div>
        </header>

        <section className="relative mx-auto grid w-full min-w-0 max-w-7xl gap-9 px-4 pb-12 pt-10 sm:gap-14 sm:px-6 sm:pb-16 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-24 lg:pt-20">
          <div className="relative z-10 min-w-0">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/8 px-3 py-2 text-xs font-medium leading-5 text-cyan-100 sm:px-4">
              <BadgeCheck size={14} className="shrink-0 text-cyan-200" />
              <span className="min-w-0">
                For DJs who want premium flyers without designer delays
              </span>
            </div>

            <h1 className="mt-5 max-w-4xl break-words text-[32px] font-semibold leading-[1.04] tracking-[-0.04em] text-white sm:mt-6 sm:text-[52px] sm:leading-[1.02] lg:text-[68px]">
              Create premium DJ flyers in minutes — without paying $50–$100 per
              design.
            </h1>

            <p className="mt-5 max-w-2xl break-words text-[15px] leading-6 text-white/72 sm:mt-6 sm:text-lg sm:leading-8">
              Generate event flyers, story visuals, promo posts, and cleaner DJ
              photos with AI. Built for DJs who want a more professional online
              presence without waiting on a designer.
            </p>

            <div className="mt-7 flex w-full max-w-full flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-4">
              <a
                href="#pricing"
                className="cta-animated group inline-flex min-h-[52px] w-full max-w-full items-center justify-center gap-2 rounded-2xl border border-cyan-200/20 bg-slate-950 px-5 text-sm font-bold text-slate-950 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_64px_rgba(34,211,238,0.32)] sm:w-auto sm:min-h-[54px] sm:px-6"
              >
                <span className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(90deg,#67e8f9_0%,#7dd3fc_45%,#c084fc_100%)]" />
                <span className="cta-animated-shine" />
                <span className="relative z-10 whitespace-nowrap">
                  Start creating banners
                </span>
                <ArrowRight
                  size={17}
                  className="relative z-10 transition duration-300 group-hover:translate-x-0.5"
                />
              </a>
              <a
                href="#exemplos"
                className="inline-flex min-h-[52px] w-full max-w-full items-center justify-center rounded-2xl border border-white/12 bg-white/[0.03] px-5 text-sm font-semibold text-white/85 transition hover:bg-white/[0.05] sm:w-auto sm:min-h-[54px] sm:px-6"
              >
                See examples
              </a>
            </div>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/54">
              One agency flyer can cost $50–$100. DJ Banner AI gives you 20–80
              monthly generations starting at $12.99.
            </p>

            <div
              id="exemplos"
              className="mt-12 w-full max-w-full min-w-0 sm:mt-14 lg:max-w-5xl"
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
                  branding, social media, and paid ads — without starting from a
                  blank canvas.
                </p>
              </div>

              <div className="mt-8 min-h-[420px] overflow-hidden sm:mt-10 sm:min-h-[640px] lg:min-h-[720px]">
                <LandingBannerCarousel examples={landingBannerExamples} />
              </div>

              <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.24)] sm:flex sm:items-center sm:justify-between sm:gap-6">
                <div>
                  <p className="text-base font-semibold text-white">
                    Like what you see?
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/58">
                    Choose a plan, create your password after checkout, and
                    start generating your own promo visuals.
                  </p>
                </div>
                <a
                  href="#pricing"
                  className="mt-5 inline-flex min-h-[48px] w-full max-w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95 sm:mt-0 sm:w-auto"
                >
                  <span className="whitespace-nowrap">Choose your plan</span>
                  <ArrowRight size={16} className="ml-2 shrink-0" />
                </a>
              </div>
            </div>
          </div>

          <div className="relative hidden min-w-0 lg:block lg:pl-6">
            <div className="absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full bg-cyan-400/15 blur-3xl" />
          </div>
        </section>
      </div>

      <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 sm:pb-12 lg:px-8">
        <div className="overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.052),rgba(255,255,255,0.024))] p-5 shadow-[0_28px_100px_rgba(0,0,0,0.30)] sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-cyan-200/75">
                Designer cost vs DJ Banner AI
              </p>
              <h2 className="mt-4 max-w-2xl text-[28px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[42px]">
                Stop paying designer prices for every single flyer.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/62">
                When every event needs a fresh visual, paying $50–$100 per
                design can get expensive fast. DJ Banner AI helps you create,
                edit, and test promo visuals for a fraction of the cost.
              </p>
              <a
                href="#pricing"
                className="mt-7 inline-flex min-h-[52px] w-full max-w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95 sm:w-auto sm:px-6"
              >
                <span className="text-center">Start creating for less</span>
                <ArrowRight size={16} className="ml-2 shrink-0" />
              </a>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[28px] border border-rose-300/14 bg-rose-300/[0.045] p-5">
                <p className="text-sm font-semibold text-rose-100">
                  Traditional designer or agency
                </p>
                <div className="mt-5 space-y-4 text-sm leading-6 text-white/66">
                  {[
                    "$50–$100 per flyer",
                    "Wait hours or days",
                    "Limited revisions",
                    "Harder to test different versions",
                  ].map((item) => (
                    <div key={item} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-200" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-cyan-300/18 bg-cyan-300/[0.06] p-5 shadow-[0_18px_70px_rgba(34,211,238,0.10)]">
                <p className="text-sm font-semibold text-cyan-100">
                  DJ Banner AI
                </p>
                <div className="mt-5 space-y-4 text-sm leading-6 text-white/72">
                  {[
                    "Create flyers in minutes",
                    "Generate multiple versions",
                    "Edit and test ideas fast",
                    "Plans from $12.99/month",
                  ].map((item) => (
                    <div key={item} className="flex gap-3">
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                        <BadgeCheck size={12} />
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 sm:pb-12 lg:px-8">
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.13),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16),transparent_36%),linear-gradient(135deg,rgba(10,15,30,0.98),rgba(7,10,24,0.96))] p-5 shadow-[0_28px_100px_rgba(0,0,0,0.35)] sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/8 px-4 py-2 text-xs font-medium text-cyan-100">
                <Camera size={14} className="text-cyan-200" />
                AI photo enhancement for DJ promo images
              </div>

              <h2 className="mt-5 text-[28px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[42px] lg:text-[48px]">
                Your flyer is only as strong as the image inside it.
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-7 text-white/68 sm:text-lg sm:leading-8">
                Turn casual DJ photos into cleaner, more professional promo
                images for flyers, stories, Instagram, and booking posts.
              </p>

              <div className="mt-7 grid gap-3">
                {[
                  "Turn rough photos into cleaner promo assets",
                  "Make your flyers and profiles look more credible",
                  "Use stronger images across posts, ads, stories, and booking material",
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
                href="#pricing"
                className="mt-7 inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 px-5 text-sm font-bold text-slate-950 transition hover:opacity-95 sm:w-auto sm:px-6"
              >
                See plans
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
                    From a rough photo to a cleaner DJ image for profiles,
                    posts, ads, and social media.
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

      <section className="relative overflow-hidden border-b border-white/8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(34,211,238,0.11),transparent_25%),radial-gradient(circle_at_82%_18%,rgba(168,85,247,0.11),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.018),transparent_36%)]" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-cyan-400/8 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-violet-400/10 blur-3xl" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/8 px-4 py-2 text-xs font-semibold text-cyan-100">
              <Sparkles size={14} />
              Built for DJs who care about brand perception
            </div>

            <h2 className="mt-5 text-[30px] font-semibold leading-tight tracking-[-0.05em] text-white sm:text-[46px]">
              Premium promo visuals that make your DJ brand feel more
              established.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/62">
              DJs use the platform to create cleaner event promos, stronger
              profile visuals, and social content that feels ready for bookings,
              ads, and higher-value opportunities.
            </p>
          </div>

          <div className="mt-11 grid gap-5 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.name}
                className="group relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.065),rgba(255,255,255,0.026))] p-6 shadow-[0_26px_100px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-cyan-200/24 hover:bg-white/[0.07]"
              >
                <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-cyan-300/10 blur-2xl transition duration-300 group-hover:bg-cyan-300/16" />
                <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/30 to-transparent" />

                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-cyan-200/18 bg-[linear-gradient(135deg,rgba(34,211,238,0.22),rgba(168,85,247,0.2))] shadow-[0_14px_45px_rgba(34,211,238,0.14)]">
                        <div className="absolute inset-x-3 top-3 h-7 rounded-full bg-white/18 blur-sm" />
                        <div className="absolute bottom-0 h-8 w-12 rounded-t-full bg-slate-950/35" />
                        <span className="relative z-10 text-sm font-black text-white">
                          {testimonial.initials}
                        </span>
                      </div>

                      <div>
                        <p className="font-semibold text-white">
                          {testimonial.name}
                        </p>
                        <p className="mt-1 text-xs text-white/45">
                          {testimonial.role}
                        </p>
                        <p className="mt-1 text-xs text-cyan-100/70">
                          {testimonial.location}
                        </p>
                      </div>
                    </div>

                    <Quote
                      size={22}
                      className="mt-1 shrink-0 text-cyan-100/55"
                    />
                  </div>
                  <p className="mt-5 min-h-[176px] text-[15px] leading-7 text-white/76">
                    “{testimonial.quote}”
                  </p>

                  <div className="mt-6 grid gap-3 border-t border-white/10 pt-5">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-cyan-300/14 bg-cyan-300/8 px-3 py-1 text-[11px] font-semibold text-cyan-100">
                        {testimonial.outcome}
                      </span>
                      <span className="rounded-full border border-violet-300/14 bg-violet-300/8 px-3 py-1 text-[11px] font-semibold text-violet-100">
                        {testimonial.metric}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
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
              A faster way to create visuals that make your DJ brand look more
              professional.
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
        id="pricing"
        className="scroll-mt-28 border-y border-white/8 bg-white/[0.02]"
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] uppercase tracking-[0.25em] text-cyan-200/75">
              Pricing
            </p>
            <h2 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[42px]">
              Choose the plan that fits your promo workflow.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/64">
              Start with the plan that matches your monthly promotion volume.
              After checkout, you receive a secure email link to create your
              password and access the guided tour.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.plan}
                className={`relative overflow-hidden rounded-[30px] border p-5 shadow-[0_24px_90px_rgba(0,0,0,0.24)] sm:p-6 ${
                  plan.highlighted
                    ? "border-cyan-300/28 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_36%),linear-gradient(180deg,rgba(14,21,42,0.98),rgba(8,13,28,0.96))]"
                    : "border-white/10 bg-white/[0.035]"
                }`}
              >
                {plan.highlighted ? (
                  <div className="absolute right-5 top-5 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-100">
                    Most popular
                  </div>
                ) : null}

                <div
                  className={
                    plan.highlighted ? "pt-8 sm:pt-0 sm:pr-24 lg:pr-0" : ""
                  }
                >
                  <h3 className="text-xl font-semibold text-white">
                    {plan.name}
                  </h3>
                  <p className="mt-3 min-h-[52px] text-sm leading-6 text-white/60">
                    {plan.description}
                  </p>
                </div>

                <div className="mt-6 flex items-end gap-1">
                  <span className="text-[38px] font-semibold tracking-[-0.05em] text-white">
                    {plan.price}
                  </span>
                  <span className="pb-2 text-sm text-white/45">
                    {plan.period}
                  </span>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-cyan-100">
                  {plan.credits}
                  <span className="mt-1 block text-xs font-medium text-white/45">
                    {plan.costNote}
                  </span>
                </div>

                <div className="mt-6">
                  <PublicPlanCheckoutButton plan={plan.plan} label={plan.cta} />
                  <p className="mt-3 text-center text-xs leading-5 text-white/42">
                    Secure checkout · Cancel anytime · Account created after
                    payment
                  </p>
                </div>

                <div className="mt-6 grid gap-3">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-3 text-sm leading-6 text-white/68"
                    >
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                        <BadgeCheck size={12} />
                      </span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-4xl rounded-[30px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
            <p className="text-center text-sm font-semibold text-white">
              What happens after payment?
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                "Receive your secure email link",
                "Create your password",
                "Access your dashboard",
                "Follow the guided tour",
                "Generate your first banner",
              ].map((step, index) => (
                <div
                  key={step}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center"
                >
                  <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-cyan-300/12 text-xs font-bold text-cyan-100">
                    {index + 1}
                  </div>
                  <p className="mt-3 text-xs leading-5 text-white/58">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="mx-auto mt-7 max-w-2xl text-center text-xs leading-6 text-white/42">
            After payment, your account is created from the email used at
            checkout. You will receive a secure link to create your password.
          </p>
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

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="overflow-hidden rounded-[36px] border border-cyan-200/14 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16),transparent_34%),linear-gradient(135deg,rgba(10,15,30,0.98),rgba(7,10,24,0.98))] p-6 text-center shadow-[0_30px_120px_rgba(0,0,0,0.34)] sm:p-10">
          <p className="text-[11px] uppercase tracking-[0.25em] text-cyan-200/75">
            Ready to upgrade your promo visuals?
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-[30px] font-semibold leading-tight tracking-[-0.05em] text-white sm:text-[48px]">
            Make your DJ brand look more professional before your next event.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/62">
            Choose a plan, create your password after checkout, and start
            generating premium flyers, stories, and promo photos today.
          </p>
          <a
            href="#pricing"
            className="mt-8 inline-flex min-h-[54px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 px-6 text-sm font-bold text-slate-950 transition hover:opacity-95 sm:w-auto"
          >
            Choose your plan
            <ArrowRight size={17} className="ml-2" />
          </a>
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
