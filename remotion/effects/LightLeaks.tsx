import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { PRESET_LOOK, type AudioEnergy, type MotionPreset } from "../presets/motion-presets";

type LightLeaksProps = {
  audio: AudioEnergy;
  preset: MotionPreset;
};

export function LightLeaks({ audio, preset }: LightLeaksProps) {
  const frame = useCurrentFrame();
  const look = PRESET_LOOK[preset];

  const leakX = 50 + Math.sin(frame / 54) * 28;
  const leakY = 30 + Math.cos(frame / 71) * 18;

  return (
    <>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${leakX}% ${leakY}%, rgba(${look.warm}, ${
            0.08 + audio.energy * 0.13
          }), transparent 34%)`,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${34 + Math.sin(frame / 83) * 22}% ${
            72 + Math.cos(frame / 97) * 10
          }%, rgba(${look.accent}, ${0.06 + audio.high * 0.12}), transparent 32%)`,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill
        style={{
          background: `linear-gradient(105deg, transparent 0%, transparent 42%, rgba(${look.primary}, ${
            0.08 + audio.mid * 0.1
          }) 49%, rgba(255,255,255,${0.06 + audio.high * 0.08}) 52%, transparent 62%)`,
          transform: `translateX(${interpolate(frame % 160, [0, 160], [-1600, 1600])}px) rotate(4deg)`,
          opacity: 0.55,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
    </>
  );
}
