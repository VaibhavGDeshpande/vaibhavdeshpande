'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Search, Play, Pause, X, Music, Check, Sparkles } from 'lucide-react';
import { searchMusic, SongTrack, TRENDING_SONGS } from '@/lib/music';

interface MusicPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSong: (song: SongTrack) => void;
  selectedSongId?: string;
}

export default function MusicPickerModal({
  isOpen,
  onClose,
  onSelectSong,
  selectedSongId,
}: MusicPickerModalProps) {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState<SongTrack[]>(TRENDING_SONGS);
  const [loading, setLoading] = useState(false);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  /* ---------------------------------------------
     Debounced Music Search
  --------------------------------------------- */
  useEffect(() => {
    if (!query.trim()) {
      setSongs(TRENDING_SONGS);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      const results = await searchMusic(query);
      setSongs(results);
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  /* ---------------------------------------------
     Audio Preview Toggle
  --------------------------------------------- */
  const togglePlayPreview = (song: SongTrack) => {
    if (playingSongId === song.id) {
      if (audioRef.current) audioRef.current.pause();
      setPlayingSongId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = song.previewUrl;
        audioRef.current.play().catch((err) => console.log('Preview error:', err));
        setPlayingSongId(song.id);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <audio ref={audioRef} />

      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* HEADER */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="text-rose-400" size={18} />
            <h3 className="font-semibold text-white text-base">
              Instagram Music Search
            </h3>
          </div>
          <button
            onClick={() => {
              if (audioRef.current) audioRef.current.pause();
              onClose();
            }}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="p-4 border-b border-neutral-800/80 bg-neutral-950">
          <div className="relative flex items-center">
            <Search className="absolute left-3 text-neutral-500" size={16} />
            <input
              type="text"
              placeholder="Search any song, artist, or genre (e.g. Kesariya, Blinding Lights, Lofi)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-rose-500/50 transition"
            />
          </div>
          <p className="mt-2 text-[11px] text-neutral-500 flex items-center gap-1">
            <Sparkles size={11} className="text-amber-400" />
            Access millions of 30-second iTunes audio preview clips
          </p>
        </div>

        {/* SONG LIST */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {loading ? (
            <div className="p-8 text-center text-xs text-neutral-500">
              Searching music library...
            </div>
          ) : songs.length > 0 ? (
            songs.map((song) => {
              const isSelected = selectedSongId === song.id;
              const isPlaying = playingSongId === song.id;

              return (
                <div
                  key={song.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition ${
                    isSelected
                      ? 'bg-rose-950/30 border-rose-800/60'
                      : 'bg-neutral-950/60 border-neutral-800/80 hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-neutral-800">
                      <Image
                        src={song.albumCover}
                        alt={song.title}
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={() => togglePlayPreview(song)}
                        className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition"
                      >
                        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-medium text-white truncate">
                        {song.title}
                      </h4>
                      <p className="text-[11px] text-neutral-400 truncate">
                        {song.artist}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        if (audioRef.current) audioRef.current.pause();
                        onSelectSong(song);
                        onClose();
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        isSelected
                          ? 'bg-rose-600 text-white'
                          : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
                      }`}
                    >
                      {isSelected ? (
                        <span className="flex items-center gap-1">
                          <Check size={12} /> Selected
                        </span>
                      ) : (
                        'Use Song'
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-neutral-500">
              No songs found matching &quot;{query}&quot;. Try searching another artist or song name.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
