'use client';

export default function AboutSection() {
  return (
    <section id="about" className="darkroom about" aria-labelledby="about-title">
      <div className="container about__grid">
        <div className="about__text">
          <h2 id="about-title">The Observer</h2>
          <p className="lead about__lead">
            I am a photographer based in Pune, India, focused on moments where light and emotion quietly intersect.
          </p>
          <p>
            My work moves between city streets, open skies, and textured details to build visual narratives with stillness and mood.
          </p>
          <p>Every image is an invitation to slow down, notice, and feel something honest.</p>
        </div>

        <dl className="sheet">
          <div className="sheet__row">
            <dt>Based in</dt>
            <dd>Pune, India</dd>
          </div>
          <div className="sheet__row">
            <dt>Works between</dt>
            <dd>City streets, open skies, textured details</dd>
          </div>
          <div className="sheet__row">
            <dt>Focus</dt>
            <dd>Atmosphere &amp; narratives</dd>
          </div>
          <div className="sheet__row">
            <dt>Contact</dt>
            <dd>
              <a href="mailto:deshpande.vaibhav1012@gmail.com" className="link">
                Get in touch
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
