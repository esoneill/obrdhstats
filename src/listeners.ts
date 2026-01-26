import OBR from "@owlbear-rodeo/sdk";
import { refreshAllBars, clearAllBars } from "./lifecycle";

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

  // When items in the scene change
  // This fires on add, delete, update
  OBR.scene.items.onChange(async (items) => {
    // For simplicity, refresh everything when items change
    // A smarter implementation would diff and only update changed items
    const isReady = await OBR.scene.isReady();
    if (isReady) {
      await refreshAllBars();
    }
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
