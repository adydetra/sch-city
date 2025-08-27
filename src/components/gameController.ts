import { GUI } from 'dat.gui';
import * as THREE from 'three';
import { OctreeHelper } from 'three/examples/jsm/helpers/OctreeHelper';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Capsule } from 'three/examples/jsm/math/Capsule';
import { Octree } from 'three/examples/jsm/math/Octree';
import CapsuleHelper from './capsuleHelper';

// ---------- Config & globals ----------
const GRAVITY = 30;
const NUM_SPHERES = 100;
const SPHERE_RADIUS = 0.2;

const sphereGeometry = new THREE.IcosahedronGeometry(SPHERE_RADIUS, 5);
const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xDEDE8D });

interface SphereItem {
  mesh: THREE.Mesh;
  collider: THREE.Sphere;
  velocity: THREE.Vector3;
}

const spheres: SphereItem[] = [];
let sphereIdx = 0;

const gui = new GUI();
const worldOctree = new Octree();

// Player collider (Y-up)
const playerCollider = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1.5, 0), 0.35);
const playerColliderHelper = CapsuleHelper(0.35, 1.85);

// Offsets & movement state
const playerFixVector = new THREE.Vector3(0, 0.35, 0);
const playerVelocity = new THREE.Vector3();
const playerDirection = new THREE.Vector3();
let playerOnFloor = false;

let mouseTime = 0;
const ForwardHoldTimeClock = new THREE.Clock();
ForwardHoldTimeClock.autoStart = false;

let cameraMoveSensitivity = 0.4;
gui
  .add({ cameraMoveSensitivity }, 'cameraMoveSensitivity')
  .step(0.1)
  .min(0)
  .max(1)
  .onChange((v: number) => (cameraMoveSensitivity = v));

// Key state
const keyStates = {
  W: false,
  A: false,
  S: false,
  D: false,
  Space: false,
  leftMouseBtn: false,
};

// Animation state
const playerActionState = { forward: 0, turn: 0 };

// App handle injected from outside
interface ThreeApp {
  scene: THREE.Scene;
  camera: THREE.Camera;
  player: THREE.Object3D | null;
  mixer: THREE.AnimationMixer | null;
  allActions: Record<string, THREE.AnimationAction>;
  currentAction: THREE.AnimationAction | null;
  container: HTMLElement;
}

let app: ThreeApp | null = null;

// ---------- Helpers ----------
function getForwardVector() {
  if (!app?.player)
    return playerDirection.set(0, 0, -1);
  app.player.getWorldDirection(playerDirection);
  playerDirection.y = 0;
  return playerDirection.normalize();
}

function getSideVector() {
  if (!app?.player)
    return playerDirection.set(1, 0, 0);
  app.player.getWorldDirection(playerDirection);
  playerDirection.y = 0;
  playerDirection.normalize();
  return playerDirection.cross(app.player.up);
}

// ---------- Ball throwing ----------
function throwBall() {
  if (!app?.player)
    return;

  const sphere = spheres[sphereIdx];
  app.player.getWorldDirection(playerDirection);

  // spawn in front of the capsule end
  sphere.collider.center.copy(playerCollider.end).addScaledVector(playerDirection, playerCollider.radius * 1.5);

  // impulse depends on mouse hold duration
  const impulse = 15 + 30 * (1 - Math.exp((mouseTime - performance.now()) * 0.001));
  sphere.velocity.copy(playerDirection).multiplyScalar(impulse);
  sphere.velocity.addScaledVector(playerVelocity, 2);

  sphereIdx = (sphereIdx + 1) % spheres.length;
}

// ---------- Collision & movement ----------
function playerCollisions() {
  const result = worldOctree.capsuleIntersect(playerCollider);
  playerOnFloor = false;

  if (result) {
    playerOnFloor = result.normal.y > 0;
    if (!playerOnFloor) {
      playerVelocity.addScaledVector(result.normal, -result.normal.dot(playerVelocity));
    }
    playerCollider.translate(result.normal.multiplyScalar(result.depth));
  }
}

function updatePlayer(deltaTime: number) {
  if (!app?.player)
    return;

  let speedRatio = 1.5;
  let damping = Math.exp(-20 * deltaTime) - 1;

  if (!playerOnFloor) {
    playerVelocity.y -= GRAVITY * deltaTime;
    damping *= 0.1; // air drag
    speedRatio = 2;
  }

  playerVelocity.addScaledVector(playerVelocity, damping);

  // animation facing/turn
  if (playerActionState.forward > 0) {
    if (playerActionState.turn !== 0) {
      app.player.rotation.y -= playerActionState.turn * deltaTime * 2;
    }
    if (ForwardHoldTimeClock.getElapsedTime() > 2) {
      if (playerOnFloor)
        speedRatio = 4;
      changeAction('run');
    }
    else {
      changeAction('walk');
    }
  }
  else if (playerActionState.forward < 0) {
    changeAction('walk');
  }
  else if (playerActionState.turn !== 0) {
    changeAction('walk');
    app.player.rotation.y -= playerActionState.turn * deltaTime * 2;
  }
  else {
    changeAction('idle');
  }

  const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime * speedRatio);
  deltaPosition.y /= speedRatio; // do not amplify vertical

  playerCollider.translate(deltaPosition);
  playerCollisions();

  app.player.position.copy(new THREE.Vector3().subVectors(playerCollider.start, playerFixVector));
}

function controls(deltaTime: number) {
  const speedDelta = deltaTime * (playerOnFloor ? 25 : 8);

  if (keyStates.W)
    playerVelocity.add(getForwardVector().multiplyScalar(speedDelta));
  if (keyStates.S)
    playerVelocity.add(getForwardVector().multiplyScalar(-speedDelta));
  if (keyStates.A)
    playerVelocity.add(getSideVector().multiplyScalar(-speedDelta));
  if (keyStates.D)
    playerVelocity.add(getSideVector().multiplyScalar(speedDelta));

  if (playerOnFloor && keyStates.Space)
    playerVelocity.y = 15;
}

