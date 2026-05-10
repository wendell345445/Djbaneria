export const MOTION_PRESETS = [
  {
    id: "NEON_PULSE",
    label: "Neon Pulse",
    description: "Zoom suave, glow pulsando e partículas reagindo ao som.",
  },
  {
    id: "CLUB_FLASH",
    label: "Club Flash",
    description: "Flashes de balada, câmera rápida e impacto nos picos do áudio.",
  },
  {
    id: "CINEMATIC_ZOOM",
    label: "Cinematic Zoom",
    description: "Movimento premium com profundidade, blur e light sweep.",
  },
  {
    id: "FESTIVAL_LIGHTS",
    label: "Festival Lights",
    description: "Lasers, glow colorido e energia de palco/festival.",
  },
  {
    id: "DARK_TECHNO_GLITCH",
    label: "Dark Techno Glitch",
    description: "Glitch controlado, distorção RGB e flashes escuros.",
  },
] as const;

export type MotionPresetId = (typeof MOTION_PRESETS)[number]["id"];

export const MOTION_PRESET_IDS = MOTION_PRESETS.map((preset) => preset.id) as [
  MotionPresetId,
  ...MotionPresetId[],
];

export function getMotionPresetLabel(presetId: string) {
  return MOTION_PRESETS.find((preset) => preset.id === presetId)?.label || presetId;
}

export function getMotionSizeForFormat(format: "POST_FEED" | "STORY" | "SQUARE" | "FLYER") {
  switch (format) {
    case "STORY":
      return { width: 1080, height: 1920 };
    case "SQUARE":
      return { width: 1080, height: 1080 };
    case "FLYER":
    case "POST_FEED":
    default:
      return { width: 1080, height: 1350 };
  }
}
