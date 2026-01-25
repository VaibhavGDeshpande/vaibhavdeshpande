'use client';

import Image from 'next/image';

export default function AboutSection() {
  return (
    <section
      id="about"
      className="py-24 sm:py-28 md:py-40 px-4 sm:px-6 bg-neutral-950 border-t border-neutral-900/50"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24 items-start">

          {/* Portrait */}
          <div className="md:col-span-5 relative group">
            <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900 grayscale group-hover:grayscale-0 transition-all duration-1000">
              <Image
                src="https://briysjozqxpqjtdyohje.supabase.co/storage/v1/object/public/photos/Sun/1.jpg"
                alt="Vaibhav Deshpande"
                fill
                className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
              <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
            </div>

            <div className="mt-4 flex justify-between text-[10px] tracking-widest uppercase text-neutral-600">
              <span>Portrait</span>
              <span>Pune, IN</span>
            </div>
          </div>

          {/* Narrative */}
          <div className="md:col-span-7 flex flex-col justify-center space-y-10">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif text-neutral-200 leading-tight">
                The Observer
              </h2>
              <div className="h-px w-12 bg-neutral-800" />
            </div>

            <div className="space-y-6 text-neutral-400 font-light text-sm sm:text-base max-w-xl">
              <p>
                I am a photographer based in <span className="text-neutral-200">Pune, India</span>, 
                driven by an unyielding passion for the visual medium.
              </p>
              <p>
                I seek to capture the essence of a moment before it fades — the quiet,
                the atmosphere, the unnoticed.
              </p>
              <p>
                Every image is an invitation to pause, observe, and feel.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-neutral-900/50">
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-2">
                  Focus
                </h4>
                <p className="font-serif text-neutral-300 text-lg">
                  Visual Narratives, Atmosphere
                </p>
              </div>

              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-2">
                  Contact
                </h4>
                <a
                  href="mailto:deshpande.vaibhav1012@gmail.com"
                  className="font-serif text-neutral-300 text-lg hover:text-white transition underline underline-offset-4"
                >
                  Get in Touch
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
