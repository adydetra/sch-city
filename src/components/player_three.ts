// components/player_three.tsx
import * as THREE from 'three';
import { Capsule } from 'three/examples/jsm/math/Capsule';
import loadGltf from '@/utils/loaders';
import capsuleHelper from './capsuleHelper';
import { scene } from './common/scene';

type ActionMap = Record<string, THREE.AnimationAction>;

class Player {
  // Core objects
  private player: THREE.Object3D | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private allActions: ActionMap = {};
  private currentAction: THREE.AnimationAction | null = null;

  // Physics / movement
  private playerCapsule!: Capsule;
  private playerColliderHelper!: THREE.Group;
  private playerFixVector!: THREE.Vector3; // offset so feet touch the ground
  private playerVelocity!: THREE.Vector3;
  private playerDirection!: THREE.Vector3;
  private playerOnFloor = false;
  private GRAVITY = 10;

  // Input state
  private keyStates = {
    W: false,
    A: false,
    S: false,
    D: false,
    Space: false,
  };

  private playerActionState!: { forward: number; turn: number };

  // External deps
  private container: HTMLElement | null;
  private gui: any;
  private worldOctree: any; // keep as any (depends on your octree impl)

  // Capsule size
  private R = 0.35;
  private H = 1.85;

  constructor(container: HTMLElement | null, gui: any, worldOctree: any) {
    this.container = container;
    this.gui = gui;
    this.worldOctree = worldOctree;
    this.init();
  }

  /** Basic init for vectors, collider, and state */
  private init() {
    // Collider capsule (Z-up in this scene setup)
    this.playerCapsule = new Capsule(new THREE.Vector3(0, 0, this.R), new THREE.Vector3(0, 0, this.H - this.R), this.R);

    // Visual helper for the capsule
    this.playerColliderHelper = capsuleHelper(this.R, this.H);

    // Movement helpers
    this.playerFixVector = new THREE.Vector3(0, 0, 0.35);
    this.playerVelocity = new THREE.Vector3();
    this.playerDirection = new THREE.Vector3();

    // Action state (forward: -1..1, turn: -1..1)
    this.playerActionState = { forward: 0, turn: 0 };
  }

  /** Forward vector (world) */
  private getForwardVector() {
    if (!this.player)
      return this.playerDirection.set(0, 0, 1);
    this.player.getWorldDirection(this.playerDirection);
    this.playerDirection.normalize();
    return this.playerDirection;
  }

  /** Side vector (strafe) */
  private getSideVector() {
    if (!this.player)
      return this.playerDirection.set(1, 0, 0);
    this.player.getWorldDirection(this.playerDirection);
    this.playerDirection.normalize();
    if (this.playerActionState.forward !== 0) {
      this.playerDirection.cross(this.player!.up);
    }
    return this.playerDirection;
  }

  /** Handle input → velocity changes (no integration) */
  private controls(deltaTime: number) {
    const speedDelta = deltaTime * (this.playerOnFloor ? 25 : 8);

    if (this.keyStates.W || this.keyStates.S) {
      this.playerVelocity.add(this.getForwardVector().multiplyScalar(speedDelta));
    }
    if (this.keyStates.A || this.keyStates.D) {
      this.playerVelocity.add(this.getSideVector().multiplyScalar(speedDelta));
    }
    if (this.playerOnFloor && this.keyStates.Space) {
      this.playerVelocity.z = 50;
    }
  }

  /** Capsule vs world collisions */
  private playerCollisions() {
    const result = this.worldOctree?.capsuleIntersect?.(this.playerCapsule);
    this.playerOnFloor = false;

    if (result) {
      this.playerOnFloor = result.normal.z > 0;
      if (!this.playerOnFloor) {
        // slide along surface
        this.playerVelocity.addScaledVector(result.normal, -result.normal.dot(this.playerVelocity));
      }
      this.playerCapsule.translate(result.normal.multiplyScalar(result.depth));
    }
  }

