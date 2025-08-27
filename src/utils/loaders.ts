// src/utils/loaders.ts
import type { LoadingManager } from 'three';
import { TextureLoader } from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Export const singletons (tidak melanggar import/no-mutable-exports)
export const load_gltf = new GLTFLoader();
export const load_texture = new TextureLoader();
export const load_font = new FontLoader();

/**
 * Initialize/override the LoadingManager for all shared loaders.
 * Panggil sekali sebelum mulai load asset.
 */
export function initLoaders(manager?: LoadingManager) {
  if (!manager)
    return;
  // Ubah properti .manager (boleh dimodifikasi) alih-alih reassign variabel export.
  load_gltf.manager = manager;
  load_texture.manager = manager;
  load_font.manager = manager;
}
