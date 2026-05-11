import {
  AbsoluteFill,
  Img,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";

export type PremiumTransitionVariant =
  | "AUTO"
  | "ROTATE_ZOOM"
  | "WHIP_ZOOM"
  | "SPIN_BLUR"
  | "FLASH_CUT"
  | "GLITCH_ZOOM"
  | "VIRAL_SHAKE"
  | "WHIP_ZOOM_PRO"
  | "SPIN_ZOOM_PRO"
  | "WARP_PUSH_PRO";

type ActiveTransition = {
  index: number;
  cutFrame: number;
  localFrame: number;
  progress: number;
};

type PremiumCapCutTransitionsProps = {
  imageUrl?: string;
  cutFrames?: number[];
  durationInFrames?: number;
  variant?: PremiumTransitionVariant | string;
  primaryRgb?: string;
  secondaryRgb?: string;
  accentRgb?: string;
  bass?: number;
  energy?: number;
  peak?: number;
  intensity?: number;
};

const VARIANTS: Exclude<PremiumTransitionVariant, "AUTO">[] = [
  "WHIP_ZOOM_PRO",
  "SPIN_ZOOM_PRO",
  "WARP_PUSH_PRO",
  "ROTATE_ZOOM",
  "GLITCH_ZOOM",
  "VIRAL_SHAKE",
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function easeOutExpo(value: number) {
  return value === 1 ? 1 : 1 - Math.pow(2, -10 * value);
}

function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function easeOutBack(value: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(value - 1, 3) + c1 * Math.pow(value - 1, 2);
}

function getActiveTransition(
  frame: number,
  cutFrames: number[],
  durationInFrames: number,
): ActiveTransition | null {
  for (let index = 0; index < cutFrames.length; index += 1) {
    const cutFrame = cutFrames[index];
    const localFrame = frame - cutFrame;

    if (localFrame >= 0 && localFrame <= durationInFrames) {
      return {
        index,
        cutFrame,
        localFrame,
        progress: clamp(localFrame / durationInFrames, 0, 1),
      };
    }
  }

  return null;
}

function normalizeVariant(
  variant: PremiumTransitionVariant | string | undefined,
  transitionIndex: number,
): Exclude<PremiumTransitionVariant, "AUTO"> {
  if (!variant || variant === "AUTO") {
    return VARIANTS[transitionIndex % VARIANTS.length];
  }

  const allowed = new Set<PremiumTransitionVariant>([
    "ROTATE_ZOOM",
    "WHIP_ZOOM",
    "SPIN_BLUR",
    "FLASH_CUT",
    "GLITCH_ZOOM",
    "VIRAL_SHAKE",
    "WHIP_ZOOM_PRO",
    "SPIN_ZOOM_PRO",
    "WARP_PUSH_PRO",
  ]);

  return allowed.has(variant as PremiumTransitionVariant)
    ? (variant as Exclude<PremiumTransitionVariant, "AUTO">)
    : "WHIP_ZOOM_PRO";
}

function getPhase(progress: number) {
  const p = clamp(progress, 0, 1);

  // Four After Effects-like phases:
  // 1. wind-up, 2. impact/pass-through, 3. overshoot, 4. settle.
  const windUp = p < 0.18 ? easeInOutCubic(p / 0.18) : p < 0.36 ? 1 - easeInOutCubic((p - 0.18) / 0.18) : 0;
  const impact = p < 0.18 ? 0 : p < 0.42 ? easeOutExpo((p - 0.18) / 0.24) : p < 0.58 ? 1 : 1 - easeInOutCubic((p - 0.58) / 0.42);
  const pass = p < 0.30 ? 0 : p < 0.56 ? easeOutExpo((p - 0.30) / 0.26) : p < 0.78 ? 1 - easeInOutCubic((p - 0.56) / 0.22) : 0;
  const settle = p < 0.58 ? 0 : p < 1 ? Math.sin(((p - 0.58) / 0.42) * Math.PI) : 0;

  return {
    windUp: clamp(windUp, 0, 1),
    impact: clamp(impact, 0, 1),
    pass: clamp(pass, 0, 1),
    settle: clamp(settle, 0, 1),
  };
}

function ScreenFlash({
  progress,
  primaryRgb,
  secondaryRgb,
  accentRgb,
  intensity,
}: {
  progress: number;
  primaryRgb: string;
  secondaryRgb: string;
  accentRgb: string;
  intensity: number;
}) {
  const phase = getPhase(progress);
  const flash = (phase.impact * 0.52 + phase.pass * 0.22) * intensity;
  const afterGlow = interpolate(progress, [0.38, 0.72, 1], [0.38, 0.22, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }) * intensity;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 50%, rgba(255,255,255, ${flash}), rgba(${primaryRgb}, ${
            flash * 0.24
          }) 34%, transparent 70%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: "-18%",
          background: `conic-gradient(from ${progress * 260}deg, rgba(${primaryRgb}, ${
            0.22 * afterGlow
          }), rgba(${secondaryRgb}, ${0.2 * afterGlow}), rgba(${accentRgb}, ${
            0.25 * afterGlow
          }), rgba(${primaryRgb}, ${0.14 * afterGlow}))`,
          filter: "blur(58px)",
          opacity: afterGlow,
          transform: `scale(${1 + phase.impact * 0.18}) rotate(${progress * 28}deg)`,
        }}
      />
    </AbsoluteFill>
  );
}

