'use client';

import { useRef, useEffect, Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { CameraModel } from './CameraModel';
import { useCameraStore } from '@/lib/camera-store';
import './camera-hero.css';

export default function CameraScene({ photos }: { photos: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Default base scale
  const [baseScale, setBaseScale] = useState(3);
  // User zoom scale
  const [zoomScale, setZoomScale] = useState<number | null>(null);
  
  const { mode, nextPhoto, prevPhoto, setPhotos } = useCameraStore();

  /* ── Responsive layout ── */
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (width < 768) {
        setBaseScale(height > width ? 1.5 : 1.8);
      } else if (width < 1024) {
        setBaseScale(6);
      } else {
        setBaseScale(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scale = zoomScale !== null ? zoomScale : baseScale;

  /* ── Sync external photos with store ── */
  useEffect(() => {
    if (photos && photos.length > 0) {
      setPhotos(photos);
    }
  }, [photos, setPhotos]);

  /* ── Scroll → gallery navigation ── */
  // useEffect(() => {
  //   const el = containerRef.current;
  //   if (!el) return;

  //   let scrollTimeout: ReturnType<typeof setTimeout>;

  //   const handleWheel = (e: WheelEvent) => {
  //     if (mode !== 'gallery') return;
  //     e.preventDefault();

  //     clearTimeout(scrollTimeout);
  //     scrollTimeout = setTimeout(() => {
  //       if (e.deltaY > 0) nextPhoto();
  //       else prevPhoto();
  //     }, 80);
  //   };

  //   el.addEventListener('wheel', handleWheel, { passive: false });
  //   return () => {
  //     el.removeEventListener('wheel', handleWheel);
  //     clearTimeout(scrollTimeout);
  //   };
  // }, [mode, nextPhoto, prevPhoto]);

  return (
    <div ref={containerRef} className="camera-hero">
      {/* Rotate prompt for mobile portrait */}
      <div className="camera-hero__rotate-prompt">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
        <p>Please rotate your device to landscape<br />for the best camera experience.</p>
      </div>

      {/* Overlay text */}
      {/* <div className="camera-hero__overlay">
        <h1 className="camera-hero__title">Behind the Lens</h1>
        <p className="camera-hero__subtitle">
          Click the power button to begin &bull; Rotate freely
        </p>
      </div> */}

      {/* ── Zoom Control Slider ── */}
      <div className="camera-hero__zoom-control">
        <span className="zoom-label">Model Size</span>
        <input 
          type="range" 
          min="1" 
          max="6" 
          step="0.1" 
          value={scale} 
          onChange={(e) => setZoomScale(parseFloat(e.target.value))}
          className="zoom-slider"
        />
        <span className="zoom-value">{scale.toFixed(1)}x</span>
      </div>

      <Canvas
        camera={{ position: [0, 0.2, 2.2], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-3, 2, -2]} intensity={0.4} />

        <Suspense fallback={null}>
          <CameraModel scale={scale} />
          <Environment preset="city" />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={1.5}
          maxDistance={5}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>

      {/* Mode indicator */}
      {/* {mode !== 'off' && (
        <div className="camera-hero__status">
          {mode === 'welcome' && 'Camera ON — Click Gallery to browse'}
          {mode === 'gallery' && 'Scroll to navigate photos'}
        </div>
      )} */}
    </div>
  );
}
