import OBR, { Item } from "@owlbear-rodeo/sdk";
import { EXTENSION_ID } from "./constants";
import { DaggerheartStats } from "./types";
import { buildAllBars } from "./rendering";
import { loadTokenStats } from "./persistence";
import { isItemTracked } from "./itemMetadata";

/**
 * Remove all bar segments attached to a specific token
 */
export async function clearBarsForToken(tokenId: string): Promise<void> {
  const sceneItems = await OBR.scene.items.getItems();

  const segmentIds = sceneItems
    .filter((item) => {
      const meta = item.metadata || {};
      return (
        meta[`${EXTENSION_ID}/type`] === "segment" &&
        meta[`${EXTENSION_ID}/tokenId`] === tokenId
      );
    })
    .map((item) => item.id);

  if (segmentIds.length > 0) {
    await OBR.scene.items.deleteItems(segmentIds);
    console.log(`[DH] Cleared ${segmentIds.length} bar segments for ${tokenId}`);
  }
}

/**
 * Render bars for a token (clears existing bars first)
 */
export async function renderBarsForToken(
  token: Item,
  stats: DaggerheartStats
): Promise<void> {
  // Clear any existing bars
  await clearBarsForToken(token.id);

  // Build new segments
  const segments = buildAllBars(token.id, stats);

  // Add to scene as shared items (visible to all players)
  if (segments.length > 0) {
    await OBR.scene.items.addItems(segments);
    console.log(`[DH] Rendered ${segments.length} bar segments for ${token.name}`);
  }
}

/**
 * Clear all bars created by this extension
 */
export async function clearAllBars(): Promise<void> {
  const sceneItems = await OBR.scene.items.getItems();

  const segmentIds = sceneItems
    .filter((item) => {
      const meta = item.metadata || {};
      return meta[`${EXTENSION_ID}/type`] === "segment";
    })
    .map((item) => item.id);

  if (segmentIds.length > 0) {
    await OBR.scene.items.deleteItems(segmentIds);
    console.log(`[DH] Cleared all bars (${segmentIds.length} segments)`);
  }
}

/**
 * Refresh bars for all tracked tokens in the current scene
 */
export async function refreshAllBars(): Promise<void> {
  console.log("[DH] Refreshing all bars");

  // First clear everything
  await clearAllBars();

  // Get all character tokens
  const items = await OBR.scene.items.getItems(
    (item) => item.layer === "CHARACTER"
  );

  // Render bars for tracked items
  for (const item of items) {
    if (isItemTracked(item)) {
      const stats = await loadTokenStats(item);
      if (stats) {
        await renderBarsForToken(item, stats);
      } else {
        console.warn(`[DH] Token ${item.name} is marked as tracked but has no stats`);
      }
    }
  }
}

/**
 * Handle a single token being added or needing refresh
 */
export async function refreshBarsForToken(token: Item): Promise<void> {
  if (!isItemTracked(token)) {
    // Not tracked, ensure no bars exist
    await clearBarsForToken(token.id);
    return;
  }

  const stats = await loadTokenStats(token);
  if (stats) {
    await renderBarsForToken(token, stats);
  }
}
