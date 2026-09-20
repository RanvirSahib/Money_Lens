'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { TrajectoryNode } from '../types';

interface Trajectory3DCanvasProps {
  nodes: TrajectoryNode[];
  selectedMonth?: number;
  onSelectNode?: (node: TrajectoryNode) => void;
  showDivergence?: boolean;
  showAccelerated?: boolean;
}

interface NodeScreenPos {
  node: TrajectoryNode;
  x: number;
  y: number;
  visible: boolean;
}

export const Trajectory3DCanvas: React.FC<Trajectory3DCanvasProps> = ({
  nodes,
  selectedMonth = 3,
  onSelectNode,
  showDivergence = true,
  showAccelerated = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [hoveredNode, setHoveredNode] = useState<TrajectoryNode | null>(null);
  const [nodeScreenPositions, setNodeScreenPositions] = useState<NodeScreenPos[]>([]);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const reqIdRef = useRef<number | null>(null);
  const nodesMeshGroupRef = useRef<THREE.Group | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2(-9999, -9999));

  // Orbit control state
  const isDraggingRef = useRef<boolean>(false);
  const prevMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const sphericalRef = useRef<{ radius: number; theta: number; phi: number }>({
    radius: 14,
    theta: 0.45,
    phi: 1.15,
  });
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.5, 0));

  // Helper to map values to 3D coordinates
  const minVal = 30000;
  const maxVal = 160000;
  const mapTo3D = useCallback((month: number, value: number, zOffset: number = 0) => {
    // x from -5.5 to +5.5
    const x = ((month - 6) / 6) * 5.8;
    // y from -1.8 to +3.2
    const normY = (value - minVal) / (maxVal - minVal);
    const y = -1.8 + normY * 5.0;
    const z = zOffset;
    return new THREE.Vector3(x, y, z);
  }, []);

  // Update camera position from spherical coordinates
  const updateCamera = useCallback(() => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = sphericalRef.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);

    cameraRef.current.position.set(
      targetLookAtRef.current.x + x,
      targetLookAtRef.current.y + y,
      targetLookAtRef.current.z + z
    );
    cameraRef.current.lookAt(targetLookAtRef.current);
  }, []);

  // Reset Camera View
  const handleResetCamera = () => {
    sphericalRef.current = {
      radius: 14,
      theta: 0.45,
      phi: 1.15,
    };
    updateCamera();
  };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 420;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf8fafc); // slate-50

    // Subtle fog for depth
    scene.fog = new THREE.FogExp2(0xf8fafc, 0.035);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCamera();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 20, 15);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const bluePointLight = new THREE.PointLight(0x2563eb, 2.5, 30);
    bluePointLight.position.set(0, 4, 3);
    scene.add(bluePointLight);

    const emeraldPointLight = new THREE.PointLight(0x10b981, 1.5, 25);
    emeraldPointLight.position.set(4, 5, 2);
    scene.add(emeraldPointLight);

    // 5. Floor Grid
    const gridHelper = new THREE.GridHelper(24, 24, 0x94a3b8, 0xe2e8f0);
    gridHelper.position.y = -2.0;
    scene.add(gridHelper);

    // Floor reflector plane
    const planeGeo = new THREE.PlaneGeometry(30, 30);
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0xf8fafc,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    const floorPlane = new THREE.Mesh(planeGeo, planeMat);
    floorPlane.rotation.x = -Math.PI / 2;
    floorPlane.position.y = -2.01;
    scene.add(floorPlane);

    // 6. Build Trajectory Splines & Tubes
    const baselinePoints = nodes.map((n) => mapTo3D(n.monthIndex, n.baseline, 0));
    const baselineCurve = new THREE.CatmullRomCurve3(baselinePoints);
    const baselineGeo = new THREE.TubeGeometry(baselineCurve, 80, 0.12, 16, false);
    const baselineMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.45,
      roughness: 0.2,
      metalness: 0.4,
    });
    const baselineTube = new THREE.Mesh(baselineGeo, baselineMat);
    baselineTube.castShadow = true;
    scene.add(baselineTube);

    // Scenario Divergence Spline (Amber)
    let scenarioTube: THREE.Mesh | null = null;
    if (showDivergence) {
      const scenarioPoints = nodes.map((n) =>
        mapTo3D(n.monthIndex, n.scenario ?? n.baseline, 0.4)
      );
      const scenarioCurve = new THREE.CatmullRomCurve3(scenarioPoints);
      const scenarioGeo = new THREE.TubeGeometry(scenarioCurve, 80, 0.09, 16, false);
      const scenarioMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.5,
        roughness: 0.25,
        metalness: 0.3,
      });
      scenarioTube = new THREE.Mesh(scenarioGeo, scenarioMat);
      scene.add(scenarioTube);
    }

    // Accelerated Target Spline (Emerald)
    let acceleratedTube: THREE.Mesh | null = null;
    if (showAccelerated) {
      const acceleratedPoints = nodes.map((n) =>
        mapTo3D(n.monthIndex, n.accelerated ?? n.baseline, -0.4)
      );
      const acceleratedCurve = new THREE.CatmullRomCurve3(acceleratedPoints);
      const acceleratedGeo = new THREE.TubeGeometry(acceleratedCurve, 80, 0.08, 16, false);
      const acceleratedMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 0.4,
        roughness: 0.3,
        metalness: 0.2,
      });
      acceleratedTube = new THREE.Mesh(acceleratedGeo, acceleratedMat);
      scene.add(acceleratedTube);
    }

    // 7. Interactive 3D Milestone Nodes & Pulse Rings
    const nodesGroup = new THREE.Group();
    nodesMeshGroupRef.current = nodesGroup;
    scene.add(nodesGroup);

    nodes.forEach((node) => {
      const pos = mapTo3D(node.monthIndex, node.baseline, 0);

      // Main Node Sphere
      const isSelected = selectedMonth === node.monthIndex;
      const sphereRadius = isSelected ? 0.28 : 0.22;
      const sphereGeo = new THREE.SphereGeometry(sphereRadius, 32, 32);

      let nodeColor = 0x2563eb;
      if (node.isDivergence) nodeColor = 0xf59e0b;
      if (node.isPeak) nodeColor = 0x10b981;

      const sphereMat = new THREE.MeshStandardMaterial({
        color: nodeColor,
        emissive: nodeColor,
        emissiveIntensity: 0.6,
        metalness: 0.5,
        roughness: 0.2,
      });

      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.copy(pos);
      sphere.userData = { node };
      nodesGroup.add(sphere);

      // Outer animated Halo Ring
      const ringGeo = new THREE.TorusGeometry(sphereRadius * 1.6, 0.025, 16, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: nodeColor,
        transparent: true,
        opacity: isSelected ? 0.85 : 0.45,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.rotation.x = Math.PI / 2;
      ring.userData = { isRing: true, speed: 0.02 + Math.random() * 0.01 };
      nodesGroup.add(ring);

      // Dropdown dashed line to floor
      const lineMat = new THREE.LineDashedMaterial({
        color: 0x94a3b8,
        dashSize: 0.2,
        gapSize: 0.15,
        transparent: true,
        opacity: 0.5,
      });
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        pos,
        new THREE.Vector3(pos.x, -2.0, pos.z),
      ]);
      const dropLine = new THREE.Line(lineGeo, lineMat);
      dropLine.computeLineDistances();
      scene.add(dropLine);

      // Floor anchor disc
      const discGeo = new THREE.CircleGeometry(0.2, 24);
      const discMat = new THREE.MeshBasicMaterial({
        color: nodeColor,
        transparent: true,
        opacity: 0.35,
      });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.rotation.x = -Math.PI / 2;
      disc.position.set(pos.x, -1.99, pos.z);
      scene.add(disc);
    });

    // 8. Animation & Render Loop
    let clock = new THREE.Clock();

    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Auto rotation
      if (autoRotate && !isDraggingRef.current) {
        sphericalRef.current.theta += delta * 0.18;
        updateCamera();
      }

      // Pulse and rotate halo rings
      if (nodesMeshGroupRef.current) {
        nodesMeshGroupRef.current.children.forEach((child) => {
          if (child.userData?.isRing) {
            child.rotation.z += child.userData.speed || 0.02;
            const scale = 1 + 0.12 * Math.sin(time * 3);
            child.scale.set(scale, scale, scale);
          }
        });
      }

      // Compute 2D Screen Positions of nodes for interactive labels
      if (cameraRef.current && rendererRef.current && containerRef.current) {
        const tempV = new THREE.Vector3();
        const positions: NodeScreenPos[] = [];
        const currentContainerWidth = containerRef.current.clientWidth;
        const currentContainerHeight = containerRef.current.clientHeight;

        nodes.forEach((node) => {
          const pos3D = mapTo3D(node.monthIndex, node.baseline, 0);
          tempV.copy(pos3D);
          tempV.project(cameraRef.current!);

          // Check if behind camera
          const isBehind = tempV.z > 1;
          const x = (tempV.x * 0.5 + 0.5) * currentContainerWidth;
          const y = (-(tempV.y * 0.5) + 0.5) * currentContainerHeight;

          positions.push({
            node,
            x,
            y,
            visible: !isBehind,
          });
        });
        setNodeScreenPositions(positions);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handler with ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      resizeObserver.disconnect();
      renderer.dispose();
      scene.clear();
    };
  }, [nodes, selectedMonth, showDivergence, showAccelerated, mapTo3D, updateCamera, autoRotate]);

  // Pointer & Interaction Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current) {
      const deltaX = e.clientX - prevMousePosRef.current.x;
      const deltaY = e.clientY - prevMousePosRef.current.y;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };

      sphericalRef.current.theta -= deltaX * 0.008;
      sphericalRef.current.phi = Math.max(
        0.3,
        Math.min(Math.PI / 2 - 0.05, sphericalRef.current.phi - deltaY * 0.008)
      );
      updateCamera();
      return;
    }

    // Raycast hovering for 3D nodes
    if (!containerRef.current || !cameraRef.current || !nodesMeshGroupRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(
      nodesMeshGroupRef.current.children,
      false
    );

    const hitNode = intersects.find((i) => i.object.userData?.node);
    if (hitNode) {
      setHoveredNode(hitNode.object.userData.node);
    } else {
      setHoveredNode(null);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    sphericalRef.current.radius = Math.max(
      7,
      Math.min(22, sphericalRef.current.radius + e.deltaY * 0.015)
    );
    updateCamera();
  };

  const handleCanvasClick = () => {
    if (hoveredNode) {
      onSelectNode?.(hoveredNode);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[380px] sm:h-[440px] select-none overflow-hidden rounded-xl bg-slate-50 border border-slate-200"
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Floating 3D Telemetry Tooltip & Interactive Node Badges */}
      {nodeScreenPositions.map(({ node, x, y, visible }) => {
        if (!visible) return null;
        const isSelected = selectedMonth === node.monthIndex;
        const isHovered = hoveredNode?.label === node.label;

        return (
          <div
            key={node.label}
            style={{
              transform: `translate(${x}px, ${y}px) translate(-50%, -125%)`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectNode?.(node);
            }}
            onMouseEnter={() => setHoveredNode(node)}
            onMouseLeave={() => setHoveredNode(null)}
            className={`absolute pointer-events-auto cursor-pointer transition-all duration-200 ${
              isSelected || isHovered
                ? 'z-30 scale-105 opacity-100'
                : 'z-10 opacity-80 hover:opacity-100'
            }`}
          >
            <div
              className={`px-2.5 py-1 rounded-lg border text-center shadow-lg backdrop-blur-md transition-all ${
                node.isDivergence
                  ? 'border-amber-400 bg-amber-500/90 text-white'
                  : node.isPeak
                    ? 'border-emerald-500 bg-emerald-600/90 text-white'
                    : isSelected
                      ? 'border-blue-500 bg-blue-600 text-white shadow-blue-500/30'
                      : 'border-slate-300 bg-white/90 text-slate-800'
              }`}
            >
              <div className="text-[9px] font-mono font-bold tracking-tight uppercase">
                {node.label}
              </div>
              <div className="text-xs font-mono font-bold whitespace-nowrap">
                ₹{node.baseline.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        );
      })}

      {/* Hover Information Card on bottom left */}
      {hoveredNode && (
        <div className="absolute bottom-3 left-3 z-30 bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white p-3 rounded-xl shadow-xl text-xs max-w-xs animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1.5 mb-1.5 font-mono text-[11px]">
            <span className="text-blue-400 font-bold">{hoveredNode.label}</span>
            <span className="text-slate-400">INDEX: M+{hoveredNode.monthIndex}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-slate-300">Baseline Position:</span>
            <span className="text-base font-bold font-mono text-white">
              ₹{hoveredNode.baseline.toLocaleString('en-IN')}
            </span>
          </div>
          {hoveredNode.scenario && (
            <div className="flex items-baseline justify-between text-amber-300 text-[11px] font-mono">
              <span>Scenario Divergence:</span>
              <span>₹{hoveredNode.scenario.toLocaleString('en-IN')}</span>
            </div>
          )}
          {hoveredNode.accelerated && (
            <div className="flex items-baseline justify-between text-emerald-400 text-[11px] font-mono">
              <span>Accelerated Vector:</span>
              <span>₹{hoveredNode.accelerated.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-700/60 mt-1">
            {hoveredNode.subtitle}
          </div>
        </div>
      )}

      {/* 3D Camera & Simulation Controls Overlay on top right */}
      <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1.5 pointer-events-auto">
        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-slate-200 rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-2 py-1 text-[10px] font-mono font-semibold rounded transition-colors cursor-pointer flex items-center gap-1 ${
              autoRotate
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
            title="Toggle Orbital Auto-Rotation"
          >
            <span className="material-symbols-outlined text-[14px]">
              {autoRotate ? 'sync' : 'sync_disabled'}
            </span>
            <span>{autoRotate ? 'ORBITING' : 'ORBIT PAUSED'}</span>
          </button>

          <button
            onClick={handleResetCamera}
            className="px-2 py-1 text-[10px] font-mono font-medium rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
            title="Reset Perspective Angle"
          >
            <span className="material-symbols-outlined text-[14px]">videocam</span>
            <span>RESET</span>
          </button>
        </div>

        <div className="text-[10px] font-mono text-slate-400 bg-white/70 backdrop-blur px-2 py-0.5 rounded border border-slate-200">
          DRAG TO ORBIT // SCROLL TO ZOOM
        </div>
      </div>
    </div>
  );
};
