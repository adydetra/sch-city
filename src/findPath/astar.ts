// src/findPath/astar.ts

// Minimal node shape used by the algorithm.
// (Dibiarkan longgar agar tetap kompatibel dengan pembuat grid di tempat lain)
interface Node {
  id: number;
  row: number;
  col: number;
  status: 'default' | 'wall' | 'visited';
  distance: number; // g(n)
  totalDistance: number; // f(n) = g(n) + h(n)
  heuristicDistance?: number; // h(n)
  direction?: string; // 'up' | 'down' | 'left' | 'right' | diagonal variants
  weight: number;
  previousNode?: Node | null;
  path?: string[] | null; // optional turn-by-turn (if used downstream)
}

/**
 * A* pathfinding.
 * @returns 'success!' bila target tercapai; false bila tidak ada jalur.
 */
export function astar(
  grid: Node[][],
  start: Node,
  target: Node,
  closedSet: Node[],
): 'success!' | false {
  // initialize
  start.distance = 0;
  start.totalDistance = 0;
  start.direction = 'right';

  let openSet: Node[] = [start];

  while (openSet.length) {
    const current = getClosestNode(openSet);
    if (current.distance === Infinity)
      return false;

    current.status = 'visited';
    closedSet.push(current);

    if (current.id === target.id)
      return 'success!';

    const neighbors = getNeighbors(current, grid);
    openSet.push(...neighbors);

    // keep only candidates we can still visit
    openSet = openSet.filter(n => n.status !== 'visited' && n.status !== 'wall');

    updateNeighbors(current, neighbors, target);
  }

  return false;
}

/** Pick node with the smallest f(n). Tie-breaker uses smaller h(n). */
function getClosestNode(openSet: Node[]) {
  let best: Node | undefined;
  let idx = -1;

  for (let i = 0; i < openSet.length; i++) {
    const n = openSet[i];
    if (!best || best.totalDistance > n.totalDistance) {
      best = n;
      idx = i;
    }
    else if (best.totalDistance === n.totalDistance) {
      if ((best.heuristicDistance ?? Infinity) > (n.heuristicDistance ?? Infinity)) {
        best = n;
        idx = i;
      }
    }
  }

  // remove from open set and return it
  openSet.splice(idx, 1);
  return best!;
}

/** Update all neighbors from current node. */
function updateNeighbors(current: Node, neighbors: Node[], target: Node) {
  for (const nb of neighbors) updateNode(current, nb, target);
}

/** Relaxation step for one neighbor. */
function updateNode(current: Node, targetNode: Node, actualTarget?: Node) {
  const [stepCost, path, newDir] = getDistance(current, targetNode);

  // lazily compute heuristic (Euclidean)
  if (targetNode.heuristicDistance == null && actualTarget) {
    targetNode.heuristicDistance = euclidDistance(targetNode, actualTarget);
  }

  const candidate = current.distance + targetNode.weight + stepCost;

  if (candidate < targetNode.distance) {
    targetNode.distance = candidate;
    targetNode.previousNode = current;
    targetNode.path = path;
    targetNode.direction = newDir;
    targetNode.totalDistance = targetNode.distance + (targetNode.heuristicDistance ?? 0);
  }
}

/** Collect valid neighbors (4-neigh + diagonals) that are not walls/visited. */
function getNeighbors(node: Node, grid: Node[][]) {
  const res: Node[] = [];
  const { row, col } = node;

  // 4-neighborhood
  if (row > 0)
    res.push(grid[row - 1][col]);
  if (row < grid.length - 1)
    res.push(grid[row + 1][col]);
  if (col > 0)
    res.push(grid[row][col - 1]);
  if (col < grid[0].length - 1)
    res.push(grid[row][col + 1]);

  // diagonals
  if (row > 0 && col < grid[0].length - 1)
    res.push(grid[row - 1][col + 1]);
  if (row > 0 && col > 0)
    res.push(grid[row - 1][col - 1]);
  if (row < grid.length - 1 && col < grid[0].length - 1)
    res.push(grid[row + 1][col + 1]);
  if (row < grid.length - 1 && col > 0)
    res.push(grid[row + 1][col - 1]);

  return res.filter(n => n.status !== 'visited' && n.status !== 'wall');
}

/**
 * Directional step cost + suggested turn/path + next direction.
 * Return shape: [cost, pathOrNull, newDirection]
 */
