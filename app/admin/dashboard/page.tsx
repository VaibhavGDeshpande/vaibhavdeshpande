import Image from 'next/image';
import Link from 'next/link';
import { Upload } from 'lucide-react';
import { getPhotos } from '@/lib/data';

export default async function DashboardPage() {
  const photos = await getPhotos();
  const categories = Array.from(new Set(photos.map((photo) => photo.category))).sort();
  const recentPhotos = photos.slice(-6).reverse();
  const countFor = (category: string) => photos.filter((photo) => photo.category === category).length;

  return (
    <div className="a-page">
      <header className="a-head">
        <div>
          <h1>Overview</h1>
          <p>Your photographs and the collections they appear in on the site.</p>
        </div>
        <Link href="/admin/upload-image" className="a-btn a-btn--primary">
          <Upload size={16} strokeWidth={1.5} aria-hidden="true" />
          Upload photographs
        </Link>
      </header>

      <dl className="a-figures" aria-label="Library summary">
        <div>
          <dt>Photographs</dt>
          <dd>{photos.length}</dd>
        </div>
        <div>
          <dt>Collections</dt>
          <dd>{categories.length}</dd>
        </div>
      </dl>

      <section aria-labelledby="recent-title">
        <div className="a-section__head">
          <h2 id="recent-title">Recently added</h2>
          <Link href="/admin/gallery" className="a-link">
            Open the archive
          </Link>
        </div>

        {recentPhotos.length ? (
          <div className="a-strip">
            {recentPhotos.map((photo) => (
              <Link key={photo.id} href={`/admin/gallery?collection=${encodeURIComponent(photo.category)}`}>
                <span className="a-thumb">
                  <Image
                    src={photo.image_url}
                    alt=""
                    fill
                    sizes="(max-width: 40rem) 50vw, (max-width: 60rem) 33vw, 200px"
                  />
                </span>
                <span className="a-strip__title">{photo.title || 'Untitled'}</span>
                <span className="a-strip__meta">{photo.category}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="a-empty">
            <p>Your archive is ready for its first photograph.</p>
            <p>
              <Link href="/admin/upload-image" className="a-link">
                Upload a photograph
              </Link>
            </p>
          </div>
        )}
      </section>

      <section className="a-section" aria-labelledby="collections-title">
        <div className="a-section__head">
          <h2 id="collections-title">Collections</h2>
        </div>

        {categories.length ? (
          <table className="a-table">
            <thead>
              <tr>
                <th scope="col">Collection</th>
                <th scope="col" className="a-num">Photographs</th>
                <th scope="col" className="a-actions">
                  <span className="visually-hidden">Open</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category}>
                  <td>{category}</td>
                  <td className="a-num">{countFor(category)}</td>
                  <td className="a-actions">
                    <Link href={`/admin/gallery?collection=${encodeURIComponent(category)}`} className="a-link">
                      Open in archive
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="a-help">Collections appear as you add photographs.</p>
        )}
      </section>
    </div>
  );
}
