import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { useMemo } from "react";
import {
  AbsoluteFill,
  Html5Audio,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  PremiumCapCutTransitions,
  type PremiumTransitionVariant,
} from "../effects/PremiumCapCutTransitions";

export type MotionFlyerFormat = "POST_FEED" | "STORY" | "SQUARE" | "FLYER";

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
  transitionVariant?: PremiumTransitionVariant | string;
  format?: MotionFlyerFormat;
  width?: number;
  height?: number;
  durationSeconds: number;
};

type AudioEnergy = {
  bass: number;
  mid: number;
  high: number;
  energy: number;
  peak: number;
};

type AudioAnalysis = AudioEnergy & {
  transitionFrame: number | null;
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
    grain: 0.1,
  },
  CLUB_FLASH: {
    primary: "255, 255, 255",
    secondary: "59, 130, 246",
    accent: "236, 72, 153",
    bg: "#03030a",
    mood: "club",
    transition: "FLASH_CUT",
    cutDensity: 5,
    grain: 0.1,
  },
  CINEMATIC_ZOOM: {
    primary: "245, 158, 11",
    secondary: "168, 85, 247",
    accent: "255, 255, 255",
    bg: "#07040d",
    mood: "cinematic",
    transition: "WHIP_ZOOM",
    cutDensity: 3,
    grain: 0.08,
  },
  FESTIVAL_LIGHTS: {
    primary: "45, 212, 191",
    secondary: "59, 130, 246",
    accent: "244, 114, 182",
    bg: "#040716",
    mood: "festival",
    transition: "ROTATE_ZOOM",
    cutDensity: 5,
    grain: 0.09,
  },
  DARK_TECHNO_GLITCH: {
    primary: "34, 211, 238",
    secondary: "239, 68, 68",
    accent: "255, 255, 255",
    bg: "#020202",
    mood: "glitch",
    transition: "GLITCH_ZOOM",
    cutDensity: 5,
    grain: 0.14,
  },
  FESTIVAL_DROP_PRO: {
    primary: "56, 189, 248",
    secondary: "217, 70, 239",
    accent: "250, 204, 21",
    bg: "#020616",
    mood: "festival",
    transition: "ROTATE_ZOOM",
    cutDensity: 6,
    grain: 0.09,
  },
  VIRAL_REELS_CUT: {
    primary: "125, 211, 252",
    secondary: "248, 113, 113",
    accent: "255, 255, 255",
    bg: "#020611",
    mood: "viral",
    transition: "VIRAL_SHAKE",
    cutDensity: 7,
    grain: 0.1,
  },
  DARK_TECHNO_RGB: {
    primary: "34, 211, 238",
    secondary: "239, 68, 68",
    accent: "168, 85, 247",
    bg: "#010101",
    mood: "glitch",
    transition: "GLITCH_ZOOM",
    cutDensity: 6,
    grain: 0.14,
  },
  LUXURY_GOLD_CLUB: {
    primary: "250, 204, 21",
    secondary: "245, 158, 11",
    accent: "255, 255, 255",
    bg: "#080505",
    mood: "gold",
    transition: "SPIN_BLUR",
    cutDensity: 3,
    grain: 0.08,
  },
  CYBER_RAVE: {
    primary: "34, 211, 238",
    secondary: "217, 70, 239",
    accent: "96, 165, 250",
    bg: "#04010a",
    mood: "cyber",
    transition: "AUTO",
    cutDensity: 6,
    grain: 0.12,
  },
};


type PresetMotionProfile = {
  cameraZoom: number;
  cameraDriftX: number;
  cameraDriftY: number;
  beatZoom: number;
  beatRotate: number;
  glitch: number;
  smoke: number;
  particles: number;
  strobe: number;
  spotlight: number;
  equalizer: number;
};

const PRESET_MOTION_PROFILE: Record<MotionPreset, PresetMotionProfile> = {
  NEON_PULSE: {
    cameraZoom: 0.055,
    cameraDriftX: 3.2,
    cameraDriftY: 5.2,
    beatZoom: 0.026,
    beatRotate: 0.16,
    glitch: 0.18,
    smoke: 0.7,
    particles: 0.75,
    strobe: 0.42,
    spotlight: 0.85,
    equalizer: 0.8,
  },
  CLUB_FLASH: {
    cameraZoom: 0.052,
    cameraDriftX: 3.4,
    cameraDriftY: 4.8,
    beatZoom: 0.03,
    beatRotate: 0.18,
    glitch: 0.12,
    smoke: 0.55,
    particles: 0.7,
    strobe: 0.95,
    spotlight: 1.0,
    equalizer: 0.9,
  },
  CINEMATIC_ZOOM: {
    cameraZoom: 0.048,
    cameraDriftX: 2.2,
    cameraDriftY: 3.8,
    beatZoom: 0.02,
    beatRotate: 0.08,
    glitch: 0.04,
    smoke: 0.75,
    particles: 0.38,
    strobe: 0.2,
    spotlight: 0.55,
    equalizer: 0.28,
  },
  FESTIVAL_LIGHTS: {
    cameraZoom: 0.06,
    cameraDriftX: 3.8,
    cameraDriftY: 5.8,
    beatZoom: 0.032,
    beatRotate: 0.18,
    glitch: 0.1,
    smoke: 0.68,
    particles: 1.0,
    strobe: 0.58,
    spotlight: 1.15,
    equalizer: 0.72,
  },
  DARK_TECHNO_GLITCH: {
    cameraZoom: 0.046,
    cameraDriftX: 2.8,
    cameraDriftY: 4.2,
    beatZoom: 0.034,
    beatRotate: 0.3,
    glitch: 1.0,
    smoke: 0.46,
    particles: 0.68,
    strobe: 0.72,
    spotlight: 0.62,
    equalizer: 1.0,
  },
  FESTIVAL_DROP_PRO: {
    cameraZoom: 0.065,
    cameraDriftX: 4.0,
    cameraDriftY: 6.2,
    beatZoom: 0.035,
    beatRotate: 0.2,
    glitch: 0.12,
    smoke: 0.72,
    particles: 1.18,
    strobe: 0.56,
    spotlight: 1.2,
    equalizer: 0.8,
  },
  VIRAL_REELS_CUT: {
    cameraZoom: 0.07,
    cameraDriftX: 4.8,
    cameraDriftY: 5.4,
    beatZoom: 0.038,
    beatRotate: 0.34,
    glitch: 0.46,
    smoke: 0.38,
    particles: 0.86,
    strobe: 0.86,
    spotlight: 0.7,
    equalizer: 0.74,
  },
  DARK_TECHNO_RGB: {
    cameraZoom: 0.044,
    cameraDriftX: 3.0,
    cameraDriftY: 4.2,
    beatZoom: 0.036,
    beatRotate: 0.38,
    glitch: 1.28,
    smoke: 0.42,
    particles: 0.7,
    strobe: 0.78,
    spotlight: 0.58,
    equalizer: 1.1,
  },
  LUXURY_GOLD_CLUB: {
    cameraZoom: 0.042,
    cameraDriftX: 2.2,
    cameraDriftY: 3.4,
    beatZoom: 0.018,
    beatRotate: 0.06,
    glitch: 0.02,
    smoke: 0.78,
    particles: 0.5,
    strobe: 0.16,
    spotlight: 0.62,
    equalizer: 0.18,
  },
  CYBER_RAVE: {
    cameraZoom: 0.058,
    cameraDriftX: 3.8,
    cameraDriftY: 5.2,
    beatZoom: 0.032,
    beatRotate: 0.28,
    glitch: 0.92,
    smoke: 0.48,
    particles: 0.95,
    strobe: 0.72,
    spotlight: 0.9,
    equalizer: 1.0,
  },
};


