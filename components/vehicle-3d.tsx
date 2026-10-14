"use client";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  Box3,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PMREMGenerator,
  Vector3,
  MathUtils,
  type Material,
  type Group,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { useDevicePreferences } from "./device-preferences";
export type SceneProps = {
  asset: string;
  paint: string;
  angle: number;
  elevation: number;
  distance: number;
  colour: string;
  interior: boolean;
  animate: boolean;
  dragging?: boolean;
  onReady?: () => void;
  onOrbit?: (angle: number) => void;
};
function RealCar({
  asset,
  paint,
  angle,
  colour,
  interior,
  animate,
  dragging,
  onReady,
  onOrbit,
}: SceneProps) {
  const { tier, reducedMotion, mode } = useDevicePreferences();
  const gltf = useLoader(GLTFLoader, asset, (loader) => {
    const draco = new DRACOLoader();
    draco.setWorkerLimit(tier === "enhanced" ? 2 : 1);
    draco.setDecoderPath("/models/draco/");
    draco.setDecoderConfig({ type: "wasm" });
    loader.setDRACOLoader(draco);
  });
  const model = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((node) => {
      if (node instanceof Mesh) {
        node.material = Array.isArray(node.material)
          ? node.material.map((m) => m.clone())
          : node.material.clone();
        node.castShadow = tier === "enhanced";
        for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
          if ("map" in material && material.map)
            material.map.anisotropy = tier === "enhanced" ? 8 : 2;
        }
      }
    });
    const box = new Box3().setFromObject(clone);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const scale = 4.5 / Math.max(size.x, size.z);
    clone.scale.setScalar(scale);
    clone.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
    return clone;
  }, [gltf, tier]);
  const bodyMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: colour,
        metalness: 0.85,
        roughness: 0.28,
        clearcoat: tier === "enhanced" ? 1 : 0,
        clearcoatRoughness: 0.08,
      }),
    [tier],
  );
  const glassMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: "#b9d0e4",
        metalness: 0.1,
        roughness: 0.12,
        transparent: true,
        opacity: 0.25,
        depthWrite: false,
      }),
    [],
  );
  const rims = useMemo(
    () => new MeshStandardMaterial({ color: "#c9d1dc", metalness: 0.9, roughness: 0.3 }),
    [],
  );
  const invalidate = useThree((state) => state.invalidate);
  const notified = useRef(false);
  const settling = useRef(false);
  useEffect(() => {
    bodyMaterial.color.set(colour);
    bodyMaterial.transparent = interior;
    bodyMaterial.opacity = interior ? 0.12 : 1;
    bodyMaterial.depthWrite = !interior;
    bodyMaterial.needsUpdate = true;
    model.traverse((node) => {
      if (node instanceof Mesh) {
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        if (node.name === "body" || materials.some((material) => material.name === paint)) {
          bodyMaterial.name = paint;
          node.material = bodyMaterial;
        }
      }
    });
    const glass = model.getObjectByName("glass");
    if (glass instanceof Mesh) {
      glass.material = glassMaterial;
      glass.visible = !interior;
    }
    for (const name of ["rim_fl", "rim_fr", "rim_rl", "rim_rr", "trim"]) {
      const mesh = model.getObjectByName(name);
      if (mesh instanceof Mesh) mesh.material = rims;
    }
    invalidate();
  }, [model, bodyMaterial, glassMaterial, rims, colour, interior, invalidate, paint]);
  useEffect(
    () => () => {
      const materials = new Set<Material>();
      model.traverse((node) => {
        if (node instanceof Mesh)
          (Array.isArray(node.material) ? node.material : [node.material]).forEach((m) =>
            materials.add(m),
          );
      });
      materials.forEach((m) => m.dispose());
      bodyMaterial.dispose();
      glassMaterial.dispose();
      rims.dispose();
    },
    [model, bodyMaterial, glassMaterial, rims],
  );
  useEffect(() => {
    settling.current = false;
    invalidate();
  }, [animate, angle, dragging, reducedMotion, mode, invalidate]);
  const rotating = useRef<Group>(null);
  const initialAngle = useRef(angle);
  const lastOrbit = useRef(0);
  useFrame((_, delta) => {
    if (!notified.current) {
      notified.current = true;
      requestAnimationFrame(() => onReady?.());
    }
    const group = rotating.current;
    if (!group) return;
    if (animate) {
      group.rotation.y += Math.min(delta, 0.05) * 0.3;
      const now = performance.now();
      if (now - lastOrbit.current > 100) {
        onOrbit?.(Math.atan2(Math.sin(group.rotation.y), Math.cos(group.rotation.y)));
        lastOrbit.current = now;
      }
      invalidate();
    } else {
      const difference = Math.atan2(
        Math.sin(angle - group.rotation.y),
        Math.cos(angle - group.rotation.y),
      );
      if (Math.abs(difference) > 0.0001) {
        const timestep = settling.current ? Math.min(delta, 0.25) : 1 / 60;
        settling.current = true;
        group.rotation.y =
          reducedMotion || mode === "reduced" || dragging
            ? group.rotation.y + difference
            : MathUtils.damp(group.rotation.y, group.rotation.y + difference, 12, timestep);
        invalidate();
      }
    }
  });
  return (
    <group ref={rotating} rotation={[0, initialAngle.current, 0]}>
      <primitive object={model} dispose={null} />
    </group>
  );
}
function Studio({
  distance,
  elevation,
  dragging,
}: {
  distance: number;
  elevation: number;
  dragging?: boolean;
}) {
  const { camera, gl, scene, invalidate } = useThree();
  const { reducedMotion, mode } = useDevicePreferences();
  const settling = useRef(false);
  const target = useMemo(() => new Vector3(distance, elevation, -distance), [distance, elevation]);
  useEffect(() => {
    settling.current = false;
    camera.lookAt(0, 0.65, 0);
    invalidate();
  }, [camera, target, dragging, reducedMotion, mode, invalidate]);
  useFrame((_, delta) => {
    if (camera.position.distanceToSquared(target) > 0.000001) {
      const timestep = settling.current ? Math.min(delta, 0.25) : 1 / 60;
      settling.current = true;
      if (reducedMotion || mode === "reduced" || dragging) camera.position.copy(target);
      else camera.position.lerp(target, 1 - Math.exp(-12 * timestep));
      camera.lookAt(0, 0.65, 0);
      invalidate();
    }
  });
  useEffect(() => {
    const generator = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const environment = generator.fromScene(room, 0.04);
    scene.environment = environment.texture;
    invalidate();
    return () => {
      scene.environment = null;
      environment.dispose();
      room.dispose();
      generator.dispose();
    };
  }, [gl, scene, invalidate]);
  return null;
}
export default function Vehicle3D(props: SceneProps) {
  const { tier, maxDpr } = useDevicePreferences();
  const [softwareRendering, setSoftwareRendering] = useState(false);
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, softwareRendering ? 1 : maxDpr]}
      shadows={tier === "enhanced" && !softwareRendering}
      onCreated={({ gl }) => {
        const context = gl.getContext();
        const info = context.getExtension("WEBGL_debug_renderer_info");
        const renderer = info ? String(context.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
        setSoftwareRendering(
          /swiftshader|llvmpipe|softpipe|software|basic render driver/i.test(renderer),
        );
      }}
      gl={{
        antialias: tier !== "reduced",
        powerPreference:
          tier === "enhanced" ? "high-performance" : tier === "reduced" ? "low-power" : "default",
      }}
      camera={{ position: [props.distance, props.elevation, -props.distance], fov: 36 }}
    >
      <Studio distance={props.distance} elevation={props.elevation} dragging={props.dragging} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[-4, 2, -3]} color="#b9d7ff" intensity={0.8} />
      <directionalLight position={[1, 4, -5]} color="#fff1de" intensity={1.1} />
      <directionalLight
        position={[3, 6, 4]}
        intensity={1.5}
        castShadow={tier === "enhanced"}
        shadow-mapSize={tier === "enhanced" ? [2048, 2048] : [512, 512]}
        shadow-normalBias={0.03}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <Suspense fallback={null}>
        <RealCar {...props} />
      </Suspense>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.015, 0]}
        receiveShadow={tier === "enhanced"}
      >
        <circleGeometry args={[3.6, 64]} />
        <meshStandardMaterial color="#050b16" roughness={1} envMapIntensity={0.25} />
      </mesh>
    </Canvas>
  );
}