function WhipStreaks({
  progress,
  primaryRgb,
  secondaryRgb,
  variant,
  intensity,
}: {
  progress: number;
  primaryRgb: string;
  secondaryRgb: string;
  variant: Exclude<PremiumTransitionVariant, "AUTO">;
  intensity: number;
}) {
  const phase = getPhase(progress);
  const opacity = (phase.impact * 0.56 + phase.pass * 0.45) * intensity;
  const direction = variant === "WARP_PUSH_PRO" ? 1 : variant === "SPIN_ZOOM_PRO" ? 0.25 : 1;
  const angleBase = variant === "SPIN_ZOOM_PRO" ? 38 : variant === "WARP_PUSH_PRO" ? 0 : -10;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", overflow: "hidden" }}>
      {Array.from({ length: 24 }).map((_, index) => {
        const seed = index * 13.4;
        const top = random(seed) * 100;
        const height = 0.5 + random(seed + 4) * 3.2;
        const width = 80 + random(seed + 7) * 96;
        const delay = random(seed + 9) * 0.22;
        const move = interpolate(
          clamp(progress - delay, 0, 1),
          [0, 1],
          [-92 * direction, 122 * direction],
        );
        const color = index % 2 === 0 ? primaryRgb : secondaryRgb;

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              top: `${top}%`,
              left: `${move}%`,
              width: `${width}%`,
              height: `${height}%`,
              borderRadius: 999,
              background: `linear-gradient(90deg, transparent, rgba(${color}, ${
                0.38 * intensity
              }), rgba(255,255,255,${0.18 * intensity}), transparent)`,
              filter: `blur(${8 + intensity * 14}px)`,
              opacity,
              transform: `rotate(${angleBase + random(seed + 11) * 26}deg)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}

function TunnelRays({
  progress,
  primaryRgb,
  secondaryRgb,
  accentRgb,
  intensity,
}: {
  progress: number;
  primaryRgb: string;
  secondaryRgb: string;
  accentRgb: string;
  intensity: number;
}) {
  const phase = getPhase(progress);
  const opacity = (phase.impact * 0.68 + phase.pass * 0.38) * intensity;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", overflow: "hidden" }}>
      {Array.from({ length: 28 }).map((_, index) => {
        const seed = index * 9.91;
        const angle = (360 / 28) * index + random(seed) * 10;
        const width = 42 + random(seed + 1) * 80;
        const height = 0.45 + random(seed + 2) * 1.6;
        const move = interpolate(easeOutExpo(progress), [0, 1], [-12, 70], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const color = index % 3 === 0 ? accentRgb : index % 2 === 0 ? primaryRgb : secondaryRgb;

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: `${width}%`,
              height: `${height}%`,
              borderRadius: 999,
              background: `linear-gradient(90deg, transparent, rgba(${color}, ${
                0.34 * intensity
              }), rgba(255,255,255,${0.12 * intensity}), transparent)`,
              filter: `blur(${4 + random(seed + 3) * 9}px)`,
              opacity,
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${move}%)`,
              transformOrigin: "center center",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}

function ImagePassThrough({
  imageUrl,
  progress,
  variant,
  energy,
  intensity,
}: {
  imageUrl?: string;
  progress: number;
  variant: Exclude<PremiumTransitionVariant, "AUTO">;
  energy: number;
  intensity: number;
}) {
  if (!imageUrl) return null;

  const phase = getPhase(progress);
  const opacity = clamp((phase.impact * 0.34 + phase.pass * 0.28 + phase.settle * 0.1) * intensity, 0, 0.62);
  const eased = easeOutExpo(progress);

  let translateX = 0;
  let translateY = 0;
  let rotate = 0;
  let scale = 1.24 + phase.impact * 0.32 + energy * 0.04;
  let blur = 8 + phase.impact * 18;

  if (variant === "WHIP_ZOOM_PRO" || variant === "WHIP_ZOOM") {
    translateX = interpolate(progress, [0, 0.42, 1], [-24, 18, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    translateY = interpolate(progress, [0, 0.5, 1], [4, -4, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    rotate = interpolate(progress, [0, 0.38, 1], [-5, 2, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  if (variant === "SPIN_ZOOM_PRO") {
    rotate = interpolate(progress, [0, 0.72, 1], [0, -360, -360], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    scale = interpolate(progress, [0, 0.72, 0.92, 1], [1.1, 1.95, 1.42, 1.04], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    blur = interpolate(progress, [0, 0.72, 1], [8, 42, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  if (variant === "SPIN_BLUR" || variant === "ROTATE_ZOOM") {
    rotate = interpolate(eased, [0, 1], [-38, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    scale = 1.18 + phase.impact * 0.42;
    blur = 10 + phase.impact * 24;
  }

  if (variant === "WARP_PUSH_PRO") {
    translateY = interpolate(progress, [0, 0.44, 1], [14, -18, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    scale = 1.2 + phase.impact * 0.52;
    rotate = interpolate(progress, [0, 1], [2, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    blur = 12 + phase.impact * 26;
  }

  if (variant === "GLITCH_ZOOM" || variant === "VIRAL_SHAKE") {
    translateX += Math.sin(progress * Math.PI * 18) * 3.5 * (1 - progress);
    translateY += Math.cos(progress * Math.PI * 14) * 3.5 * (1 - progress);
  }

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <Img
        src={imageUrl}
        style={{
          position: "absolute",
          inset: "-16%",
          width: "132%",
          height: "132%",
          objectFit: "cover",
          opacity,
          transform: `translate3d(${translateX}%, ${translateY}%, 0) rotate(${rotate}deg) scale(${scale})`,
          transformOrigin: "center center",
          filter: `blur(${blur}px) saturate(1.45) contrast(1.12)`,
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
}

function RgbSplit({
  imageUrl,
  progress,
  intensity,
}: {
  imageUrl?: string;
  progress: number;
  intensity: number;
}) {
  if (!imageUrl) return null;

  const phase = getPhase(progress);
  const amount = (18 + phase.impact * 28) * intensity * (1 - progress);
  const opacity = clamp((phase.impact * 0.26 + phase.pass * 0.16) * intensity, 0, 0.44);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <Img
        src={imageUrl}
        style={{
          position: "absolute",
          inset: "-8%",
          width: "116%",
          height: "116%",
          objectFit: "cover",
          opacity,
          transform: `translateX(${amount}px) scale(${1.06 + phase.impact * 0.12})`,
          filter: "hue-rotate(165deg) saturate(2.4) contrast(1.25)",
          mixBlendMode: "screen",
        }}
      />
      <Img
        src={imageUrl}
        style={{
          position: "absolute",
          inset: "-8%",
          width: "116%",
          height: "116%",
          objectFit: "cover",
          opacity,
          transform: `translateX(${-amount}px) scale(${1.06 + phase.impact * 0.12})`,
          filter: "hue-rotate(-55deg) saturate(2.3) contrast(1.25)",
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
}

function GlitchBars({
  progress,
  primaryRgb,
  accentRgb,
  intensity,
}: {
  progress: number;
  primaryRgb: string;
  accentRgb: string;
  intensity: number;
}) {
  const phase = getPhase(progress);
  const opacity = (phase.impact * 0.42 + phase.pass * 0.22) * intensity;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      {Array.from({ length: 10 }).map((_, index) => {
        const seed = index * 8.2;
        const y = random(seed) * 100;
        const h = 0.8 + random(seed + 2) * 4.2;
        const x = interpolate(progress, [0, 1], [-18, 20]) * (random(seed + 3) > 0.5 ? 1 : -1);

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: "120%",
              height: `${h}%`,
              background: `linear-gradient(90deg, rgba(${primaryRgb}, ${
                0.18 * intensity
              }), rgba(${accentRgb}, ${0.1 * intensity}), transparent)`,
              opacity,
              filter: "blur(1px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}


function TotalGlowMask({
  progress,
  variant,
  primaryRgb,
  secondaryRgb,
  intensity,
}: {
  progress: number;
  variant: Exclude<PremiumTransitionVariant, "AUTO">;
  primaryRgb: string;
  secondaryRgb: string;
  intensity: number;
}) {
  if (variant !== "SPIN_ZOOM_PRO") return null;

  // Fast lens-flash mask:
  // It covers the screen for a very short time, like a camera light burst,
  // instead of staying as a white background.
  const flashOpacity =
    interpolate(
      progress,
      [0, 0.56, 0.62, 0.69, 0.78, 1],
      [0, 0, 0.18, 0.98, 0, 0],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    ) * Math.min(1, intensity);

  const bloomOpacity =
    interpolate(
      progress,
      [0, 0.50, 0.64, 0.76, 0.92, 1],
      [0, 0, 0.78, 0.42, 0.08, 0],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    ) * Math.min(1, intensity);

  const streakOpacity =
    interpolate(
      progress,
      [0, 0.52, 0.66, 0.82, 1],
      [0, 0, 0.72, 0.16, 0],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    ) * Math.min(1, intensity);

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      {/* Short full-screen light burst. This is intentionally fast. */}
      <div
        style={{
          position: "absolute",
          inset: "-2%",
          backgroundColor: "white",
          opacity: flashOpacity,
        }}
      />

      {/* Colored bloom makes it feel like a light/lens hit instead of a flat white background. */}
      <div
        style={{
          position: "absolute",
          inset: "-22%",
          background: `radial-gradient(circle at 50% 50%, rgba(255,255,255, ${
            bloomOpacity
          }) 0%, rgba(${primaryRgb}, ${bloomOpacity * 0.62}) 34%, rgba(${secondaryRgb}, ${
            bloomOpacity * 0.42
          }) 68%, transparent 100%)`,
          filter: `blur(${18 + bloomOpacity * 56}px)`,
          opacity: bloomOpacity,
          mixBlendMode: "screen",
        }}
      />

      {/* Fast diagonal light sweep, like camera/lens flare. */}
      <div
        style={{
          position: "absolute",
          left: "-35%",
          top: "38%",
          width: "170%",
          height: "20%",
          background: `linear-gradient(90deg, transparent, rgba(${primaryRgb}, ${
            streakOpacity * 0.34
          }), rgba(255,255,255, ${streakOpacity}), rgba(${secondaryRgb}, ${
            streakOpacity * 0.32
          }), transparent)`,
          filter: `blur(${10 + streakOpacity * 18}px)`,
          opacity: streakOpacity,
          transform: `rotate(-18deg) translateX(${(progress - 0.65) * 80}%)`,
          mixBlendMode: "screen",
        }}
      />

      {/* Thin overexposure layer to hide the reset for only a few frames. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "white",
          opacity: flashOpacity * 0.16,
        }}
      />
    </AbsoluteFill>
  );
}

export function PremiumCapCutTransitions({
  imageUrl,
  cutFrames = [],
  durationInFrames = 42,
  variant = "AUTO",
  primaryRgb = "34, 211, 238",
  secondaryRgb = "168, 85, 247",
  accentRgb = "236, 72, 153",
  energy = 0,
  peak = 0,
  intensity = 1.15,
}: PremiumCapCutTransitionsProps) {
  const frame = useCurrentFrame();
  const active = getActiveTransition(frame, cutFrames, durationInFrames);

  if (!active) return null;

  const progress = clamp(active.progress, 0, 1);
  const transitionVariant = normalizeVariant(variant, active.index);
  const effectiveIntensity = clamp(intensity + energy * 0.38 + peak * 0.2, 0.85, 1.85);

  const showRgb =
    transitionVariant === "GLITCH_ZOOM" ||
    transitionVariant === "VIRAL_SHAKE" ||
    transitionVariant === "WHIP_ZOOM_PRO" ||
    transitionVariant === "WARP_PUSH_PRO";

  const showGlitch =
    transitionVariant === "GLITCH_ZOOM" ||
    transitionVariant === "VIRAL_SHAKE" ||
    transitionVariant === "WARP_PUSH_PRO";

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <ImagePassThrough
        imageUrl={imageUrl}
        progress={progress}
        variant={transitionVariant}
        energy={energy}
        intensity={effectiveIntensity}
      />

      <ScreenFlash
        progress={progress}
        primaryRgb={primaryRgb}
        secondaryRgb={secondaryRgb}
        accentRgb={accentRgb}
        intensity={effectiveIntensity}
      />

      <TunnelRays
        progress={progress}
        primaryRgb={primaryRgb}
        secondaryRgb={secondaryRgb}
        accentRgb={accentRgb}
        intensity={effectiveIntensity}
      />

      <WhipStreaks
        progress={progress}
        primaryRgb={primaryRgb}
        secondaryRgb={secondaryRgb}
        variant={transitionVariant}
        intensity={effectiveIntensity}
      />

      {showRgb ? <RgbSplit imageUrl={imageUrl} progress={progress} intensity={effectiveIntensity} /> : null}

      {showGlitch ? (
        <GlitchBars
          progress={progress}
          primaryRgb={primaryRgb}
          accentRgb={accentRgb}
          intensity={effectiveIntensity}
        />
      ) : null}

      <TotalGlowMask
        progress={progress}
        variant={transitionVariant}
        primaryRgb={primaryRgb}
        secondaryRgb={secondaryRgb}
        intensity={effectiveIntensity}
      />
    </AbsoluteFill>
  );
}
