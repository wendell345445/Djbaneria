"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
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
  CheckCircle2,
  DollarSign,
  Hourglass,
  MousePointerClick,
  Timer,
  XCircle,
} from "lucide-react";
import { landingBannerExamples } from "@/lib/landing-banner-examples";

const LandingBannerCarousel = dynamic(
  () =>
    import("@/components/landing-banner-carousel").then(
      (mod) => mod.LandingBannerCarousel,
    ),
  { loading: () => <LandingCarouselLoading /> },
);

const advantages = [
  {
    icon: Zap,
    title: "Animate any flyer — yours or AI-made",
    description:
      "Upload your own finished flyer or use one generated inside DJ Visuals AI, then turn it into a VFX-enhanced MP4 video with transitions, light effects, and motion.",
  },
  {
    icon: Sparkles,
    title: "AI flyers built for the scene",
    description:
      "Generate premium event flyers for club nights, festivals, lineups, and releases — without touching design software.",
  },
  {
    icon: Camera,
    title: "DJ photo upgrade",
    description:
      "Upload a casual or low-quality DJ photo and get back a sharper, cleaner, more professional image for profiles, ads, and press kits.",
  },
  {
    icon: Layers3,
    title: "Test multiple creative angles",
    description:
      "Create several versions of your flyer or animated video and pick the one that hits hardest — no extra cost per revision.",
  },
  {
    icon: Gauge,
    title: "Zero design experience needed",
    description:
      "A guided workflow takes you from event details to finished visual in minutes — flyer, animation, or enhanced photo.",
  },
  {
    icon: ShieldCheck,
    title: "Your workspace, always ready",
    description:
      "Secure account, email verification, and a dashboard where all your visuals are saved and ready to export anytime.",
  },
];

const faqs = [
  {
    question: "Do I need design experience?",
    answer:
      "No. DJ Visuals AI is built for DJs, producers, and event promoters who want professional visuals without learning design software.",
  },
  {
    question: "What exactly is an animated flyer?",
    answer:
      "An animated flyer is a static event flyer transformed into a motion MP4 with VFX, light leaks, particles, transitions, and movement. You can animate a flyer created inside DJ Visuals AI or upload your own finished flyer from another designer or tool.",
  },
  {
    question: "What formats do I get?",
    answer:
      "Static flyers are delivered as high-resolution images. Animated flyers are exported as MP4 video files ready for social media. Enhanced DJ photos are delivered as high-resolution images.",
  },
  {
    question: "Can I upload my own flyer to animate?",
    answer:
      "Yes. You are not limited to flyers generated on the platform. You can upload your own finished flyer artwork and use DJ Visuals AI to animate it into a social-ready MP4 video.",
  },
  {
    question: "How does the DJ photo enhancement work?",
    answer:
      "You upload a casual or lower-quality photo and the AI cleans it up — improving sharpness, lighting, and overall quality — producing a more professional-looking image for your profiles, ads, and press kits.",
  },
  {
    question: "What happens after I sign up?",
    answer:
      "After checkout, you receive a secure email link to create your password. Then you access the dashboard and can start generating right away.",
  },
];

const pricingPlans = [
  {
    plan: "PRO",
    name: "Pro",
    price: "$16.24",
    checkoutPrice: "$12.99",
    period: "/month",
    description:
      "For DJs who want consistent, professional visuals without the agency price tag.",
    credits: "20 credits / month",
    costNote: "About $0.81 per generation before the welcome gift",
    cta: "Start Pro",
    highlighted: false,
    features: [
      "20 AI generations per month",
      "Static flyer creation",
      "Animate flyers generated here or uploaded by you",
      "AI DJ photo enhancement",
      "Feed and story formats",
    ],
  },
  {
    plan: "PROFESSIONAL",
    name: "Professional",
    price: "$31.24",
    checkoutPrice: "$24.99",
    period: "/month",
    description:
      "The go-to plan for DJs running events, ads, and frequent promos every month.",
    credits: "40 credits / month",
    costNote: "About $0.78 per generation before the welcome gift",
    cta: "Start Professional",
    highlighted: true,
    features: [
      "40 AI generations per month",
      "Premium flyers + upload-your-own flyer animation",
      "High-quality image & video generation",
      "Professional DJ photo enhancement",
      "Built for paid ads and social media",
    ],
  },
  {
    plan: "STUDIO",
    name: "Studio",
    price: "$49.99",
    checkoutPrice: "$39.99",
    period: "/month",
    description:
      "For agencies, DJ collectives, and promoters managing multiple artists or events.",
    credits: "80 credits / month",
    costNote: "About $0.62 per generation before the welcome gift",
    cta: "Start Studio",
    highlighted: false,
    features: [
      "80 AI generations per month",
      "Full access: AI flyers, own-flyer animation, and photos",
      "High-quality image & video output",
      "Ideal for teams and high-volume promo",
      "Priority creative output",
    ],
  },
] as const;

const testimonials = [
  {
    initials: "NW",
    name: "Noah Walker",
    role: "Open format DJ",
    location: "Miami, FL",
    outcome: "Saves time",
    metric: "Looks legit",
    quote:
      "I was paying a graphic designer $80–100 a flyer and half the time I'd go back and forth three times before it looked right. Now I just do it myself. Took me like 10 minutes the first time and it came out better than what I was getting. The animated version is what really got people's attention on Instagram.",
  },
  {
    initials: "DM",
    name: "Daniel Morgan",
    role: "Club DJ",
    location: "Orlando, FL",
    outcome: "More bookings",
    metric: "Better content",
    quote:
      "Honestly I was skeptical. I've tried other AI tools and they always look fake or generic. This one actually understands the vibe — dark, bold, club-ready. Posted an animated flyer for a Friday night set and got three DM inquiries that weekend. That never happened with my old graphics.",
  },
  {
    initials: "TC",
    name: "Tyler Carter",
    role: "Event DJ",
    location: "Los Angeles, CA",
    outcome: "Cut design costs",
    metric: "Full control",
    quote:
      "I do about 6–8 events a month so the design costs were adding up fast. I switched to this and the first month I probably saved $300. But honestly the bigger thing is I can make changes on the fly — if the lineup changes or the venue swaps I just regenerate it. No waiting on anyone.",
  },
] as const;

// ── STATIC vs ANIMATED SECTION ───────────────────────────────────
const flyerExamples = [
  {
    id: 1,
    label: "Club Night",
    static: "/landing/animation-demo/flyer-static.webp",
    vimeoId: "1192217227",
  },
  {
    id: 2,
    label: "Festival Set",
    static: "/landing/animation-demo/flyer-static2.webp",
    vimeoId: "1192217229",
  },
  {
    id: 3,
    label: "Release Party",
    static: "/landing/animation-demo/flyer-static3.webp",
    vimeoId: "1192223138",
  },
  {
    id: 4,
    label: "Residency",
    static: "/landing/animation-demo/flyer-static4.webp",
    vimeoId: "1192227878",
  },
] as const;

function HeroVimeoCard({ vimeoId }: { vimeoId: string }) {
  const [previewStarted, setPreviewStarted] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    const preconnectTargets = [
      "https://player.vimeo.com",
      "https://i.vimeocdn.com",
      "https://f.vimeocdn.com",
    ];

    const links = preconnectTargets.map((href) => {
      const existingLink = document.head.querySelector<HTMLLinkElement>(
        `link[rel="preconnect"][href="${href}"]`,
      );

      if (existingLink) return null;

      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = href;
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);

      return link;
    });

    return () => {
      links.forEach((link) => link?.remove());
    };
  }, []);

  const vimeoSrc = soundEnabled
    ? `https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=0&loop=1&autopause=0&controls=1&title=0&byline=0&portrait=0&badge=0&playsinline=1`
    : `https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=1&loop=1&background=1&autopause=0&title=0&byline=0&portrait=0&badge=0&playsinline=1`;

  function handleEnableSound() {
    if (soundEnabled) return;
    setPreviewStarted(true);
    setIframeLoaded(false);
    setSoundEnabled(true);
  }

  return (
    <div
      className="hud-box-v relative overflow-hidden rounded-none p-0"
      style={{ borderColor: "rgba(191,95,255,0.28)" }}
    >
      <div
        className="absolute inset-x-0 top-0 h-[1px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--cv), var(--cx), transparent)",
          opacity: 0.7,
        }}
      />

      <div className="flex items-center justify-between gap-2 border-b border-[rgba(191,95,255,0.14)] px-3 py-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{
              background: iframeLoaded ? "var(--cg)" : "rgba(255,255,255,0.28)",
              boxShadow: iframeLoaded ? "0 0 5px var(--cg)" : "none",
              animation: iframeLoaded
                ? "cornerPulse 1.5s ease-in-out infinite"
                : "none",
            }}
          />
          <span
            className="mono truncate text-[7px] text-[rgba(255,255,255,0.52)]"
            style={{ letterSpacing: "0.1em" }}
          >
            VIMEO_1.MP4
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className="chip-v" style={{ fontSize: 6, padding: "3px 6px" }}>
            VFX
          </span>
          <span className="chip-cx" style={{ fontSize: 6, padding: "3px 6px" }}>
            {soundEnabled ? "SOUND" : "AUTO"}
          </span>
        </div>
      </div>

      <div
        className="relative w-full overflow-hidden bg-[#03040A]"
        style={{ aspectRatio: "1024 / 1280" }}
      >
        {previewStarted && !iframeLoaded ? (
          <div className="absolute inset-0 z-10 grid place-items-center bg-[radial-gradient(circle_at_center,rgba(0,245,255,0.08),rgba(3,4,10,0.98)_58%)]">
            <div className="grid gap-3 text-center">
              <div
                className="mx-auto h-8 w-8 rounded-full border border-[rgba(0,245,255,0.28)] border-t-[rgba(0,245,255,0.95)]"
                style={{ animation: "spin 0.8s linear infinite" }}
              />
              <span
                className="mono text-[8px] uppercase text-[rgba(255,255,255,0.48)]"
                style={{ letterSpacing: "0.16em" }}
              >
                Loading motion preview
              </span>
            </div>
          </div>
        ) : null}

        {previewStarted ? (
          <iframe
            key={soundEnabled ? "hero-video-sound" : "hero-video-muted"}
            src={vimeoSrc}
            title="Animated flyer hero video"
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            loading="eager"
            onLoad={() => setIframeLoaded(true)}
            className="absolute inset-0 h-full w-full border-0 transition-opacity duration-500"
            style={{ opacity: iframeLoaded ? 1 : 0 }}
          />
        ) : null}

        {previewStarted && iframeLoaded && !soundEnabled ? (
          <button
            type="button"
            onClick={handleEnableSound}
            className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 border border-[rgba(0,245,255,0.34)] bg-[#03040A]/78 px-3 py-2 text-[7px] font-bold uppercase tracking-[0.16em] text-[var(--cx)] shadow-[0_0_24px_rgba(0,245,255,0.18)] backdrop-blur-md transition hover:border-[rgba(0,245,255,0.72)] hover:bg-[rgba(0,245,255,0.1)] hover:text-white"
          >
            Tap for sound
          </button>
        ) : null}
      </div>

      <div className="border-t border-[rgba(191,95,255,0.1)] px-3 py-2">
        <div className="flex min-h-5 items-center justify-center">
          <span
            className="mono whitespace-nowrap text-[7px] font-bold uppercase text-[var(--cv)]"
            style={{
              letterSpacing: "0.16em",
              textShadow: "0 0 10px rgba(191,95,255,0.45)",
            }}
          >
            ANIMATED VIDEO
          </span>
        </div>
      </div>
    </div>
  );
}

