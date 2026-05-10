import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import {
  AbsoluteFill,
  Html5Audio,
  Img,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { PremiumCapCutTransitions } from "../effects/PremiumCapCutTransitions";

type MotionPreset =
  | "NEON_PULSE"
  | "CLUB_FLASH"
  | "CINEMATIC_ZOOM"
  | "FESTIVAL_LIGHTS"
  | "DARK_TECHNO_GLITCH";

type TransitionVariant =
  | "AUTO"
  | "ROTATE_ZOOM"
  | "WHIP_ZOOM"
  | "SPIN_BLUR"
  | "FLASH_CUT"
  | "GLITCH_ZOOM"
  | "VIRAL_SHAKE";

type BannerFormat = "POST_FEED" | "STORY" | "SQUARE" | "FLYER";

type MotionFlyerProps = {
  imageUrl: string;
  audioUrl?: string;
  preset: MotionPreset;
  transitionVariant?: TransitionVariant;
  format?: BannerFormat;
  durationSeconds: number;
};

type AudioEnergy = {
  bass: number;
  mid: number;
  high: number;
  energy: number;
  peak: number;
};

const PRESET_LOOK: Record<
  MotionPreset,
  {
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
    mood: "neon" | "club" | "cinematic" | "festival" | "glitch";
  }
> = {
  NEON_PULSE: {
    primary: "34, 211, 238",
    secondary: "168, 85, 247",
    accent: "236, 72, 153",
    bg: "#05040c",
    mood: "neon",
  },
  CLUB_FLASH: {
    primary: "255, 255, 255",
    secondary: "59, 130, 246",
    accent: "236, 72, 153",
    bg: "#03030a",
    mood: "club",
  },
  CINEMATIC_ZOOM: {
    primary: "245, 158, 11",
    secondary: "168, 85, 247",
    accent: "255, 255, 255",
    bg: "#07040d",
    mood: "cinematic",
  },
  FESTIVAL_LIGHTS: {
    primary: "45, 212, 191",
    secondary: "59, 130, 246",
    accent: "244, 114, 182",
    bg: "#040716",
    mood: "festival",
  },
  DARK_TECHNO_GLITCH: {
    primary: "34, 211, 238",
    secondary: "239, 68, 68",
    accent: "255, 255, 255",
    bg: "#020202",
    mood: "glitch",
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function avg(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function useAudioEnergy(audioUrl: string): AudioEnergy {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audioData = useAudioData(audioUrl);

  if (!audioData) {
    return {
      bass: 0,
      mid: 0,
      high: 0,
      energy: 0,
      peak: 0,
    };
  }

  const spectrum = visualizeAudio({
    fps,
    frame,
    audioData,
    numberOfSamples: 128,
    optimizeFor: "speed",
  });

  const bass = clamp(avg(spectrum.slice(0, 14)) * 3.8, 0, 1);
  const mid = clamp(avg(spectrum.slice(14, 56)) * 2.9, 0, 1);
  const high = clamp(avg(spectrum.slice(56, 128)) * 3.1, 0, 1);
  const energy = clamp(bass * 0.5 + mid * 0.3 + high * 0.2, 0, 1);
  const peak = bass > 0.72 || energy > 0.68 ? 1 : 0;

  return {
    bass,
    mid,
    high,
    energy,
    peak,
  };
}

function MotionFlyerWithAudio({
  imageUrl,
  audioUrl,
  preset,
  durationSeconds,
}: MotionFlyerProps & { audioUrl: string }) {
  const audio = useAudioEnergy(audioUrl);

  return (
    <MotionFlyerScene
      imageUrl={imageUrl}
      audioUrl={audioUrl}
      preset={preset}
      durationSeconds={durationSeconds}
      audio={audio}
    />
  );
}

function AmbientParticles({
  audio,
  preset,
}: {
  audio: AudioEnergy;
  preset: MotionPreset;
}) {
  const frame = useCurrentFrame();
  const look = PRESET_LOOK[preset];

  const particleCount =
    look.mood === "festival" ? 64 : look.mood === "cinematic" ? 28 : 44;

  return (
    <>
      {Array.from({ length: particleCount }).map((_, index) => {
        const seed = index * 19.31;
        const x = random(seed) * 1024;
        const startY = random(seed + 8) * 1536;
        const drift = random(seed + 13) * 22 - 11;
        const speed = 0.32 + random(seed + 21) * 1.55 + audio.energy * 1;
        const size = 1.2 + random(seed + 34) * 4.3;
        const y = (startY - frame * speed) % 1536;
        const opacity = 0.06 + audio.energy * 0.28 + random(seed + 55) * 0.1;

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
              background: `rgba(${look.primary}, ${0.55 + audio.high * 0.25})`,
              boxShadow: `0 0 ${7 + audio.energy * 18}px rgba(${look.primary}, 0.78)`,
              opacity,
              transform: `scale(${0.72 + audio.energy * 1.05})`,
              mixBlendMode: "screen",
            }}
          />
        );
      })}
    </>
  );
}

function EdgeLightSystem({
  audio,
  preset,
}: {
  audio: AudioEnergy;
  preset: MotionPreset;
}) {
  const frame = useCurrentFrame();
  const look = PRESET_LOOK[preset];

  const edgeOpacity = 0.2 + audio.energy * 0.46;
  const blur = 32 + audio.bass * 70;

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: -80,
          left: 0,
          right: 0,
          height: 210,
          background: `linear-gradient(to bottom, rgba(${look.primary}, 0.78), rgba(${look.secondary}, 0.34), transparent)`,
          filter: `blur(${blur}px)`,
          opacity: edgeOpacity,
          mixBlendMode: "screen",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: -100,
          left: 0,
          right: 0,
          height: 230,
          background: `linear-gradient(to top, rgba(${look.accent}, 0.62), rgba(${look.secondary}, 0.22), transparent)`,
          filter: `blur(${blur + 14}px)`,
          opacity: 0.16 + audio.bass * 0.36,
          mixBlendMode: "screen",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: -85,
          width: 200,
          background: `linear-gradient(to right, rgba(${look.secondary}, 0.68), transparent)`,
          filter: `blur(${50 + audio.mid * 64}px)`,
          opacity: 0.18 + audio.mid * 0.38,
          mixBlendMode: "screen",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: -85,
          width: 200,
          background: `linear-gradient(to left, rgba(${look.primary}, 0.7), transparent)`,
          filter: `blur(${50 + audio.high * 60}px)`,
          opacity: 0.18 + audio.high * 0.38,
          mixBlendMode: "screen",
        }}
      />

      <AbsoluteFill
        style={{
          background: `linear-gradient(112deg, transparent 0%, rgba(255,255,255,0) 37%, rgba(255,255,255,${
            0.1 + audio.high * 0.13
          }) 48%, rgba(${look.primary}, ${
            0.05 + audio.mid * 0.1
          }) 55%, transparent 68%)`,
          opacity: 0.32,
          transform: `translateX(${interpolate(
            frame % 132,
            [0, 132],
            [-1500, 1500]
          )}px) rotate(7deg)`,
          mixBlendMode: "screen",
        }}
      />
    </>
  );
}

