'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Search, Play, Pause, X, Music, Check, Sparkles, SlidersHorizontal, Volume2, Upload, Link, FileAudio } from 'lucide-react';
import { searchMusic, SongTrack, TRENDING_SONGS, extractYouTubeId } from '@/lib/music';

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
  const [activeTab, setActiveTab] = useState<'search' | 'custom'>('search');
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState<SongTrack[]>(TRENDING_SONGS);
  const [loading, setLoading] = useState(false);
  
  // Custom Track Form
  const [customTitle, setCustomTitle] = useState('');
  const [customArtist, setCustomArtist] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  
  const [activeSong, setActiveSong] = useState<SongTrack | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(15);
  const [trackDuration, setTrackDuration] = useState<number>(30);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* ---------------------------------------------
     Audio Track Metadata Loaded
  --------------------------------------------- */
  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      const dur = Math.floor(audioRef.current.duration);
      setTrackDuration(dur);
      if (endTime > dur || endTime === 15) setEndTime(Math.min(dur, startTime + 15));
    }
  };

  /* ---------------------------------------------
     Handle File Upload (.mp3, .m4a, .wav)
  --------------------------------------------- */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    const titleWithoutExt = file.name.replace(/\.[^/.]+$/, '');

    const newCustomTrack: SongTrack = {
      id: `custom-upload-${Date.now()}`,
      title: titleWithoutExt,
      artist: 'Custom Upload',
      albumCover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300',
      previewUrl: objectUrl,
      startTime: 0,
      endTime: 15,
    };

    setCustomTitle(titleWithoutExt);
    setCustomArtist('Custom Upload');
    setCustomUrl(objectUrl);
    handleSelectActiveSong(newCustomTrack);
  };

  /* ---------------------------------------------
     Handle Custom URL / YouTube Link Submit
  --------------------------------------------- */
  const handleLoadCustomUrl = () => {
    if (!customUrl.trim()) return;

    const ytId = extractYouTubeId(customUrl.trim());

    if (ytId) {
      const youtubeTrack: SongTrack = {
        id: `yt-${ytId}`,
        title: customTitle.trim() || `YouTube Track (${ytId})`,
        artist: customArtist.trim() || 'YouTube Music',
        albumCover: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        previewUrl: `https://www.youtube.com/embed/${ytId}?autoplay=1&enablejsapi=1`,
        youtubeId: ytId,
        startTime: 0,
        endTime: 15,
        duration: 300, // 5 minutes range for YouTube scrubber
      };

      setTrackDuration(300);
      handleSelectActiveSong(youtubeTrack);
      return;
    }

    const newCustomTrack: SongTrack = {
      id: `custom-url-${Date.now()}`,
      title: customTitle.trim() || 'Custom Full Song',
      artist: customArtist.trim() || 'Custom Artist',
      albumCover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300',
      previewUrl: customUrl.trim(),
      startTime: 0,
      endTime: 15,
    };

    handleSelectActiveSong(newCustomTrack);
  };

  /* ---------------------------------------------
     Loop Audio Preview between Start & End Points
  --------------------------------------------- */
  const handleModalTimeUpdate = () => {
    if (!audioRef.current) return;
    if (audioRef.current.currentTime >= endTime || audioRef.current.currentTime < startTime) {
      audioRef.current.currentTime = startTime;
    }
  };

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
     Audio Playback & Real-time Seeking
  --------------------------------------------- */
  const handleSelectActiveSong = (song: SongTrack) => {
    setActiveSong(song);
    const initialStart = song.startTime ?? 0;
    const initialEnd = song.endTime ?? (initialStart + 15);
    setStartTime(initialStart);
    setEndTime(initialEnd);

    if (song.youtubeId) {
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(true);
      return;
    }

    if (audioRef.current && song.previewUrl) {
      audioRef.current.pause();
      audioRef.current.src = song.previewUrl;
      audioRef.current.load();
      audioRef.current.currentTime = initialStart;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log('Audio play error:', err));
    }
  };

  const handleTogglePlay = () => {
    if (!activeSong) return;
    if (activeSong.youtubeId) {
      setIsPlaying((prev) => !prev);
      return;
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.currentTime = startTime;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log(err));
    }
  };

  const handleStartChange = (val: number) => {
    const newStart = Math.min(val, Math.max(0, endTime - 1));
    setStartTime(newStart);
    if (!activeSong?.youtubeId && audioRef.current && activeSong) {
      audioRef.current.currentTime = newStart;
      if (!isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  const handleEndChange = (val: number) => {
    const newEnd = Math.max(val, startTime + 1);
    setEndTime(newEnd);
    if (!activeSong?.youtubeId && audioRef.current && activeSong) {
      if (!isPlaying) {
        audioRef.current.currentTime = startTime;
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  const handleQuickPreset = (presetLength: number) => {
    const newEnd = Math.min(trackDuration, startTime + presetLength);
    setEndTime(newEnd);
    if (audioRef.current && activeSong) {
      audioRef.current.currentTime = startTime;
      if (!isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <audio
        ref={audioRef}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleModalTimeUpdate}
      />

      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* HEADER */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="text-rose-400" size={18} />
            <h3 className="font-semibold text-white text-base">
              Custom Song Start & End Selector
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

        {/* TAB SWITCHER */}
        <div className="flex border-b border-neutral-800 bg-neutral-950 text-xs">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-3 font-semibold transition border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'search'
                ? 'border-rose-500 text-white bg-rose-950/20'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Music size={14} /> Search Online Library
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-3 font-semibold transition border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'custom'
                ? 'border-rose-500 text-white bg-rose-950/20'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Upload size={14} /> Upload Custom Full Song (MP3)
          </button>
        </div>

        {/* TAB 1: SEARCH BAR */}
        {activeTab === 'search' && (
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
              Set exact custom Start Point & End Point for your story snippet
            </p>
          </div>
        )}

        {/* TAB 2: CUSTOM MP3 UPLOAD & URL */}
        {activeTab === 'custom' && (
          <div className="p-4 border-b border-neutral-800/80 bg-neutral-950 space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              accept="audio/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3 px-4 bg-rose-600/20 text-rose-300 border border-rose-600/40 rounded-xl text-xs font-semibold hover:bg-rose-600/30 transition flex items-center justify-center gap-2"
              >
                <FileAudio size={16} />
                Upload Full MP3 File
              </button>
            </div>

            <div className="relative flex items-center gap-2">
              <Link className="absolute left-3 text-neutral-500" size={14} />
              <input
                type="text"
                placeholder="Or paste direct Full Song MP3 link (e.g. https://.../fullsong.mp3)"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="w-full pl-8 pr-20 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-xs placeholder-neutral-500 focus:outline-none"
              />
              <button
                onClick={handleLoadCustomUrl}
                className="absolute right-1 px-3 py-1 bg-neutral-800 text-white rounded-lg text-xs font-medium hover:bg-neutral-700 transition"
              >
                Load
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE SONG INSTAGRAM DUAL SCRUBBER PANEL */}
        {activeSong && (
          <div className="p-4 bg-gradient-to-r from-rose-950/40 via-neutral-950 to-neutral-950 border-b border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-neutral-800 shadow-md">
                  <Image
                    src={activeSong.albumCover}
                    alt={activeSong.title}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={handleTogglePlay}
                    className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition"
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                </div>

                <div className="min-w-0">
                  <span className="text-[10px] uppercase tracking-widest text-rose-400 font-semibold flex items-center gap-1">
                    <SlidersHorizontal size={11} /> Custom Start & End Point
                  </span>
                  <h4 className="text-xs font-semibold text-white truncate">
                    {activeSong.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400 truncate">
                    {activeSong.artist}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (audioRef.current) audioRef.current.pause();
                  onSelectSong({
                    ...activeSong,
                    startTime,
                    endTime,
                    snippetDuration: endTime - startTime,
                    duration: trackDuration,
                  });
                  onClose();
                }}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-rose-500 transition shadow-lg shrink-0"
              >
                Use Snippet ({endTime - startTime}s)
              </button>
            </div>

            {/* PRESET QUICK LENGTH BUTTONS */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-[11px] text-neutral-400 font-mono">
                Quick Presets:
              </span>
              <div className="flex items-center gap-1.5">
                {[5, 10, 15, 30].map((dur) => (
                  <button
                    key={dur}
                    onClick={() => handleQuickPreset(dur)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold transition ${
                      endTime - startTime === dur
                        ? 'bg-rose-600 text-white'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    +{dur}s
                  </button>
                ))}
              </div>
            </div>

            {/* START & END DUAL RANGE SLIDERS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* START POINT CONTROL */}
              <div className="space-y-1 bg-neutral-900/90 p-2.5 rounded-xl border border-neutral-800">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-neutral-400">Start Point:</span>
                  <span className="text-emerald-400 font-bold">{formatTime(startTime)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, trackDuration - 1)}
                  step="1"
                  value={startTime}
                  onChange={(e) => handleStartChange(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-neutral-800 h-1.5 rounded cursor-pointer"
                />
              </div>

              {/* END POINT CONTROL */}
              <div className="space-y-1 bg-neutral-900/90 p-2.5 rounded-xl border border-neutral-800">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-neutral-400">End Point:</span>
                  <span className="text-rose-400 font-bold">{formatTime(endTime)}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={trackDuration > 0 ? trackDuration : 30}
                  step="1"
                  value={endTime}
                  onChange={(e) => handleEndChange(Number(e.target.value))}
                  className="w-full accent-rose-500 bg-neutral-800 h-1.5 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* LIVE SEGMENT SUMMARY */}
            <div className="flex justify-between items-center text-[11px] text-neutral-400 font-mono bg-neutral-950 p-2 rounded-lg border border-neutral-800/80">
              <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                <Volume2 size={12} /> Playing Snippet Loop:
              </span>
              <span className="text-white font-bold">
                {formatTime(startTime)} ➔ {formatTime(endTime)} ({endTime - startTime}s length)
              </span>
            </div>

            {/* YOUTUBE IFRAME PLAYER PREVIEW IF YOUTUBE LINK */}
            {activeSong.youtubeId && (
              <div className="relative w-full h-44 rounded-xl overflow-hidden border border-neutral-800 bg-black">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${activeSong.youtubeId}?autoplay=1&start=${startTime}&end=${endTime}&enablejsapi=1`}
                  allow="autoplay; encrypted-media; picture-in-picture"
                />
              </div>
            )}
          </div>
        )}

        {/* SONG LIST */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {loading ? (
            <div className="p-8 text-center text-xs text-neutral-500">
              Searching music library...
            </div>
          ) : songs.length > 0 ? (
            songs.map((song) => {
              const isCurrentActive = activeSong?.id === song.id;
              const isSelected = selectedSongId === song.id;

              return (
                <div
                  key={song.id}
                  onClick={() => handleSelectActiveSong(song)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                    isCurrentActive
                      ? 'bg-rose-950/40 border-rose-600/80 ring-1 ring-rose-600/40'
                      : isSelected
                      ? 'bg-neutral-800/80 border-neutral-700'
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
                      <div className="absolute inset-0 bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition">
                        {isCurrentActive && isPlaying ? (
                          <Pause size={14} />
                        ) : (
                          <Play size={14} />
                        )}
                      </div>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectActiveSong(song);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        isCurrentActive
                          ? 'bg-rose-600 text-white'
                          : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
                      }`}
                    >
                      {isCurrentActive ? 'Scrub Song' : 'Select'}
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

