'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Search, Upload, X } from 'lucide-react';
import supabase from '@/lib/supabase';
import type { Photo } from '@/lib/data';
import { VARIANT_WIDTHS, allVariantPaths, variantPath } from '@/lib/imageVariants';

const STORAGE_BASE_URL =
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/`;

function getStoragePath(imageUrl: string) {
  return imageUrl.startsWith(STORAGE_BASE_URL)
    ? imageUrl.slice(STORAGE_BASE_URL.length)
    : imageUrl;
}

export default function AdminDashboard({
  photos,
  initialCategory,
  initialSearch,
}: {
  photos: Photo[];
  initialCategory?: string;
  initialSearch?: string;
}) {
  const [items, setItems] = useState(photos);
  const [search, setSearch] = useState(initialSearch ?? '');
  const [categoryFilter, setCategoryFilter] = useState(initialCategory || 'All');

  // The filter and search live in the URL too, so a view can be reloaded or shared.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (categoryFilter === 'All') params.delete('collection');
    else params.set('collection', categoryFilter);
    if (search.trim()) params.set('q', search.trim());
    else params.delete('q');
    const query = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
  }, [categoryFilter, search]);
  const [categoryEdits, setCategoryEdits] = useState<Record<string, string>>({});
  const [newCategoryById, setNewCategoryById] = useState<Record<string, string>>({});
  const [activeMoveId, setActiveMoveId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(items.map((photo) => photo.category).filter(Boolean))).sort(),
    [items],
  );
  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((photo) => {
      const matchesCategory = categoryFilter === 'All' || photo.category === categoryFilter;
      const matchesSearch =
        !query ||
        photo.title.toLowerCase().includes(query) ||
        photo.category.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, items, search]);

  const handleMove = async (photo: Photo) => {
    const destinationCategory =
      categoryEdits[photo.id] === '__NEW__'
        ? (newCategoryById[photo.id] ?? '').trim()
        : (categoryEdits[photo.id] ?? photo.category).trim();

    if (!destinationCategory || destinationCategory === '__NEW__') {
      setStatus({ type: 'error', text: 'Enter a name for the new folder.' });
      return;
    }
    if (/[\\/]/.test(destinationCategory)) {
      setStatus({ type: 'error', text: 'Folder names cannot contain slashes.' });
      return;
    }
    if (destinationCategory === photo.category) {
      setActiveMoveId(null);
      return;
    }

    setLoadingId(photo.id);
    setStatus(null);

    const currentPath = getStoragePath(photo.image_url);
    const sourcePrefix = `${photo.category}/`;
    const relativePath = currentPath.startsWith(sourcePrefix)
      ? currentPath.slice(sourcePrefix.length)
      : currentPath.split('/').pop() ?? currentPath;
    const existingPaths = new Set(items.map((item) => getStoragePath(item.image_url)));
    const filename = relativePath.split('/').pop() ?? 'image';
    const relativeDirectory = relativePath.includes('/')
      ? `${relativePath.slice(0, relativePath.lastIndexOf('/') + 1)}`
      : '';
    let destinationPath = `${destinationCategory}/${relativePath}`;
    let suffix = 2;

    while (existingPaths.has(destinationPath)) {
      const dot = filename.lastIndexOf('.');
      const stem = dot > 0 ? filename.slice(0, dot) : filename;
      const extension = dot > 0 ? filename.slice(dot) : '';
      destinationPath = `${destinationCategory}/${relativeDirectory}${stem}-${suffix}${extension}`;
      suffix += 1;
    }

    try {
      const { error: moveError } = await supabase.storage
        .from('photos')
        .move(currentPath, destinationPath);
      if (moveError) throw moveError;

      const { error: updateError } = await supabase
        .from('photos')
        .update({ category: destinationCategory, image_url: destinationPath })
        .eq('id', photo.id)
        .select('id')
        .single();

      if (updateError) {
        const { error: rollbackError } = await supabase.storage
          .from('photos')
          .move(destinationPath, currentPath);
        if (rollbackError) {
          throw new Error(
            `Could not update the photo record (${updateError.message}) or restore its file (${rollbackError.message}).`,
          );
        }
        throw updateError;
      }

      // Move the pre-made WebP copies too. Best effort: a copy that is missing or
      // fails to move only means the site serves the original until the backfill re-runs.
      await Promise.all(
        VARIANT_WIDTHS.map((w) =>
          supabase.storage
            .from('photos')
            .move(variantPath(currentPath, w), variantPath(destinationPath, w))
            .then(({ error }) => error && console.warn('WebP copy not moved:', error.message)),
        ),
      );

      setItems((current) =>
        current.map((item) =>
          item.id === photo.id
            ? {
                ...item,
                category: destinationCategory,
                image_url: `${STORAGE_BASE_URL}${destinationPath}`,
              }
            : item,
        ),
      );
      setCategoryEdits((current) => ({ ...current, [photo.id]: destinationCategory }));
      setActiveMoveId(null);
      setStatus({ type: 'success', text: `Moved “${photo.title}” to ${destinationCategory}.` });

      const response = await fetch('/api/revalidate', { method: 'POST' });
      if (!response.ok) throw new Error('The photo moved, but website caches could not be refreshed.');
    } catch (error) {
      console.error('Move failed:', error);
      setStatus({
        type: 'error',
        text: error instanceof Error ? error.message : 'Could not move this photo.',
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (photo: Photo) => {
    if (!window.confirm(`Delete “${photo.title}”? This cannot be undone.`)) return;

    setLoadingId(photo.id);
    setStatus(null);

    try {
      const { error: storageError } = await supabase.storage
        .from('photos')
        .remove([getStoragePath(photo.image_url)]);
      if (storageError) throw storageError;

      // Its pre-made WebP copies go with it (missing ones are ignored by remove).
      const { error: variantError } = await supabase.storage
        .from('photos')
        .remove(allVariantPaths(getStoragePath(photo.image_url)));
      if (variantError) console.warn('WebP copies not removed:', variantError.message);

      const { error: databaseError } = await supabase
        .from('photos')
        .delete()
        .eq('id', photo.id);
      if (databaseError) throw databaseError;

      setItems((current) => current.filter((item) => item.id !== photo.id));
      setStatus({ type: 'success', text: `Deleted “${photo.title}”.` });

      const response = await fetch('/api/revalidate', { method: 'POST' });
      if (!response.ok) throw new Error('The photo was deleted, but website caches could not be refreshed.');
    } catch (error) {
      console.error('Delete failed:', error);
      setStatus({
        type: 'error',
        text: error instanceof Error ? error.message : 'Could not delete this photo.',
      });
    } finally {
      setLoadingId(null);
    }
  };

  const countFor = (category: string) => items.filter((photo) => photo.category === category).length;

  return (
    <section className="a-page" aria-labelledby="archive-title">
      <header className="a-head">
        <div>
          <h1 id="archive-title">Archive</h1>
          <p>
            {items.length} photographs. Each folder is a collection on your site.
          </p>
        </div>
        <Link href="/admin/upload-image" className="a-btn a-btn--primary">
          <Upload size={16} strokeWidth={1.5} aria-hidden="true" />
          Add photographs
        </Link>
      </header>

      <div className="a-toolbar">
        <label className="a-field">
          <span className="a-label">Collection</span>
          <select
            className="a-input"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="All">All collections ({items.length})</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category} ({countFor(category)})
              </option>
            ))}
          </select>
        </label>

        <label className="a-field a-search-field">
          <span className="a-label">Search</span>
          <span className="a-search">
            <Search size={16} strokeWidth={1.5} aria-hidden="true" />
            <input
              type="search"
              className="a-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Title or collection"
            />
            {search && (
              <button type="button" className="a-btn a-btn--icon" aria-label="Clear search" onClick={() => setSearch('')}>
                <X size={16} strokeWidth={1.5} aria-hidden="true" />
              </button>
            )}
          </span>
        </label>

        <p className="a-count" aria-live="polite">
          {filteredItems.length === items.length
            ? `${items.length} shown`
            : `${filteredItems.length} of ${items.length} shown`}
        </p>
      </div>

      {status && (
        <div role="status" className={`a-status a-status--${status.type}`}>
          {status.type === 'success' ? (
            <CheckCircle2 size={16} strokeWidth={1.5} aria-hidden="true" />
          ) : (
            <AlertCircle size={16} strokeWidth={1.5} aria-hidden="true" />
          )}
          <span className="a-status__text">{status.text}</span>
          <button type="button" className="a-btn a-btn--icon a-btn--sm" onClick={() => setStatus(null)} aria-label="Dismiss message">
            <X size={16} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      )}

      {filteredItems.length ? (
        <table className="a-table a-table--stack">
          <thead>
            <tr>
              <th scope="col">Photograph</th>
              <th scope="col">Collection</th>
              <th scope="col" className="a-num">Size</th>
              <th scope="col" className="a-actions">
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((photo) => (
              <tr key={photo.id} data-active={activeMoveId === photo.id}>
                <td>
                  <div className="a-cell-photo">
                    <span className="a-thumb">
                      <Image
                        src={photo.image_url}
                        alt=""
                        fill
                        loading={photo.id === filteredItems[0]?.id ? 'eager' : 'lazy'}
                        sizes="48px"
                      />
                    </span>
                    <span className="a-cell-title">
                      <b>{photo.title || 'Untitled'}</b>
                      <span>{getStoragePath(photo.image_url)}</span>
                    </span>
                  </div>
                </td>
                <td data-label="Collection">{photo.category}</td>
                <td data-label="Size" className="a-num a-muted">
                  {photo.width && photo.height ? `${photo.width} × ${photo.height}` : 'Unknown'}
                </td>
                <td className="a-actions">
                  {activeMoveId === photo.id ? (
                    <div className="a-move">
                      <label className="visually-hidden" htmlFor={`category-${photo.id}`}>Move to folder</label>
                      <select
                        id={`category-${photo.id}`}
                        className="a-input"
                        value={categoryEdits[photo.id] ?? photo.category}
                        onChange={(event) => {
                          setCategoryEdits((current) => ({ ...current, [photo.id]: event.target.value }));
                          if (event.target.value === '__NEW__') {
                            setNewCategoryById((current) => ({ ...current, [photo.id]: '' }));
                          }
                        }}
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                        <option value="__NEW__">Create a folder…</option>
                      </select>
                      {categoryEdits[photo.id] === '__NEW__' && (
                        <input
                          autoFocus
                          className="a-input"
                          value={newCategoryById[photo.id] ?? ''}
                          onChange={(event) => setNewCategoryById((current) => ({
                            ...current,
                            [photo.id]: event.target.value,
                          }))}
                          placeholder="Folder name"
                          aria-label="New folder name"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => handleMove(photo)}
                        disabled={loadingId === photo.id}
                        aria-busy={loadingId === photo.id}
                        className="a-btn a-btn--primary a-btn--sm"
                      >
                        {loadingId === photo.id ? 'Moving…' : 'Move photograph'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveMoveId(null)}
                        className="a-btn a-btn--sm"
                        aria-label="Cancel move"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setCategoryEdits((current) => ({ ...current, [photo.id]: photo.category }));
                          setActiveMoveId(photo.id);
                          setStatus(null);
                        }}
                        className="a-btn a-btn--sm"
                      >
                        Change folder
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(photo)}
                        disabled={loadingId === photo.id}
                        aria-busy={loadingId === photo.id}
                        aria-label={`Delete ${photo.title}`}
                        className="a-btn a-btn--sm a-btn--danger"
                      >
                        {loadingId === photo.id ? 'Working…' : 'Delete'}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="a-empty">
          <p>{items.length ? 'No photographs match this view.' : 'Your archive is empty.'}</p>
          <p>
            {items.length ? (
              <button
                type="button"
                className="a-btn a-btn--sm"
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('All');
                }}
              >
                Show all photographs
              </button>
            ) : (
              <Link href="/admin/upload-image" className="a-link">Upload a photograph to get started</Link>
            )}
          </p>
        </div>
      )}
    </section>
  );
}
