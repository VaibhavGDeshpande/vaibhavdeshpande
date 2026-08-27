'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Music, Sparkles } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/image';
import { DEFAULT_HIGHLIGHTS, getStoredHighlights, Highlight } from '@/lib/highlightsData';
import StoryViewerModal from './StoryViewerModal';

export default function HighlightsBar() {
  const [highlights, setHighlights] = useState<Highlight[]>(DEFAULT_HIGHLIGHTS);
  const [activeHighlightIndex, setActiveHighlightIndex] = useState<number | null>(null);

  useEffect(() => {
    setHighlights(getStoredHighlights());
  }, []);

  return (
    <section className="relative z-20 py-10 border-b border-white/10 bg-neutral-950/80 backdrop-blur-md">
      <div className="section-wrap">
        {/* SECTION TITLE & BADGE */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <h3 className="text-xs uppercase tracking-[0.24em] font-medium text-stone-300">
              Stories & Music Highlights
            </h3>
          </div>
          <span className="text-[11px] text-stone-500 uppercase tracking-widest hidden sm:inline">
            Tap to play story & audio
          </span>
        </div>

        {/* HIGHLIGHTS HORIZONTAL SCROLL ROW */}
        <div className="flex items-center gap-6 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth">
          {highlights.map((highlight, index) => {
            return (
              <button
                key={highlight.id}
                onClick={() => setActiveHighlightIndex(index)}
                className="group flex flex-col items-center gap-2 shrink-0 focus:outline-none"
              >
                {/* CIRCULAR AVATAR WITH GRADIENT STORY RING */}
                <div className="relative p-[3px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-rose-950/20">
                  <div className="p-0.5 bg-neutral-950 rounded-full">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden">
                      <Image
                        src={getOptimizedImageUrl(highlight.coverImage, { width: 160, quality: 60 })}
                        alt={highlight.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="80px"
                      />
                    </div>
                  </div>

                  {/* MUSIC BADGE OVERLAY */}
                  <div className="absolute -bottom-0.5 -right-0.5 bg-rose-600 text-white p-1 rounded-full border-2 border-neutral-950 shadow">
                    <Music size={10} />
                  </div>
                </div>

                {/* HIGHLIGHT TITLE */}
                <span className="text-[11px] sm:text-xs text-stone-300 group-hover:text-white transition font-medium tracking-wide max-w-[80px] sm:max-w-[90px] truncate text-center">
                  {highlight.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STORY VIEWER MODAL */}
      {activeHighlightIndex !== null && (
        <StoryViewerModal
          highlights={highlights}
          initialHighlightIndex={activeHighlightIndex}
          onClose={() => setActiveHighlightIndex(null)}
        />
      )}
    </section>
  );
}
