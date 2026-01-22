'use client';

import Image from 'next/image';

export default function AboutSection() {
  return (
    <section id="about" className="py-32 md:py-48 px-6 bg-neutral-950 border-t border-neutral-900/50">
      <div className="container mx-auto max-w-7xl">
        <div className="grid md:grid-cols-12 gap-12 md:gap-24 items-start">
          
          {/* 1. The Portrait (Left Side) */}
          <div className="md:col-span-5 relative group">
            {/* Image Container with "Film Frame" border effect */}
            <div className="relative aspect-4/5 overflow-hidden bg-neutral-900 grayscale group-hover:grayscale-0 transition-all duration-1000 ease-out">
              <Image

                src="/assets/Sun/1.jpg" 
                alt="Vaibhav Deshpande"
                fill
                className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
              
              {/* Subtle noise/grain overlay */}
              <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
            </div>

            {/* Caption */}
            <div className="mt-4 flex justify-between text-[10px] tracking-widest uppercase text-neutral-600 font-sans">
              <span>Portrait</span>
              <span>Pune, IN</span>
            </div>
          </div>
          
          {/* 2. The Narrative (Right Side) */}
          <div className="md:col-span-7 flex flex-col justify-center h-full space-y-12">
            
            <div className="space-y-6">
              <h2 className="text-4xl md:text-6xl font-serif text-neutral-200 tracking-tight leading-none">
                The Observer
              </h2>
              <div className="h-px w-12 bg-neutral-800" />
            </div>

            {/* GENERALIZED PASSIONATE TEXT */}
            <div className="space-y-6 text-neutral-400 leading-relaxed font-sans font-light text-sm md:text-base max-w-xl">
              <p>
                I am a photographer based in <span className="text-neutral-200">Pune, India</span>, 
                driven by an unyielding passion for the visual medium. For me, the camera is not just a tool, 
                but a way of experiencing the world with heightened awareness.
              </p>
              <p>
                I seek to capture the essence of a moment before it fades. Whether it is the play of light, 
                a sudden shift in atmosphere, or a quiet composition, my goal is to preserve the feeling 
                of being there. Photography is my language—a way to speak without words.
              </p>
              <p>
                Every image is an attempt to pause time and share the beauty I find in the everyday. 
                It is an invitation to look closer, breathe deeper, and see the world anew.
              </p>
            </div>

            {/* Signature / Details Block */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-neutral-900/50">
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-2">Focus</h4>
                {/* Generalized Focus Tags */}
                <p className="font-serif text-neutral-300 text-lg">Visual Narratives, Atmosphere</p>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-2">Contact</h4>
                <a href="mailto:deshpande.vaibhav1012@gmail.com" className="font-serif text-neutral-300 text-lg hover:text-white transition-colors decoration-neutral-700 underline underline-offset-4 decoration-1">
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