  /** Integrate velocity and update character transform */
  private updatePlayer(deltaTime: number) {
    if (!this.player)
      return;

    let speedRatio = 4;
    let damping = Math.exp(-20 * deltaTime) - 1;

    // Gravity when airborne
    if (!this.playerOnFloor) {
      this.playerVelocity.z -= this.GRAVITY * deltaTime;
      damping *= 0.1; // air drag
      speedRatio = 3;
    }

    // Inertia
    this.playerVelocity.addScaledVector(this.playerVelocity, damping);

    // Facing & basic locomotion state → animation
    if (this.playerActionState.forward > 0) {
      if (this.playerActionState.turn !== 0) {
        this.player.rotation.y -= this.playerActionState.turn * deltaTime;
      }
      else {
        this.player.rotation.y = Math.PI;
      }
      this.changeAction('run');
    }
    else if (this.playerActionState.forward < 0) {
      if (this.playerActionState.turn !== 0) {
        this.player.rotation.y += this.playerActionState.turn * deltaTime;
      }
      else {
        this.player.rotation.y = 0;
      }
      this.changeAction('run');
    }
    else if (this.playerActionState.turn !== 0) {
      this.changeAction('run');
      this.player.rotation.y = this.playerActionState.turn * (Math.PI / 2);
    }
    else {
      this.changeAction('idle');
    }

    // Distance = velocity * time
    const deltaPosition = this.playerVelocity.clone().multiplyScalar(deltaTime * speedRatio);

    // Vertical uses original scale (don’t amplify by speedRatio)
    deltaPosition.z /= speedRatio;

    this.playerCapsule.translate(deltaPosition);

    // Resolve collisions and apply correction
    this.playerCollisions();

    // Apply capsule position to mesh (with ground offset)
    this.player.position.copy(new THREE.Vector3().subVectors(this.playerCapsule.start, this.playerFixVector));
  }

  /** Switch animation action */
  private changeAction(actionName: string) {
    const next = this.allActions[actionName];
    if (!next)
      return;
    if (this.currentAction?.getClip().name === actionName)
      return;
    this.executeCrossFade(actionName);
  }

  /** Cross-fade between current action and target action */
  private executeCrossFade(actionName: string) {
    const next = this.allActions[actionName];
    if (!next)
      return;

    next.enabled = true;
    next.setEffectiveTimeScale(1);
    next.setEffectiveWeight(1);
    next.time = 0;

    if (this.currentAction) {
      this.currentAction.crossFadeTo(next, 0.35, true);
    }
    this.currentAction = next;
  }

  /** Per-frame update: input → integrate → (optional extra) */
  public playerUpdate(deltaTime: number) {
    this.controls(deltaTime);
    this.updatePlayer(deltaTime);
  }

  /** Keyboard listeners (WASD + Space) */
  private keyListen = () => {
    document.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'KeyW':
          this.keyStates.W = true;
          this.playerActionState.forward = 1;
          break;
        case 'KeyA':
          this.keyStates.A = true;
          this.playerActionState.turn = -1;
          break;
        case 'KeyS':
          this.keyStates.S = true;
          this.playerActionState.forward = -1;
          break;
        case 'KeyD':
          this.keyStates.D = true;
          this.playerActionState.turn = 1;
          break;
        case 'Space':
          this.keyStates.Space = true;
          break;
      }
    });

    document.addEventListener('keyup', (event) => {
      switch (event.code) {
        case 'KeyW':
          this.keyStates.W = false;
          if (this.playerActionState.forward === 1)
            this.playerActionState.forward = 0;
          break;
        case 'KeyA':
          this.keyStates.A = false;
          if (this.playerActionState.turn === -1)
            this.playerActionState.turn = 0;
          break;
        case 'KeyS':
          this.keyStates.S = false;
          if (this.playerActionState.forward === -1)
            this.playerActionState.forward = 0;
          break;
        case 'KeyD':
          this.keyStates.D = false;
          if (this.playerActionState.turn === 1)
            this.playerActionState.turn = 0;
          break;
        case 'Space':
          this.keyStates.Space = false;
          break;
      }
    });
  };

  /** Load character, setup animations, GUI toggles, and input */
  public playerInit() {
    loadGltf('Xbot.glb').then((gltf: any) => {
      // Mesh
      this.player = gltf.scene;
      this.player.rotateX(Math.PI / 2);
      scene.add(this.player);
      this.player.add(this.playerColliderHelper);

      // Cast shadows
      this.player.traverse((obj: any) => {
        if (obj.isMesh)
          obj.castShadow = true;
      });

      // Animations
      const animations: THREE.AnimationClip[] = gltf.animations || [];
      this.mixer = new THREE.AnimationMixer(this.player);

      for (const clip of animations) {
        const action = this.mixer.clipAction(clip);
        // default weights: idle = 1, others = 0
        action.weight = clip.name === 'idle' ? 1.0 : 0.0;
        action.play();
        this.allActions[clip.name] = action;
      }

      this.currentAction = this.allActions.idle ?? null;

      // Keyboard
      this.keyListen();
    });

    // GUI: toggle collider helper visibility
    if (this.gui) {
      const cfg = { colliderHelper: true };
      this.gui.add(cfg, 'colliderHelper').onChange((v: boolean) => {
        this.playerColliderHelper.visible = v;
      });
    }
  }
}

export default Player;
