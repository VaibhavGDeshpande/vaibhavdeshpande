'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, CheckCircle2, AlertCircle, Check, Eye } from 'lucide-react';
import supabase from '@/lib/supabase';
import { useUser } from '@/lib/useUser';
import type { Photo } from '@/lib/data';
import { getOptimizedImageUrl } from '@/lib/image';
import {
  Highlight,
  StorySlide,
  getStoredHighlights,
  saveStoredHighlight,
  deleteStoredHighlight,
} from '@/lib/highlightsData';
import { SongTrack, TRENDING_SONGS } from '@/lib/music';
import MusicPickerModal from './MusicPickerModal';
import StoryViewerModal from '../home/StoryViewerModal';

export default function HighlightManager() {
  const user = useUser();

  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [photoSearch, setPhotoSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [selectedSong, setSelectedSong] = useState<SongTrack>(TRENDING_SONGS[0]);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [slideDetails, setSlideDetails] = useState<Record<string, { caption: string; location: string; date: string }>>({});

  // Modals State
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [previewHighlight, setPreviewHighlight] = useState<Highlight | null>(null);

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /* ---------------------------------------------
     Fetch Photos & Stored Highlights
  --------------------------------------------- */
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load highlights
        const loadedHighlights = getStoredHighlights();
        setHighlights(loadedHighlights);

        // Load DB photos
        const { data, error } = await supabase
          .from('photos')
          .select('*');

        if (!error && data) {
          const STORAGE_BASE_URL =
            process.env.NEXT_PUBLIC_SUPABASE_URL +
            '/storage/v1/object/public/photos/';

          const formattedPhotos: Photo[] = data.map((row) => ({
            id: row.id,
            title: row.title || 'Untitled',
            category: row.category,
            image_url: row.image_url.startsWith('http')
              ? row.image_url
              : `${STORAGE_BASE_URL}${row.image_url}`,
            width: row.width,
            height: row.height,
            aspect_ratio: row.aspect_ratio,
            orientation: row.orientation,
          }));

          setPhotos(formattedPhotos);
        }
      } catch (err) {
        console.error('Failed to load photos:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (!user) {
    return (
      <div className="a-wait">
        Sign in to manage highlights.
      </div>
    );
  }

  /* ---------------------------------------------
     Construct Highlight Object from Current Form
  --------------------------------------------- */
  const buildCurrentHighlight = (): Highlight => {
    const selectedPhotosList = photos.filter((p) => selectedPhotoIds.includes(p.id));

    const slides: StorySlide[] = selectedPhotosList.map((photo) => {
      const details = slideDetails[photo.id] || {};
      return {
        id: `slide-${photo.id}`,
        imageUrl: photo.image_url,
        title: photo.title,
        caption: details.caption || photo.title,
        location: details.location || 'Photography portfolio',
        date: details.date || 'Recent',
      };
    });

    const finalCover = coverImage || selectedPhotosList[0]?.image_url || photos[0]?.image_url || '';

    return {
      id: editingId || `highlight-${Date.now()}`,
      title: title.trim() || 'Custom Story',
      coverImage: finalCover,
      isUnseen: true,
      song: selectedSong,
      slides: slides.length > 0 ? slides : [
        {
          id: 'slide-fallback',
          imageUrl: finalCover,
          title: title || 'Story Slide',
          caption: 'Photography story highlight',
          location: 'Pune, India',
        }
      ],
    };
  };

  /* ---------------------------------------------
     Actions
  --------------------------------------------- */
  const handleOpenCreateForm = () => {
    setIsEditing(true);
    setEditingId(null);
    setTitle('');
    setCoverImage(photos[0]?.image_url || '');
    setSelectedSong(TRENDING_SONGS[0]);
    setSelectedPhotoIds(photos.slice(0, 3).map((p) => p.id));
    setSlideDetails({});
    setStatusMessage(null);
  };

  const handleEditHighlight = (highlight: Highlight) => {
    setIsEditing(true);
    setEditingId(highlight.id);
    setTitle(highlight.title);
    setCoverImage(highlight.coverImage);
    if (highlight.song) setSelectedSong(highlight.song);

    // Map slides back to photo IDs if possible
    const photoIds = highlight.slides
      .map((slide) => {
        const found = photos.find((p) => p.image_url === slide.imageUrl);
        return found?.id;
      })
      .filter(Boolean) as string[];

    setSelectedPhotoIds(photoIds.length > 0 ? photoIds : photos.slice(0, 3).map((p) => p.id));
    setStatusMessage(null);
  };

  const handleDeleteHighlight = async (id: string) => {
    const confirm = window.confirm('Delete this highlight from the website?');
    if (!confirm) return;

    const updated = deleteStoredHighlight(id);
    setHighlights(updated);

    try {
      await fetch('/api/revalidate', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePhotoSelection = (photoId: string) => {
    setSelectedPhotoIds((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId]
    );
  };

  const handleSaveHighlight = async () => {
    if (!title.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a highlight title.' });
      return;
    }
    if (selectedPhotoIds.length === 0) {
      setStatusMessage({ type: 'error', text: 'Please select at least one photo for your story slides.' });
      return;
    }

    const highlightToSave = buildCurrentHighlight();
    const updated = saveStoredHighlight(highlightToSave);
    setHighlights(updated);

    // Trigger cache revalidation
    try {
      await fetch('/api/revalidate', { method: 'POST' });
    } catch (e) {
      console.error('Revalidation error:', e);
    }

    setStatusMessage({
      type: 'success',
      text: `Published “${highlightToSave.title}” to the home page.`,
    });

    setIsEditing(false);
  };

  const formatSnippet = (song: SongTrack) => {
    if (typeof song.startTime !== 'number') return null;
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const end = song.endTime ?? song.startTime + 15;
    return `0:${pad(song.startTime)} to 0:${pad(end)}`;
  };

  const slideCategories = Array.from(new Set(photos.map((p) => p.category).filter(Boolean)));
  const slidePhotos = photos.filter((photo) => {
    const matchesCategory = selectedCategory === 'All' || photo.category === selectedCategory;
    const matchesSearch = !photoSearch || photo.title.toLowerCase().includes(photoSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="a-page" aria-labelledby="highlights-title">
      <header className="a-head">
        <div>
          <h1 id="highlights-title">Highlights</h1>
          <p>Stories with music, shown under the hero on the home page.</p>
        </div>
        {!isEditing && (
          <button type="button" onClick={handleOpenCreateForm} className="a-btn a-btn--primary">
            <Plus size={16} strokeWidth={1.5} aria-hidden="true" />
            New highlight
          </button>
        )}
      </header>

      {statusMessage && (
        <div role="status" className={`a-status a-status--${statusMessage.type}`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 size={16} strokeWidth={1.5} aria-hidden="true" />
          ) : (
            <AlertCircle size={16} strokeWidth={1.5} aria-hidden="true" />
          )}
          <span className="a-status__text">{statusMessage.text}</span>
        </div>
      )}

      {/* EDITOR */}
      {isEditing && (
        <div className="a-editor" aria-labelledby="editor-title">
          <div className="a-editor__head">
            <h2 id="editor-title">{editingId ? 'Edit highlight' : 'New highlight'}</h2>
            <button type="button" onClick={() => setIsEditing(false)} className="a-btn a-btn--sm">
              Cancel
            </button>
          </div>

          <div className="a-split">
            <div className="a-stack">
              <label className="a-field">
                <span className="a-label">Title</span>
                <input
                  type="text"
                  className="a-input"
                  placeholder="e.g. Pune vibes, Golden hour"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>

              <div className="a-field">
                <span className="a-label">Music</span>
                <div className="a-song">
                  <div className="a-song__info">
                    <span className="a-thumb">
                      <Image src={selectedSong.albumCover} alt="" fill sizes="44px" />
                    </span>
                    <span className="a-cell-title">
                      <b>{selectedSong.title}</b>
                      <span>
                        {selectedSong.artist}
                        {formatSnippet(selectedSong) ? `, ${formatSnippet(selectedSong)}` : ''}
                      </span>
                    </span>
                  </div>
                  <button type="button" onClick={() => setIsMusicModalOpen(true)} className="a-btn a-btn--sm">
                    Choose song
                  </button>
                </div>
              </div>

              <div className="a-field">
                <span className="a-label" id="cover-label">Cover photo</span>
                <div className="a-picker" role="group" aria-labelledby="cover-label">
                  {photos.map((photo) => (
                    <button
                      type="button"
                      key={`cover-${photo.id}`}
                      onClick={() => setCoverImage(photo.image_url)}
                      aria-pressed={coverImage === photo.image_url}
                      aria-label={`Use ${photo.title} as the cover`}
                      className="a-pick"
                    >
                      <Image
                        src={getOptimizedImageUrl(photo.image_url, { width: 150, quality: 60 })}
                        alt=""
                        fill
                        sizes="80px"
                      />
                      {coverImage === photo.image_url && (
                        <span className="a-pick__check" aria-hidden="true">
                          <Check size={14} strokeWidth={2} />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="a-stack">
              <div className="a-section__head" style={{ marginBottom: 0 }}>
                <span className="a-label" id="slides-label">Story slides</span>
                <span className="a-help">{selectedPhotoIds.length} selected</span>
              </div>

              <div className="a-row">
                <label className="visually-hidden" htmlFor="slide-search">Search photos</label>
                <input
                  id="slide-search"
                  type="search"
                  className="a-input"
                  placeholder="Search photos"
                  value={photoSearch}
                  onChange={(e) => setPhotoSearch(e.target.value)}
                />
                <label className="visually-hidden" htmlFor="slide-collection">Collection</label>
                <select
                  id="slide-collection"
                  className="a-input"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="All">All collections</option>
                  {slideCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="a-picker a-picker--slides" role="group" aria-labelledby="slides-label">
                {slidePhotos.map((photo) => {
                  const isSelected = selectedPhotoIds.includes(photo.id);
                  return (
                    <button
                      type="button"
                      key={`slide-${photo.id}`}
                      onClick={() => handleTogglePhotoSelection(photo.id)}
                      aria-pressed={isSelected}
                      className="a-pick"
                    >
                      <Image
                        src={getOptimizedImageUrl(photo.image_url, { width: 250, quality: 60 })}
                        alt=""
                        fill
                        sizes="150px"
                      />
                      <span className="a-pick__name">{photo.title}</span>
                      {isSelected && (
                        <span className="a-pick__check" aria-hidden="true">
                          <Check size={14} strokeWidth={2} />
                        </span>
                      )}
                    </button>
                  );
                })}
                {!slidePhotos.length && <p className="a-help">No photographs match this search.</p>}
              </div>
            </div>
          </div>

          {selectedPhotoIds.length > 0 && (
            <div className="a-section">
              <h3 className="a-label">Captions and places</h3>
              <div className="a-slides" style={{ marginTop: 'var(--space-sm)' }}>
                {photos
                  .filter((p) => selectedPhotoIds.includes(p.id))
                  .map((photo) => {
                    const detail = slideDetails[photo.id] || { caption: photo.title, location: 'Pune, India', date: 'Recent' };
                    return (
                      <div key={`detail-${photo.id}`} className="a-slide">
                        <span className="a-thumb">
                          <Image
                            src={getOptimizedImageUrl(photo.image_url, { width: 200, quality: 60 })}
                            alt=""
                            fill
                            sizes="56px"
                          />
                        </span>
                        <div className="a-stack">
                          <input
                            type="text"
                            className="a-input"
                            aria-label={`Caption for ${photo.title}`}
                            placeholder="Caption"
                            value={detail.caption}
                            onChange={(e) =>
                              setSlideDetails((prev) => ({
                                ...prev,
                                [photo.id]: { ...detail, caption: e.target.value },
                              }))
                            }
                          />
                          <input
                            type="text"
                            className="a-input"
                            aria-label={`Place for ${photo.title}`}
                            placeholder="Place, e.g. Pune, India"
                            value={detail.location}
                            onChange={(e) =>
                              setSlideDetails((prev) => ({
                                ...prev,
                                [photo.id]: { ...detail, location: e.target.value },
                              }))
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          <div className="a-editor__foot">
            <button type="button" onClick={() => setPreviewHighlight(buildCurrentHighlight())} className="a-btn">
              <Eye size={16} strokeWidth={1.5} aria-hidden="true" />
              Preview story
            </button>
            <button type="button" onClick={handleSaveHighlight} className="a-btn a-btn--primary">
              Publish highlight
            </button>
          </div>
        </div>
      )}

      {/* ON THE HOME PAGE NOW */}
      <section aria-labelledby="live-title">
        <div className="a-section__head">
          <h2 id="live-title">On the home page</h2>
          <span className="a-help">{highlights.length} highlights</span>
        </div>

        {loading ? (
          <p className="a-help" role="status">Loading highlights…</p>
        ) : highlights.length ? (
          <table className="a-table a-table--stack">
            <thead>
              <tr>
                <th scope="col">Highlight</th>
                <th scope="col">Song</th>
                <th scope="col" className="a-num">Slides</th>
                <th scope="col" className="a-actions">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {highlights.map((highlight) => (
                <tr key={highlight.id} data-active={editingId === highlight.id && isEditing}>
                  <td>
                    <div className="a-cell-photo">
                      <span className="a-thumb a-thumb--sq">
                        <Image
                          src={getOptimizedImageUrl(highlight.coverImage, { width: 150, quality: 60 })}
                          alt=""
                          fill
                          sizes="48px"
                        />
                      </span>
                      <span className="a-cell-title">
                        <b>{highlight.title}</b>
                      </span>
                    </div>
                  </td>
                  <td data-label="Song">{highlight.song?.title || 'No song'}</td>
                  <td data-label="Slides" className="a-num">{highlight.slides?.length || 0}</td>
                  <td className="a-actions">
                    <button type="button" onClick={() => setPreviewHighlight(highlight)} className="a-btn a-btn--sm">
                      Preview
                    </button>
                    <button type="button" onClick={() => handleEditHighlight(highlight)} className="a-btn a-btn--sm">
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteHighlight(highlight.id)}
                      aria-label={`Delete ${highlight.title}`}
                      className="a-btn a-btn--sm a-btn--danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="a-empty">
            <p>No highlights on the home page yet.</p>
            <p>Make one with New highlight; it appears under the hero.</p>
          </div>
        )}
      </section>

      <MusicPickerModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        onSelectSong={(song) => setSelectedSong(song)}
        selectedSongId={selectedSong.id}
      />

      {previewHighlight && (
        <StoryViewerModal
          highlights={[previewHighlight]}
          initialHighlightIndex={0}
          onClose={() => setPreviewHighlight(null)}
        />
      )}
    </section>
  );
}