function LaserBeams({
  audio,
  preset,
}: {
  audio: AudioEnergy;
  preset: MotionPreset;
}) {
  const frame = useCurrentFrame();
  const look = PRESET_LOOK[preset];

  if (look.mood === "cinematic") {
    return null;
  }

  return (
    <>
      {Array.from({ length: look.mood === "festival" ? 8 : 5 }).map(
        (_, index) => {
          const seed = index * 41;
          const baseRotation = -32 + random(seed) * 64;
          const movement = Math.sin(frame / (30 + index * 3)) * 7;
          const top = 160 + random(seed + 3) * 820;

          return (
            <div
              key={index}
              style={{
                position: "absolute",
                left: -220,
                top,
                width: 1500,
                height: 1.5 + random(seed + 5) * 2.8,
                background: `linear-gradient(to right, transparent, rgba(${
                  index % 2 === 0 ? look.primary : look.secondary
                }, ${0.1 + audio.energy * 0.2}), transparent)`,
                filter: `blur(${1 + audio.high * 3}px)`,
                opacity: 0.05 + audio.energy * 0.25,
                transform: `rotate(${baseRotation + movement}deg) translateX(${
                  Math.sin(frame / 48 + seed) * 80
                }px)`,
                transformOrigin: "center",
                mixBlendMode: "screen",
              }}
            />
          );
        }
      )}
    </>
  );
}

