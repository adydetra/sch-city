// src/utils/lngLatToXY.ts

/** Campus origin in WGS84 lon/lat (degrees) */
const center: [number, number] = [113.03547, 23.152631];
/** Campus origin in grid coords [row, col] */
const centerCoord: [number, number] = [400, 400];

/** WGS84 sphere approx (meters) */
const EARTH_RADIUS = 6378137;
/** Degrees → radians */
const DEG2RAD = Math.PI / 180;

/** Convert WGS84 lon/lat (deg) → Web Mercator [x, y] in meters */
function lngLatToXY(ll: [number, number]): [number, number] {
  const [lng, latRaw] = ll;
  // Clamp latitude to avoid Infinity at the poles
  const lat = Math.max(-89.999999, Math.min(89.999999, latRaw));
  const φ = lat * DEG2RAD;

  const x = lng * DEG2RAD * EARTH_RADIUS;
  const y = (EARTH_RADIUS / 2) * Math.log((1 + Math.sin(φ)) / (1 - Math.sin(φ)));
  return [x, y];
}

/** Precomputed campus origin in Web Mercator (meters) */
const centerWorld = lngLatToXY(center);

/**
 * Convert WGS84 lon/lat (deg) → campus grid coordinate.
 * Returns { row, col } where positive col is +X (east), row decreases with +Y.
 */
function llToCoord2(ll: [number, number]) {
  const [x, y] = lngLatToXY(ll);
  const dx = x - centerWorld[0];
  const dy = y - centerWorld[1];

  const row = centerCoord[0] - Math.floor(dy);
  const col = centerCoord[1] + Math.floor(dx);
  return { row, col };
}

/**
 * Convert Web Mercator [x, y] (same datum as centerWorld) → campus grid coordinate.
 * Useful if you already have Mercator meters (e.g., from another projection step).
 */
function llToCoord(ll: [number, number]) {
  const dx = ll[0] - centerWorld[0];
  const dy = ll[1] - centerWorld[1];

  const row = centerCoord[0] - Math.floor(dy);
  const col = centerCoord[1] + Math.floor(dx);
  return { row, col };
}

export { llToCoord, llToCoord2 };
