// src/findPath/helper.ts
import * as TWEEN from 'three/examples/jsm/libs/tween.module.js';

/** Flatten 2D grid into a 1D nodes array */
export function getAllNodes<T>(grid: T[][]): T[] {
  const nodes: T[] = [];
  for (const row of grid) nodes.push(...row);
  return nodes;
}

/** Rebuild shortest path by walking back from finish node via previousNode */
export function getNodesInShortestPathOrder(finishNode: any) {
  const nodesInShortestPathOrder: Array<{ row: number; col: number; direction: string }> = [];
  let currentNode: any = finishNode;

  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift({
      row: currentNode.row,
      col: currentNode.col,
      direction: currentNode.direction,
    });
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
}

/**
 * Tween face colors (legacy Geometry API).
 * NOTE: This expects THREE.Geometry (faces/vertices). If you're on BufferGeometry,
 * this block is likely unused; kept for backward-compatibility.
 */
export async function tweenToColor(
  node: any,
  geometry: any,
  colors: Array<{ r: number; g: number; b: number }>,
  duration = 300,
  options?: { position?: boolean },
) {
  for (let i = 0; i < colors.length; i++) {
    new TWEEN.Tween(node.faces[1].color)
      .to(colors[i], duration)
      .onUpdate(() => {
        geometry.colorsNeedUpdate = true;
      })
      .delay(i * 200)
      .start();

    new TWEEN.Tween(node.faces[2].color)
      .to(colors[i], duration)
      .onUpdate(() => {
        geometry.colorsNeedUpdate = true;
      })
      .delay(i * 200)
      .start();
  }

  if (options?.position) {
    const facesIndices = ['a', 'b', 'c'];
    facesIndices.forEach((k) => {
      new TWEEN.Tween(geometry.vertices[node.faces[1][k]])
        .to({ y: 0.5 }, duration)
        .onUpdate(() => {
          geometry.verticesNeedUpdate = true;
        })
        .start();

      new TWEEN.Tween(geometry.vertices[node.faces[2][k]])
        .to({ y: 0.5 }, duration)
        .onUpdate(() => {
          geometry.verticesNeedUpdate = true;
        })
        .start();
    });

    facesIndices.forEach((k) => {
      new TWEEN.Tween(geometry.vertices[node.faces[1][k]])
        .to({ y: 0 }, duration)
        .onUpdate(() => {
          geometry.verticesNeedUpdate = true;
        })
        .delay(100)
        .start();

      new TWEEN.Tween(geometry.vertices[node.faces[2][k]])
        .to({ y: 0 }, duration)
        .onUpdate(() => {
          geometry.verticesNeedUpdate = true;
        })
        .delay(100)
        .start();
    });
  }
}

/**
 * Calculate path "length". (Behavior kept the same as original: returns path.length)
 * If a segment is diagonal (direction contains '-'), it increments by √2 internally,
 * but the function still returns path.length (legacy behavior).
 */
export function getDistanceFromPath(path: Array<{ direction: string }>) {
  let len = 0;
  path.forEach((p) => {
    if (p.direction.includes('-'))
      len += Number(Math.sqrt(2).toFixed(2));
    else ++len;
  });
  // Keep original return to avoid changing UI/logic elsewhere
  return path.length;
}

function lerp(a: number, b: number, t: number) {
  return a * (1 - t) + b * t;
}

/** Linear interpolation smoothing for {x,z} waypoints */
export function smoothPath1(
  path: Array<{ x: number; z: number }>,
  stepsPerSegment = 5,
) {
  const smoothed: Array<{ x: number; z: number }> = [];
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    for (let t = 0; t <= 1; t += 1 / stepsPerSegment) {
      smoothed.push({ x: lerp(a.x, b.x, t), z: lerp(a.z, b.z, t) });
    }
  }
  smoothed.push(path[path.length - 1]); // add last point
  return smoothed;
}

/** Quadratic-ish Bezier smoothing across chunks of the path */
export function smoothPathWithBezier(
  path: Array<{ x: number; z: number }>,
  numSegments = 10,
) {
  const smoothed: Array<{ x: number; z: number }> = [];
  const step = 1 / numSegments;

  for (let i = 0; i < path.length - 4; i++) {
    const p0 = path[i];
    const p3 = path[i + 4];
    const p1 = { x: (p0.x + p3.x) / 2, z: (p0.z + p3.z) / 2 };
    const p2 = { x: (p0.x + 2 * p1.x + p3.x) / 4, z: (p0.z + 2 * p1.z + p3.z) / 4 };

    for (let t = 0; t <= 1; t += step) {
      const x
        = (1 - t) ** 3 * p0.x
          + 3 * (1 - t) ** 2 * t * p1.x
          + 3 * (1 - t) * t ** 2 * p2.x
          + t ** 3 * p3.x;
      const z
        = (1 - t) ** 3 * p0.z
          + 3 * (1 - t) ** 2 * t * p1.z
          + 3 * (1 - t) * t ** 2 * p2.z
          + t ** 3 * p3.z;

      smoothed.push({ x, z });
    }
  }

  smoothed.push(path[path.length - 1]); // add last point
  return smoothed;
}

/** Cubic Bezier helper for {x,z} points */
function cubicBezier(
  p0: { x: number; z: number },
  p1: { x: number; z: number },
  p2: { x: number; z: number },
  p3: { x: number; z: number },
  t: number,
) {
  const cX = 3 * (p1.x - p0.x);
  const bX = 3 * (p2.x - p1.x) - cX;
  const aX = p3.x - p0.x - cX - bX;

  const cZ = 3 * (p1.z - p0.z);
  const bZ = 3 * (p2.z - p1.z) - cZ;
  const aZ = p3.z - p0.z - cZ - bZ;

  return {
    x: aX * t ** 3 + bX * t ** 2 + cX * t + p0.x,
    z: aZ * t ** 3 + bZ * t ** 2 + cZ * t + p0.z,
  };
}

/**
 * Convert path points to a smoother set using cubic Bezier blending.
 * NOTE: Logic kept as-is to preserve identical visuals/behavior.
 */
export function smoothPath(points: Array<{ x: number; z: number }>) {
  const out: Array<{ x: number; z: number }> = [];

  for (let i = 0; i < points.length - 3; i++) {
    const p0 = i === 0 ? points[i] : points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 3];
    const p3 = i === points.length - 2 ? points[i + 1] : points[i + 2];

    for (let t = 0; t <= 1; t += 0.1) {
      out.push(cubicBezier(p0, p1, p2, p3, t)); // step size kept the same
    }
  }

  return out;
}
