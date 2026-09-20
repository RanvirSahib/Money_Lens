'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { RadarEvent } from '@/types/finance';

export function FinancialRadar3D({ events, height = 300 }: { events: RadarEvent[]; height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const canvasHeight = height;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / canvasHeight, 0.1, 1000);
    camera.position.set(0, 3.8, 3.6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, canvasHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const radarGroup = new THREE.Group();
    scene.add(radarGroup);

    // Concentric Radar Rings
    const ringRadii = [0.8, 1.5, 2.2];
    ringRadii.forEach((radius) => {
      const ringGeom = new THREE.RingGeometry(radius - 0.015, radius + 0.015, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x1B2A3D, side: THREE.DoubleSide });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      radarGroup.add(ringMesh);
    });

    // Crosshairs
    const crosshairGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-2.4, 0, 0),
      new THREE.Vector3(2.4, 0, 0),
      new THREE.Vector3(0, 0, -2.4),
      new THREE.Vector3(0, 0, 2.4),
    ]);
    const crosshairMat = new THREE.LineBasicMaterial({ color: 0x1B2A3D, transparent: true, opacity: 0.5 });
    const crosshair = new THREE.LineSegments(crosshairGeom, crosshairMat);
    radarGroup.add(crosshair);

    // Rotating Radar Beam (Sector)
    const beamGeom = new THREE.CircleGeometry(2.3, 32, 0, Math.PI / 3);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x38BDF8,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
    });
    const beam = new THREE.Mesh(beamGeom, beamMat);
    beam.rotation.x = Math.PI / 2;
    radarGroup.add(beam);

    // Center Pulse Node (Today)
    const centerGeom = new THREE.SphereGeometry(0.1, 16, 16);
    const centerMat = new THREE.MeshStandardMaterial({
      color: 0x38BDF8,
      emissive: 0x38BDF8,
      emissiveIntensity: 1,
    });
    const centerNode = new THREE.Mesh(centerGeom, centerMat);
    radarGroup.add(centerNode);

    // Floating Radar Event Nodes
    const eventNodes: THREE.Mesh[] = [];
    events.forEach((ev, idx) => {
      const angle = (idx / events.length) * Math.PI * 2 + 0.4;
      // Distance based on daysAway (clamped between 0.7 and 2.1)
      const dist = Math.min(2.1, Math.max(0.7, (ev.daysAway / 30) * 1.8 + 0.6));
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const y = 0.1 + (idx % 2) * 0.15;

      const color = ev.type === 'income' ? 0x34D399 : ev.severity === 'danger' ? 0xF87171 : 0xFBBF24;
      const geom = new THREE.OctahedronGeometry(0.1, 0);
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.8,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(x, y, z);
      radarGroup.add(mesh);
      eventNodes.push(mesh);
    });

    // Light
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);
    const light = new THREE.PointLight(0x38BDF8, 2, 10);
    light.position.set(0, 2, 0);
    scene.add(light);

    // Mouse tilt
    let mouseX = 0;
    let targetX = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetX = x * 0.3;
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
    let clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Rotate radar scan beam
      beam.rotation.z = -elapsed * 1.4;

      // Rotate event nodes
      eventNodes.forEach((node, i) => {
        node.rotation.y = elapsed * 1.2 + i;
        node.position.y = 0.1 + Math.sin(elapsed * 2 + i) * 0.05;
      });

      // Smooth parallax tilt
      mouseX += (targetX - mouseX) * 0.05;
      radarGroup.rotation.y = mouseX;

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
      beamGeom.dispose();
      beamMat.dispose();
    };
  }, [events, height]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border/70 bg-[#07101D]/70 shadow-panel" style={{ height }}>
      <div ref={containerRef} className="h-full w-full" />
      <div className="pointer-events-none absolute bottom-3 left-4 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" /> Center (Today)</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-success" /> Inflow</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-warning" /> Outflow / EMI</span>
      </div>
    </div>
  );
}