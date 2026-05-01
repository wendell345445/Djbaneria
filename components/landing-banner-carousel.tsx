"use client";

import type { LandingBannerExample } from "@/lib/landing-banner-examples";

// This carousel intentionally does not render example titles/captions.
// It only displays the banner images.

type LandingBannerCarouselProps = {
  examples: LandingBannerExample[];
};

export function LandingBannerCarousel({
  examples,
}: LandingBannerCarouselProps) {
  const validExamples = examples.filter((example) => Boolean(example.imageUrl));

  if (!validExamples.length) {
    return null;
  }

  const firstRow = validExamples;
  const secondRow = [...validExamples].reverse();

  return (
    <div className="relative mx-auto w-full max-w-[1180px] overflow-hidden py-2">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes premiumMarqueeLeft {
              from {
                transform: translate3d(0, 0, 0);
              }
              to {
                transform: translate3d(-50%, 0, 0);
              }
            }

            @keyframes premiumMarqueeRight {
              from {
                transform: translate3d(-50%, 0, 0);
              }
              to {
                transform: translate3d(0, 0, 0);
              }
            }

            .premium-marquee-left {
              animation: premiumMarqueeLeft 46s linear infinite;
            }

            .premium-marquee-right {
              animation: premiumMarqueeRight 52s linear infinite;
            }

            .premium-marquee-mask {
              -webkit-mask-image: linear-gradient(
                90deg,
                transparent 0%,
                #000 9%,
                #000 91%,
                transparent 100%
              );
              mask-image: linear-gradient(
                90deg,
                transparent 0%,
                #000 9%,
                #000 91%,
                transparent 100%
              );
            }
          `,
        }}
      />

      <div className="pointer-events-none absolute left-1/2 top-12 h-48 w-48 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-12 right-10 h-52 w-52 rounded-full bg-violet-400/10 blur-3xl" />

      <div className="premium-marquee-mask relative space-y-5 sm:space-y-6">
        <PremiumMarqueeRow examples={firstRow} direction="left" />
        <PremiumMarqueeRow examples={secondRow} direction="right" />
      </div>
    </div>
  );
}

function PremiumMarqueeRow({
  examples,
  direction,
}: {
  examples: LandingBannerExample[];
  direction: "left" | "right";
}) {
  return (
    <div className="relative overflow-hidden">
      <div
        className={`flex w-max transform-gpu will-change-transform ${
          direction === "left" ? "premium-marquee-left" : "premium-marquee-right"
        }`}
      >
        <MarqueeSet examples={examples} />
        <MarqueeSet examples={examples} ariaHidden />
      </div>
    </div>
  );
}

function MarqueeSet({
  examples,
  ariaHidden = false,
}: {
  examples: LandingBannerExample[];
  ariaHidden?: boolean;
}) {
  return (
    <div
      aria-hidden={ariaHidden}
      className="flex shrink-0 items-center gap-4 pr-4 sm:gap-5 sm:pr-5"
    >
      {examples.map((example) => (
        <article
          key={`${ariaHidden ? "copy" : "main"}-${example.id}`}
          className="group relative w-[188px] shrink-0 overflow-hidden rounded-[24px] border border-white/10 bg-[#0b1020] shadow-[0_24px_70px_rgba(0,0,0,0.28)] ring-1 ring-white/[0.03] transition duration-500 hover:-translate-y-1 hover:border-cyan-200/20 hover:shadow-[0_30px_90px_rgba(34,211,238,0.12)] sm:w-[238px] sm:rounded-[30px] md:w-[275px] lg:w-[305px]"
        >
          <div className="relative aspect-[4/5] overflow-hidden">
            <img
              src={example.imageUrl}
              alt="AI-generated DJ banner example"
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
              loading="lazy"
              draggable={false}
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/5 to-transparent opacity-80" />
            <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_38%)]" />
            </div>

          </div>
        </article>
      ))}
    </div>
  );
}
