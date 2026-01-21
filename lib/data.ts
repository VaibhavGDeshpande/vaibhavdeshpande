// lib/data.ts

// --- 1. CONFIGURATION ---
// You can keep your folder counts here if you use the generator for the gallery
const CATEGORY_CONFIG = {
  Animals: 6,
  Bike: 14,
  Fort: 9,
  Moon: 6,
  Sky: 21,
  Space: 6,
  Sun: 5,
};

const PUNE_SUBFOLDERS = {
  faces: 5,
  motion: 6,
  normal: 21,
  opening: 4,
};

// --- 2. TYPES ---
export type Category = 
  | 'Animals' | 'Bike' | 'Fort' | 'Moon' 
  | 'Pune Grand Tour' | 'Sky' | 'Space' | 'Sun' | 'Nature';

export interface Photo {
  id: string;
  src: string;
  alt: string;
  category: Category;
  title: string;
  year: string;
  width: number;
  height: number;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  photoCount: number;
}

export const heroImages: Photo[] = [
  {
    id: 'hero-1',
    src: '/assets/PuneGrandTour/motion/1.jpg',
    alt: 'Pune Portrait',
    category: 'Pune Grand Tour', 
    title: 'The Observer',
    year: '2024',
    width: 1200,  // Portrait example
    height: 800,
  },
  {
    id: 'hero-2',
    src: '/assets/Moon/2.jpg',
    alt: 'Lunar Details',
    category: 'Moon',
    title: 'Silence in Space',
    year: '2024',
    width: 1200, // Square/Portrait example
    height: 800, 
  },
  {
    id: 'hero-3',
    src: '/assets/Fort/3.jpg',
    alt: 'Fort Walls',
    category: 'Nature',
    title: 'High Ranges',
    year: '2023',
    width: 1200, // Landscape example
    height: 800,
  }
];

// --- 4. COLLECTIONS (For Preview) ---
export const collections: Collection[] = [
  {
    id: 'Pune Grand Tour',
    name: 'Pune Grand Tour',
    description: 'A visual narrative of city life, faces, and motion.',
    coverImage: '/assets/PuneGrandTour/normal/18.jpg',
    // Calculates total from all subfolders (5 + 4 + 10 + 3 = 22)
    photoCount: Object.values(PUNE_SUBFOLDERS).reduce((a, b) => a + b, 0),
  },
  {
    id: 'Moon',
    name: 'Moon',
    description: 'Phases and craters in high contrast.',
    coverImage: '/assets/Moon/1.jpg',
    photoCount: CATEGORY_CONFIG.Moon,
  },
  {
    id: 'Fort',
    name: 'Forts',
    description: 'Ancient stone sentinels against the sky.',
    coverImage: '/assets/Fort/1.jpg',
    photoCount: CATEGORY_CONFIG.Fort,
  },
  {
    id: 'Animals',
    name: 'Wildlife',
    description: 'Silent observers in the wild.',
    coverImage: '/assets/animals/3.jpg',
    photoCount: CATEGORY_CONFIG.Animals,
  },
  {
    id: 'Sky',
    name: 'Sky & Horizons',
    description: 'Gradients of dawn and dusk.',
    coverImage: '/assets/Sky/7.jpg',
    photoCount: CATEGORY_CONFIG.Sky,
  },
  {
    id: 'Space',
    name: 'Deep Space',
    description: 'The vastness beyond our atmosphere.',
    coverImage: '/assets/Space/1.jpg',
    photoCount: CATEGORY_CONFIG.Space,
  },
  {
    id: 'Sun',
    name: 'Solar',
    description: 'Light, flares, and heat.',
    coverImage: '/assets/Sun/1.jpg',
    photoCount: CATEGORY_CONFIG.Sun,
  },
  {
    id: 'Bike',
    name: 'The Journey',
    description: 'Machines and open roads.',
    coverImage: '/assets/bike/3.jpg',
    photoCount: CATEGORY_CONFIG.Bike,
  },
  // Add others if needed...
];

// --- 5. AUTOMATIC PHOTO GENERATOR (For Gallery Page) ---
const generatePhotos = (): Photo[] => {
  const allPhotos: Photo[] = [];

  // A. Standard Categories
  Object.entries(CATEGORY_CONFIG).forEach(([catName, count]) => {
    for (let i = 1; i <= count; i++) {
      allPhotos.push({
        id: `${catName.toLowerCase()}-${i}`,
        src: `/assets/${catName}/${i}.jpg`,
        alt: `${catName} photo ${i}`,
        title: `${catName} ${i}`,
        category: catName as Category,
        year: '2024',
        width: 1200,
        height: 800,
      });
    }
  });

  // B. Pune Grand Tour Subfolders
  Object.entries(PUNE_SUBFOLDERS).forEach(([subfolder, count]) => {
    for (let i = 1; i <= count; i++) {
      allPhotos.push({
        id: `pune-${subfolder}-${i}`,
        src: `/assets/PuneGrandTour/${subfolder}/${i}.jpg`,
        alt: `Pune ${subfolder} photo ${i}`,
        title: `Pune: ${subfolder.charAt(0).toUpperCase() + subfolder.slice(1)}`,
        category: 'Pune Grand Tour',
        year: '2023',
        width: 1200,
        height: 800,
      });
    }
  });

  return allPhotos;
};

export const photos = generatePhotos();