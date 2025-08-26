import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

let pointerControls: PointerLockControls | null = null;
let collidableObjects: THREE.Object3D[] = [];

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let cameraY = 2.6;
let raycaster: THREE.Raycaster | null = null;

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let playerPos = new THREE.Vector3(50, 2, -70);

function initPlayer(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.Renderer) {
  pointerControls = new PointerLockControls(camera as THREE.PerspectiveCamera, renderer.domElement);

  // Klik untuk lock
  pointerControls.addEventListener('lock', () => {
    // console.log('Pointer Locked');
  });

  // ESC untuk unlock
  pointerControls.addEventListener('unlock', () => {
    // console.log('Pointer Unlocked');
  });

  const onKeyDown = (event: KeyboardEvent) => {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        moveForward = true;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        moveBackward = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        moveRight = true;
        break;
      case 'Space':
        if (canJump === true) velocity.y += 50;
        canJump = false;
        break;
    }
  };

  const onKeyUp = (event: KeyboardEvent) => {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        moveForward = false;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        moveLeft = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        moveBackward = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        moveRight = false;
        break;
    }
  };

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  // ⬇️ getObject() → object (non-deprecated)
  scene.add(pointerControls.object);

  raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);
}

function aupdatePlayer(delta: number) {
  if (!pointerControls || !raycaster) return;

  if (pointerControls.isLocked === true) {
    // ⬇️ getObject() → object
    raycaster.ray.origin.copy(pointerControls.object.position);

    const intersections = raycaster.intersectObjects([], false);
    const onObject = intersections.length > 0;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

    if (onObject === true) {
      velocity.y = Math.max(0, velocity.y);
      canJump = true;
    }

    pointerControls.moveRight(-velocity.x * delta);
    pointerControls.moveForward(-velocity.z * delta);

    // ⬇️ getObject() → object
    pointerControls.object.position.y += velocity.y * delta;

    if (pointerControls.object.position.y < cameraY) {
      velocity.y = 0;
      pointerControls.object.position.y = cameraY;
      canJump = true;
    }
  }
}

// Update player tiap frame (dipakai di SchoolCanvas)
function updatePlayer(delta: number) {
  if (!pointerControls) return;

  const playerSpeed = 100;

  // Inersia
  velocity.x -= velocity.x * 10.0 * delta;
  velocity.z -= velocity.z * 10.0 * delta;

  if (detectPlayerCollision() === false) {
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    if (moveForward || moveBackward) velocity.z += direction.z * playerSpeed * delta;
    if (moveLeft || moveRight) velocity.x += direction.x * playerSpeed * delta;

    pointerControls.moveRight(velocity.x * delta);   // geser XZ
    pointerControls.moveForward(velocity.z * delta); // maju/mundur
  } else {
    velocity.x = 0;
    velocity.z = 0;
  }

  velocity.y -= 9.8 * 50 * delta; // gravitasi

  if (detectOnObject()) {
    velocity.y = Math.max(0, velocity.y);
    canJump = true;
  }

  // ⬇️ getObject() → object
  pointerControls.object.position.y += velocity.y * delta;

  if (pointerControls.object.position.y < cameraY) {
    velocity.y = 0;
    pointerControls.object.position.y = cameraY;
    canJump = true;
  }
}

// Cek tabrakan depan/samping
function detectPlayerCollision() {
  if (!pointerControls) return false;

  let rotationMatrix: THREE.Matrix4 | undefined;
  const collisionDistance = 0.5;

  // Arah kamera
  let cameraDirection = pointerControls.getDirection(new THREE.Vector3(0, 0, 0)).clone();

  // Tentukan arah gerak (bukan arah pandang) → rotasi vektor
  if (moveBackward) {
    rotationMatrix = new THREE.Matrix4().makeRotationY(degreesToRadians(180));
  } else if (moveLeft) {
    rotationMatrix = new THREE.Matrix4().makeRotationY(degreesToRadians(90));
  } else if (moveRight) {
    rotationMatrix = new THREE.Matrix4().makeRotationY(degreesToRadians(270));
  }

  if (rotationMatrix) cameraDirection.applyMatrix4(rotationMatrix);

  // Ray dari posisi player
  const origin = pointerControls.object.position;
  const rayCaster = new THREE.Raycaster(origin, cameraDirection);

  return rayIntersect(rayCaster, collisionDistance);
}

// Cek apakah di atas suatu objek (untuk loncat/gravitasi)
function detectOnObject() {
  if (!pointerControls) return false;

  const collisionDistance = cameraY;
  const origin = pointerControls.object.position.clone();
  const rayCaster = new THREE.Raycaster(origin, new THREE.Vector3(0, -1, 0));

  return rayIntersect(rayCaster, collisionDistance);
}

// Raycast helper
function rayIntersect(ray: THREE.Raycaster, distance: number) {
  // `collidableObjects` berisi array Object3D (mis. scene.children)
  const intersects = ray.intersectObjects(collidableObjects, true);
  for (let i = 0; i < intersects.length; i++) {
    if (intersects[i].distance < distance) return true;
  }
  return false;
}

// Derajat → radian
function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function getPointerControl() {
  return pointerControls!;
}

// Inisialisasi daftar objek yang bisa ditabrak
function initCollidableObjects(objects: THREE.Object3D[]) {
  collidableObjects = objects || [];
}

// Ambil posisi player saat ini (cache)
function getPlayerPos() {
  return playerPos;
}

function setPlayerPos() {
  if (!pointerControls) return;
  playerPos = pointerControls.object.position.clone();
}

export {
  updatePlayer,
  initPlayer,
  getPointerControl,
  initCollidableObjects,
  getPlayerPos,
  setPlayerPos,
};
