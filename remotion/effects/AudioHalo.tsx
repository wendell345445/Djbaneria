import { AbsoluteFill, useCurrentFrame } from "remotion";
import { PRESET_LOOK, type AudioEnergy, type MotionPreset } from "../presets/motion-presets";

type AudioHaloProps = {
  audio: AudioEnergy;
  preset: MotionPreset;
};

export function AudioHalo({ audio, preset }: AudioHaloProps) {
  const frame = useCurrentFrame();
  const look = PRESET_LOOK[preset];

  return (
    <>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at center, transparent 0%, transparent ${
            30 + audio.bass * 8
          }%, rgba(${look.primary}, ${0.06 + audio.bass * 0.18}) ${
            43 + audio.bass * 10
          }%, transparent ${58 + audio.bass * 8}%)`,
          transform: `rotate(${Math.sin(frame / 80) * 8}deg) scale(${0.95 + audio.bass * 0.1})`,
          opacity: 0.45 + audio.energy * 0.3,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at center, transparent 0%, transparent ${
            44 + audio.mid * 8
          }%, rgba(${look.accent}, ${0.04 + audio.mid * 0.12}) ${
            54 + audio.mid * 8
          }%, transparent ${68 + audio.mid * 6}%)`,
          transform: `scale(${1 + audio.mid * 0.08})`,
          opacity: 0.35 + audio.mid * 0.28,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
    </>
  );
}
