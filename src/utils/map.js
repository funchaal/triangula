// src/utils/map.js

// --- Animation Timing Constants ---
// These constants define the duration of each phase of the arc animation cycle.

/** Duration for the arc to grow from source to destination. */
export const GROW_DURATION   = 5000;
/** Duration the fully grown arc stays visible. */
export const HOLD_DURATION   = 1500;
/** Duration for the arc to shrink back from head to tail. */
export const SHRINK_DURATION = 2250;
/** Pause duration between animation cycles for a single arc. */
export const PAUSE_DURATION  = 1200;
/** Total duration of one complete animation cycle. */
export const CYCLE_DURATION  = GROW_DURATION + HOLD_DURATION + SHRINK_DURATION + PAUSE_DURATION;

/** Number of steps to generate for each arc path. Higher is smoother. */
export const ARC_STEPS = 1920;


// --- Color Palette ---
// Defines the color scheme for the arcs.

/** Start color for the gradient of a standard arc. */
export const COLOR_A = [139, 92,  246, 220]; // tail, violet-500
/** End color for the gradient of a standard arc. */
export const COLOR_B = [219, 39, 119, 220]; // head, pink-500
/** Start color for the gradient of a "hot" (hovered) arc. */
export const COLOR_A_HOT = [196, 167, 255, 255]; // tail, light violet
/** End color for the gradient of a "hot" (hovered) arc. */
export const COLOR_B_HOT = [244, 114, 182, 255]; // head, light pink


// --- Utility Functions ---

/**
 * Converts degrees to radians.
 * @param {number} deg - Angle in degrees.
 * @returns {number} Angle in radians.
 */
function toRad(deg) {
  return deg * Math.PI / 180;
}

/**
 * Calculates a point along a great-circle path between two coordinates.
 * Also calculates an altitude for the arc effect.
 * @param {number[]} src - Source coordinates [lng, lat].
 * @param {number[]} tgt - Target coordinates [lng, lat].
 * @param {number} t - Interpolation factor (0 to 1).
 * @returns {number[]} Point coordinates [lng, lat, altitude].
 */
function greatCirclePoint(src, tgt, t) {
  const lat1 = toRad(src[1]), lon1 = toRad(src[0]);
  const lat2 = toRad(tgt[1]), lon2 = toRad(tgt[0]);

  // Calculate the great-circle distance between the two points.
  const d = 2 * Math.asin(Math.sqrt(
    Math.sin((lat2 - lat1) / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2
  ));

  // If points are too close, just linearly interpolate.
  if (d < 0.0001) {
    return [src[0] + (tgt[0] - src[0]) * t, src[1] + (tgt[1] - src[1]) * t, 0];
  }

  // Standard spherical interpolation formulas.
  const A = Math.sin((1 - t) * d) / Math.sin(d);
  const B = Math.sin(t * d) / Math.sin(d);

  const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
  const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
  const z = A * Math.sin(lat1) + B * Math.sin(lat2);

  const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
  const lon = Math.atan2(y, x);
  
  // Create a curved altitude profile for the arc.
  const tEased = Math.sin(t * Math.PI); // Gentle 0 -> 1 -> 0 curve
  const tSteep = Math.pow(tEased, 0.6); // Push the peak of the curve towards the ends
  const altitude = tSteep * 0.5 * (d * 180 / Math.PI) * 111000; // Altitude proportional to distance

  return [lon * 180 / Math.PI, lat * 180 / Math.PI, altitude];
}

/**
 * Generates an array of points that form a great-circle arc.
 * @param {number[]} src - Source coordinates [lng, lat].
 * @param {number[]} tgt - Target coordinates [lng, lat].
 * @param {number} [steps=ARC_STEPS] - Number of points to generate.
 * @returns {Array<number[]>} An array of points.
 */
export function buildArcPoints(src, tgt, steps = ARC_STEPS) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    pts.push(greatCirclePoint(src, tgt, i / steps));
  }
  return pts;
}

/**
 * Determines the visible segment of an arc based on the current animation time.
 * @param {number} cycleTime - The time elapsed within the current animation cycle.
 * @returns {{tTail: number, tFront: number}} The start (tail) and end (front) of the visible arc segment.
 */
export function getSegment(cycleTime) {
  if (cycleTime < GROW_DURATION) {
    // Phase 1: Growing
    return { tTail: 0, tFront: cycleTime / GROW_DURATION };
  }
  if (cycleTime < GROW_DURATION + HOLD_DURATION) {
    // Phase 2: Holding (fully visible)
    return { tTail: 0, tFront: 1 };
  }
  if (cycleTime < GROW_DURATION + HOLD_DURATION + SHRINK_DURATION) {
    // Phase 3: Shrinking
    const elapsed = cycleTime - GROW_DURATION - HOLD_DURATION;
    return { tTail: elapsed / SHRINK_DURATION, tFront: 1 };
  }
  // Phase 4: Paused (invisible)
  return { tTail: 1, tFront: 1 };
}

/**
 * Linearly interpolates between two RGB(A) colors.
 * @param {number[]} c1 - The start color [R, G, B, A?].
 * @param {number[]} c2 - The end color [R, G, B, A?].
 * @param {number} t - The interpolation factor (0 to 1).
 * @returns {number[]} The interpolated color [R, G, B, A].
 */
export function lerpColor(c1, c2, t) {
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * t),
    Math.round(c1[1] + (c2[1] - c1[1]) * t),
    Math.round(c1[2] + (c2[2] - c1[2]) * t),
    Math.round((c1[3] ?? 255) + ((c2[3] ?? 255) - (c1[3] ?? 255)) * t),
  ];
}
