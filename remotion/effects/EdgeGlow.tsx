import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { PRESET_LOOK, type AudioEnergy, type MotionPreset } from "../presets/motion-presets";

type EdgeGlowProps = {
  audio: AudioEnergy;
  preset: MotionPreset;
};

export function EdgeGlow({ audio, preset }: EdgeGlowProps) {
  const frame = useCurrentFrame();
  const look = PRESET_LOOK[preset];

  const blur = 34 + audio.bass * 76;
  const edgeOpacity = 0.22 + audio.energy * 0.46;

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: -88,
          left: 0,
          right: 0,
          height: 230,
          background: `linear-gradient(to bottom, rgba(${look.primary}, 0.9), rgba(${look.secondary}, 0.42), transparent)`,
          filter: `blur(${blur}px)`,
          opacity: edgeOpacity,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: -110,
          left: 0,
          right: 0,
          height: 260,
          background: `linear-gradient(to top, rgba(${look.accent}, 0.82), rgba(${look.secondary}, 0.22), transparent)`,
          filter: `blur(${blur + 20}px)`,
          opacity: 0.16 + audio.bass * 0.38,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: -95,
          width: 220,
          background: `linear-gradient(to right, rgba(${look.secondary}, 0.8), transparent)`,
          filter: `blur(${54 + audio.mid * 64}px)`,
          opacity: 0.18 + audio.mid * 0.38,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: -95,
          width: 220,
          background: `linear-gradient(to left, rgba(${look.primary}, 0.78), transparent)`,
          filter: `blur(${54 + audio.high * 64}px)`,
          opacity: 0.18 + audio.high * 0.38,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill
        style={{
          background: `linear-gradient(112deg, transparent 0%, rgba(255,255,255,0) 37%, rgba(255,255,255,${
            0.1 + audio.high * 0.16
          }) 48%, rgba(${look.primary}, ${0.06 + audio.mid * 0.12}) 56%, transparent 68%)`,
          opacity: 0.35,
          transform: `translateX(${interpolate(frame % 140, [0, 140], [-1500, 1500])}px) rotate(7deg)`,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
    </>
  );
}
