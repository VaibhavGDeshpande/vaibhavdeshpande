import supabase from './supabase';
// export const CATEGORY_CONFIG = {
//   Animals: 6,
//   Bike: 14,
//   Nature: 9,
//   Moon: 12,
//   Sky: 21,
//   Space: 7,
//   Sun: 5,
// };

// export const PUNE_SUBFOLDERS = {
//   faces: 5,
//   motion: 6,
//   normal: 21,
//   opening: 4,
// };

export type Category =
  | 'Animals'
  | 'Bike'
  | 'Nature'
  | 'Moon'
  | 'Pune Grand Tour'
  | 'Sky'
  | 'Space'
  | 'Sun'
  | 'Nature';

export interface Photo {
  id: string;
  title: string;
  category: Category;
  image_url: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  photoCount: number;
}


const HERO_IMAGE_URLS = [
  'Sky/8.jpg',
  'Moon/12.jpg',
  'Nature/5.jpg',
];

const COLLECTION_COVER_MAP: Record<string, string> = {
  'Pune Grand Tour': 'Pune Grand Tour/normal/18.jpg',
  Moon: 'Moon/1.jpg',
  Nature: 'Nature/3.jpg',
  Animals: 'Animals/3.jpg',
  Sky: 'Sky/3.jpg',
  Space: 'Space/1.jpg',
  Sun: 'Sun/1.jpg',
  Bike: 'Bike/3.jpg',
};


const STORAGE_BASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL +
  '/storage/v1/object/public/photos/';

export async function getPhotos(): Promise<Photo[]> {
  const { data, error } = await supabase
    .from('photos')
    .select('id, title, category, image_url');

  if (error || !data) {
    console.error('Supabase error:', error);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category as Category,
    image_url: `${STORAGE_BASE_URL}${row.image_url}`,
  }));
}

export async function getHeroImages(): Promise<Photo[]> {
  const photos = await getPhotos();

  return photos.filter((photo) =>
    HERO_IMAGE_URLS.includes(
      photo.image_url.replace(STORAGE_BASE_URL, '')
    )
  );
}


export async function getCollections(): Promise<Collection[]> {
  const photos = await getPhotos();

  const grouped = photos.reduce<Record<string, Photo[]>>((acc, photo) => {
    acc[photo.category] ??= [];
    acc[photo.category].push(photo);
    return acc;
  }, {});

  return Object.entries(grouped).map(([category, items]) => {
    const coverPath = COLLECTION_COVER_MAP[category];
    const cover =
      items.find(
        (p) =>
          p.image_url.replace(STORAGE_BASE_URL, '') === coverPath
      ) ?? items[0]; // fallback

    return {
      id: category,
      name: category,
      description: `A curated collection of ${category}`,
      coverImage: cover.image_url,
      photoCount: items.length,
    };
  });
}