function VideoCard({ vimeoId, index }: { vimeoId: string; index: number }) {
  const hasVimeoId = Boolean(vimeoId && !vimeoId.startsWith("REPLACE_WITH_"));
  const vimeoSrc = hasVimeoId
    ? `https://player.vimeo.com/video/${vimeoId}?autoplay=0&muted=0&loop=0&autopause=1&title=0&byline=0&portrait=0&badge=0&playsinline=1&controls=1`
    : "";

  return (
    <div
      className="hud-box-v relative overflow-hidden rounded-none p-0"
      style={{ borderColor: "rgba(191,95,255,0.28)" }}
    >
      {/* Top glow line */}
      <div
        className="absolute inset-x-0 top-0 h-[1px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--cv), var(--cx), transparent)",
          opacity: 0.7,
        }}
      />

      {/* Top bar */}
      <div className="flex items-center justify-between gap-2 border-b border-[rgba(191,95,255,0.14)] px-3 py-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{
              background: hasVimeoId ? "var(--cg)" : "rgba(255,255,255,0.25)",
              boxShadow: hasVimeoId ? "0 0 5px var(--cg)" : "none",
            }}
          />
          <span
            className="mono truncate text-[7px] text-[rgba(255,255,255,0.52)]"
            style={{ letterSpacing: "0.1em" }}
          >
            VIMEO_{index + 1}.MP4
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className="chip-v" style={{ fontSize: 6, padding: "3px 6px" }}>
            VFX
          </span>
          <span className="chip-cx" style={{ fontSize: 6, padding: "3px 6px" }}>
            PREVIEW
          </span>
        </div>
      </div>

      {/* Native Vimeo preview/player */}
      <div
        className="relative w-full overflow-hidden bg-[#03040A]"
        style={{ aspectRatio: "1024 / 1280" }}
      >
        {hasVimeoId ? (
          <iframe
            src={vimeoSrc}
            title={`Animated flyer example ${index + 1}`}
            allow="fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            loading="lazy"
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_38%,rgba(0,245,255,0.08),transparent_42%),radial-gradient(circle_at_50%_72%,rgba(191,95,255,0.08),transparent_45%),#03040A]">
            <p
              className="mono px-4 text-center text-[9px] uppercase text-[rgba(255,255,255,0.52)]"
              style={{ letterSpacing: "0.16em" }}
            >
              ADD VIMEO ID
            </p>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[rgba(191,95,255,0.1)] px-3 py-2">
        <div className="flex min-h-5 items-center justify-center">
          <span
            className="mono whitespace-nowrap text-[7px] font-bold uppercase text-[var(--cv)]"
            style={{
              letterSpacing: "0.16em",
              textShadow: "0 0 10px rgba(191,95,255,0.45)",
            }}
          >
            VIMEO PREVIEW
          </span>
        </div>
      </div>
    </div>
  );
}

function StaticVsAnimatedSection() {
  const motionVideoExamples = [
    {
      id: 1,
      label: "Hero Motion Promo",
      static: "/landing/animation-demo/flyer-static.webp",
      vimeoId: "1192995365",
    },
    {
      id: 2,
      label: "Club Night",
      static: "/landing/animation-demo/flyer-static.webp",
      vimeoId: "1192217227",
    },
    {
      id: 3,
      label: "Festival Set",
      static: "/landing/animation-demo/flyer-static2.webp",
      vimeoId: "1192217229",
    },
    {
      id: 4,
      label: "Release Party",
      static: "/landing/animation-demo/flyer-static3.webp",
      vimeoId: "1192223138",
    },
    {
      id: 5,
      label: "Residency",
      static: "/landing/animation-demo/flyer-static4.webp",
      vimeoId: "1193018729",
    },
    {
      id: 6,
      label: "Animated Promo",
      static: "/landing/animation-demo/flyer-static2.webp",
      vimeoId: "1193018728",
    },
  ] as const;

  return (
    <section className="relative z-10 mx-auto w-full max-w-7xl px-4 py-12 sm:px-8 sm:py-24 lg:px-10">
      {/* Header */}
      <div className="mb-10 sm:mb-14">
        <div className="sect-label">
          <span className="chip-cx">● SEE THE DIFFERENCE</span>
        </div>
        <h2 className="orb text-[22px] font-bold leading-tight text-white sm:text-[42px] uppercase">
          Your art in motion.{" "}
          <span
            style={{
              color: "var(--cv)",
              textShadow: "0 0 28px rgba(191,95,255,0.6)",
            }}
          >
            Generated by AI
          </span>{" "}
          <span
            style={{
              color: "var(--cx)",
              textShadow: "0 0 28px rgba(0,245,255,0.6)",
            }}
          >
            in less than 1 minute
          </span>
        </h2>
      </div>

      {/* 6 animated video examples */}
      <div className="grid grid-cols-2 gap-2 sm:gap-5 lg:grid-cols-3">
        {motionVideoExamples.map((example, index) => (
          <div key={`${example.vimeoId}-${example.id}`}>
            <div className="mb-3 flex items-center gap-3">
              <span
                className="mono text-[9px] text-[rgba(0,245,255,0.5)]"
                style={{ letterSpacing: "0.2em" }}
              >
                {String(index + 1).padStart(2, "0")} //
              </span>
              <span
                className="mono truncate text-[9px] text-[rgba(255,255,255,0.46)]"
                style={{ letterSpacing: "0.18em" }}
              >
                {example.label.toUpperCase()}
              </span>
              <div className="hidden h-px flex-1 bg-[rgba(255,255,255,0.05)] sm:block" />
            </div>

            <VideoCard vimeoId={example.vimeoId} index={index} />
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <a
          href="#pricing"
          className="btn-cx-solid inline-flex w-full items-center justify-center gap-2.5 py-4 text-[11px] sm:w-auto sm:px-10"
        >
          ANIMATE MY OWN FLYER
          <ArrowRight size={13} />
        </a>
        <p
          className="mono text-center text-[9px] text-[rgba(255,255,255,0.3)]"
          style={{ letterSpacing: "0.14em" }}
        >
          UPLOAD YOUR OWN FLYER OR USE AN AI-MADE ONE · NO VIDEO EDITING NEEDED
        </p>
      </div>
    </section>
  );
}

// ── PRICING BUTTONS ──────────────────────────────────────────────
import { createMetaEventId, trackMetaInitiateCheckout } from "@/lib/meta-pixel";

type PlanVariant = "PRO" | "PROFESSIONAL" | "STUDIO";

type CheckoutOptions = {
  customerName?: string;
  source?: string;
};

async function openPublicCheckout(
  plan: PlanVariant,
  options: CheckoutOptions = {},
) {
  const metaEventId = createMetaEventId("InitiateCheckout");
  const response = await fetch("/api/public/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      plan,
      metaEventId,
      customerName: options.customerName,
      source: options.source,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    metaEventId?: string;
    url?: string;
  };

  if (!response.ok) throw new Error(data.error || "Could not open checkout.");
  if (!data.url) throw new Error("Stripe did not return a valid checkout URL.");

  trackMetaInitiateCheckout(plan, data.metaEventId || metaEventId);
  window.location.assign(data.url);
}

async function notifyGiftLead(name: string, selectedPlan: PlanVariant) {
  try {
    await fetch("/api/public/gift-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        selectedPlan,
        source: "pricing_scroll_gift_popup",
      }),
    });
  } catch {
    // Notification should never block the user from seeing the plans.
  }
}

const WELCOME_GIFT_TIMER_MS = 10 * 60 * 1000;

