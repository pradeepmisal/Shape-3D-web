import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface Props {
  meshData: number[];
}

export const Canvas3D: React.FC<Props> = ({ meshData }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x090b12, 1);
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    scene.add(new THREE.AmbientLight(0xffffff, 0.45));

    const key = new THREE.DirectionalLight(0xffffff, 1.15);
    key.position.set(300, 500, 400);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x9cc2ff, 0.45);
    fill.position.set(-300, -200, -400);
    scene.add(fill);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
    camera.position.set(0, 0, 800);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controlsRef.current = controls;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      const nextWidth = mountRef.current.clientWidth;
      const nextHeight = mountRef.current.clientHeight;
      cameraRef.current.aspect = nextWidth / nextHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(nextWidth, nextHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (meshRef.current) {
      scene.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      (meshRef.current.material as THREE.Material).dispose();
      meshRef.current = null;
    }

    if (meshData.length === 0) return;

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;

    for (let i = 0; i < meshData.length; i += 3) {
      minX = Math.min(minX, meshData[i]);
      maxX = Math.max(maxX, meshData[i]);
      minY = Math.min(minY, meshData[i + 1]);
      maxY = Math.max(maxY, meshData[i + 1]);
      minZ = Math.min(minZ, meshData[i + 2]);
      maxZ = Math.max(maxZ, meshData[i + 2]);
    }

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const cz = (minZ + maxZ) / 2;

    const positions: number[] = [];
    for (let i = 0; i < meshData.length; i += 3) {
      positions.push(
        meshData[i] - cx,
        -(meshData[i + 1] - cy),
        meshData[i + 2] - cz,
      );
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhongMaterial({
      color: 0x6ee7ff,
      emissive: 0x07111a,
      specular: 0xffffff,
      shininess: 70,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    const size = Math.max(maxX - minX, maxY - minY, maxZ - minZ) || 1;
    const camera = cameraRef.current;
    if (!camera) return;

    camera.position.set(0, 0, size * 1.8);
    camera.near = size * 0.01;
    camera.far = size * 20;
    camera.updateProjectionMatrix();

    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
    }
  }, [meshData]);

  return (
    <div
      ref={mountRef}
      className="h-full w-full"
      style={{ background: "radial-gradient(circle at top, #23304d 0%, #0b0f17 55%, #06070b 100%)" }}
    />
  );
};
