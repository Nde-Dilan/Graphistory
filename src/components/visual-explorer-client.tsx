"use client";
import type { CameroonEvent } from "@/lib/cameroon-history-data";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import BottomNav from "./bottom-nav";
import GridView from "./grid-view";
import ExploreOverlay from "./explore-overlay";

import { Loader } from "lucide-react";
import { CAMEROON_HISTORY_LINKS } from "@/lib/cameroon-history-data";

type Mode = "grid" | "sphere" | "name";

const TWEEN: any = {
  Easing: { Quadratic: { Out: (k: number) => k * (2 - k) } },
  _tweens: [] as any[],
  update: function (time: number) {
    if (this._tweens.length === 0) return false;
    let i = 0;
    while (i < this._tweens.length) {
      if (this._tweens[i] && this._tweens[i].update(time)) {
        i++;
      } else {
        this._tweens.splice(i, 1);
      }
    }
    return true;
  },
  add: function (tween: any) {
    this._tweens.push(tween);
  },
  Tween: function (object: any) {
    let _object = object;
    let _valuesStart: any = {};
    let _valuesEnd: any = {};
    let _duration = 1000;
    let _easingFunction = TWEEN.Easing.Quadratic.Out;
    let _startTime = 0;
    let _onCompleteCallback: (() => void) | null = null;

    this.to = function (properties: any, duration: number) {
      _valuesEnd = properties;
      if (duration !== undefined) _duration = duration;
      return this;
    };
    this.start = function (time?: number) {
      TWEEN.add(this);
      _startTime = time !== undefined ? time : performance.now();
      for (var property in _valuesEnd) {
        if (_object[property] === undefined) continue;
        _valuesStart[property] =
          _object[property] instanceof THREE.Color
            ? _object[property].clone()
            : _object[property];
      }
      return this;
    };
    this.easing = function (easing: any) {
      _easingFunction = easing;
      return this;
    };
    this.onComplete = function (callback: () => void) {
      _onCompleteCallback = callback;
      return this;
    };
    this.update = function (time: number) {
      let elapsed = (time - _startTime) / _duration;
      elapsed = elapsed > 1 ? 1 : elapsed;
      const value = _easingFunction(elapsed);
      for (var property in _valuesEnd) {
        const start = _valuesStart[property] || 0;
        const end = _valuesEnd[property];
        if (end instanceof THREE.Vector3) {
          _object[property].lerpVectors(start, end, value);
        } else if (end instanceof THREE.Color) {
          _object[property].lerpColors(start, end, value);
        } else {
          _object[property] = start + (end - start) * value;
        }
      }
      if (elapsed === 1) {
        if (_onCompleteCallback !== null) {
          _onCompleteCallback();
        }
        return false;
      }
      return true;
    };
  },
};

type ThreeObjects = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  imageMeshes: THREE.Group[];
  linkLines: THREE.Line[];
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  hoveredMesh: THREE.Group | null;
};

const IMAGE_SIZE = 2;
const TRANSITION_SPEED = 0.07;
const LINE_COLOR = new THREE.Color("hsl(var(--secondary))");
const HOVER_COLOR = new THREE.Color("hsl(var(--primary))");
const FRAME_COLOR = new THREE.Color("#FFFFFF");

function getSpherePoints(count: number, radius: number) {
  const points: THREE.Vector3[] = [];
  const offset = 2 / count;
  const increment = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = i * offset - 1 + offset / 2;
    const r = Math.sqrt(1 - y * y);
    const phi = i * increment;
    const x = Math.cos(phi) * r;
    const z = Math.sin(phi) * r;
    points.push(new THREE.Vector3(x * radius, y * radius, z * radius));
  }
  return points;
}

