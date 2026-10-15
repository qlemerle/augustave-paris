import Link from "next/link";
import { commerce } from "@/lib/commerce";
import { findImage } from "@/lib/media";
import { bespokeSteps, heroSlides, promises, site } from "@/lib/site";
import { jewelSvg } from "@/lib/jewel-art.mjs";
import { Media } from "@/components/Media";
import { ProductCard } from "@/components/ProductCard";
import { HeroSlider } from "@/components/HeroSlider";
import { NewsletterForm } from "@/components/Forms";
import { Chapters, Manifesto } from "@/components/Story";
import { ArrowIcon, InstagramIcon, PromiseIcon } from "@/components/Icons";
import type { JewelArt } from "@/lib/commerce/types";

function HeroArt({ art }: { art?: JewelArt }) {
  return (
    <div className="hero-art" style={{ background: "radial-gradient(120% 90% at 70% 30%, #1c3457 0%, #0e2340 45%, #091931 100%)" }}>
      <div className="hero-art__glow" />
      {art && <div className="hero-art__jewel media__layer" dangerouslySetInnerHTML={{ __html: jewelSvg(art, { variant: 1 }) }} />}
      <img className="hero-art__mono" src="/brand/monogramme-or.png" alt="" />
    </div>
  );
}

export default async function Home() {
  const [categories, collections, products] = await Promise.all([
    commerce.getCategories(),
    commerce.getCollections(),
    commerce.getProducts(),
  ]);
  const colTitle = (h: string) => collections.find((c) => c.handle === h)?.title;
  const fall = products.filter((p) => p.collection === "edition-fall" || p.tags.includes("nouveau")).slice(0, 4);
  const best = products.filter((p) => p.tags.includes("best-seller")).slice(0, 4);
  const insta = [...products.filter((p) => p.images.length), ...products.filter((p) => !p.images.length)].slice(0, 6);

  const slides = heroSlides.map((s) => {
    const img = findImage(s.image, s.label);
    const col = collections.find((c) => c.handle === s.collection);
    return img ? <img src={img.url} alt={s.label} /> : <HeroArt art={col?.art} />;
  });

  const bespokeImg = findImage("accueil/sur-mesure", "Édition Votre Histoire");
  const bespokeImg2 = findImage("accueil/sur-mesure-2", "Atelier Augustave");

  return (
    <>
      <section className="hero" data-spotlight>
        <HeroSlider slides={slides} labels={heroSlides.map((s) => s.label)} />
        <div className="container hero__content">
          <div>
            <h1 className="display h1 hero__title">
              <span className="line">
                <span style={{ ["--i" as string]: 0 }}>Bijoux</span>
              </span>
              <span className="line">
                <span style={{ ["--i" as string]: 1 }}>
                  <em className="shimmer">façonnés</em> à la
                </span>
              </span>
              <span className="line">
                <span style={{ ["--i" as string]: 2 }}>main, à Paris</span>
              </span>
            </h1>
          </div>
          <div className="hero__side">
            <p>
              Des plages de Bretagne aux grands espaces de l'Ouest, une créatrice assemble perle après perle des bijoux qui racontent une histoire.
            </p>
            <div className="hero__ctas">
              <a href="#histoire" className="btn btn--light">
                Notre histoire
              </a>
              <Link href="/boutique" className="btn btn--light">
                La boutique
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Manifesto />
      <Chapters collections={collections} />

      <div className="marquee" aria-label="Nos collections">
        <div className="marquee__track">
          {[0, 1].map((k) =>
            collections.map((c) => (
              <Link key={`${k}-${c.handle}`} href={`/collections/${c.handle}`} className="marquee__item" aria-hidden={k === 1} tabIndex={k === 1 ? -1 : undefined}>
                {c.title}
              </Link>
            )),
          )}
        </div>
      </div>

      <section className="section section--tight">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="display h2 reveal">Les catégories</h2>
            </div>
            <Link href="/boutique" className="link-underline reveal">
              Tout voir
            </Link>
          </div>
          <div className="cat-grid">
            {categories.map((c, i) => (
              <Link key={c.handle} href={`/boutique/${c.handle}`} className="cat-card reveal" style={{ ["--d" as string]: `${(i % 3) * 120}ms` }}>
                <Media image={c.image} art={c.art} seed={c.handle} alt={c.title} sizes="(max-width: 900px) 100vw, 50vw" />
                <div className="cat-card__veil" />
                <div className="cat-card__body">
                  <div>
                    <span className="eyebrow">{c.tagline}</span>
                    <h3 className="cat-card__title">{c.title}</h3>
                  </div>
                  <span className="cat-card__arrow">
                    <ArrowIcon size={18} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--cream">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="display h2 reveal">
                Édition <em>Fall</em> & nouveautés
              </h2>
            </div>
            <Link href="/collections/edition-fall" className="link-underline reveal">
              Voir l&apos;édition
            </Link>
          </div>
          <div className="product-grid">
            {fall.map((p, i) => (
              <ProductCard key={p.handle} product={p} collectionTitle={colTitle(p.collection)} delay={i * 110} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--navy">
        <div className="container split">
          <div className="split__media reveal reveal--fade">
            <div className="reveal reveal--mask">
              <Media image={bespokeImg} art={collections.find((c) => c.handle === "rouge-love")?.art} seed="bespoke" alt="Édition Votre Histoire" parallax={0.12} />
            </div>
            <Media
              className="media--small reveal"
              image={bespokeImg2}
              art={collections.find((c) => c.handle === "la-nacree")?.art}
              seed="bespoke-2"
              alt=""
              style={{ ["--d" as string]: "400ms" } as React.CSSProperties}
            />
          </div>
          <div className="split__body">
            <h2 className="display h2 reveal">
              Créons <em>ensemble</em> votre collier sur-mesure
            </h2>
            <p className="lead reveal">
              Un prénom, une date, les couleurs d&apos;un souvenir. Nous imaginons avec vous une pièce unique, pensée pour vous ou pour celle que vous aimez.
            </p>
            <ol className="steps reveal">
              {bespokeSteps.map((s) => (
                <li key={s.title}>
                  <div>
                    <strong>{s.title}</strong>
                    <span>{s.text}</span>
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/sur-mesure" className="btn btn--light reveal">
              Raconter mon histoire
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="display h2 reveal">Les collections</h2>
            </div>
            <Link href="/collections" className="link-underline reveal">
              Toutes les collections
            </Link>
          </div>
          <div className="collections-rail" data-rail>
            {collections.map((c, i) => (
              <Link
                key={c.handle}
                href={`/collections/${c.handle}`}
                className="collection-card reveal"
                style={{ ["--accent" as string]: c.accent, ["--d" as string]: `${Math.min(i, 3) * 110}ms` }}
              >
                <Media image={c.image} art={c.art} seed={c.handle} alt={c.title} sizes="(max-width: 900px) 72vw, 28vw" />
                <div>
                  <span className="collection-card__kicker">{c.kicker}</span>
                  <h3 className="collection-card__title">{c.title}</h3>
                </div>
              </Link>
            ))}
          </div>
          <div className="rail-nav" aria-label="Parcourir les collections">
            <div className="rail-nav__bar" data-rail-bar>
              <span />
            </div>
            <button type="button" className="rail-nav__btn" data-rail-prev aria-label="Collections précédentes">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M10 3 5 8l5 5" /></svg>
            </button>
            <button type="button" className="rail-nav__btn" data-rail-next aria-label="Collections suivantes">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="m6 3 5 5-5 5" /></svg>
            </button>
          </div>
        </div>
      </section>

      <section className="section section--cream">
        <div className="container">
          <div className="section-head section-head--center">
            <h2 className="display h2 reveal">
              Nos <em>coups de cœur</em>
            </h2>
          </div>
          <div className="product-grid">
            {best.map((p, i) => (
              <ProductCard key={p.handle} product={p} collectionTitle={colTitle(p.collection)} delay={i * 110} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container promises">
          {promises.map((p, i) => (
            <div className="promise reveal" key={p.title} style={{ ["--d" as string]: `${i * 100}ms` }}>
              <PromiseIcon name={p.icon} className="promise__icon" />
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section section--tight" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="display h3 reveal">{site.instagramHandle}</h2>
            </div>
            <a href={site.instagram} target="_blank" rel="noreferrer" className="link-underline reveal" style={{ display: "inline-flex", gap: 10, alignItems: "center" }}>
              <InstagramIcon size={16} /> Nous suivre
            </a>
          </div>
          <div className="insta-grid">
            {insta.map((p, i) => (
              <a key={p.handle} href={site.instagram} target="_blank" rel="noreferrer" className="reveal" style={{ ["--d" as string]: `${i * 70}ms` }} aria-label={`${p.title} sur Instagram`}>
                <Media image={p.images[0]} art={p.art} seed={`insta-${p.handle}`} alt={p.title} sizes="(max-width: 900px) 33vw, 17vw" />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--cream">
        <div className="container newsletter">
          <div>
            <h2 className="display h2 reveal" style={{ marginTop: 16 }}>
              Les nouveautés, <em>en avant-première</em>
            </h2>
          </div>
          <div className="reveal">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
