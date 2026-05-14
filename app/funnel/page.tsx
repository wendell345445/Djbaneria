"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Layers3,
  Play,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { createMetaEventId, trackMetaInitiateCheckout } from "@/lib/meta-pixel";

type PlanVariant = "PRO" | "PROFESSIONAL" | "STUDIO";
type FunnelStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type Goal = "bookings" | "events" | "content" | "agency";
type Volume = "low" | "medium" | "high" | "scale";
type Need = "flyers" | "animations" | "photos" | "all";
type Pain = "designer" | "speed" | "quality" | "ads";
type Urgency = "today" | "week" | "month";

type FunnelState = {
  name: string;
  goal: Goal | "";
  volume: Volume | "";
  need: Need | "";
  pain: Pain | "";
  urgency: Urgency | "";
};

type PlanInfo = {
  plan: PlanVariant;
  name: string;
  price: string;
  originalPrice: string;
  credits: number;
  bestFor: string;
  summary: string;
  features: string[];
};

const plans: Record<PlanVariant, PlanInfo> = {
  PRO: {
    plan: "PRO",
    name: "Pro",
    price: "$12.99",
    originalPrice: "$16.24",
    credits: 20,
    bestFor: "DJs promoting a few events per month",
    summary:
      "A lean setup for consistent flyers, animated promos, and DJ photo upgrades.",
    features: [
      "20 credits per month",
      "Static AI flyer creation",
      "Animated flyer export",
      "DJ photo enhancement",
      "Feed and story formats",
    ],
  },
  PROFESSIONAL: {
    plan: "PROFESSIONAL",
    name: "Professional",
    price: "$24.99",
    originalPrice: "$31.24",
    credits: 40,
    bestFor: "DJs and promoters posting every week",
    summary:
      "The strongest balance between price, volume, quality, and creative testing.",
    features: [
      "40 credits per month",
      "Premium flyers and animated MP4s",
      "High-quality image and video generation",
      "Professional DJ photo enhancement",
      "Built for ads and social promo",
    ],
  },
  STUDIO: {
    plan: "STUDIO",
    name: "Studio",
    price: "$39.99",
    originalPrice: "$49.99",
    credits: 80,
    bestFor: "Agencies, promoters, and high-volume creators",
    summary:
      "More credits for teams, frequent events, and multiple artists or brands.",
    features: [
      "80 credits per month",
      "Full access to flyers, animations, and photos",
      "High-quality image and video output",
      "Ideal for multiple events or artists",
      "Best cost per creative",
    ],
  },
};

type CreativeExample = {
  kind: "image" | "vimeo";
  title: string;
  description: string;
  image: string;
  vimeoId?: string;
  tag: string;
};

const creativeExamples = {
  flyers: [
    {
      kind: "image" as const,
      title: "Premium promo flyer",
      description:
        "Clean, high-impact artwork for events, releases, offers, and social campaigns.",
      image: "/examples/card/Summer Vibes.webp",
      tag: "AI flyer",
    },
    {
      kind: "image" as const,
      title: "Campaign-ready design",
      description:
        "Visuals made for posts, stories, ads, and fast promotional launches.",
      image: "/examples/banner-02.webp",
      tag: "Promo creative",
    },
    {
      kind: "image" as const,
      title: "Story-ready flyer",
      description:
        "Vertical and feed-friendly visuals for fast promotional campaigns.",
      image: "/examples/card/Afro-house2.webp",
      tag: "Static flyer",
    },
  ],
  videos: [
    {
      kind: "vimeo" as const,
      title: "Animated promo video",
      description:
        "Turn a static creative into a motion asset for Reels, TikTok, and Stories.",
      image: "/landing/animation-demo/flyer-static.webp",
      vimeoId: "1192217227",
      tag: "Motion Flyer",
    },
    {
      kind: "vimeo" as const,
      title: "Motion Flyer",
      description:
        "Add movement, energy, and visual effects to make the promo feel more premium.",
      image: "/landing/animation-demo/flyer-static2.webp",
      vimeoId: "1192217229",
      tag: "Motion Flyer",
    },
    {
      kind: "vimeo" as const,
      title: "Motion creative",
      description:
        "Add movement, energy, and visual effects to make the promo feel more premium.",
      image: "/landing/animation-demo/flyer-static3.webp",
      vimeoId: "1192223138",
      tag: "Motion Flyer",
    },
  ],
  photos: [
    {
      kind: "image" as const,
      title: "Professional image upgrade",
      description:
        "Upgrade casual images into cleaner, sharper, more professional visuals.",
      image: "/examples/photo1.png",
      tag: "Pro image",
    },
    {
      kind: "image" as const,
      title: "Profile-ready visual",
      description:
        "Create polished assets for profile photos, ads, landing pages, and social content.",
      image: "/examples/photo2.png",
      tag: "Brand asset",
    },
    {
      kind: "image" as const,
      title: "Profile-ready visual",
      description:
        "Create polished assets for profile photos, ads, landing pages, and social content.",
      image: "/examples/photo3.png",
      tag: "Brand asset",
    },
  ],
} satisfies Record<string, CreativeExample[]>;

