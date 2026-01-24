import supabase from './supabase';
export const CATEGORY_CONFIG = {
  Animals: 6,
  Bike: 14,
  Fort: 9,
  Moon: 12,
  Sky: 21,
  Space: 6,
  Sun: 5,
};

export const PUNE_SUBFOLDERS = {
  faces: 5,
  motion: 6,
  normal: 21,
  opening: 4,
};



export type Category =
  | 'Animals'
  | 'Bike'
  | 'Fort'
  | 'Moon'
  | 'Pune Grand Tour'
  | 'Sky'
  | 'Space'
  | 'Sun'
  | 'Nature';

export interface Photo {
  id: null | undefined;
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
    id:row.id,
    title: row.title,
    category: row.category as Category,
    image_url: `${STORAGE_BASE_URL}${row.image_url}`,
  }));
}


export async function getHeroImages(): Promise<Photo[]> {
  const photos = await getPhotos();

  return [
    photos.find((p) => p.category === 'Pune Grand Tour'),
    photos.find((p) => p.category === 'Moon'),
    photos.find((p) => p.category === 'Fort'),
  ].filter(Boolean) as Photo[];
}


export async function getCollections(): Promise<Collection[]> {
  const photos = await getPhotos();

  const grouped = photos.reduce<Record<string, Photo[]>>((acc, photo) => {
    acc[photo.category] ??= [];
    acc[photo.category].push(photo);
    return acc;
  }, {});

  return Object.entries(grouped).map(([category, items]) => ({
    id: category,
    name: category,
    description: `A curated collection of ${category}`,
    coverImage: items[0].image_url,
    photoCount: items.length,
  }));
}