function getDistance(a: Node, b: Node): [number, string[] | null, string] {
  const x1 = a.row; const y1 = a.col;
  const x2 = b.row; const y2 = b.col;

  // neighbor is above
  if (x2 < x1 && y1 === y2) {
    if (a.direction === 'up')
      return [1, ['f'], 'up'];
    else if (a.direction === 'right')
      return [2, ['l', 'f'], 'up'];
    else if (a.direction === 'left')
      return [2, ['r', 'f'], 'up'];
    else if (a.direction === 'down')
      return [3, ['r', 'r', 'f'], 'up'];
    else if (a.direction === 'up-right')
      return [1.5, null, 'up'];
    else if (a.direction === 'down-right')
      return [2.5, null, 'up'];
    else if (a.direction === 'up-left')
      return [1.5, null, 'up'];
    else if (a.direction === 'down-left')
      return [2.5, null, 'up'];
  }
  // neighbor is below
  else if (x2 > x1 && y1 === y2) {
    if (a.direction === 'up')
      return [3, ['r', 'r', 'f'], 'down'];
    else if (a.direction === 'right')
      return [2, ['r', 'f'], 'down'];
    else if (a.direction === 'left')
      return [2, ['l', 'f'], 'down'];
    else if (a.direction === 'down')
      return [1, ['f'], 'down'];
    else if (a.direction === 'up-right')
      return [2.5, null, 'down'];
    else if (a.direction === 'down-right')
      return [1.5, null, 'down'];
    else if (a.direction === 'up-left')
      return [2.5, null, 'down'];
    else if (a.direction === 'down-left')
      return [1.5, null, 'down'];
  }
  // neighbor is left
  else if (y2 < y1 && x1 === x2) {
    if (a.direction === 'up')
      return [2, ['l', 'f'], 'left'];
    else if (a.direction === 'right')
      return [3, ['l', 'l', 'f'], 'left'];
    else if (a.direction === 'left')
      return [1, ['f'], 'left'];
    else if (a.direction === 'down')
      return [2, ['r', 'f'], 'left'];
    else if (a.direction === 'up-right')
      return [2.5, null, 'left'];
    else if (a.direction === 'down-right')
      return [2.5, null, 'left'];
    else if (a.direction === 'up-left')
      return [1.5, null, 'left'];
    else if (a.direction === 'down-left')
      return [1.5, null, 'left'];
  }
  // neighbor is right
  else if (y2 > y1 && x1 === x2) {
    if (a.direction === 'up')
      return [2, ['r', 'f'], 'right'];
    else if (a.direction === 'right')
      return [1, ['f'], 'right'];
    else if (a.direction === 'left')
      return [3, ['r', 'r', 'f'], 'right'];
    else if (a.direction === 'down')
      return [2, ['l', 'f'], 'right'];
    else if (a.direction === 'up-right')
      return [1.5, null, 'right'];
    else if (a.direction === 'down-right')
      return [1.5, null, 'right'];
    else if (a.direction === 'up-left')
      return [2.5, null, 'right'];
    else if (a.direction === 'down-left')
      return [2.5, null, 'right'];
  }
  // up-left
  else if (x2 < x1 && y1 > y2) {
    if (a.direction === 'up')
      return [1.5, null, 'up-left'];
    else if (a.direction === 'right')
      return [2.5, null, 'up-left'];
    else if (a.direction === 'left')
      return [1.5, null, 'up-left'];
    else if (a.direction === 'down')
      return [2.5, null, 'up-left'];
    else if (a.direction === 'up-right')
      return [2, null, 'up-left'];
    else if (a.direction === 'down-right')
      return [3, null, 'up-left'];
    else if (a.direction === 'up-left')
      return [1, null, 'up-left'];
    else if (a.direction === 'down-left')
      return [2, null, 'up-left'];
  }
  // up-right
  else if (x2 < x1 && y1 < y2) {
    if (a.direction === 'up')
      return [1.5, null, 'up-right'];
    else if (a.direction === 'right')
      return [1.5, null, 'up-right'];
    else if (a.direction === 'left')
      return [2.5, null, 'up-right'];
    else if (a.direction === 'down')
      return [2.5, null, 'up-right'];
    else if (a.direction === 'up-right')
      return [1, null, 'up-right'];
    else if (a.direction === 'down-right')
      return [2, null, 'up-right'];
    else if (a.direction === 'up-left')
      return [2, null, 'up-right'];
    else if (a.direction === 'down-left')
      return [3, null, 'up-right'];
  }
  // down-left
  else if (x2 > x1 && y1 > y2) {
    if (a.direction === 'up')
      return [2.5, null, 'down-left'];
    else if (a.direction === 'right')
      return [2.5, null, 'down-left'];
    else if (a.direction === 'left')
      return [1.5, null, 'down-left'];
    else if (a.direction === 'down')
      return [1.5, null, 'down-left'];
    else if (a.direction === 'up-right')
      return [3, null, 'down-left'];
    else if (a.direction === 'down-right')
      return [2, null, 'down-left'];
    else if (a.direction === 'up-left')
      return [2, null, 'down-left'];
    else if (a.direction === 'down-left')
      return [1, null, 'down-left'];
  }
  // down-right
  else if (x2 > x1 && y1 < y2) {
    if (a.direction === 'up')
      return [2.5, null, 'down-right'];
    else if (a.direction === 'right')
      return [1.5, null, 'down-right'];
    else if (a.direction === 'left')
      return [2.5, null, 'down-right'];
    else if (a.direction === 'down')
      return [1.5, null, 'down-right'];
    else if (a.direction === 'up-right')
      return [2, null, 'down-right'];
    else if (a.direction === 'down-right')
      return [1, null, 'down-right'];
    else if (a.direction === 'up-left')
      return [3, null, 'down-right'];
    else if (a.direction === 'down-left')
      return [2, null, 'down-right'];
  }

  // Fallback (shouldn't happen if neighbor logic is correct)
  return [1, null, a.direction || 'right'];
}

// --- Heuristics (kept for completeness; only Euclidean is used now) ---

/** Manhattan distance */
function manhattanDistance(a: Node, b: Node) {
  const dx = Math.abs(a.row - b.row);
  const dy = Math.abs(a.col - b.col);
  return dx + dy;
}

/** Diagonal distance (octile-like) */
function diagonalDistance(a: Node, b: Node) {
  const dx = Math.abs(a.row - b.row);
  const dy = Math.abs(a.col - b.col);
  return dx + dy + (Math.SQRT2 - 2.5) * Math.min(dx, dy);
}

/** Euclidean distance (scaled by 0.4 to match original behavior) */
function euclidDistance(a: Node, b: Node) {
  const dx = Math.abs(a.row - b.row);
  const dy = Math.abs(a.col - b.col);
  return 0.4 * Math.sqrt(dx * dx + dy * dy);
}
