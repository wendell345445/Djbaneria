"use client";

import { useState, useEffect, useRef, type MouseEvent } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  BadgeCheck,
  Gauge,
  ImageIcon,
  BadgePercent,
  Layers3,
  ShieldCheck,
  Sparkles,
  Zap,
  Camera,
  ArrowRight,
  Quote,
  CheckCircle2,
  Music2,
  Pause,
  Play,
  LogIn,
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
    title: "Create promo videos from any flyer",
    description:
      "Upload your own flyer or use one created inside the platform, then turn it into a social-ready MP4 promo with motion and VFX.",
  },
  {
    icon: Sparkles,
    title: "Flyers that look ready for the scene",
    description:
      "Create event flyers for club nights, festivals, lineups, and releases without waiting on a designer.",
  },
  {
    icon: Camera,
    title: "Upgrade your DJ image",
    description:
      "Turn casual DJ photos into cleaner artist images for profiles, ads, press kits, and booking pages.",
  },
  {
    icon: BadgeCheck,
    title: "Booking-ready DJ website",
    description:
      "Publish one clean public page with your music links, dates, social channels, booking contact, and professional positioning.",
  },
  {
    icon: Layers3,
    title: "Create more without extra back-and-forth",
    description:
      "Generate more versions, test stronger angles, and keep your monthly promo moving without waiting on revisions.",
  },
  {
    icon: Gauge,
    title: "No design or video skills needed",
    description:
      "A guided dashboard takes you from idea to usable promo assets without design software or video editing tools.",
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
    question: "Can I publish my own DJ website?",
    answer:
      "Yes. DJ Visuals AI now includes a public DJ website feature where you can publish your official profile with booking contact, music links, social channels, and upcoming live dates.",
  },
  {
    question: "What happens after I sign up?",
    answer:
      "After checkout, you receive a secure email link to create your password. Then you enter the dashboard, create flyers, animate promos, enhance DJ photos, and publish your DJ website from one place.",
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
      "Public DJ website with booking, links, and agenda",
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
      "Public DJ website with booking, links, and agenda",
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
      "Public DJ website for artists, agencies, and promoters",
      "Ideal for teams and high-volume promo",
      "Priority creative output",
    ],
  },
] as const;

const testimonials = [
  {
    initials: "DM",
    name: "Daniel Morgan",
    role: "Club DJ",
    location: "Orlando, FL",
    outcome: "More inquiries",
    metric: "3 booking DMs",
    quote:
      "I was skeptical because most AI design tools look fake or generic. DJ Visuals AI actually understood the club vibe — dark, bold, and ready to post. I used an animated flyer for a Friday set and got three DM inquiries that weekend.",
  },
  {
    initials: "NW",
    name: "Noah Walker",
    role: "Open format DJ",
    location: "Miami, FL",
    outcome: "Saved design costs",
    metric: "10 min promo",
    quote:
      "I used to pay $80–100 for one flyer and still go back and forth on revisions. With DJ Visuals AI, I made my first promo in about 10 minutes — and the animated version got way more attention on Instagram.",
  },
  {
    initials: "TC",
    name: "Tyler Carter",
    role: "Event DJ",
    location: "Los Angeles, CA",
    outcome: "More control",
    metric: "$300 saved",
    quote:
      "I do 6–8 events a month, so design costs were adding up fast. In the first month I saved around $300, but the bigger win is control — if the lineup changes, the venue changes, or I need a new promo asset, I can update everything without waiting on anyone.",
  },
  {
    initials: "MR",
    name: "Marcus Reed",
    role: "House DJ",
    location: "Austin, TX",
    outcome: "Better booking page",
    metric: "One clean link",
    quote:
      "Before this, I was sending promoters my Instagram, SoundCloud, and random links separately. Now I have one clean DJ page with my music, booking contact, and upcoming dates. It makes me look way more professional when I pitch gigs.",
  },
] as const;

const bonusMusicTracks = [
  {
    id: "house-01",
    title:
      "David Guetta & Chris Willis x Vinne - Love is Gone (CRISTOV MASH-UP)",
    vibe: "Peak-time club groove",
    src: "/bonus-music/faixa-1.mp3",
  },
  {
    id: "house-02",
    title: " Michael Jackson - Waiting For You (Levant & Mave Remix)",
    vibe: "Deep house warm-up",
    src: "/bonus-music/faixa-2.mp3",
  },
  {
    id: "house-03",
    title:
      " Swedish House Mafia ft. The Weeknd - Moth To A Flame (Gum Gum Remix)",
    vibe: "Festival energy edit",
    src: "/bonus-music/faixa-3.mp3",
  },
  {
    id: "house-04",
    title: " Red Hot Chili Peppers - Otherside (Syzz Remix)",
    vibe: "Latin house bounce",
    src: "/bonus-music/faixa-4.mp3",
  },
  {
    id: "house-05",
    title: "NoizBasses - 4AM (Extended Mix)",
    vibe: "Afro house pulse",
    src: "/bonus-music/faixa-5.mp3",
  },
  {
    id: "house-06",
    title: " Hardwell & Azteck feat. Alex Hepburn - Anybody Out There",
    vibe: "Nightclub closing vibe",
    src: "/bonus-music/faixa-6.mp3",
  },
] as const;

const popupBonusMusicTracks = [
  {
    id: "flashback-popup-01",
    title: "Its A Heartache (Pop-House RMX).mp3",
    vibe: "Included today preview",
    src: "/bonus-music/Its A Heartache (Pop-House RMX).mp3",
  },
  {
    id: "flashback-popup-02",
    title: "Run To Me (FLASH 80s BOOTLEG)",
    vibe: "Exclusive limited remix",
    src: "/bonus-music/Run To Me (FLASH 80s BOOTLEG).mp3",
  },
  {
    id: "flashback-popup-03",
    title: "Voyage (VIP INTRO RMX)",
    vibe: "Private subscriber sample",
    src: "/bonus-music/Voyage (VIP INTRO RMX).mp3",
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

const WHATSAPP_PHONE =
  process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "5538984175013";

const WHATSAPP_MESSAGE = "Hi! I need help with DJ Visuals AI.";

const DJ_SITE_DEMO_URL =
  process.env.NEXT_PUBLIC_DJ_SITE_DEMO_URL || "https://alok.djvisuals.site";

const DJ_SITE_DEMO_VIDEO_SRC =
  process.env.NEXT_PUBLIC_DJ_SITE_DEMO_VIDEO_SRC ||
  "/landing/dj-site-demo/site-dj-demo.mp4";

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M16.04 3.2c-7.04 0-12.76 5.72-12.76 12.76 0 2.25.6 4.45 1.73 6.39L3.2 28.8l6.61-1.73a12.7 12.7 0 0 0 6.23 1.59h.01c7.03 0 12.75-5.72 12.75-12.76S23.08 3.2 16.04 3.2Zm0 23.3h-.01a10.54 10.54 0 0 1-5.36-1.47l-.38-.22-3.92 1.03 1.05-3.82-.25-.39a10.58 10.58 0 0 1-1.62-5.66c0-5.8 4.72-10.52 10.53-10.52 2.81 0 5.45 1.1 7.44 3.08a10.45 10.45 0 0 1 3.08 7.44c0 5.8-4.72 10.52-10.52 10.52Zm5.77-7.88c-.32-.16-1.87-.92-2.16-1.02-.29-.11-.5-.16-.71.16-.21.31-.82 1.02-1 1.23-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.57-.94-.84-1.58-1.88-1.76-2.2-.18-.31-.02-.48.14-.64.14-.14.32-.37.48-.55.16-.18.21-.32.32-.53.11-.21.05-.39-.03-.55-.08-.16-.71-1.71-.97-2.34-.26-.61-.52-.53-.71-.54h-.61c-.21 0-.55.08-.84.39-.29.32-1.1 1.08-1.1 2.63s1.13 3.05 1.29 3.26c.16.21 2.23 3.4 5.4 4.77.75.32 1.34.52 1.8.66.76.24 1.45.21 1.99.13.61-.09 1.87-.76 2.13-1.5.26-.74.26-1.37.18-1.5-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  );
}

