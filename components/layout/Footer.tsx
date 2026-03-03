'use client';

import Link from 'next/link';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative z-10 border-t border-white/10 bg-black/30 pb-10 pt-16 sm:pt-20">
      <div className="section-wrap">
        <div className="glass-panel rounded-3xl p-6 sm:p-10">
          <div className="mb-8 grid gap-10 sm:mb-12 sm:grid-cols-2">
            <div>
              <p className="eyebrow">Connect</p>
              <div className="mt-4 flex flex-col gap-3 text-sm text-stone-300">
                <Link
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition"
                >
                  Instagram
                </Link>
                <Link
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition"
                >
                  X / Twitter
                </Link>
                <a href="mailto:deshpande.vaibhav1012@gmail.com" className="hover:text-white transition">
                  deshpande.vaibhav1012@gmail.com
                </a>
              </div>
            </div>

            <div className="sm:text-right">
              <p className="eyebrow">Studio Note</p>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-stone-400 sm:ml-auto">
                Available for editorial and commissioned work in Pune and across India.
              </p>
              <button onClick={scrollToTop} className="btn-soft mt-6">
                Back to top
              </button>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 sm:pt-8">
            <h2 className="headline-serif text-[16vw] leading-none text-stone-200/20 sm:text-[10vw]">
              VAIBHAV
            </h2>
            <p className="mt-3 text-[10px] uppercase tracking-[0.26em] text-stone-500 sm:text-xs">
              Copyright {new Date().getFullYear()} - Pune, India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
