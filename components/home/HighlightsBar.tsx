'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Music } from 'lucide-react';
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
    <section className="darkroom stories" aria-labelledby="stories-title">
      <div className="container stories__head">
        <h2 id="stories-title">Stories, with music</h2>
        <p className="stories__line">Tap a story to play it with its song.</p>
      </div>

      <div className="container">
        <ul className="stories__rail" aria-label="Story highlights" tabIndex={0}>
          {highlights.map((highlight, index) => (
            <li key={highlight.id}>
              <button
                type="button"
                onClick={() => setActiveHighlightIndex(index)}
                className="story"
                aria-label={`Play story: ${highlight.title}`}
              >
                <span className="story__frame">
                  <Image
                    src={getOptimizedImageUrl(highlight.coverImage, { width: 640, quality: 70 })}
                    alt=""
                    fill
                    className="story__img"
                    sizes="(max-width: 40rem) 70vw, 22vw"
                  />
                </span>
                <span className="story__caption">
                  <span className="story__title">{highlight.title}</span>
                  <Music size={16} strokeWidth={1.5} aria-hidden="true" className="story__icon" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

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