function WhatsAppFloatingButton() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
    WHATSAPP_MESSAGE,
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed right-3 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_0_26px_rgba(37,211,102,0.42),0_14px_36px_rgba(0,0,0,0.42)] ring-1 ring-white/15 transition hover:-translate-y-0.5 hover:bg-[#20C45A] hover:shadow-[0_0_34px_rgba(37,211,102,0.56),0_18px_44px_rgba(0,0,0,0.5)] sm:right-5 sm:h-auto sm:w-auto sm:gap-3 sm:rounded-full sm:px-4 sm:py-3"
      style={{
        bottom: "calc(16px + env(safe-area-inset-bottom))",
      }}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/14 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] sm:h-9 sm:w-9">
        <WhatsAppIcon className="h-6 w-6 sm:h-5 sm:w-5" />
      </span>

      <span className="hidden text-left sm:block">
        <span className="sans block text-[10px] font-semibold leading-none text-white/80">
          Need help?
        </span>
        <span className="mono mt-1 block text-[9px] font-black uppercase tracking-[0.14em] text-white">
          Chat on WhatsApp
        </span>
      </span>
    </a>
  );
}

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
          Turn a static flyer into a{" "}
          <span
            style={{
              color: "var(--cv)",
              textShadow: "0 0 28px rgba(191,95,255,0.6)",
            }}
          >
            scroll-stopping promo video
          </span>{" "}
          <span
            style={{
              color: "var(--cx)",
              textShadow: "0 0 28px rgba(0,245,255,0.6)",
            }}
          >
            without editing software
          </span>
        </h2>
        <p className="sans mt-4 max-w-2xl text-[14px] leading-7 text-[rgba(255,255,255,0.62)] sm:text-[15px]">
          DJs can use an AI-made flyer or upload their own finished artwork,
          then export a social-ready MP4.
        </p>
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

