import { AbsoluteFill, useCurrentFrame } from "remotion";
import { PRESET_LOOK, type AudioEnergy, type MotionPreset } from "../presets/motion-presets";

type BeatImpactProps = {
  audio: AudioEnergy;
  preset: MotionPreset;
};

export function BeatImpact({ audio, preset }: BeatImpactProps) {
  const frame = useCurrentFrame();
  const look = PRESET_LOOK[preset];

  const isShortHit = audio.peak > 0 && frame % 18 < 2;
  const flashOpacity = isShortHit ? 0.07 + audio.bass * 0.13 : 0;

  return (
    <>
      <AbsoluteFill
        style={{
          background: "white",
          opacity: flashOpacity,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at center, rgba(${look.primary}, ${
            0.1 + audio.bass * 0.22
          }), transparent 34%)`,
          transform: `scale(${1 + audio.bass * 0.08})`,
          opacity: 0.18 + audio.bass * 0.3,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at center, transparent 54%, rgba(${look.accent}, ${
            0.06 + audio.bass * 0.2
          }) 68%, transparent 82%)`,
          transform: `scale(${0.94 + audio.bass * 0.16})`,
          opacity: 0.28 + audio.bass * 0.44,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
    </>
  );
}
