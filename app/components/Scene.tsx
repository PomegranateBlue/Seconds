"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import BackgroundMesh from "./BackgroundMesh";

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 2, 4], fov: 60 }}>
      <OrbitControls />

      <ambientLight intensity={0.4} />
      <directionalLight color="white" position={[5, 8, 5]} intensity={1} />

      <mesh>
        <sphereGeometry />
        <meshStandardMaterial color="hotpink" />
      </mesh>

      <BackgroundMesh />
    </Canvas>
  );
}
