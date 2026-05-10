import { random, useCurrentFrame } from "remotion";
import { PRESET_LOOK, type AudioEnergy, type MotionPreset } from "../presets/motion-presets";

type AmbientParticlesProps = {
  audio: AudioEnergy;
  preset: MotionPreset;
};

export function AmbientParticles({ audio, preset }: AmbientParticlesProps) {
  const frame = useCurrentFrame();
  const look = PRESET_LOOK[preset];

  const particleCount =
    look.mood === "festival" ? 82 : look.mood === "cinematic" ? 34 : 58;

  return (
    <>
      {Array.from({ length: particleCount }).map((_, index) => {
        const seed = index * 19.31;
        const x = random(seed) * 1024;
        const startY = random(seed + 8) * 1536;
        const drift = random(seed + 13) * 30 - 15;
        const speed = 0.28 + random(seed + 21) * 1.7 + audio.energy * 1.25;
        const size = 1.2 + random(seed + 34) * 4.6;
        const y = (startY - frame * speed) % 1536;
        const color =
          index % 4 === 0
            ? look.warm
            : index % 3 === 0
              ? look.accent
              : look.primary;

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x + Math.sin(frame / 35 + seed) * drift,
              top: y < 0 ? y + 1536 : y,
              width: size,
              height: size,
              borderRadius: 999,
              background: `rgba(${color}, ${0.62 + audio.high * 0.28})`,
              boxShadow: `0 0 ${7 + audio.energy * 20}px rgba(${color}, 0.75)`,
              opacity: 0.06 + audio.energy * 0.34 + random(seed + 55) * 0.1,
              transform: `scale(${0.72 + audio.energy * 1.15})`,
              mixBlendMode: "screen",
              pointerEvents: "none",
            }}
          />
        );
      })}
    </>
  );
}
