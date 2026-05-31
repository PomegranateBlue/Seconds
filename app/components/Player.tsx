"use client";

import { RigidBody, RapierRigidBody } from "@react-three/rapier";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { ControlName } from "../lib/KeyMap";

export default function Player() {
  const moveSpeed = 5;
  const ref = useRef<RapierRigidBody>(null);
  const [, get] = useKeyboardControls<ControlName>();

  useFrame(() => {
    if (!ref.current) return;
    const { forward, backward, left, right } = get();
    const x = (right ? 1 : 0) - (left ? 1 : 0);
    const z = (backward ? 1 : 0) - (forward ? 1 : 0);

    const y = ref.current.linvel().y; // 중력 보존

    ref.current.setLinvel({ x: x * moveSpeed, y, z: z * moveSpeed }, true);
  });
  return (
    <RigidBody
      ref={ref}
      colliders="ball"
      position={[0, 2, 0]}
      restitution={0.7}
    >
      <mesh>
        <sphereGeometry />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    </RigidBody>
  );
}