function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function avg(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function normalizeTransition(value?: string): PremiumTransitionVariant | undefined {
  const allowed: PremiumTransitionVariant[] = [
    "AUTO",
    "ROTATE_ZOOM",
    "WHIP_ZOOM",
    "SPIN_BLUR",
    "FLASH_CUT",
    "GLITCH_ZOOM",
    "VIRAL_SHAKE",
    "WHIP_ZOOM_PRO",
    "SPIN_ZOOM_PRO",
    "WARP_PUSH_PRO",
  ];

  return allowed.includes(value as PremiumTransitionVariant)
    ? (value as PremiumTransitionVariant)
    : undefined;
}

function getAudioEnergyAtFrame({
  audioData,
  fps,
  frame,
}: {
  audioData: NonNullable<ReturnType<typeof useAudioData>>;
  fps: number;
  frame: number;
}): AudioEnergy {
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

function useAudioAnalysis(audioUrl: string): AudioAnalysis {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const audioData = useAudioData(audioUrl);

  const fallback = {
    bass: 0,
    mid: 0,
    high: 0,
    energy: 0,
    peak: 0,
    transitionFrame: null,
  };

  const transitionFrame = useMemo(() => {
    if (!audioData) return null;

    const transitionDuration = 42;
    const safeStart = Math.max(10, Math.round(fps * 0.65));
    const safeEnd = Math.max(safeStart + 1, durationInFrames - transitionDuration - 8);

    let bestFrame = Math.min(Math.round(durationInFrames * 0.45), safeEnd);
    let bestScore = -1;
    let previousEnergy = 0;

    // Scan the full audio clip and choose one strong beat/drop moment.
    // Step by 2 frames for performance while still being accurate enough for 30fps.
    for (let scanFrame = safeStart; scanFrame <= safeEnd; scanFrame += 2) {
      const energyAtFrame = getAudioEnergyAtFrame({
        audioData,
        fps,
        frame: scanFrame,
      });

      const energyRise = Math.max(0, energyAtFrame.energy - previousEnergy);
      const centerPreference =
        1 - Math.abs(scanFrame / durationInFrames - 0.52) * 0.34;

      const score =
        (energyAtFrame.bass * 0.58 +
          energyAtFrame.mid * 0.22 +
          energyAtFrame.high * 0.08 +
          energyRise * 0.75) *
        centerPreference;

      if (score > bestScore) {
        bestScore = score;
        bestFrame = scanFrame;
      }

      previousEnergy = energyAtFrame.energy;
    }

    return bestFrame;
  }, [audioData, durationInFrames, fps]);

  if (!audioData) return fallback;

  return {
    ...getAudioEnergyAtFrame({
      audioData,
      fps,
      frame,
    }),
    transitionFrame,
  };
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function getCameraTransitionProgress(
  frame: number,
  cutFrames: number[],
  durationInFrames: number,
) {
  let strongest = 0;

  for (const cutFrame of cutFrames) {
    const localFrame = frame - cutFrame;

    if (localFrame < 0 || localFrame > durationInFrames) continue;

    const progress = clamp(localFrame / durationInFrames, 0, 1);
    const windUp = progress < 0.16 ? -0.22 * easeInOutCubic(progress / 0.16) : 0;
    const zoomIn = progress <= 0.42 ? easeOutCubic(progress / 0.42) : 1;
    const hold = progress > 0.42 && progress < 0.58 ? 1 : 0;
    const settle = progress <= 0.58 ? 1 : 1 - easeInOutCubic((progress - 0.58) / 0.42);
    const cameraProgress = clamp(Math.max(hold, Math.min(zoomIn, settle)) + windUp, 0, 1);

    strongest = Math.max(strongest, cameraProgress);
  }

  return strongest;
}

function getCameraSpinProgress(
  frame: number,
  cutFrames: number[],
  durationInFrames: number,
) {
  let strongest = 0;

  for (const cutFrame of cutFrames) {
    const localFrame = frame - cutFrame;

    if (localFrame < 0 || localFrame > durationInFrames) continue;

    const progress = clamp(localFrame / durationInFrames, 0, 1);
    const spinProgress =
      progress < 0.14
        ? 0
        : progress < 0.72
          ? easeOutCubic((progress - 0.14) / 0.58)
          : 1;

    strongest = Math.max(strongest, spinProgress);
  }

  return strongest;
}

function getSpinZoomTransitionState(
  frame: number,
  cutFrames: number[],
  durationInFrames: number,
) {
  let spinProgress = 0;
  let zoomProgress = 0;
  let glowProgress = 0;
  let returnProgress = 0;
  let isActive = false;

  for (const cutFrame of cutFrames) {
    const localFrame = frame - cutFrame;

    if (localFrame < 0 || localFrame > durationInFrames) continue;

    isActive = true;
    const progress = clamp(localFrame / durationInFrames, 0, 1);

    // 0% → 72%: camera spins and pushes aggressively into the flyer.
    const spin =
      progress < 0.72
        ? easeOutCubic(progress / 0.72)
        : 1;

    // Zoom grows until the glow covers the whole screen.
    const zoomIn =
      progress < 0.72
        ? easeOutCubic(progress / 0.72)
        : 1;

    // Fast flash mask:
    // 60% → 70%: flash hits quickly
    // 70% → 78%: reset is hidden by the light burst
    // 78% → 90%: light fades fast
    const glow =
      progress < 0.60
        ? 0
        : progress < 0.70
          ? easeOutCubic((progress - 0.60) / 0.10)
          : progress < 0.78
            ? 1
            : 1 - easeInOutCubic((progress - 0.78) / 0.12);

    // Reset happens during the fast light burst.
    const returnBack =
      progress < 0.68
        ? 0
        : easeInOutCubic((progress - 0.68) / 0.22);

    spinProgress = Math.max(spinProgress, spin);
    zoomProgress = Math.max(zoomProgress, zoomIn * (1 - returnBack));
    glowProgress = Math.max(glowProgress, glow);
    returnProgress = Math.max(returnProgress, returnBack);
  }

  return {
    isActive,
    spinProgress,
    zoomProgress,
    glowProgress,
    returnProgress,
  };
}

function MotionFlyerWithAudio(props: MotionFlyerProps & { audioUrl: string }) {
  const audio = useAudioAnalysis(props.audioUrl);
  return <MotionFlyerScene {...props} audio={audio} />;
}

function SafeExactFlyer({
  imageUrl,
  look,
  audio,
  cutFrames,
  transitionVariant,
  profile,
}: {
  imageUrl: string;
  look: Look;
  audio: AudioEnergy;
  cutFrames: number[];
  transitionVariant: PremiumTransitionVariant | undefined;
  profile: PresetMotionProfile;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cameraTransition = getCameraTransitionProgress(frame, cutFrames, 42);
  const spinZoomState = getSpinZoomTransitionState(frame, cutFrames, 42);
  const cameraShake = cameraTransition * Math.sin(frame * 1.8) * 2.2;

  const spinDirection = -1;
  const spin360Rotate =
    transitionVariant === "SPIN_ZOOM_PRO"
      ? spinDirection * 360 * spinZoomState.spinProgress
      : cameraTransition * -1.85;

  const cameraZoom =
    transitionVariant === "SPIN_ZOOM_PRO"
      ? spinZoomState.zoomProgress * (0.72 + audio.bass * 0.05)
      : cameraTransition * (0.135 + audio.bass * 0.024);

  const subtle = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 80 },
  });

  const beatZoomStrength =
    audio.peak > 0
      ? 1
      : clamp((audio.bass - 0.28) * 3.4 + audio.energy * 0.35, 0, 1);

  const beatZoomPulse =
    beatZoomStrength * (profile.beatZoom + Math.sin(frame * 0.95) * profile.beatZoom * 0.18);

  const smoothCameraZoom =
    (Math.sin(frame / 58) * 0.5 + 0.5) * profile.cameraZoom;

  const smoothCameraDriftY =
    Math.sin(frame / 86) * profile.cameraDriftY;

  const smoothCameraDriftX =
    Math.cos(frame / 104) * profile.cameraDriftX;

  const beatRotatePulse =
    beatZoomStrength * Math.sin(frame * 0.58) * profile.beatRotate;

  const cameraRotate = spin360Rotate + cameraShake * 0.13 + beatRotatePulse;

  const spinBackgroundPush =
    transitionVariant === "SPIN_ZOOM_PRO" ? spinZoomState.zoomProgress : cameraTransition;

  const backgroundScale = 1.06 + audio.energy * 0.035 + spinBackgroundPush * 0.52 + beatZoomStrength * 0.026;
  const backgroundMoveX = Math.sin(frame / 70) * (10 + audio.mid * 8) + spinBackgroundPush * 22;
  const backgroundMoveY = Math.cos(frame / 74) * (10 + audio.energy * 8) - spinBackgroundPush * 18;

  // Main flyer stays safe by default. During the transition it performs a full camera move,
  // then returns cleanly to the exact original position.
  const mainScale =
    1 +
    smoothCameraZoom +
    subtle * 0.002 +
    audio.bass * 0.002 +
    cameraZoom +
    beatZoomPulse;
  const mainMoveX = Math.sin(frame / 90) * 1.0 + cameraShake + smoothCameraDriftX;
  const mainMoveY =
    Math.cos(frame / 92) * 1.0 +
    smoothCameraDriftY -
    (transitionVariant === "SPIN_ZOOM_PRO" ? spinZoomState.zoomProgress * 14 : cameraTransition * 9);

  return (
    <AbsoluteFill style={{ backgroundColor: look.bg, overflow: "hidden" }}>
      <Img
        src={imageUrl}
        style={{
          position: "absolute",
          inset: "-7%",
          width: "114%",
          height: "114%",
          objectFit: "cover",
          transform: `translate3d(${backgroundMoveX}px, ${backgroundMoveY}px, 0) scale(${backgroundScale})`,
          filter: "blur(34px) brightness(0.46) saturate(1.25)",
          opacity: 0.72,
        }}
      />

      <Img
        src={imageUrl}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          transform: `translate3d(${mainMoveX}px, ${mainMoveY}px, 0) rotate(${cameraRotate}deg) scale(${mainScale})`,
          transformOrigin: "center center",
          filter: `saturate(${1.04 + cameraTransition * 0.16 + beatZoomStrength * 0.055}) contrast(${
            1.02 + cameraTransition * 0.09 + beatZoomStrength * 0.035
          }) blur(${cameraTransition * 0.35}px)`,
          willChange: "transform, filter",
        }}
      />
    </AbsoluteFill>
  );
}

