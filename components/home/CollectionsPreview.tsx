'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Collection } from '@/lib/data';
import { getOptimizedImageUrl } from '@/lib/image';

interface CollectionsPreviewProps {
  collections: Collection[];
}

export default function CollectionsPreview({ collections }: CollectionsPreviewProps) {
  return (
    <section className="darkroom work" aria-labelledby="work-title">
      <div className="container">
        <div className="work__head">
          <h2 id="work-title">Collections by subject</h2>
          <Link href="/gallery" className="btn">
            Open archive
          </Link>
        </div>

        <ul className="plates">
          {collections.map((collection, i) => (
            <li key={collection.id} className="plate">
              <Link href={`/gallery?filter=${collection.id}`} className="plate__link">
                <span className="plate__frame">
                  <Image
                    src={getOptimizedImageUrl(collection.coverImage, { width: 1400, quality: 70 })}
                    alt=""
                    fill
                    sizes="(max-width: 40rem) 100vw, (max-width: 60rem) 50vw, 66vw"
                    className="plate__img"
                  />
                </span>
                <span className="plate__caption">
                  <span className="plate__num num">{i + 1}</span>
                  <h3 className="plate__name">{collection.name}</h3>
                  <span className="plate__count num">{collection.photoCount} photographs</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
