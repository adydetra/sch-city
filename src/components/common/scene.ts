import * as THREE from 'three';

let scene = new THREE.Scene();

function createScene() {
  if (scene)
    return scene;
  scene = new THREE.Scene();
  return scene;
}

function clearScene() {
  scene = null;
}

export { clearScene, createScene, scene };