function getExamplesForState(state: FunnelState): CreativeExample[] {
  if (state.need === "flyers") {
    return [
      creativeExamples.flyers[0],
      creativeExamples.flyers[1],
      creativeExamples.flyers[2],
    ];
  }

  if (state.need === "animations") {
    return [
      creativeExamples.videos[0],
      creativeExamples.videos[1],
      creativeExamples.videos[2],
    ];
  }

  if (state.need === "photos") {
    return [
      creativeExamples.photos[0],
      creativeExamples.photos[1],
      creativeExamples.flyers[0],
    ];
  }

  if (state.need === "all" || state.goal === "agency") {
    return [
      creativeExamples.flyers[0],
      creativeExamples.videos[0],
      creativeExamples.photos[0],
    ];
  }

  if (state.goal === "events") {
    return [
      creativeExamples.flyers[0],
      creativeExamples.videos[0],
      creativeExamples.flyers[1],
    ];
  }

  if (state.goal === "content") {
    return [
      creativeExamples.videos[0],
      creativeExamples.photos[0],
      creativeExamples.flyers[0],
    ];
  }

  return [
    creativeExamples.flyers[0],
    creativeExamples.flyers[1],
    creativeExamples.videos[0],
  ];
}

async function openPublicCheckout(
  plan: PlanVariant,
  name: string,
  source: string,
) {
  const metaEventId = createMetaEventId("InitiateCheckout");
  const response = await fetch("/api/public/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      plan,
      metaEventId,
      customerName: name || undefined,
      source,
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

async function notifyFunnelLead(
  state: FunnelState,
  recommendedPlan: PlanVariant,
) {
  try {
    await fetch("/api/public/gift-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: state.name,
        selectedPlan: recommendedPlan,
        source: "interactive_sales_funnel",
      }),
    });
  } catch {
    // Lead notification should never block the funnel.
  }
}

const options = {
  goal: [
    {
      value: "bookings" as Goal,
      label: "Get more bookings",
      description:
        "Upgrade your promo image and look more professional online.",
      icon: BadgeCheck,
    },
    {
      value: "events" as Goal,
      label: "Promote events",
      description:
        "Create flyers and animated promo assets for shows, clubs, and festivals.",
      icon: Play,
    },
    {
      value: "content" as Goal,
      label: "Post better content",
      description:
        "Make your Instagram, TikTok, and Stories look more premium.",
      icon: Sparkles,
    },
    {
      value: "agency" as Goal,
      label: "Create for clients/artists",
      description:
        "Generate visuals for multiple DJs, venues, or events every month.",
      icon: Layers3,
    },
  ],
  volume: [
    {
      value: "low" as Volume,
      label: "1–4 visuals/month",
      description: "A few key promos per month.",
      credits: "20 credits is usually enough.",
    },
    {
      value: "medium" as Volume,
      label: "5–12 visuals/month",
      description: "Weekly flyers, photo upgrades, and animations.",
      credits: "40 credits gives more room to test.",
    },
    {
      value: "high" as Volume,
      label: "13–25 visuals/month",
      description: "Frequent events, ad creatives, and multiple versions.",
      credits: "80 credits keeps your workflow moving.",
    },
    {
      value: "scale" as Volume,
      label: "25+ visuals/month",
      description: "High-volume promo for teams, venues, or multiple artists.",
      credits: "Studio is the practical starting point.",
    },
  ],
  need: [
    {
      value: "flyers" as Need,
      label: "Mostly flyers",
      description: "Static event flyers for feed and story.",
      icon: ImageIconLite,
    },
    {
      value: "animations" as Need,
      label: "Animated videos",
      description: "MP4 promo videos for Reels, TikTok, and Stories.",
      icon: Play,
    },
    {
      value: "photos" as Need,
      label: "DJ photo upgrade",
      description:
        "Make your artist photos look cleaner and more professional.",
      icon: Camera,
    },
    {
      value: "all" as Need,
      label: "Everything",
      description: "Flyers, animated promos, and professional image upgrades.",
      icon: Zap,
    },
  ],
  pain: [
    {
      value: "designer" as Pain,
      label: "Designers are expensive",
      description: "Avoid paying $50–$100 per flyer and waiting for revisions.",
    },
    {
      value: "speed" as Pain,
      label: "I need visuals faster",
      description: "Create campaign-ready promo without waiting days.",
    },
    {
      value: "quality" as Pain,
      label: "My visuals look basic",
      description: "Get a more premium, club-ready look instantly.",
    },
    {
      value: "ads" as Pain,
      label: "I need better ad creatives",
      description: "Test more versions and angles for paid traffic.",
    },
  ],
  urgency: [
    {
      value: "today" as Urgency,
      label: "Today",
      description: "I want to create something now.",
    },
    {
      value: "week" as Urgency,
      label: "This week",
      description: "I have upcoming promos to prepare.",
    },
    {
      value: "month" as Urgency,
      label: "This month",
      description: "I am improving my content workflow.",
    },
  ],
};

