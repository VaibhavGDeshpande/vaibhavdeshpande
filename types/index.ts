export interface Photo {
  id: string;
  src: string;
  alt: string;
  title: string;
  category: string;
  location?: string;
  year?: string;
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

export type Category = 'all' | 'landscapes' | 'urban' | 'portraits' | 'nature';