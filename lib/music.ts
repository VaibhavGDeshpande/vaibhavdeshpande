export interface SongTrack {
  id: string;
  title: string;
  artist: string;
  albumCover: string;
  previewUrl: string; // 30-second audio preview clip
  genre?: string;
}

/**
 * Searches iTunes Music API for 30-second audio preview clips
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

    return (data.results || []).map((item: any) => ({
      id: String(item.trackId || item.collectionId || Math.random()),
      title: item.trackName || item.collectionName || 'Untitled Track',
      artist: item.artistName || 'Unknown Artist',
      albumCover:
        item.artworkUrl100?.replace('100x100bb', '300x300bb') ||
        item.artworkUrl60 ||
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300',
      previewUrl: item.previewUrl,
      genre: item.primaryGenreName,
    })).filter((song: SongTrack) => Boolean(song.previewUrl));
  } catch (err) {
    console.error('iTunes Music search error:', err);
    return TRENDING_SONGS.filter((s) =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.artist.toLowerCase().includes(query.toLowerCase())
    );
  }
}

/**
 * Pre-curated trending Reels & aesthetic audio previews
 */
export const TRENDING_SONGS: SongTrack[] = [
  {
    id: 'lofi-sunset-1',
    title: 'Aesthetic Lofi Chill',
    artist: 'ChillHop Beats',
    albumCover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/91/9f/8e/919f8e21-0678-831f-0e42-70b93d9a174f/mzaf_13337953258524458380.plus.aac.p.m4a',
    genre: 'Lo-Fi',
  },
  {
    id: 'pune-vibe-2',
    title: 'Monsoon Rain & Chill',
    artist: 'Ambient Soundscapes',
    albumCover: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=300',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/2e/8b/44/2e8b449b-734f-0158-b3d4-b97c2a7e7bfb/mzaf_17208889240409861614.plus.aac.p.m4a',
    genre: 'Ambient',
  },
  {
    id: 'golden-hour-3',
    title: 'Golden Sunset Vibes',
    artist: 'Acoustic Dreams',
    albumCover: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=300',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/c6/3f/14/c63f1489-0820-2565-38b4-55e1c4df68f0/mzaf_16422896585141014522.plus.aac.p.m4a',
    genre: 'Acoustic',
  },
  {
    id: 'night-drive-4',
    title: 'Midnight Synthwave Drive',
    artist: 'Retro Cyber Beats',
    albumCover: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/58/01/a5/5801a52e-60f2-51ab-85b5-12d8a0c25a07/mzaf_16972051649984920653.plus.aac.p.m4a',
    genre: 'Electronic',
  },
];
