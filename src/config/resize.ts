// src/config/resize.ts
import type { PerspectiveCamera, WebGLRenderer } from 'three';

let camera: PerspectiveCamera | null = null;
let renderer: WebGLRenderer | null = null;

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

function resizeEvent() {
  if (!camera || !renderer)
    return;

  // Update viewport size
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function resizeEventListener(_camera: PerspectiveCamera, _renderer: WebGLRenderer) {
  camera = _camera;
  renderer = _renderer;
  window.addEventListener('resize', resizeEvent);
}

function removeResizeListener() {
  window.removeEventListener('resize', resizeEvent);
}

const boardConfig = {
  cols: 800,
  rows: 800,
  nodeDimensions: { width: 1, height: 1 },
};

export { boardConfig, removeResizeListener, resizeEventListener, sizes };
