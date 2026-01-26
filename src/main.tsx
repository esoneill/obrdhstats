import React from "react";
import ReactDOM from "react-dom/client";
import OBR from "@owlbear-rodeo/sdk";
import { setupContextMenu } from "./contextMenu";
import { initializeRendering } from "./listeners";
import "./index.css";

/**
 * Main entry point for the Daggerheart Tracker extension
 * This runs when the extension action popover is opened
 */
OBR.onReady(async () => {
  console.log("[DH] Daggerheart Tracker loaded");

  // Set up context menu
  setupContextMenu();

  // Initialize rendering and listeners
  await initializeRendering();

  // Render a simple info component in the action popover
  const root = ReactDOM.createRoot(document.getElementById("root")!);
  root.render(
    <React.StrictMode>
      <ActionPopover />
    </React.StrictMode>
  );
});

/**
 * Simple action popover component
 * This shows when the user clicks the extension icon in the action bar
 */
function ActionPopover() {
  return (
    <div style={{ padding: "16px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "18px", marginBottom: "12px" }}>
        Daggerheart Tracker
      </h1>
      <p style={{ marginBottom: "8px", color: "#666" }}>
        Right-click any character token to add or edit Daggerheart stats.
      </p>
      <ul style={{ marginLeft: "20px", color: "#666", fontSize: "14px" }}>
        <li>HP, Stress, Hope, and Armor tracking</li>
        <li>Stats persist across scene changes</li>
        <li>Visual segment bars above tokens</li>
      </ul>
    </div>
  );
}
