'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Search, Play, Pause, X, Music, Upload, Link as LinkIcon, FileAudio } from 'lucide-react';
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

  const closePicker = () => {
    if (audioRef.current) audioRef.current.pause();
    onClose();
  };

  return (
    <div
      className="a-dialog"
      onKeyDown={(e) => {
        if (e.key === 'Escape') closePicker();
      }}
    >
      <audio
        ref={audioRef}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleModalTimeUpdate}
      />

      <div className="a-dialog__panel" role="dialog" aria-modal="true" aria-labelledby="song-picker-title">
        <div className="a-dialog__head">
          <h2 id="song-picker-title">Choose a song snippet</h2>
          <button type="button" onClick={closePicker} className="a-btn a-btn--icon" aria-label="Close song picker">
            <X size={16} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>

        <div className="a-tabs" role="tablist" aria-label="Song source">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'search'}
            onClick={() => setActiveTab('search')}
            className="a-tab"
          >
            <Music size={16} strokeWidth={1.5} aria-hidden="true" />
            Search the library
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'custom'}
            onClick={() => setActiveTab('custom')}
            className="a-tab"
          >
            <Upload size={16} strokeWidth={1.5} aria-hidden="true" />
            Your own MP3
          </button>
        </div>

        {activeTab === 'search' && (
          <div className="a-dialog__block">
            <label className="visually-hidden" htmlFor="song-search">Search songs</label>
            <span className="a-search">
              <Search size={16} strokeWidth={1.5} aria-hidden="true" />
              <input
                id="song-search"
                type="search"
                className="a-input"
                placeholder="Song, artist or genre, e.g. Kesariya, lofi"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </span>
            <p className="a-help">Pick a song, then set where its snippet starts and ends.</p>
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="a-dialog__block">
            <input
              type="file"
              ref={fileInputRef}
              accept="audio/*"
              hidden
              onChange={handleFileUpload}
            />
            <div>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="a-btn">
                <FileAudio size={16} strokeWidth={1.5} aria-hidden="true" />
                Choose an MP3 file
              </button>
            </div>
            <div className="a-row">
              <label className="visually-hidden" htmlFor="song-url">MP3 link</label>
              <input
                id="song-url"
                type="url"
                className="a-input"
                placeholder="Or paste a direct link to an MP3"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
              />
              <button type="button" onClick={handleLoadCustomUrl} className="a-btn">
                <LinkIcon size={16} strokeWidth={1.5} aria-hidden="true" />
                Load
              </button>
            </div>
          </div>
        )}

        {activeSong && (
          <div className="a-dialog__block">
            <div className="a-song" style={{ border: 0, padding: 0 }}>
              <div className="a-song__info">
                <span className="a-cover">
                  <Image src={activeSong.albumCover} alt="" fill sizes="48px" />
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    aria-label={isPlaying ? `Pause ${activeSong.title}` : `Play ${activeSong.title}`}
                  >
                    {isPlaying ? (
                      <Pause size={16} strokeWidth={1.5} aria-hidden="true" />
                    ) : (
                      <Play size={16} strokeWidth={1.5} aria-hidden="true" />
                    )}
                  </button>
                </span>
                <span className="a-cell-title">
                  <b>{activeSong.title}</b>
                  <span>{activeSong.artist}</span>
                </span>
              </div>

              <button
                type="button"
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
                className="a-btn a-btn--primary"
              >
                Use {endTime - startTime}s snippet
              </button>
            </div>

            <div className="a-presets">
              <span>Length</span>
              {[5, 10, 15, 30].map((dur) => (
                <button
                  type="button"
                  key={dur}
                  onClick={() => handleQuickPreset(dur)}
                  aria-pressed={endTime - startTime === dur}
                  className="a-btn a-btn--sm"
                >
                  {dur}s
                </button>
              ))}
            </div>

            <div className="a-ranges">
              <label className="a-range">
                <span className="a-range__top">
                  Start
                  <b>{formatTime(startTime)}</b>
                </span>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, trackDuration - 1)}
                  step="1"
                  value={startTime}
                  onChange={(e) => handleStartChange(Number(e.target.value))}
                />
              </label>
              <label className="a-range">
                <span className="a-range__top">
                  End
                  <b>{formatTime(endTime)}</b>
                </span>
                <input
                  type="range"
                  min="1"
                  max={trackDuration > 0 ? trackDuration : 30}
                  step="1"
                  value={endTime}
                  onChange={(e) => handleEndChange(Number(e.target.value))}
                />
              </label>
            </div>

            <p className="a-summary" aria-live="polite">
              Plays from {formatTime(startTime)} to {formatTime(endTime)}, {endTime - startTime} seconds, on a loop.
            </p>

            {activeSong.youtubeId && (
              <iframe
                className="a-embed"
                title={`YouTube preview of ${activeSong.title}`}
                src={`https://www.youtube.com/embed/${activeSong.youtubeId}?autoplay=1&start=${startTime}&end=${endTime}&enablejsapi=1`}
                allow="autoplay; encrypted-media; picture-in-picture"
              />
            )}
          </div>
        )}

        <div className="a-songs">
          {loading ? (
            <p className="a-help" role="status">Searching the library…</p>
          ) : songs.length > 0 ? (
            songs.map((song) => {
              const isCurrentActive = activeSong?.id === song.id;
              const isSelected = selectedSongId === song.id;

              return (
                <div
                  key={song.id}
                  onClick={() => handleSelectActiveSong(song)}
                  data-active={isCurrentActive}
                  className="a-songs__row"
                >
                  <div className="a-song__info">
                    <span className="a-cover">
                      <Image src={song.albumCover} alt="" fill sizes="40px" />
                      {isCurrentActive && isPlaying && (
                        <span aria-hidden="true">
                          <Pause size={14} strokeWidth={1.5} />
                        </span>
                      )}
                    </span>
                    <span className="a-cell-title">
                      <b>{song.title}</b>
                      <span>
                        {song.artist}
                        {isSelected ? ', in use' : ''}
                      </span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectActiveSong(song);
                    }}
                    aria-pressed={isCurrentActive}
                    className={`a-btn a-btn--sm${isCurrentActive ? ' a-btn--primary' : ''}`}
                  >
                    {isCurrentActive ? 'Selected' : 'Select'}
                  </button>
                </div>
              );
            })
          ) : (
            <p className="a-help">
              No songs match “{query}”. Try another artist or song name.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
