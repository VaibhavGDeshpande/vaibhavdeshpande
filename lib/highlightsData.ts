import { SongTrack, TRENDING_SONGS } from './music';

export interface StorySlide {
  id: string;
  imageUrl: string;
  title: string;
  caption?: string;
  location?: string;
  date?: string;
}

export interface Highlight {
  id: string;
  title: string;
  coverImage: string;
  isUnseen?: boolean;
  song: SongTrack;
  slides: StorySlide[];
}

const STORAGE_BASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL +
  '/storage/v1/object/public/photos/';

export const DEFAULT_HIGHLIGHTS: Highlight[] = [
  {
    id: 'highlight-pune-vibe',
    title: 'Pune Vibe 🌆',
    coverImage: `${STORAGE_BASE_URL}Pune Grand Tour/normal/18.jpg`,
    isUnseen: true,
    song: {
      id: 'pune-song',
      title: 'Monsoon Rain & Chill',
      artist: 'Ambient Soundscapes',
      albumCover: `${STORAGE_BASE_URL}Pune Grand Tour/normal/18.jpg`,
      previewUrl: TRENDING_SONGS[1].previewUrl,
    },
    slides: [
      {
        id: 'slide-pune-1',
        imageUrl: `${STORAGE_BASE_URL}Pune Grand Tour/normal/18.jpg`,
        title: 'Shaniwar Wada Lights',
        caption: 'Historic architecture bathed in evening glow ✨',
        location: '📍 Shaniwar Wada, Pune',
        date: 'Recent Shoot',
      },
      {
        id: 'slide-pune-2',
        imageUrl: `${STORAGE_BASE_URL}Pune Grand Tour/motion/6.jpg`,
        title: 'City in Motion',
        caption: 'Capturing the vibrant pulse of Pune streets 🚦',
        location: '📍 FC Road, Pune',
        date: 'Recent Shoot',
      },
      {
        id: 'slide-pune-3',
        imageUrl: `${STORAGE_BASE_URL}Pune Grand Tour/faces/5.jpg`,
        title: 'Street Portraits',
        caption: 'Candid smiles and timeless stories 📸',
        location: '📍 Old City, Pune',
        date: 'Recent Shoot',
      },
    ],
  },
  {
    id: 'highlight-golden-hour',
    title: 'Golden Hour 🌅',
    coverImage: `${STORAGE_BASE_URL}Sun/1.jpg`,
    isUnseen: true,
    song: {
      id: 'golden-song',
      title: 'Golden Sunset Vibes',
      artist: 'Acoustic Dreams',
      albumCover: `${STORAGE_BASE_URL}Sun/1.jpg`,
      previewUrl: TRENDING_SONGS[2].previewUrl,
    },
    slides: [
      {
        id: 'slide-sun-1',
        imageUrl: `${STORAGE_BASE_URL}Sun/1.jpg`,
        title: 'Chasing Sunsets',
        caption: 'When the sky turns into a golden canvas 🌅',
        location: '📍 Western Ghats',
        date: 'Golden Hour Series',
      },
      {
        id: 'slide-nature-5',
        imageUrl: `${STORAGE_BASE_URL}Nature/5.jpg`,
        title: 'Wild Horizons',
        caption: 'Peaceful silence under the fading sun 🌿',
        location: '📍 Fort Sinhagad',
        date: 'Landscape Collection',
      },
    ],
  },
  {
    id: 'highlight-night-sky',
    title: 'Night Sky 🌌',
    coverImage: `${STORAGE_BASE_URL}Moon/12.jpg`,
    isUnseen: false,
    song: {
      id: 'night-song',
      title: 'Midnight Synthwave Drive',
      artist: 'Retro Cyber Beats',
      albumCover: `${STORAGE_BASE_URL}Moon/12.jpg`,
      previewUrl: TRENDING_SONGS[3].previewUrl,
    },
    slides: [
      {
        id: 'slide-moon-12',
        imageUrl: `${STORAGE_BASE_URL}Moon/12.jpg`,
        title: 'Lunar Details',
        caption: 'Supermoon captured through 600mm lens 🌕',
        location: '📍 Night Observatory',
        date: 'Astro Series',
      },
      {
        id: 'slide-sky-8',
        imageUrl: `${STORAGE_BASE_URL}Sky/8.jpg`,
        title: 'Starlight Canopy',
        caption: 'Endless celestial wonder 🌟',
        location: '📍 Dark Sky Park',
        date: 'Astro Series',
      },
      {
        id: 'slide-space-1',
        imageUrl: `${STORAGE_BASE_URL}Space/1.jpg`,
        title: 'Cosmic Horizons',
        caption: 'Deep sky photography experiments 💫',
        location: '📍 Observatory',
        date: 'Deep Space',
      },
    ],
  },
  {
    id: 'highlight-nature-wild',
    title: 'Nature & Wild 🌿',
    coverImage: `${STORAGE_BASE_URL}Nature/3.jpg`,
    isUnseen: false,
    song: {
      id: 'lofi-song',
      title: 'Aesthetic Lofi Chill',
      artist: 'ChillHop Beats',
      albumCover: `${STORAGE_BASE_URL}Nature/3.jpg`,
      previewUrl: TRENDING_SONGS[0].previewUrl,
    },
    slides: [
      {
        id: 'slide-nature-3',
        imageUrl: `${STORAGE_BASE_URL}Nature/3.jpg`,
        title: 'Misty Mountains',
        caption: 'Early morning fog rolling over green peaks 🌫️',
        location: '📍 Sahyadri Ranges',
        date: 'Nature Series',
      },
      {
        id: 'slide-animals-3',
        imageUrl: `${STORAGE_BASE_URL}Animals/3.jpg`,
        title: 'Wildlife Moments',
        caption: 'Untamed beauty in natural habitat 🦌',
        location: '📍 Wildlife Reserve',
        date: 'Wildlife Series',
      },
    ],
  },
];

const LOCAL_STORAGE_KEY = 'vaibhav_custom_highlights_v1';

export function getStoredHighlights(): Highlight[] {
  if (typeof window === 'undefined') return DEFAULT_HIGHLIGHTS;
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) return DEFAULT_HIGHLIGHTS;
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_HIGHLIGHTS;
  } catch (err) {
    console.error('Failed to parse highlights:', err);
    return DEFAULT_HIGHLIGHTS;
  }
}

export function saveStoredHighlight(highlight: Highlight): Highlight[] {
  if (typeof window === 'undefined') return DEFAULT_HIGHLIGHTS;
  const current = getStoredHighlights();
  const existingIdx = current.findIndex((h) => h.id === highlight.id);
  let updated: Highlight[];

  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = highlight;
  } else {
    updated = [highlight, ...current];
  }

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteStoredHighlight(id: string): Highlight[] {
  if (typeof window === 'undefined') return DEFAULT_HIGHLIGHTS;
  const current = getStoredHighlights();
  const updated = current.filter((h) => h.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  return updated.length > 0 ? updated : DEFAULT_HIGHLIGHTS;
}
