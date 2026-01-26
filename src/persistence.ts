import OBR, { Item } from "@owlbear-rodeo/sdk";
import { EXTENSION_ID, DEFAULT_PC_STATS, DEFAULT_NPC_STATS } from "./constants";
import { DaggerheartStats } from "./types";

/**
 * Generate a stable key for a token that persists across scenes.
 * Format: "{name}::{imageHash}"
 *
 * The image hash helps distinguish multiple tokens with the same name
 * but different artwork (e.g., "Goblin" with different images).
 */
export function getTokenKey(item: Item): string {
  // Get name from item.name or text content
  const name = item.name || (item as any).text?.plainText || "unnamed";

  // Extract a short hash from image URL
  const imageUrl = (item as any).image?.url || "";
  const urlParts = imageUrl.split("/");
  const filename = urlParts[urlParts.length - 1] || "";
  const imageHash = filename.substring(0, 12) || "noimg";

  // Sanitize name (remove special chars that might cause issues)
  const safeName = name.replace(/[^a-zA-Z0-9\s-]/g, "").trim();

  return `${safeName}::${imageHash}`;
}

/**
 * Get the metadata key used for room storage
 */
function getMetadataKey(): string {
  return `${EXTENSION_ID}/tokens`;
}

/**
 * Load all token data from room metadata
 */
export async function loadAllTokenData(): Promise<
  Record<string, DaggerheartStats>
> {
  const metadata = await OBR.room.getMetadata();
  return (
    (metadata[getMetadataKey()] as Record<string, DaggerheartStats>) || {}
  );
}

/**
 * Load stats for a specific token
 */
export async function loadTokenStats(
  item: Item
): Promise<DaggerheartStats | null> {
  const key = getTokenKey(item);
  const allData = await loadAllTokenData();
  return allData[key] || null;
}

/**
 * Save stats for a specific token
 */
export async function saveTokenStats(
  item: Item,
  stats: DaggerheartStats
): Promise<void> {
  const key = getTokenKey(item);
  const allData = await loadAllTokenData();

  await OBR.room.setMetadata({
    [getMetadataKey()]: {
      ...allData,
      [key]: stats,
    },
  });

  console.log(`[DH] Saved stats for ${key}:`, stats);
}

/**
 * Remove stats for a specific token
 */
export async function removeTokenStats(item: Item): Promise<void> {
  const key = getTokenKey(item);
  const allData = await loadAllTokenData();

  delete allData[key];

  await OBR.room.setMetadata({
    [getMetadataKey()]: allData,
  });

  console.log(`[DH] Removed stats for ${key}`);
}

/**
 * Check if a token has stats stored
 */
export async function hasTokenStats(item: Item): Promise<boolean> {
  const stats = await loadTokenStats(item);
  return stats !== null;
}

/**
 * Get stats for a token, creating defaults if not found
 */
export async function getOrCreateStats(
  item: Item,
  isPC: boolean = true
): Promise<DaggerheartStats> {
  const existing = await loadTokenStats(item);
  if (existing) {
    return existing;
  }

  const defaults = isPC ? { ...DEFAULT_PC_STATS } : { ...DEFAULT_NPC_STATS };
  await saveTokenStats(item, defaults);
  return defaults;
}