function formatCountdown(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function PricingButton({ plan, label }: { plan: PlanVariant; label: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      await openPublicCheckout(plan, { source: "pricing_card" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment error.");
      setLoading(false);
    }
  }

  const labelText = loading ? "OPENING..." : label;

  const icon = loading ? (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ animation: "spin 1s linear infinite" }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ) : (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );

  const sharedProps = {
    type: "button" as const,
    onClick: handleClick,
    disabled: loading,
    "aria-label": labelText,
    style: loading ? { opacity: 0.72, cursor: "wait" } : undefined,
  };

  if (plan === "PROFESSIONAL") {
    return (
      <div className="grid gap-2">
        <button {...sharedProps} className="pricing-btn-featured">
          <span className="pricing-btn-stripes" aria-hidden />
          <span className="pricing-btn-shimmer" aria-hidden />
          <span className="pricing-btn-label">
            {labelText}
            {icon}
          </span>
        </button>
        {error && (
          <p className="sans text-xs leading-5 text-rose-300">{error}</p>
        )}
      </div>
    );
  }

  if (plan === "STUDIO") {
    return (
      <div className="grid gap-2">
        <button {...sharedProps} className="pricing-btn-studio">
          <span className="pricing-btn-scan" aria-hidden />
          <span className="pricing-btn-corner tl" aria-hidden />
          <span className="pricing-btn-corner tr" aria-hidden />
          <span className="pricing-btn-corner bl" aria-hidden />
          <span className="pricing-btn-corner br" aria-hidden />
          <span className="pricing-btn-label">
            {labelText}
            {icon}
          </span>
        </button>
        {error && (
          <p className="sans text-xs leading-5 text-rose-300">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <button {...sharedProps} className="pricing-btn-pro">
        <span className="pricing-btn-scan" aria-hidden />
        <span className="pricing-btn-label">
          {labelText}
          {icon}
        </span>
      </button>
      {error && <p className="sans text-xs leading-5 text-rose-300">{error}</p>}
    </div>
  );
}

function FirstPurchaseGiftPopup({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [step, setStep] = useState<"intro" | "plans">("intro");
  const [selectedPlan, setSelectedPlan] = useState<PlanVariant>("PROFESSIONAL");
  const [giftLeadNotified, setGiftLeadNotified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [giftExpiresAt, setGiftExpiresAt] = useState<number | null>(null);
  const [countdownMs, setCountdownMs] = useState(WELCOME_GIFT_TIMER_MS);

  useEffect(() => {
    if (!open || step !== "plans" || giftExpiresAt === null) return;

    const expiresAt = giftExpiresAt;

    function updateCountdown() {
      setCountdownMs(Math.max(0, expiresAt - Date.now()));
    }

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(intervalId);
  }, [giftExpiresAt, open, step]);

  if (!open) return null;

  const selectedPlanData = pricingPlans.find(
    (plan) => plan.plan === selectedPlan,
  );
  const formattedCountdown = formatCountdown(countdownMs);
  const countdownFinished = countdownMs <= 0;

  function handleClaimGift() {
    const cleanName = name.trim();

    if (!cleanName) {
      setError("Enter your name to unlock your gift.");
      return;
    }

    setError("");

    if (!giftLeadNotified) {
      setGiftLeadNotified(true);
      void notifyGiftLead(cleanName, selectedPlan);
    }

    setGiftExpiresAt(Date.now() + WELCOME_GIFT_TIMER_MS);
    setCountdownMs(WELCOME_GIFT_TIMER_MS);
    setStep("plans");
  }

  async function handleCheckout() {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      await openPublicCheckout(selectedPlan, {
        customerName: name.trim(),
        source: "pricing_scroll_gift_popup",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open checkout.");
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/72 px-3 py-6 backdrop-blur-xl sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-purchase-gift-title"
    >
      <div
        className={`hud-box relative w-full overflow-hidden rounded-none border border-[rgba(0,245,255,0.28)] bg-[#050713] shadow-[0_0_80px_rgba(0,245,255,0.22),0_30px_110px_rgba(0,0,0,0.72)] ${
          step === "intro"
            ? "max-h-[calc(100dvh-48px)] max-w-[420px] overflow-y-auto"
            : "max-h-[calc(100dvh-24px)] max-w-[560px] overflow-y-auto sm:max-h-[calc(100dvh-64px)]"
        }`}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--cx)] to-transparent" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[rgba(0,245,255,0.12)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-52 w-52 rounded-full bg-[rgba(191,95,255,0.14)] blur-3xl" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center border border-[rgba(255,255,255,0.12)] bg-[#050713]/85 text-lg text-white/60 backdrop-blur-md transition hover:border-[rgba(0,245,255,0.35)] hover:text-white"
          aria-label="Close first-subscription gift popup"
        >
          ×
        </button>

        {step === "intro" ? (
          <div className="relative z-10 p-5 text-center sm:p-6">
            <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full border border-[rgba(0,245,255,0.34)] bg-[rgba(0,245,255,0.08)] shadow-[0_0_36px_rgba(0,245,255,0.26)] gift-pop">
              <div className="absolute h-20 w-20 rounded-full border border-[rgba(0,245,255,0.38)] gift-ring" />
              <div className="absolute h-28 w-28 rounded-full border border-[rgba(191,95,255,0.18)] gift-ring gift-ring-delay" />
              <Sparkles
                size={34}
                className="relative z-10 text-[var(--cx)] drop-shadow-[0_0_16px_rgba(0,245,255,0.9)]"
              />
              <span className="gift-spark gift-spark-a" />
              <span className="gift-spark gift-spark-b" />
              <span className="gift-spark gift-spark-c" />
            </div>

            <div className="mb-3 flex justify-center">
              <span className="chip-cx">● GIFT UNLOCKED</span>
            </div>

            <h2
              id="first-purchase-gift-title"
              className="orb text-[22px] font-black leading-tight text-white sm:text-[27px]"
            >
              You just received 20% off today.
            </h2>

            <p className="sans mx-auto mt-3 max-w-[320px] text-sm leading-6 text-[rgba(255,255,255,0.58)]">
              Enter your name to reveal your exclusive first-subscription gift.
            </p>

            <label className="mt-5 grid gap-2 text-left">
              <span className="mono text-[9px] uppercase tracking-[0.18em] text-[rgba(255,255,255,0.56)]">
                Your name
              </span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                className="min-h-12 border border-[rgba(0,245,255,0.18)] bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[rgba(0,245,255,0.65)] focus:shadow-[0_0_28px_rgba(0,245,255,0.16)]"
                autoFocus
              />
            </label>

            {error ? (
              <p className="sans mt-3 text-sm leading-6 text-rose-300">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              onClick={handleClaimGift}
              className="btn-cx-solid mt-4 inline-flex min-h-[52px] w-full items-center justify-center gap-2 px-5 py-4 text-[11px]"
            >
              REDEEM MY GIFT
              <ArrowRight size={13} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="sans mt-4 text-xs text-white/46 transition hover:text-white/70"
            >
              Maybe later
            </button>
          </div>
        ) : (
          <div className="relative z-10 p-4 sm:p-5">
            <div className="pr-10">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className="chip-cx"
                  style={{ fontSize: 7, padding: "4px 7px" }}
                >
                  ● DISCOUNT APPLIED
                </span>
                <span
                  className="chip-v"
                  style={{ fontSize: 7, padding: "4px 7px" }}
                >
                  WELCOME20
                </span>
              </div>

              <h2 className="orb text-[20px] font-black leading-tight text-white sm:text-[26px]">
                {name.trim()}, choose your plan.
              </h2>
            </div>

            <div className="mt-4 overflow-hidden">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="mono text-[8px] uppercase tracking-[0.18em] text-[rgba(0,245,255,0.7)]">
                    {countdownFinished
                      ? "Gift window ended"
                      : "Gift reserved for"}
                  </p>
                  <p className="sans mt-1 text-xs leading-5 text-white/62 sm:text-sm">
                    {countdownFinished
                      ? "Checkout now to see if your first-subscription gift is still available."
                      : "Your 20% first-subscription gift is reserved while you choose a plan."}
                  </p>
                </div>

                <div className="shrink-0 border border-[rgba(0,245,255,0.28)] bg-black/35 px-3 py-2 text-right shadow-[0_0_24px_rgba(0,245,255,0.12)]">
                  <span className="mono block text-[18px] font-black leading-none text-[var(--cx)] sm:text-[22px]">
                    {formattedCountdown}
                  </span>
                  <span className="mono mt-1 block text-[7px] uppercase tracking-[0.16em] text-white/46">
                    minutes
                  </span>
                </div>
              </div>

              <div className="mt-3 h-1 overflow-hidden bg-white/[0.06]">
                <div
                  className="h-full bg-gradient-to-r from-[var(--cx)] to-[var(--cv)] transition-all duration-500"
                  style={{
                    width: `${Math.max(0, Math.min(100, (countdownMs / WELCOME_GIFT_TIMER_MS) * 100))}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              {pricingPlans.map((plan) => {
                const selected = selectedPlan === plan.plan;

                return (
                  <button
                    key={plan.plan}
                    type="button"
                    onClick={() => setSelectedPlan(plan.plan)}
                    className={`relative overflow-hidden border p-3 text-left transition ${
                      selected
                        ? "border-[rgba(0,245,255,0.86)] bg-[rgba(0,245,255,0.13)] shadow-[0_0_24px_rgba(0,245,255,0.18)]"
                        : "border-[rgba(255,255,255,0.09)] bg-white/[0.035] hover:border-[rgba(0,245,255,0.28)]"
                    }`}
                  >
                    {selected && (
                      <span className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--cx)] to-transparent" />
                    )}

                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="orb block text-xs font-bold uppercase tracking-[0.14em] text-white">
                            {plan.name}
                          </span>
                          {plan.highlighted ? (
                            <span className="mono border border-[rgba(0,245,255,0.24)] bg-[rgba(0,245,255,0.08)] px-2 py-0.5 text-[7px] uppercase tracking-[0.12em] text-[var(--cx)]">
                              popular
                            </span>
                          ) : null}
                        </div>

                        <p className="sans mt-1 text-[11px] leading-4 text-[rgba(255,255,255,0.56)]">
                          {plan.credits}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="sans block text-[11px] text-[rgba(255,255,255,0.50)] line-through">
                          {plan.price}
                        </span>
                        <span className="sans block text-[17px] font-bold leading-tight text-[var(--cx)]">
                          {plan.checkoutPrice}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="mono text-[7px] uppercase tracking-[0.14em] text-[rgba(255,255,255,0.46)]">
                        20% gift applied
                      </span>

                      {selected ? (
                        <span className="mono text-[7px] uppercase tracking-[0.14em] text-[var(--cg)]">
                          selected
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="coupon-applied mt-3 border border-[rgba(191,95,255,0.22)] bg-[rgba(191,95,255,0.075)] px-3 py-2.5">
              <p className="sans text-xs leading-5 text-white/72 sm:text-sm">
                Selected:{" "}
                <strong className="text-white">{selectedPlanData?.name}</strong>{" "}
                <span className="text-white/50">·</span>{" "}
                <span className="line-through text-white/46">
                  {selectedPlanData?.price}
                </span>{" "}
                <strong className="text-[var(--cx)]">
                  {selectedPlanData?.checkoutPrice}
                </strong>
              </p>
              <p className="mono mt-1 text-[7px] uppercase tracking-[0.12em] text-[rgba(255,255,255,0.46)]">
                WELCOME20 · Applied successfully
              </p>
            </div>

            {error ? (
              <p className="sans mt-3 text-sm leading-6 text-rose-300">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading}
              className="btn-cx-solid mt-3 inline-flex min-h-[50px] w-full items-center justify-center gap-2 px-5 py-3 text-[10px] disabled:cursor-wait disabled:opacity-70"
            >
              {loading
                ? "OPENING CHECKOUT..."
                : `CONTINUE WITH ${selectedPlanData?.name?.toUpperCase() || "PLAN"}`}
              <ArrowRight size={13} />
            </button>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep("intro");
                  setError("");
                }}
                className="sans min-h-10 border border-[rgba(255,255,255,0.08)] bg-white/[0.03] px-3 text-xs text-white/55 transition hover:border-[rgba(0,245,255,0.22)] hover:text-white/75"
              >
                Back
              </button>

              <button
                type="button"
                onClick={onClose}
                className="sans min-h-10 border border-[rgba(255,255,255,0.08)] bg-white/[0.03] px-3 text-xs text-white/55 transition hover:border-[rgba(191,95,255,0.28)] hover:text-white/75"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HeroCostComparisonSection() {
  const oldWorkflowItems = [
    {
      icon: Timer,
      value: "2h+",
      label: "in Canva, Photoshop, or back-and-forth edits per flyer",
    },
    {
      icon: DollarSign,
      value: "$80–$100+",
      label: "for one designer-made event flyer or revision cycle",
    },
    {
      icon: Hourglass,
      value: "8h+",
      label: "to turn one static flyer into a motion promo manually",
    },
  ];

  const aiWorkflowItems = [
    {
      icon: Zap,
      value: "< 60s",
      label: "to create a promo visual you can post today",
    },
    {
      icon: DollarSign,
      value: "$0 designer fee",
      label: "AI does the heavy lifting inside your monthly plan",
    },
    {
      icon: MousePointerClick,
      value: "1 click",
      label: "to animate a flyer into a social-ready MP4 promo",
    },
  ];

  return (
    <section className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-14 sm:px-8 sm:pb-24 lg:px-10">
      <div className="mx-auto max-w-5xl text-center">
        <div className="mb-3 flex justify-center">
          <span className="chip-v">● THE REAL COST</span>
        </div>
        <h2 className="orb text-[24px] font-black leading-tight tracking-[-0.04em] text-white sm:text-[42px]">
          DO THE MATH: HOW MUCH
          <br className="hidden sm:block" />
          <span
            style={{
              color: "var(--cv)",
              textShadow: "0 0 28px rgba(191,95,255,0.62)",
            }}
          >
            TIME AND MONEY
          </span>{" "}
          ARE YOU LOSING?
        </h2>
        <p className="sans mx-auto mt-4 max-w-2xl text-[14px] leading-7 text-[rgba(255,255,255,0.64)] sm:text-[15px]">
          Compare the old workflow with DJ Visuals AI — flyers, animated promos,
          and pro photos from one AI-powered creative dashboard.
        </p>
      </div>

      <div className="relative mx-auto mt-8 grid max-w-6xl gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-6">
        <div className="hud-box border-[rgba(255,45,107,0.28)] bg-[rgba(255,45,107,0.045)] p-4 sm:p-6">
          <div className="mb-5 flex items-center gap-3 border-b border-[rgba(255,45,107,0.16)] pb-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center border border-[rgba(255,45,107,0.35)] bg-[rgba(255,45,107,0.1)] text-[var(--ce)] shadow-[0_0_24px_rgba(255,45,107,0.16)]">
              <XCircle size={20} />
            </span>
            <div className="text-left">
              <p className="orb text-sm font-bold uppercase tracking-[0.1em] text-white">
                The old way
              </p>
              <p className="sans mt-1 text-xs text-white/50">
                Manual design, revisions, and waiting.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {oldWorkflowItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.value}
                  className="flex items-start gap-3 border-b border-[rgba(255,45,107,0.1)] pb-4 last:border-0 last:pb-0"
                >
                  <Icon className="mt-1 shrink-0 text-[var(--ce)]" size={18} />
                  <div className="text-left">
                    <p className="sans text-[19px] font-black leading-none text-[var(--ce)] sm:text-[22px]">
                      {item.value}
                    </p>
                    <p className="sans mt-1 text-xs leading-5 text-white/58 sm:text-sm">
                      {item.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-xs font-black uppercase tracking-[0.12em] text-white shadow-[0_0_35px_rgba(0,245,255,0.14)] lg:h-14 lg:w-14">
          VS
        </div>

        <div className="hud-box-v relative border-[rgba(0,245,255,0.34)] bg-[rgba(0,245,255,0.055)] p-4 shadow-[0_0_52px_rgba(0,245,255,0.12)] sm:p-6">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 border border-[rgba(0,245,255,0.38)] bg-[#03040A] px-3 py-1 text-[7px] font-bold uppercase tracking-[0.16em] text-[var(--cx)] shadow-[0_0_22px_rgba(0,245,255,0.22)]">
            Recommended
          </div>

          <div className="mb-5 flex items-center gap-3 border-b border-[rgba(0,245,255,0.16)] pb-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center border border-[rgba(0,245,255,0.42)] bg-[rgba(0,245,255,0.12)] text-[var(--cx)] shadow-[0_0_26px_rgba(0,245,255,0.22)]">
              <CheckCircle2 size={20} />
            </span>
            <div className="text-left">
              <p className="orb text-sm font-bold uppercase tracking-[0.1em] text-white">
                With DJ Visuals AI
              </p>
              <p className="sans mt-1 text-xs text-white/55">
                Create, animate, and export faster.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {aiWorkflowItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.value}
                  className="flex items-start gap-3 border-b border-[rgba(0,245,255,0.1)] pb-4 last:border-0 last:pb-0"
                >
                  <Icon className="mt-1 shrink-0 text-[var(--cx)]" size={18} />
                  <div className="text-left">
                    <p className="sans text-[19px] font-black leading-none text-[var(--cx)] sm:text-[22px]">
                      {item.value}
                    </p>
                    <p className="sans mt-1 text-xs leading-5 text-white/64 sm:text-sm">
                      {item.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="sans mx-auto mt-8 max-w-3xl text-center text-sm leading-7 text-white/64 sm:text-base">
        While you wait on revisions, another DJ can already publish flyers,
        animated promos, and booking-ready visuals for Reels, TikTok, Stories,
        and ads.
      </p>
    </section>
  );
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [giftPopupOpen, setGiftPopupOpen] = useState(false);
  const [giftPopupDismissed, setGiftPopupDismissed] = useState(false);
  const [heroPlayingId, setHeroPlayingId] = useState<number | null>(null);

  useEffect(() => {
    if (giftPopupDismissed) return;

    const pricingSection = document.getElementById("pricing");
    if (!pricingSection) return;

    const alreadyShown = window.sessionStorage.getItem(
      "first-subscription-gift-seen",
    );
    if (alreadyShown) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;

        setGiftPopupOpen(true);
        window.sessionStorage.setItem("first-subscription-gift-seen", "true");
        observer.disconnect();
      },
      { threshold: 0.28 },
    );

    observer.observe(pricingSection);

    return () => observer.disconnect();
  }, [giftPopupDismissed]);

  function closeGiftPopup() {
    setGiftPopupOpen(false);
    setGiftPopupDismissed(true);
  }

  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{
        background: "#03040A",
        color: "#E8EAF0",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <FirstPurchaseGiftPopup open={giftPopupOpen} onClose={closeGiftPopup} />
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');

        :root {
          --cx: #00F5FF;
          --cv: #BF5FFF;
          --ce: #FF2D6B;
          --cg: #00FF9F;
          --cx10: rgba(0,245,255,0.10);
          --cx20: rgba(0,245,255,0.20);
          --cv10: rgba(191,95,255,0.10);
          --cv20: rgba(191,95,255,0.20);
          --border-x: rgba(0,245,255,0.22);
          --border-v: rgba(191,95,255,0.22);
          --surface: rgba(255,255,255,0.03);
          --surface2: rgba(255,255,255,0.055);
        }

        .orb { font-family: 'Orbitron', monospace; }
        .mono { font-family: 'Space Mono', monospace; }
        .sans { font-family: 'DM Sans', sans-serif; }

        /* ── GRID NOISE OVERLAY ── */
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background-image:
            linear-gradient(rgba(0,245,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,245,255,0.015) 1px, transparent 1px);
          background-size: 44px 44px;
        }

        /* ── SCANLINES ── */
        body::after {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.06) 2px,
            rgba(0,0,0,0.06) 4px
          );
        }

        /* ── ANIMATIONS ── */
        @keyframes pulseX {
          0%, 100% { box-shadow: 0 0 18px rgba(0,245,255,0.25), 0 0 40px rgba(0,245,255,0.10); }
          50% { box-shadow: 0 0 28px rgba(0,245,255,0.45), 0 0 70px rgba(0,245,255,0.20); }
        }
        @keyframes pulseV {
          0%, 100% { box-shadow: 0 0 18px rgba(191,95,255,0.25), 0 0 40px rgba(191,95,255,0.10); }
          50% { box-shadow: 0 0 28px rgba(191,95,255,0.45), 0 0 70px rgba(191,95,255,0.20); }
        }
        @keyframes floatOrb {
          0%, 100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.96); }
        }
        @keyframes floatOrb2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(-25px, 18px) scale(1.04); }
          66% { transform: translate(20px, -12px) scale(0.97); }
        }
        @keyframes scanH {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes glitch {
          0%, 90%, 100% { transform: translate(0); clip-path: none; }
          91% { transform: translate(-2px, 0); clip-path: inset(20% 0 60% 0); }
          93% { transform: translate(2px, 0); clip-path: inset(60% 0 20% 0); }
          95% { transform: translate(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          49% { opacity: 1; }
          50% { opacity: 0; }
          99% { opacity: 0; }
        }
        @keyframes djReveal {
          0%, 8% { clip-path: inset(0 100% 0 0); }
          45%, 55% { clip-path: inset(0 0 0 0); }
          92%, 100% { clip-path: inset(0 100% 0 0); }
        }
        @keyframes djHandle {
          0%, 8% { left: 0%; }
          45%, 55% { left: 100%; }
          92%, 100% { left: 0%; }
        }
        @keyframes djBLabel {
          0%,16%{opacity:1;transform:translateY(0)} 32%,68%{opacity:0;transform:translateY(-6px)} 86%,100%{opacity:1;transform:translateY(0)}
        }
        @keyframes djALabel {
          0%,38%{opacity:0;transform:translateY(-6px)} 46%,58%{opacity:1;transform:translateY(0)} 72%,100%{opacity:0;transform:translateY(-6px)}
        }
        @keyframes waveBar {
          0%, 100% { height: 8px; }
          50% { height: 32px; }
        }
        @keyframes shimmerLine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }

        .float-orb-a { animation: floatOrb 22s ease-in-out infinite; }
        .float-orb-b { animation: floatOrb2 28s ease-in-out infinite; }
        .ba-after { animation: djReveal 4.8s ease-in-out infinite; }
        .ba-handle { animation: djHandle 4.8s ease-in-out infinite; }
        .ba-bl { animation: djBLabel 4.8s ease-in-out infinite; }
        .ba-al { animation: djALabel 4.8s ease-in-out infinite; }

        /* ── HUD CORNERS ── */
        .hud-box {
          position: relative;
          background: var(--surface);
          border: 1px solid rgba(0,245,255,0.12);
        }
        .hud-box::before, .hud-box::after {
          content: '';
          position: absolute;
          width: 14px; height: 14px;
        }
        .hud-box::before {
          top: -1px; left: -1px;
          border-top: 2px solid var(--cx);
          border-left: 2px solid var(--cx);
        }
        .hud-box::after {
          bottom: -1px; right: -1px;
          border-bottom: 2px solid var(--cv);
          border-right: 2px solid var(--cv);
        }

        .hud-box-v {
          position: relative;
          background: var(--surface);
          border: 1px solid rgba(191,95,255,0.14);
        }
        .hud-box-v::before, .hud-box-v::after {
          content: '';
          position: absolute;
          width: 14px; height: 14px;
        }
        .hud-box-v::before { top: -1px; left: -1px; border-top: 2px solid var(--cv); border-left: 2px solid var(--cv); }
        .hud-box-v::after  { bottom: -1px; right: -1px; border-bottom: 2px solid var(--cx); border-right: 2px solid var(--cx); }

        /* ── NEON BUTTONS ── */
        .btn-cx {
          position: relative;
          background: transparent;
          border: 1px solid var(--cx);
          color: var(--cx);
          font-family: 'Orbitron', monospace;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.3s;
          animation: pulseX 3s ease-in-out infinite;
        }
        .btn-cx::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(0,245,255,0.18), transparent);
          transform: translateX(-100%);
          animation: shimmerLine 3s ease-in-out infinite;
        }
        .btn-cx:hover {
          background: rgba(0,245,255,0.12);
          color: #fff;
          box-shadow: 0 0 40px rgba(0,245,255,0.4), inset 0 0 20px rgba(0,245,255,0.1);
        }
        .btn-cx-solid {
          position: relative;
          background: var(--cx);
          border: none;
          color: #03040A;
          font-family: 'Orbitron', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.3s;
        }
        .btn-cx-solid:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 50px rgba(0,245,255,0.55), 0 12px 40px rgba(0,245,255,0.3);
        }
        .btn-cv {
          position: relative;
          background: transparent;
          border: 1px solid var(--cv);
          color: var(--cv);
          font-family: 'Orbitron', monospace;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s;
          animation: pulseV 3.5s ease-in-out infinite;
        }
        .btn-cv:hover {
          background: rgba(191,95,255,0.12);
          color: #fff;
          box-shadow: 0 0 40px rgba(191,95,255,0.4), inset 0 0 20px rgba(191,95,255,0.1);
        }

        /* ── LABEL CHIPS ── */
        .chip-cx {
          display: inline-flex; align-items: center; gap: 6px;
          border: 1px solid var(--border-x);
          background: var(--cx10);
          color: var(--cx);
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 5px 10px;
          border-radius: 2px;
        }
        .chip-v {
          display: inline-flex; align-items: center; gap: 6px;
          border: 1px solid var(--border-v);
          background: var(--cv10);
          color: var(--cv);
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 5px 10px;
          border-radius: 2px;
        }

        /* ── WAVEFORM BARS ── */
        .wave-bar { display: inline-block; width: 3px; background: var(--cx); border-radius: 2px; margin: 0 1px; }
        .wave-bar:nth-child(1)  { animation: waveBar 0.7s ease-in-out infinite; }
        .wave-bar:nth-child(2)  { animation: waveBar 0.9s ease-in-out infinite 0.1s; }
        .wave-bar:nth-child(3)  { animation: waveBar 0.6s ease-in-out infinite 0.2s; }
        .wave-bar:nth-child(4)  { animation: waveBar 1.1s ease-in-out infinite 0.15s; }
        .wave-bar:nth-child(5)  { animation: waveBar 0.8s ease-in-out infinite 0.05s; }
        .wave-bar:nth-child(6)  { animation: waveBar 0.65s ease-in-out infinite 0.3s; }
        .wave-bar:nth-child(7)  { animation: waveBar 0.95s ease-in-out infinite 0.25s; }
        .wave-bar:nth-child(8)  { animation: waveBar 0.75s ease-in-out infinite 0.12s; }
        .wave-bar:nth-child(9)  { animation: waveBar 1.0s ease-in-out infinite 0.08s; }
        .wave-bar:nth-child(10) { animation: waveBar 0.72s ease-in-out infinite 0.18s; }

        /* ── PRICING ── */
        .plan-featured {
          border-color: rgba(0,245,255,0.4) !important;
          background: linear-gradient(160deg, rgba(0,245,255,0.08), rgba(191,95,255,0.06)) !important;
        }
        .plan-featured::before { border-color: var(--cx) !important; }
        .plan-featured::after  { border-color: var(--cv) !important; }

        /* ── FAQ ── */
        details summary::-webkit-details-marker { display: none; }
        details[open] .faq-plus { transform: rotate(45deg); color: var(--cx); }
        .faq-plus { transition: all 0.25s ease; color: rgba(255,255,255,0.4); }

        /* ── NAV LINK ── */
        .nav-link {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          transition: color 0.2s;
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0;
          height: 1px; width: 0;
          background: var(--cx);
          transition: width 0.25s;
          box-shadow: 0 0 6px var(--cx);
        }
        .nav-link:hover { color: var(--cx); }
        .nav-link:hover::after { width: 100%; }

        /* ── HEADING GLITCH ── */
        .hero-h1 { animation: glitch 8s ease-in-out infinite; }

        /* ── CURSOR BLINK ── */
        .cursor::after {
          content: '█';
          animation: blink 1s step-end infinite;
          color: var(--cx);
          font-size: 0.75em;
        }

        /* ── ADVANTAGE GRID ── */
        .adv-card {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.06);
          background: var(--surface);
          transition: border-color 0.3s, background 0.3s;
          padding: 28px;
        }
        .adv-card::before {
          content: '';
          position: absolute;
          top: -1px; left: -1px;
          width: 10px; height: 10px;
          border-top: 2px solid var(--cx);
          border-left: 2px solid var(--cx);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .adv-card:hover { border-color: rgba(0,245,255,0.25); background: rgba(0,245,255,0.04); }
        .adv-card:hover::before { opacity: 1; }

        /* ── TESTIMONIAL CARD ── */
        .testi-card {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.07);
          background: linear-gradient(160deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02));
          border-radius: 0;
          transition: all 0.4s;
          padding: 28px;
        }
        .testi-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 1px;
          background: linear-gradient(90deg, var(--cx), var(--cv));
          opacity: 0;
          transition: opacity 0.4s;
        }
        .testi-card:hover { border-color: rgba(0,245,255,0.2); transform: translateY(-4px); }
        .testi-card:hover::before { opacity: 1; }

        /* ── SECTION LABEL ── */
        .sect-label {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        .sect-label::before {
          content: '';
          display: block;
          width: 24px; height: 1px;
          background: var(--cx);
          box-shadow: 0 0 6px var(--cx);
        }

        /* ── GLOWING DIVIDER ── */
        .glow-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--cx), var(--cv), transparent);
          opacity: 0.4;
        }

        /* ── MOBILE MENU ── */
        .mobile-menu {
          display: none;
          position: fixed;
          inset: 0;
          top: 57px;
          z-index: 39;
          background: rgba(3,4,10,0.97);
          backdrop-filter: blur(24px);
          border-top: 1px solid rgba(0,245,255,0.1);
          flex-direction: column;
          padding: 32px 24px;
        }
        .mobile-menu.open { display: flex; }
        .mobile-menu a {
          font-family: 'Orbitron', monospace;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          padding: 18px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: color 0.2s;
          text-decoration: none;
        }
        .mobile-menu a:hover { color: var(--cx); }
        .mobile-menu .menu-cta {
          margin-top: 28px;
          width: 100%;
          justify-content: center;
          min-height: 52px;
          font-size: 12px;
        }

        /* ── HAMBURGER ── */
        .hamburger {
          display: flex;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          padding: 6px;
          background: transparent;
          border: none;
        }
        .hamburger span {
          display: block;
          width: 22px;
          height: 1.5px;
          background: rgba(255,255,255,0.7);
          transition: all 0.25s;
        }
        .hamburger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); background: var(--cx); }
        .hamburger.open span:nth-child(2) { opacity: 0; }
        .hamburger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); background: var(--cx); }

        /* ── PRICING SCROLL MOBILE ── */
        @media (max-width: 767px) {
          .testi-scroll {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            gap: 16px;
            padding-bottom: 12px;
            scrollbar-width: none;
          }
          .testi-scroll::-webkit-scrollbar { display: none; }
          .testi-scroll > * {
            flex: 0 0 88vw;
            scroll-snap-align: start;
          }
          .adv-card { padding: 20px; }
          .testi-card { padding: 20px; }
        }

        @media (max-width: 767px) {
          .chip-cx, .chip-v { font-size: 8px; padding: 4px 8px; }
        }

        /* ── PREMIUM PLAN BUTTONS ── */

        .pricing-btn-pro,
        .pricing-btn-featured,
        .pricing-btn-studio {
          position: relative;
          width: 100%;
          min-height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Orbitron', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 0;
          overflow: hidden;
          isolation: isolate;
          transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .pricing-btn-label {
          position: relative;
          z-index: 5;
          display: flex;
          align-items: center;
          gap: 10px;
          pointer-events: none;
        }

        /* ── PRO: cyan outline + scan beam ── */
        .pricing-btn-pro {
          background: transparent;
          border: 1px solid var(--cx);
          color: var(--cx);
          box-shadow: 0 0 18px rgba(0,245,255,0.18), inset 0 0 18px rgba(0,245,255,0.05);
          animation: pulseX 3s ease-in-out infinite;
        }
        .pricing-btn-pro:hover {
          background: rgba(0,245,255,0.09);
          color: #fff;
          box-shadow: 0 0 44px rgba(0,245,255,0.5), inset 0 0 28px rgba(0,245,255,0.12);
          transform: translateY(-2px);
        }
        .pricing-btn-pro:active { transform: translateY(0); }
        .pricing-btn-pro .pricing-btn-scan {
          position: absolute;
          inset: 0; z-index: 3;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(0,245,255,0.15) 38%,
            rgba(0,245,255,0.55) 50%,
            rgba(0,245,255,0.15) 62%,
            transparent 100%
          );
          width: 60%;
          animation: scanBeam 3s ease-in-out infinite;
        }

        /* ── PROFESSIONAL: solid cyan + diagonal stripes + shimmer ── */
        .pricing-btn-featured {
          background: var(--cx);
          border: none;
          color: #03040A;
          font-weight: 800;
          font-size: 11px;
          box-shadow:
            0 0 0 1px rgba(0,245,255,0.65),
            0 0 32px rgba(0,245,255,0.5),
            0 0 70px rgba(0,245,255,0.2),
            inset 0 1px 0 rgba(255,255,255,0.35);
          animation: featuredGlow 2.2s ease-in-out infinite;
        }
        .pricing-btn-featured:hover {
          transform: translateY(-3px);
          box-shadow:
            0 0 0 2px rgba(0,245,255,1),
            0 0 55px rgba(0,245,255,0.7),
            0 0 100px rgba(0,245,255,0.32),
            inset 0 1px 0 rgba(255,255,255,0.45);
        }
        .pricing-btn-featured:active { transform: translateY(-1px); }
        .pricing-btn-featured .pricing-btn-stripes {
          position: absolute;
          inset: 0; z-index: 2;
          background: repeating-linear-gradient(
            -52deg,
            transparent,
            transparent 9px,
            rgba(0,0,0,0.07) 9px,
            rgba(0,0,0,0.07) 10px
          );
          animation: stripeDrift 2.4s linear infinite;
        }
        .pricing-btn-featured .pricing-btn-shimmer {
          position: absolute;
          top: 0; left: -60%; z-index: 3;
          width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.32), transparent);
          transform: skewX(-18deg);
          animation: featuredShimmer 2.4s ease-in-out infinite;
        }

        /* ── STUDIO: violet outline + scan + corner sparks ── */
        .pricing-btn-studio {
          background: transparent;
          border: 1px solid var(--cv);
          color: var(--cv);
          box-shadow: 0 0 18px rgba(191,95,255,0.2), inset 0 0 18px rgba(191,95,255,0.06);
          animation: pulseV 3.5s ease-in-out infinite;
        }
        .pricing-btn-studio:hover {
          background: rgba(191,95,255,0.09);
          color: #fff;
          box-shadow: 0 0 44px rgba(191,95,255,0.55), inset 0 0 28px rgba(191,95,255,0.14);
          transform: translateY(-2px);
        }
        .pricing-btn-studio:active { transform: translateY(0); }
        .pricing-btn-studio .pricing-btn-scan {
          position: absolute;
          inset: 0; z-index: 3;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(191,95,255,0.15) 38%,
            rgba(191,95,255,0.55) 50%,
            rgba(191,95,255,0.15) 62%,
            transparent 100%
          );
          width: 60%;
          animation: scanBeam 3.8s ease-in-out infinite 0.9s;
        }
        .pricing-btn-corner {
          position: absolute;
          z-index: 4;
          width: 4px; height: 4px;
          border-radius: 50%;
          background: var(--cv);
          box-shadow: 0 0 8px var(--cv), 0 0 16px var(--cv);
          animation: cornerPulse 2s ease-in-out infinite;
        }
        .pricing-btn-corner.tl { top: 5px; left: 5px; animation-delay: 0s; }
        .pricing-btn-corner.tr { top: 5px; right: 5px; animation-delay: 0.5s; }
        .pricing-btn-corner.bl { bottom: 5px; left: 5px; animation-delay: 1s; }
        .pricing-btn-corner.br { bottom: 5px; right: 5px; animation-delay: 1.5s; }

        @keyframes scanBeam {
          0%, 15%   { transform: translateX(-120%); opacity: 0; }
          20%       { opacity: 1; }
          80%       { opacity: 1; }
          85%, 100% { transform: translateX(260%); opacity: 0; }
        }
        @keyframes featuredGlow {
          0%, 100% {
            box-shadow: 0 0 0 1px rgba(0,245,255,0.65), 0 0 32px rgba(0,245,255,0.5), 0 0 70px rgba(0,245,255,0.2), inset 0 1px 0 rgba(255,255,255,0.35);
          }
          50% {
            box-shadow: 0 0 0 2px rgba(0,245,255,0.95), 0 0 52px rgba(0,245,255,0.7), 0 0 100px rgba(0,245,255,0.32), inset 0 1px 0 rgba(255,255,255,0.45);
          }
        }
        @keyframes stripeDrift {
          0%   { background-position: 0 0; }
          100% { background-position: 28px 0; }
        }
        @keyframes featuredShimmer {
          0%, 25%   { left: -60%; opacity: 0; }
          30%       { opacity: 1; }
          70%       { opacity: 1; }
          75%, 100% { left: 140%; opacity: 0; }
        }
        @keyframes cornerPulse {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50%      { opacity: 1;    transform: scale(1.9); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes giftPop {
          0% { transform: scale(0.72) rotate(-10deg); opacity: 0; }
          58% { transform: scale(1.12) rotate(3deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes giftRing {
          0% { transform: scale(0.75); opacity: 0.85; }
          100% { transform: scale(1.45); opacity: 0; }
        }
        @keyframes giftSpark {
          0%, 100% { transform: scale(0.6); opacity: 0.25; }
          50% { transform: scale(1.35); opacity: 1; }
        }
        @keyframes couponScan {
          0% { transform: translateX(-120%); opacity: 0; }
          20%, 75% { opacity: 1; }
          100% { transform: translateX(220%); opacity: 0; }
        }
        .gift-pop { position: relative; animation: giftPop 0.72s cubic-bezier(.2,1.35,.32,1) both; }
        .gift-ring { animation: giftRing 1.4s ease-out infinite; }
        .gift-ring-delay { animation-delay: 0.45s; }
        .gift-spark {
          position: absolute;
          height: 6px;
          width: 6px;
          border-radius: 999px;
          background: var(--cg);
          box-shadow: 0 0 12px var(--cg);
          animation: giftSpark 1.2s ease-in-out infinite;
        }
        .gift-spark-a { right: 10px; top: 12px; animation-delay: 0.1s; }
        .gift-spark-b { bottom: 10px; left: 12px; animation-delay: 0.38s; background: var(--cv); box-shadow: 0 0 12px var(--cv); }
        .gift-spark-c { left: 6px; top: 26px; animation-delay: 0.68s; background: var(--cx); box-shadow: 0 0 12px var(--cx); }


        .coupon-applied { position: relative; overflow: hidden; }
        .coupon-applied::after {
          content: '';
          position: absolute;
          inset: 0;
          width: 45%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
          animation: couponScan 2.6s ease-in-out infinite;
          pointer-events: none;
        }
      `,
        }}
      />

      {/* ── AMBIENT ORBS ── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div
          className="float-orb-a absolute -left-48 top-1/4 h-[600px] w-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(0,245,255,0.07), transparent 60%)",
          }}
        />
        <div
          className="float-orb-b absolute -right-32 top-2/3 h-[500px] w-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(191,95,255,0.07), transparent 60%)",
          }}
        />
        <div
          className="absolute left-1/2 top-0 h-[300px] w-px -translate-x-1/2"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,245,255,0.3), transparent)",
          }}
        />
      </div>

      {/* ── HEADER ── */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: "rgba(3,4,10,0.88)",
          borderBottom: "1px solid rgba(0,245,255,0.1)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8 lg:px-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 items-end gap-[2px]">
              {Array.from({ length: 7 }).map((_, i) => (
                <span key={i} className="wave-bar" style={{ height: "8px" }} />
              ))}
            </div>
            <p
              className="orb text-[13px] font-bold tracking-[0.18em] uppercase sm:text-[15px]"
              style={{ color: "#fff" }}
            >
              DJ{" "}
              <span
                style={{ color: "var(--cx)", textShadow: "0 0 14px var(--cx)" }}
              >
                VISUALS
              </span>{" "}
              AI
            </p>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {[
              ["What you get", "#vantagens"],
              ["Examples", "#exemplos"],
              ["How it works", "#como-funciona"],
              ["Pricing", "#pricing"],
            ].map(([label, href]) => (
              <a key={href} href={href} className="nav-link">
                {label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="nav-link hidden sm:block px-4 py-2 border border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.62)] hover:border-[var(--border-x)] hover:text-[var(--cx)] transition-all"
              style={{
                fontSize: "10px",
                letterSpacing: "0.15em",
                fontFamily: "Space Mono, monospace",
                textTransform: "uppercase",
              }}
            >
              LOG IN
            </Link>
            <a
              href="#pricing"
              className="btn-cx-solid hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-none"
            >
              CHOOSE PLAN
              <ArrowRight size={12} />
            </a>
            {/* Hamburger — mobile only */}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
          {[
            ["What you get", "#vantagens"],
            ["Examples", "#exemplos"],
            ["How it works", "#como-funciona"],
            ["Pricing", "#pricing"],
          ].map(([label, href]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ))}
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            style={{
              fontFamily: "Orbitron, monospace",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
              padding: "18px 0",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              textDecoration: "none",
            }}
          >
            LOG IN
          </Link>
          <a
            href="#pricing"
            onClick={() => setMenuOpen(false)}
            className="btn-cx-solid menu-cta inline-flex items-center gap-2"
          >
            CHOOSE PLAN <ArrowRight size={13} />
          </a>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-14 pt-10 sm:px-8 sm:pb-28 sm:pt-20 lg:px-10 lg:pb-36 lg:pt-44">
        {/* HUD status bar */}
        <div
          className="mono mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] sm:text-[10px] text-[rgba(255,255,255,0.3)]"
          style={{ letterSpacing: "0.1em" }}
        >
          <span style={{ color: "var(--cg)" }}>● SYSTEM ONLINE</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">AI_ENGINE v4.2.1</span>
          <span className="hidden sm:inline">|</span>
          <span>NODES: 2,847 ACTIVE</span>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <h1 className="hero-h1 orb text-[29px] font-black leading-[0.94] tracking-[-0.055em] text-white sm:text-[56px] lg:text-[70px]">
              CREATE ANIMATED
              <br />
              <span
                style={{
                  color: "var(--cx)",
                  textShadow: "0 0 40px rgba(0,245,255,0.62)",
                }}
              >
                VIDEOS & FLYERS
              </span>
              <br />
              <span
                style={{
                  color: "var(--cv)",
                  textShadow: "0 0 40px rgba(191,95,255,0.62)",
                }}
              >
                IN UNDER 60 SECONDS
              </span>
              <span className="cursor" />
            </h1>

            <p className="sans mt-5 max-w-2xl text-[14px] leading-5 text-[rgba(255,255,255,0.62)] sm:text-[16px] sm:leading-7">
              Ai does it all for you IN LESS THAN 60 SECONDS. No Canva, no
              designer, no Photoshop
            </p>

            <div className="mx-auto mt-5 w-full max-w-[260px] sm:max-w-[320px] lg:max-w-[340px]">
              <HeroVimeoCard vimeoId="1192995365" />
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <a
                href="#pricing"
                className="btn-cx-solid inline-flex w-full items-center justify-center gap-2.5 py-4 text-[11px] sm:w-auto sm:min-h-[52px] sm:px-8"
              >
                START CREATING NOW
                <ArrowRight size={13} />
              </a>
              <a
                href="#exemplos"
                className="btn-cx inline-flex w-full items-center justify-center gap-2.5 py-4 text-[11px] sm:w-auto sm:min-h-[52px] sm:px-8"
              >
                SEE WHAT I CAN CREATE
              </a>
            </div>

            <p className="mono mt-4 text-[9px] uppercase tracking-[0.16em] text-[rgba(255,255,255,0.46)]">
              Flyers · animated videos · professional DJ photos · ready for
              Reels, TikTok, Stories and ads
            </p>

            {/* Conversion benefits row */}
            <div className="mt-10 grid grid-cols-3 gap-0 border border-[rgba(0,245,255,0.12)]">
              {[
                ["01", "NO DESIGNER NEEDED"],
                ["02", "UPLOAD YOUR OWN FLYER"],
                ["03", "EXPORT SOCIAL-READY ASSETS"],
              ].map(([val, label]) => (
                <div
                  key={label}
                  className="border-r border-[rgba(0,245,255,0.12)] last:border-0 px-2 py-3 text-center sm:px-6 sm:py-4"
                >
                  <p
                    className="orb text-base font-bold sm:text-xl"
                    style={{
                      color: "var(--cx)",
                      textShadow: "0 0 14px rgba(0,245,255,0.5)",
                    }}
                  >
                    {val}
                  </p>
                  <p
                    className="mono mt-1 text-[6.5px] leading-4 text-[rgba(255,255,255,0.56)] sm:text-[9px]"
                    style={{ letterSpacing: "0.11em" }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: HUD panel — desktop only */}
          <div className="hidden lg:block">
            <div className="hud-box rounded-none p-6">
              <div
                className="mono mb-4 text-[9px] text-[rgba(0,245,255,0.6)]"
                style={{ letterSpacing: "0.2em" }}
              >
                // AI_CREATIVE_ENGINE
              </div>
              <div className="space-y-3">
                {[
                  { label: "FLYER QUALITY", val: 98, color: "var(--cx)" },
                  { label: "ANIMATION RENDER", val: 96, color: "var(--cv)" },
                  { label: "PHOTO ENHANCE", val: 94, color: "var(--cg)" },
                  { label: "PROMO SPEED", val: 100, color: "var(--cx)" },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="mb-1 flex justify-between">
                      <span
                        className="mono text-[9px] text-[rgba(255,255,255,0.45)]"
                        style={{ letterSpacing: "0.16em" }}
                      >
                        {m.label}
                      </span>
                      <span
                        className="mono text-[9px]"
                        style={{ color: m.color }}
                      >
                        {m.val}%
                      </span>
                    </div>
                    <div className="h-[3px] w-full bg-[rgba(255,255,255,0.06)]">
                      <div
                        className="h-full"
                        style={{
                          width: `${m.val}%`,
                          background: m.color,
                          boxShadow: `0 0 8px ${m.color}`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-[rgba(0,245,255,0.1)] pt-4">
                <p
                  className="mono text-[9px] text-[rgba(255,255,255,0.3)]"
                  style={{ letterSpacing: "0.14em" }}
                >
                  NEXT_GEN: <span style={{ color: "var(--cx)" }}>READY</span>{" "}
                  &nbsp;|&nbsp; QUEUE:{" "}
                  <span style={{ color: "var(--cg)" }}>OPEN</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HeroCostComparisonSection />

      <div className="glow-divider" />

      {/* ── STATIC vs ANIMATED COMPARISON ── */}
      <StaticVsAnimatedSection />

      <section className="relative z-10 mx-auto w-full max-w-7xl px-4 py-12 sm:px-8 sm:py-24 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <div>
            <div className="sect-label">
              <span className="chip-cx">● ANIMATED FLYERS</span>
            </div>
            <h2 className="orb text-[24px] font-bold leading-tight tracking-tight text-white sm:text-[40px]">
              YOUR FLYER,
              <br />
              <span
                style={{
                  color: "var(--cx)",
                  textShadow: "0 0 24px rgba(0,245,255,0.5)",
                }}
              >
                NOW IN MOTION.
              </span>
            </h2>
            <p className="sans mt-4 text-[14px] leading-7 text-[rgba(255,255,255,0.62)] sm:text-[15px]">
              Generate your event flyer, then bring it to life with the
              animation engine. Add VFX effects — light leaks, particle bursts,
              glows, and transitions — and export a ready-to-post MP4 video for
              Reels, TikTok, and Stories.
            </p>
            <div className="mt-6 space-y-3">
              {[
                "Animated videos get 3× more reach than static posts",
                "VFX effects: light leaks, particles, glows, transitions",
                "Export as MP4 — ready for Reels, TikTok, and Stories",
                "No video editing skills needed",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 border border-[rgba(0,245,255,0.14)] bg-[rgba(0,245,255,0.04)] px-4 py-3"
                >
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-[rgba(0,245,255,0.4)]"
                    style={{ fontSize: 10, color: "var(--cx)" }}
                  >
                    ✓
                  </span>
                  <span className="sans text-sm text-[rgba(255,255,255,0.65)]">
                    {item}
                  </span>
                </div>
              ))}
            </div>
            <a
              href="#pricing"
              className="btn-cx-solid mt-7 inline-flex w-full items-center justify-center gap-2.5 py-4 text-[11px] sm:w-auto sm:min-h-[48px] sm:px-8"
            >
              START ANIMATING
              <ArrowRight size={12} />
            </a>
          </div>
        </div>
      </section>

      <div className="glow-divider" />

      {/* ── PHOTO ENHANCEMENT ── */}
      <section className="relative z-10 mx-auto w-full max-w-7xl px-4 py-12 sm:px-8 sm:py-24 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="sect-label">
              <span className="chip-v">● AI PHOTO ENHANCEMENT</span>
            </div>
            <h2 className="orb text-[24px] font-bold leading-tight tracking-tight text-white sm:text-[40px]">
              LOOK THE PART
              <br />
              <span
                style={{
                  color: "var(--cv)",
                  textShadow: "0 0 24px rgba(191,95,255,0.5)",
                }}
              >
                ON EVERY PLATFORM.
              </span>
            </h2>
            <p className="sans mt-4 text-[14px] leading-7 text-[rgba(255,255,255,0.62)] sm:text-[15px]">
              Upload a casual or low-quality DJ photo and get back a sharper,
              more professional-looking image — ready for your profile, press
              kit, social ads, and anywhere your brand needs to make an
              impression.
            </p>
            <div className="mt-6 space-y-3">
              {[
                "Sharper, cleaner images from casual or rough photos",
                "Better lighting, detail, and overall quality",
                "Use across profiles, press kits, ads, and promo materials",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 border border-[rgba(191,95,255,0.14)] bg-[rgba(191,95,255,0.04)] px-4 py-3"
                >
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-[rgba(0,245,255,0.4)]"
                    style={{ fontSize: 10, color: "var(--cx)" }}
                  >
                    ✓
                  </span>
                  <span className="sans text-sm text-[rgba(255,255,255,0.65)]">
                    {item}
                  </span>
                </div>
              ))}
            </div>
            <a
              href="#pricing"
              className="btn-cv mt-7 inline-flex w-full items-center justify-center gap-2.5 py-4 text-[11px] sm:w-auto sm:min-h-[48px] sm:px-8"
            >
              SEE PLANS
              <ArrowRight size={12} />
            </a>
          </div>

          {/* Before/After */}
          <div className="relative">
            <div className="hud-box-v p-4 sm:p-5" style={{ borderRadius: 0 }}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p
                    className="mono text-[9px] text-[rgba(0,245,255,0.7)]"
                    style={{ letterSpacing: "0.18em" }}
                  >
                    // BEFORE_AFTER_MODULE
                  </p>
                  <p className="sans mt-1 text-xs text-[rgba(255,255,255,0.52)]">
                    See how a rough photo transforms.
                  </p>
                </div>
                <span className="chip-cx shrink-0">AI ENHANCED</span>
              </div>
              <div className="relative aspect-[4/5] overflow-hidden border border-[rgba(0,245,255,0.1)] sm:aspect-[5/4]">
                <img
                  src="/landing/before-after/dj-before.webp"
                  alt="Before"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(3,4,10,0.5), transparent)",
                  }}
                />
                <div className="ba-bl absolute left-3 top-3 z-30">
                  <span className="chip-cx px-2 py-1" style={{ fontSize: 8 }}>
                    BEFORE
                  </span>
                </div>
                <div className="ba-after absolute inset-0 z-10">
                  <img
                    src="/landing/before-after/dj-after.jpg"
                    alt="After"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(3,4,10,0.5), transparent)",
                    }}
                  />
                </div>
                <div className="ba-al absolute right-3 top-3 z-30">
                  <span className="chip-v px-2 py-1" style={{ fontSize: 8 }}>
                    AFTER
                  </span>
                </div>
                <div
                  className="ba-handle absolute top-0 z-20 h-full w-[1px] -translate-x-1/2"
                  style={{
                    background: "var(--cx)",
                    boxShadow: "0 0 14px var(--cx)",
                  }}
                >
                  <span
                    className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-[rgba(0,245,255,0.5)]"
                    style={{
                      background: "#03040A",
                      color: "var(--cx)",
                      fontSize: 12,
                    }}
                  >
                    ⇆
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="glow-divider" />

      {/* ── VISUAL EXAMPLES ── */}
      <section
        id="exemplos"
        className="relative z-10 mx-auto w-full max-w-7xl px-4 py-12 sm:px-8 sm:py-24 lg:px-10"
      >
        <div className="max-w-3xl">
          <div className="sect-label">
            <span className="chip-cx">● VISUAL EXAMPLES</span>
          </div>
          <h2 className="orb text-[22px] font-bold leading-tight text-white sm:text-[42px] uppercase">
            Static flyers —{" "}
            <span
              style={{
                color: "var(--cx)",
                textShadow: "0 0 24px rgba(0,245,255,0.5)",
              }}
            >
              created with Dj Visuals Ai
            </span>
          </h2>
          <p className="sans mt-3 max-w-2xl text-[14px] leading-7 text-[rgba(255,255,255,0.62)] sm:text-[15px]">
            With our platform, you can create designs like these almost
            instantly
          </p>
        </div>
        <div className="mt-10 min-h-[420px] sm:min-h-[640px] lg:min-h-[720px]">
          <LandingBannerCarousel examples={landingBannerExamples} />
        </div>
      </section>

      <div className="glow-divider" />

      {/* ── TESTIMONIALS ── */}
      <section
        className="relative z-10"
        style={{ background: "rgba(0,245,255,0.02)" }}
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-8 sm:py-24 lg:px-10">
          <div className="text-center">
            <div className="sect-label justify-center">
              <span className="chip-cx">● CLIENT TRANSMISSIONS</span>
            </div>
            <h2 className="orb text-[22px] font-bold leading-tight text-white sm:text-[42px]">
              DJS WHO{" "}
              <span
                style={{
                  color: "var(--cv)",
                  textShadow: "0 0 24px rgba(191,95,255,0.5)",
                }}
              >
                LEVELED UP
              </span>{" "}
              THEIR PROMO
            </h2>
          </div>

          {/* Scroll hint — mobile only */}
          <p
            className="mono mt-4 text-center text-[9px] text-[rgba(255,255,255,0.25)] sm:hidden"
            style={{ letterSpacing: "0.14em" }}
          >
            ← SWIPE →
          </p>

          <div className="testi-scroll mt-8 sm:mt-12 sm:grid sm:gap-5 lg:grid-cols-3">
            {testimonials.map((t) => (
              <article key={t.name} className="testi-card">
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(0,245,255,0.06), transparent 60%)",
                  }}
                />
                <Quote size={18} style={{ color: "rgba(0,245,255,0.35)" }} />
                <p className="sans mt-4 text-[13px] italic leading-7 text-[rgba(255,255,255,0.62)] sm:text-[14px] sm:min-h-[160px]">
                  "{t.quote}"
                </p>
                <div className="mt-5 border-t border-[rgba(255,255,255,0.06)] pt-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center border border-[rgba(0,245,255,0.3)]"
                      style={{ background: "rgba(0,245,255,0.08)" }}
                    >
                      <span
                        className="orb text-sm font-bold"
                        style={{ color: "var(--cx)" }}
                      >
                        {t.initials}
                      </span>
                    </div>
                    <div>
                      <p className="sans text-sm font-semibold text-white">
                        {t.name}
                      </p>
                      <p
                        className="mono text-[9px] text-[rgba(255,255,255,0.46)]"
                        style={{ letterSpacing: "0.12em" }}
                      >
                        {t.role} · {t.location}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="chip-cx">{t.outcome}</span>
                    <span className="chip-v">{t.metric}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="glow-divider" />

      {/* ── ADVANTAGES ── */}
      <section
        id="vantagens"
        className="relative z-10 mx-auto w-full max-w-7xl px-4 py-12 sm:px-8 sm:py-24 lg:px-10"
      >
        <div className="max-w-3xl">
          <div className="sect-label">
            <span className="chip-v">● SYSTEM FEATURES</span>
          </div>
          <h2 className="orb text-[22px] font-bold leading-tight text-white sm:text-[42px]">
            THREE TOOLS. ONE{" "}
            <span
              style={{
                color: "var(--cx)",
                textShadow: "0 0 24px rgba(0,245,255,0.5)",
              }}
            >
              PLATFORM.
            </span>
          </h2>
          <p className="sans mt-3 text-[14px] leading-7 text-[rgba(255,255,255,0.62)] sm:text-base sm:mt-4">
            DJ Visuals AI gives you everything you need to create, animate, and
            present your brand — without designers, video editors, or expensive
            agencies.
          </p>
        </div>

        <div className="mt-10 grid gap-px bg-[rgba(0,245,255,0.06)] sm:mt-14 md:grid-cols-2 xl:grid-cols-3">
          {advantages.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="adv-card">
                <span
                  className="orb absolute right-4 top-3 text-[44px] font-black"
                  style={{ color: "rgba(0,245,255,0.05)", lineHeight: 1 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div
                  className="inline-flex h-10 w-10 items-center justify-center border border-[rgba(0,245,255,0.25)]"
                  style={{ background: "rgba(0,245,255,0.07)" }}
                >
                  <Icon size={18} style={{ color: "var(--cx)" }} />
                </div>
                <h3 className="orb mt-4 text-[12px] font-bold tracking-wider text-white uppercase sm:mt-5 sm:text-[13px]">
                  {item.title}
                </h3>
                <p className="sans mt-2 text-sm leading-7 text-[rgba(255,255,255,0.60)] sm:mt-3">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="glow-divider" />

      {/* ── HOW IT WORKS ── */}
      <section
        id="como-funciona"
        className="relative z-10"
        style={{ background: "rgba(191,95,255,0.02)" }}
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-8 sm:py-24 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <div className="sect-label">
                <span className="chip-cx">● WORKFLOW PROTOCOL</span>
              </div>
              <h2 className="orb text-[22px] font-bold leading-tight text-white sm:text-[42px]">
                THREE STEPS TO A{" "}
                <span
                  style={{
                    color: "var(--cg)",
                    textShadow: "0 0 20px rgba(0,255,159,0.5)",
                  }}
                >
                  COMPLETE
                </span>
                <br />
                PROMO DROP.
              </h2>
              <p className="sans mt-3 text-[14px] leading-7 text-[rgba(255,255,255,0.62)] sm:text-base sm:mt-4">
                Generate your flyer, animate it into a video, and polish your DJ
                photo — three tools in one workflow, built to get you from idea
                to posted content fast.
              </p>
            </div>
            <div className="hud-box-v p-5 sm:p-7">
              <p
                className="mono mb-5 text-[9px] text-[rgba(191,95,255,0.7)]"
                style={{ letterSpacing: "0.18em" }}
              >
                // WORKFLOW: FLYER → ANIMATION → PHOTO
              </p>
              <div className="space-y-0">
                {[
                  "Generate a premium event flyer with AI in minutes",
                  "Animate the flyer with VFX and export as MP4",
                  "Enhance your DJ photo for profiles and ads",
                  "Post across Instagram, TikTok, and Stories",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 border-b border-[rgba(255,255,255,0.05)] py-4 last:border-0"
                  >
                    <span
                      className="orb text-[20px] font-black shrink-0"
                      style={{ color: "rgba(191,95,255,0.3)", lineHeight: 1.2 }}
                    >
                      0{i + 1}
                    </span>
                    <span className="sans text-sm leading-6 text-[rgba(255,255,255,0.62)]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="glow-divider" />

      {/* ── PRICING ── */}
      <section id="pricing" className="relative z-10 scroll-mt-24">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-8 sm:py-24 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="sect-label justify-center">
              <span className="chip-cx">● ACCESS TIERS</span>
            </div>
            <h2 className="orb text-[22px] font-bold leading-tight text-white sm:text-[42px]">
              FULL ACCESS.{" "}
              <span
                style={{
                  color: "var(--cx)",
                  textShadow: "0 0 24px rgba(0,245,255,0.5)",
                }}
              >
                THREE TIERS.
              </span>
            </h2>
            <p className="sans mx-auto mt-3 max-w-2xl text-[14px] leading-7 text-[rgba(255,255,255,0.62)] sm:text-base sm:mt-4">
              Every plan includes flyer generation, animated MP4 export, and DJ
              photo enhancement. Pick the volume that fits your promo schedule.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:mt-12 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.plan}
                className={`hud-box relative overflow-hidden p-6 transition-all sm:hover:-translate-y-1 ${plan.highlighted ? "plan-featured" : ""}`}
              >
                {plan.highlighted && (
                  <div
                    className="absolute inset-x-0 top-0 h-[1px]"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, var(--cx), var(--cv), transparent)",
                    }}
                  />
                )}
                {plan.highlighted && (
                  <div className="mb-3">
                    <span className="chip-cx">MOST POPULAR</span>
                  </div>
                )}

                <h3 className="orb text-lg font-bold tracking-wider text-white uppercase">
                  {plan.name}
                </h3>
                <p className="sans mt-2 text-sm leading-6 text-[rgba(255,255,255,0.60)]">
                  {plan.description}
                </p>

                <div className="mt-5 flex items-end gap-1">
                  <span
                    className="orb text-[38px] font-black leading-none text-white"
                    style={{ letterSpacing: "-0.04em" }}
                  >
                    {plan.price}
                  </span>
                  <span className="sans mb-1 text-sm text-[rgba(255,255,255,0.3)]">
                    {plan.period}
                  </span>
                </div>

                <div className="mt-4 border border-[rgba(0,245,255,0.15)] bg-[rgba(0,245,255,0.05)] px-4 py-3">
                  <p
                    className="sans text-sm font-medium"
                    style={{ color: "var(--cx)" }}
                  >
                    {plan.credits}
                  </p>
                  <p className="sans mt-1 text-xs text-[rgba(255,255,255,0.46)]">
                    {plan.costNote}
                  </p>
                </div>

                <div className="mt-5">
                  <PricingButton plan={plan.plan} label={plan.cta} />
                </div>

                <div className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <span
                        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border border-[rgba(0,245,255,0.35)]"
                        style={{ fontSize: 9, color: "var(--cx)" }}
                      >
                        ✓
                      </span>
                      <span className="sans text-sm leading-6 text-[rgba(255,255,255,0.55)]">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="sans mx-auto mt-7 max-w-2xl text-center text-xs leading-6 text-[rgba(255,255,255,0.28)]">
            After payment, your account is created from the email used at
            checkout. You will receive a secure link to create your password.
          </p>
        </div>
      </section>

      <div className="glow-divider" />

      {/* ── FAQ ── */}
      <section className="relative z-10">
        <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-8 sm:py-24 lg:px-10">
          <div className="text-center">
            <div className="sect-label justify-center">
              <span className="chip-v">● SYSTEM FAQ</span>
            </div>
            <h2 className="orb text-[22px] font-bold leading-tight text-white sm:text-[42px]">
              QUESTIONS BEFORE YOU{" "}
              <span
                style={{
                  color: "var(--cv)",
                  textShadow: "0 0 20px rgba(191,95,255,0.5)",
                }}
              >
                DROP YOUR FIRST VISUAL
              </span>
            </h2>
          </div>
          <div className="mt-8 space-y-2 sm:mt-12">
            {faqs.map((item) => (
              <details
                key={item.question}
                className="group border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] transition-colors hover:border-[rgba(0,245,255,0.2)]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5">
                  <span className="sans text-sm font-medium text-white sm:text-base">
                    {item.question}
                  </span>
                  <span className="faq-plus flex h-7 w-7 shrink-0 items-center justify-center border border-[rgba(255,255,255,0.1)] text-lg leading-none">
                    +
                  </span>
                </summary>
                <div className="border-t border-[rgba(0,245,255,0.08)] px-5 pb-5 pt-4 sm:px-6">
                  <p className="sans text-sm leading-7 text-[rgba(255,255,255,0.64)]">
                    {item.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <div className="glow-divider" />

      {/* ── FINAL CTA ── */}
      <section
        className="relative z-10 overflow-hidden"
        style={{ background: "rgba(0,245,255,0.02)" }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-[400px] sm:w-[400px]"
            style={{
              background:
                "radial-gradient(circle, rgba(0,245,255,0.08), transparent 60%)",
            }}
          />
        </div>
        <div className="relative mx-auto w-full max-w-4xl px-4 py-14 text-center sm:px-8 sm:py-24">
          <div className="sect-label justify-center">
            <span className="chip-cx">● START YOUR FIRST DROP</span>
          </div>
          <h2 className="orb text-[28px] font-black leading-tight text-white sm:text-[54px]">
            YOUR NEXT EVENT
            <br />
            DESERVES A{" "}
            <span
              style={{
                color: "var(--cx)",
                textShadow: "0 0 40px rgba(0,245,255,0.7)",
              }}
            >
              FLYER,
            </span>
            <br />
            <span
              style={{
                color: "var(--cv)",
                textShadow: "0 0 40px rgba(191,95,255,0.7)",
              }}
            >
              A VIDEO,
            </span>{" "}
            AND A LOOK.
          </h2>
          <p className="sans mx-auto mt-5 max-w-xl text-[14px] leading-7 text-[rgba(255,255,255,0.62)] sm:text-base">
            Join thousands of DJs generating premium flyers, animated videos,
            and professional photos — all from one AI platform built for the
            music scene.
          </p>
          <a
            href="#pricing"
            className="btn-cx-solid mt-8 inline-flex w-full items-center justify-center gap-2.5 py-4 text-[11px] sm:w-auto sm:mt-9 sm:px-12 sm:py-4 sm:text-[12px]"
          >
            START CREATING NOW
            <ArrowRight size={14} />
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        className="relative z-10 border-t border-[rgba(0,245,255,0.1)]"
        style={{ background: "#03040A" }}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <p
            className="mono text-xs text-[rgba(255,255,255,0.25)]"
            style={{ letterSpacing: "0.12em" }}
          >
            © 2026 DJ VISUALS AI · ALL RIGHTS RESERVED
          </p>
          <nav className="flex flex-wrap items-center gap-6">
            <Link
              href="/terms"
              className="mono text-[10px] text-[rgba(255,255,255,0.28)] tracking-widest uppercase transition hover:text-[var(--cx)]"
            >
              Terms of Use
            </Link>
            <Link
              href="/privacy"
              className="mono text-[10px] text-[rgba(255,255,255,0.28)] tracking-widest uppercase transition hover:text-[var(--cx)]"
            >
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
        <div
          className="aspect-[4/5] max-h-[76vh] overflow-hidden border border-[rgba(0,245,255,0.12)]"
          style={{ background: "linear-gradient(135deg, #0D0F1A, #03040A)" }}
        >
          <div
            className="h-full w-full animate-pulse"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,245,255,0.05), transparent)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
