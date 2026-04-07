import { create } from 'zustand';

export type CameraMode = 'off' | 'welcome' | 'gallery' | 'grid';

interface CameraState {
  mode: CameraMode;
  photoIndex: number;
  photos: string[];

  powerOn: () => void;
  powerOff: () => void;
  openGallery: () => void;
  nextPhoto: () => void;
  prevPhoto: () => void;
  setPhotos: (photos: string[]) => void;
}

export const useCameraStore = create<CameraState>((set, get) => ({
  mode: 'off',
  photoIndex: 0,
  photos: [],

  powerOn: () => set({ mode: 'welcome' }),
  powerOff: () => set({ mode: 'off', photoIndex: 0 }),

  openGallery: () => {
    const { mode } = get();
    if (mode === 'grid') {
      set({ mode: 'gallery' });
    } else {
      set({ mode: 'grid' });
    }
  },

  nextPhoto: () => {
    const { photoIndex, photos } = get();
    set({ photoIndex: (photoIndex + 1) % photos.length });
  },

  prevPhoto: () => {
    const { photoIndex, photos } = get();
    if (photos.length === 0) return;
    set({ photoIndex: (photoIndex - 1 + photos.length) % photos.length });
  },

  setPhotos: (photos: string[]) => set({ photos }),
}));
