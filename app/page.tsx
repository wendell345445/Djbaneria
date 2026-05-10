"use client";

import { useState } from "react";
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
} from "lucide-react";
import { landingBannerExamples } from "@/lib/landing-banner-examples";

const LandingBannerCarousel = dynamic(
  () =>
    import("@/components/landing-banner-carousel").then(
      (mod) => mod.LandingBannerCarousel
    ),
  { loading: () => <LandingCarouselLoading /> }
);

const advantages = [
  { icon: Zap, title: "Launch promos faster", description: "Create polished event visuals in minutes, so you can promote more often without waiting on a designer." },
  { icon: Sparkles, title: "Made for DJ marketing", description: "Generate flyers, stories, and promo graphics built for club nights, lineups, releases, and paid ads." },
  { icon: Layers3, title: "Create more than one look", description: "Test different creative directions and refine your visuals until they match the vibe of your event or brand." },
  { icon: ImageIcon, title: "Improve your promo photos", description: "Turn casual or low-quality DJ photos into cleaner, sharper images that look more professional online." },
  { icon: Gauge, title: "No design skills needed", description: "A simple guided workflow helps you create strong visuals even if you have never used design software." },
  { icon: ShieldCheck, title: "Built for real users", description: "Protected signup, email verification, and an account-based workspace made for consistent creative output." },
];

const faqs = [
  { question: "Do I need design experience?", answer: "No. DJ Banner AI is built for DJs, producers, and event promoters who want professional visuals without learning design software." },
  { question: "What can I create?", answer: "You can create DJ flyers, event flyers, feed posts, story visuals, ad creatives, and cleaner promo photos for your online presence." },
  { question: "Can it improve my existing DJ photos?", answer: "Yes. You can upload a casual or low-quality photo and use AI to make it look cleaner, sharper, and more professional for social media, ads, and artist profiles." },
  { question: "Can I use my own photo in a flyer?", answer: "Yes. You can upload your own image as a reference when creating a flyer, so the final visual feels closer to your identity." },
  { question: "What happens after I sign up?", answer: "After checkout, you receive a secure email link to create your password. Then you can access the dashboard and start the guided tour." },
];

const pricingPlans = [
  {
    plan: "PRO", name: "Pro", price: "$12.99", period: "/month",
    description: "For DJs who need professional visuals for regular event promotion.",
    credits: "20 credits / month", costNote: "About $0.65 per generation", cta: "Start Pro",
    highlighted: false,
    features: ["20 AI generations per month", "Premium DJ flyer creation", "AI promo photo enhancement", "Feed and story formats", "Low and medium quality"],
  },
  {
    plan: "PROFESSIONAL", name: "Professional", price: "$24.99", period: "/month",
    description: "The best option for DJs running ads, events, stories, and frequent promos.",
    credits: "40 credits / month", costNote: "About $0.62 per generation", cta: "Start Professional",
    highlighted: true,
    features: ["40 AI generations per month", "Premium and pro visual styles", "High-quality image generation", "Professional DJ photo enhancement", "Built for paid ads and social media"],
  },
  {
    plan: "STUDIO", name: "Studio", price: "$39.99", period: "/month",
    description: "For agencies, DJ collectives, promoters, and creators with higher volume.",
    credits: "80 credits / month", costNote: "About $0.50 per generation", cta: "Start Studio",
    highlighted: false,
    features: ["80 AI generations per month", "High-volume creative output", "Premium flyers and promo photos", "High-quality image generation", "Ideal for teams and promoters"],
  },
] as const;

const testimonials = [
  {
    initials: "NW", name: "Noah Walker", role: "Open format DJ", location: "Miami, FL",
    outcome: "Lower design costs", metric: "Creative control",
    quote: "I use this type of artwork a lot, but the agency I had hired was getting very expensive. They charged me $100 for each flyer, and the result was not always exactly what I wanted. With this tool, everything became much easier. I can create flyers my way, make changes, test different versions, and the price does not even compare.",
  },
  {
    initials: "DM", name: "Daniel Morgan", role: "Club DJ", location: "Orlando, FL",
    outcome: "More event inquiries", metric: "Higher engagement",
    quote: "DJ Banner AI completely changed my Instagram. After I started using these visuals on my profile, my engagement improved a lot and I received many more event inquiries. It worked for me, and I highly recommend it.",
  },
  {
    initials: "TC", name: "Tyler Carter", role: "Event DJ", location: "Los Angeles, CA",
    outcome: "Lower design costs", metric: "Higher-quality flyers",
    quote: "Before, my monthly flyer costs were around $200 — about $50 per flyer. Now, with DJ Banner AI, I can create flyers with even higher quality at a fraction of the cost. I highly recommend it.",

  },
] as const;

