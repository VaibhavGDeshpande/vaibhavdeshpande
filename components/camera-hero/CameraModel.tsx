'use client';

import { useRef, useMemo, Suspense } from 'react';
import { useGLTF, RenderTexture, OrthographicCamera } from '@react-three/drei';
import { useCameraStore } from '@/lib/camera-store';
import { CameraScreenUI } from './CameraScreenUI';
import { createPortal } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── Main camera model ─── */
export function CameraModel({ scale = 3 }: { scale?: number }) {
  const { scene } = useGLTF('/poly.glb');
  const groupRef = useRef<THREE.Group>(null);

  const { mode, powerOn, powerOff, openGallery, nextPhoto, prevPhoto } =
    useCameraStore();

  /* Find specific meshes for interaction and screen display */
  const { screenData, powerBtnMesh, prevBtnMesh, nextBtnMesh, galleryBtnMesh } = useMemo(() => {
    const screenMeshes: THREE.Mesh[] = [];
    let power: THREE.Mesh | null = null;
    let prev: THREE.Mesh | null = null;
    let next: THREE.Mesh | null = null;
    let gallery: THREE.Mesh | null = null;
    
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();
        
        if (name.includes('screen')) {
          screenMeshes.push(mesh);
          mesh.visible = false;
        }
        if (name.includes('btn_power') || (name.includes('power') && name.includes('btn'))) power = mesh;
        if (name.includes('arrow_left') || name.includes('btn_prev')) prev = mesh;
        if (name.includes('arrow_right') || name.includes('btn_next')) next = mesh;
        if (name.includes('btn_gallery') || name.includes('gallery')) gallery = mesh;
      }
    });

    // Calculate size and center from the combined bounding box of all screen parts
    let size: [number, number] = [0.8, 0.6]; 
    let offset = new THREE.Vector3();
    let screenParent: THREE.Object3D | null = null;
    let nodePosition = new THREE.Vector3();
    let nodeRotation = new THREE.Euler();
    let nodeScale = new THREE.Vector3(1, 1, 1);
    let planeRotation = new THREE.Euler(0, 0, 0);
    let offsetFix = new THREE.Vector3(0, 0, 0);

    if (screenMeshes.length > 0) {
      const box = new THREE.Box3();
      // Use the first mesh as the anchor for transformation
      const anchor = screenMeshes[0];
      screenParent = anchor.parent;
      nodePosition.copy(anchor.position);
      nodeRotation.copy(anchor.rotation);
      nodeScale.copy(anchor.scale);

      screenMeshes.forEach(mesh => {
        mesh.geometry.computeBoundingBox();
        if (mesh.geometry.boundingBox) {
          box.expandByPoint(mesh.geometry.boundingBox.min);
          box.expandByPoint(mesh.geometry.boundingBox.max);
        }
      });
      
      box.getCenter(offset);

      const dx = box.max.x - box.min.x;
      const dy = box.max.y - box.min.y;
      const dz = box.max.z - box.min.z;
      
      if (dx <= dy && dx <= dz) {
        // Normal is X axis
        size = [dz, dy];
        // If screen is on the +X side, front points to +X -> rotate Y by +90 deg
        // If screen is on the -X side, front points to -X -> rotate Y by -90 deg
        planeRotation.set(0, offset.x > 0 ? Math.PI / 2 : -Math.PI / 2, 0);
        offsetFix.x = offset.x > 0 ? 0.002 : -0.002;
      } else if (dy <= dx && dy <= dz) {
        // Normal is Y axis
        size = [dx, dz];
        planeRotation.set(offset.y > 0 ? -Math.PI / 2 : Math.PI / 2, 0, 0);
        offsetFix.y = offset.y > 0 ? 0.002 : -0.002;
      } else {
        // Normal is Z axis
        size = [dx, dy];
        // If screen is on -Z side, we might need to rotate 180 around Y to point backwards
        if (offset.z < 0) planeRotation.set(0, Math.PI, 0);
        offsetFix.z = offset.z > 0 ? 0.002 : -0.002;
      }
    }

    return { 
      screenData: screenMeshes.length > 0 ? { 
        size,
        nodePosition,
        nodeRotation,
        nodeScale,
        innerPosition: offset.add(offsetFix),
        planeRotation,
        parent: screenParent
      } : null, 
      powerBtnMesh: power as THREE.Mesh | null, 
      prevBtnMesh: prev as THREE.Mesh | null, 
      nextBtnMesh: next as THREE.Mesh | null, 
      galleryBtnMesh: gallery as THREE.Mesh | null 
    };
  }, [scene]);

  return (
    <group ref={groupRef} dispose={null} scale={scale}>
      {/* ── Main GLB Model ── */}
      <primitive
        object={scene}
        onClick={(e: any) => {
          e.stopPropagation();
          const name = e.object.name.toLowerCase();
          console.log('Camera Interaction:', name);

          if (name.includes('power') || name.includes('pwr')) {
            mode === 'off' ? powerOn() : powerOff();
          } else if (name.includes('gallery') || name.includes('menu')) {
            if (mode !== 'off') openGallery();
          } else if (name.includes('prev') || name.includes('left') || name.includes('arrow')) {
            // If it's a generic arrow, we might need to distinguish left/right
            // For now, let's assume 'left' or '1' is prev, 'right' or '2' is next
            if (mode === 'gallery' || mode === 'grid') {
              // inverted per user request
              if (name.includes('right') || name.includes('2') || name.includes('next')) prevPhoto();
              else nextPhoto();
            }
          }
        }}
        onPointerOver={(e: any) => {
          const name = e.object.name.toLowerCase();
          const interactive = ['btn', 'button', 'power', 'pwr', 'gallery', 'arrow', 'menu', 'screen'].some(key => name.includes(key));
          if (interactive) document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      />

      {/* ── Interactive Screen Overlay ── */}
      {/* We use a clean PlaneGeometry instead of the scanned mesh's geometry to ensure a solid screen */}
      {screenData && createPortal(
        <group
          position={screenData.nodePosition}
          rotation={screenData.nodeRotation}
          scale={screenData.nodeScale}
        >
          <mesh
            position={screenData.innerPosition}
            rotation={screenData.planeRotation}
          >
            <planeGeometry args={screenData.size} />
            <meshBasicMaterial toneMapped={false} side={THREE.DoubleSide}>
              <RenderTexture 
                attach="map" 
                width={512} 
                height={Math.round(512 * (screenData.size[1] / screenData.size[0]))}
              >
                <OrthographicCamera 
                  makeDefault 
                  left={-10 * (screenData.size[0] / screenData.size[1])} 
                  right={10 * (screenData.size[0] / screenData.size[1])} 
                  top={10} 
                  bottom={-10} 
                  near={0.1} 
                  far={10} 
                  position={[0, 0, 5]} 
                />
                <ambientLight intensity={1.5} />
                <Suspense fallback={null}>
                  <CameraScreenUI />
                </Suspense>
              </RenderTexture>
            </meshBasicMaterial>
          </mesh>
        </group>,
        screenData.parent || scene
      )}
    </group>
  );
}



/* Preload the GLB */
useGLTF.preload('/poly.glb');
