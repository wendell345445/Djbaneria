import { random, useCurrentFrame } from "remotion";
import { type AudioEnergy } from "../presets/motion-presets";

type FilmGrainProps = {
  audio: AudioEnergy;
};

export function FilmGrain({ audio }: FilmGrainProps) {
  const frame = useCurrentFrame();

  return (
    <>
      {Array.from({ length: 72 }).map((_, index) => {
        const seed = index * 9.7 + frame * 0.13;
        const x = random(seed) * 1024;
        const y = random(seed + 4) * 1536;
        const opacity = 0.016 + audio.energy * 0.018;

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 1.2,
              height: 1.2,
              background: "rgba(255,255,255,0.7)",
              opacity,
              pointerEvents: "none",
            }}
          />
        );
      })}
    </>
  );
}
