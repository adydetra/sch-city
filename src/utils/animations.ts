// src/utils/animations.ts
import type * as THREE from 'three';
import { Easing, Tween } from 'three/examples/jsm/libs/tween.module.js';

interface Vec3Like { x: number; y: number; z: number }
interface ControlsLike {
  target: Vec3Like;
  update: () => void;
  enabled?: boolean;
}

const Animations = {
  /**
   * Smoothly move the camera and controls target.
   * Memindahkan kamera dan target OrbitControls dengan halus.
   */
  animateCamera(
    camera: THREE.Camera,
    controls: ControlsLike,
    newP: Vec3Like,
    newT: Vec3Like,
    time = 2000,
    cb?: () => void,
  ) {
    // Instant jump if time <= 0
    if (!time || time <= 0) {
      camera.position.set(newP.x, newP.y, newP.z);
      controls.target.x = newT.x;
      controls.target.y = newT.y;
      controls.target.z = newT.z;
      controls.update();
      if (typeof controls.enabled === 'boolean')
        controls.enabled = true;
      cb?.();
      return;
    }

    const tween = new Tween({
      x1: camera.position.x,
      y1: camera.position.y,
      z1: camera.position.z,
      x2: controls.target.x,
      y2: controls.target.y,
      z2: controls.target.z,
    })
      .to(
        { x1: newP.x, y1: newP.y, z1: newP.z, x2: newT.x, y2: newT.y, z2: newT.z },
        time,
      )
      .easing(Easing.Cubic.InOut)
      .onUpdate((o) => {
        camera.position.set(o.x1, o.y1, o.z1);
        controls.target.x = o.x2;
        controls.target.y = o.y2;
        controls.target.z = o.z2;
        controls.update();
      })
      .onComplete(() => {
        if (typeof controls.enabled === 'boolean')
          controls.enabled = true;
        cb?.();
      });

    tween.start();
  },
};

export default Animations;
