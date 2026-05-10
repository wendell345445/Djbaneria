import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";

type ProfessionalTransitionProps = {
  imageUrl?: string;
  cutFrames?: number[];
  durationInFrames?: number;
  primaryRgb?: string;
  secondaryRgb?: string;
  accentRgb?: string;
  bass?: number;
  energy?: number;
  peak?: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getActiveTransition(
  frame: number,
  cutFrames: number[],
  durationInFrames: number
) {
  for (const cutFrame of cutFrames) {
    const start = cutFrame - Math.floor(durationInFrames / 2);
    const end = start + durationInFrames;

    if (frame >= start && frame <= end) {
      const localFrame = frame - start;
      const progress = clamp(localFrame / durationInFrames, 0, 1);
      return {
        cutFrame,
        localFrame,
        progress,
      };
    }
  }

  return null;
}

export function ProfessionalTransition({
  imageUrl = "",
  cutFrames = [0, 90, 180, 270],
  durationInFrames = 18,
  primaryRgb = "34, 211, 238",
  secondaryRgb = "168, 85, 247",
  accentRgb = "236, 72, 153",
  bass = 0,
  energy = 0,
  peak = 0,
}: ProfessionalTransitionProps) {
  const frame = useCurrentFrame();
  const active = getActiveTransition(frame, cutFrames, durationInFrames);

  if (!active) {
    return null;
  }

  const { progress, localFrame, cutFrame } = active;
  const centerHit = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
  const hit = Easing.out(Easing.cubic)(centerHit);
  const audioBoost = clamp(0.75 + bass * 0.5 + energy * 0.3 + peak * 0.25, 0.75, 1.45);
  const strength = clamp(hit * audioBoost, 0, 1);

  const flashOpacity = interpolate(strength, [0, 1], [0, 0.26]);
  const burnOpacity = interpolate(strength, [0, 1], [0, 0.42]);
  const wipeX = interpolate(progress, [0, 1], [-1400, 1400]);
  const zoom = interpolate(strength, [0, 1], [1, 1.055]);
  const split = interpolate(strength, [0, 1], [0, 24]);
  const shutter = interpolate(strength, [0, 1], [0, 90]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {imageUrl ? (
        <>
          <Img
            src={imageUrl}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.13 * strength,
              transform: `translateX(${-split}px) scale(${zoom})`,
              filter: "blur(1.2px) saturate(1.6) hue-rotate(-18deg)",
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
              opacity: 0.12 * strength,
              transform: `translateX(${split}px) scale(${zoom})`,
              filter: "blur(1.2px) saturate(1.7) hue-rotate(22deg)",
              mixBlendMode: "screen",
            }}
          />
        </>
      ) : null}

      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 48%, rgba(${primaryRgb}, ${
            0.18 * strength
          }), rgba(${secondaryRgb}, ${0.09 * strength}) 34%, transparent 62%)`,
          transform: `scale(${1 + strength * 0.18})`,
          mixBlendMode: "screen",
        }}
      />

      <AbsoluteFill
        style={{
          background: `linear-gradient(105deg, transparent 0%, rgba(255,255,255,0) 34%, rgba(255,255,255,${
            0.48 * strength
          }) 47%, rgba(${primaryRgb}, ${0.28 * strength}) 52%, transparent 68%)`,
          transform: `translateX(${wipeX}px) rotate(8deg)`,
          filter: `blur(${2 + strength * 8}px)`,
          mixBlendMode: "screen",
        }}
      />

      <AbsoluteFill
        style={{
          background: `linear-gradient(70deg, rgba(${accentRgb}, ${
            0.2 * strength
          }), transparent 26%, transparent 62%, rgba(${primaryRgb}, ${
            0.2 * strength
          }))`,
          opacity: burnOpacity,
          mixBlendMode: "screen",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: shutter,
          background: `linear-gradient(to right, rgba(${secondaryRgb}, ${
            0.5 * strength
          }), transparent)`,
          filter: `blur(${14 + strength * 30}px)`,
          mixBlendMode: "screen",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: 0,
          width: shutter,
          background: `linear-gradient(to left, rgba(${primaryRgb}, ${
            0.5 * strength
          }), transparent)`,
          filter: `blur(${14 + strength * 30}px)`,
          mixBlendMode: "screen",
        }}
      />

      {Array.from({ length: 10 }).map((_, index) => {
        const seed = cutFrame * 0.17 + index * 27;
        const top = random(seed) * 1536;
        const height = 8 + random(seed + 7) * 36;
        const offset = (random(seed + 19) - 0.5) * 170 * strength;
        const visible = localFrame % 3 !== 1;

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: -80 + offset,
              top,
              width: 1220,
              height,
              background: `linear-gradient(to right, transparent, rgba(255,255,255,${
                visible ? 0.08 * strength : 0
              }), rgba(${index % 2 === 0 ? primaryRgb : accentRgb}, ${
                visible ? 0.16 * strength : 0
              }), transparent)`,
              filter: "blur(0.8px)",
              mixBlendMode: "screen",
            }}
          />
        );
      })}

      <AbsoluteFill
        style={{
          background: "white",
          opacity: flashOpacity,
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
}
