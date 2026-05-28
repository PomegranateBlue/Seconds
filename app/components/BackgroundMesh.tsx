export default function BackgroundMesh() {
  const SIZE = 50;
  const HALF = SIZE / 2;
  const THICKNESS = 0.2;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -HALF, 0]}>
        <planeGeometry args={[SIZE, SIZE]} />
        <meshStandardMaterial color="#5a4632" roughness={0.9} />
      </mesh>

      <mesh position={[0, 0, -HALF]}>
        <boxGeometry args={[SIZE, SIZE, THICKNESS]} />
        <meshStandardMaterial color="#9aa0a6" />
      </mesh>

      <mesh position={[0, 0, HALF]}>
        <boxGeometry args={[SIZE, SIZE, THICKNESS]} />
        <meshStandardMaterial color="#9aa0a6" />
      </mesh>

      <mesh position={[-HALF, 0, 0]}>
        <boxGeometry args={[THICKNESS, SIZE, SIZE]} />
        <meshStandardMaterial color="#b0b6bc" />
      </mesh>

      <mesh position={[HALF, 0, 0]}>
        <boxGeometry args={[THICKNESS, SIZE, SIZE]} />
        <meshStandardMaterial color="#b0b6bc" />
      </mesh>
    </group>
  );
}
