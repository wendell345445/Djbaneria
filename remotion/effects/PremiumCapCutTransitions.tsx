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
  | "VIRAL_SHAKE";

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
  variant?: PremiumTransitionVariant;
  primaryRgb?: string;
  secondaryRgb?: string;
  accentRgb?: string;
  bass?: number;
  energy?: number;
  peak?: number;
  intensity?: number;
};

const VARIANTS: Exclude<PremiumTransitionVariant, "AUTO">[] = [
  "ROTATE_ZOOM",
  "WHIP_ZOOM",
  "SPIN_BLUR",
  "FLASH_CUT",
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

function getActiveTransition(
  frame: number,
  cutFrames: number[],
  durationInFrames: number
): ActiveTransition | null {
  for (let index = 0; index < cutFrames.length; index++) {
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

function Streaks({
  progress,
  primaryRgb,
  secondaryRgb,
  intensity,
}: {
  progress: number;
  primaryRgb: string;
  secondaryRgb: string;
  intensity: number;
}) {
  const opacity = interpolate(progress, [0, 0.45, 1], [0.65, 0.32, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      {Array.from({ length: 14 }).map((_, index) => {
        const seed = index * 13.4;
        const top = random(seed) * 1536;
        const height = 8 + random(seed + 4) * 34;
        const width = 620 + random(seed + 7) * 760;
        const delay = random(seed + 9) * 0.2;
        const move = interpolate(
          clamp(progress - delay, 0, 1),
          [0, 1],
          [-900, 1300]
        );

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              top,
              left: move,
              width,
              height,
              borderRadius: 999,
              background: `linear-gradient(to right, transparent, rgba(${
                index % 2 === 0 ? primaryRgb : secondaryRgb
              }, ${0.28 * intensity}), rgba(255,255,255,${
                0.12 * intensity
              }), transparent)`,
              filter: `blur(${8 + intensity * 14}px)`,
              opacity,
              transform: `rotate(${-18 + random(seed + 11) * 36}deg)`,
              mixBlendMode: "screen",
            }}
          />
        );
      })}
    </>
  );
}

function RgbSplit({
  imageUrl,
  progress,
  energy,
  intensity,
}: {
  imageUrl: string;
  progress: number;
  energy: number;
  intensity: number;
}) {
  const amount = interpolate(progress, [0, 0.35, 1], [40, 18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }) * intensity;

  const opacity = interpolate(progress, [0, 0.75, 1], [0.55, 0.25, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      <Img
        src={imageUrl}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity,
          transform: `translateX(${amount}px) scale(${1.05 + energy * 0.04})`,
          filter: "hue-rotate(165deg) saturate(2.2) contrast(1.2)",
          mixBlendMode: "screen",
        }}
      />
      <Img
        src={imageUrl}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity,
          transform: `translateX(${-amount}px) scale(${1.05 + energy * 0.04})`,
          filter: "hue-rotate(-55deg) saturate(2.1) contrast(1.2)",
          mixBlendMode: "screen",
        }}
      />
    </>
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
  const opacity = interpolate(progress, [0, 0.38, 1], [0.55, 0.32, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      {Array.from({ length: 9 }).map((_, index) => {
        const seed = index * 8.2;
        const y = random(seed) * 1536;
        const h = 10 + random(seed + 2) * 58;
        const x = interpolate(progress, [0, 1], [-220, 240], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }) * (random(seed + 3) > 0.5 ? 1 : -1);

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 1024 + Math.abs(x) * 2,
              height: h,
              background: `linear-gradient(to right, rgba(${primaryRgb}, ${
                0.18 * intensity
              }), rgba(${accentRgb}, ${0.1 * intensity}), transparent)`,
              opacity,
              filter: "blur(1px)",
              mixBlendMode: "screen",
            }}
          />
        );
      })}
    </>
  );
}

