"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { LandingBannerExample } from "@/lib/landing-banner-examples";

type LandingBannerCarouselProps = {
  examples: LandingBannerExample[];
};

const SWIPE_THRESHOLD = 42;
const AUTOPLAY_INTERVAL_MS = 3500;

export function LandingBannerCarousel({
  examples,
}: LandingBannerCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  const safeExamples = useMemo(() => {
    const images = examples.filter((example) => Boolean(example.imageUrl));
    return images.length > 0 ? images : examples;
  }, [examples]);

  const activeExample = safeExamples[activeIndex] ?? safeExamples[0];

  useEffect(() => {
    if (safeExamples.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) =>
        current === safeExamples.length - 1 ? 0 : current + 1,
      );
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [safeExamples.length]);

  function goToPrevious() {
    setActiveIndex((current) =>
      current === 0 ? safeExamples.length - 1 : current - 1,
    );
  }

  function goToNext() {
    setActiveIndex((current) =>
      current === safeExamples.length - 1 ? 0 : current + 1,
    );
  }

  function handleTouchEnd(clientX: number) {
    if (touchStartX === null) return;

    const distance = touchStartX - clientX;
    setTouchStartX(null);

    if (Math.abs(distance) < SWIPE_THRESHOLD) return;

    if (distance > 0) {
      goToNext();
    } else {
      goToPrevious();
    }
  }

  if (!activeExample) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-[1120px]">
      <div
        className="select-none"
        onTouchStart={(event) =>
          setTouchStartX(event.touches[0]?.clientX ?? null)
        }
        onTouchEnd={(event) =>
          handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)
        }
      >
        <div className="relative mx-auto w-full max-w-[420px] sm:max-w-[520px] lg:max-w-[620px]">
          <div className="overflow-hidden rounded-[26px] border border-white/10 bg-black shadow-[0_28px_90px_rgba(0,0,0,0.35)] sm:rounded-[34px]">
            {activeExample.imageUrl && !failedImages[activeIndex] ? (
              <img
                key={activeExample.id}
                src={activeExample.imageUrl}
                alt={activeExample.title || "Banner criado com IA"}
                className="aspect-[4/5] h-auto max-h-[76vh] w-full object-cover opacity-100 transition-all duration-700 ease-out"
                onError={() =>
                  setFailedImages((current) => ({
                    ...current,
                    [activeIndex]: true,
                  }))
                }
              />
            ) : (
              <div
                key={activeExample.id}
                className="aspect-[4/5] max-h-[76vh] w-full bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.22),transparent_34%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.2),transparent_34%),linear-gradient(135deg,rgba(15,23,42,1),rgba(2,6,23,1))] transition-all duration-700 ease-out"
              />
            )}
          </div>

          {safeExamples.length > 1 ? (
            <>
              <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 sm:px-3">
                <button
                  type="button"
                  onClick={goToPrevious}
                  className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white shadow-[0_10px_35px_rgba(0,0,0,0.35)] backdrop-blur transition hover:bg-black/55 active:scale-95 sm:h-12 sm:w-12"
                  aria-label="Banner anterior"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white shadow-[0_10px_35px_rgba(0,0,0,0.35)] backdrop-blur transition hover:bg-black/55 active:scale-95 sm:h-12 sm:w-12"
                  aria-label="Próximo banner"
                >
                  <ChevronRight size={22} />
                </button>
              </div>

              <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2 px-4">
                {safeExamples.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`h-2.5 rounded-full transition ${
                      index === activeIndex
                        ? "w-10 bg-white"
                        : "w-2.5 bg-white/35 hover:bg-white/60"
                    }`}
                    aria-label={`Ir para o banner ${index + 1}`}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
