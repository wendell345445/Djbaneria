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
import {
  PremiumCapCutTransitions,
  type PremiumTransitionVariant,
} from "../effects/PremiumCapCutTransitions";

export type MotionPreset =
  | "NEON_PULSE"
  | "CLUB_FLASH"
  | "CINEMATIC_ZOOM"
  | "FESTIVAL_LIGHTS"
  | "DARK_TECHNO_GLITCH"
  | "FESTIVAL_DROP_PRO"
  | "VIRAL_REELS_CUT"
  | "DARK_TECHNO_RGB"
  | "LUXURY_GOLD_CLUB"
  | "CYBER_RAVE";

type MotionFlyerProps = {
  imageUrl: string;
  audioUrl?: string;
  preset: MotionPreset;
  transitionVariant?: PremiumTransitionVariant;
  format?: "POST_FEED" | "STORY" | "SQUARE" | "FLYER";
  durationSeconds: number;
};

type AudioEnergy = {
  bass: number;
  mid: number;
  high: number;
  energy: number;
  peak: number;
};

type Look = {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  mood: "neon" | "club" | "cinematic" | "festival" | "glitch" | "gold" | "viral" | "cyber";
  transition: PremiumTransitionVariant;
  cutDensity: number;
  grain: number;
};

const PRESET_LOOK: Record<MotionPreset, Look> = {
  NEON_PULSE: {
    primary: "34, 211, 238",
    secondary: "168, 85, 247",
    accent: "236, 72, 153",
    bg: "#05040c",
    mood: "neon",
    transition: "GLITCH_ZOOM",
    cutDensity: 4,
    grain: 0.16,
  },
  CLUB_FLASH: {
    primary: "255, 255, 255",
    secondary: "59, 130, 246",
    accent: "236, 72, 153",
    bg: "#03030a",
    mood: "club",
    transition: "FLASH_CUT",
    cutDensity: 5,
    grain: 0.14,
  },
  CINEMATIC_ZOOM: {
    primary: "245, 158, 11",
    secondary: "168, 85, 247",
    accent: "255, 255, 255",
    bg: "#07040d",
    mood: "cinematic",
    transition: "WHIP_ZOOM",
    cutDensity: 3,
    grain: 0.12,
  },
  FESTIVAL_LIGHTS: {
    primary: "45, 212, 191",
    secondary: "59, 130, 246",
    accent: "244, 114, 182",
    bg: "#040716",
    mood: "festival",
    transition: "ROTATE_ZOOM",
    cutDensity: 5,
    grain: 0.13,
  },
  DARK_TECHNO_GLITCH: {
    primary: "34, 211, 238",
    secondary: "239, 68, 68",
    accent: "255, 255, 255",
    bg: "#020202",
    mood: "glitch",
    transition: "GLITCH_ZOOM",
    cutDensity: 5,
    grain: 0.18,
  },
  FESTIVAL_DROP_PRO: {
    primary: "56, 189, 248",
    secondary: "217, 70, 239",
    accent: "250, 204, 21",
    bg: "#020616",
    mood: "festival",
    transition: "ROTATE_ZOOM",
    cutDensity: 6,
    grain: 0.13,
  },
  VIRAL_REELS_CUT: {
    primary: "125, 211, 252",
    secondary: "248, 113, 113",
    accent: "255, 255, 255",
    bg: "#020611",
    mood: "viral",
    transition: "VIRAL_SHAKE",
    cutDensity: 7,
    grain: 0.15,
  },
  DARK_TECHNO_RGB: {
    primary: "34, 211, 238",
    secondary: "239, 68, 68",
    accent: "168, 85, 247",
    bg: "#010101",
    mood: "glitch",
    transition: "GLITCH_ZOOM",
    cutDensity: 6,
    grain: 0.2,
  },
  LUXURY_GOLD_CLUB: {
    primary: "250, 204, 21",
    secondary: "245, 158, 11",
    accent: "255, 255, 255",
    bg: "#080505",
    mood: "gold",
    transition: "SPIN_BLUR",
    cutDensity: 3,
    grain: 0.12,
  },
  CYBER_RAVE: {
    primary: "34, 211, 238",
    secondary: "217, 70, 239",
    accent: "96, 165, 250",
    bg: "#04010a",
    mood: "cyber",
    transition: "AUTO",
    cutDensity: 6,
    grain: 0.17,
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
    return { bass: 0, mid: 0, high: 0, energy: 0, peak: 0 };
  }

  const spectrum = visualizeAudio({
    fps,
    frame,
    audioData,
    numberOfSamples: 128,
    optimizeFor: "speed",
  });

  const bass = clamp(avg(spectrum.slice(0, 16)) * 3.9, 0, 1);
  const mid = clamp(avg(spectrum.slice(16, 64)) * 3.1, 0, 1);
  const high = clamp(avg(spectrum.slice(64, 128)) * 3.3, 0, 1);
  const energy = clamp(bass * 0.5 + mid * 0.3 + high * 0.2, 0, 1);
  const peak = bass > 0.74 || energy > 0.7 ? 1 : 0;

  return { bass, mid, high, energy, peak };
}

