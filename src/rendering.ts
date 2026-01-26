import { buildShape, Shape } from "@owlbear-rodeo/sdk";
import {
  EXTENSION_ID,
  COLORS,
  SEGMENT_WIDTH,
  SEGMENT_HEIGHT,
  SEGMENT_GAP,
  BAR_GAP,
  BAR_OFFSET_Y,
  StatType,
} from "./constants";
import { DaggerheartStats } from "./types";

/**
 * Build a single segment (rectangle) for a stat bar
 *
 * @param tokenId - The ID of the token to attach to
 * @param statType - Which stat this segment belongs to (for coloring)
 * @param segmentIndex - Position in the bar (0 = leftmost)
 * @param isFilled - Whether this segment is filled (current) or empty
 * @param barIndex - Which bar row (0 = top, increases downward)
 * @param totalSegments - Total segments in this bar (for centering)
 */
function buildSegment(
  tokenId: string,
  statType: StatType,
  segmentIndex: number,
  isFilled: boolean,
  barIndex: number,
  totalSegments: number
): Shape {
  const colors = COLORS[statType];

  // Calculate total bar width for centering
  const barWidth =
    totalSegments * SEGMENT_WIDTH + (totalSegments - 1) * SEGMENT_GAP;

  // Position relative to token center
  const startX = -barWidth / 2;
  const x = startX + segmentIndex * (SEGMENT_WIDTH + SEGMENT_GAP);
  const y = BAR_OFFSET_Y - barIndex * (SEGMENT_HEIGHT + BAR_GAP);

  return buildShape()
    .shapeType("RECTANGLE")
    .width(SEGMENT_WIDTH)
    .height(SEGMENT_HEIGHT)
    .position({ x, y })
    .fillColor(isFilled ? colors.filled : colors.empty)
    .fillOpacity(1)
    .strokeColor(colors.stroke)
    .strokeWidth(1)
    .strokeOpacity(1)
    .attachedTo(tokenId)
    .locked(true)
    .disableHit(true)
    .visible(true)
    .layer("ATTACHMENT")
    .metadata({
      [`${EXTENSION_ID}/type`]: "segment",
      [`${EXTENSION_ID}/tokenId`]: tokenId,
    })
    .build();
}

/**
 * Build all segments for a single stat bar
 */
function buildStatBar(
  tokenId: string,
  statType: StatType,
  current: number,
  max: number,
  barIndex: number
): Shape[] {
  // Don't render empty bars
  if (max <= 0) {
    return [];
  }

  const segments: Shape[] = [];

  for (let i = 0; i < max; i++) {
    const isFilled = i < current;
    segments.push(
      buildSegment(tokenId, statType, i, isFilled, barIndex, max)
    );
  }

  return segments;
}

/**
 * Build all bars for a token's complete stat block
 *
 * Rendering order (top to bottom):
 * 1. HP (always)
 * 2. Stress (always)
 * 3. Hope (if max > 0, i.e., for PCs)
 * 4. Armor (if > 0)
 */
export function buildAllBars(
  tokenId: string,
  stats: DaggerheartStats
): Shape[] {
  const allSegments: Shape[] = [];
  let barIndex = 0;

  // HP bar - always shown
  allSegments.push(
    ...buildStatBar(tokenId, "hp", stats.hp.current, stats.hp.max, barIndex++)
  );

  // Stress bar - always shown
  allSegments.push(
    ...buildStatBar(
      tokenId,
      "stress",
      stats.stress.current,
      stats.stress.max,
      barIndex++
    )
  );

  // Hope bar - only for PCs (max > 0)
  if (stats.hope.max > 0) {
    allSegments.push(
      ...buildStatBar(
        tokenId,
        "hope",
        stats.hope.current,
        stats.hope.max,
        barIndex++
      )
    );
  }

  // Armor - only if has any
  if (stats.armor > 0) {
    // Armor is just filled segments, no "empty" state
    allSegments.push(
      ...buildStatBar(tokenId, "armor", stats.armor, stats.armor, barIndex++)
    );
  }

  return allSegments;
}