function PopupBonusMusicPreview() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewTracks = popupBonusMusicTracks;
  const [activeTrackId, setActiveTrackId] = useState<
    (typeof popupBonusMusicTracks)[number]["id"]
  >(previewTracks[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const activeTrack =
    previewTracks.find((track) => track.id === activeTrackId) ||
    previewTracks[0];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setProgress(0);
    audio.load();

    if (!isPlaying) return;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => setIsPlaying(false));
    }
  }, [activeTrackId, isPlaying]);

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  }

  function selectTrack(trackId: (typeof popupBonusMusicTracks)[number]["id"]) {
    if (trackId === activeTrackId) {
      void togglePlayback();
      return;
    }

    setActiveTrackId(trackId);
    setIsPlaying(true);
  }

  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;

    setProgress((audio.currentTime / audio.duration) * 100);
  }

  function handleSeek(event: MouseEvent<HTMLButtonElement>) {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(
      1,
      Math.max(0, (event.clientX - bounds.left) / bounds.width),
    );

    audio.currentTime = ratio * audio.duration;
    setProgress(ratio * 100);
  }

  return (
    <div className="w-full max-w-full overflow-hidden border border-[rgba(191,95,255,0.18)] bg-[rgba(191,95,255,0.052)] p-2.5 sm:p-3">
      <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3 sm:gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.10em] text-[var(--cv)] sm:tracking-[0.12em]">
            Preview 3 of the 100 remixes
          </p>
          <p className="mt-1 text-[13px] font-medium leading-5 text-white/68 sm:text-[14px]">
            These are 3 samples from one of the 100-track remix bonus packs you
            receive today.
          </p>
        </div>

        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[rgba(191,95,255,0.25)] bg-[rgba(191,95,255,0.09)] text-[var(--cv)] shadow-[0_0_20px_rgba(191,95,255,0.16)] sm:h-9 sm:w-9">
          <Music2 size={15} />
        </span>
      </div>

      <div className="w-full max-w-full overflow-hidden border border-[rgba(0,245,255,0.14)] bg-black/25 p-2 sm:p-2.5">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={togglePlayback}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--cx)] text-[#03040A] shadow-[0_0_26px_rgba(0,245,255,0.28)] transition hover:scale-105 sm:h-10 sm:w-10"
            aria-label={
              isPlaying
                ? "Pause flashback remix preview"
                : "Play flashback remix preview"
            }
          >
            {isPlaying ? (
              <Pause size={14} fill="currentColor" />
            ) : (
              <Play size={14} fill="currentColor" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <p className="sans truncate text-[10px] font-bold text-white/86 sm:text-[11px]">
              {activeTrack.title}
            </p>
            <p className="sans mt-0.5 truncate text-[9px] text-white/48 sm:text-[10px]">
              {activeTrack.vibe}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSeek}
          className="mt-2.5 h-1.5 w-full overflow-hidden bg-white/[0.08] text-left sm:mt-3"
          aria-label="Seek flashback remix preview"
        >
          <span
            className="block h-full bg-gradient-to-r from-[var(--cx)] to-[var(--cv)] shadow-[0_0_16px_rgba(0,245,255,0.25)] transition-[width] duration-150"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </button>

        <audio
          ref={audioRef}
          src={activeTrack.src}
          preload="none"
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          onError={() => setIsPlaying(false)}
        />
      </div>

      <div className="mt-2 grid min-w-0 grid-cols-3 gap-1 sm:gap-1.5 sm:grid-cols-1">
        {previewTracks.map((track, index) => {
          const selected = track.id === activeTrack.id;

          return (
            <button
              key={track.id}
              type="button"
              onClick={() => selectTrack(track.id)}
              className={`flex min-h-[50px] min-w-0 flex-col items-center justify-center gap-1 overflow-hidden border px-1 py-1.5 text-center transition sm:min-h-0 sm:flex-row sm:justify-start sm:gap-2 sm:px-2.5 sm:py-2 sm:text-left ${
                selected
                  ? "border-[rgba(0,245,255,0.45)] bg-[rgba(0,245,255,0.08)]"
                  : "border-white/10 bg-white/[0.025] hover:border-[rgba(0,245,255,0.25)]"
              }`}
            >
              <span
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[8px] sm:h-6 sm:w-6 ${
                  selected
                    ? "border-[rgba(0,245,255,0.45)] text-[var(--cx)]"
                    : "border-white/10 text-white/42"
                }`}
              >
                {selected && isPlaying ? "Ⅱ" : "▶"}
              </span>

              <div className="min-w-0 flex-1">
                <p className="sans text-[8px] font-bold uppercase tracking-[0.08em] text-white/70 sm:hidden">
                  Sample {index + 1}
                </p>
                <p className="sans hidden truncate text-[10px] font-bold text-white/78 sm:block">
                  {String(index + 1).padStart(2, "0")} · {track.title}
                </p>
                <p className="sans mt-0.5 hidden truncate text-[9px] text-white/42 sm:block">
                  {track.vibe}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
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
  const [bonusSelected, setBonusSelected] = useState(false);
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
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/72 px-2 py-4 backdrop-blur-xl sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-purchase-gift-title"
    >
      <div
        className={`popup-inter hud-box relative w-full max-w-[calc(100vw-24px)] overflow-x-hidden overflow-y-auto rounded-[22px] border border-[rgba(0,245,255,0.28)] bg-[#050713] shadow-[0_0_80px_rgba(0,245,255,0.22),0_30px_110px_rgba(0,0,0,0.72)] transition-[max-width,max-height] duration-200 ease-out sm:max-w-[560px] sm:rounded-[24px] ${
          step === "intro"
            ? "max-h-[calc(100dvh-56px)] sm:max-w-[420px] sm:max-h-[calc(100dvh-48px)]"
            : "max-h-[calc(100dvh-56px)] sm:max-h-[calc(100dvh-64px)]"
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
              <BadgePercent
                size={34}
                className="relative z-10 text-[var(--cx)] drop-shadow-[0_0_16px_rgba(0,245,255,0.9)]"
              />
              <span className="gift-spark gift-spark-a" />
              <span className="gift-spark gift-spark-b" />
              <span className="gift-spark gift-spark-c" />
            </div>

            <div className="mb-3 flex justify-center">
              <span className="chip-cx">● WELCOME DISCOUNT</span>
            </div>

            <h2
              id="first-purchase-gift-title"
              className="text-[26px] font-black leading-tight text-white sm:text-[32px]"
            >
              YOU RECEIVED A 20% DISCOUNT
            </h2>

            <p className="mx-auto mt-3 max-w-[360px] text-[16px] font-medium leading-7 text-[rgba(255,255,255,0.72)]">
              Enter your name to redeem
            </p>

            <label className="mt-5 grid gap-2 text-left">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[rgba(255,255,255,0.62)]">
                Your name
              </span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Name"
                className="min-h-12 rounded-[14px] border border-[rgba(0,245,255,0.18)] bg-black/30 px-4 text-[16px] font-medium text-white outline-none transition placeholder:text-white/32 focus:border-[rgba(0,245,255,0.65)] focus:shadow-[0_0_28px_rgba(0,245,255,0.16)] sm:text-[16px]"
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
              I WOULD LIKE THIS DISCOUNT
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
          <div className="relative z-10 min-w-0 p-3 pb-[calc(18px+env(safe-area-inset-bottom))] sm:p-5">
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

              <h2 className="text-[24px] font-black leading-tight text-white sm:text-[30px]">
                {name.trim()}, your 20% discount is ready.
              </h2>
              <p className="mt-2 max-w-[460px] text-[15px] font-medium leading-6 text-white/70 sm:text-[16px] sm:leading-7">
                Choose your plan below and start building your DJ brand today.
              </p>
            </div>

            <div className="mt-3 grid min-w-0 gap-2 sm:mt-4">
              {pricingPlans.map((plan) => {
                const selected = selectedPlan === plan.plan;

                return (
                  <button
                    key={plan.plan}
                    type="button"
                    onClick={() => setSelectedPlan(plan.plan)}
                    className={`relative w-full max-w-full overflow-hidden border p-2.5 text-left transition sm:p-3 ${
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
                          <span className="block text-[14px] font-extrabold uppercase tracking-[0.08em] text-white">
                            {plan.name}
                          </span>
                          {plan.highlighted ? (
                            <span className="mono border border-[rgba(0,245,255,0.24)] bg-[rgba(0,245,255,0.08)] px-2 py-0.5 text-[7px] uppercase tracking-[0.12em] text-[var(--cx)]">
                              BEST VALUE
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-1 text-[13px] font-medium leading-5 text-[rgba(255,255,255,0.66)]">
                          {plan.credits}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="block text-[13px] font-medium text-[rgba(255,255,255,0.50)] line-through">
                          {plan.price}
                        </span>
                        <span className="block text-[21px] font-extrabold leading-tight text-[var(--cx)]">
                          {plan.checkoutPrice}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="mono text-[7px] uppercase tracking-[0.14em] text-[rgba(255,255,255,0.46)]">
                        Welcome discount applied
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

            <div className="mt-3 grid min-w-0 gap-2 sm:mt-4 sm:gap-3">
              <div className="w-full max-w-full  px-2.5 py-2 sm:px-3 sm:py-2.5">
                <p className="mono text-[7px] font-bold uppercase tracking-[0.14em] text-[var(--cx)] sm:tracking-[0.16em]">
                  Included today
                </p>
                <p className="mt-1 text-[14px] font-medium leading-6 text-white/70 sm:text-[14px]">
                  Your subscription includes these bonus packs today at no extra
                  cost.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setBonusSelected((current) => !current)}
                aria-pressed={bonusSelected}
                className={`relative w-full max-w-full overflow-hidden border p-2.5 text-left transition sm:p-3 ${
                  bonusSelected
                    ? "border-[rgba(0,255,159,0.58)] bg-[rgba(0,255,159,0.09)] shadow-[0_0_24px_rgba(0,255,159,0.12)]"
                    : "border-[rgba(255,255,255,0.10)] bg-white/[0.035] hover:border-[rgba(0,255,159,0.28)]"
                }`}
              >
                {bonusSelected ? (
                  <span className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--cg)] to-transparent" />
                ) : null}

                <div className="flex items-start gap-2.5 sm:gap-3">
                  <span
                    className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center border text-[10px] font-black sm:h-5 sm:w-5 sm:text-[11px] ${
                      bonusSelected
                        ? "border-[rgba(0,255,159,0.65)] bg-[rgba(0,255,159,0.16)] text-[var(--cg)]"
                        : "border-white/18 text-white/34"
                    }`}
                  >
                    {bonusSelected ? "✓" : ""}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="mono border border-[rgba(0,255,159,0.24)] bg-[rgba(0,255,159,0.08)] px-2 py-1 text-[7px] font-bold uppercase tracking-[0.14em] text-[var(--cg)]">
                        Included bonus
                      </span>
                      <span className="mono text-[7px] uppercase tracking-[0.14em] text-white/42">
                        No extra cost
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-3">
                      <img
                        src="/mokup.webp"
                        alt="100 Flashback Remix Tracks bonus pack"
                        className="h-16 w-16 shrink-0 rounded-[14px] object-cover shadow-[0_0_24px_rgba(0,255,159,0.12)] sm:h-20 sm:w-20"
                        loading="lazy"
                        decoding="async"
                      />

                      <div className="min-w-0">
                        <p className="text-[15px] font-black uppercase leading-tight text-white sm:text-[17px]">
                          100 Flashback Remix Tracks
                        </p>

                        <p className="mt-1 text-[14px] font-medium leading-6 text-white/68 sm:text-[14px]">
                          Included with your subscription today.
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 grid gap-2 sm:flex sm:items-center sm:justify-between sm:gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="mono rounded-full border border-white/10 bg-white/[0.035] px-2 py-1 text-[7px] uppercase tracking-[0.14em] text-white/42">
                          Normally{" "}
                          <span className="line-through decoration-[rgba(255,255,255,0.55)]">
                            $29
                          </span>
                        </span>

                        <span className="mono rounded-full  px-2 py-1 text-[12px] font-black uppercase tracking-[0.14em] text-[#009632] ">
                          Save $29
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 sm:justify-end">
                        <span className="mono text-[7px] uppercase tracking-[0.14em] text-white/42">
                          Included today
                        </span>
                        <span className="sans rounded-full border border-[rgba(0,255,159,0.34)] bg-[rgba(0,255,159,0.12)] px-2.5 py-1 text-sm font-black text-[var(--cg)] shadow-[0_0_22px_rgba(0,255,159,0.16)]">
                          $0 today
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              <div className="relative w-full max-w-full overflow-hidden border border-[rgba(0,245,255,0.16)] bg-white/[0.035] p-2.5 text-left sm:p-3">
                <span className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--cx)] to-transparent" />

                <div className="flex items-start gap-2.5 sm:gap-3">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center border border-[rgba(0,245,255,0.55)] bg-[rgba(0,245,255,0.12)] text-[10px] font-black text-[var(--cx)] sm:h-5 sm:w-5 sm:text-[11px]">
                    ✓
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="mono border border-[rgba(0,245,255,0.24)] bg-[rgba(0,245,255,0.08)] px-2 py-1 text-[7px] font-bold uppercase tracking-[0.14em] text-[var(--cx)]">
                        Included bonus
                      </span>
                      <span className="mono text-[7px] uppercase tracking-[0.14em] text-white/42">
                        No extra cost
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-3">
                      <img
                        src="/mokup1.webp"
                        alt="100 House Remix Tracks bonus pack"
                        className="h-16 w-16 shrink-0 rounded-[14px] object-cover shadow-[0_0_24px_rgba(0,245,255,0.12)] sm:h-20 sm:w-20"
                        loading="lazy"
                        decoding="async"
                      />

                      <div className="min-w-0">
                        <p className="text-[15px] font-black uppercase leading-tight text-white sm:text-[17px]">
                          100 House Remix Tracks
                        </p>

                        <p className="mt-1 text-[14px] font-medium leading-6 text-white/68 sm:text-[14px]">
                          Also included with your subscription today.
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 grid gap-2 sm:flex sm:items-center sm:justify-between sm:gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="mono rounded-full border border-white/10 bg-white/[0.035] px-2 py-1 text-[7px] uppercase tracking-[0.14em] text-white/42">
                          Normally{" "}
                          <span className="line-through decoration-[rgba(255,255,255,0.55)]">
                            $29
                          </span>
                        </span>

                        <span className="mono rounded-full px-2 py-1 text-[12px] font-black uppercase tracking-[0.14em] text-[#009632]">
                          Save $29
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 sm:justify-end">
                        <span className="mono text-[7px] uppercase tracking-[0.14em] text-white/42">
                          Included today
                        </span>
                        <span className="sans rounded-full border border-[rgba(0,255,159,0.34)] bg-[rgba(0,255,159,0.12)] px-2.5 py-1 text-sm font-black text-[var(--cg)] shadow-[0_0_22px_rgba(0,255,159,0.16)]">
                          $0 today
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 border border-[rgba(0,245,255,0.22)] bg-[linear-gradient(135deg,rgba(0,245,255,0.085),rgba(191,95,255,0.055))] px-3 py-4 text-center shadow-[0_0_28px_rgba(0,245,255,0.10)]">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--cx)]">
                  Ready to start?
                </p>
                <p className="mt-2 text-[14px] font-medium leading-6 text-white/76 sm:text-[15px]">
                  Secure checkout. Once your payment is approved, your login
                  access is sent immediately to your email.
                </p>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={loading}
                  className="btn-cx-solid mt-3 inline-flex min-h-[46px] w-full items-center justify-center gap-2 px-5 py-3 text-[10px] disabled:cursor-wait disabled:opacity-70"
                >
                  {loading
                    ? "OPENING CHECKOUT..."
                    : `CONTINUE WITH ${selectedPlanData?.name?.toUpperCase() || "PLAN"}`}
                  <ArrowRight size={12} />
                </button>
              </div>

              <PopupBonusMusicPreview />
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

function DjWebsiteFeatureSection() {
  return (
    <section
      id="dj-website"
      className="relative z-10 mx-auto w-full max-w-7xl px-4 py-12 sm:px-8 sm:py-20 lg:px-10"
    >
      <div className="relative overflow-hidden border border-[rgba(0,245,255,0.18)] bg-[radial-gradient(circle_at_top_left,rgba(0,245,255,0.10),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(191,95,255,0.10),transparent_34%),rgba(255,255,255,0.025)] p-5 shadow-[0_0_70px_rgba(0,245,255,0.08)] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--cx)] to-transparent" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[rgba(0,245,255,0.10)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-[rgba(191,95,255,0.11)] blur-3xl" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="sect-label">
              <span className="chip-cx">● DJ WEBSITE</span>
            </div>

            <h2 className="orb mt-4 text-[22px] font-black uppercase leading-tight text-white sm:text-[42px]">
              Stop sending random links.{" "}
              <span
                style={{
                  color: "var(--cx)",
                  textShadow: "0 0 26px rgba(0,245,255,0.55)",
                }}
              >
                Send one clean DJ page.
              </span>
            </h2>

            <p className="sans mt-4 max-w-xl text-[14px] leading-7 text-[rgba(255,255,255,0.64)] sm:text-base">
              Give promoters one professional page with your music, socials,
              dates, and booking contact — ready to share after checkout.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="#pricing"
                className="btn-cx-solid inline-flex items-center justify-center gap-2.5 px-6 py-4 text-[11px] uppercase"
              >
                CREATE MY DJ PAGE
                <ArrowRight size={13} />
              </a>
              <a
                href={DJ_SITE_DEMO_URL}
                target="_blank"
                rel="noreferrer"
                className="btn-cx inline-flex items-center justify-center gap-2.5 px-6 py-4 text-[11px] uppercase"
              >
                VIEW LIVE EXAMPLE
                <ArrowRight size={13} />
              </a>
            </div>
          </div>

          <div>
            <div className="relative mx-auto w-full max-w-[330px] sm:max-w-[420px]">
              <div className="pointer-events-none absolute -inset-8 rounded-[42px] bg-[rgba(0,245,255,0.13)] blur-3xl" />
              <div className="pointer-events-none absolute -inset-7 rounded-[42px] bg-[rgba(191,95,255,0.12)] blur-3xl" />

              <div className="relative overflow-hidden rounded-[30px] border border-[rgba(0,245,255,0.22)] bg-[#05060D] p-2 shadow-[0_28px_90px_rgba(0,0,0,0.62),0_0_52px_rgba(0,245,255,0.12)] sm:rounded-[34px]">
                <div className="flex items-center gap-1.5 border-b border-white/10 px-2 py-2">
                  <span className="h-2 w-2 rounded-full bg-[#FF5F57]" />
                  <span className="h-2 w-2 rounded-full bg-[#FFBD2E]" />
                  <span className="h-2 w-2 rounded-full bg-[#28C840]" />
                  <span className="mono ml-2 truncate text-[7px] uppercase tracking-[0.14em] text-white/38">
                    djvisuals.site/live-preview
                  </span>
                </div>

                <div className="relative overflow-hidden rounded-[22px] bg-[#03040A] sm:rounded-[26px]">
                  <video
                    src={DJ_SITE_DEMO_VIDEO_SRC}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster="/landing/dj-site-demo/site-dj-demo-poster.webp"
                    className="block h-auto w-full object-contain"
                  />

                  <div className="pointer-events-none absolute inset-0 rounded-[22px] bg-[linear-gradient(110deg,rgba(255,255,255,0.08),transparent_22%,transparent_76%,rgba(255,255,255,0.05))] sm:rounded-[26px]" />
                  <div className="pointer-events-none absolute inset-0 rounded-[22px] ring-1 ring-inset ring-white/10 sm:rounded-[26px]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BonusMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeTrackId, setActiveTrackId] = useState<
    (typeof bonusMusicTracks)[number]["id"]
  >(bonusMusicTracks[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loadError, setLoadError] = useState(false);

  const activeTrack =
    bonusMusicTracks.find((track) => track.id === activeTrackId) ||
    bonusMusicTracks[0];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    setProgress(0);
    setDuration(0);
    setLoadError(false);
    audio.load();

    if (!isPlaying) return;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => setIsPlaying(false));
    }
  }, [activeTrackId, isPlaying]);

  async function playTrack(trackId: (typeof bonusMusicTracks)[number]["id"]) {
    const audio = audioRef.current;

    if (trackId === activeTrackId) {
      if (!audio) return;

      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        return;
      }

      setLoadError(false);

      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }

      return;
    }

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    setProgress(0);
    setDuration(0);
    setLoadError(false);
    setActiveTrackId(trackId);
    setIsPlaying(true);
  }

  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;

    setProgress((audio.currentTime / audio.duration) * 100);
  }

  function handleLoadedMetadata() {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;

    setDuration(audio.duration);
  }

  function handleSeek(
    event: MouseEvent<HTMLButtonElement>,
    trackId: (typeof bonusMusicTracks)[number]["id"],
  ) {
    const audio = audioRef.current;
    if (!audio || !audio.duration || trackId !== activeTrackId) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(
      1,
      Math.max(0, (event.clientX - bounds.left) / bounds.width),
    );

    audio.currentTime = ratio * audio.duration;
    setProgress(ratio * 100);
  }

  function formatTime(seconds: number) {
    if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  return (
    <div className="mt-6 p-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mono text-[8px] uppercase tracking-[0.18em] text-[rgba(0,245,255,0.72)]">
            Listen before you unlock
          </p>
          <h3 className="orb mt-1 text-sm font-bold uppercase tracking-[0.08em] text-white sm:text-base">
            Preview the bonus pack
          </h3>
          <p className="sans mt-2 text-xs leading-5 text-[rgba(255,255,255,0.62)] sm:text-sm">
            Play 6 sample house remixes from the exclusive subscriber pack.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-2.5">
        {bonusMusicTracks.map((track, index) => {
          const selected = track.id === activeTrack.id;
          const playingThisTrack = selected && isPlaying;
          const trackProgress = selected ? progress : 0;

          return (
            <div
              key={track.id}
              className={`group overflow-hidden border transition ${
                selected
                  ? "border-[rgba(0,245,255,0.56)] bg-[rgba(0,245,255,0.08)] shadow-[0_0_24px_rgba(0,245,255,0.13)]"
                  : "border-white/10 bg-white/[0.025] hover:border-[rgba(0,245,255,0.28)] hover:bg-[rgba(0,245,255,0.045)]"
              }`}
            >
              <div className="flex items-center gap-3 p-3 sm:p-3.5">
                <button
                  type="button"
                  onClick={() => void playTrack(track.id)}
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition sm:h-11 sm:w-11 ${
                    selected
                      ? "border-[rgba(0,245,255,0.46)] bg-[var(--cx)] text-[#03040A] shadow-[0_0_28px_rgba(0,245,255,0.28)]"
                      : "border-white/10 bg-white/[0.04] text-white/72 group-hover:border-[rgba(0,245,255,0.35)] group-hover:text-[var(--cx)]"
                  }`}
                  aria-label={
                    playingThisTrack
                      ? `Pause ${track.title}`
                      : `Play ${track.title}`
                  }
                >
                  {playingThisTrack ? (
                    <Pause size={15} fill="currentColor" />
                  ) : (
                    <Play size={15} fill="currentColor" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="mono text-[7px] uppercase tracking-[0.16em] text-[rgba(255,255,255,0.42)]">
                        Sample {String(index + 1).padStart(2, "0")}
                      </p>
                      <p className="sans mt-1 truncate text-xs font-bold text-white/84 sm:text-sm">
                        {track.title}
                      </p>
                    </div>

                    <span
                      className={`mono shrink-0 text-[8px] uppercase tracking-[0.14em] ${
                        selected
                          ? "text-[var(--cx)]"
                          : "text-[rgba(255,255,255,0.38)]"
                      }`}
                    >
                      {selected ? formatTime(duration) : "Preview"}
                    </span>
                  </div>

                  <p className="sans mt-1 truncate text-[10px] leading-4 text-[rgba(255,255,255,0.52)] sm:text-xs">
                    {track.vibe}
                  </p>

                  <button
                    type="button"
                    onClick={(event) => handleSeek(event, track.id)}
                    className="mt-2.5 h-1.5 w-full overflow-hidden bg-white/[0.08] text-left"
                    aria-label={`Seek ${track.title}`}
                  >
                    <span
                      className="block h-full bg-gradient-to-r from-[var(--cx)] to-[var(--cv)] shadow-[0_0_18px_rgba(0,245,255,0.34)] transition-[width] duration-150"
                      style={{
                        width: `${Math.min(100, Math.max(0, trackProgress))}%`,
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {loadError ? (
        <p className="sans mt-3 text-xs leading-5 text-rose-300">
          Preview unavailable right now. Please try another sample.
        </p>
      ) : null}

      <audio
        ref={audioRef}
        src={activeTrack.src}
        preload="none"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          setIsPlaying(false);
          setLoadError(true);
        }}
      />
    </div>
  );
}

function ExclusiveMusicBonusSection() {
  return (
    <section
      id="bonus"
      className="relative z-10 mx-auto w-full max-w-7xl px-4 py-12 sm:px-8 sm:py-24 lg:px-10"
    >
      <div className="relative overflow-hidden border border-[rgba(0,245,255,0.18)] bg-[linear-gradient(135deg,rgba(0,245,255,0.07),rgba(191,95,255,0.055),rgba(255,255,255,0.018))] p-5 shadow-[0_0_70px_rgba(0,245,255,0.09)] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--cx)] to-transparent" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[rgba(0,245,255,0.12)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-[rgba(191,95,255,0.13)] blur-3xl" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <div className="sect-label">
              <span className="chip-cx">● EXCLUSIVE BONUS</span>
            </div>
            <h2 className="orb text-[24px] font-black uppercase leading-tight tracking-[-0.04em] text-white sm:text-[42px]">
              Get the
              <br />
              <span
                style={{
                  color: "var(--cx)",
                  textShadow: "0 0 28px rgba(0,245,255,0.58)",
                }}
              >
                100 House Remix
              </span>
              <br />
              Music Pack
            </h2>
            <p className="sans mt-4 max-w-2xl text-[14px] leading-7 text-[rgba(255,255,255,0.68)] sm:text-[16px]">
              Subscribe and unlock an exclusive remix pack as a launch bonus:
              more creative fuel for sets, content ideas, promo drops, and
              high-energy social clips.
            </p>

            <a
              href="#pricing"
              className="btn-cx-solid mt-7 inline-flex w-full items-center justify-center gap-2.5 py-4 text-[11px] sm:w-auto sm:min-h-[48px] sm:px-8"
            >
              UNLOCK THE BONUS
              <ArrowRight size={12} />
            </a>
          </div>

          <div className="relative overflow-hidden p-0">
            <div className="grid gap-5 lg:grid-cols-[0.72fr_1fr] lg:items-center">
              <div className="relative mx-auto w-full max-w-[260px]">
                <div className="pointer-events-none absolute -inset-5 rounded-[30px] bg-[rgba(0,245,255,0.12)] blur-3xl" />
                <div className="pointer-events-none absolute -inset-4 rounded-[30px] bg-[rgba(191,95,255,0.10)] blur-3xl" />

                <div className="relative overflow-hidden rounded-[24px] border border-[rgba(0,245,255,0.20)] bg-black/30 p-2 shadow-[0_26px_80px_rgba(0,0,0,0.55),0_0_46px_rgba(0,245,255,0.12)]">
                  <img
                    src="/mokup1.webp"
                    alt="100 House Remix Music Pack"
                    className="h-auto w-full rounded-[18px] object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            </div>

            <BonusMusicPlayer />
          </div>
        </div>
      </div>
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
      <WhatsAppFloatingButton />
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Orbitron:wght@400;500;600;700;800;900&family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');

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

        .popup-inter,
        .popup-inter .sans,
        .popup-inter .mono,
        .popup-inter .orb,
        .popup-inter input,
        .popup-inter button {
          font-family: 'Inter', sans-serif !important;
        }

        .popup-inter {
          letter-spacing: -0.01em;
        }

        .dj-hero-bg {
          isolation: isolate;
          background:
            radial-gradient(circle at 50% 22%, rgba(0, 245, 255, 0.08), transparent 28%),
            radial-gradient(circle at 18% 74%, rgba(0, 85, 255, 0.12), transparent 32%),
            radial-gradient(circle at 86% 72%, rgba(124, 58, 237, 0.12), transparent 34%),
            linear-gradient(180deg, #01020A 0%, #02030A 48%, #000000 100%);
        }

        .dj-hero-bg::before {
          content: "";
          position: absolute;
          inset: -24%;
          z-index: 0;
          pointer-events: none;
          background:
            linear-gradient(72deg, transparent 0%, transparent 43%, rgba(0, 245, 255, 0.10) 48%, transparent 54%, transparent 100%),
            linear-gradient(108deg, transparent 0%, transparent 44%, rgba(191, 95, 255, 0.09) 49%, transparent 55%, transparent 100%),
            repeating-linear-gradient(
              90deg,
              rgba(0, 245, 255, 0.030) 0px,
              rgba(0, 245, 255, 0.030) 1px,
              transparent 1px,
              transparent 96px
            );
          opacity: 0.58;
          transform: rotate(-5deg);
          animation: djHeroLaserSweep 10s ease-in-out infinite alternate;
        }

        .dj-hero-bg::after {
          content: "";
          position: absolute;
          inset: auto 0 0 0;
          z-index: 0;
          height: 42%;
          pointer-events: none;
          background:
            repeating-linear-gradient(
              90deg,
              transparent 0px,
              transparent 20px,
              rgba(0, 245, 255, 0.16) 20px,
              rgba(0, 245, 255, 0.16) 23px,
              transparent 23px,
              transparent 52px
            );
          mask-image: linear-gradient(to top, rgba(0,0,0,0.88), transparent 78%);
          -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,0.88), transparent 78%);
          opacity: 0.38;
          transform-origin: bottom;
          animation: djHeroEqualizerDark 2.1s ease-in-out infinite alternate;
        }

        .dj-hero-lights {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
          background:
            radial-gradient(circle at 50% 64%, rgba(0,0,0,0.10), rgba(0,0,0,0.62) 62%, rgba(0,0,0,0.86) 100%),
            linear-gradient(180deg, rgba(0,0,0,0.24), rgba(0,0,0,0.72));
        }

        .dj-hero-lights::before,
        .dj-hero-lights::after {
          content: "";
          position: absolute;
          top: -18%;
          width: 24%;
          height: 92%;
          filter: blur(20px);
          opacity: 0.24;
          mix-blend-mode: screen;
          transform-origin: top center;
          clip-path: polygon(46% 0, 56% 0, 100% 100%, 0 100%);
        }

        .dj-hero-lights::before {
          left: 12%;
          background: linear-gradient(180deg, rgba(0,245,255,0.54), transparent 78%);
          animation: djHeroSpotLeft 7s ease-in-out infinite alternate;
        }

        .dj-hero-lights::after {
          right: 12%;
          background: linear-gradient(180deg, rgba(191,95,255,0.50), transparent 78%);
          animation: djHeroSpotRight 8s ease-in-out infinite alternate;
        }

        .dj-hero-particles {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.26;
          background-image:
            radial-gradient(circle, rgba(0,245,255,0.38) 0 1px, transparent 1.4px),
            radial-gradient(circle, rgba(191,95,255,0.28) 0 1px, transparent 1.4px);
          background-size: 110px 110px, 150px 150px;
          background-position: 0 0, 42px 36px;
          animation: djHeroParticlesDark 14s linear infinite;
        }

        @keyframes djHeroLaserSweep {
          0% {
            transform: translateX(-5%) rotate(-5deg);
            opacity: 0.36;
          }
          100% {
            transform: translateX(5%) rotate(-5deg);
            opacity: 0.62;
          }
        }

        @keyframes djHeroEqualizerDark {
          0% {
            opacity: 0.20;
            transform: scaleY(0.46);
          }
          50% {
            opacity: 0.46;
            transform: scaleY(0.88);
          }
          100% {
            opacity: 0.32;
            transform: scaleY(0.62);
          }
        }

        @keyframes djHeroSpotLeft {
          0% {
            transform: rotate(-17deg) translateY(0) scaleX(0.82);
            opacity: 0.14;
          }
          100% {
            transform: rotate(-4deg) translateY(4%) scaleX(1.04);
            opacity: 0.32;
          }
        }

        @keyframes djHeroSpotRight {
          0% {
            transform: rotate(17deg) translateY(2%) scaleX(0.86);
            opacity: 0.13;
          }
          100% {
            transform: rotate(4deg) translateY(5%) scaleX(1.08);
            opacity: 0.30;
          }
        }

        @keyframes djHeroParticlesDark {
          0% {
            background-position: 0 0, 42px 36px;
          }
          100% {
            background-position: 110px 110px, 192px 186px;
          }
        }

        @media (max-width: 640px) {
          .dj-hero-bg {
            background:
              radial-gradient(circle at 50% 16%, rgba(0, 245, 255, 0.18), transparent 38%),
              radial-gradient(circle at 14% 70%, rgba(191, 95, 255, 0.18), transparent 38%),
              radial-gradient(circle at 88% 72%, rgba(255, 45, 107, 0.13), transparent 36%),
              linear-gradient(180deg, #02030A 0%, #010108 52%, #000000 100%);
          }

          .dj-hero-bg::before {
            inset: -18%;
            opacity: 0.78;
            background:
              linear-gradient(112deg, transparent 0%, transparent 42%, rgba(0, 245, 255, 0.18) 48%, transparent 58%, transparent 100%),
              linear-gradient(68deg, transparent 0%, transparent 46%, rgba(191, 95, 255, 0.14) 51%, transparent 60%, transparent 100%),
              repeating-linear-gradient(
                90deg,
                rgba(0, 245, 255, 0.055) 0px,
                rgba(0, 245, 255, 0.055) 1px,
                transparent 1px,
                transparent 54px
              );
            animation: djHeroLaserSweep 6s ease-in-out infinite alternate;
          }

          .dj-hero-bg::after {
            height: 36%;
            opacity: 0.58;
            background:
              repeating-linear-gradient(
                90deg,
                transparent 0px,
                transparent 13px,
                rgba(0, 245, 255, 0.24) 13px,
                rgba(0, 245, 255, 0.24) 16px,
                transparent 16px,
                transparent 34px
              );
            animation: djHeroEqualizerDark 1.55s ease-in-out infinite alternate;
          }

          .dj-hero-lights {
            background:
              radial-gradient(circle at 50% 58%, rgba(0,0,0,0.08), rgba(0,0,0,0.54) 58%, rgba(0,0,0,0.78) 100%),
              linear-gradient(180deg, rgba(0,0,0,0.16), rgba(0,0,0,0.58));
          }

          .dj-hero-lights::before,
          .dj-hero-lights::after {
            width: 44%;
            height: 78%;
            top: -10%;
            filter: blur(22px);
            opacity: 0.36;
          }

          .dj-hero-lights::before {
            left: 2%;
          }

          .dj-hero-lights::after {
            right: 2%;
          }

          .dj-hero-particles {
            opacity: 0.42;
            background-image:
              radial-gradient(circle, rgba(0,245,255,0.48) 0 1px, transparent 1.4px),
              radial-gradient(circle, rgba(191,95,255,0.40) 0 1px, transparent 1.4px);
            background-size: 70px 70px, 96px 96px;
            animation: djHeroParticlesDarkMobile 9s linear infinite;
          }
        }

        @keyframes djHeroParticlesDarkMobile {
          0% {
            background-position: 0 0, 28px 24px;
          }
          100% {
            background-position: 70px 70px, 124px 120px;
          }
        }



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
        .hero-mockup-reveal {
          opacity: 0;
          transform: translateY(28px) scale(0.94);
          filter: saturate(0.86) brightness(0.82);
          animation: heroMockupReveal 950ms cubic-bezier(.16,1,.3,1) 180ms forwards;
          will-change: opacity, transform, filter;
        }

        .hero-mockup-image {
          animation: heroMockupFloat 5.8s ease-in-out 1.2s infinite;
          will-change: transform;
        }

        @keyframes heroMockupReveal {
          0% {
            opacity: 0;
            transform: translateY(28px) scale(0.94);
            filter: saturate(0.86) brightness(0.82) blur(4px);
          }
          62% {
            opacity: 1;
            transform: translateY(-4px) scale(1.015);
            filter: saturate(1.12) brightness(1.08) blur(0);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: saturate(1) brightness(1) blur(0);
          }
        }

        @keyframes heroMockupFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-mockup-reveal,
          .hero-mockup-image {
            animation: none !important;
          }

          .hero-mockup-reveal {
            opacity: 1;
            transform: none;
            filter: none;
          }
        }

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

        /* ── TESTIMONIAL CAROUSEL ── */
        .testi-scroll {
          display: flex;
          gap: 18px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          padding: 2px 2px 18px;
          scrollbar-width: none;
        }
        .testi-scroll::-webkit-scrollbar { display: none; }
        .testi-scroll > * {
          flex: 0 0 min(420px, 86vw);
          scroll-snap-align: start;
        }
        @media (min-width: 1024px) {
          .testi-scroll > * {
            flex-basis: calc((100% - 36px) / 3);
          }
        }

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
        className="fixed inset-x-0 top-0 z-50"
        style={{
          background: "rgba(3,4,10,0.92)",
          borderBottom: "1px solid rgba(0,245,255,0.12)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8 lg:px-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
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
              ["DJ Website", "#dj-website"],
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
              className="inline-flex min-h-[40px] items-center justify-center gap-2 border border-[rgba(0,245,255,0.48)] bg-[linear-gradient(135deg,rgba(0,245,255,0.18),rgba(191,95,255,0.12))] px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-[0_0_24px_rgba(0,245,255,0.16)] transition-all hover:-translate-y-0.5 hover:border-[var(--cx)] hover:text-[var(--cx)] hover:shadow-[0_0_34px_rgba(0,245,255,0.28)] sm:px-5"
              style={{
                fontFamily: "Space Mono, monospace",
              }}
            >
              <LogIn size={14} />
              LOGIN
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
            ["DJ Website", "#dj-website"],
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
            className="inline-flex items-center justify-center gap-2"
            style={{
              fontFamily: "Orbitron, monospace",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#ffffff",
              padding: "18px 0",
              borderBottom: "1px solid rgba(0,245,255,0.18)",
              textDecoration: "none",
              textShadow: "0 0 18px rgba(0,245,255,0.45)",
            }}
          >
            <LogIn size={15} />
            LOGIN
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
      <section className="dj-hero-bg relative z-10 mx-auto w-full max-w-7xl overflow-hidden px-4 pb-14 pt-28 sm:px-8 sm:pb-28 sm:pt-32 lg:px-10 lg:pb-36 lg:pt-44">
        <div className="dj-hero-lights" />
        <div className="dj-hero-particles" />
        <div className="relative z-10">
          {/* Hero promise line */}
          <div
            className="mono mx-auto mb-6 flex max-w-3xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[9px] text-[rgba(255,255,255,0.34)] sm:text-[10px]"
            style={{ letterSpacing: "0.12em" }}
          >
            <span style={{ color: "var(--cg)" }}>● DJ PROMO SYSTEM</span>
            <span className="hidden sm:inline">|</span>
            <span>FLYERS · VIDEOS · PHOTOS · BOOKING SITE</span>
          </div>

          <div className="mx-auto grid max-w-5xl gap-10 text-center">
            <div>
              <h1 className="hero-h1 orb text-[30px] font-black leading-[0.98] tracking-[-0.015em] text-white sm:text-[58px] sm:leading-[0.86] lg:text-[76px] lg:leading-[0.88] uppercase">
                Pro Sound.
                <br />
                <span
                  style={{
                    color: "var(--cx)",
                    textShadow: "0 0 40px rgba(0,245,255,0.62)",
                  }}
                >
                  Amateur Look?
                </span>
                <br />
                <span
                  style={{
                    color: "var(--cv)",
                    textShadow: "0 0 40px rgba(191,95,255,0.62)",
                  }}
                >
                  Not Anymore.
                </span>
                <span className="cursor" />
              </h1>

              <p className="sans mx-auto mt-5 max-w-2xl text-[14px] leading-5 text-[rgba(255,255,255,0.66)] sm:text-[16px] sm:leading-7">
                Flyers, promo videos, photos, and a booking-ready site — in
                under a minute.
              </p>

              <div className="hero-mockup-reveal relative mx-auto mt-6 w-full max-w-[380px] sm:max-w-[540px] lg:max-w-[680px]">
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 h-[88%] w-[110%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(0,245,255,0.24)] blur-3xl"
                  style={{
                    animation: "heroMockupGlow 4.2s ease-in-out infinite",
                  }}
                />
                <div
                  className="pointer-events-none absolute left-[42%] top-[52%] h-[78%] w-[96%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(191,95,255,0.24)] blur-3xl"
                  style={{
                    animation:
                      "heroMockupGlow 5.3s ease-in-out infinite reverse",
                  }}
                />
                <div
                  className="pointer-events-none absolute left-[58%] top-[44%] h-[54%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(0,255,159,0.10)] blur-3xl"
                  style={{
                    animation: "heroMockupGlow 6.2s ease-in-out infinite",
                  }}
                />

                <img
                  src="/LAPTOP AND PHONE SCREEN MOCKUP.png"
                  alt="DJ Visuals AI laptop and phone platform mockup"
                  className="hero-mockup-image relative z-10 h-auto w-full select-none object-contain drop-shadow-[0_28px_70px_rgba(0,0,0,0.62)]"
                  loading="eager"
                  decoding="async"
                />
              </div>

              <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <a
                  href="#pricing"
                  className="btn-cx-solid inline-flex w-full items-center justify-center gap-2.5 py-4 text-[11px] sm:w-auto sm:min-h-[52px] sm:px-8 uppercase"
                >
                  Get Instant Access
                  <ArrowRight size={13} />
                </a>
              </div>

              <p className="sans mx-auto mt-5 max-w-2xl text-[13px] leading-6 text-[rgba(255,255,255,0.62)] sm:text-[15px]">
                You already have the sound. Now build the visual brand that gets
                you noticed, followed, and booked.
              </p>

              <div className="mx-auto mt-4 grid max-w-2xl grid-cols-1 gap-2 sm:grid-cols-3">
                {[
                  "Look professional",
                  "Post more content",
                  "Get booked faster",
                ].map((item) => (
                  <div
                    key={item}
                    className="border border-[rgba(0,245,255,0.16)] bg-white/[0.025] px-4 py-3"
                  >
                    <p className="orb text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mono mt-4 text-[9px] uppercase tracking-[0.16em] text-[rgba(255,255,255,0.46)]">
                Full promo system for DJs. Cancel anytime.
              </p>

              {/* Conversion benefits row */}
            </div>
          </div>
        </div>
      </section>

      <div className="glow-divider" />

      {/* ── STATIC vs ANIMATED COMPARISON ── */}
      <StaticVsAnimatedSection />

      <div className="glow-divider" />

      {/* ── DJ WEBSITE FEATURE ── */}
      <DjWebsiteFeatureSection />

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
              DJS USING IT TO{" "}
              <span
                style={{
                  color: "var(--cv)",
                  textShadow: "0 0 24px rgba(191,95,255,0.5)",
                }}
              >
                LOOK PROFESSIONAL,
              </span>{" "}
              POST MORE, AND GET BOOKED
            </h2>
            <p className="sans mx-auto mt-3 max-w-2xl text-[14px] leading-7 text-[rgba(255,255,255,0.62)] sm:text-[15px]">
              Real feedback from DJs using the platform to create better promo
              assets, look more professional online, and make booking easier.
            </p>
          </div>

          <p className="mono mt-5 text-center text-[9px] uppercase tracking-[0.16em] text-[rgba(255,255,255,0.32)]">
            Drag to read more customer stories
          </p>

          <div className="testi-scroll mt-6 sm:mt-10">
            {testimonials.map((t) => (
              <article
                key={t.name}
                className="testi-card hud-box-v relative overflow-hidden p-5 sm:p-7"
              >
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(0,245,255,0.06), transparent 60%)",
                  }}
                />
                <Quote size={18} style={{ color: "rgba(0,245,255,0.35)" }} />
                <p className="sans mt-4 text-[14px] italic leading-7 text-[rgba(255,255,255,0.66)] sm:text-[16px] sm:leading-8">
                  "{t.quote}"
                </p>
                <div className="mt-5 flex flex-col gap-4 border-t border-[rgba(255,255,255,0.06)] pt-5 sm:flex-row sm:items-center sm:justify-between">
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
                  <div className="flex flex-wrap gap-2">
                    <span className="chip-cx">{t.outcome}</span>
                    <span className="chip-v">{t.metric}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <a
              href="#pricing"
              className="btn-cx-solid inline-flex w-full items-center justify-center gap-2.5 py-4 text-[11px] sm:w-auto sm:min-h-[48px] sm:px-8 uppercase"
            >
              Start building my DJ brand
              <ArrowRight size={12} />
            </a>
          </div>
        </div>
      </section>

      <div className="glow-divider" />

      {/* ── ADVANTAGES ── */}

      <ExclusiveMusicBonusSection />

      <div className="glow-divider" />

      {/* ── WHAT YOU GET TODAY ── */}
      <section className="relative z-10 mx-auto w-full max-w-7xl px-4 py-12 sm:px-8 sm:py-20 lg:px-10">
        <div className="relative overflow-hidden border border-[rgba(0,245,255,0.18)] bg-[radial-gradient(circle_at_top_left,rgba(0,245,255,0.10),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(191,95,255,0.10),transparent_34%),rgba(255,255,255,0.025)] p-5 shadow-[0_0_70px_rgba(0,245,255,0.08)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--cx)] to-transparent" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[rgba(0,245,255,0.10)] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-[rgba(191,95,255,0.11)] blur-3xl" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <div className="sect-label">
                <span className="chip-cx">● WHAT YOU GET TODAY</span>
              </div>

              <h2 className="orb mt-4 text-[22px] font-black uppercase leading-tight text-white sm:text-[42px]">
                Everything you need to{" "}
                <span
                  style={{
                    color: "var(--cx)",
                    textShadow: "0 0 26px rgba(0,245,255,0.55)",
                  }}
                >
                  promote your DJ brand.
                </span>
              </h2>

              <p className="sans mt-4 max-w-xl text-[14px] leading-7 text-[rgba(255,255,255,0.64)] sm:text-base">
                One dashboard to create visuals, publish faster, look more
                professional, and make it easier for promoters to take you
                seriously.
              </p>

              <a
                href="#pricing"
                className="btn-cx-solid mt-6 inline-flex w-full items-center justify-center gap-2.5 py-4 text-[11px] uppercase sm:w-auto sm:min-h-[48px] sm:px-8"
              >
                Choose my plan
                <ArrowRight size={12} />
              </a>
            </div>

            <div className="grid gap-3">
              {[
                "Create premium AI flyers for events, releases, and parties",
                "Animate flyers into social-ready MP4 promo videos",
                "Upgrade casual DJ photos into professional artist images",
                "Publish a clean DJ website with music, links, dates, and booking contact",
                "Export content for Reels, Stories, TikTok, ads, and flyers",
                "Get instant access by email after payment approval",
                "Unlock your 20% welcome discount today",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 border border-[rgba(0,245,255,0.14)] bg-black/20 px-4 py-3"
                >
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center border border-[rgba(0,245,255,0.38)] text-[10px] font-black text-[var(--cx)]">
                    ✓
                  </span>
                  <p className="sans text-sm leading-6 text-[rgba(255,255,255,0.70)]">
                    {item}
                  </p>
                </div>
              ))}
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
              CHOOSE THE PLAN THAT FITS{" "}
              <span
                style={{
                  color: "var(--cx)",
                  textShadow: "0 0 24px rgba(0,245,255,0.5)",
                }}
              >
                YOUR PROMO VOLUME.
              </span>
            </h2>
            <p className="sans mx-auto mt-3 max-w-2xl text-[14px] leading-7 text-[rgba(255,255,255,0.66)] sm:text-base sm:mt-4">
              Every plan includes the DJ Visuals AI platform. Pick the monthly
              credit volume that matches how often you create flyers, videos,
              photos, and promo assets.
            </p>
          </div>

          <div className="mx-auto mt-5 flex max-w-3xl flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-3">
            <span className="chip-v">WELCOME20 ACTIVE</span>
            <span className="mono text-center text-[9px] uppercase tracking-[0.16em] text-[rgba(255,255,255,0.42)]">
              A launch-ready toolkit for DJs, promoters, agencies, and clubs
            </span>
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
