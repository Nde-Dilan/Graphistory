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
                _valuesStart[property] = _object[property];
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
    }
};

const IMAGE_SIZE = 2;
const TRANSITION_SPEED = 0.07;

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
    setPrevMode(mode);
    setSelectedImageIndex(index);
    if(mode === 'grid') {
      // Switch from grid to 3d view when an image is selected
      handleModeChange('sphere');
    }
  };
  
  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    if (newMode === 'grid') {
      setShow3D(false);
    } else {
      setShow3D(true);
    }
  };

  const closeExplore = () => {
    const lastMode = prevMode;
    setSelectedImageIndex(null);
    setMode(lastMode); // This will trigger the useEffect for mode changes
    if (lastMode === 'grid') {
      setShow3D(false);
    }
  };

  const setupScene = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
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
    const promises: Promise<void>[] = [];

    images.forEach((image, index) => {
      const promise = new Promise<void>((resolve) => {
        loader.load(image.imageUrl, (texture) => {
          const aspectRatio = texture.image.width / texture.image.height;
          const geometry = new THREE.PlaneGeometry(IMAGE_SIZE * aspectRatio, IMAGE_SIZE);
          const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.userData.id = image.id;
          mesh.userData.index = index;
          scene.add(mesh);
          imageMeshes[index] = mesh;
          resolve();
        });
      });
      promises.push(promise);
    });

    Promise.all(promises).then(() => {
        setIsLoading(false);
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
        if (!threeRef.current || !containerRef.current || selectedImageIndex !== null) return;
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
      if (renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      threeRef.current = undefined;
    };
  }, [images, selectedImageIndex]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    if (show3D) {
      if (!threeRef.current) {
        cleanup = setupScene();
      } else if (containerRef.current && threeRef.current.renderer.domElement.parentNode !== containerRef.current) {
        containerRef.current.appendChild(threeRef.current.renderer.domElement);
      }
    } else if(threeRef.current && threeRef.current.renderer.domElement.parentNode) {
        threeRef.current.renderer.domElement.parentNode.removeChild(threeRef.current.renderer.domElement)
    }
    
    return () => {
        if (cleanup) cleanup();
    }
  }, [show3D, setupScene]);

  const animate = useCallback(() => {
    animationFrameId.current = requestAnimationFrame(animate);
    if (!threeRef.current || !show3D || isLoading) return;
    const { renderer, scene, camera, controls, imageMeshes } = threeRef.current;

    TWEEN.update(performance.now());

    if (imageMeshes.length === images.length && selectedImageIndex === null) {
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
  }, [images.length, show3D, selectedImageIndex, isLoading]);

  useEffect(() => {
    animate();
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [animate]);

  useEffect(() => {
    if (isLoading || !threeRef.current || !show3D) return;
    const { camera, controls, imageMeshes } = threeRef.current;
    
    let points: THREE.Vector3[] = [];
    const sphereRadius = 15;
    
    if (selectedImageIndex !== null) {
      const selectedMesh = imageMeshes[selectedImageIndex];
      if (!selectedMesh) return;
      const camPos = selectedMesh.position.clone().add(new THREE.Vector3(0, 0, IMAGE_SIZE * 3));
      
      imageMeshes.forEach((mesh, i) => {
        if (mesh) {
            new TWEEN.Tween(mesh.material)
              .to({ opacity: i === selectedImageIndex ? 1 : 0 }, 500)
              .start();
        }
      });

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
      imageMeshes.forEach(mesh => {
        if (mesh) {
           new TWEEN.Tween(mesh.material).to({ opacity: 1 }, 500).start();
        }
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
      <div className={`absolute inset-0 transition-opacity duration-500 ${show3D && !isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} ref={containerRef} />
      
      {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-30">
              <Loader className="w-12 h-12 animate-spin text-primary" />
              <p className="mt-4 text-lg font-headline text-foreground">Loading Visual Explorer...</p>
          </div>
      )}

      <div className={`absolute inset-0 transition-opacity duration-500 ${!show3D && !isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {mode === 'grid' && (
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

    