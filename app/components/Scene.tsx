"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, KeyboardControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import BackgroundMesh from "./BackgroundMesh";
import Player from "./Player";
import { KeyboardMap } from "../lib/KeyMap";

export default function Scene() {
  return (
    <KeyboardControls map={KeyboardMap}>
      <Canvas camera={{ position: [0, 2, 4], fov: 60 }}>
        <Physics debug>
          <OrbitControls />

          <ambientLight intensity={0.4} />
          <directionalLight color="white" position={[5, 8, 5]} intensity={1} />

          <Player />

          <BackgroundMesh />
        </Physics>
      </Canvas>
    </KeyboardControls>
  );
}
