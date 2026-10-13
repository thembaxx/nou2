"use client";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";
function Model({ angle }: { angle: number }) {
  return (
    <group rotation={[0, angle, 0]}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[3.6, 0.6, 1.6]} />
        <meshStandardMaterial color="#4979bb" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-0.15, 1, 0]}>
        <boxGeometry args={[1.9, 0.6, 1.4]} />
        <meshStandardMaterial color="#151d2e" metalness={0.4} roughness={0.3} />
      </mesh>
      {[-1.1, 1.1].flatMap((x) =>
        [-0.82, 0.82].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.35, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.38, 0.38, 0.2, 24]} />
            <meshStandardMaterial color="#101015" />
          </mesh>
        )),
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <circleGeometry args={[3, 64]} />
        <meshStandardMaterial color="#1a2539" />
      </mesh>
    </group>
  );
}
export default function Vehicle3D() {
  const [angle, setAngle] = useState(0.65);
  return (
    <div>
      <div className="h-72" role="img" aria-label="Interactive schematic vehicle model">
        <Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ position: [5, 3, 5], fov: 40 }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[4, 6, 3]} intensity={3} />
          <Model angle={angle} />
        </Canvas>
      </div>
      <label className="label mt-4">
        Rotate schematic
        <input
          type="range"
          min={-3.14}
          max={3.14}
          step={0.05}
          value={angle}
          onChange={(e) => setAngle(Number(e.target.value))}
        />
      </label>
      <p className="mt-3 text-xs text-slate-400">
        Generic schematic. This is not a scan or representation of the listed vehicle.
      </p>
    </div>
  );
}