function PremiumLightLeaks({ look, audio }: { look: Look; audio: AudioEnergy }) {
  const frame = useCurrentFrame();

  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => {
        const opacity = 0.04 + audio.energy * 0.11;
        const rotate = index === 0 ? -18 : index === 1 ? 12 : 28;
        const left = index === 0 ? "-18%" : index === 1 ? "22%" : "68%";
        const top = index === 0 ? "-8%" : index === 1 ? "30%" : "58%";
        const pulse = 1 + Math.sin(frame / (18 + index * 7)) * 0.03;
        const color = index % 2 === 0 ? look.primary : look.accent;

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left,
              top,
              width: "42%",
              height: "70%",
              borderRadius: 999,
              background: `linear-gradient(180deg, rgba(${color}, 0.28), rgba(${look.secondary}, 0.06), transparent)`,
              filter: "blur(70px)",
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
  const count =
    look.mood === "festival" || look.mood === "viral" || look.mood === "cyber" ? 7 : 4;

  return (
    <>
      {Array.from({ length: count }).map((_, index) => {
        const seed = index * 10.31;
        const swing = Math.sin(frame / (15 + index * 2) + seed) * (18 + audio.mid * 20);
        const left = `${-10 + index * 18 + swing / 10}%`;
        const top = `${4 + (index % 3) * 12}%`;
        const color = index % 2 === 0 ? look.primary : look.secondary;

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left,
              top,
              width: 3 + audio.energy * 3,
              height: "86%",
              borderRadius: 999,
              background: `linear-gradient(180deg, rgba(${color}, 0), rgba(${color}, 0.58), rgba(${look.accent}, 0))`,
              transform: `rotate(${-40 + index * 13}deg)`,
              filter: `blur(${4 + audio.energy * 3}px)`,
              opacity: 0.13 + audio.bass * 0.28,
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
  const count =
    look.mood === "festival" || look.mood === "viral"
      ? 54
      : look.mood === "gold"
        ? 28
        : 38;

  return (
    <>
      {Array.from({ length: count }).map((_, index) => {
        const seed = index * 17.7;
        const x = random(seed) * 100;
        const startY = random(seed + 1) * 100;
        const speed = 0.025 + random(seed + 2) * 0.08 + audio.energy * 0.04;
        const size = look.mood === "gold" ? 2 + random(seed + 4) * 5 : 1 + random(seed + 4) * 3.5;
        const y = (startY - frame * speed) % 100;
        const color = look.mood === "gold" ? look.primary : index % 3 === 0 ? look.primary : look.secondary;

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y < 0 ? y + 100 : y}%`,
              width: size,
              height: size,
              borderRadius: 999,
              background: `rgba(${color}, ${look.mood === "gold" ? 0.74 : 0.58})`,
              boxShadow: `0 0 ${8 + audio.high * 16}px rgba(${color}, 0.7)`,
              opacity: 0.08 + audio.energy * 0.2,
              mixBlendMode: "screen",
            }}
          />
        );
      })}
    </>
  );
}


function BeatShockwaves({ look, audio, profile }: { look: Look; audio: AudioEnergy; profile: PresetMotionProfile }) {
  const frame = useCurrentFrame();
  const pulse = audio.peak ? 1 : audio.bass;
  const opacity = clamp(pulse * 0.34 * profile.particles, 0, 0.42);

  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => {
        const delay = index * 7;
        const local = (frame + delay) % 38;
        const progress = local / 38;
        const scale = 0.26 + progress * (1.8 + audio.bass * 0.5);
        const ringOpacity = opacity * (1 - progress);

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: "42%",
              aspectRatio: "1 / 1",
              borderRadius: "999px",
              border: `2px solid rgba(${look.primary}, ${ringOpacity})`,
              boxShadow: `0 0 ${22 + audio.bass * 52}px rgba(${look.secondary}, ${ringOpacity})`,
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity: ringOpacity,
              mixBlendMode: "screen",
              pointerEvents: "none",
            }}
          />
        );
      })}
    </>
  );
}

function StageSpotlights({ look, audio, profile }: { look: Look; audio: AudioEnergy; profile: PresetMotionProfile }) {
  const frame = useCurrentFrame();
  const beamOpacity = (0.08 + audio.mid * 0.28 + audio.peak * 0.16) * profile.spotlight;
  const sweep = Math.sin(frame / 18) * 18;

  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => {
        const side = index % 2 === 0 ? -1 : 1;
        const x = index % 2 === 0 ? "-18%" : "72%";
        const rotate = side * (18 + index * 4 + sweep);
        const color = index % 3 === 0 ? look.primary : index % 3 === 1 ? look.secondary : look.accent;

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x,
              top: "-10%",
              width: "42%",
              height: "118%",
              background: `linear-gradient(180deg, rgba(${color}, ${beamOpacity}), rgba(${color}, ${
                beamOpacity * 0.18
              }) 42%, transparent 82%)`,
              filter: `blur(${28 + audio.energy * 28}px)`,
              transform: `rotate(${rotate}deg)`,
              transformOrigin: "50% 0%",
              opacity: 0.55 + audio.energy * 0.25,
              mixBlendMode: "screen",
              pointerEvents: "none",
            }}
          />
        );
      })}
    </>
  );
}

function SmokeFog({ look, audio, profile }: { look: Look; audio: AudioEnergy; profile: PresetMotionProfile }) {
  const frame = useCurrentFrame();
  const fogOpacity = (0.10 + audio.energy * 0.12) * profile.smoke;

  return (
    <>
      {Array.from({ length: 7 }).map((_, index) => {
        const seed = index * 12.77;
        const size = 36 + random(seed) * 34;
        const x = -18 + index * 20 + Math.sin(frame / (55 + index * 8)) * 6;
        const y = 62 + Math.cos(frame / (45 + index * 7)) * 8 + index * 2;
        const color = index % 2 === 0 ? look.primary : look.secondary;

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: `${size}%`,
              height: `${size * 0.62}%`,
              borderRadius: "999px",
              background: `radial-gradient(circle, rgba(${color}, ${
                0.13 + audio.mid * 0.05
              }) 0%, rgba(255,255,255, ${0.035 + audio.high * 0.02}) 34%, transparent 72%)`,
              filter: `blur(${34 + audio.energy * 22}px)`,
              opacity: fogOpacity,
              transform: `translateY(${Math.sin(frame / 36 + seed) * 10}px) scale(${
                1 + audio.bass * 0.05
              })`,
              mixBlendMode: "screen",
              pointerEvents: "none",
            }}
          />
        );
      })}
    </>
  );
}

function BeatConfettiParticles({ look, audio, profile }: { look: Look; audio: AudioEnergy; profile: PresetMotionProfile }) {
  const frame = useCurrentFrame();
  const burst = audio.peak ? 1 : clamp((audio.bass - 0.32) * 3.8 + audio.energy * 0.24, 0, 1);
  const count = Math.round(28 + profile.particles * 18);

  return (
    <>
      {Array.from({ length: count }).map((_, index) => {
        const seed = index * 21.19;
        const angle = random(seed) * Math.PI * 2;
        const distance = (24 + random(seed + 1) * 58) * (0.38 + burst * 0.92);
        const x = 50 + Math.cos(angle) * distance;
        const y = 50 + Math.sin(angle) * distance;
        const size = 2 + random(seed + 3) * 6 + burst * 3;
        const color = index % 3 === 0 ? look.primary : index % 3 === 1 ? look.secondary : look.accent;
        const opacity = burst * profile.particles * (0.10 + random(seed + 6) * 0.36);

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              borderRadius: index % 4 === 0 ? 2 : 999,
              background: `rgba(${color}, ${0.8})`,
              boxShadow: `0 0 ${8 + burst * 18}px rgba(${color}, 0.85)`,
              opacity,
              transform: `rotate(${frame * (index % 2 === 0 ? 7 : -8)}deg) scale(${0.4 + burst * 1.35})`,
              mixBlendMode: "screen",
              pointerEvents: "none",
            }}
          />
        );
      })}
    </>
  );
}

function StrobeFlash({ look, audio, profile }: { look: Look; audio: AudioEnergy; profile: PresetMotionProfile }) {
  const frame = useCurrentFrame();
  const shouldStrobe = audio.peak || audio.high > 0.72;
  const flicker = frame % 4 < 2 ? 1 : 0.35;
  const opacity = shouldStrobe ? (0.08 + audio.high * 0.14 + audio.bass * 0.08) * flicker * profile.strobe : 0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(135deg, rgba(255,255,255, ${opacity}), rgba(${look.primary}, ${
          opacity * 0.72
        }), rgba(${look.secondary}, ${opacity * 0.52}))`,
        mixBlendMode: "screen",
        opacity: 1,
        pointerEvents: "none",
      }}
    />
  );
}

function BassEqualizerBars({ look, audio, profile }: { look: Look; audio: AudioEnergy; profile: PresetMotionProfile }) {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        left: "4%",
        right: "4%",
        bottom: "3.2%",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 5,
        height: "7%",
        opacity: (0.16 + audio.energy * 0.24) * profile.equalizer,
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: 42 }).map((_, index) => {
        const seed = index * 5.9;
        const wave = Math.sin(frame / (3.4 + random(seed) * 2.8) + index * 0.45);
        const height = 12 + (audio.bass * 55 + audio.mid * 24) * (0.42 + random(seed + 2) * 0.72) + wave * 8;
        const color = index % 3 === 0 ? look.primary : index % 3 === 1 ? look.secondary : look.accent;

        return (
          <div
            key={index}
            style={{
              width: 4,
              height: `${clamp(height, 8, 94)}%`,
              borderRadius: 999,
              background: `linear-gradient(180deg, rgba(${color}, 0.82), rgba(${color}, 0.08))`,
              boxShadow: `0 0 ${8 + audio.energy * 10}px rgba(${color}, 0.6)`,
            }}
          />
        );
      })}
    </div>
  );
}


function BeatCameraPunch({
  look,
  audio,
}: {
  look: Look;
  audio: AudioEnergy;
}) {
  const frame = useCurrentFrame();

  // Strong punch on kick/bass peaks
  const beatStrength =
    audio.peak > 0
      ? 1
      : clamp((audio.bass - 0.38) * 3.2 + audio.energy * 0.42, 0, 1);

  const pulse = Math.sin(frame * 0.9) * 0.5 + 0.5;

  const scale =
    1 +
    beatStrength * 0.12 +
    pulse * beatStrength * 0.04;

  const rotate =
    Math.sin(frame * 0.42) * beatStrength * 1.8;

  const blur =
    beatStrength * 1.4;

  const glow =
    beatStrength * 0.22;

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        transform: `scale(${scale}) rotate(${rotate}deg)`,
        transformOrigin: "center center",
        filter: `blur(${blur}px) saturate(${1 + beatStrength * 0.24}) contrast(${1 + beatStrength * 0.12})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: `inset 0 0 ${22 + beatStrength * 120}px rgba(${look.primary}, ${glow})`,
          mixBlendMode: "screen",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: "-10%",
          background: `radial-gradient(circle at 50% 50%, rgba(255,255,255, ${
            glow * 0.82
          }) 0%, rgba(${look.primary}, ${
            glow * 0.52
          }) 42%, transparent 78%)`,
          opacity: glow,
          mixBlendMode: "screen",
          filter: `blur(${12 + beatStrength * 28}px)`,
        }}
      />
    </AbsoluteFill>
  );
}

function GlitchSlices({
  look,
  audio,
  profile,
}: {
  look: Look;
  audio: AudioEnergy;
  profile: PresetMotionProfile;
}) {
  const frame = useCurrentFrame();
  const glitchStrength = profile.glitch * clamp((audio.bass - 0.28) * 2.4 + audio.high * 0.35, 0, 1);

  if (glitchStrength < 0.04) return null;

  return (
    <>
      {Array.from({ length: 8 }).map((_, index) => {
        const seed = index * 17.31;
        const top = random(seed) * 100;
        const height = 1 + random(seed + 1) * 5;
        const offset = Math.sin(frame * 0.9 + index) * 18 * glitchStrength;
        const color = index % 2 === 0 ? look.primary : look.secondary;

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${-6 + offset}%`,
              top: `${top}%`,
              width: "112%",
              height: `${height}%`,
              background: `linear-gradient(90deg, rgba(${color}, ${0.16 * glitchStrength}), rgba(255,255,255,${
                0.08 * glitchStrength
              }), transparent)`,
              opacity: glitchStrength,
              filter: "blur(1px)",
              mixBlendMode: "screen",
              pointerEvents: "none",
            }}
          />
        );
      })}
    </>
  );
}