function CinematicOverlays({
  audio,
  preset,
}: {
  audio: AudioEnergy;
  preset: MotionPreset;
}) {
  const frame = useCurrentFrame();
  const look = PRESET_LOOK[preset];

  const flashOpacity =
    audio.peak > 0 && frame % 14 < 2 ? 0.06 + audio.bass * 0.1 : 0;

  const scanlineOpacity =
    look.mood === "glitch" ? 0.06 + audio.energy * 0.06 : 0.012;

  return (
    <>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at center, transparent 58%, rgba(0,0,0,0.16) 82%, rgba(0,0,0,0.34) 100%)",
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.1), transparent 18%, transparent 76%, rgba(0,0,0,0.16))",
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill
        style={{
          background: `repeating-linear-gradient(
            to bottom,
            rgba(255,255,255,${scanlineOpacity}) 0px,
            rgba(255,255,255,${scanlineOpacity}) 1px,
            transparent 1px,
            transparent 5px
          )`,
          opacity: look.mood === "glitch" ? 0.28 : 0.08,
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${
            50 + Math.sin(frame / 46) * 24
          }% ${34 + Math.cos(frame / 61) * 18}%, rgba(${look.primary}, ${
            0.05 + audio.energy * 0.08
          }), transparent 38%)`,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      <AbsoluteFill
        style={{
          background: "white",
          opacity: flashOpacity,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
    </>
  );
}

function FilmGrain({ audio }: { audio: AudioEnergy }) {
  const frame = useCurrentFrame();

  return (
    <>
      {Array.from({ length: 70 }).map((_, index) => {
        const seed = index * 9.7 + frame * 0.13;
        const x = random(seed) * 1024;
        const y = random(seed + 4) * 1536;
        const opacity = 0.015 + audio.energy * 0.018;

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

function FlyerFallback() {
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
        padding: 80,
        background:
          "radial-gradient(circle at top, #1e1b4b 0%, #080711 48%, #020202 100%)",
      }}
    >
      <div
        style={{
          fontSize: 78,
          fontWeight: 900,
          lineHeight: 0.95,
          letterSpacing: -3,
          textTransform: "uppercase",
        }}
      >
        Motion Flyer
      </div>

      <div
        style={{
          marginTop: 28,
          fontSize: 30,
          opacity: 0.72,
          lineHeight: 1.35,
        }}
      >
        Envie imageUrl e audioUrl para renderizar com um flyer real.
      </div>
    </AbsoluteFill>
  );
}

function MotionFlyerScene({
  imageUrl,
  audioUrl = "",
  preset,
  transitionVariant = "AUTO",
  audio,
}: MotionFlyerProps & { audio: AudioEnergy }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const look = PRESET_LOOK[preset];

  const intro = spring({
    frame,
    fps,
    config: {
      damping: 120,
      stiffness: 80,
      mass: 0.9,
    },
  });

  const slowZoom = interpolate(frame, [0, durationInFrames], [1, 1.055], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const introScale = interpolate(intro, [0, 1], [1.1, 1]);

  const beatScale = 1 + audio.bass * 0.022;
  const microFloatX = Math.sin(frame / 58) * 3.5;
  const microFloatY = Math.cos(frame / 72) * 3;

  const strongHit = audio.peak > 0 && frame % 18 < 3;

  const cameraShake =
    strongHit && preset !== "CINEMATIC_ZOOM"
      ? Math.sin(frame * 2.8) * (2.5 + audio.bass * 5)
      : 0;

  const glitch =
    preset === "DARK_TECHNO_GLITCH" && (frame % 43 < 3 || audio.bass > 0.84)
      ? Math.sin(frame * 4.2) * (6 + audio.energy * 12)
      : 0;

  const fadeIn = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 24, durationInFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const opacity = fadeIn * fadeOut;

  const mainTransform = `
    translateX(${microFloatX + cameraShake + glitch}px)
    translateY(${microFloatY}px)
    scale(${introScale * slowZoom * beatScale})
  `;

  const imageFilter =
    preset === "DARK_TECHNO_GLITCH"
      ? `contrast(${1.06 + audio.energy * 0.12}) saturate(${
          1.1 + audio.energy * 0.3
        }) brightness(${1.04 + audio.bass * 0.04}) hue-rotate(${glitch * 1.2}deg)`
      : `contrast(${1.02 + audio.energy * 0.06}) saturate(${
          1.08 + audio.energy * 0.2
        }) brightness(${1.05 + audio.bass * 0.05})`;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 18%, rgba(${look.secondary}, 0.18), transparent 34%), ${look.bg}`,
        overflow: "hidden",
      }}
    >
      {audioUrl ? <Html5Audio src={audioUrl} volume={1} /> : null}

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
              transform: `scale(${1.18 + audio.energy * 0.06})`,
              filter: `blur(${18 + audio.energy * 6}px) brightness(0.68) saturate(1.25)`,
              opacity: 0.45,
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
              opacity: 0.1 + audio.energy * 0.06,
              transform: `translateX(${glitch * -1.2}px) scale(${
                introScale * slowZoom * 1.012
              })`,
              filter: "blur(1.2px) saturate(1.45) hue-rotate(12deg)",
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
              opacity,
              transform: mainTransform,
              filter: imageFilter,
              willChange: "transform, filter",
            }}
          />
        </>
      ) : (
        <FlyerFallback />
      )}

      {imageUrl ? (
        <PremiumCapCutTransitions
          imageUrl={imageUrl}
          cutFrames={[
            0,
            Math.round(durationInFrames * 0.24),
            Math.round(durationInFrames * 0.48),
            Math.round(durationInFrames * 0.72),
            Math.max(durationInFrames - 30, 0),
          ]}
          durationInFrames={16}
          variant={transitionVariant}
          primaryRgb={look.primary}
          secondaryRgb={look.secondary}
          accentRgb={look.accent}
          bass={audio.bass}
          energy={audio.energy}
          peak={audio.peak}
          intensity={preset === "FESTIVAL_LIGHTS" ? 1.18 : 0.95}
        />
      ) : null}

      <LaserBeams audio={audio} preset={preset} />
      <AmbientParticles audio={audio} preset={preset} />
      <EdgeLightSystem audio={audio} preset={preset} />
      <CinematicOverlays audio={audio} preset={preset} />
      <FilmGrain audio={audio} />
    </AbsoluteFill>
  );
}

export function MotionFlyer(props: MotionFlyerProps) {
  if (props.audioUrl) {
    return <MotionFlyerWithAudio {...props} audioUrl={props.audioUrl} />;
  }

  return (
    <MotionFlyerScene
      {...props}
      audio={{
        bass: 0.25,
        mid: 0.18,
        high: 0.16,
        energy: 0.2,
        peak: 0,
      }}
    />
  );
}
