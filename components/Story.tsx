import Link from "next/link";
import { findImage } from "@/lib/media";
import { story } from "@/lib/site";
import { Media } from "./Media";
import type { Collection } from "@/lib/commerce/types";

/** Manifeste : le texte s'illumine mot à mot au défilement. */
export function Manifesto() {
  return (
    <section className="manifesto" id="histoire">
      <img className="manifesto__mono" src="/brand/monogramme-or.png" alt="" data-parallax="0.2" />
      <div className="container manifesto__inner">
        <p className="words" data-words>
          {story.manifesto}
        </p>
        <div className="manifesto__meta reveal">
          <Link href="/maison" className="btn">
            Rencontrer la créatrice
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Les chapitres de l'inspiration, en défilement horizontal épinglé. */
export function Chapters({ collections }: { collections: Collection[] }) {
  return (
    <section className="chapters" data-hscroll aria-label="Ce qui inspire la créatrice">
      <div className="chapters__sticky">
        <div className="chapters__track" data-hscroll-track>
          <div className="chapters__intro">
            <h2 className="display h2">
              Cinq sources <em className="shimmer">d&apos;inspiration</em>
            </h2>
            <p className="lead" style={{ color: "rgba(250,246,240,.7)" }}>
              Des plages bretonnes aux terres rouges de l&apos;Ouest, chaque collection est née d&apos;un lieu, d&apos;une lumière ou d&apos;un lien.
            </p>
            <span className="chapters__hint">Faites défiler</span>
          </div>
          {story.chapters.map((c) => {
            const col = collections.find((x) => x.handle === c.collection);
            return (
              <article className="chapter" data-panel key={c.n}>
                <span className="chapter__num" aria-hidden>
                  {c.n}
                </span>
                <div className="chapter__media">
                  <Media image={findImage(c.image, c.title)} art={col?.art} seed={`ch-${c.n}`} alt={c.title} sizes="(max-width: 900px) 86vw, 45vw" zoom={false} />
                </div>
                <div className="chapter__body">
                  <span className="eyebrow">
                    {c.kicker}
                  </span>
                  <h3 className="display h2">{c.title}</h3>
                  <p>{c.text}</p>
                  {col && (
                    <Link href={`/collections/${col.handle}`} className="link-underline chapter__link" data-label={col.title}>
                      Collection {col.title}
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
        <div className="chapters__bar" aria-hidden>
          <span data-hscroll-bar />
        </div>
      </div>
    </section>
  );
}