function CyberGrid({
  look,
  audio,
  profile,
}: {
  look: Look;
  audio: AudioEnergy;
  profile: PresetMotionProfile;
}) {
  if (profile.glitch < 0.65 && look.mood !== "cyber") return null;

  const frame = useCurrentFrame();
  const opacity = (0.05 + audio.energy * 0.12) * Math.max(profile.glitch, 0.6);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `linear-gradient(rgba(${look.primary}, ${opacity}) 1px, transparent 1px), linear-gradient(90deg, rgba(${look.secondary}, ${
          opacity * 0.75
        }) 1px, transparent 1px)`,
        backgroundSize: "58px 58px",
        transform: `translateY(${(frame * 0.6) % 58}px) perspective(700px) rotateX(58deg) scale(1.5)`,
        transformOrigin: "50% 100%",
        opacity,
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  );
}

function LuxurySparkles({
  look,
  audio,
  profile,
}: {
  look: Look;
  audio: AudioEnergy;
  profile: PresetMotionProfile;
}) {
  if (look.mood !== "gold") return null;

  const frame = useCurrentFrame();

  return (
    <>
      {Array.from({ length: 28 }).map((_, index) => {
        const seed = index * 23.7;
        const x = random(seed) * 100;
        const y = random(seed + 1) * 100;
        const pulse = Math.sin(frame / (10 + random(seed + 2) * 22) + seed) * 0.5 + 0.5;
        const size = 2 + random(seed + 3) * 5;

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              borderRadius: 999,
              background: `rgba(${look.primary}, ${0.35 + pulse * 0.45})`,
              boxShadow: `0 0 ${8 + pulse * 16}px rgba(${look.primary}, 0.8)`,
              opacity: (0.18 + audio.energy * 0.2) * profile.particles,
              transform: `scale(${0.6 + pulse * 1.2})`,
              mixBlendMode: "screen",
              pointerEvents: "none",
            }}
          />
        );
      })}
    </>
  );
}