function sceneProgress(value: number) {
  if (value < 0.18) return 0;
  if (value < 0.36) return 1;
  if (value < 0.64) return 2;
  if (value < 0.86) return 3;
  return 4;
}

function buildCutFrames(durationInFrames: number, density: number) {
  const cuts = [0];
  const step = Math.max(18, Math.floor(durationInFrames / density));

  for (let frame = step; frame < durationInFrames - 24; frame += step) {
    cuts.push(frame);
  }

  return Array.from(new Set(cuts));
}

function MotionFlyerWithAudio(props: MotionFlyerProps & { audioUrl: string }) {
  const audio = useAudioEnergy(props.audioUrl);
  return <MotionFlyerScene {...props} audio={audio} />;
}

function BackgroundPlate({ imageUrl, look, audio }: { imageUrl: string; look: Look; audio: AudioEnergy }) {
  const frame = useCurrentFrame();
  const breath = 1.06 + Math.sin(frame / 30) * 0.015 + audio.energy * 0.03;
  const hue = look.mood === "gold" ? 8 : look.mood === "cyber" ? 14 : 0;

  return (
    <>
      <Img
        src={imageUrl}
        style={{
          position: "absolute",
          inset: -90,
          width: "calc(100% + 180px)",
          height: "calc(100% + 180px)",
          objectFit: "cover",
          transform: `scale(${breath}) translateY(${Math.sin(frame / 55) * 8}px)`,
          filter: `blur(${30 + audio.energy * 16}px) saturate(1.25) brightness(0.52) hue-rotate(${hue}deg)`,
          opacity: 0.92,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 35%, rgba(${look.primary}, ${0.18 + audio.mid * 0.08}), transparent 58%),
          radial-gradient(circle at 78% 18%, rgba(${look.secondary}, 0.18), transparent 34%),
          linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.28) 38%, rgba(0,0,0,0.40) 100%)`,
        }}
      />
    </>
  );
}

function PremiumLightLeaks({ look, audio }: { look: Look; audio: AudioEnergy }) {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => {
        const opacity = 0.08 + audio.energy * 0.18;
        const rotate = index === 0 ? -18 : index === 1 ? 12 : 28;
        const left = index === 0 ? -180 : index === 1 ? 240 : 620;
        const top = index === 0 ? -120 : index === 1 ? 480 : 920;
        const pulse = 1 + Math.sin(frame / (18 + index * 7)) * 0.03;
        const color = index % 2 === 0 ? look.primary : look.accent;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left,
              top,
              width: 420,
              height: 980,
              borderRadius: 999,
              background: `linear-gradient(180deg, rgba(${color}, 0.42), rgba(${look.secondary}, 0.10), transparent)`,
              filter: `blur(${65 + index * 12}px)`,
              opacity,
              transform: `rotate(${rotate}deg) scale(${pulse})`,
              mixBlendMode: "screen",
            }}
          />
        );
      })}
    </>
  );
}

function StageLasersPro({ look, audio }: { look: Look; audio: AudioEnergy }) {
  const frame = useCurrentFrame();
  const count = look.mood === "festival" || look.mood === "viral" || look.mood === "cyber" ? 7 : 4;
  return (
    <>
      {Array.from({ length: count }).map((_, index) => {
        const seed = index * 10.31;
        const swing = Math.sin(frame / (15 + index * 2) + seed) * (18 + audio.mid * 22);
        const left = -120 + index * 170 + swing;
        const top = 40 + (index % 3) * 180;
        const height = 980 + random(seed + 1) * 280;
        const width = 4 + random(seed + 2) * 5 + audio.energy * 4;
        const color = index % 2 === 0 ? look.primary : look.secondary;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left,
              top,
              width,
              height,
              borderRadius: 999,
              background: `linear-gradient(180deg, rgba(${color}, 0), rgba(${color}, 0.90), rgba(${look.accent}, 0))`,
              transform: `rotate(${-40 + index * 13}deg)`,
              filter: `blur(${4 + audio.energy * 4}px)`,
              opacity: 0.25 + audio.bass * 0.5,
              mixBlendMode: "screen",
            }}
          />
        );
      })}
    </>
  );
}

function AmbientParticles({ look, audio }: { look: Look; audio: AudioEnergy }) {
  const frame = useCurrentFrame();
  const count = look.mood === "festival" || look.mood === "viral" ? 72 : look.mood === "gold" ? 34 : 48;
  return (
    <>
      {Array.from({ length: count }).map((_, index) => {
        const seed = index * 17.7;
        const x = random(seed) * 1024;
        const startY = random(seed + 1) * 1536;
        const speed = 0.35 + random(seed + 2) * 1.6 + audio.energy * 0.8;
        const size = look.mood === "gold" ? 2 + random(seed + 4) * 6 : 1 + random(seed + 4) * 4;
        const y = (startY - frame * speed) % 1536;
        const color = look.mood === "gold" ? look.primary : index % 3 === 0 ? look.primary : look.secondary;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x + Math.sin(frame / 40 + seed) * 10,
              top: y < 0 ? y + 1536 : y,
              width: size,
              height: size,
              borderRadius: 999,
              background: `rgba(${color}, ${look.mood === "gold" ? 0.85 : 0.70})`,
              boxShadow: `0 0 ${8 + audio.high * 22}px rgba(${color}, 0.9)`,
              opacity: 0.12 + audio.energy * 0.28,
              mixBlendMode: "screen",
            }}
          />
        );
      })}
    </>
  );
}

function BeatImpactPro({ look, audio }: { look: Look; audio: AudioEnergy }) {
  const frame = useCurrentFrame();
  const impact = spring({
    fps: 30,
    frame,
    config: { damping: 12, stiffness: 180 },
  });
  const pulse = audio.peak ? 0.9 : audio.bass * 0.55;
  const opacity = pulse * 0.22;

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 50%, rgba(255,255,255, ${opacity}), transparent 40%)`,
          opacity: 0.35 + impact * 0.08,
          mixBlendMode: "screen",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          border: `${2 + pulse * 10}px solid rgba(${look.primary}, ${0.08 + pulse * 0.20})`,
          opacity: 0.25 + pulse * 0.5,
          boxShadow: `inset 0 0 ${45 + pulse * 70}px rgba(${look.secondary}, ${0.08 + pulse * 0.18})`,
        }}
      />
    </>
  );
}

