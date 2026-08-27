'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Play,
  Music,
  CheckCircle2,
  AlertCircle,
  MapPin,
  FileText,
  Check,
  Eye,
  RefreshCw,
} from 'lucide-react';
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
      <div className="min-h-[60vh] flex items-center justify-center text-neutral-500">
        Login required
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
        location: details.location || '📍 Photography Portfolio',
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
          location: '📍 Pune, India',
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
      text: `Successfully published "${highlightToSave.title}" to the home page 🎉`,
    });

    setIsEditing(false);
  };

  return (
    <section className="pt-28 pb-16 px-6 md:px-12 bg-neutral-950 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif text-neutral-200 flex items-center gap-3">
              <Sparkles className="text-amber-400" />
              Instagram Story Highlights Manager
            </h1>
            <p className="text-sm text-neutral-500 mt-2">
              Create and edit story highlights with custom photos, captions, location badges, and 30-second music tracks.
            </p>
          </div>

          {!isEditing && (
            <button
              onClick={handleOpenCreateForm}
              className="inline-flex items-center gap-2 px-5 py-3 bg-white text-black text-xs font-semibold uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition"
            >
              <Plus size={16} />
              New Highlight
            </button>
          )}
        </div>

        {/* STATUS MESSAGE */}
        {statusMessage && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            )}
            <div>{statusMessage.text}</div>
          </div>
        )}

        {/* HIGHLIGHT CREATOR FORM */}
        {isEditing && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 space-y-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h3 className="text-lg font-medium text-white">
                {editingId ? 'Edit Highlight' : 'Create New Highlight'}
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPreviewHighlight(buildCurrentHighlight())}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-medium hover:bg-amber-500/30 transition"
                >
                  <Eye size={14} />
                  Live Preview Story
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-neutral-400 hover:text-white transition"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* LEFT: TITLE & MUSIC */}
              <div className="space-y-6">
                {/* TITLE */}
                <label className="block">
                  <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium">
                    Highlight Title
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Pune Vibes 🌆, Golden Hour 🌅"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-2 w-full p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
                  />
                </label>

                {/* MUSIC SELECTION PILL & MODAL TRIGGER */}
                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium flex items-center gap-1.5">
                    <Music size={14} className="text-rose-400" />
                    Background Music Track
                  </span>
                  <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-neutral-800">
                        <Image
                          src={selectedSong.albumCover}
                          alt={selectedSong.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-medium text-white truncate flex items-center gap-2">
                          <span>{selectedSong.title}</span>
                          {typeof selectedSong.startTime === 'number' && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded font-mono">
                              0:{selectedSong.startTime < 10 ? `0${selectedSong.startTime}` : selectedSong.startTime} ➔ 0:{selectedSong.endTime ? (selectedSong.endTime < 10 ? `0${selectedSong.endTime}` : selectedSong.endTime) : (selectedSong.startTime + 15)}
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-neutral-400 truncate">
                          {selectedSong.artist}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsMusicModalOpen(true)}
                      className="px-3.5 py-2 bg-rose-600/20 text-rose-300 border border-rose-600/40 rounded-lg text-xs font-medium hover:bg-rose-600/30 transition shrink-0"
                    >
                      Search & Scrub Song
                    </button>
                  </div>
                </div>

                {/* COVER PHOTO SELECTION */}
                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium">
                    Cover Photo (Avatar)
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-44 overflow-y-auto p-2 bg-neutral-950 rounded-xl border border-neutral-800">
                    {photos.map((photo) => (
                      <button
                        key={`cover-${photo.id}`}
                        onClick={() => setCoverImage(photo.image_url)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition ${
                          coverImage === photo.image_url
                            ? 'border-amber-400 scale-95'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={getOptimizedImageUrl(photo.image_url, { width: 150, quality: 60 })}
                          alt={photo.title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                        {coverImage === photo.image_url && (
                          <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                            <Check size={16} className="text-amber-400" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT: STORY SLIDES PHOTO SELECTOR */}
              <div className="space-y-3">
                <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium flex items-center justify-between">
                  <span>Select Story Slides ({selectedPhotoIds.length})</span>
                  <span className="text-[11px] text-neutral-500 font-normal">Click to toggle</span>
                </span>

                {/* SEARCH & CATEGORY FILTER BAR FOR SLIDE SELECTOR */}
                <div className="flex gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Search photos..."
                    value={photoSearch}
                    onChange={(e) => setPhotoSearch(e.target.value)}
                    className="flex-1 p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none"
                  />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none"
                  >
                    <option value="All">All Categories</option>
                    {Array.from(new Set(photos.map((p) => p.category).filter(Boolean))).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3 max-h-[350px] overflow-y-auto p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                  {photos
                    .filter((photo) => {
                      const matchesCategory = selectedCategory === 'All' || photo.category === selectedCategory;
                      const matchesSearch = !photoSearch || photo.title.toLowerCase().includes(photoSearch.toLowerCase());
                      return matchesCategory && matchesSearch;
                    })
                    .map((photo) => {
                      const isSelected = selectedPhotoIds.includes(photo.id);
                      return (
                        <div
                          key={`slide-${photo.id}`}
                          onClick={() => handleTogglePhotoSelection(photo.id)}
                          className={`relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer border-2 transition ${
                            isSelected
                              ? 'border-rose-500 ring-2 ring-rose-500/30'
                              : 'border-neutral-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <Image
                            src={getOptimizedImageUrl(photo.image_url, { width: 250, quality: 60 })}
                            alt={photo.title}
                            fill
                            sizes="150px"
                            className="object-cover"
                          />
                          <div className="absolute inset-x-0 bottom-0 p-1.5 bg-black/60 text-[10px] text-white truncate">
                            {photo.title}
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-rose-600 text-white rounded-full p-1 shadow">
                              <Check size={12} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* SLIDE CAPTIONS & LOCATION EDITING */}
            {selectedPhotoIds.length > 0 && (
              <div className="space-y-4 border-t border-neutral-800 pt-6">
                <h4 className="text-xs uppercase tracking-widest text-neutral-400 font-medium">
                  Story Slide Captions & Location Tags
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {photos
                    .filter((p) => selectedPhotoIds.includes(p.id))
                    .map((photo) => {
                      const detail = slideDetails[photo.id] || { caption: photo.title, location: '📍 Pune, India', date: 'Recent' };
                      return (
                        <div
                          key={`detail-${photo.id}`}
                          className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl flex gap-3"
                        >
                          <div className="relative w-16 h-20 rounded-lg overflow-hidden shrink-0">
                            <Image
                              src={getOptimizedImageUrl(photo.image_url, { width: 200, quality: 60 })}
                              alt={photo.title}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </div>

                          <div className="flex-1 space-y-2 text-xs">
                            <input
                              type="text"
                              placeholder="Story Caption"
                              value={detail.caption}
                              onChange={(e) =>
                                setSlideDetails((prev) => ({
                                  ...prev,
                                  [photo.id]: { ...detail, caption: e.target.value },
                                }))
                              }
                              className="w-full p-2 bg-neutral-900 border border-neutral-800 rounded text-white text-xs placeholder-neutral-600 focus:outline-none"
                            />
                            <input
                              type="text"
                              placeholder="Location (e.g. 📍 Pune, India)"
                              value={detail.location}
                              onChange={(e) =>
                                setSlideDetails((prev) => ({
                                  ...prev,
                                  [photo.id]: { ...detail, location: e.target.value },
                                }))
                              }
                              className="w-full p-2 bg-neutral-900 border border-neutral-800 rounded text-white text-xs placeholder-neutral-600 focus:outline-none"
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-end gap-4 border-t border-neutral-800 pt-6">
              <button
                onClick={() => setPreviewHighlight(buildCurrentHighlight())}
                className="px-5 py-3 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold uppercase tracking-widest rounded-xl hover:bg-amber-500/30 transition flex items-center gap-2"
              >
                <Eye size={15} />
                Live Preview Story
              </button>

              <button
                onClick={handleSaveHighlight}
                className="px-6 py-3 bg-white text-black text-xs font-semibold uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition"
              >
                Publish Highlight
              </button>
            </div>
          </div>
        )}

        {/* EXISTING HIGHLIGHTS LIST */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            Active Highlights on Home Page ({highlights.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlights.map((highlight) => (
              <div
                key={highlight.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 group hover:border-neutral-700 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-neutral-950">
                      <Image
                        src={getOptimizedImageUrl(highlight.coverImage, { width: 150, quality: 60 })}
                        alt={highlight.title}
                        fill
                        sizes="60px"
                        className="object-cover"
                      />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-white truncate text-sm">
                      {highlight.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5 truncate">
                      🎵 {highlight.song?.title || 'Song Track'}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      {highlight.slides?.length || 0} story slides
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
                  <button
                    onClick={() => setPreviewHighlight(highlight)}
                    className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition"
                  >
                    <Eye size={13} /> Preview
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditHighlight(highlight)}
                      className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteHighlight(highlight.id)}
                      className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MUSIC PICKER MODAL */}
      <MusicPickerModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        onSelectSong={(song) => setSelectedSong(song)}
        selectedSongId={selectedSong.id}
      />

      {/* LIVE STORY PREVIEW MODAL */}
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
