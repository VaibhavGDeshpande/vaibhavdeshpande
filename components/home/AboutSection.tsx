'use client';

import Image from 'next/image';
import { getOptimizedImageUrl } from '@/lib/image';

export default function AboutSection() {
  return (
    <section id="about" className="relative z-10 py-20 sm:py-28">
      <div className="section-wrap">
        <div className="grid gap-10 md:grid-cols-12 md:items-start md:gap-14">
          <div className="md:col-span-5">
            <div className="glass-panel group relative aspect-[4/5] overflow-hidden rounded-3xl">
              <Image
                src={getOptimizedImageUrl(
                  'https://briysjozqxpqjtdyohje.supabase.co/storage/v1/object/public/photos/Sun/1.jpg',
                  { width: 1000, quality: 72 }
                )}
                alt="Vaibhav Deshpande"
                fill
                className="object-cover opacity-85 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
            </div>
            <p className="mt-3 text-[10px] uppercase tracking-[0.26em] text-stone-500">Portrait / Pune, India</p>
          </div>

          <div className="md:col-span-7">
            <p className="eyebrow">About</p>
            <h2 className="headline-serif mt-3 text-4xl leading-tight sm:text-5xl md:text-6xl">The Observer</h2>

            <div className="mt-6 max-w-2xl space-y-4 text-sm leading-relaxed text-stone-300 sm:text-base">
              <p>
                I am a photographer based in Pune, India, focused on moments where light and emotion quietly intersect.
              </p>
              <p>
                My work moves between city streets, open skies, and textured details to build visual narratives with stillness and mood.
              </p>
              <p>Every image is an invitation to slow down, notice, and feel something honest.</p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="glass-panel rounded-2xl p-5">
                <p className="eyebrow">Focus</p>
                <p className="mt-2 font-serif text-xl text-stone-100">Atmosphere & narratives</p>
              </div>
              <div className="glass-panel rounded-2xl p-5">
                <p className="eyebrow">Contact</p>
                <a
                  href="mailto:deshpande.vaibhav1012@gmail.com"
                  className="mt-2 inline-block font-serif text-xl text-stone-100 underline-offset-4 hover:underline"
                >
                  Get in touch
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