// ── PRICING BUTTONS ──────────────────────────────────────────────
import {
  createMetaEventId,
  trackMetaInitiateCheckout,
} from "@/lib/meta-pixel";

type PlanVariant = "PRO" | "PROFESSIONAL" | "STUDIO";

function PricingButton({ plan, label }: { plan: PlanVariant; label: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const metaEventId = createMetaEventId("InitiateCheckout");
      const response = await fetch("/api/public/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, metaEventId }),
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment error.");
      setLoading(false);
    }
  }

  const labelText = loading ? "OPENING..." : label;

  const icon = loading ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
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
          <span className="pricing-btn-label">{labelText}{icon}</span>
        </button>
        {error && <p className="sans text-xs leading-5 text-rose-300">{error}</p>}
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
          <span className="pricing-btn-label">{labelText}{icon}</span>
        </button>
        {error && <p className="sans text-xs leading-5 text-rose-300">{error}</p>}
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <button {...sharedProps} className="pricing-btn-pro">
        <span className="pricing-btn-scan" aria-hidden />
        <span className="pricing-btn-label">{labelText}{icon}</span>
      </button>
      {error && <p className="sans text-xs leading-5 text-rose-300">{error}</p>}
    </div>
  );
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: "#03040A", color: "#E8EAF0", fontFamily: "'DM Sans', sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `
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
          .pricing-scroll {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            gap: 16px;
            padding-bottom: 16px;
            scrollbar-width: none;
          }
          .pricing-scroll::-webkit-scrollbar { display: none; }
          .pricing-scroll > * {
            flex: 0 0 85vw;
            scroll-snap-align: start;
            max-width: 340px;
          }
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
      `}} />

      {/* ── AMBIENT ORBS ── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="float-orb-a absolute -left-48 top-1/4 h-[600px] w-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,245,255,0.07), transparent 60%)' }} />
        <div className="float-orb-b absolute -right-32 top-2/3 h-[500px] w-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(191,95,255,0.07), transparent 60%)' }} />
        <div className="absolute left-1/2 top-0 h-[300px] w-px -translate-x-1/2" style={{ background: 'linear-gradient(180deg, rgba(0,245,255,0.3), transparent)' }} />
      </div>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40" style={{ background: 'rgba(3,4,10,0.88)', borderBottom: '1px solid rgba(0,245,255,0.1)', backdropFilter: 'blur(20px)' }}>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8 lg:px-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 items-end gap-[2px]">
              {Array.from({length: 7}).map((_, i) => (
                <span key={i} className="wave-bar" style={{ height: '8px' }} />
              ))}
            </div>
            <p className="orb text-[13px] font-bold tracking-[0.18em] uppercase sm:text-[15px]" style={{ color: '#fff' }}>
              DJ <span style={{ color: 'var(--cx)', textShadow: '0 0 14px var(--cx)' }}>BANNER</span> AI
            </p>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {[["What you get", "#vantagens"], ["Examples", "#exemplos"], ["How it works", "#como-funciona"], ["Pricing", "#pricing"]].map(([label, href]) => (
              <a key={href} href={href} className="nav-link">{label}</a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="nav-link hidden sm:block px-4 py-2 border border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.5)] hover:border-[var(--border-x)] hover:text-[var(--cx)] transition-all" style={{ fontSize: '10px', letterSpacing: '0.15em', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase' }}>
              LOG IN
            </Link>
            <a href="#pricing" className="btn-cx-solid hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-none">
              CHOOSE PLAN
              <ArrowRight size={12} />
            </a>
            {/* Hamburger — mobile only */}
            <button
              className={`hamburger md:hidden ${menuOpen ? "open" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
          {[["What you get", "#vantagens"], ["Examples", "#exemplos"], ["How it works", "#como-funciona"], ["Pricing", "#pricing"]].map(([label, href]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
          ))}
          <Link href="/login" onClick={() => setMenuOpen(false)} style={{ fontFamily: 'Orbitron, monospace', fontSize: 13, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', padding: '18px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none' }}>
            LOG IN
          </Link>
          <a href="#pricing" onClick={() => setMenuOpen(false)} className="btn-cx-solid menu-cta inline-flex items-center gap-2">
            CHOOSE PLAN <ArrowRight size={13} />
          </a>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-14 pt-10 sm:px-8 sm:pb-28 sm:pt-20 lg:px-10 lg:pb-36 lg:pt-44">
        {/* HUD status bar */}
        <div className="mono mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] sm:text-[10px] text-[rgba(255,255,255,0.3)]" style={{ letterSpacing: '0.1em' }}>
          <span style={{ color: 'var(--cg)' }}>● SYSTEM ONLINE</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">AI_ENGINE v4.2.1</span>
          <span className="hidden sm:inline">|</span>
          <span>NODES: 2,847 ACTIVE</span>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <div className="sect-label">
              <span className="chip-cx">● PROFESSIONAL AI STUDIO</span>
            </div>

            <h1 className="hero-h1 orb text-[36px] font-black leading-[1.04] tracking-[-0.02em] text-white sm:text-[58px] lg:text-[72px]">
              CREATE<br />
              <span style={{ color: 'var(--cx)', textShadow: '0 0 40px rgba(0,245,255,0.6)' }}>PREMIUM</span>{" "}
              <span style={{ color: 'var(--cv)', textShadow: '0 0 40px rgba(191,95,255,0.6)' }}>DJ</span><br />
              FLYERS<span className="cursor" />
            </h1>

            <p className="sans mt-5 text-[14px] leading-7 text-[rgba(255,255,255,0.55)] sm:text-[15px]">
              Generate polished visuals for events, social media, and paid ads — from premium DJ flyers to cleaner, more professional-looking promo photos.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <a href="#pricing" className="btn-cx-solid inline-flex w-full items-center justify-center gap-2.5 py-4 text-[11px] sm:w-auto sm:min-h-[52px] sm:px-8">
                CHOOSE YOUR PLAN
                <ArrowRight size={13} />
              </a>
              <a href="#exemplos" className="btn-cx inline-flex w-full items-center justify-center gap-2.5 py-4 text-[11px] sm:w-auto sm:min-h-[52px] sm:px-8">
                SEE EXAMPLES
              </a>
            </div>

            {/* Stats row */}
            <div className="mt-10 grid grid-cols-3 gap-0 border border-[rgba(0,245,255,0.12)]">
              {[["2,800+", "ACTIVE DJs"], ["50K+", "FLYERS MADE"], ["4.9★", "RATING"]].map(([val, label]) => (
                <div key={label} className="border-r border-[rgba(0,245,255,0.12)] last:border-0 px-3 py-3 text-center sm:px-6 sm:py-4">
                  <p className="orb text-base font-bold sm:text-xl" style={{ color: 'var(--cx)', textShadow: '0 0 14px rgba(0,245,255,0.5)' }}>{val}</p>
                  <p className="mono mt-1 text-[7px] text-[rgba(255,255,255,0.35)] sm:text-[9px]" style={{ letterSpacing: '0.12em' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: decorative HUD panel — desktop only */}
          <div className="hidden lg:block">
            <div className="hud-box rounded-none p-6">
              <div className="mono mb-4 text-[9px] text-[rgba(0,245,255,0.6)]" style={{ letterSpacing: '0.2em' }}>// AI_CREATIVE_ENGINE</div>
              <div className="space-y-3">
                {[
                  { label: "FLYER QUALITY", val: 98, color: "var(--cx)" },
                  { label: "PHOTO ENHANCE", val: 94, color: "var(--cv)" },
                  { label: "PROMO SPEED", val: 100, color: "var(--cg)" },
                  { label: "DESIGN SCORE",  val: 97, color: "var(--cx)" },
                ].map(m => (
                  <div key={m.label}>
                    <div className="mb-1 flex justify-between">
                      <span className="mono text-[9px] text-[rgba(255,255,255,0.45)]" style={{ letterSpacing: '0.16em' }}>{m.label}</span>
                      <span className="mono text-[9px]" style={{ color: m.color }}>{m.val}%</span>
                    </div>
                    <div className="h-[3px] w-full bg-[rgba(255,255,255,0.06)]">
                      <div className="h-full" style={{ width: `${m.val}%`, background: m.color, boxShadow: `0 0 8px ${m.color}` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-[rgba(0,245,255,0.1)] pt-4">
                <p className="mono text-[9px] text-[rgba(255,255,255,0.3)]" style={{ letterSpacing: '0.14em' }}>
                  NEXT_GEN: <span style={{ color: 'var(--cx)' }}>READY</span> &nbsp;|&nbsp; QUEUE: <span style={{ color: 'var(--cg)' }}>OPEN</span>
                </p>
              </div>
            </div>
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
              MAKE ROUGH PHOTOS<br />
              <span style={{ color: 'var(--cv)', textShadow: '0 0 24px rgba(191,95,255,0.5)' }}>PROMO-READY.</span>
            </h2>
            <p className="sans mt-4 text-[14px] leading-7 text-[rgba(255,255,255,0.5)] sm:text-[15px]">
              Beyond event flyers — clean up casual DJ photos, giving you a sharper image for social media, ads, artist profiles, and promo materials.
            </p>
            <div className="mt-6 space-y-3">
              {[
                "Clean up casual or low-quality DJ photos",
                "Look more polished across your online presence",
                "Create stronger images for profiles, posts, ads, and promos",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 border border-[rgba(191,95,255,0.14)] bg-[rgba(191,95,255,0.04)] px-4 py-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-[rgba(0,245,255,0.4)]" style={{ fontSize: 10, color: 'var(--cx)' }}>✓</span>
                  <span className="sans text-sm text-[rgba(255,255,255,0.65)]">{item}</span>
                </div>
              ))}
            </div>
            <a href="#pricing" className="btn-cv mt-7 inline-flex w-full items-center justify-center gap-2.5 py-4 text-[11px] sm:w-auto sm:min-h-[48px] sm:px-8">
              SEE PLANS
              <ArrowRight size={12} />
            </a>
          </div>

          {/* Before/After */}
          <div className="relative">
            <div className="hud-box-v p-4 sm:p-5" style={{ borderRadius: 0 }}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="mono text-[9px] text-[rgba(0,245,255,0.7)]" style={{ letterSpacing: '0.18em' }}>// BEFORE_AFTER_MODULE</p>
                  <p className="sans mt-1 text-xs text-[rgba(255,255,255,0.4)]">See how a rough photo transforms.</p>
                </div>
                <span className="chip-cx shrink-0">AI ENHANCED</span>
              </div>
              <div className="relative aspect-[4/5] overflow-hidden border border-[rgba(0,245,255,0.1)] sm:aspect-[5/4]">
                <img src="/landing/before-after/dj-before.webp" alt="Before" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(3,4,10,0.5), transparent)' }} />
                <div className="ba-bl absolute left-3 top-3 z-30">
                  <span className="chip-cx px-2 py-1" style={{ fontSize: 8 }}>BEFORE</span>
                </div>
                <div className="ba-after absolute inset-0 z-10">
                  <img src="/landing/before-after/dj-after.jpg" alt="After" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(3,4,10,0.5), transparent)' }} />
                </div>
                <div className="ba-al absolute right-3 top-3 z-30">
                  <span className="chip-v px-2 py-1" style={{ fontSize: 8 }}>AFTER</span>
                </div>
                <div className="ba-handle absolute top-0 z-20 h-full w-[1px] -translate-x-1/2" style={{ background: 'var(--cx)', boxShadow: '0 0 14px var(--cx)' }}>
                  <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-[rgba(0,245,255,0.5)]" style={{ background: '#03040A', color: 'var(--cx)', fontSize: 12 }}>⇆</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="glow-divider" />

      {/* ── VISUAL EXAMPLES ── */}
      <section id="exemplos" className="relative z-10 mx-auto w-full max-w-7xl px-4 py-12 sm:px-8 sm:py-24 lg:px-10">
        <div className="max-w-3xl">
          <div className="sect-label">
            <span className="chip-cx">● VISUAL EXAMPLES</span>
          </div>
          <h2 className="orb text-[22px] font-bold leading-tight text-white sm:text-[42px]">
            SEE WHAT YOU CAN <span style={{ color: 'var(--cx)', textShadow: '0 0 24px rgba(0,245,255,0.5)' }}>CREATE</span>
          </h2>
          <p className="sans mt-3 max-w-2xl text-[14px] leading-7 text-[rgba(255,255,255,0.5)] sm:text-[15px]">
            Create premium-looking visuals for event promotion, artist branding, social media, and paid ads — without starting from a blank canvas.
          </p>
        </div>
        <div className="mt-10 min-h-[420px] sm:min-h-[640px] lg:min-h-[720px]">
          <LandingBannerCarousel examples={landingBannerExamples} />
        </div>
      </section>

      <div className="glow-divider" />

      {/* ── TESTIMONIALS ── */}
      <section className="relative z-10" style={{ background: 'rgba(0,245,255,0.02)' }}>
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-8 sm:py-24 lg:px-10">
          <div className="text-center">
            <div className="sect-label justify-center">
              <span className="chip-cx">● CLIENT TRANSMISSIONS</span>
            </div>
            <h2 className="orb text-[22px] font-bold leading-tight text-white sm:text-[42px]">
              DJS WHO <span style={{ color: 'var(--cv)', textShadow: '0 0 24px rgba(191,95,255,0.5)' }}>UPGRADED</span> THEIR BRAND
            </h2>
          </div>

          {/* Scroll hint — mobile only */}
          <p className="mono mt-4 text-center text-[9px] text-[rgba(255,255,255,0.25)] sm:hidden" style={{ letterSpacing: '0.14em' }}>← SWIPE →</p>

          <div className="testi-scroll mt-8 sm:mt-12 sm:grid sm:gap-5 lg:grid-cols-3">
            {testimonials.map((t) => (
              <article key={t.name} className="testi-card">
                <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,245,255,0.06), transparent 60%)' }} />
                <Quote size={18} style={{ color: 'rgba(0,245,255,0.35)' }} />
                <p className="sans mt-4 text-[13px] italic leading-7 text-[rgba(255,255,255,0.62)] sm:text-[14px] sm:min-h-[160px]">
                  "{t.quote}"
                </p>
                <div className="mt-5 border-t border-[rgba(255,255,255,0.06)] pt-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[rgba(0,245,255,0.3)]" style={{ background: 'rgba(0,245,255,0.08)' }}>
                      <span className="orb text-sm font-bold" style={{ color: 'var(--cx)' }}>{t.initials}</span>
                    </div>
                    <div>
                      <p className="sans text-sm font-semibold text-white">{t.name}</p>
                      <p className="mono text-[9px] text-[rgba(255,255,255,0.35)]" style={{ letterSpacing: '0.12em' }}>{t.role} · {t.location}</p>
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
      <section id="vantagens" className="relative z-10 mx-auto w-full max-w-7xl px-4 py-12 sm:px-8 sm:py-24 lg:px-10">
        <div className="max-w-3xl">
          <div className="sect-label">
            <span className="chip-v">● SYSTEM FEATURES</span>
          </div>
          <h2 className="orb text-[22px] font-bold leading-tight text-white sm:text-[42px]">
            WHY DJs RUN ON <span style={{ color: 'var(--cx)', textShadow: '0 0 24px rgba(0,245,255,0.5)' }}>DJ BANNER AI</span>
          </h2>
          <p className="sans mt-3 text-[14px] leading-7 text-[rgba(255,255,255,0.5)] sm:text-base sm:mt-4">
            Create better promo assets, improve your online presence, and publish stronger content with less friction.
          </p>
        </div>

        <div className="mt-10 grid gap-px bg-[rgba(0,245,255,0.06)] sm:mt-14 md:grid-cols-2 xl:grid-cols-3">
          {advantages.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="adv-card">
                <span className="orb absolute right-4 top-3 text-[44px] font-black" style={{ color: 'rgba(0,245,255,0.05)', lineHeight: 1 }}>{String(i + 1).padStart(2, "0")}</span>
                <div className="inline-flex h-10 w-10 items-center justify-center border border-[rgba(0,245,255,0.25)]" style={{ background: 'rgba(0,245,255,0.07)' }}>
                  <Icon size={18} style={{ color: 'var(--cx)' }} />
                </div>
                <h3 className="orb mt-4 text-[12px] font-bold tracking-wider text-white uppercase sm:mt-5 sm:text-[13px]">{item.title}</h3>
                <p className="sans mt-2 text-sm leading-7 text-[rgba(255,255,255,0.48)] sm:mt-3">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="glow-divider" />

      {/* ── HOW IT WORKS ── */}
      <section id="como-funciona" className="relative z-10" style={{ background: 'rgba(191,95,255,0.02)' }}>
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-8 sm:py-24 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <div className="sect-label">
                <span className="chip-cx">● WORKFLOW PROTOCOL</span>
              </div>
              <h2 className="orb text-[22px] font-bold leading-tight text-white sm:text-[42px]">
                FROM IDEA TO <span style={{ color: 'var(--cg)', textShadow: '0 0 20px rgba(0,255,159,0.5)' }}>PUBLISH-READY</span><br />IN MINUTES.
              </h2>
              <p className="sans mt-3 text-[14px] leading-7 text-[rgba(255,255,255,0.5)] sm:text-base sm:mt-4">
                Add your event details, choose a direction, and let AI help you create a polished visual for your next promotion.
              </p>
            </div>
            <div className="hud-box-v p-5 sm:p-7">
              <p className="mono mb-5 text-[9px] text-[rgba(191,95,255,0.7)]" style={{ letterSpacing: '0.18em' }}>// PERFECT_FOR: DJS WHO WANT TO</p>
              <div className="space-y-0">
                {[
                  "promote events with a more professional look",
                  "post more often without getting stuck on design",
                  "test ads, flyers, and creative angles faster",
                  "save time creating social media and promo visuals",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 border-b border-[rgba(255,255,255,0.05)] py-4 last:border-0">
                    <span className="orb text-[20px] font-black shrink-0" style={{ color: 'rgba(191,95,255,0.3)', lineHeight: 1.2 }}>0{i + 1}</span>
                    <span className="sans text-sm leading-6 text-[rgba(255,255,255,0.62)]">{item}</span>
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
              CHOOSE YOUR <span style={{ color: 'var(--cx)', textShadow: '0 0 24px rgba(0,245,255,0.5)' }}>ACCESS LEVEL</span>
            </h2>
            <p className="sans mx-auto mt-3 max-w-2xl text-[14px] leading-7 text-[rgba(255,255,255,0.5)] sm:text-base sm:mt-4">
              Select a plan, complete checkout, receive a secure link to create your password and access the guided tour.
            </p>
          </div>

          {/* Scroll hint — mobile only */}
          <p className="mono mt-4 text-center text-[9px] text-[rgba(255,255,255,0.25)] sm:hidden" style={{ letterSpacing: '0.14em' }}>← SWIPE TO COMPARE →</p>

          <div className="pricing-scroll mt-8 sm:mt-12 sm:grid sm:gap-5 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div key={plan.plan} className={`hud-box relative overflow-hidden p-6 transition-all sm:hover:-translate-y-1 ${plan.highlighted ? "plan-featured" : ""}`}>
                {plan.highlighted && (
                  <div className="absolute inset-x-0 top-0 h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, var(--cx), var(--cv), transparent)' }} />
                )}
                {plan.highlighted && (
                  <div className="mb-3">
                    <span className="chip-cx">MOST POPULAR</span>
                  </div>
                )}

                <h3 className="orb text-lg font-bold tracking-wider text-white uppercase">{plan.name}</h3>
                <p className="sans mt-2 text-sm leading-6 text-[rgba(255,255,255,0.48)]">{plan.description}</p>

                <div className="mt-5 flex items-end gap-1">
                  <span className="orb text-[38px] font-black leading-none text-white" style={{ letterSpacing: '-0.04em' }}>{plan.price}</span>
                  <span className="sans mb-1 text-sm text-[rgba(255,255,255,0.3)]">{plan.period}</span>
                </div>

                <div className="mt-4 border border-[rgba(0,245,255,0.15)] bg-[rgba(0,245,255,0.05)] px-4 py-3">
                  <p className="sans text-sm font-medium" style={{ color: 'var(--cx)' }}>{plan.credits}</p>
                  <p className="sans mt-1 text-xs text-[rgba(255,255,255,0.35)]">{plan.costNote}</p>
                </div>

                <div className="mt-5">
                  <PricingButton plan={plan.plan} label={plan.cta} />
                </div>

                <div className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border border-[rgba(0,245,255,0.35)]" style={{ fontSize: 9, color: 'var(--cx)' }}>✓</span>
                      <span className="sans text-sm leading-6 text-[rgba(255,255,255,0.55)]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="sans mx-auto mt-7 max-w-2xl text-center text-xs leading-6 text-[rgba(255,255,255,0.28)]">
            After payment, your account is created from the email used at checkout. You will receive a secure link to create your password.
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
              QUICK ANSWERS BEFORE YOU <span style={{ color: 'var(--cv)', textShadow: '0 0 20px rgba(191,95,255,0.5)' }}>LAUNCH</span>
            </h2>
          </div>
          <div className="mt-8 space-y-2 sm:mt-12">
            {faqs.map((item) => (
              <details key={item.question} className="group border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] transition-colors hover:border-[rgba(0,245,255,0.2)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5">
                  <span className="sans text-sm font-medium text-white sm:text-base">{item.question}</span>
                  <span className="faq-plus flex h-7 w-7 shrink-0 items-center justify-center border border-[rgba(255,255,255,0.1)] text-lg leading-none">+</span>
                </summary>
                <div className="border-t border-[rgba(0,245,255,0.08)] px-5 pb-5 pt-4 sm:px-6">
                  <p className="sans text-sm leading-7 text-[rgba(255,255,255,0.52)]">{item.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <div className="glow-divider" />

      {/* ── FINAL CTA ── */}
      <section className="relative z-10 overflow-hidden" style={{ background: 'rgba(0,245,255,0.02)' }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-[400px] sm:w-[400px]" style={{ background: 'radial-gradient(circle, rgba(0,245,255,0.08), transparent 60%)' }} />
        </div>
        <div className="relative mx-auto w-full max-w-4xl px-4 py-14 text-center sm:px-8 sm:py-24">
          <div className="sect-label justify-center">
            <span className="chip-cx">● INITIALIZE SEQUENCE</span>
          </div>
          <h2 className="orb text-[28px] font-black leading-tight text-white sm:text-[54px]">
            YOUR DJ BRAND<br />
            DESERVES <span style={{ color: 'var(--cx)', textShadow: '0 0 40px rgba(0,245,255,0.7)' }}>NEXT LEVEL</span><br />
            VISUALS.
          </h2>
          <p className="sans mx-auto mt-5 max-w-xl text-[14px] leading-7 text-[rgba(255,255,255,0.5)] sm:text-base">
            Join DJs who create polished event promos, stronger profile visuals, and social content that feels ready for bookings and higher-value opportunities.
          </p>
          <a href="#pricing" className="btn-cx-solid mt-8 inline-flex w-full items-center justify-center gap-2.5 py-4 text-[11px] sm:w-auto sm:mt-9 sm:px-12 sm:py-4 sm:text-[12px]">
            INITIALIZE — CHOOSE PLAN
            <ArrowRight size={14} />
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-[rgba(0,245,255,0.1)]" style={{ background: '#03040A' }}>
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <p className="mono text-xs text-[rgba(255,255,255,0.25)]" style={{ letterSpacing: '0.12em' }}>
            © 2026 DJ BANNER AI · ALL RIGHTS RESERVED
          </p>
          <nav className="flex flex-wrap items-center gap-6">
            <Link href="/terms" className="mono text-[10px] text-[rgba(255,255,255,0.28)] tracking-widest uppercase transition hover:text-[var(--cx)]">Terms of Use</Link>
            <Link href="/privacy" className="mono text-[10px] text-[rgba(255,255,255,0.28)] tracking-widest uppercase transition hover:text-[var(--cx)]">Privacy Policy</Link>
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
        <div className="aspect-[4/5] max-h-[76vh] overflow-hidden border border-[rgba(0,245,255,0.12)]" style={{ background: 'linear-gradient(135deg, #0D0F1A, #03040A)' }}>
          <div className="h-full w-full animate-pulse" style={{ background: 'linear-gradient(135deg, rgba(0,245,255,0.05), transparent)' }} />
        </div>
      </div>
    </div>
  );
}
