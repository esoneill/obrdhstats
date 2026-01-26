import OBR, { Item } from "@owlbear-rodeo/sdk";
import { refreshAllBars, clearAllBars, refreshBarsForToken } from "./lifecycle";
import { isItemTracked } from "./itemMetadata";

let refreshTimeout: number | null = null;
let isRefreshing = false;
let itemChangeTimeout: number | null = null;

/**
 * Set up listeners for scene changes
 * These handle when scenes load/unload and when items change
 */
export function setupSceneListeners(): void {
  console.log("[DH] Setting up scene listeners");

  // When scene ready state changes
  OBR.scene.onReadyChange(async (isReady) => {
    if (isReady) {
      console.log("[DH] Scene is ready, rendering all bars");
      // Scene just loaded, render all bars
      await refreshAllBars();
    } else {
      console.log("[DH] Scene closing, clearing all bars");
      // Scene closing, clear local items
      await clearAllBars();
    }
  });

  // Listen for room metadata changes (where stats are stored)
  // This is more reliable than listening to all item changes
  OBR.room.onMetadataChange(async () => {
    if (isRefreshing) {
      console.log("[DH] Refresh already in progress, skipping");
      return;
    }

    // Debounce rapid changes
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }

    refreshTimeout = window.setTimeout(async () => {
      const isReady = await OBR.scene.isReady();
      if (isReady) {
        console.log("[DH] Room metadata changed, refreshing bars");
        isRefreshing = true;
        try {
          await refreshAllBars();
        } finally {
          isRefreshing = false;
        }
      }
      refreshTimeout = null;
    }, 300);
  });

  // Listen for scene item changes (additions, renames, deletions)
  // This handles when tokens are added or their names change
  OBR.scene.items.onChange(async (items) => {
    const isReady = await OBR.scene.isReady();
    if (!isReady) {
      return;
    }

    // Debounce to avoid excessive updates
    if (itemChangeTimeout) {
      clearTimeout(itemChangeTimeout);
    }

    itemChangeTimeout = window.setTimeout(async () => {
      console.log("[DH] Scene items changed, checking tracked tokens");

      // Only refresh bars for tracked CHARACTER items
      const trackedItems = items.filter(
        (item) => item.layer === "CHARACTER" && isItemTracked(item)
      );

      if (trackedItems.length > 0) {
        console.log(`[DH] Refreshing bars for ${trackedItems.length} tracked tokens`);
        for (const item of trackedItems) {
          await refreshBarsForToken(item);
        }
      }

      itemChangeTimeout = null;
    }, 200);
  });
}

/**
 * Initial setup - call after OBR.onReady
 */
export async function initializeRendering(): Promise<void> {
  console.log("[DH] Initializing rendering system");

  // Check if scene is already ready
  const isReady = await OBR.scene.isReady();
  if (isReady) {
    await refreshAllBars();
  }

  // Set up ongoing listeners
  setupSceneListeners();
}
