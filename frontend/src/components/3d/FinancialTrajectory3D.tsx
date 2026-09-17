'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { ProjectionPoint } from '@/types/finance';

interface FinancialTrajectory3DProps {
  data: ProjectionPoint[];
  height?: number;
}

export function FinancialTrajectory3D({ data, height = 340 }: FinancialTrajectory3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !data || data.length === 0) return;

    const width = container.clientWidth || 600;
    const canvasHeight = height;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / canvasHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, canvasHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Coordinate grid
    const grid = new THREE.GridHelper(8, 16, 0x1B2A3D, 0x0E182A);
    grid.position.y = -1.0;
    mainGroup.add(grid);

    // Normalize data points into 3D space
    const minBalance = Math.min(...data.map((d) => d.balance));
    const maxBalance = Math.max(...data.map((d) => d.balance));
    const range = maxBalance - minBalance || 1;

    const points: THREE.Vector3[] = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 5.4 - 2.7;
      const y = ((d.balance - minBalance) / range) * 1.6 - 0.7;
      const z = -(i / (data.length - 1)) * 1.5;
      return new THREE.Vector3(x, y, z);
    });

    // Spline trajectory
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeom = new THREE.TubeGeometry(curve, 64, 0.038, 12, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x38BDF8,
      emissive: 0x22D3EE,
      emissiveIntensity: 0.7,
      roughness: 0.2,
      metalness: 0.8,
    });
    const tube = new THREE.Mesh(tubeGeom, tubeMat);
    mainGroup.add(tube);

    // Pillar supports & Milestone nodes
    const nodes: THREE.Mesh[] = [];
    points.forEach((pt, idx) => {
      const isMilestone = !!data[idx]?.milestone;
      const isStart = idx === 0;
      const isEnd = idx === data.length - 1;

      // Vertical marker line to floor
      const lineGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(pt.x, -1.0, pt.z),
        new THREE.Vector3(pt.x, pt.y, pt.z),
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: isMilestone ? 0xFBBF24 : 0x1B2A3D,
        transparent: true,
        opacity: isMilestone ? 0.8 : 0.4,
      });
      const line = new THREE.Line(lineGeom, lineMat);
      mainGroup.add(line);

      // Node sphere or diamond
      const nodeColor = isStart ? 0x38BDF8 : isMilestone ? 0xFBBF24 : isEnd ? 0x34D399 : 0x22D3EE;
      const nodeGeom = isMilestone ? new THREE.OctahedronGeometry(0.09) : new THREE.SphereGeometry(0.05, 12, 12);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: nodeColor,
        emissive: nodeColor,
        emissiveIntensity: 0.9,
      });
      const nodeMesh = new THREE.Mesh(nodeGeom, nodeMat);
      nodeMesh.position.copy(pt);
      mainGroup.add(nodeMesh);
      nodes.push(nodeMesh);
    });

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);
    const light = new THREE.PointLight(0x38BDF8, 2.5, 15);
    light.position.set(0, 3, 3);
    scene.add(light);

    // Mouse tilt
    let mouseX = 0;
    let targetX = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetX = x * 0.4;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      camera.aspect = w / canvasHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(w, canvasHeight);
    };
    window.addEventListener('resize', handleResize);

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      mouseX += (targetX - mouseX) * 0.05;
      mainGroup.rotation.y = mouseX;

      nodes.forEach((n, i) => {
        n.rotation.y += 0.02 * (i % 2 === 0 ? 1 : -1);
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      tubeGeom.dispose();
      tubeMat.dispose();
    };
  }, [data, height]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border/70 bg-[#07101D]/70 shadow-panel" style={{ height }}>
      <div ref={containerRef} className="h-full w-full" />
      <div className="pointer-events-none absolute bottom-3 left-4 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" /> NOW</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-warning" /> Milestones</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-success" /> 12M Horizon</span>
      </div>
    </div>
  );
}