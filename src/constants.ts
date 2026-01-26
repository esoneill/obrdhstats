import { DaggerheartStats } from "./types";

/**
 * Extension identifier - used for metadata keys and namespacing
 */
export const EXTENSION_ID = "daggerheart-tracker";

/**
 * Visual constants for segment rendering
 * All values in OBR scene units (150 DPI = 1 grid square)
 * Scaled appropriately for OBR's coordinate system
 */
export const SEGMENT_WIDTH = 30;
export const SEGMENT_HEIGHT = 18;
export const SEGMENT_GAP = 6; // Horizontal gap between segments
export const BAR_GAP = 10; // Vertical gap between bars
export const BAR_OFFSET_Y = -100; // Distance above token center

/**
 * Color schemes for each stat type
 * Using Tailwind color palette for consistency
 */
export const COLORS = {
  hp: {
    filled: "#dc2626", // red-600
    empty: "#450a0a", // red-950
    stroke: "#7f1d1d", // red-900
  },
  stress: {
    filled: "#9333ea", // purple-600
    empty: "#3b0764", // purple-950
    stroke: "#581c87", // purple-900
  },
  hope: {
    filled: "#eab308", // yellow-500
    empty: "#422006", // yellow-950
    stroke: "#713f12", // yellow-900
  },
  armor: {
    filled: "#6b7280", // gray-500
    empty: "#1f2937", // gray-800
    stroke: "#374151", // gray-700
  },
} as const;

export type StatType = keyof typeof COLORS;

/**
 * Default stats for PC tokens
 */
export const DEFAULT_PC_STATS: DaggerheartStats = {
  hp: { current: 6, max: 6 },
  stress: { current: 0, max: 6 },
  hope: { current: 2, max: 5 },
  armor: { current: 0, max: 6 },
  isPC: true,
};

/**
 * Default stats for NPC tokens
 * NPCs don't track Hope (max = 0 hides it)
 */
export const DEFAULT_NPC_STATS: DaggerheartStats = {
  hp: { current: 6, max: 6 },
  stress: { current: 0, max: 6 },
  hope: { current: 0, max: 0 },
  armor: { current: 0, max: 6 },
  isPC: false,
};
