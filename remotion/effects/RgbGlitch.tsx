import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { type AudioEnergy } from "../presets/motion-presets";

type RgbGlitchProps = {
  audio: AudioEnergy;
};

export function RgbGlitch({ audio }: RgbGlitchProps) {
  const frame = useCurrentFrame();
  const active = frame % 44 < 3 || audio.bass > 0.84;

  if (!active) {
    return null;
  }

  return (
    <>
      {Array.from({ length: 10 }).map((_, index) => {
        const seed = index * 12.7 + frame;
        const y = random(seed) * 1536;
        const height = 6 + random(seed + 2) * 26;
        const xOffset = (random(seed + 4) - 0.5) * (24 + audio.energy * 42);

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              top: y,
              left: xOffset,
              width: 1100,
              height,
              background:
                index % 2 === 0
                  ? "rgba(34,211,238,0.2)"
                  : "rgba(239,68,68,0.18)",
              opacity: 0.16 + audio.energy * 0.2,
              mixBlendMode: "screen",
              filter: "blur(1px)",
              pointerEvents: "none",
            }}
          />
        );
      })}

      <AbsoluteFill
        style={{
          background:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 5px)",
          opacity: 0.18 + audio.energy * 0.12,
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />
    </>
  );
}