function FestivalFireworks({
  look,
  audio,
  profile,
}: {
  look: Look;
  audio: AudioEnergy;
  profile: PresetMotionProfile;
}) {
  if (look.mood !== "festival") return null;

  const frame = useCurrentFrame();
  const burst = clamp((audio.bass - 0.32) * 2.2 + audio.peak * 0.55, 0, 1);

  return (
    <>
      {Array.from({ length: 4 }).map((_, groupIndex) => {
        const groupSeed = groupIndex * 31.13;
        const cx = 18 + random(groupSeed) * 64;
        const cy = 12 + random(groupSeed + 1) * 38;
        const local = (frame + groupIndex * 11) % 54;
        const progress = local / 54;
        const active = progress < 0.7 ? Math.sin(progress * Math.PI) * burst : 0;

        return (
          <div key={groupIndex}>
            {Array.from({ length: 16 }).map((_, index) => {
              const seed = groupSeed + index * 7.4;
              const angle = (Math.PI * 2 * index) / 16;
              const distance = progress * (22 + random(seed) * 28);
              const color = index % 3 === 0 ? look.primary : index % 3 === 1 ? look.secondary : look.accent;

              return (
                <div
                  key={index}
                  style={{
                    position: "absolute",
                    left: `${cx + Math.cos(angle) * distance}%`,
                    top: `${cy + Math.sin(angle) * distance}%`,
                    width: 2 + random(seed + 2) * 4,
                    height: 2 + random(seed + 2) * 4,
                    borderRadius: 999,
                    background: `rgba(${color}, 0.9)`,
                    boxShadow: `0 0 ${10 + active * 18}px rgba(${color}, 0.9)`,
                    opacity: active * profile.particles,
                    mixBlendMode: "screen",
                    pointerEvents: "none",
                  }}
                />
              );
            })}
          </div>
        );
      })}
    </>
  );
}

