"use client";

import { useEffect, useState } from "react";

/** Fondu enchaîné (avec flou) entre les visuels du héros, rendus côté serveur. */
export function HeroSlider({ slides, labels }: { slides: React.ReactNode[]; labels: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length, i]);
  return (
    <>
      <div className="hero__media" aria-hidden>
        {slides.map((s, k) => (
          <div key={k} className={`hero__slide ${k === i ? "is-active" : ""}`}>
            {s}
          </div>
        ))}
        <div className="hero__veil" />
      </div>
      <div className="hero__dots">
        {labels.map((l, k) => (
          <button key={`${k}-${i === k}`} className={`hero__dot ${k === i ? "is-active" : ""}`} aria-label={l} onClick={() => setI(k)} />
        ))}
      </div>
      <div className="hero__index" aria-live="polite">
        <span>Porté : collection {labels[i]}</span>
      </div>
    </>
  );
}