function ImageIconLite({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return <Layers3 size={size} className={className} />;
}

function getRecommendedPlan(state: FunnelState): PlanVariant {
  let score = 0;

  if (state.goal === "agency") score += 4;
  if (state.goal === "events") score += 2;
  if (state.goal === "content") score += 1;

  if (state.volume === "medium") score += 2;
  if (state.volume === "high") score += 5;
  if (state.volume === "scale") score += 7;

  if (state.need === "animations") score += 2;
  if (state.need === "all") score += 4;

  if (state.pain === "ads") score += 2;
  if (state.urgency === "today") score += 1;

  if (score >= 8) return "STUDIO";
  if (score >= 3) return "PROFESSIONAL";
  return "PRO";
}

function getOutcomeCopy(state: FunnelState, plan: PlanVariant) {
  const name = state.name.trim() || "Your";
  const planInfo = plans[plan];

  const goalLine: Record<Goal | "", string> = {
    bookings: "look more professional before promoters even hear the mix",
    events:
      "build event promos that feel ready for clubs, festivals, and paid ads",
    content: "turn your social feed into a sharper visual brand",
    agency:
      "produce more visuals for multiple artists or events without increasing design costs",
    "": "create premium visuals faster",
  };

  const painLine: Record<Pain | "", string> = {
    designer:
      "This setup helps cut design dependency and reduce back-and-forth revisions.",
    speed:
      "This setup is built for quick execution when the event deadline is close.",
    quality:
      "This setup focuses on premium visuals that look more intentional and club-ready.",
    ads: "This setup gives you enough creative volume to test better ad angles.",
    "": "This setup gives you a simple workflow for stronger visuals.",
  };

  return {
    headline: `${name}'s visual growth plan`,
    subheadline: `Based on your answers, ${planInfo.name} is the best fit to ${goalLine[state.goal]}.`,
    pain: painLine[state.pain],
  };
}

function estimateMonthlySavings(state: FunnelState, plan: PlanVariant) {
  const volumeMap: Record<Volume | "", number> = {
    low: 4,
    medium: 10,
    high: 20,
    scale: 30,
    "": 8,
  };
  const expectedVisuals = volumeMap[state.volume];
  const designerCost = expectedVisuals * 35;
  const planCost = Number(plans[plan].price.replace("$", ""));
  return {
    expectedVisuals,
    designerCost,
    planCost,
    estimatedSavings: Math.max(0, designerCost - planCost),
  };
}

function StepOption({
  selected,
  label,
  description,
  onClick,
  icon: Icon,
  meta,
}: {
  selected: boolean;
  label: string;
  description: string;
  onClick: () => void;
  icon?: ComponentType<{ size?: number; className?: string }>;
  meta?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative h-auto self-start overflow-hidden border p-4 text-left transition sm:p-5 ${
        selected
          ? "border-[rgba(0,245,255,0.78)] bg-[rgba(0,245,255,0.12)] shadow-[0_0_40px_rgba(0,245,255,0.14)]"
          : "border-[rgba(255,255,255,0.08)] bg-white/[0.035] hover:border-[rgba(0,245,255,0.28)] hover:bg-[rgba(0,245,255,0.055)]"
      }`}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--cx)] to-transparent opacity-0 transition group-hover:opacity-80" />
      <div className="flex items-start gap-3">
        {Icon ? (
          <span
            className={`grid h-10 w-10 shrink-0 place-items-center border ${
              selected
                ? "border-[rgba(0,245,255,0.45)] bg-[rgba(0,245,255,0.12)] text-[var(--cx)]"
                : "border-white/10 bg-black/20 text-white/45"
            }`}
          >
            <Icon size={18} />
          </span>
        ) : null}
        <span className="min-w-0">
          <span className="orb block text-sm font-bold uppercase tracking-[0.08em] text-white sm:text-base">
            {label}
          </span>
          <span className="sans mt-2 block text-xs leading-6 text-white/48 sm:text-sm">
            {description}
          </span>
          {meta ? (
            <span className="mono mt-3 inline-flex border border-[rgba(0,245,255,0.18)] bg-[rgba(0,245,255,0.06)] px-2 py-1 text-[8px] uppercase tracking-[0.14em] text-[var(--cx)]">
              {meta}
            </span>
          ) : null}
        </span>
      </div>
    </button>
  );
}

function ProgressBar({ step }: { step: FunnelStep }) {
  const progress = Math.min(100, Math.max(8, ((step + 1) / 7) * 100));
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <span className="mono text-[9px] uppercase tracking-[0.18em] text-white/36">
          Interactive diagnosis
        </span>
        <span className="mono text-[9px] uppercase tracking-[0.18em] text-[var(--cx)]">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-1 overflow-hidden bg-white/[0.06]">
        <div
          className="h-full bg-gradient-to-r from-[var(--cx)] to-[var(--cv)] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  selected,
  recommended,
  onSelect,
}: {
  plan: PlanInfo;
  selected: boolean;
  recommended: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative h-auto self-start overflow-hidden border p-4 text-left transition ${
        selected
          ? "border-[rgba(0,245,255,0.82)] bg-[rgba(0,245,255,0.12)] shadow-[0_0_45px_rgba(0,245,255,0.16)]"
          : "border-white/10 bg-white/[0.03] hover:border-[rgba(0,245,255,0.28)]"
      }`}
    >
      {recommended ? (
        <span className="mono mb-3 inline-flex border border-[rgba(0,255,159,0.25)] bg-[rgba(0,255,159,0.08)] px-2 py-1 text-[8px] uppercase tracking-[0.16em] text-[var(--cg)]">
          Recommended
        </span>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="orb break-words text-base font-black uppercase tracking-[-0.02em] text-white">
            {plan.name}
          </h3>
          <p className="sans mt-2 text-xs leading-6 text-white/48">
            {plan.bestFor}
          </p>
        </div>
        <div className="flex shrink-0 items-end gap-2 text-left sm:block sm:text-right">
          <span className="sans block text-xs leading-none text-white/34 line-through sm:leading-normal">
            {plan.originalPrice}
          </span>
          <span className="sans block whitespace-nowrap text-xl font-black leading-none text-[var(--cx)] sm:leading-tight">
            {plan.price}
          </span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
        <span className="mono text-[8px] uppercase tracking-[0.16em] text-white/40">
          Credits/month
        </span>
        <span className="mono text-[10px] font-bold uppercase tracking-[0.16em] text-white">
          {plan.credits}
        </span>
      </div>
    </button>
  );
}

export default function FunnelPage() {
  const [step, setStep] = useState<FunnelStep>(0);
  const [state, setState] = useState<FunnelState>({
    name: "",
    goal: "",
    volume: "",
    need: "",
    pain: "",
    urgency: "",
  });
  const recommendedPlan = useMemo(() => getRecommendedPlan(state), [state]);
  const [selectedPlan, setSelectedPlan] =
    useState<PlanVariant>(recommendedPlan);
  const [leadNotified, setLeadNotified] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setSelectedPlan(recommendedPlan);
  }, [recommendedPlan]);

  const outcome = getOutcomeCopy(state, selectedPlan);
  const savings = estimateMonthlySavings(state, selectedPlan);
  const selectedPlanData = plans[selectedPlan];

  function goNext() {
    setError("");
    if (step === 0 && !state.name.trim()) {
      setError("Enter your name to personalize the plan.");
      return;
    }
    if (step === 1 && !state.goal) return setError("Choose your main goal.");
    if (step === 2 && !state.volume)
      return setError("Choose your monthly visual volume.");
    if (step === 3 && !state.need)
      return setError("Choose what you need most.");
    if (step === 4 && !state.pain)
      return setError("Choose the bottleneck you want to solve.");
    if (step === 5 && !state.urgency)
      return setError("Choose when you want to start.");

    if (step === 5 && !leadNotified) {
      setLeadNotified(true);
      void notifyFunnelLead(state, recommendedPlan);
    }

    setStep((current) => Math.min(6, current + 1) as FunnelStep);
  }

  function goBack() {
    setError("");
    setStep((current) => Math.max(0, current - 1) as FunnelStep);
  }

  async function handleCheckout() {
    if (checkoutLoading) return;
    setCheckoutLoading(true);
    setError("");
    try {
      await openPublicCheckout(
        selectedPlan,
        state.name.trim(),
        "interactive_sales_funnel",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open checkout.");
      setCheckoutLoading(false);
    }
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
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
          :root {
            --cx: #00F5FF;
            --cv: #BF5FFF;
            --ce: #FF2D6B;
            --cg: #00FF9F;
          }
          .orb { font-family: 'Orbitron', monospace; }
          .mono { font-family: 'Space Mono', monospace; }
          .sans { font-family: 'DM Sans', sans-serif; }
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
          @keyframes shimmerLine {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(320%); }
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          .hud {
            position: relative;
            border: 1px solid rgba(0,245,255,0.16);
            background: linear-gradient(160deg, rgba(255,255,255,0.045), rgba(255,255,255,0.018));
          }
          .hud::before, .hud::after {
            content: '';
            position: absolute;
            width: 16px;
            height: 16px;
            pointer-events: none;
          }
          .hud::before { left: -1px; top: -1px; border-left: 2px solid var(--cx); border-top: 2px solid var(--cx); }
          .hud::after { right: -1px; bottom: -1px; border-right: 2px solid var(--cv); border-bottom: 2px solid var(--cv); }
          .btn-cx-solid {
            position: relative;
            overflow: hidden;
            background: var(--cx);
            color: #03040A;
            font-family: 'Orbitron', monospace;
            font-weight: 800;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            transition: transform .25s ease, box-shadow .25s ease;
          }
          .btn-cx-solid::before {
            content: '';
            position: absolute;
            inset: 0;
            width: 40%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,.52), transparent);
            transform: translateX(-100%);
            animation: shimmerLine 2.8s ease-in-out infinite;
          }
          .btn-cx-solid:hover {
            transform: translateY(-2px);
            box-shadow: 0 0 50px rgba(0,245,255,.48), 0 18px 60px rgba(0,245,255,.22);
          }
          .example-scroll {
            scrollbar-width: none;
          }
          .example-scroll::-webkit-scrollbar {
            display: none;
          }
          `,
        }}
      />

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-48 top-1/4 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(0,245,255,0.08),transparent_62%)] blur-3xl" />
        <div className="absolute -right-48 top-2/3 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(191,95,255,0.08),transparent_62%)] blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-[#03040A]/78 px-4 py-4 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link
            href="/"
            className="orb text-sm font-black uppercase tracking-[0.18em] text-white"
          >
            DJ Visuals AI
          </Link>
          <Link
            href="/login"
            className="mono text-[10px] uppercase tracking-[0.18em] text-white/48 transition hover:text-[var(--cx)]"
          >
            Login
          </Link>
        </div>
      </header>

      <section
        className={`relative z-10 mx-auto grid min-h-[calc(100vh-66px)] w-full px-4 py-8 sm:px-8 lg:px-10 lg:py-12 ${
          step === 0
            ? "max-w-7xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]"
            : "max-w-4xl items-start gap-0"
        }`}
      >
        {step === 0 ? (
          <div className="max-w-xl">
            <h1 className="orb text-[34px] font-black uppercase leading-[0.98] tracking-[-0.05em] text-white sm:text-[54px] lg:text-[68px]">
              Build your promo workflow in 60 seconds.
            </h1>
            <p className="sans mt-5 max-w-lg text-base leading-6 text-white/58 sm:text-lg">
              Answer a few quick questions and get a personalized plan for
              flyers, animated videos, and professional images — matched to your
              monthly content volume.
            </p>
          </div>
        ) : null}

        <div className="hud relative overflow-hidden p-4 shadow-[0_35px_120px_rgba(0,0,0,0.62)] sm:p-6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--cx)] to-transparent" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[rgba(0,245,255,0.12)] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-[rgba(191,95,255,0.12)] blur-3xl" />

          <div className="relative z-10">
            <ProgressBar step={step} />

            <div className="mt-6">
              {step === 0 ? (
                <div>
                  <span className="mono text-[9px] uppercase tracking-[0.18em] text-[var(--cx)]">
                    Step 01
                  </span>
                  <h2 className="orb mt-3 text-2xl font-black uppercase tracking-[-0.03em] text-white sm:text-3xl">
                    Let&apos;s build your personalized promo plan.
                  </h2>
                  <p className="sans mt-3 text-sm leading-6 text-white/52">
                    Enter your name to start a quick 60-second diagnosis.
                    We&apos;ll match you with the best plan for your content
                    volume, goals, and creative workflow.
                  </p>
                  <label className="mt-6 grid gap-2">
                    <span className="mono text-[9px] uppercase tracking-[0.18em] text-white/42">
                      Your name
                    </span>
                    <input
                      value={state.name}
                      onChange={(event) =>
                        setState((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Example: Alex"
                      className="min-h-14 border border-[rgba(0,245,255,0.18)] bg-black/30 px-4 text-base text-white outline-none transition placeholder:text-white/25 focus:border-[rgba(0,245,255,0.62)] focus:shadow-[0_0_32px_rgba(0,245,255,0.13)]"
                      autoFocus
                    />
                  </label>
                </div>
              ) : null}

              {step === 1 ? (
                <StepBlock
                  eyebrow="Step 02"
                  title="What is your main goal?"
                  subtitle="This helps decide whether you need more static creatives, animations, or a high-volume setup."
                >
                  {options.goal.map((option) => (
                    <StepOption
                      key={option.value}
                      selected={state.goal === option.value}
                      label={option.label}
                      description={option.description}
                      icon={option.icon}
                      onClick={() =>
                        setState((prev) => ({ ...prev, goal: option.value }))
                      }
                    />
                  ))}
                </StepBlock>
              ) : null}

              {step === 2 ? (
                <StepBlock
                  eyebrow="Step 03"
                  title="How many visuals do you create per month?"
                  subtitle="We use this to avoid recommending a plan that runs out of credits too fast."
                >
                  {options.volume.map((option) => (
                    <StepOption
                      key={option.value}
                      selected={state.volume === option.value}
                      label={option.label}
                      description={option.description}
                      meta={option.credits}
                      onClick={() =>
                        setState((prev) => ({ ...prev, volume: option.value }))
                      }
                    />
                  ))}
                </StepBlock>
              ) : null}

              {step === 3 ? (
                <StepBlock
                  eyebrow="Step 04"
                  title="What do you need most right now?"
                  subtitle="The final recommendation changes depending on whether video, flyer volume, or photo quality matters most."
                >
                  {options.need.map((option) => (
                    <StepOption
                      key={option.value}
                      selected={state.need === option.value}
                      label={option.label}
                      description={option.description}
                      icon={option.icon}
                      onClick={() =>
                        setState((prev) => ({ ...prev, need: option.value }))
                      }
                    />
                  ))}
                </StepBlock>
              ) : null}

              {step === 4 ? (
                <StepBlock
                  eyebrow="Step 05"
                  title="What is slowing you down most?"
                  subtitle="This lets the funnel frame the offer around the objection the visitor actually feels."
                >
                  {options.pain.map((option) => (
                    <StepOption
                      key={option.value}
                      selected={state.pain === option.value}
                      label={option.label}
                      description={option.description}
                      onClick={() =>
                        setState((prev) => ({ ...prev, pain: option.value }))
                      }
                    />
                  ))}
                </StepBlock>
              ) : null}

              {step === 5 ? (
                <StepBlock
                  eyebrow="Step 06"
                  title="How soon do you want to create?"
                  subtitle="Urgency changes the CTA and the strength of the checkout recommendation."
                >
                  {options.urgency.map((option) => (
                    <StepOption
                      key={option.value}
                      selected={state.urgency === option.value}
                      label={option.label}
                      description={option.description}
                      icon={Clock3}
                      onClick={() =>
                        setState((prev) => ({ ...prev, urgency: option.value }))
                      }
                    />
                  ))}
                </StepBlock>
              ) : null}

              {step >= 2 && step <= 5 ? (
                <div className="mt-6">
                  <MatchedExamplesPanel
                    state={state}
                    eyebrow="Matched examples"
                    title="Examples based on your answers"
                    compact
                  />
                </div>
              ) : null}

              {step === 6 ? (
                <div className="grid gap-5">
                  <div>
                    <span className="mono text-[9px] uppercase tracking-[0.18em] text-[var(--cg)]">
                      Personalized result
                    </span>
                    <h2 className="orb mt-3 text-2xl font-black uppercase tracking-[-0.03em] text-white sm:text-3xl">
                      {outcome.headline}
                    </h2>
                    <p className="sans mt-3 text-sm leading-6 text-white/58">
                      {outcome.subheadline}
                    </p>
                  </div>


                  <div className="grid items-start gap-3 lg:grid-cols-3">
                    {(Object.keys(plans) as PlanVariant[]).map((planKey) => (
                      <PlanCard
                        key={planKey}
                        plan={plans[planKey]}
                        selected={selectedPlan === planKey}
                        recommended={recommendedPlan === planKey}
                        onSelect={() => setSelectedPlan(planKey)}
                      />
                    ))}
                  </div>

                  <div className="relative overflow-hidden border border-[rgba(0,245,255,0.2)] bg-[rgba(0,245,255,0.055)] p-3 shadow-[0_0_38px_rgba(0,245,255,0.12)] sm:p-4">
                    <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--cx)] to-transparent" />
                    <button
                      type="button"
                      onClick={handleCheckout}
                      disabled={checkoutLoading}
                      className="btn-cx-solid inline-flex min-h-14 w-full items-center justify-center gap-3 px-5 py-4 text-[11px] disabled:cursor-wait disabled:opacity-70"
                    >
                      <span className="relative z-10">
                        {checkoutLoading
                          ? "OPENING CHECKOUT..."
                          : `GO TO CHECKOUT · ${selectedPlanData.name.toUpperCase()}`}
                      </span>
                      {checkoutLoading ? (
                        <span
                          className="relative z-10 h-4 w-4 rounded-full border-2 border-black/30 border-t-black"
                          style={{ animation: "spin 0.8s linear infinite" }}
                        />
                      ) : (
                        <ArrowRight size={14} className="relative z-10" />
                      )}
                    </button>
                    <p className="sans mt-2 text-center text-xs leading-6 text-white/52">
                      First checkout button — placed directly below the plan
                      cards.
                    </p>
                  </div>

                  <div className="grid items-start gap-3 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="hud p-4">
                      <h3 className="orb text-sm font-bold uppercase tracking-[0.1em] text-white">
                        Why this fits
                      </h3>
                      <p className="sans mt-3 text-sm leading-6 text-white/56">
                        {outcome.pain}
                      </p>
                      <ul className="mt-4 grid gap-2">
                        {selectedPlanData.features
                          .slice(0, 4)
                          .map((feature) => (
                            <li
                              key={feature}
                              className="flex items-start gap-2 text-sm leading-6 text-white/62"
                            >
                              <CheckCircle2
                                size={15}
                                className="mt-1 shrink-0 text-[var(--cg)]"
                              />
                              {feature}
                            </li>
                          ))}
                      </ul>
                    </div>

                    <div className="hud p-4 sm:p-5">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="mono text-[8px] uppercase tracking-[0.18em] text-[rgba(0,245,255,0.62)]">
                            Savings estimate
                          </p>
                          <h3 className="orb mt-1 text-sm font-bold uppercase tracking-[0.08em] text-white sm:text-base">
                            Estimated design cost avoided
                          </h3>
                        </div>
                        <span className="mono w-fit border border-[rgba(0,245,255,0.18)] bg-[rgba(0,245,255,0.06)] px-2 py-1 text-[8px] uppercase tracking-[0.14em] text-[var(--cx)]">
                          $35 / promo
                        </span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
                        <MiniStat
                          label="Visuals/mo"
                          value={`${savings.expectedVisuals}`}
                        />
                        <MiniStat
                          label="Designer cost"
                          value={`$${savings.designerCost}`}
                        />
                        <MiniStat
                          label="Plan cost"
                          value={selectedPlanData.price}
                        />
                        <MiniStat
                          label="Potential gap"
                          value={`$${Math.round(savings.estimatedSavings)}`}
                          accent
                        />
                      </div>
                      <p className="sans mt-4 rounded-none border-l border-[rgba(0,245,255,0.22)] bg-white/[0.025] px-3 py-2 text-[11px] leading-6 text-white/42 sm:text-xs">
                        Estimate based on a conservative $35 per promotional
                        piece. Actual savings vary by workflow.
                      </p>
                    </div>
                  </div>

                  {error ? (
                    <p className="sans text-sm leading-6 text-rose-300">
                      {error}
                    </p>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    className="btn-cx-solid inline-flex min-h-14 w-full items-center justify-center gap-3 px-5 py-4 text-[11px] disabled:cursor-wait disabled:opacity-70"
                  >
                    <span className="relative z-10">
                      {checkoutLoading
                        ? "OPENING CHECKOUT..."
                        : `CONTINUE WITH ${selectedPlanData.name.toUpperCase()}`}
                    </span>
                    {checkoutLoading ? (
                      <span
                        className="relative z-10 h-4 w-4 rounded-full border-2 border-black/30 border-t-black"
                        style={{ animation: "spin 0.8s linear infinite" }}
                      />
                    ) : (
                      <ArrowRight size={14} className="relative z-10" />
                    )}
                  </button>

                  <div className="grid items-start gap-3 sm:grid-cols-3">
                    {[
                      { icon: ShieldCheck, text: "Secure Stripe checkout" },
                      { icon: BadgeCheck, text: "Email setup after payment" },
                      { icon: Sparkles, text: "Start creating after signup" },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.text}
                          className="flex items-center gap-2 text-xs text-white/44"
                        >
                          <Icon size={14} className="text-[var(--cx)]" />
                          {item.text}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>

            {error && step !== 6 ? (
              <p className="sans mt-4 text-sm leading-6 text-rose-300">
                {error}
              </p>
            ) : null}

            {step !== 6 ? (
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 0}
                  className="inline-flex min-h-11 items-center gap-2 border border-white/10 bg-white/[0.035] px-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/48 transition hover:border-white/18 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft size={14} />
                  Back
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  className="btn-cx-solid inline-flex min-h-11 items-center justify-center gap-2 px-5 text-[10px]"
                >
                  <span className="relative z-10">
                    {step === 5 ? "Show my plan" : "Continue"}
                  </span>
                  <ChevronRight size={14} className="relative z-10" />
                </button>
              </div>
            ) : (
              <div className="mt-6 flex justify-start border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="inline-flex min-h-11 items-center gap-2 border border-white/10 bg-white/[0.035] px-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/48 transition hover:border-white/18 hover:text-white"
                >
                  <ChevronLeft size={14} />
                  Edit answers
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function MatchedExamplesPanel({
  state,
  eyebrow,
  title,
  compact = false,
}: {
  state: FunnelState;
  eyebrow: string;
  title: string;
  compact?: boolean;
}) {
  const examples = getExamplesForState(state);

  return (
    <section className="hud overflow-hidden p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mono text-[8px] uppercase tracking-[0.18em] text-[rgba(0,245,255,0.64)]">
            {eyebrow}
          </p>
          <h3 className="orb mt-1 text-sm font-bold uppercase tracking-[0.08em] text-white sm:text-base">
            {title}
          </h3>
        </div>
        <p className="sans max-w-sm text-xs leading-6 text-white/42">
          The examples adapt as you choose your goal, volume, and creative
          needs.
        </p>
      </div>

      <div
        className={`example-scroll mt-4 flex gap-3 overflow-x-auto pb-1 ${
          compact
            ? "lg:grid lg:grid-cols-3 lg:overflow-visible"
            : "lg:grid lg:grid-cols-3 lg:overflow-visible"
        }`}
      >
        {examples.map((example, index) => (
          <CreativeExampleCard
            key={`${example.title}-${index}`}
            example={example}
          />
        ))}
      </div>
    </section>
  );
}

function CreativeExampleCard({ example }: { example: CreativeExample }) {
  const [playing, setPlaying] = useState(false);
  const hasVimeo = example.kind === "vimeo" && Boolean(example.vimeoId);
  const vimeoSrc = hasVimeo
    ? `https://player.vimeo.com/video/${example.vimeoId}?autoplay=0&muted=0&loop=0&autopause=1&title=0&byline=0&portrait=0&badge=0&playsinline=1&controls=1`
    : "";

  return (
    <article className="min-w-[76%] overflow-hidden border border-white/10 bg-black/24 sm:min-w-[245px] lg:min-w-0">
      <button
        type="button"
        onClick={() => hasVimeo && setPlaying(true)}
        className="relative block aspect-[4/5] w-full overflow-hidden bg-black text-left"
        aria-label={
          hasVimeo ? `Open video example: ${example.title}` : example.title
        }
      >
        <img
          src={example.image}
          alt={example.title}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(3,4,10,0.04),rgba(3,4,10,0.46))]" />

        {playing && hasVimeo ? (
          <iframe
            src={vimeoSrc}
            title={example.title}
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : null}

        {hasVimeo && !playing ? (
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid h-12 w-12 place-items-center border border-[rgba(0,245,255,0.42)] bg-[rgba(0,245,255,0.12)] text-[var(--cx)] shadow-[0_0_30px_rgba(0,245,255,0.28)]">
              <Play size={18} fill="currentColor" />
            </span>
          </span>
        ) : null}

        <span className="mono absolute left-3 top-3 border border-[rgba(0,245,255,0.22)] bg-black/58 px-2 py-1 text-[7px] uppercase tracking-[0.16em] text-[var(--cx)] backdrop-blur-sm">
          {example.tag}
        </span>
      </button>
    </article>
  );
}

function StepBlock({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div>
      <span className="mono text-[9px] uppercase tracking-[0.18em] text-[var(--cx)]">
        {eyebrow}
      </span>
      <h2 className="orb mt-3 text-2xl font-black uppercase tracking-[-0.03em] text-white sm:text-3xl">
        {title}
      </h2>
      <p className="sans mt-3 text-sm leading-6 text-white/52">{subtitle}</p>
      <div className="mt-6 grid items-start gap-3 sm:grid-cols-2">
        {children}
      </div>
    </div>
  );
}


function MiniStat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="min-w-0 border border-white/10 bg-black/20 p-2.5 sm:p-3">
      <p className="mono truncate text-[7px] uppercase tracking-[0.12em] text-white/38 sm:text-[8px] sm:tracking-[0.14em]">
        {label}
      </p>
      <p
        className={`sans mt-1 break-words text-base font-black leading-tight sm:text-lg ${accent ? "text-[var(--cg)]" : "text-white"}`}
      >
        {value}
      </p>
    </div>
  );
}
