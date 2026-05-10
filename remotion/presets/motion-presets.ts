export type MotionPreset =
  | "NEON_PULSE"
  | "CLUB_FLASH"
  | "CINEMATIC_ZOOM"
  | "FESTIVAL_LIGHTS"
  | "DARK_TECHNO_GLITCH";

export type MotionMood = "neon" | "club" | "cinematic" | "festival" | "glitch";

export type AudioEnergy = {
  bass: number;
  mid: number;
  high: number;
  energy: number;
  peak: number;
};

export type PresetLook = {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  warm: string;
  bg: string;
  mood: MotionMood;
};

export const PRESET_LOOK: Record<MotionPreset, PresetLook> = {
  NEON_PULSE: {
    name: "Neon Pulse Pro",
    primary: "34, 211, 238",
    secondary: "168, 85, 247",
    accent: "236, 72, 153",
    warm: "250, 204, 21",
    bg: "#05040c",
    mood: "neon",
  },
  CLUB_FLASH: {
    name: "Club Flash",
    primary: "255, 255, 255",
    secondary: "59, 130, 246",
    accent: "236, 72, 153",
    warm: "250, 204, 21",
    bg: "#03030a",
    mood: "club",
  },
  CINEMATIC_ZOOM: {
    name: "Cinematic Zoom",
    primary: "245, 158, 11",
    secondary: "168, 85, 247",
    accent: "255, 255, 255",
    warm: "251, 191, 36",
    bg: "#07040d",
    mood: "cinematic",
  },
  FESTIVAL_LIGHTS: {
    name: "Festival Drop",
    primary: "34, 211, 238",
    secondary: "59, 130, 246",
    accent: "244, 114, 182",
    warm: "250, 204, 21",
    bg: "#040716",
    mood: "festival",
  },
  DARK_TECHNO_GLITCH: {
    name: "Dark Techno Glitch",
    primary: "34, 211, 238",
    secondary: "239, 68, 68",
    accent: "255, 255, 255",
    warm: "250, 250, 250",
    bg: "#020202",
    mood: "glitch",
  },
};