function getNamePoints(
  count: number,
  opts: { text: string; width?: number; height?: number; scale?: number }
) {
  const width = opts.width || 800;
  const height = opts.height || 300;
  const scale = opts.scale || 0.07;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);
  // Draw white text
  ctx.fillStyle = "white";
  const fontSize = Math.floor(height * 0.7);
  ctx.font = `bold ${fontSize}px Space Grotesk, Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(opts.text, width / 2, height / 2);

  const img = ctx.getImageData(0, 0, width, height).data;
  const pixels: { x: number; y: number }[] = [];
  const stride = 6;
  for (let y = 0; y < height; y += stride) {
    for (let x = 0; x < width; x += stride) {
      const idx = (y * width + x) * 4;
      const alpha = img[idx + 3];
      if (alpha > 128) {
        pixels.push({ x, y });
      }
    }
  }

  if (pixels.length === 0) return [];
  // sample or repeat pixels to match count
  const sampled: { x: number; y: number }[] = [];
  if (pixels.length >= count) {
    const step = Math.max(1, Math.floor(pixels.length / count));
    for (let i = 0; i < pixels.length && sampled.length < count; i += step) {
      sampled.push(pixels[i]);
    }
  } else {
    // repeat with jitter
    while (sampled.length < count) {
      const p = pixels[sampled.length % pixels.length];
      sampled.push({
        x: p.x + (Math.random() - 0.5) * stride,
        y: p.y + (Math.random() - 0.5) * stride,
      });
    }
  }

  // convert to Vector3 centered and scaled
  const points: THREE.Vector3[] = sampled.map((p) => {
    const nx = (p.x - width / 2) * scale;
    const ny = -(p.y - height / 2) * scale;
    const nz = (Math.random() - 0.5) * 2; // slight depth jitter
    return new THREE.Vector3(nx, ny, nz);
  });

  return points;
}

export default function VisualExplorerClient({
  events,
}: {
  events: CameroonEvent[];
}) {
  const [mode, setMode] = useState<Mode>("sphere");
  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(
    null
  );
  const [prevMode, setPrevMode] = useState<Mode>("sphere");
  const [show3D, setShow3D] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const threeRef = useRef<ThreeObjects>();
  const animationFrameId = useRef<number>();
  const targetPositions = useRef<THREE.Vector3[]>([]);
  const targetQuaternions = useRef<THREE.Quaternion[]>([]);

  const eventIdToIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    events.forEach((event, index) => {
      map.set(event.id, index);
    });
    return map;
  }, [events]);

  const onImageSelect = useCallback(
    (index: number) => {
      console.debug("onImageSelect", index);
      setPrevMode(mode);
      setSelectedEventIndex(index);
    },
    [mode]
  );

  useEffect(() => {
    console.debug("selectedEventIndex changed", selectedEventIndex);
  }, [selectedEventIndex]);

  const handleModeChange = (newMode: Mode) => {
    if (newMode !== mode) {
      setMode(newMode);
      if (newMode === "grid") {
        setShow3D(false);
      } else {
        setShow3D(true);
      }
    }
  };

  const closeExplore = useCallback(() => {
    console.debug("closeExplore called");
    setSelectedEventIndex(null);
    if (prevMode === "grid") {
      setShow3D(false);
      setMode("grid");
    } else {
      setShow3D(true);
      setMode(prevMode);
    }
    // Defensive: ensure controls are re-enabled and any hover state is cleared
    if (threeRef.current) {
      try {
        threeRef.current.controls.enabled = true;
        const dom = threeRef.current.renderer.domElement as HTMLElement | null;
        if (dom) {
          dom.style.pointerEvents = "auto";
          // make focusable and focus so keyboard/mouse interactions resume
          dom.tabIndex = -1;
          try {
            dom.focus();
          } catch (e) {
            /* ignore */
          }
        }
        try {
          if (containerRef.current)
            containerRef.current.style.pointerEvents = "auto";
        } catch (e) {
          /* ignore */
        }
        if (threeRef.current.hoveredMesh) {
          const old = threeRef.current.hoveredMesh;
          if (old.userData && old.userData.frameMaterial) {
            old.userData.frameMaterial.color = old.userData.baseColor;
          }
          old.scale.set(1, 1, 1);
          threeRef.current.hoveredMesh = null;

          // Recompute targets to ensure items lerp back into their layout
          try {
            setTimeout(() => {
              if (!threeRef.current) return;
              const cameraQuaternion =
                threeRef.current.camera.quaternion.clone();
              if (prevMode === "sphere") {
                targetPositions.current = getSpherePoints(events.length, 15);
              } else if (prevMode === "name") {
                targetPositions.current = getNamePoints(events.length, {
                  text: "CAMEROON OS",
                  width: 800,
                  height: 300,
                  scale: 0.07,
                });
              } else {
                // grid or default
                const cols = 5;
                const spacing = IMAGE_SIZE * 2.5;
                const rows = Math.ceil(events.length / cols);
                const gridPoints: THREE.Vector3[] = [];
                const xOffset = ((cols - 1) * spacing) / 2;
                const yOffset = ((rows - 1) * spacing) / 2;
                for (let i = 0; i < events.length; i++) {
                  const col = i % cols;
                  const row = Math.floor(i / cols);
                  const x = col * spacing - xOffset;
                  const y = -row * spacing + yOffset;
                  const z = 0;
                  gridPoints.push(new THREE.Vector3(x, y, z));
                }
                targetPositions.current = gridPoints;
              }
              targetQuaternions.current = events.map(() => cameraQuaternion);
            }, 80);
          } catch (e) {
            /* ignore */
          }
        }
        try {
          if (containerRef.current)
            containerRef.current.style.pointerEvents = "auto";
        } catch (e) {
          /* ignore */
        }
      } catch (e) {
        // best-effort only
        console.warn("Error re-enabling controls on close:", e);
      }
    }
  }, [prevMode]);

  const setupScene = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    console.debug("setupScene: starting");
    // Always clear any existing canvas/dom children to avoid orphaned canvases
    try {
      if (threeRef.current) {
        console.debug("setupScene: disposing previous renderer");
        try {
          threeRef.current.renderer.dispose();
        } catch (e) {
          /* ignore */
        }
      }
    } finally {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 25;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.style.pointerEvents = "auto";
    renderer.domElement.tabIndex = -1;
    container.appendChild(renderer.domElement);
    // Ensure container accepts pointer events
    container.style.pointerEvents = "auto";
    console.debug("setupScene: renderer appended", renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 50;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const loader = new THREE.TextureLoader();
    const imageMeshes: THREE.Group[] = [];

    // Ensure imageMeshes has a slot for each event so indices align
    const imageLoadPromises = events.map((event, index) => {
      return new Promise<void>((resolve) => {
        const createFrameGroup = (
          material: THREE.Material,
          aspectRatio = 1
        ) => {
          const imageMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(IMAGE_SIZE * aspectRatio, IMAGE_SIZE),
            material
          );
          imageMesh.name = "image";

          const frameMaterial = new THREE.MeshBasicMaterial({
            color: FRAME_COLOR,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 1,
          });
          const frameGroup = new THREE.Group();

          const frameThickness = 0.05;
          const frameTop = new THREE.Mesh(
            new THREE.PlaneGeometry(
              IMAGE_SIZE * aspectRatio + frameThickness * 2,
              frameThickness
            ),
            frameMaterial
          );
          frameTop.position.y = IMAGE_SIZE / 2 + frameThickness / 2;
          const frameBottom = new THREE.Mesh(
            new THREE.PlaneGeometry(
              IMAGE_SIZE * aspectRatio + frameThickness * 2,
              frameThickness
            ),
            frameMaterial
          );
          frameBottom.position.y = -IMAGE_SIZE / 2 - frameThickness / 2;
          const frameLeft = new THREE.Mesh(
            new THREE.PlaneGeometry(frameThickness, IMAGE_SIZE),
            frameMaterial
          );
          frameLeft.position.x =
            -(IMAGE_SIZE * aspectRatio) / 2 - frameThickness / 2;
          const frameRight = new THREE.Mesh(
            new THREE.PlaneGeometry(frameThickness, IMAGE_SIZE),
            frameMaterial
          );
          frameRight.position.x =
            (IMAGE_SIZE * aspectRatio) / 2 + frameThickness / 2;

          frameGroup.add(imageMesh);
          frameGroup.add(frameTop);
          frameGroup.add(frameBottom);
          frameGroup.add(frameLeft);
          frameGroup.add(frameRight);

          frameGroup.userData = {
            id: event.id,
            index,
            frameMaterial,
            baseColor: FRAME_COLOR.clone(),
          };

          scene.add(frameGroup);
          imageMeshes[index] = frameGroup;
        };

        loader.load(
          event.imageUrl,
          (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            const aspectRatio = texture.image.width / texture.image.height;
            const material = new THREE.MeshBasicMaterial({
              map: texture,
              side: THREE.DoubleSide,
              transparent: true,
            });
            createFrameGroup(material, aspectRatio);
            resolve();
          },
          undefined,
          () => {
            // create a placeholder material so the slot exists and the globe can form
            console.warn(
              `Failed to load image: ${event.imageUrl}, using placeholder.`
            );
            const placeholderMat = new THREE.MeshBasicMaterial({
              color: new THREE.Color("#333333"),
            });
            createFrameGroup(placeholderMat, 1);
            resolve();
          }
        );
      });
    });

    Promise.all(imageLoadPromises).then(() => {
      setIsLoading(false);
      // Ensure we compute initial target positions once images are loaded so the globe arranges immediately
      if (threeRef.current) {
        const cameraQuaternion = threeRef.current.camera.quaternion.clone();
        if (mode === "sphere") {
          targetPositions.current = getSpherePoints(events.length, 15);
        } else if (mode === "name") {
          targetPositions.current = getNamePoints(events.length, {
            text: "CAMEROON OS",
            width: 800,
            height: 300,
            scale: 0.07,
          });
        }
        targetQuaternions.current = events.map(() => cameraQuaternion);
      }
    });

    const linkLines: THREE.Line[] = [];
    CAMEROON_HISTORY_LINKS.forEach((link) => {
      const material = new THREE.LineBasicMaterial({
        color: LINE_COLOR,
        transparent: true,
        opacity: 0.3,
        linewidth: 1,
      });
      const geometry = new THREE.BufferGeometry();
      const line = new THREE.Line(geometry, material);
      line.userData.sourceId = link.source;
      line.userData.targetId = link.target;
      linkLines.push(line);
      scene.add(line);
    });

    threeRef.current = {
      scene,
      camera,
      renderer,
      controls,
      imageMeshes,
      linkLines,
      raycaster,
      mouse,
      hoveredMesh: null,
    };

    const onWindowResize = () => {
      if (!threeRef.current || !container) return;
      const { camera, renderer } = threeRef.current;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    const onMouseMove = (event: MouseEvent) => {
      if (
        !threeRef.current ||
        !containerRef.current ||
        selectedEventIndex !== null
      )
        return;
      // debug: uncomment for verbose
      // console.debug('onMouseMove', event.clientX, event.clientY);
      const { camera, imageMeshes, raycaster, mouse } = threeRef.current;
      const rect = containerRef.current.getBoundingClientRect();

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(imageMeshes, true);
      const intersectedObject =
        intersects.length > 0 ? intersects[0].object : null;
      let intersectedMesh: THREE.Group | null = null;
      if (intersectedObject) {
        let parent = intersectedObject.parent;
        while (parent && !(parent instanceof THREE.Scene)) {
          if (parent.userData.id) {
            intersectedMesh = parent as THREE.Group;
            break;
          }
          parent = parent.parent;
        }
      }

      if (threeRef.current.hoveredMesh !== intersectedMesh) {
        if (threeRef.current.hoveredMesh) {
          const oldHovered = threeRef.current.hoveredMesh;
          new TWEEN.Tween(oldHovered.userData.frameMaterial)
            .to({ color: oldHovered.userData.baseColor }, 200)
            .start();
          new TWEEN.Tween(oldHovered.scale)
            .to({ x: 1, y: 1, z: 1 }, 200)
            .start();
        }
        if (intersectedMesh) {
          new TWEEN.Tween(intersectedMesh.userData.frameMaterial)
            .to({ color: HOVER_COLOR }, 200)
            .start();
          new TWEEN.Tween(intersectedMesh.scale)
            .to({ x: 1.1, y: 1.1, z: 1.1 }, 200)
            .start();
        }
        threeRef.current.hoveredMesh = intersectedMesh;
      }
    };

    const onClick = (event: MouseEvent) => {
      // debug click
      // console.debug('onClick', event.clientX, event.clientY);
      if (threeRef.current?.hoveredMesh) {
        const index = threeRef.current.hoveredMesh.userData.index;
        onImageSelect(index);
      }
    };

    window.addEventListener("resize", onWindowResize);
    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("click", onClick);
    const onContextMenu = (e: MouseEvent) => {
      // expose contextmenu events for debugging and ensure they're not being swallowed
      console.debug("contextmenu on container", e.clientX, e.clientY);
    };
    container.addEventListener("contextmenu", onContextMenu);

    return () => {
      console.debug("setupScene cleanup");
      window.removeEventListener("resize", onWindowResize);
      if (container) {
        container.removeEventListener("mousemove", onMouseMove);
        container.removeEventListener("click", onClick);
        container.removeEventListener("contextmenu", onContextMenu);
      }
      if (threeRef.current) {
        threeRef.current.scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else if (object.material) {
              object.material.dispose();
            }
          }
        });
        try {
          threeRef.current.renderer.dispose();
        } catch (e) {
          console.warn("renderer dispose failed", e);
        }
        threeRef.current = undefined;
      }
    };
  }, [events, onImageSelect, selectedEventIndex]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    const globalContextHandler = (e: MouseEvent) => {
      console.debug("global contextmenu event target:", e.target);
    };
    window.addEventListener("contextmenu", globalContextHandler, true);

    if (show3D) {
      setIsLoading(true);
      cleanup = setupScene();
    } else if (threeRef.current) {
      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }
      threeRef.current = undefined;
    }

    return () => {
      window.removeEventListener("contextmenu", globalContextHandler, true);
      if (cleanup) cleanup();
    };
  }, [show3D, setupScene]);

  const animate = useCallback(() => {
    animationFrameId.current = requestAnimationFrame(animate);
    if (!threeRef.current || !show3D || isLoading) return;
    const {
      renderer,
      scene,
      camera,
      controls,
      imageMeshes,
      linkLines,
      hoveredMesh,
    } = threeRef.current;

    TWEEN.update(performance.now());

    const time = performance.now() * 0.001;

    linkLines.forEach((line) => {
      const sourceIndex = eventIdToIndexMap.get(line.userData.sourceId);
      const targetIndex = eventIdToIndexMap.get(line.userData.targetId);

      if (
        sourceIndex !== undefined &&
        targetIndex !== undefined &&
        imageMeshes[sourceIndex] &&
        imageMeshes[targetIndex]
      ) {
        const start = imageMeshes[sourceIndex].position;
        const end = imageMeshes[targetIndex].position;

        const points = [start, end];
        line.geometry.setFromPoints(points);
        line.geometry.attributes.position.needsUpdate = true;

        const isHovered =
          hoveredMesh &&
          (hoveredMesh.userData.id === line.userData.sourceId ||
            hoveredMesh.userData.id === line.userData.targetId);
        const material = line.material as THREE.LineBasicMaterial;

        if (isHovered) {
          material.opacity = 0.6 + 0.4 * Math.sin(time * 5);
          material.color.set(HOVER_COLOR);
        } else {
          material.opacity = 0.3;
          material.color.set(LINE_COLOR);
        }
      }
    });

    if (
      imageMeshes.length > 0 &&
      events.length > 0 &&
      imageMeshes.length === events.length &&
      selectedEventIndex === null
    ) {
      imageMeshes.forEach((mesh, index) => {
        if (!mesh) return;

        const targetPos = targetPositions.current[index];
        if (targetPos) {
          mesh.position.lerp(targetPos, TRANSITION_SPEED);
        }

        const targetQuat = targetQuaternions.current[index];
        if (targetQuat) {
          mesh.quaternion.slerp(targetQuat, TRANSITION_SPEED);
        }
      });
    }

    controls.update();
    renderer.render(scene, camera);
  }, [events, show3D, selectedEventIndex, isLoading, eventIdToIndexMap]);

  useEffect(() => {
    if (show3D) {
      animate();
    }
    return () => {
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
    };
  }, [animate, show3D]);

  useEffect(() => {
    if (isLoading || !threeRef.current || !show3D) return;
    const { camera, controls, imageMeshes, linkLines } = threeRef.current;

    if (selectedEventIndex !== null) {
      const selectedMesh = imageMeshes[selectedEventIndex];
      if (!selectedMesh) return;
      const camPos = selectedMesh.position
        .clone()
        .add(new THREE.Vector3(0, 0, IMAGE_SIZE * 3));

      imageMeshes.forEach((mesh, i) => {
        if (mesh) mesh.visible = i === selectedEventIndex;
      });
      linkLines.forEach((line) => {
        line.visible = false;
      });

      // While the overlay is open, prevent pointer events on the canvas container
      try {
        if (containerRef.current)
          containerRef.current.style.pointerEvents = "none";
      } catch (e) {
        /* ignore */
      }

      new TWEEN.Tween(camera.position)
        .to(camPos, 500)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();
      new TWEEN.Tween(controls.target)
        .to(selectedMesh.position, 500)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

      controls.enabled = false;
    } else {
      controls.enabled = true;
      try {
        if (containerRef.current)
          containerRef.current.style.pointerEvents = "auto";
      } catch (e) {
        /* ignore */
      }
      imageMeshes.forEach((mesh) => {
        if (mesh) mesh.visible = true;
      });
      linkLines.forEach((line) => {
        line.visible = true;
      });

      let points: THREE.Vector3[] = [];
      const sphereRadius = 15;

      switch (mode) {
        case "sphere":
          points = getSpherePoints(events.length, sphereRadius);
          linkLines.forEach((line) => (line.visible = true));
          break;
        case "name":
          points = getNamePoints(events.length, {
            text: "CAMEROON OS",
            width: 800,
            height: 300,
            scale: 0.07,
          });
          linkLines.forEach((line) => (line.visible = false));
          break;
        case "grid":
          // grid layout
          const cols = 5;
          const spacing = IMAGE_SIZE * 2.5;
          const rows = Math.ceil(events.length / cols);
          const gridPoints: THREE.Vector3[] = [];
          const xOffset = ((cols - 1) * spacing) / 2;
          const yOffset = ((rows - 1) * spacing) / 2;
          for (let i = 0; i < events.length; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = col * spacing - xOffset;
            const y = -row * spacing + yOffset;
            const z = 0;
            gridPoints.push(new THREE.Vector3(x, y, z));
          }
          points = gridPoints;
          linkLines.forEach((line) => (line.visible = false));
          break;
      }
      targetPositions.current = points;
      const cameraQuaternion = camera.quaternion.clone();
      targetQuaternions.current = events.map(() => cameraQuaternion);
    }
  }, [mode, selectedEventIndex, events.length, isLoading, show3D]);

  return (
    <>
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          show3D ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        ref={containerRef}
      />

      {isLoading && show3D && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-30">
          <Loader className="w-12 h-12 animate-spin text-primary" />
          <p className="mt-4 text-lg font-headline text-primary">
            CAMEROON OS Initializing...
          </p>
        </div>
      )}

      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          !show3D ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {mode === "grid" && (
          <GridView events={events} onImageSelect={onImageSelect} />
        )}
      </div>

      {!isLoading &&
        selectedEventIndex !== null &&
        events[selectedEventIndex] && (
          <ExploreOverlay
            event={events[selectedEventIndex]}
            currentIndex={selectedEventIndex}
            totalImages={events.length}
            onClose={closeExplore}
            onNavigate={(newIndex) => setSelectedEventIndex(newIndex)}
          />
        )}

      {!isLoading && (
        <BottomNav activeMode={mode} onModeChange={handleModeChange} />
      )}
    </>
  );
}
