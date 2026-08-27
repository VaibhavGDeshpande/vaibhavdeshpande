'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  X,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Music2,
  MapPin,
} from 'lucide-react';
import type { Highlight } from '@/lib/highlightsData';
import { TRENDING_SONGS } from '@/lib/music';

interface StoryViewerModalProps {
  highlights: Highlight[];
  initialHighlightIndex: number;
  onClose: () => void;
}

export default function StoryViewerModal({
  highlights,
  initialHighlightIndex,
  onClose,
}: StoryViewerModalProps) {
  const [highlightIndex, setHighlightIndex] = useState(initialHighlightIndex);
  const [slideIndex, setSlideIndex] = useState(0);

  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentHighlight = highlights[highlightIndex];
  const currentSlide = currentHighlight?.slides[slideIndex];
  const totalSlides = currentHighlight?.slides.length || 0;

  const SLIDE_DURATION_MS = 5000; // 5 seconds per slide
  const PROGRESS_INTERVAL_MS = 50;

  /* ---------------------------------------------
     Navigation Handlers
  --------------------------------------------- */
  const goToNextSlide = useCallback(() => {
    setProgress(0);
    if (slideIndex < totalSlides - 1) {
      setSlideIndex((prev) => prev + 1);
    } else if (highlightIndex < highlights.length - 1) {
      setHighlightIndex((prev) => prev + 1);
      setSlideIndex(0);
    } else {
      onClose();
    }
  }, [slideIndex, totalSlides, highlightIndex, highlights.length, onClose]);

  const goToPrevSlide = useCallback(() => {
    setProgress(0);
    if (slideIndex > 0) {
      setSlideIndex((prev) => prev - 1);
    } else if (highlightIndex > 0) {
      const prevHighlight = highlights[highlightIndex - 1];
      setHighlightIndex((prev) => prev - 1);
      setSlideIndex(prevHighlight.slides.length - 1);
    } else {
      setSlideIndex(0);
    }
  }, [slideIndex, highlightIndex, highlights]);

  /* ---------------------------------------------
     Progress Timer Loop
  --------------------------------------------- */
  useEffect(() => {
    if (isPaused || isHolding) {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      return;
    }

    const step = (PROGRESS_INTERVAL_MS / SLIDE_DURATION_MS) * 100;

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goToNextSlide();
          return 0;
        }
        return prev + step;
      });
    }, PROGRESS_INTERVAL_MS);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isPaused, isHolding, goToNextSlide]);

  const [needsUserTapForAudio, setNeedsUserTapForAudio] = useState(false);

  /* ---------------------------------------------
     Direct User Tap to Play Audio
  --------------------------------------------- */
  const playAudioWithUserGesture = useCallback(() => {
    if (!audioRef.current || !currentHighlight?.song?.previewUrl) return;

    const audio = audioRef.current;
    audio.muted = false;
    setIsMuted(false);

    if (typeof currentHighlight.song.startTime === 'number' && audio.currentTime < currentHighlight.song.startTime) {
      audio.currentTime = currentHighlight.song.startTime;
    }

    audio
      .play()
      .then(() => {
        setIsPlayingAudio(true);
        setNeedsUserTapForAudio(false);
      })
      .catch((err) => {
        console.log('Audio play error:', err);
      });
  }, [currentHighlight?.song?.previewUrl, currentHighlight?.song?.startTime]);

  /* ---------------------------------------------
     Audio Control
  --------------------------------------------- */
  useEffect(() => {
    if (!audioRef.current || !currentHighlight?.song?.previewUrl) return;

    const audio = audioRef.current;
    audio.src = currentHighlight.song.previewUrl;
    audio.load();
    audio.muted = isMuted;

    if (typeof currentHighlight.song.startTime === 'number') {
      audio.currentTime = currentHighlight.song.startTime;
    }

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlayingAudio(true);
          setNeedsUserTapForAudio(false);
        })
        .catch((err) => {
          console.log('Autoplay blocked by browser. User tap required for audio.', err);
          setIsPlayingAudio(false);
          setNeedsUserTapForAudio(true);
        });
    }

    return () => {
      audio.pause();
    };
  }, [highlightIndex, currentHighlight?.song?.previewUrl, isMuted]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPaused || isHolding) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else if (!needsUserTapForAudio) {
      audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => {});
    }
  }, [isPaused, isHolding, needsUserTapForAudio]);

  /* ---------------------------------------------
     Keyboard Listeners
  --------------------------------------------- */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNextSlide();
      if (e.key === 'ArrowLeft') goToPrevSlide();
      if (e.key === ' ') setIsPaused((p) => !p);
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextSlide, goToPrevSlide, onClose]);

  const handleTimeUpdate = () => {
    if (!audioRef.current || !currentHighlight?.song) return;
    const startTime = currentHighlight.song.startTime || 0;
    const endTime = currentHighlight.song.endTime || (startTime + (currentHighlight.song.snippetDuration || 15));

    if (audioRef.current.currentTime >= endTime || audioRef.current.currentTime < startTime) {
      audioRef.current.currentTime = startTime;
    }
  };

  if (!currentHighlight || !currentSlide) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-xl transition-all">
      {currentHighlight.song?.youtubeId ? (
        <iframe
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
          src={`https://www.youtube.com/embed/${currentHighlight.song.youtubeId}?autoplay=1&loop=1&playlist=${currentHighlight.song.youtubeId}&start=${currentHighlight.song.startTime || 0}&end=${currentHighlight.song.endTime || (currentHighlight.song.startTime || 0) + 15}&enablejsapi=1`}
          allow="autoplay"
        />
      ) : (
        <audio
          ref={audioRef}
          loop
          onTimeUpdate={handleTimeUpdate}
          onError={() => {
            console.warn('Audio URL 404/Error. Falling back to working audio stream.');
            if (audioRef.current && TRENDING_SONGS[0]?.previewUrl) {
              audioRef.current.src = TRENDING_SONGS[0].previewUrl;
              audioRef.current.load();
              audioRef.current.play().catch(() => {});
            }
          }}
        />
      )}

      {/* BACKGROUND CLOSE TAP AREA */}
      <div className="absolute inset-0 z-0" onClick={onClose} />

      {/* HIGHLIGHT STORY CONTAINER */}
      <div
        className="relative z-10 w-full max-w-sm sm:max-w-md h-[90vh] sm:h-[86vh] rounded-3xl overflow-hidden bg-neutral-950 border border-white/15 shadow-2xl flex flex-col justify-between select-none"
        onMouseDown={() => setIsHolding(true)}
        onMouseUp={() => setIsHolding(false)}
        onTouchStart={() => setIsHolding(true)}
        onTouchEnd={() => setIsHolding(false)}
      >
        {/* STORY PHOTO */}
        <div className="absolute inset-0 z-0 bg-neutral-900">
          <Image
            key={currentSlide.id}
            src={currentSlide.imageUrl}
            alt={currentSlide.title}
            fill
            priority
            className="object-cover transition-transform duration-700 scale-100"
            sizes="(max-width: 640px) 100vw, 450px"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/85" />
        </div>

        {/* TOP CONTROLS & PROGRESS BARS */}
        <div
          className={`relative z-20 p-4 space-y-3 transition-opacity duration-200 ${
            isHolding ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {/* SEGMENTED PROGRESS BARS */}
          <div className="flex gap-1.5 w-full">
            {currentHighlight.slides.map((slide, i) => {
              let widthPercent = 0;
              if (i < slideIndex) widthPercent = 100;
              else if (i === slideIndex) widthPercent = progress;

              return (
                <div
                  key={slide.id}
                  className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
                >
                  <div
                    className="h-full bg-white transition-all duration-75 ease-linear"
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* STORY HEADER: AVATAR + TITLE + MUSIC + CLOSE BUTTON */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/40 shadow">
                <Image
                  src={currentHighlight.coverImage}
                  alt={currentHighlight.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white tracking-wide drop-shadow">
                  {currentHighlight.title}
                </h4>
                <p className="text-[10px] text-stone-300 drop-shadow">
                  {currentSlide.date || 'Story Highlight'}
                </p>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isMuted || needsUserTapForAudio) {
                    playAudioWithUserGesture();
                  } else {
                    setIsMuted(true);
                  }
                }}
                className="p-2 rounded-full bg-rose-600/30 border border-rose-500/40 text-white hover:bg-rose-600/50 transition flex items-center gap-1 text-xs"
              >
                {isMuted || needsUserTapForAudio ? (
                  <>
                    <VolumeX size={15} className="text-rose-400" />
                    <span className="text-[10px] font-semibold text-rose-300 pr-1">Tap for Music 🎵</span>
                  </>
                ) : (
                  <Volume2 size={15} className="text-emerald-400" />
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaused((p) => !p);
                }}
                className="p-2 rounded-full bg-black/40 border border-white/20 text-white hover:bg-black/60 transition"
              >
                {isPaused ? <Play size={15} /> : <Pause size={15} />}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-2 rounded-full bg-black/40 border border-white/20 text-white hover:bg-black/60 transition"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* INSTAGRAM SONG TRACK PILL */}
          {currentHighlight.song && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                playAudioWithUserGesture();
              }}
              className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 border border-white/20 text-white text-xs backdrop-blur-md shadow-lg max-w-[85%] truncate hover:bg-black/70 transition"
            >
              {/* Spinning Vinyl / Audio Icon */}
              <div className="relative w-4 h-4 shrink-0 flex items-center justify-center">
                <Music2
                  size={13}
                  className={`text-rose-400 ${
                    isPlayingAudio && !isPaused ? 'animate-spin' : ''
                  }`}
                />
              </div>

              <span className="truncate text-[11px] font-medium tracking-wide">
                <span className="text-stone-200">
                  {currentHighlight.song.title}
                </span>
                <span className="text-stone-400 font-normal">
                  {' '}
                  • {currentHighlight.song.artist}
                </span>
              </span>

              {/* Animated Equalizer Wave Bars */}
              {isPlayingAudio && !isPaused && !isMuted && (
                <div className="flex items-end gap-0.5 h-3 ml-auto shrink-0">
                  <span className="w-0.5 bg-rose-400 rounded-full animate-[bounce_0.6s_infinite_100ms] h-full" />
                  <span className="w-0.5 bg-amber-400 rounded-full animate-[bounce_0.6s_infinite_200ms] h-2/3" />
                  <span className="w-0.5 bg-purple-400 rounded-full animate-[bounce_0.6s_infinite_300ms] h-full" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* TAP NAVIGATION ZONES (LEFT / RIGHT) */}
        <div className="absolute inset-y-0 inset-x-0 z-10 flex">
          <div
            className="w-1/3 h-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              goToPrevSlide();
            }}
          />
          <div
            className="w-2/3 h-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              goToNextSlide();
            }}
          />
        </div>

        {/* BOTTOM CAPTION & LOCATION TAG */}
        <div
          className={`relative z-20 p-5 space-y-2.5 transition-opacity duration-200 ${
            isHolding ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {currentSlide.location && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-stone-200 text-xs backdrop-blur-md">
              <MapPin size={12} className="text-rose-400" />
              <span>{currentSlide.location}</span>
            </div>
          )}

          {currentSlide.caption && (
            <div className="bg-black/60 border border-white/15 p-3.5 rounded-2xl backdrop-blur-md">
              <p className="text-xs text-stone-100 font-medium leading-relaxed">
                {currentSlide.caption}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* EXTERNAL DESKTOP PREV / NEXT CHEVRONS */}
      {highlightIndex > 0 || slideIndex > 0 ? (
        <button
          onClick={goToPrevSlide}
          className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition"
        >
          <ChevronLeft size={24} />
        </button>
      ) : null}

      <button
        onClick={goToNextSlide}
        className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
