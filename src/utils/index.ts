import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { smoothPath } from '@/findPath/helper';

/** Convert world (x,z) to campus grid {row,col} */
export function vectorToCoord(x: number, z: number) {
  const row = z + 470;
  const col = x + 350;
  return { row, col };
}

/** Draw a single point at grid (row,col) */
export function drawPoint(row: number, col: number, color: THREE.ColorRepresentation) {
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
  const mat = new THREE.PointsMaterial({ size: 20, color });
  const point = new THREE.Points(geom, mat);
  point.position.set(col - 350, 1, row - 470);
  return point;
}

/** (Placeholder) Draw curve path – kept for backward-compat if imported elsewhere */
export function drawLine() {
  // Intentionally left empty (no-op placeholder)
}

/** Vertical light beam above a mesh */
export function drawLightLine(target: THREE.Object3D) {
  const worldPos = new THREE.Vector3();
  target.getWorldPosition(worldPos);

  const start: [number, number, number] = [worldPos.x, 0, worldPos.z];
  const end: [number, number, number] = [worldPos.x, worldPos.y + 100, worldPos.z];

  const geom = new LineGeometry();
  geom.setPositions([...start, ...end]);

  const mat = new LineMaterial({
    color: 0xFFF973,
    linewidth: 0.005,
  });

  const line = new Line2(geom, mat);
  return line;
}

/** Flowing/streaming road line built from a grid path */
export function drawStreamingRoadLight(
  road: Array<{ row: number; col: number }>,
) {
  // Convert grid to world coords and smooth the path
  const rawPoints = road.map(n => ({ x: n.col - 350, z: n.row - 470 }));
  const pts = smoothPath(rawPoints);

  const positions: number[] = [];
  const colors: number[] = [];

  pts.forEach((p) => {
    positions.push(p.x, 0.5, p.z);
    colors.push(1, 1, 0); // yellow-ish
  });

  const geom = new LineGeometry();
  geom.setPositions(positions);
  geom.setColors(colors);

  const mat = new LineMaterial({
    color: 0xFFFFFF,
    linewidth: 1, // world units (since worldUnits=true)
    vertexColors: true,
    worldUnits: true,
    alphaToCoverage: true,
  });

  const mesh = new Line2(geom, mat);
  mesh.scale.set(1, 1, 1);

  return { mesh };
}

/** Dispose geometry & material of a mesh-like object */
function clearCache(obj: THREE.Mesh | THREE.Line | THREE.Points | any) {
  obj.geometry?.dispose?.();

  // Handle single material or an array
  const mat = obj.material;
  if (Array.isArray(mat)) {
    mat.forEach(m => m?.dispose?.());
  }
  else {
    mat?.dispose?.();
  }
}

/** Recursively dispose children (geometry/material) and clear from scene */
export function removeObj(obj: THREE.Object3D) {
  if (obj.children?.length) {
    // copy to avoid mutation during iteration
    const children = obj.children.slice();
    children.forEach((child) => {
      if (child.children?.length) {
        removeObj(child);
      }
      else {
        clearCache(child as any);
        child.clear();
      }
    });
  }
  else {
    clearCache(obj as any);
  }
  obj.clear();
}

/** Pulsing shader circle (returns mesh + its material for external uniform updates) */
export function drawCircle() {
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mv;
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    uniform float time;
    void main() {
      float d = length(vUv - 0.5);
      float wave = sin(d * 40.0 + time * 2.0);
      vec3 color = vec3(0.5, 0.7, 0.9);
      gl_FragColor = vec4(color, 0.6 - wave);
    }
  `;

  const material = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0.0 } },
    vertexShader,
    fragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
  });

  const geometry = new THREE.CircleGeometry(75, 64);
  const circle = new THREE.Mesh(geometry, material);
  circle.position.set(658 - 350, 2, 158 - 470);
  circle.rotateX(Math.PI / 2);

  return { circle, material };
}

/** Simple basic circle (non-shader) */
export function drawCircle2() {
  const geometry = new THREE.CircleGeometry(50, 64);
  const material = new THREE.MeshBasicMaterial({
    color: 0x00FFFF,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
  });
  const circle = new THREE.Mesh(geometry, material);
  circle.position.set(658 - 350, 2, 158 - 470);
  circle.rotateX(Math.PI / 2);
  return circle;
}