function CinematicFinish({ look, audio }: { look: Look; audio: AudioEnergy }) {
  const frame = useCurrentFrame();
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 45%, transparent 48%, rgba(0,0,0,0.28) 78%, rgba(0,0,0,0.5) 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: look.grain,
          backgroundImage: `radial-gradient(rgba(255,255,255,0.35) 0.7px, transparent 0.8px)`,
          backgroundSize: `${2 + (frame % 2)}px ${2 + ((frame + 1) % 2)}px`,
          mixBlendMode: "overlay",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(105deg, transparent 34%, rgba(${look.accent}, ${0.04 + audio.high * 0.08}) 50%, transparent 66%)`,
          transform: `translateX(${Math.sin(frame / 36) * 18}px)`,
          mixBlendMode: "screen",
        }}
      />
    </>
  );
}

function MainFlyer({ imageUrl, look, audio, durationSeconds }: { imageUrl: string; look: Look; audio: AudioEnergy; durationSeconds: number }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const progress = frame / durationInFrames;
  const scene = sceneProgress(progress);

  const intro = spring({ fps, frame, config: { damping: 18, stiffness: 110 } });
  const punch = audio.peak ? 1 : audio.bass * 0.45;

  const sceneScale = scene === 0 ? 1.14 : scene === 1 ? 1.06 : scene === 2 ? 1.02 : scene === 3 ? 1.08 : 1.03;
  const moveX =
    (scene === 0 ? interpolate(progress, [0, 0.18], [28, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0) +
    Math.sin(frame / 48) * (6 + audio.mid * 8);
  const moveY =
    (scene === 4 ? interpolate(progress, [0.86, 1], [0, -24], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0) +
    Math.cos(frame / 55) * (6 + audio.energy * 10);
  const rotate = Math.sin(frame / 62) * (0.6 + audio.energy * 1.4) + (scene === 3 ? 0.7 : 0);
  const scale = sceneScale + intro * 0.02 + punch * 0.05;
  const shadowOpacity = 0.42 + audio.energy * 0.22;
  const bottomSafeLift = durationSeconds >= 12 ? -10 : 0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "84%",
          maxWidth: 820,
          aspectRatio: "1024 / 1536",
          transform: `translate3d(${moveX}px, ${moveY + bottomSafeLift}px, 0) rotate(${rotate}deg) scale(${scale})`,
          filter: `drop-shadow(0 34px 70px rgba(0,0,0,0.45)) drop-shadow(0 0 30px rgba(${look.primary}, ${shadowOpacity}))`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -20,
            borderRadius: 38,
            background: `linear-gradient(135deg, rgba(${look.primary}, 0.36), rgba(${look.secondary}, 0.14), rgba(${look.accent}, 0.24))`,
            filter: `blur(${18 + audio.energy * 16}px)`,
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            borderRadius: 36,
            border: `1.5px solid rgba(255,255,255,0.18)`,
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <Img
            src={imageUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(180deg, rgba(255,255,255,0.08), transparent 24%, transparent 68%, rgba(0,0,0,0.1) 100%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function MotionFlyerScene({
  imageUrl,
  audioUrl,
  preset,
  transitionVariant,
  durationSeconds,
  audio,
}: MotionFlyerProps & { audio: AudioEnergy }) {
  const { durationInFrames } = useVideoConfig();
  const look = PRESET_LOOK[preset] ?? PRESET_LOOK.NEON_PULSE;
  const cutFrames = buildCutFrames(durationInFrames, look.cutDensity);
  const activeTransition = transitionVariant || look.transition;

  return (
    <AbsoluteFill style={{ backgroundColor: look.bg, overflow: "hidden" }}>
      {audioUrl ? <Html5Audio src={audioUrl} /> : null}

      <BackgroundPlate imageUrl={imageUrl} look={look} audio={audio} />
      <PremiumLightLeaks look={look} audio={audio} />
      <StageLasersPro look={look} audio={audio} />
      <AmbientParticles look={look} audio={audio} />
      <MainFlyer imageUrl={imageUrl} look={look} audio={audio} durationSeconds={durationSeconds} />
      <BeatImpactPro look={look} audio={audio} />

      <PremiumCapCutTransitions
        imageUrl={imageUrl}
        cutFrames={cutFrames}
        durationInFrames={16}
        variant={activeTransition}
        primaryRgb={look.primary}
        secondaryRgb={look.secondary}
        accentRgb={look.accent}
        bass={audio.bass}
        energy={audio.energy}
        peak={audio.peak}
        intensity={1.15}
      />

      <CinematicFinish look={look} audio={audio} />
    </AbsoluteFill>
  );
}

export function MotionFlyer(props: MotionFlyerProps) {
  if (!props.audioUrl) {
    return (
      <MotionFlyerScene
        {...props}
        audio={{ bass: 0, mid: 0, high: 0, energy: 0, peak: 0 }}
      />
    );
  }

  return <MotionFlyerWithAudio {...props} audioUrl={props.audioUrl} />;
}

export default MotionFlyer;
