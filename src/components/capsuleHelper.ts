import * as THREE from 'three';

/**
 * Build a simple capsule helper (two hemispheres + open cylinder).
 * @param R radius of the capsule
 * @param H total height of the capsule
 */
export default function capsuleHelper(R: number, H: number): THREE.Group {
  const group = new THREE.Group();
  const material = new THREE.MeshLambertMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.5,
  });

  // hemisphere builder
  const makeHemisphere = (flip = false) => {
    const g = new THREE.SphereGeometry(R, 25, 25, 0, Math.PI * 2, 0, Math.PI / 2);
    if (flip) g.rotateX(Math.PI); // flip for bottom hemisphere
    return new THREE.Mesh(g, material);
  };

  // bottom hemisphere
  const bottom = makeHemisphere(true);
  bottom.position.y = R;
  group.add(bottom);

  // top hemisphere
  const top = makeHemisphere(false);
  top.position.set(0, H - R, 0);
  group.add(top);

  // middle cylinder (open-ended)
  const cylHeight = Math.max(0, H - 2 * R);
  const cylGeo = new THREE.CylinderGeometry(R, R, cylHeight, 32, 1, true);
  cylGeo.translate(0, cylHeight / 2 + R, 0);
  const cyl = new THREE.Mesh(cylGeo, material);
  group.add(cyl);

  return group;
}
