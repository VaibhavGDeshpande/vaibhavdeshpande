'use client';

import Link from 'next/link';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="darkroom foot">
      <div className="container">
        <div className="foot__top">
          <p className="foot__statement">
            <a href="mailto:deshpande.vaibhav1012@gmail.com" className="foot__mail">
              Get in touch
            </a>
          </p>

          <dl className="foot__sheet">
            <div className="foot__row">
              <dt>Email</dt>
              <dd>
                <a href="mailto:deshpande.vaibhav1012@gmail.com" className="link">
                  deshpande.vaibhav1012@gmail.com
                </a>
              </dd>
            </div>
            <div className="foot__row">
              <dt>Elsewhere</dt>
              <dd className="foot__links">
                <Link href="https://www.instagram.com" target="_blank" rel="noreferrer" className="link">
                  Instagram
                </Link>
                <Link href="https://x.com" target="_blank" rel="noreferrer" className="link">
                  X / Twitter
                </Link>
              </dd>
            </div>
            <div className="foot__row">
              <dt>Based in</dt>
              <dd>Pune, India</dd>
            </div>
          </dl>
        </div>

        <h2 className="foot__word">Vaibhav Deshpande</h2>

        <div className="foot__base">
          <p className="foot__legal">Copyright {new Date().getFullYear()}, Pune, India</p>
          <button type="button" onClick={scrollToTop} className="btn">
            Back to top
          </button>
        </div>
      </div>
    </footer>
  );
}
