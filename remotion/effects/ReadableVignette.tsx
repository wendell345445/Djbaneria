import { AbsoluteFill } from "remotion";
import { PRESET_LOOK, type AudioEnergy, type MotionPreset } from "../presets/motion-presets";

type ReadableVignetteProps = {
  audio: AudioEnergy;
  preset: MotionPreset;
};

export function ReadableVignette({ audio, preset }: ReadableVignetteProps) {
  const look = PRESET_LOOK[preset];

  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at center, transparent 58%, rgba(0,0,0,0.12) 82%, rgba(0,0,0,0.3) 100%)",
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.08), transparent 18%, transparent 80%, rgba(0,0,0,0.08))",
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 24%, rgba(${look.primary}, ${
            0.035 + audio.energy * 0.055
          }), transparent 38%)`,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
    </>
  );
}
