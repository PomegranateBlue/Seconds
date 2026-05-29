"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import BackgroundMesh from "./BackgroundMesh";
import { Physics } from "@react-three/rapier";
import Player from "./Player";

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 2, 4], fov: 60 }}>
      <Physics debug>
        <OrbitControls />

        <ambientLight intensity={0.4} />
        <directionalLight color="white" position={[5, 8, 5]} intensity={1} />

        {/* <RigidBody colliders="ball" position={[0, 2, 0]} restitution={0.7}>
          <mesh>
            <sphereGeometry />
            <meshStandardMaterial color="hotpink" />
          </mesh>
        </RigidBody> */}

        <Player />

        <BackgroundMesh />
      </Physics>
    </Canvas>
  );
}
