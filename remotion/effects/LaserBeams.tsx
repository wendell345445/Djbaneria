import { random, useCurrentFrame } from "remotion";
import { PRESET_LOOK, type AudioEnergy, type MotionPreset } from "../presets/motion-presets";

type LaserBeamsProps = {
  audio: AudioEnergy;
  preset: MotionPreset;
};

export function LaserBeams({ audio, preset }: LaserBeamsProps) {
  const frame = useCurrentFrame();
  const look = PRESET_LOOK[preset];

  if (look.mood === "cinematic") {
    return null;
  }

  const beamCount = look.mood === "festival" ? 14 : look.mood === "club" ? 10 : 7;

  return (
    <>
      {Array.from({ length: beamCount }).map((_, index) => {
        const seed = index * 43.17;
        const baseRotation = -38 + random(seed) * 76;
        const movement = Math.sin(frame / (24 + index * 2.5)) * (9 + audio.energy * 12);
        const top = 110 + random(seed + 3) * 1080;
        const color =
          index % 3 === 0 ? look.primary : index % 3 === 1 ? look.secondary : look.accent;

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: -280,
              top,
              width: 1680,
              height: 1.6 + random(seed + 5) * 3.8,
              background: `linear-gradient(to right, transparent 0%, rgba(${color}, ${
                0.1 + audio.energy * 0.28
              }) 48%, transparent 100%)`,
              filter: `blur(${0.8 + audio.high * 3.4}px)`,
              opacity: 0.06 + audio.energy * 0.28,
              transform: `rotate(${baseRotation + movement}deg) translateX(${
                Math.sin(frame / 44 + seed) * 100
              }px)`,
              transformOrigin: "center",
              mixBlendMode: "screen",
              pointerEvents: "none",
            }}
          />
        );
      })}
    </>
  );
}
