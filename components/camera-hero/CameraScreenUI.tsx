'use client';

import { useCameraStore } from '@/lib/camera-store';
import { Text, useTexture, Image } from '@react-three/drei';
import { Suspense, useLayoutEffect, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

export function CameraScreenUI() {
  const { mode, photoIndex, photos } = useCameraStore();

  if (mode === 'off') {
    return <OffScreen />;
  }

  if (mode === 'welcome') {
    return <WelcomeScreen />;
  }

  if (!photos || photos.length === 0) {
    return <WelcomeScreen />; // Fallback to welcome if no photos
  }

  if (mode === 'grid') {
    return (
      <Suspense fallback={<WelcomeScreen />}>
        <GridScreen photoIndex={photoIndex} photos={photos} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<WelcomeScreen />}>
      <GalleryScreen photoIndex={photoIndex} photos={photos} />
    </Suspense>
  );
}

/* ── Off state: black screen ── */
function OffScreen() {
  const { camera } = useThree();
  const width = (camera as THREE.OrthographicCamera).right - (camera as THREE.OrthographicCamera).left || 20;
  const height = (camera as THREE.OrthographicCamera).top - (camera as THREE.OrthographicCamera).bottom || 20;
  return (
    <mesh>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial color="#000000" />
    </mesh>
  );
}

/* ── Welcome state: branding ── */
function WelcomeScreen() {
  const { camera } = useThree();
  const width = (camera as THREE.OrthographicCamera).right - (camera as THREE.OrthographicCamera).left || 20;
  const height = (camera as THREE.OrthographicCamera).top - (camera as THREE.OrthographicCamera).bottom || 20;
  // Scale text size proportional to height (approx 1/10th)
  const fontSize = height * 0.15;

  return (
    <group rotation={[0, 0, 0]}>
      {/* Background */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#111111" />
      </mesh>

      {/* Canon text */}
      <Text
        position={[0, fontSize * 0.5, 0]}
        fontSize={fontSize * 2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        CANON
      </Text>

      {/* Subtitle */}
      <Text
        position={[0, -fontSize * 0.8, 0]}
        fontSize={fontSize * 0.4}
        color="#888888"
        anchorX="center"
        anchorY="middle"
      >
        Ready to shoot
      </Text>

      {/* Power-on indicator dot */}
      <mesh position={[0, -fontSize * 2, 0]}>
        <circleGeometry args={[fontSize * 0.1, 32]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
    </group>
  );
}

/* ── Gallery state: photo viewer ── */
function GalleryScreen({
  photoIndex,
  photos,
}: {
  photoIndex: number;
  photos: string[];
}) {
  const { camera } = useThree();
  const [aspect, setAspect] = useState(1);

  /* Use the more robust useTexture from drei with CORS */
  const texture = useTexture(photos[photoIndex], (loader) => {
    if (loader instanceof THREE.TextureLoader) {
      loader.setCrossOrigin('anonymous');
    }
  });
  
  useLayoutEffect(() => {
    if (texture && texture.image) {
      const img = texture.image as { width: number; height: number };
      setAspect(img.width / img.height);
      texture.colorSpace = THREE.SRGBColorSpace;
    }
  }, [texture, photoIndex]);

  // Contain logic: fit image within the screen while maintaining aspect ratio
  const width = (camera as THREE.OrthographicCamera).right - (camera as THREE.OrthographicCamera).left || 20;
  const height = (camera as THREE.OrthographicCamera).top - (camera as THREE.OrthographicCamera).bottom || 20;
  const screenAspect = width / height;
  
  let planeW = width;
  let planeH = height;
  
  if (aspect > screenAspect) {
    planeH = width / aspect;
  } else {
    planeW = height * aspect;
  }

  const fontSize = height * 0.05;

  return (
    <group rotation={[0, 0, 0]}>
      {/* Background */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#050505" />
      </mesh>

      {/* Photo */}
      {texture && (
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[planeW, planeH]} />
          <meshBasicMaterial map={texture} />
        </mesh>
      )}

      {/* Photo counter overlay */}
      <Text
        position={[0, -height / 2 + fontSize * 1.5, 0.1]}
        fontSize={fontSize}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {`${photoIndex + 1} / ${photos.length}`}
      </Text>
    </group>
  );
}

/* ── Grid state: photo viewer ── */
function GridScreen({
  photoIndex,
  photos,
}: {
  photoIndex: number;
  photos: string[];
}) {
  const { camera } = useThree();
  
  const COLS = 3;
  const ROWS = 2;
  const ITEMS_PER_PAGE = COLS * ROWS;
  const pageIndex = Math.floor(photoIndex / ITEMS_PER_PAGE);
  const startIndex = pageIndex * ITEMS_PER_PAGE;
  // Get all photos for the current page
  const visiblePhotos = photos.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  /* Use the more robust useTexture from drei with CORS */
  const textures = useTexture(visiblePhotos, (loader) => {
    if (loader instanceof THREE.TextureLoader) {
      loader.setCrossOrigin('anonymous');
    }
  });

  useLayoutEffect(() => {
    const texArray = Array.isArray(textures) ? textures : [textures];
    texArray.forEach(tex => {
      if (tex) {
        tex.colorSpace = THREE.SRGBColorSpace;
      }
    });
  }, [textures]);

  const width = (camera as THREE.OrthographicCamera).right - (camera as THREE.OrthographicCamera).left || 20;
  const height = (camera as THREE.OrthographicCamera).top - (camera as THREE.OrthographicCamera).bottom || 20;

  const cellW = width / COLS;
  const cellH = height / ROWS;
  const gap = Math.min(width, height) * 0.02;

  const fontSize = height * 0.05;

  return (
    <group rotation={[0, 0, 0]}>
      {/* Background */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#050505" />
      </mesh>

      {/* Grid Iteration */}
      {visiblePhotos.map((_, i) => {
        const texArray = Array.isArray(textures) ? textures : [textures];
        const tex = texArray[i];
        if (!tex) return null;

        const row = Math.floor(i / COLS);
        const col = i % COLS;
        const x = -width / 2 + cellW / 2 + col * cellW;
        const y = height / 2 - cellH / 2 - row * cellH;

        const isSelected = startIndex + i === photoIndex;

        return (
          <group key={startIndex + i} position={[x, y, 0]}>
            {isSelected && (
              <mesh position={[0, 0, -0.01]}>
                <planeGeometry args={[cellW - gap, cellH - gap]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            )}
            <mesh>
              <planeGeometry args={[cellW - gap * 2, cellH - gap * 2]} />
              <meshBasicMaterial map={tex} />
            </mesh>
          </group>
        );
      })}

      {/* Photo counter overlay */}
      <mesh position={[0, -height / 2 + fontSize * 1.5, 0.05]}>
        <planeGeometry args={[width * 0.35, fontSize * 1.5]} />
        <meshBasicMaterial color="#000000" opacity={0.6} transparent />
      </mesh>
      <Text
        position={[0, -height / 2 + fontSize * 1.5, 0.1]}
        fontSize={fontSize}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {`${startIndex + 1}-${Math.min(startIndex + ITEMS_PER_PAGE, photos.length)} / ${photos.length}`}
      </Text>
    </group>
  );
}
