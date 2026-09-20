'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export function FinancialFutureHero3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL support
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 450;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.8, 6.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Group for mouse parallax
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Grid base floor
    const gridHelper = new THREE.GridHelper(10, 20, 0x1B2A3D, 0x0E182A);
    gridHelper.position.y = -1.2;
    mainGroup.add(gridHelper);

    // 2. Trajectory Curve (3D Spline)
    const curvePoints = [
      new THREE.Vector3(-3.2, -0.6, 0.8),
      new THREE.Vector3(-1.8, -0.2, 0.4),
      new THREE.Vector3(-0.4, 0.4, 0.1),
      new THREE.Vector3(1.0, 0.2, -0.3),
      new THREE.Vector3(2.2, 1.1, -0.8),
      new THREE.Vector3(3.4, 1.8, -1.4),
    ];
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.045, 12, false);
    const tubeMaterial = new THREE.MeshStandardMaterial({
      color: 0x38BDF8,
      emissive: 0x22D3EE,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
    });
    const trajectoryTube = new THREE.Mesh(tubeGeometry, tubeMaterial);
    mainGroup.add(trajectoryTube);

    // 3. Glowing baseline secondary trajectory (Alternative scenario path)
    const altCurvePoints = [
      new THREE.Vector3(-3.2, -0.6, 0.8),
      new THREE.Vector3(-1.8, -0.5, 0.4),
      new THREE.Vector3(-0.4, -0.3, 0.1),
      new THREE.Vector3(1.0, -0.1, -0.3),
      new THREE.Vector3(2.2, 0.2, -0.8),
      new THREE.Vector3(3.4, 0.5, -1.4),
    ];
    const altCurve = new THREE.CatmullRomCurve3(altCurvePoints);
    const altTubeGeometry = new THREE.TubeGeometry(altCurve, 64, 0.02, 8, false);
    const altTubeMaterial = new THREE.MeshBasicMaterial({
      color: 0xFBBF24,
      transparent: true,
      opacity: 0.4,
      wireframe: true,
    });
    const altTube = new THREE.Mesh(altTubeGeometry, altTubeMaterial);
    mainGroup.add(altTube);

    // 4. Milestone Floating Nodes
    const nodesGroup = new THREE.Group();
    mainGroup.add(nodesGroup);

    const nodePositions = [
      { pos: curvePoints[1], color: 0x38BDF8, label: 'NOW', size: 0.12 },
      { pos: curvePoints[2], color: 0xF87171, label: 'Decision Point', size: 0.14 },
      { pos: curvePoints[4], color: 0x34D399, label: 'Goal Milestone', size: 0.16 },
      { pos: curvePoints[5], color: 0x22D3EE, label: 'Future Horizon', size: 0.18 },
    ];

    const nodeMeshes: THREE.Mesh[] = [];
    nodePositions.forEach(({ pos, color, size }) => {
      // Octahedron node
      const geom = new THREE.OctahedronGeometry(size, 0);
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.9,
        metalness: 0.9,
        roughness: 0.1,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(pos);
      nodesGroup.add(mesh);
      nodeMeshes.push(mesh);

      // Node outer halo ring
      const ringGeom = new THREE.RingGeometry(size * 1.5, size * 1.7, 16);
      const ringMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.copy(pos);
      ring.rotation.x = Math.PI / 2;
      nodesGroup.add(ring);
    });

    // 5. Upward Flowing Energy Stream (Income Particles)
    const particleCount = 70;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 6;
      particlePositions[i * 3 + 1] = Math.random() * 3 - 1;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 3;
      particleSpeeds[i] = 0.008 + Math.random() * 0.015;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x38BDF8,
      size: 0.045,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    mainGroup.add(particles);

    // 6. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x38BDF8, 3, 20);
    pointLight1.position.set(2, 4, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x34D399, 2, 20);
    pointLight2.position.set(-3, -1, 2);
    scene.add(pointLight2);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.35;
      targetY = y * 0.25;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth parallax
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;
      mainGroup.rotation.y = mouseX;
      mainGroup.rotation.x = mouseY;

      // Animate node rotations
      nodeMeshes.forEach((mesh, idx) => {
        mesh.rotation.y = elapsedTime * (0.8 + idx * 0.2);
        mesh.rotation.x = elapsedTime * 0.5;
      });

      // Animate particles flowing along Y
      const positions = particleGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += particleSpeeds[i];
        if (positions[i * 3 + 1] > 2.5) {
          positions[i * 3 + 1] = -1.2;
          positions[i * 3] = (Math.random() - 0.5) * 6;
        }
      }
      particleGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      tubeGeometry.dispose();
      tubeMaterial.dispose();
      altTubeGeometry.dispose();
      altTubeMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, []);

  if (!webglSupported) {
    return (
      <div className="relative flex h-full min-h-[380px] w-full items-center justify-center rounded-2xl border border-border/80 bg-panel/60 p-6 backdrop-blur">
        <div className="text-center">
          <div className="mx-auto size-16 rounded-full border border-primary/40 bg-primary/10 flex items-center justify-center">
            <div className="size-8 rounded-full bg-primary/80 animate-pulse" />
          </div>
          <p className="mt-4 font-display text-sm font-semibold text-foreground">3D Simulation Stream</p>
          <p className="mt-1 text-xs text-muted-foreground">Interactive financial projection trajectory</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[420px] w-full select-none overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-[#07101D]/90 to-[#050B14]/95 shadow-panel backdrop-blur">
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex items-center gap-2 rounded-full border border-border/70 bg-[#0B1422]/80 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
        <span className="size-2 rounded-full bg-primary animate-ping" />
        <span>Interactive 3D Trajectory • Move cursor to orbit</span>
      </div>
    </div>
  );
}