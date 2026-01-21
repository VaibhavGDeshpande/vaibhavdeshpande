// components/ui/Footer.tsx
'use client';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-neutral-950 text-neutral-400 pt-32 pb-12 px-6 md:px-12 border-t border-neutral-900">
      <div className="max-w-450 mx-auto flex flex-col gap-24">
        
        {/* Top Section: Links & Action */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
          
          {/* Social Columns */}
          <div className="flex gap-16 font-sans text-[10px] tracking-[0.2em] uppercase">
            <div className="flex flex-col gap-4">
              <span className="text-neutral-600 mb-2">Socials</span>
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-neutral-600 mb-2">Contact</span>
              <a href="mailto:hello@vaibhav.com" className="hover:text-white transition-colors">Email</a>
              <a href="#" className="hover:text-white transition-colors">Inquiries</a>
            </div>
          </div>

          {/* Back to Top Button */}
          <button 
            onClick={scrollToTop}
            className="group flex flex-col items-center gap-2 hover:text-white transition-colors"
          >
            <span className="h-12 w-px bg-neutral-800 group-hover:bg-white transition-colors duration-500" />
            <span className="text-[10px] tracking-widest uppercase writing-vertical-rl">Back to Top</span>
          </button>
        </div>

        {/* Bottom Section: The "Signature" */}
        <div className="border-t border-neutral-900 pt-12 flex flex-col md:flex-row justify-between items-end gap-6">
          <h1 className="font-serif text-[12vw] leading-none text-neutral-800 select-none tracking-tighter">
            VAIBHAV
          </h1>
          
          <div className="pb-4 text-right">
             <p className="font-sans text-[10px] tracking-widest text-neutral-600">
               © {new Date().getFullYear()} — Pune, India
             </p>
             <p className="font-sans text-[10px] tracking-widest text-neutral-700 mt-2">
               Designed for Silence.
             </p>
          </div>
        </div>

      </div>
    </footer>
  );
}