// components/author.tsx
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { Font } from 'three/examples/jsm/loaders/FontLoader';
import my_font from '@/resources/fonts/optimer_regular.typeface.json';
import { load_font } from '@/utils/loaders';

let font: Font | undefined;

// Default materials: front (flat) + side
const materials: THREE.MeshPhongMaterial[] = [new THREE.MeshPhongMaterial({ color: 0xFFFFFF, flatShading: true }), new THREE.MeshPhongMaterial({ color: 0xFFFFFF })];

// Text options (dipertahankan agar hasil sama)
const TEXT = 'three.js';
const OPTS = {
  size: 10,
  height: 4,
  curveSegments: 12,
  bevelEnabled: true,
  bevelThickness: 2,
  bevelSize: 1,
};

// Muat font via loader (sesuai perilaku lama).
// Panggil ini sekali sebelum createText().
function loadFont() {
  load_font.load('optimer_regular.typeface.json', (res) => {
    font = res;
  });
}

// Buat mesh teks 3D. Jika font belum termuat, fallback ke bundled JSON.
function createText() {
  const f = font ?? new Font(my_font as any);

  const geo = new TextGeometry(TEXT, {
    font: f,
    size: OPTS.size,
    height: OPTS.height,
    curveSegments: OPTS.curveSegments,
    bevelEnabled: OPTS.bevelEnabled,
    bevelThickness: OPTS.bevelThickness,
    bevelSize: OPTS.bevelSize,
  });

  const mesh = new THREE.Mesh(geo, materials);

  // Orientasi sama seperti kode lama: rotate -90° di X
  mesh.rotation.set(-Math.PI / 2, 0, 0);

  return mesh;
}

export { createText, loadFont };