function FlashLayer({
  progress,
  primaryRgb,
  accentRgb,
  energy,
  intensity,
}: {
  progress: number;
  primaryRgb: string;
  accentRgb: string;
  energy: number;
  intensity: number;
}) {
  const whiteFlash = interpolate(progress, [0, 0.08, 0.32, 1], [0.72, 0.32, 0.08, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }) * intensity;

  const colorFlash = interpolate(progress, [0, 0.2, 1], [0.52, 0.22, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }) * intensity;

  return (
    <>
      <AbsoluteFill
        style={{
          background: "white",
          opacity: clamp(whiteFlash + energy * 0.08, 0, 0.95),
          mixBlendMode: "screen",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 44%, rgba(${primaryRgb}, ${colorFlash}), rgba(${accentRgb}, ${colorFlash * 0.5}), transparent 62%)`,
          opacity: 1,
          mixBlendMode: "screen",
        }}
      />
    </>
  );
}

function TransitionImage({
  imageUrl,
  variant,
  progress,
  bass,
  energy,
  intensity,
}: {
  imageUrl: string;
  variant: Exclude<PremiumTransitionVariant, "AUTO">;
  progress: number;
  bass: number;
  energy: number;
  intensity: number;
}) {
  const eased = easeOutExpo(progress);
  const smooth = easeInOutCubic(progress);

  let transform = "scale(1)";
  let filter = "none";
  let opacity = interpolate(progress, [0, 0.8, 1], [0.7, 0.22, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (variant === "ROTATE_ZOOM") {
    const rotate = interpolate(eased, [0, 1], [-15 * intensity, 0]);
    const scale = interpolate(eased, [0, 1], [1.38, 1.02]) + bass * 0.04;
    transform = `rotate(${rotate}deg) scale(${scale})`;
    filter = `blur(${interpolate(progress, [0, 1], [18, 0])}px) saturate(${1.3 + energy * 0.5})`;
  }

  if (variant === "WHIP_ZOOM") {
    const x = interpolate(eased, [0, 1], [-980 * intensity, 0]);
    const scale = interpolate(eased, [0, 1], [1.26, 1.02]) + bass * 0.035;
    transform = `translateX(${x}px) skewX(${-10 * (1 - smooth)}deg) scale(${scale})`;
    filter = `blur(${interpolate(progress, [0, 1], [22, 0])}px) contrast(1.12)`;
  }

  if (variant === "SPIN_BLUR") {
    const rotate = interpolate(eased, [0, 1], [32 * intensity, 0]);
    const scale = interpolate(eased, [0, 1], [1.5, 1.02]) + bass * 0.04;
    transform = `rotate(${rotate}deg) scale(${scale})`;
    filter = `blur(${interpolate(progress, [0, 1], [28, 0])}px) brightness(${1.08 + energy * 0.12})`;
  }

  if (variant === "FLASH_CUT") {
    const scale = interpolate(eased, [0, 1], [1.18, 1.01]) + bass * 0.025;
    transform = `scale(${scale})`;
    filter = `brightness(${1.35 - progress * 0.28}) contrast(1.12)`;
    opacity = interpolate(progress, [0, 0.35, 1], [0.48, 0.18, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  if (variant === "GLITCH_ZOOM") {
    const x = Math.sin(progress * Math.PI * 12) * 22 * intensity;
    const scale = interpolate(eased, [0, 1], [1.28, 1.02]) + bass * 0.05;
    transform = `translateX(${x}px) scale(${scale})`;
    filter = `contrast(1.18) saturate(${1.5 + energy * 0.6}) blur(${interpolate(progress, [0, 1], [8, 0])}px)`;
  }

  if (variant === "VIRAL_SHAKE") {
    const shake = Math.sin(progress * Math.PI * 18) * (24 * (1 - progress)) * intensity;
    const scale = interpolate(eased, [0, 1], [1.34, 1.03]) + bass * 0.04;
    transform = `translateX(${shake}px) translateY(${-shake * 0.35}px) scale(${scale})`;
    filter = `blur(${interpolate(progress, [0, 1], [14, 0])}px) saturate(${1.25 + energy * 0.35})`;
  }

  return (
    <Img
      src={imageUrl}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        opacity,
        transform,
        filter,
        mixBlendMode: "screen",
      }}
    />
  );
}

export function PremiumCapCutTransitions({
  imageUrl = "",
  cutFrames = [0, 72, 144, 216, 270],
  durationInFrames = 16,
  variant = "AUTO",
  primaryRgb = "34, 211, 238",
  secondaryRgb = "168, 85, 247",
  accentRgb = "236, 72, 153",
  bass = 0,
  energy = 0,
  peak = 0,
  intensity = 1,
}: PremiumCapCutTransitionsProps) {
  const frame = useCurrentFrame();
  const active = getActiveTransition(frame, cutFrames, durationInFrames);

  if (!active) {
    return null;
  }

  const chosenVariant =
    variant === "AUTO" ? VARIANTS[active.index % VARIANTS.length] : variant;

  const audioBoost = clamp(1 + bass * 0.38 + energy * 0.22 + peak * 0.18, 1, 1.75);
  const finalIntensity = clamp(intensity * audioBoost, 0.2, 2.2);
  const progress = active.progress;

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {imageUrl ? (
        <TransitionImage
          imageUrl={imageUrl}
          variant={chosenVariant}
          progress={progress}
          bass={bass}
          energy={energy}
          intensity={finalIntensity}
        />
      ) : null}

      {(chosenVariant === "GLITCH_ZOOM" || chosenVariant === "VIRAL_SHAKE") && imageUrl ? (
        <RgbSplit
          imageUrl={imageUrl}
          progress={progress}
          energy={energy}
          intensity={finalIntensity}
        />
      ) : null}

      {(chosenVariant === "WHIP_ZOOM" || chosenVariant === "ROTATE_ZOOM") ? (
        <Streaks
          progress={progress}
          primaryRgb={primaryRgb}
          secondaryRgb={secondaryRgb}
          intensity={finalIntensity}
        />
      ) : null}

      {(chosenVariant === "GLITCH_ZOOM" || chosenVariant === "VIRAL_SHAKE") ? (
        <GlitchBars
          progress={progress}
          primaryRgb={primaryRgb}
          accentRgb={accentRgb}
          intensity={finalIntensity}
        />
      ) : null}

      <FlashLayer
        progress={progress}
        primaryRgb={primaryRgb}
        accentRgb={accentRgb}
        energy={energy}
        intensity={finalIntensity}
      />

      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at center, transparent 44%, rgba(0,0,0,${
            0.16 * finalIntensity
          }) 100%)`,
          opacity: interpolate(progress, [0, 0.55, 1], [0.55, 0.22, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
    </AbsoluteFill>
  );
}