function ViralSwipeFrames({
  look,
  audio,
  profile,
}: {
  look: Look;
  audio: AudioEnergy;
  profile: PresetMotionProfile;
}) {
  if (look.mood !== "viral") return null;

  const frame = useCurrentFrame();
  const hit = clamp((audio.bass - 0.34) * 2.7 + audio.high * 0.28, 0, 1);
  const slide = Math.sin(frame / 9) * 50;

  return (
    <>
      {Array.from({ length: 4 }).map((_, index) => {
        const top = 12 + index * 22;
        const direction = index % 2 === 0 ? 1 : -1;
        const color = index % 2 === 0 ? look.primary : look.secondary;

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${direction === 1 ? -80 + slide : 30 - slide}%`,
              top: `${top}%`,
              width: "76%",
              height: "5%",
              borderRadius: 999,
              background: `linear-gradient(90deg, transparent, rgba(${color}, ${0.22 * hit}), rgba(255,255,255,${
                0.16 * hit
              }), transparent)`,
              filter: "blur(10px)",
              opacity: hit * profile.strobe,
              transform: `rotate(${direction * -10}deg)`,
              mixBlendMode: "screen",
              pointerEvents: "none",
            }}
          />
        );
      })}


    </>
  );
}

function TechnoGlitchLayer({
  look,
  audio,
  profile,
}: {
  look: Look;
  audio: AudioEnergy;
  profile: PresetMotionProfile;
}) {
  if (look.mood !== "glitch") return null;

  const frame = useCurrentFrame();
  const strength = profile.glitch * clamp((audio.bass - 0.24) * 2.5 + audio.high * 0.42, 0, 1);

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,${0.055 * strength}) 1px, transparent 1px)`,
          backgroundSize: "100% 5px",
          opacity: strength,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      {Array.from({ length: 12 }).map((_, index) => {
        const seed = index * 14.1;
        const y = random(seed) * 100;
        const h = 1 + random(seed + 1) * 4;
        const x = Math.sin(frame * 0.5 + index) * 20 * strength;
        const color = index % 2 === 0 ? look.primary : look.secondary;

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${-5 + x}%`,
              top: `${y}%`,
              width: "110%",
              height: `${h}%`,
              background: `linear-gradient(90deg, rgba(${color}, ${0.24 * strength}), transparent 76%)`,
              opacity: strength,
              filter: "blur(1px)",
              mixBlendMode: "screen",
              pointerEvents: "none",
            }}
          />
        );
      })}
    </>
  );
}

function LuxuryGoldAura({
  look,
  audio,
  profile,
}: {
  look: Look;
  audio: AudioEnergy;
  profile: PresetMotionProfile;
}) {
  if (look.mood !== "gold") return null;

  const frame = useCurrentFrame();
  const sweep = (frame % 150) / 150;
  const opacity = 0.22 + audio.energy * 0.2;

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: "-20%",
          background: `conic-gradient(from ${frame * 0.5}deg, transparent, rgba(${look.primary}, ${
            opacity * 0.32
          }), rgba(255,255,255,${opacity * 0.2}), transparent)`,
          filter: "blur(48px)",
          opacity: 0.65,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: `${-35 + sweep * 135}%`,
          top: "-10%",
          width: "18%",
          height: "120%",
          background: `linear-gradient(90deg, transparent, rgba(${look.primary}, ${
            0.34 * profile.particles
          }), rgba(255,255,255,0.24), transparent)`,
          filter: "blur(18px)",
          transform: "rotate(18deg)",
          opacity: 0.5 + audio.high * 0.18,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
    </>
  );
}

function CyberHologramLayer({
  look,
  audio,
  profile,
}: {
  look: Look;
  audio: AudioEnergy;
  profile: PresetMotionProfile;
}) {
  if (look.mood !== "cyber") return null;

  const frame = useCurrentFrame();
  const opacity = (0.08 + audio.energy * 0.14) * profile.glitch;

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(90deg, rgba(${look.primary}, ${opacity}) 1px, transparent 1px), linear-gradient(rgba(${look.secondary}, ${
            opacity * 0.75
          }) 1px, transparent 1px)`,
          backgroundSize: "42px 42px",
          transform: `translate(${frame % 42}px, ${(frame * 0.8) % 42}px)`,
          opacity,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      {Array.from({ length: 3 }).map((_, index) => {
        const local = (frame + index * 22) % 90;
        const progress = local / 90;
        const scale = 0.6 + progress * 2.2;
        const alpha = (1 - progress) * (0.18 + audio.mid * 0.16);

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: "44%",
              aspectRatio: "1 / 1",
              borderRadius: "999px",
              border: `1px solid rgba(${look.primary}, ${alpha})`,
              boxShadow: `0 0 ${24 + audio.energy * 30}px rgba(${look.secondary}, ${alpha})`,
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity: alpha,
              mixBlendMode: "screen",
              pointerEvents: "none",
            }}
          />
        );
      })}
    </>
  );
}

function CinematicSoftDepth({
  look,
  audio,
}: {
  look: Look;
  audio: AudioEnergy;
}) {
  if (look.mood !== "cinematic") return null;

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, rgba(0,0,0,${0.16 + audio.energy * 0.04}) 0%, transparent 18%, transparent 82%, rgba(0,0,0,${
            0.2 + audio.energy * 0.06
          }) 100%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "-10%",
          background: `radial-gradient(circle at 50% 46%, transparent 45%, rgba(${look.primary}, ${
            0.10 + audio.mid * 0.08
          }) 100%)`,
          filter: "blur(28px)",
          opacity: 0.5,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
    </>
  );
}


function TechnoNeonLaserRays({
  look,
  audio,
  profile,
}: {
  look: Look;
  audio: AudioEnergy;
  profile: PresetMotionProfile;
}) {
  const isTechnoPreset =
    look.mood === "glitch" ||
    look.mood === "cyber" ||
    profile.glitch >= 0.85;

  if (!isTechnoPreset) return null;

  const frame = useCurrentFrame();

  const isCyber = look.mood === "cyber";
  const isRgbTechno = look.mood === "glitch" && profile.glitch > 1.15;
  const isDarkTechno = look.mood === "glitch" && profile.glitch <= 1.15;

  const energy = clamp(audio.bass * 0.38 + audio.mid * 0.34 + audio.high * 0.28, 0, 1);
  const beatBoost = audio.peak ? 1 : clamp((audio.bass - 0.22) * 2.4 + audio.high * 0.45, 0, 1);

  const diagonalCount = isRgbTechno ? 11 : isCyber ? 8 : 5;
  const stageBeamCount = isCyber ? 9 : isRgbTechno ? 5 : 3;
  const scannerCount = isRgbTechno ? 7 : isCyber ? 4 : 3;

  const diagonalPower = isRgbTechno ? 1.18 : isCyber ? 0.88 : 0.56;
  const stagePower = isCyber ? 1.08 : isRgbTechno ? 0.7 : 0.46;
  const scannerPower = isRgbTechno ? 1.18 : isCyber ? 0.72 : 0.55;

  const laserPower = clamp(
    0.58 + energy * 0.52 + beatBoost * 0.3,
    0.45,
    1.45,
  );

  return (
    <>
      {/* Diagonal party/festival lasers. Position and quantity vary by preset. */}
      {Array.from({ length: diagonalCount }).map((_, index) => {
        const seed = index * 19.71;
        const direction = index % 2 === 0 ? 1 : -1;
        const color =
          index % 3 === 0
            ? look.primary
            : index % 3 === 1
              ? look.secondary
              : look.accent;

        const speed = isCyber
          ? 0.58 + index * 0.045
          : isRgbTechno
            ? 1.02 + index * 0.075
            : 0.42 + index * 0.035;

        const sweep = ((frame * speed + index * (isCyber ? 34 : 26)) % 190) - 52;

        const top = isCyber
          ? 6 + index * 10 + Math.sin(frame / (22 + index * 2)) * 5
          : isRgbTechno
            ? -18 + index * 10 + Math.sin(frame / (18 + index * 2)) * 9
            : 4 + index * 15 + Math.sin(frame / (30 + index * 2)) * 4;

        const rotate = isCyber
          ? direction * (34 - index * 1.8) + Math.sin(frame / (22 + index * 2)) * 10
          : isRgbTechno
            ? direction * (18 + index * 2.8) + Math.sin(frame / (14 + index * 2)) * 18
            : direction * (10 + index * 2.2) + Math.sin(frame / (28 + index * 3)) * 6;

        const opacity = clamp(
          (0.34 + Math.sin(frame / (8 + index * 0.35) + seed) * 0.14 + beatBoost * 0.24) *
            laserPower *
            diagonalPower,
          isDarkTechno ? 0.12 : 0.26,
          isDarkTechno ? 0.56 : 0.96,
        );

        const thickness =
          (isRgbTechno ? 7 : isCyber ? 6 : 4) +
          energy * (isRgbTechno ? 8 : isCyber ? 6 : 3) +
          beatBoost * (isRgbTechno ? 5 : isCyber ? 4 : 2);

        const left = isCyber
          ? direction === 1
            ? -56 + sweep * 0.72
            : 96 - sweep * 0.72
          : direction === 1
            ? -70 + sweep
            : 112 - sweep;

        return (
          <div
            key={`party-laser-${index}`}
            style={{
              position: "absolute",
              left: `${left}%`,
              top: `${top}%`,
              width: isCyber ? "150%" : isRgbTechno ? "175%" : "130%",
              height: thickness,
              borderRadius: 999,
              opacity,
              transform: `rotate(${rotate}deg)`,
              transformOrigin: "center center",
              mixBlendMode: "screen",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: isDarkTechno ? "-10px 0" : "-18px 0",
                borderRadius: 999,
                background: `linear-gradient(90deg, transparent 0%, rgba(${color}, ${0.16 * opacity}) 14%, rgba(${color}, ${
                  0.82 * opacity
                }) 48%, rgba(255,255,255, ${0.56 * opacity}) 52%, rgba(${color}, ${
                  0.78 * opacity
                }) 58%, transparent 100%)`,
                filter: `blur(${isDarkTechno ? 8 : 12 + energy * 16}px)`,
                boxShadow: `0 0 ${isDarkTechno ? 28 : 44 + energy * 70}px rgba(${color}, ${
                  0.72 * opacity
                }), 0 0 ${isDarkTechno ? 52 : 92 + energy * 120}px rgba(${color}, ${0.32 * opacity})`,
              }}
            />

            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "50%",
                height: Math.max(2, thickness * 0.28),
                transform: "translateY(-50%)",
                borderRadius: 999,
                background: `linear-gradient(90deg, transparent 0%, rgba(${color}, ${
                  0.32 * opacity
                }) 24%, rgba(255,255,255, ${0.88 * opacity}) 50%, rgba(${color}, ${
                  0.46 * opacity
                }) 72%, transparent 100%)`,
                boxShadow: `0 0 ${isDarkTechno ? 10 : 18 + beatBoost * 20}px rgba(255,255,255, ${0.72 * opacity})`,
              }}
            />
          </div>
        );
      })}

      {/* Stage beams. Cyber gets strong lower beams; Dark Techno gets fewer side beams. */}
      {Array.from({ length: stageBeamCount }).map((_, index) => {
        const color = index % 2 === 0 ? look.primary : index % 3 === 0 ? look.accent : look.secondary;

        const originX = isCyber
          ? 4 + index * 11
          : isRgbTechno
            ? 12 + index * 18
            : 8 + index * 28;

        const swing = Math.sin(frame / (13 + index * 2) + index) * (isCyber ? 24 : isRgbTechno ? 16 : 9);
        const rotate = isCyber
          ? -54 + index * 13 + swing
          : isRgbTechno
            ? -38 + index * 18 + swing
            : -24 + index * 20 + swing;

        const opacity = clamp(
          (0.24 + energy * 0.38 + beatBoost * 0.18) * stagePower,
          0.12,
          isDarkTechno ? 0.45 : 0.82,
        );

        return (
          <div
            key={`stage-beam-${index}`}
            style={{
              position: "absolute",
              left: `${originX}%`,
              bottom: isCyber ? "-20%" : "-14%",
              width: isCyber ? 18 + beatBoost * 9 : isRgbTechno ? 12 + beatBoost * 7 : 8 + beatBoost * 4,
              height: isCyber ? "132%" : isRgbTechno ? "112%" : "92%",
              borderRadius: 999,
              background: `linear-gradient(180deg, rgba(${color}, ${0.84 * opacity}) 0%, rgba(${color}, ${
                0.24 * opacity
              }) 38%, transparent 88%)`,
              filter: `blur(${isDarkTechno ? 9 : 14 + energy * 18}px)`,
              boxShadow: `0 0 ${isDarkTechno ? 28 : 44 + energy * 52}px rgba(${color}, ${0.7 * opacity})`,
              opacity,
              transform: `rotate(${rotate}deg)`,
              transformOrigin: "50% 100%",
              mixBlendMode: "screen",
              pointerEvents: "none",
            }}
          />
        );
      })}

      {/* Scanner lines. Strong on Dark Techno RGB, fewer on Cyber, subtle on Dark Techno. */}
      {Array.from({ length: scannerCount }).map((_, index) => {
        const color = index % 2 === 0 ? look.primary : look.secondary;
        const y = ((frame * (isRgbTechno ? 2.2 + index * 0.34 : 1.2 + index * 0.2) + index * 31) % 128) - 14;
        const opacity = clamp(
          (0.12 + audio.high * 0.32 + beatBoost * 0.16) * scannerPower,
          0.08,
          isRgbTechno ? 0.76 : isCyber ? 0.52 : 0.32,
        );

        return (
          <div
            key={`scan-laser-${index}`}
            style={{
              position: "absolute",
              left: isCyber ? "8%" : "-10%",
              top: `${y}%`,
              width: isCyber ? "84%" : "120%",
              height: isRgbTechno ? 2 + audio.high * 5 : 1.5 + audio.high * 3,
              borderRadius: 999,
              background: `linear-gradient(90deg, transparent, rgba(${color}, ${
                0.7 * opacity
              }), rgba(255,255,255, ${0.55 * opacity}), rgba(${color}, ${0.7 * opacity}), transparent)`,
              filter: `blur(${isDarkTechno ? 1 : 2}px)`,
              opacity,
              transform: `rotate(${isCyber ? 0 : index % 2 === 0 ? -7 : 7}deg)`,
              mixBlendMode: "screen",
              pointerEvents: "none",
            }}
          />
        );
      })}
    </>
  );
}



