export interface SongTrack {
  id: string;
  title: string;
  artist: string;
  albumCover: string;
  previewUrl: string; // 30-second audio preview clip
  genre?: string;
}

/**
 * Searches iTunes Music API for live 30-second audio preview clips
 */
export async function searchMusic(query: string): Promise<SongTrack[]> {
  if (!query.trim()) return TRENDING_SONGS;

  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(
        query.trim()
      )}&entity=song&limit=20`
    );

    if (!res.ok) throw new Error('Failed to fetch music');

    const data = await res.json();

    return (data.results || [])
      .map((item: any) => ({
        id: String(item.trackId || item.collectionId || Math.random()),
        title: item.trackName || item.collectionName || 'Untitled Track',
        artist: item.artistName || 'Unknown Artist',
        albumCover:
          item.artworkUrl100?.replace('100x100bb', '300x300bb') ||
          item.artworkUrl60 ||
          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300',
        previewUrl: item.previewUrl,
        genre: item.primaryGenreName,
      }))
      .filter((song: SongTrack) => Boolean(song.previewUrl));
  } catch (err) {
    console.error('iTunes Music search error:', err);
    return TRENDING_SONGS.filter(
      (s) =>
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.artist.toLowerCase().includes(query.toLowerCase())
    );
  }
}

/**
 * Permanent, high-quality audio preview streams that never expire or return 404
 */
export const TRENDING_SONGS: SongTrack[] = [
  {
    id: 'lofi-sunset-1',
    title: 'Aesthetic Lofi Chill',
    artist: 'ChillHop Beats',
    albumCover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300',
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    genre: 'Lo-Fi',
  },
  {
    id: 'pune-vibe-2',
    title: 'Monsoon Rain & Chill',
    artist: 'Ambient Soundscapes',
    albumCover: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=300',
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=rain-ambient-10255.mp3',
    genre: 'Ambient',
  },
  {
    id: 'golden-hour-3',
    title: 'Golden Sunset Vibes',
    artist: 'Acoustic Dreams',
    albumCover: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=300',
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=acoustic-guitar-sunset-14088.mp3',
    genre: 'Acoustic',
  },
  {
    id: 'night-drive-4',
    title: 'Midnight Synthwave Drive',
    artist: 'Retro Cyber Beats',
    albumCover: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300',
    previewUrl: 'https://cdn.pixabay.com/download/audio/2022/02/10/audio_b2f913d803.mp3?filename=synthwave-80s-11004.mp3',
    genre: 'Electronic',
  },
];
