import { buildShape, Shape, Image, Math2 } from "@owlbear-rodeo/sdk";
import {
  EXTENSION_ID,
  COLORS,
  SEGMENT_WIDTH,
  SEGMENT_HEIGHT,
  SEGMENT_GAP,
  BAR_GAP,
  BAR_START_OFFSET,
  StatType,
} from "./constants";
import { DaggerheartStats } from "./types";

/**
 * Calculate the center position of an image token in world coordinates
 * Based on Owl Trackers' implementation
 */
function getImageCenter(image: Image, sceneDpi: number) {
  // Image center with respect to image center
  let imageCenter = { x: 0, y: 0 };

  // Find image center with respect to image top left corner
  imageCenter = Math2.add(
    imageCenter,
    Math2.multiply(
      {
        x: image.image.width,
        y: image.image.height,
      },
      0.5
    )
  );

  // Find image center with respect to item position
  imageCenter = Math2.subtract(imageCenter, image.grid.offset);
  imageCenter = Math2.multiply(imageCenter, sceneDpi / image.grid.dpi); // scale switch from image to scene
  imageCenter = Math2.multiply(imageCenter, image.scale);
  imageCenter = Math2.rotate(imageCenter, { x: 0, y: 0 }, image.rotation);

  // find image center with respect to world
  imageCenter = Math2.add(imageCenter, image.position);

  return imageCenter;
}

/**
 * Calculate the bounds (width/height) of an image token accounting for scale and DPI
 * Based on Owl Trackers' implementation
 */
function getImageBounds(item: Image, dpi: number) {
  const dpiScale = dpi / item.grid.dpi;
  const width = item.image.width * dpiScale * item.scale.x;
  const height = item.image.height * dpiScale * item.scale.y;
  return { width: Math.abs(width), height: Math.abs(height) };
}

/**
 * Build a single segment (rectangle) for a stat bar
 *
 * @param tokenId - The ID of the token to attach to
 * @param statType - Which stat this segment belongs to (for coloring)
 * @param segmentIndex - Position in the bar (0 = leftmost)
 * @param isFilled - Whether this segment is filled (current) or empty
 * @param position - Absolute position for this segment
 * @param totalSegments - Total segments in this bar (for centering)
 */
function buildSegment(
  tokenId: string,
  statType: StatType,
  segmentIndex: number,
  isFilled: boolean,
  position: { x: number; y: number },
  totalSegments: number
): Shape {
  const colors = COLORS[statType];

  // Calculate total bar width for centering
  const barWidth =
    totalSegments * SEGMENT_WIDTH + (totalSegments - 1) * SEGMENT_GAP;

  // Offset this segment from the bar start
  const startX = -barWidth / 2;
  const x = position.x + startX + segmentIndex * (SEGMENT_WIDTH + SEGMENT_GAP);

  return buildShape()
    .shapeType("RECTANGLE")
    .width(SEGMENT_WIDTH)
    .height(SEGMENT_HEIGHT)
    .position({ x, y: position.y })
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
    .disableAttachmentBehavior(["ROTATION", "VISIBLE", "COPY", "SCALE"])
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
  position: { x: number; y: number }
): Shape[] {
  // Don't render empty bars
  if (max <= 0) {
    return [];
  }

  const segments: Shape[] = [];

  for (let i = 0; i < max; i++) {
    const isFilled = i < current;
    segments.push(
      buildSegment(tokenId, statType, i, isFilled, position, max)
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
 * 3. Armor (always)
 * 4. Hope (if max > 0, i.e., for PCs)
 *
 * Bars are positioned BELOW the token by default, similar to Owl Trackers
 */
export function buildAllBars(
  item: Image,
  stats: DaggerheartStats,
  sceneDpi: number
): Shape[] {
  const allSegments: Shape[] = [];

  // Calculate token bounds and center
  const bounds = getImageBounds(item, sceneDpi);
  const origin = getImageCenter(item, sceneDpi);

  // Position bars below the token with offset to avoid name label
  // To position above instead, use: origin.y - bounds.height
  let barY = origin.y + bounds.height / 2 + BAR_START_OFFSET;

  // HP bar - always shown
  allSegments.push(
    ...buildStatBar(item.id, "hp", stats.hp.current, stats.hp.max, {
      x: origin.x,
      y: barY,
    })
  );
  barY += SEGMENT_HEIGHT + BAR_GAP;

  // Stress bar - always shown
  allSegments.push(
    ...buildStatBar(item.id, "stress", stats.stress.current, stats.stress.max, {
      x: origin.x,
      y: barY,
    })
  );
  barY += SEGMENT_HEIGHT + BAR_GAP;

  // Armor bar - always shown
  allSegments.push(
    ...buildStatBar(item.id, "armor", stats.armor.current, stats.armor.max, {
      x: origin.x,
      y: barY,
    })
  );
  barY += SEGMENT_HEIGHT + BAR_GAP;

  // Hope bar - only for PCs (max > 0)
  if (stats.hope.max > 0) {
    allSegments.push(
      ...buildStatBar(item.id, "hope", stats.hope.current, stats.hope.max, {
        x: origin.x,
        y: barY,
      })
    );
  }

  return allSegments;
}
