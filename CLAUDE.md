# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Daggerheart Tracker is an Owlbear Rodeo extension for tracking Daggerheart RPG character stats (HP, Stress, Armor, Hope). It renders discrete segment bars attached to character tokens and persists stats across scene changes via room metadata.

## Commands

```bash
pnpm install          # Install dependencies (uses pnpm 8.15.4)
pnpm dev              # Start dev server at http://localhost:5173
pnpm build            # Type-check and build for production
pnpm lint             # ESLint with zero warnings allowed
```

For local development, add `http://localhost:5173/manifest.json` as an extension in Owlbear Rodeo.

## Architecture

### Entry Points (Multi-Page Vite App)

- **`src/main.tsx`** → `index.html` - Main extension action popover showing Party Stats dashboard
- **`src/popover/main.tsx`** → `popover.html` - Context menu popover for editing individual token stats

### Data Layer

Stats persist in **two locations**:

1. **Room Metadata** (`daggerheart-tracker/tokens`) - The source of truth for stats. Keyed by stable UUID stored in item metadata. Survives scene changes within the same room.

2. **Item Metadata** (`daggerheart-tracker/tracked` and `daggerheart-tracker/token-id`) - Lightweight markers on tokens for quick filtering and UUID storage.

Key modules:
- `persistence.ts` - Room metadata CRUD operations, UUID generation, legacy key migration
- `itemMetadata.ts` - Item-level tracking marks (fast scene filtering)

### Rendering Pipeline

Visual bars are OBR Shape items attached to tokens:

1. `lifecycle.ts` - Orchestrates render/clear/refresh operations
2. `rendering.ts` - Builds shape segments using `@owlbear-rodeo/sdk` buildShape API
3. `listeners.ts` - Scene ready/metadata change handlers with debouncing

Bars render below tokens on the ATTACHMENT layer. Each stat segment is a separate Shape item with metadata marking it as belonging to this extension.

### User Interaction

- `contextMenu.ts` - Registers OBR context menu with conditional icons (Add vs Edit based on tracking state)
- `actions.ts` - High-level actions: `initializeTracking()`, `updateStats()`, `removeTracking()`

### Constants

`constants.ts` defines:
- Extension ID namespace: `daggerheart-tracker`
- Segment dimensions (30x18 units, 6px gap)
- Color schemes per stat type (Tailwind palette)
- Default stats for PC vs NPC modes

## Key Patterns

### Token Identification

Tokens are identified by a stable UUID stored in item metadata at `daggerheart-tracker/token-id`. This survives:
- Token renames
- Scene changes (within same room)
- Copy operations (each copy gets a new UUID)

Legacy name-based keys (`{name}::{imageHash}`) are automatically migrated on first access.

### PC vs NPC

NPCs have `hope.max = 0` and `armor.max = 0`, which causes those bars to not render. The `isPC` flag controls UI display and default values.

### OBR SDK Patterns

- All OBR API calls happen inside `OBR.onReady()` callbacks
- Shapes use `attachedTo()` for automatic token following
- `disableAttachmentBehavior(["ROTATION", "VISIBLE", "COPY", "SCALE"])` prevents unwanted inheritance
- Items are created as shared (visible to all players) on the ATTACHMENT layer

## Deployment

Pushes to `main` trigger GitHub Actions deployment to GitHub Pages at `https://esoneill.github.io/obrdhstats/`. The `GITHUB_PAGES=true` env var sets the correct base path.

## Changelog

**Always update `CHANGELOG.md` when making changes.**

- Follow [Keep a Changelog](https://keepachangelog.com/) format
- Add entries under `[Unreleased]` section at the top
- When releasing, move unreleased changes to a new version heading with date
- Categories: Added, Changed, Fixed, Removed
- Current version: **0.5.0**
