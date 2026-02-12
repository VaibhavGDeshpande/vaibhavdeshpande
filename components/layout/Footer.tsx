'use client';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-neutral-950 text-neutral-400 pt-20 sm:pt-28 md:pt-32 pb-10 px-4 sm:px-6 md:px-12 border-t border-neutral-900">
      <div className="mx-auto max-w-5xl flex flex-col gap-20">

        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between gap-12">

          {/* Links */}
          <div className="flex gap-12 sm:gap-16 font-sans text-[10px] tracking-[0.2em] uppercase">
            <div className="flex flex-col gap-4">
              <span className="text-neutral-600 mb-2">Socials</span>
              <a className="hover:text-white transition">Instagram</a>
              <a className="hover:text-white transition">Twitter</a>
              <a className="hover:text-white transition">LinkedIn</a>
            </div>

            <div className="flex flex-col gap-4">
              <span className="text-neutral-600 mb-2">Contact</span>
              <a
                href="mailto:deshpande.vaibhav1012@gmail.com"
                className="hover:text-white transition"
              >
                Email
              </a>
              <a className="hover:text-white transition">Inquiries</a>
            </div>
          </div>

          {/* Back to Top */}
          <button
            onClick={scrollToTop}
            className="group flex items-center gap-4 self-start md:self-end hover:text-white transition"
          >
            {/* Line */}
            <span className="hidden md:block h-12 w-px bg-neutral-800 group-hover:bg-white transition" />
            <span className="text-[10px] tracking-widest uppercase">
              Back to Top ↑
            </span>
          </button>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-neutral-900 pt-10 flex flex-col md:flex-row justify-between gap-8 items-start md:items-end">
          <h1 className="font-serif text-[18vw] sm:text-[14vw] md:text-[10vw] leading-none text-neutral-800 select-none tracking-tighter">
            VAIBHAV
          </h1>

          <div className="text-left md:text-right">
            <p className="text-[10px] tracking-widest text-neutral-600">
              © {new Date().getFullYear()} — Pune, India
            </p>
            <p className="text-[10px] tracking-widest text-neutral-700 mt-2">
              Designed for Excellence
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}