function teleportPlayerIfOob() {
  if (!app?.player)
    return;
  if (app.player.position.y <= -25) {
    playerCollider.start.set(0, 0.35, 0);
    playerCollider.end.set(0, 1, 0);
    playerCollider.radius = 0.35;
    app.player.position.copy(new THREE.Vector3().subVectors(playerCollider.start, playerFixVector));
    app.player.rotation.set(0, 0, 0);
  }
}

// ---------- Animation switching ----------
function changeAction(actionName: string) {
  if (!app?.allActions)
    return;
  const next = app.allActions[actionName];
  if (!next || app.currentAction?.getClip().name === actionName)
    return;
  executeCrossFade(next);
}

function executeCrossFade(next: THREE.AnimationAction) {
  if (!app)
    return;
  next.enabled = true;
  next.setEffectiveTimeScale(1);
  next.setEffectiveWeight(1);
  next.time = 0;
  app.currentAction?.crossFadeTo(next, 0.35, true);
  app.currentAction = next;
}

// ---------- Public update ----------
export function gameUpdate(deltaTime: number) {
  controls(deltaTime);
  updatePlayer(deltaTime);
  teleportPlayerIfOob();
}

// ---------- Init ----------
export default function gameInit(th: ThreeApp) {
  app = th;

  // pooled spheres
  for (let i = 0; i < NUM_SPHERES; i++) {
    const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    app.scene.add(mesh);

    spheres.push({
      mesh,
      collider: new THREE.Sphere(new THREE.Vector3(0, -100, 0), SPHERE_RADIUS),
      velocity: new THREE.Vector3(),
    });
  }

  // keyboard
  let keyWDown = false;

  document.addEventListener('keydown', (e) => {
    switch (e.code) {
      case 'KeyW':
        keyStates.W = true;
        playerActionState.forward = 1;
        if (!keyWDown) {
          ForwardHoldTimeClock.start();
          keyWDown = true;
        }
        break;
      case 'KeyA':
        keyStates.A = true;
        playerActionState.turn = -1;
        break;
      case 'KeyS':
        keyStates.S = true;
        playerActionState.forward = -1;
        break;
      case 'KeyD':
        keyStates.D = true;
        playerActionState.turn = 1;
        break;
      case 'Space':
        keyStates.Space = true;
        break;
    }
  });

  document.addEventListener('keyup', (e) => {
    switch (e.code) {
      case 'KeyW':
        keyWDown = false;
        keyStates.W = false;
        ForwardHoldTimeClock.stop();
        ForwardHoldTimeClock.elapsedTime = 0;
        break;
      case 'KeyA':
        keyStates.A = false;
        break;
      case 'KeyS':
        keyStates.S = false;
        break;
      case 'KeyD':
        keyStates.D = false;
        break;
      case 'Space':
        keyStates.Space = false;
        break;
    }

    // recompute simple intent for animation
    playerActionState.forward = keyStates.W ? 1 : keyStates.S ? -1 : 0;
    playerActionState.turn = keyStates.A ? -1 : keyStates.D ? 1 : 0;
  });

  // mouse
  app.container.addEventListener('mousedown', (e) => {
    if (e.button === 0)
      keyStates.leftMouseBtn = true;
    mouseTime = performance.now();
  });

  document.addEventListener('mouseup', (e) => {
    if (document.pointerLockElement !== null)
      throwBall();
    if (e.button === 0)
      keyStates.leftMouseBtn = false;
  });

  document.body.addEventListener('mousemove', (e) => {
    if (!app?.player)
      return;
    if (keyStates.leftMouseBtn) {
      // clamp sensitivity
      cameraMoveSensitivity = Math.min(Math.max(cameraMoveSensitivity, 0.001), 1);
      app.player.rotation.y -= e.movementX / (cameraMoveSensitivity * 1000);
      (app.camera as any).rotation.x -= e.movementY / (cameraMoveSensitivity * 1000);
    }
  });

  // loaders
  const loader = new GLTFLoader().setPath('/models/');
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/draco/');
  loader.setDRACOLoader(dracoLoader);

  // collision world
  loader.load('collision-world.glb', (gltf) => {
    app!.scene.add(gltf.scene);
    worldOctree.fromGraphNode(gltf.scene);

    gltf.scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material?.map)
          child.material.map.anisotropy = 4;
      }
    });

    const helper = new OctreeHelper(worldOctree);
    helper.visible = false;
    app!.scene.add(helper);
    gui.add({ OctreeDebug: false }, 'OctreeDebug').onChange((v: boolean) => {
      helper.visible = v;
    });
  });

  // player model
  loader.load('Xbot.glb', (gltf) => {
    app!.player = gltf.scene;
    app!.scene.add(app!.player);
    app!.player.add(app!.camera);
    app!.player.add(playerColliderHelper);

    app!.player.traverse((o: any) => {
      if (o.isMesh)
        o.castShadow = true;
    });

    const animations: THREE.AnimationClip[] = gltf.animations;
    app!.mixer = new THREE.AnimationMixer(app!.player);
    app!.allActions = {};

    for (const clip of animations) {
      const action = app!.mixer.clipAction(clip);
      action.name = clip.name;
      action.weight = clip.name === 'idle' ? 1.0 : 0.0;
      action.play();
      app!.allActions[action.name] = action;
    }

    app!.currentAction = app!.allActions.idle ?? null;
  });

  gui.add({ colliderHelper: true }, 'colliderHelper').onChange((v: boolean) => {
    playerColliderHelper.visible = v;
  });
}