const EXPLOSION_VFX_SRC = "vfx/explosion/explosao2.mp4";
const LUXURY_ENTRANCE_VFX_SRC = "vfx/explosion/explosao3.mp4";

function ExplosionVfxTest({
  audio,
  preset,
}: {
  audio: AudioAnalysis;
  preset: MotionPreset;
}) {
  const frame = useCurrentFrame();

  // For this test, trigger the VFX once at the entrance.
  // This avoids stacking the VFX exactly on the main beat transition.
  const fromFrame = 0;
  const vfxDuration = 54;

  // Regular explosion entrance VFX for impact/festival presets.
  const enabled =
    preset === "FESTIVAL_DROP_PRO" ||
    preset === "FESTIVAL_LIGHTS" ||
    preset === "CYBER_RAVE";

  if (!enabled) return null;

  const localFrame = frame - fromFrame;
  const isActive = localFrame >= 0 && localFrame <= vfxDuration;

  if (!isActive) return null;

  const progress = localFrame / vfxDuration;
  const opacity = interpolate(
    progress,
    [0, 0.08, 0.68, 1],
    [0, 0.46, 0.34, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const scale = interpolate(
    progress,
    [0, 0.18, 1],
    [0.96, 1.02, 1.08],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <Sequence from={fromFrame} durationInFrames={vfxDuration}>
      <OffthreadVideo
        src={staticFile(EXPLOSION_VFX_SRC)}
        muted
        volume={0}
        startFrom={0}
        style={{
          position: "absolute",
          inset: "-10%",
          width: "120%",
          height: "120%",
          objectFit: "cover",
          opacity,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
    </Sequence>
  );
}

function LuxuryEntranceVfx({
  preset,
}: {
  preset: MotionPreset;
}) {
  const frame = useCurrentFrame();

  // Only Luxury Gold gets this VFX.
  if (preset !== "LUXURY_GOLD_CLUB") return null;

  const fromFrame = 0;
  const vfxDuration = 72;
  const localFrame = frame - fromFrame;
  const isActive = localFrame >= 0 && localFrame <= vfxDuration;

  if (!isActive) return null;

  const progress = localFrame / vfxDuration;

  // More elegant and less aggressive than the festival explosion.
  const opacity = interpolate(
    progress,
    [0, 0.10, 0.62, 1],
    [0, 0.38, 0.26, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const scale = interpolate(
    progress,
    [0, 0.26, 1],
    [0.98, 1.025, 1.08],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <Sequence from={fromFrame} durationInFrames={vfxDuration}>
      <OffthreadVideo
        src={staticFile(LUXURY_ENTRANCE_VFX_SRC)}
        muted
        volume={0}
        startFrom={0}
        style={{
          position: "absolute",
          inset: "-8%",
          width: "116%",
          height: "116%",
          objectFit: "cover",
          opacity,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          mixBlendMode: "screen",
          filter: "saturate(1.08) brightness(1.02)",
          pointerEvents: "none",
        }}
      />
    </Sequence>
  );
}



const NEON_PULSE_RAY_VFX_SRC = "vfx/raios/raio.mp4";

function NeonPulseRayVfx({
  preset,
}: {
  preset: MotionPreset;
}) {
  const frame = useCurrentFrame();

  if (preset !== "NEON_PULSE") return null;

  // Entrance ray VFX for Neon Pulse.
  const fromFrame = 0;
  const vfxDuration = 78;
  const localFrame = frame - fromFrame;
  const isActive = localFrame >= 0 && localFrame <= vfxDuration;

  if (!isActive) return null;

  const progress = localFrame / vfxDuration;

  const opacity = interpolate(
    progress,
    [0, 0.08, 0.62, 1],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const scale = interpolate(
    progress,
    [0, 0.24, 1],
    [0.96, 1.035, 1.12],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <Sequence from={fromFrame} durationInFrames={vfxDuration}>
      <OffthreadVideo
        src={staticFile(NEON_PULSE_RAY_VFX_SRC)}
        muted
        volume={0}
        startFrom={0}
        style={{
          position: "absolute",
          inset: "-10%",
          width: "120%",
          height: "120%",
          objectFit: "cover",
          opacity,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          mixBlendMode: "screen",
          filter: "saturate(1.18) brightness(1.05)",
          pointerEvents: "none",
        }}
      />
    </Sequence>
  );
}


function PresetSignatureEffects({
  look,
  audio,
  profile,
}: {
  look: Look;
  audio: AudioEnergy;
  profile: PresetMotionProfile;
}) {
  return (
    <>
      <FestivalFireworks look={look} audio={audio} profile={profile} />
      <ViralSwipeFrames look={look} audio={audio} profile={profile} />
      <TechnoGlitchLayer look={look} audio={audio} profile={profile} />
      <TechnoNeonLaserRays look={look} audio={audio} profile={profile} />
      <LuxuryGoldAura look={look} audio={audio} profile={profile} />
      <CyberHologramLayer look={look} audio={audio} profile={profile} />
      <CinematicSoftDepth look={look} audio={audio} />
    </>
  );
}


function DjBeatEffects({ look, audio, profile }: { look: Look; audio: AudioEnergy; profile: PresetMotionProfile }) {
  return (
    <>
      <SmokeFog look={look} audio={audio} profile={profile} />
      <CyberGrid look={look} audio={audio} profile={profile} />
      <StageSpotlights look={look} audio={audio} profile={profile} />
      <BeatShockwaves look={look} audio={audio} profile={profile} />
      <BeatConfettiParticles look={look} audio={audio} profile={profile} />
      <LuxurySparkles look={look} audio={audio} profile={profile} />
      <GlitchSlices look={look} audio={audio} profile={profile} />
      <BassEqualizerBars look={look} audio={audio} profile={profile} />
      <StrobeFlash look={look} audio={audio} profile={profile} />
    </>
  );
}


function BeatImpactPro({ look, audio }: { look: Look; audio: AudioEnergy }) {
  const pulse = audio.peak ? 0.7 : audio.bass * 0.36;

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 50%, rgba(255,255,255, ${pulse * 0.08}), transparent 44%)`,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: `inset 0 0 ${28 + pulse * 50}px rgba(${look.primary}, ${0.035 + pulse * 0.09})`,
          pointerEvents: "none",
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
          background: "radial-gradient(circle at 50% 48%, transparent 64%, rgba(0,0,0,0.09) 88%, rgba(0,0,0,0.16) 100%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: look.grain,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.22) 0.7px, transparent 0.8px)",
          backgroundSize: `${2 + (frame % 2)}px ${2 + ((frame + 1) % 2)}px`,
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(105deg, transparent 36%, rgba(${look.accent}, ${0.02 + audio.high * 0.045}) 50%, transparent 66%)`,
          transform: `translateX(${Math.sin(frame / 36) * 18}px)`,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
    </>
  );
}

function MotionFlyerScene({
  imageUrl,
  audioUrl,
  preset,
  transitionVariant,
  audio,
}: MotionFlyerProps & { audio: AudioAnalysis }) {
  const { durationInFrames } = useVideoConfig();
  const look = PRESET_LOOK[preset] ?? PRESET_LOOK.NEON_PULSE;
  const profile = PRESET_MOTION_PROFILE[preset] ?? PRESET_MOTION_PROFILE.NEON_PULSE;
  const fallbackTransitionFrame = Math.min(
    Math.round(durationInFrames * 0.52),
    Math.max(14, durationInFrames - 50),
  );
  const cutFrames = [audio.transitionFrame ?? fallbackTransitionFrame];
  const activeTransition = normalizeTransition(transitionVariant) || look.transition;

  return (
    <AbsoluteFill style={{ backgroundColor: look.bg, overflow: "hidden" }}>
      {audioUrl ? <Html5Audio src={audioUrl} /> : null}

      <SafeExactFlyer
        imageUrl={imageUrl}
        look={look}
        audio={audio}
        cutFrames={cutFrames}
        transitionVariant={activeTransition}
        profile={profile}
      />
      <PremiumLightLeaks look={look} audio={audio} />
      <StageLasersPro look={look} audio={audio} />
      <AmbientParticles look={look} audio={audio} />
      <BeatCameraPunch look={look} audio={audio} />
      <DjBeatEffects look={look} audio={audio} profile={profile} />
      <PresetSignatureEffects look={look} audio={audio} profile={profile} />
      <ExplosionVfxTest audio={audio} preset={preset} />
      <LuxuryEntranceVfx preset={preset} />
      <NeonPulseRayVfx preset={preset} />
      <BeatImpactPro look={look} audio={audio} />

      <CinematicFinish look={look} audio={audio} />

      <PremiumCapCutTransitions
        imageUrl={imageUrl}
        cutFrames={cutFrames}
        durationInFrames={42}
        variant={activeTransition}
        primaryRgb={look.primary}
        secondaryRgb={look.secondary}
        accentRgb={look.accent}
        bass={audio.bass}
        energy={audio.energy}
        peak={audio.peak}
        intensity={1.35}
      />
    </AbsoluteFill>
  );
}

export function MotionFlyer(props: MotionFlyerProps) {
  if (!props.audioUrl) {
    return (
      <MotionFlyerScene
        {...props}
        audio={{ bass: 0, mid: 0, high: 0, energy: 0, peak: 0, transitionFrame: null }}
      />
    );
  }

  return <MotionFlyerWithAudio {...props} audioUrl={props.audioUrl} />;
}

export default MotionFlyer;
