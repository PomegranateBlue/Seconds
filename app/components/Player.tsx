"use client";

import { RigidBody } from "@react-three/rapier";

export default function Player() {
  return (
    <RigidBody colliders="ball" position={[0, 2, 0]} restitution={0.7}>
      <mesh>
        <sphereGeometry />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    </RigidBody>
  );
}
