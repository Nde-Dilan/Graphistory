'use client';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import BottomNav from './bottom-nav';
import GridView from './grid-view';
import ExploreOverlay from './explore-overlay';
import { getSpherePoints, getNamePoints } from '@/lib/three-helpers';
import { Loader } from 'lucide-react';

type Mode = 'grid' | 'sphere' | 'name';

type ThreeObjects = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  imageMeshes: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[];
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
};

const IMAGE_SIZE = 2;
const TRANSITION_SPEED = 0.07;

// Polyfill for TWEEN
const TWEEN = {
    Easing: { Quadratic: { Out: (k: number) => k * ( 2 - k ) } },
    _tweens: [] as any[],
    update: function(time: number) {
        if (this._tweens.length === 0) return false;
        let i = 0;
        const num_tweens = this._tweens.length;
        while (i < num_tweens) {
            if (this._tweens[i].update(time)) {
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

        this.to = function(properties: any, duration: number) {
            _valuesEnd = properties;
            if(duration !== undefined) _duration = duration;
            return this;
        };
        this.start = function(time?: number) {
            TWEEN.add(this);
            _startTime = time !== undefined ? time : Date.now();
            for (var property in _valuesEnd) {
                if (_object[property] === undefined) continue;
                _valuesStart[property] = _object[property];
            }
            return this;
        };
        this.easing = function(easing: any) {
            _easingFunction = easing;
            return this;
        };
        this.update = function(time: number) {
            let elapsed = (time - _startTime) / _duration;
            elapsed = elapsed > 1 ? 1 : elapsed;
            const value = _easingFunction(elapsed);
            for (var property in _valuesEnd) {
                const start = _valuesStart[property] || 0;
                const end = _valuesEnd[property];
                if (end instanceof THREE.Vector3) {
                      _object[property].lerpVectors(start, end, value);
                } else {
                    _object[property] = start + (end - start) * value;
                }
            }
            if (elapsed === 1) return false;
            return true;
        };
    }
};

export default function VisualExplorerClient({ images }: { images: ImagePlaceholder[] }) {
  const [mode, setMode] = useState<Mode>('sphere');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [prevMode, setPrevMode] = useState<Mode>('sphere');
  const [show3D, setShow3D] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const threeRef = useRef<ThreeObjects>();
  const animationFrameId = useRef<number>();
  const targetPositions = useRef<THREE.Vector3[]>([]);
  const targetQuaternions = useRef<THREE.Quaternion[]>([]);

  const onImageSelect = (index: number) => {
    if(mode === 'grid') {
      setShow3D(true);
      setMode('sphere');
    }
    setPrevMode(mode === 'grid' ? 'sphere' : mode);
    setSelectedImageIndex(index);
  };
  
  const handleModeChange = (newMode: Mode) => {
    if (newMode === 'grid') {
      setShow3D(false);
    } else {
      setShow3D(true);
    }
    setMode(newMode);
    setSelectedImageIndex(null);
  };

  const closeExplore = () => {
    setSelectedImageIndex(null);
    if(prevMode === 'grid') {
      setShow3D(false);
    }
    setMode(prevMode);
  };

  const setupScene = useCallback(() => {
    if (!containerRef.current || !show3D) return;
    const container = containerRef.current;

    if (threeRef.current) {
        if(threeRef.current.renderer.domElement.parentNode !== container) {
            container.appendChild(threeRef.current.renderer.domElement);
        }
        return;
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
    const imageMeshes: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = [];

    let loadedCount = 0;
    images.forEach((image, index) => {
      loader.load(image.imageUrl, (texture) => {
        const aspectRatio = texture.image.width / texture.image.height;
        const geometry = new THREE.PlaneGeometry(IMAGE_SIZE * aspectRatio, IMAGE_SIZE);
        const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData.id = image.id;
        mesh.userData.index = index;
        scene.add(mesh);
        imageMeshes[index] = mesh;
        
        loadedCount++;
        if (loadedCount === images.length) {
            setIsLoading(false);
        }
      });
    });

    threeRef.current = { scene, camera, renderer, controls, imageMeshes, raycaster, mouse };

    const onWindowResize = () => {
      if (!threeRef.current || !container) return;
      const { camera, renderer } = threeRef.current;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    const onClick = (event: MouseEvent) => {
        if (!threeRef.current || !containerRef.current) return;
        const { camera, imageMeshes, raycaster, mouse } = threeRef.current;
        const rect = containerRef.current.getBoundingClientRect();

        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(imageMeshes);

        if (intersects.length > 0) {
            const index = intersects[0].object.userData.index;
            onImageSelect(index);
        }
    }

    window.addEventListener('resize', onWindowResize);
    container.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('resize', onWindowResize);
      container.removeEventListener('click', onClick);
      if(threeRef.current && threeRef.current.renderer.domElement.parentNode === container) {
        container.removeChild(threeRef.current.renderer.domElement);
      }
    };
  }, [images, show3D]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    if (show3D) {
        cleanup = setupScene();
    } else {
        if (threeRef.current?.renderer.domElement.parentNode) {
            threeRef.current.renderer.domElement.parentNode.removeChild(threeRef.current.renderer.domElement)
        }
    }
    
    return () => {
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        if (cleanup) cleanup();
    }
  }, [setupScene, show3D]);

  const animate = useCallback(() => {
    animationFrameId.current = requestAnimationFrame(animate);
    if (!threeRef.current) return;
    const { renderer, scene, camera, controls, imageMeshes } = threeRef.current;

    TWEEN.update(performance.now());

    if (imageMeshes.length === images.length) {
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
  }, [images.length]);

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
    const { camera, controls } = threeRef.current;
    
    let points: THREE.Vector3[] = [];
    const sphereRadius = 15;
    
    if (selectedImageIndex !== null) {
      const selectedMesh = threeRef.current.imageMeshes[selectedImageIndex];
      if (!selectedMesh) return;
      const camPos = selectedMesh.position.clone().add(new THREE.Vector3(0, 0, IMAGE_SIZE * 2));
      
      const newTargetPositions: THREE.Vector3[] = [];
      const newTargetQuaternions: THREE.Quaternion[] = [];

      images.forEach((_, i) => {
        const mesh = threeRef.current!.imageMeshes[i];
        if(mesh) {
            if (i === selectedImageIndex) {
                newTargetPositions[i] = selectedMesh.position.clone();
                newTargetQuaternions[i] = new THREE.Quaternion().setFromEuler(new THREE.Euler(0,0,0));
            } else {
                newTargetPositions[i] = mesh.position.clone();
                newTargetQuaternions[i] = mesh.quaternion.clone();
            }
            mesh.material.opacity = i === selectedImageIndex ? 1 : 0;
        }
      });
      targetPositions.current = newTargetPositions;
      targetQuaternions.current = newTargetQuaternions;

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
      threeRef.current.imageMeshes.forEach(mesh => {
        if (mesh) mesh.material.opacity = 1;
      });

      switch (mode) {
        case 'sphere':
          points = getSpherePoints(images.length, sphereRadius);
          break;
        case 'name':
          points = getNamePoints(images.length);
          break;
        case 'grid':
          return;
      }
      targetPositions.current = points;
      const cameraQuaternion = camera.quaternion.clone();
      targetQuaternions.current = images.map(() => cameraQuaternion);
    }

  }, [mode, selectedImageIndex, images.length, isLoading, show3D]);

  return (
    <>
      <div className={`absolute inset-0 transition-opacity duration-500 ${show3D ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} ref={containerRef} />
      
      {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-20">
              <Loader className="w-12 h-12 animate-spin text-primary" />
              <p className="mt-4 text-lg font-headline text-foreground">Loading Visual Explorer...</p>
          </div>
      )}

      <div className={`absolute inset-0 transition-opacity duration-500 ${!show3D ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {!isLoading && mode === 'grid' && (
            <GridView images={images} onImageSelect={onImageSelect} />
        )}
      </div>

      {!isLoading && selectedImageIndex !== null && (
        <ExploreOverlay
          image={images[selectedImageIndex]}
          currentIndex={selectedImageIndex}
          totalImages={images.length}
          onClose={closeExplore}
          onNavigate={(newIndex) => setSelectedImageIndex(newIndex)}
        />
      )}

      {!isLoading && <BottomNav activeMode={mode} onModeChange={handleModeChange} />}
    </>
  );
}
