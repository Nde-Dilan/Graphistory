'use client';
import type { CameroonEvent } from '@/lib/cameroon-history-data';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import BottomNav from './bottom-nav';
import GridView from './grid-view';
import ExploreOverlay from './explore-overlay';
import { getSpherePoints, getNamePoints } from '@/lib/three-helpers';
import { Loader } from 'lucide-react';
import { CAMEROON_HISTORY_LINKS } from '@/lib/cameroon-history-data';

type Mode = 'grid' | 'sphere' | 'name';

const TWEEN = {
    Easing: { Quadratic: { Out: (k: number) => k * ( 2 - k ) } },
    _tweens: [] as any[],
    update: function(time: number) {
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
    add: function(tween: any) { this._tweens.push(tween); },
    Tween: function(object: any) {
        let _object = object;
        let _valuesStart: any = {};
        let _valuesEnd: any = {};
        let _duration = 1000;
        let _easingFunction = TWEEN.Easing.Quadratic.Out;
        let _startTime = 0;
        let _onCompleteCallback: (()=>void)|null = null;

        this.to = function(properties: any, duration: number) {
            _valuesEnd = properties;
            if(duration !== undefined) _duration = duration;
            return this;
        };
        this.start = function(time?: number) {
            TWEEN.add(this);
            _startTime = time !== undefined ? time : performance.now();
            for (var property in _valuesEnd) {
                if (_object[property] === undefined) continue;
                _valuesStart[property] = _object[property] instanceof THREE.Color ? _object[property].clone() : _object[property];
            }
            return this;
        };
        this.easing = function(easing: any) {
            _easingFunction = easing;
            return this;
        };
        this.onComplete = function (callback: ()=>void) {
            _onCompleteCallback = callback;
            return this;
        }
        this.update = function(time: number) {
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
                }
                else {
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
    }
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
const LINE_COLOR = new THREE.Color('hsl(var(--secondary))'); 
const HOVER_COLOR = new THREE.Color('hsl(var(--primary))');
const FRAME_COLOR = new THREE.Color('#FFFFFF');

export default function VisualExplorerClient({ events }: { events: CameroonEvent[] }) {
  const [mode, setMode] = useState<Mode>('sphere');
  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(null);
  const [prevMode, setPrevMode] = useState<Mode>('sphere');
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

  const onImageSelect = useCallback((index: number) => {
    setPrevMode(mode);
    setSelectedEventIndex(index);
  }, [mode]);
  
  const handleModeChange = (newMode: Mode) => {
    if (newMode !== mode) {
        setMode(newMode);
        if (newMode === 'grid') {
            setShow3D(false);
        } else {
            setShow3D(true);
        }
    }
  };

  const closeExplore = useCallback(() => {
    setSelectedEventIndex(null);
    if (prevMode === 'grid') {
      setShow3D(false);
      setMode('grid');
    } else {
      setShow3D(true);
      setMode(prevMode);
    }
  }, [prevMode]);

  const setupScene = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    if (threeRef.current) {
        threeRef.current.renderer.dispose();
        while(container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 25;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

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

    const imageLoadPromises = events.map((event, index) => {
      return new Promise<void>((resolve) => {
        loader.load(event.imageUrl, (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          const aspectRatio = texture.image.width / texture.image.height;
          
          const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });
          const imageMesh = new THREE.Mesh(new THREE.PlaneGeometry(IMAGE_SIZE * aspectRatio, IMAGE_SIZE), material);
          imageMesh.name = "image";
          
          const frameMaterial = new THREE.MeshBasicMaterial({ color: FRAME_COLOR, side: THREE.DoubleSide, transparent: true, opacity: 1 });
          const frameGroup = new THREE.Group();
        
          const frameThickness = 0.05;
          const frameTop = new THREE.Mesh(new THREE.PlaneGeometry(IMAGE_SIZE * aspectRatio + frameThickness * 2, frameThickness), frameMaterial);
          frameTop.position.y = IMAGE_SIZE / 2 + frameThickness / 2;
          const frameBottom = new THREE.Mesh(new THREE.PlaneGeometry(IMAGE_SIZE * aspectRatio + frameThickness * 2, frameThickness), frameMaterial);
          frameBottom.position.y = -IMAGE_SIZE / 2 - frameThickness / 2;
          const frameLeft = new THREE.Mesh(new THREE.PlaneGeometry(frameThickness, IMAGE_SIZE), frameMaterial);
          frameLeft.position.x = -(IMAGE_SIZE * aspectRatio) / 2 - frameThickness / 2;
          const frameRight = new THREE.Mesh(new THREE.PlaneGeometry(frameThickness, IMAGE_SIZE), frameMaterial);
          frameRight.position.x = (IMAGE_SIZE * aspectRatio) / 2 + frameThickness / 2;

          frameGroup.add(imageMesh);
          frameGroup.add(frameTop);
          frameGroup.add(frameBottom);
          frameGroup.add(frameLeft);
          frameGroup.add(frameRight);

          frameGroup.userData = {
              id: event.id,
              index,
              frameMaterial,
              baseColor: FRAME_COLOR.clone()
          };

          scene.add(frameGroup);
          imageMeshes[index] = frameGroup;
          resolve();

        }, undefined, () => {
          console.error(`Failed to load image: ${event.imageUrl}`);
          resolve();
        });
      });
    });

    Promise.all(imageLoadPromises).then(() => {
        setIsLoading(false);
    });

    const linkLines: THREE.Line[] = [];
    CAMEROON_HISTORY_LINKS.forEach(link => {
      const material = new THREE.LineBasicMaterial({ color: LINE_COLOR, transparent: true, opacity: 0.3, linewidth: 1 });
      const geometry = new THREE.BufferGeometry();
      const line = new THREE.Line(geometry, material);
      line.userData.sourceId = link.source;
      line.userData.targetId = link.target;
      linkLines.push(line);
      scene.add(line);
    });

    threeRef.current = { scene, camera, renderer, controls, imageMeshes, linkLines, raycaster, mouse, hoveredMesh: null };

    const onWindowResize = () => {
      if (!threeRef.current || !container) return;
      const { camera, renderer } = threeRef.current;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    const onMouseMove = (event: MouseEvent) => {
        if (!threeRef.current || !containerRef.current || selectedEventIndex !== null) return;
        const { camera, imageMeshes, raycaster, mouse } = threeRef.current;
        const rect = containerRef.current.getBoundingClientRect();

        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(imageMeshes, true);
        const intersectedObject = intersects.length > 0 ? intersects[0].object : null;
        let intersectedMesh: THREE.Group | null = null;
        if (intersectedObject) {
            let parent = intersectedObject.parent;
            while(parent && !(parent instanceof THREE.Scene)) {
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
                new TWEEN.Tween(oldHovered.scale).to({x:1, y:1, z:1}, 200).start();
            }
            if (intersectedMesh) {
                 new TWEEN.Tween(intersectedMesh.userData.frameMaterial)
                  .to({ color: HOVER_COLOR }, 200)
                  .start();
                 new TWEEN.Tween(intersectedMesh.scale).to({x:1.1, y:1.1, z:1.1}, 200).start();
            }
            threeRef.current.hoveredMesh = intersectedMesh;
        }
    };
    
    const onClick = (event: MouseEvent) => {
        if (threeRef.current?.hoveredMesh) {
            const index = threeRef.current.hoveredMesh.userData.index;
            onImageSelect(index);
        }
    }

    window.addEventListener('resize', onWindowResize);
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('resize', onWindowResize);
      if (container) {
        container.removeEventListener('mousemove', onMouseMove);
        container.removeEventListener('click', onClick);
      }
      if (threeRef.current) {
        threeRef.current.scene.traverse(object => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else if (object.material) {
              object.material.dispose();
            }
          }
        });
        threeRef.current.renderer.dispose();
        threeRef.current = undefined;
      }
    };
  }, [events, onImageSelect, selectedEventIndex]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    if (show3D) {
      setIsLoading(true);
      cleanup = setupScene();
    } else if (threeRef.current) {
        if (containerRef.current) {
            while(containerRef.current.firstChild) {
                containerRef.current.removeChild(containerRef.current.firstChild);
            }
        }
        threeRef.current = undefined;
    }
    
    return () => {
        if (cleanup) cleanup();
    }
  }, [show3D, setupScene]);

  const animate = useCallback(() => {
    animationFrameId.current = requestAnimationFrame(animate);
    if (!threeRef.current || !show3D || isLoading) return;
    const { renderer, scene, camera, controls, imageMeshes, linkLines, hoveredMesh } = threeRef.current;

    TWEEN.update(performance.now());
    
    const time = performance.now() * 0.001;

    linkLines.forEach(line => {
        const sourceIndex = eventIdToIndexMap.get(line.userData.sourceId);
        const targetIndex = eventIdToIndexMap.get(line.userData.targetId);
        
        if(sourceIndex !== undefined && targetIndex !== undefined && imageMeshes[sourceIndex] && imageMeshes[targetIndex]) {
            const start = imageMeshes[sourceIndex].position;
            const end = imageMeshes[targetIndex].position;
            
            const points = [start, end];
            line.geometry.setFromPoints(points);
            line.geometry.attributes.position.needsUpdate = true;

            const isHovered = hoveredMesh && (hoveredMesh.userData.id === line.userData.sourceId || hoveredMesh.userData.id === line.userData.targetId);
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

    if (imageMeshes.length > 0 && events.length > 0 && imageMeshes.length === events.length && selectedEventIndex === null) {
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
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [animate, show3D]);

  useEffect(() => {
    if (isLoading || !threeRef.current || !show3D) return;
    const { camera, controls, imageMeshes, linkLines } = threeRef.current;
    
    if (selectedEventIndex !== null) {
      const selectedMesh = imageMeshes[selectedEventIndex];
      if (!selectedMesh) return;
      const camPos = selectedMesh.position.clone().add(new THREE.Vector3(0, 0, IMAGE_SIZE * 3));
      
      imageMeshes.forEach((mesh, i) => {
        if (mesh) mesh.visible = (i === selectedEventIndex);
      });
      linkLines.forEach(line => { line.visible = false });

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
      imageMeshes.forEach(mesh => { if (mesh) mesh.visible = true; });
      linkLines.forEach(line => { line.visible = true; });

      let points: THREE.Vector3[] = [];
      const sphereRadius = 15;
      
      switch (mode) {
        case 'sphere':
          points = getSpherePoints(events.length, sphereRadius);
          linkLines.forEach(line => line.visible = true);
          break;
        case 'name':
          points = getNamePoints(events.length);
          linkLines.forEach(line => line.visible = false);
          break;
        case 'grid':
          return;
      }
      targetPositions.current = points;
      const cameraQuaternion = camera.quaternion.clone();
      targetQuaternions.current = events.map(() => cameraQuaternion);
    }

  }, [mode, selectedEventIndex, events.length, isLoading, show3D]);

  return (
    <>
      <div className={`absolute inset-0 transition-opacity duration-500 ${show3D ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} ref={containerRef} />
      
      {isLoading && show3D && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-30">
              <Loader className="w-12 h-12 animate-spin text-primary" />
              <p className="mt-4 text-lg font-headline text-primary">CAMEROON OS Initializing...</p>
          </div>
      )}

      <div className={`absolute inset-0 transition-opacity duration-500 ${!show3D ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {mode === 'grid' && (
            <GridView events={events} onImageSelect={onImageSelect} />
        )}
      </div>

      {!isLoading && selectedEventIndex !== null && events[selectedEventIndex] &&(
        <ExploreOverlay
          event={events[selectedEventIndex]}
          currentIndex={selectedEventIndex}
          totalImages={events.length}
          onClose={closeExplore}
          onNavigate={(newIndex) => setSelectedEventIndex(newIndex)}
        />
      )}

      {!isLoading && <BottomNav activeMode={mode} onModeChange={handleModeChange} />}
    </>
  );
}
