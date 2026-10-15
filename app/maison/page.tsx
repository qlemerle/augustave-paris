import type { Metadata } from "next";
import Link from "next/link";
import { commerce } from "@/lib/commerce";
import { findImage } from "@/lib/media";
import { site, story } from "@/lib/site";
import { Media } from "@/components/Media";
import { Chapters } from "@/components/Story";

export const metadata: Metadata = {
  title: "La Maison",
  description: "L'histoire d'Augustave Paris et de sa créatrice : bijoux d'auteur faits main, inspirés par l'océan, la lumière et les grands espaces.",
};

export default async function Page() {
  const collections = await commerce.getCollections();
  const art = (h: string) => collections.find((c) => c.handle === h)?.art;
  const portrait = findImage("maison/fondatrice", "La créatrice d'Augustave");
  // En attendant le portrait : la table de l'atelier
  const atelier = findImage("maison/atelier", "La table de l'atelier : coupelles de perles et bobine de fil");

  return (
    <>
      <section className="maison-hero" data-spotlight>
        <div className="maison-hero__media">
          <Media image={findImage("accueil/hero-1", "")} art={art("la-nacree")} seed="mh" parallax={0.18} zoom={false} priority sizes="100vw" />
        </div>
        <div className="maison-hero__veil" />
        <div className="container maison-hero__content">
          <h1 className="display h1 hero__title" style={{ maxWidth: "14ch" }}>
            <span className="line">
              <span style={{ ["--i" as string]: 0 }}>Des bijoux qui</span>
            </span>
            <span className="line">
              <span style={{ ["--i" as string]: 1 }}>
                <em className="shimmer">racontent</em> une histoire
              </span>
            </span>
          </h1>
          <p className="lead" style={{ animation: "fade-up 1.4s .9s var(--ease) both" }}>
            Une créatrice, ses mains, et des fragments de nature rapportés de la mer ou de la route.
          </p>
        </div>
      </section>

      <section className="manifesto">
        <img className="manifesto__mono" src="/brand/monogramme-or.png" alt="" data-parallax="0.2" />
        <div className="container manifesto__inner">
          <p className="words" data-words>
            {story.manifesto}
          </p>
        </div>
      </section>

      <section className="section section--cream">
        <div className="container creator">
          <div className="creator__portrait reveal reveal--mask">
            <Media image={portrait ?? atelier} art={art("la-nacree")} seed="creatrice" alt="La créatrice d'Augustave" parallax={0.1} />
            {!portrait && <span className="creator__portrait-note">La table de l&apos;atelier</span>}
          </div>
          <div className="creator__body">
            <h2 className="display h2 reveal">{story.creator.title}</h2>
            {story.creator.paragraphs.map((p, i) => (
              <p className="lead reveal" key={i} style={{ margin: 0, ["--d" as string]: `${i * 120}ms` }}>
                {p}
              </p>
            ))}
            <blockquote className="creator__quote reveal">
              « {story.creator.quote} »<cite>{story.creator.signature}</cite>
            </blockquote>
          </div>
        </div>
      </section>

      <Chapters collections={collections} />

      <section className="section section--navy">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="display h2 reveal">
                De la perle <em>au bijou</em>
              </h2>
            </div>
            <p className="lead reveal" style={{ maxWidth: 420, margin: 0 }}>
              Chaque création passe par les mêmes mains, du premier coup de cœur à l&apos;écrin.
            </p>
          </div>
          <div className="gesture">
            {story.gesture.map((g, i) => (
              <div className="gesture__step reveal" key={g.title} style={{ ["--d" as string]: `${i * 120}ms` }}>
                <span>0{i + 1}</span>
                <h3>{g.title}</h3>
                <p>{g.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head section-head--center">
            <h2 className="display h2 reveal">
              Entre <em>mer</em> et <em>lumière</em>
            </h2>
          </div>
          <div className="mosaic">
            {[
              ["maison/lumiere", "La Nacrée", "la-nacree"],
              ["maison/grands-espaces", "Texas Stones", "texas-stones"],
              ["maison/geste", "Bronze", "bronze"],
              ["maison/ocean", "Grey Shades", "grey-shades"],
            ].map(([img, label, col], i) => (
              <figure key={img} className="reveal" style={{ ["--d" as string]: `${i * 100}ms` }}>
                <Link href={`/collections/${col}`} data-label={label}>
                  <Media image={findImage(img, label)} art={art(col)} seed={`mo-${i}`} alt={label} parallax={0.08} style={i === 3 ? { aspectRatio: "16 / 10" } : undefined} />
                </Link>
                <figcaption>{label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--cream">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="display h2 reveal">Ce qui fait un Augustave</h2>
            </div>
          </div>
          <div className="signatures">
            {story.signatures.map((s, i) => (
              <div className="signature reveal" key={s.title} style={{ ["--d" as string]: `${i * 100}ms` }}>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--navy">
        <div className="container quote">
          <img className="quote__mark reveal" src="/brand/monogramme-or.png" alt="" />
          <blockquote className="reveal">
            Et si le prochain bijou racontait <em className="shimmer">votre histoire</em> ?
          </blockquote>
          <div className="reveal" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/sur-mesure" className="btn btn--light">
              Créer mon collier sur-mesure
            </Link>
            <Link href="/boutique" className="btn btn--light">
              Découvrir les bijoux
            </Link>
          </div>
          <p className="form-note" style={{ opacity: 0.7 }}>
            Une question ? Écrivez-nous à {site.email} ou sur Instagram {site.instagramHandle}.
          </p>
        </div>
      </section>
    </>
  );
}
