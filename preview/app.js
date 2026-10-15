// Aperçu statique du site Augustave Paris (une seule page HTML, navigation par #).
// Reprend le balisage et la feuille de style du site Next.js pour montrer le rendu
// sans serveur. Généré par preview/build.mjs : ne pas modifier index.html à la main.

(function () {
  const D = window.__DATA;
  const { catalog, site, nav, heroSlides, promises, bespokeSteps, infoPages, story, images, instagram = [] } = D;
  const FX = D.fx;
  const AT = D.atelier;
  const SH = D.share;
  const GA = D.analytics;
  const gaLine = (l) => GA.gaItem({ id: l.handle, name: l.title, variant: l.variant, price: l.price, quantity: l.qty });
  const gaCart = (lines) => ({ currency: "EUR", value: lines.reduce((n, l) => n + l.qty * l.price, 0), items: lines.map(gaLine) });
  // données de partage d'un bijou (lien direct vers sa fiche)
  const shareData = (p) => {
    const photo = img(`produits/${p.handle}-1`);
    const col = colBy(p.collection);
    return {
      handle: p.handle,
      title: p.title,
      price: price(p.price),
      collection: col ? "Collection " + col.title : "",
      url: location.origin + location.pathname + "#/produit/" + p.handle,
      image: photo ? new URL(photo, location.href).toString() : null,
      art: photo ? null : jewelSvg(p.art, { seed: p.handle }),
    };
  };
  // photos disponibles : "produits/collier-rouge-love-1" -> "images/produits/collier-rouge-love-1.jpg"
  const IMG = {};
  images.forEach((f) => (IMG[f.replace(/\.[a-z]+$/, "")] = "images/" + f));
  const img = (name) => IMG[name] || null;
  const MONO = D.mono;
  const LOGO = D.logo;
  const jewelSvg = D.jewelSvg;
  const app = document.getElementById("app");

  // ---------- Données (équivalent du fournisseur "mock") ----------
  const OPTIONS = {
    longueur: { name: "Longueur", values: ["40 cm", "45 cm", "50 cm"] },
    sautoir: { name: "Longueur", values: ["70 cm", "80 cm"] },
    "ras-de-cou": { name: "Longueur", values: ["36 cm", "38 cm", "40 cm"] },
    bracelet: { name: "Tour de poignet", values: ["S · 15 cm", "M · 17 cm", "L · 19 cm"] },
    unique: { name: "Taille", values: ["Taille unique"] },
  };
  // Repères de taille (même texte que app/produit/[handle]/page.tsx)
  const sizeGuide = (p) => {
    const list = p.variants.map((v) => v.title).filter((s) => !/unique/i.test(s)).join(", ");
    if (/poignet/i.test(p.optionName)) return `Tailles proposées : ${list}. Mesurez votre tour de poignet et ajoutez 1 à 2 cm pour un bracelet qui bouge joliment.`;
    if (/longueur/i.test(p.optionName) && list) return `Longueurs proposées : ${list}. Repères : 38 à 40 cm se porte au ras du cou, 45 cm à la naissance du décolleté, 70 cm et plus en sautoir.`;
    return "Taille unique, ajustée à la main dans notre atelier.";
  };
  const products = catalog.products.map((p) => {
    const base = OPTIONS[p.options] || OPTIONS.unique;
    const opt = p.tags.includes("piece-unique") ? { name: "Taille", values: ["Pièce unique"] } : p.sizes && p.sizes.length ? { name: base.name, values: p.sizes } : base;
    return { ...p, optionName: opt.name, variants: opt.values.map((v, i) => ({ id: `mock-${p.handle}-${i + 1}`, title: v, price: p.price })) };
  });
  const categories = catalog.categories;
  const collections = catalog.collections;
  const colBy = (h) => collections.find((c) => c.handle === h);
  const catBy = (h) => categories.find((c) => c.handle === h);

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const price = (n) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: Number.isInteger(n) ? 0 : 2 }).format(n);
  const L = (path) => "#" + path;
  const d = (ms) => `style="--d:${ms}ms"`;

  const ARROW = (s = 18) =>
    `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>`;
  const BAG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1.2 12H6.2L5 8Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>`;
  const INSTA = (s = 18) =>
    `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".6" fill="currentColor"/></svg>`;
  const PROMISE_ICONS = {
    hand: '<path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12m0-6.5V5a1.5 1.5 0 0 1 3 0v7m0-5.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.5A6.5 6.5 0 0 1 4 16l-1-3.5a1.5 1.5 0 0 1 2.7-1.2L8 14"/>',
    spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm6 12 .8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15Z"/>',
    box: '<path d="M3.5 8.5 12 4l8.5 4.5v7L12 20l-8.5-4.5v-7Zm0 0L12 13l8.5-4.5M12 13v7"/>',
    return: '<path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3"/>',
  };
  const promiseIcon = (n) =>
    `<svg class="promise__icon" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PROMISE_ICONS[n]}</svg>`;

  // ---------- Composants ----------
  const layer = (src, art, seed, variant, alt) =>
    src ? `<img src="${src}" alt="${esc(alt || "")}" loading="lazy">` : `<div class="media__layer">${art ? jewelSvg(art, { seed, variant }) : ""}</div>`;
  const media = (art, seed, { hover = false, cls = "", style = "", src = null, src2 = null, alt = "", parallax = 0 } = {}) => {
    const main = layer(src, art, seed, 0, alt);
    return (
      `<div class="media media--zoom ${cls}" ${style ? `style="${style}"` : ""}>` +
      (parallax ? `<div class="media__px" data-parallax="${parallax}">${main}</div>` : main) +
      (hover ? (src2 ? layer(src2, null, seed, 1, alt) : !src && art ? layer(null, art, seed, 1) : "") : "") +
      `</div>`
    );
  };

  const BADGES = { "piece-unique": "Pièce unique", nouveau: "Nouveau", "edition-limitee": "Édition limitée", "best-seller": "Coup de cœur" };

  const productCard = (p, delay = 0) => {
    const badge = Object.keys(BADGES).find((t) => p.tags.includes(t));
    const single = p.variants.length === 1;
    return `<article class="product-card reveal" ${d(delay)}>
      <div class="product-card__media">
        ${badge ? `<span class="product-card__badge">${BADGES[badge]}</span>` : ""}
        <a href="${L("/produit/" + p.handle)}" aria-label="${esc(p.title)}">${media(p.art, p.handle, { hover: true, src: img("produits/" + p.handle + "-1"), src2: img("produits/" + p.handle + "-2"), alt: p.title })}</a>
        <button class="product-card__quick" data-quick="${p.handle}">${single ? "Ajouter au panier" : "Choisir ma taille"}</button>
      </div>
      <a href="${L("/produit/" + p.handle)}" class="product-card__info">
        <div><span class="product-card__collection">${esc(colBy(p.collection)?.title || "")}</span><h3 class="product-card__title">${esc(p.title)}</h3></div>
        <span class="product-card__price">${price(p.price)}</span>
      </a>
    </article>`;
  };

  const sectionHead = (eyebrow, title, link) => `<div class="section-head">
      <div><h2 class="display h2 reveal">${title}</h2></div>
      ${link ? `<a href="${L(link[0])}" class="link-underline reveal">${link[1]}</a>` : ""}
    </div>`;

  const steps = (style = "") =>
    `<ol class="steps reveal" ${style}>${bespokeSteps
      .map((s) => `<li ${style ? 'style="border-color:var(--line)"' : ""}><div><strong>${esc(s.title)}</strong><span>${esc(s.text)}</span></div></li>`)
      .join("")}</ol>`;

  const promisesBlock = () =>
    `<section class="section section--tight"><div class="container promises">${promises
      .map((p, i) => `<div class="promise reveal" ${d(i * 100)}>${promiseIcon(p.icon)}<h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div>`)
      .join("")}</div></section>`;

  const collectionCard = (c, i, h = "h3") => `<a href="${L("/collections/" + c.handle)}" class="collection-card reveal" style="--accent:${c.accent};--d:${Math.min(i % 4, 3) * 110}ms">
      ${media(c.art, c.handle, { src: img("collections/" + c.handle), alt: c.title })}
      <div><span class="collection-card__kicker">${esc(c.kicker)}</span><${h} class="collection-card__title">${esc(c.title)}</${h}></div>
    </a>`;

  // ---------- Pages ----------
  let heroTimer = null;

  function manifestoBlock(kicker, withCta) {
    return `<section class="manifesto" ${withCta ? 'id="histoire"' : ""}>
      <img class="manifesto__mono" src="${MONO}" alt="" data-parallax="0.2">
      <div class="container manifesto__inner">
        <p class="words" data-words>${esc(story.manifesto)}</p>
        ${
          withCta
            ? `<div class="manifesto__meta reveal"><a href="${L("/maison")}" class="btn">Rencontrer la créatrice</a></div>`
            : ""
        }
      </div></section>`;
  }

  function chaptersBlock() {
    return `<section class="chapters" data-hscroll aria-label="Ce qui inspire la créatrice"><div class="chapters__sticky">
      <div class="chapters__track" data-hscroll-track>
        <div class="chapters__intro">
          <h2 class="display h2">Cinq sources <em class="shimmer">d'inspiration</em></h2>
          <p class="lead" style="color:rgba(250,246,240,.7)">Des plages bretonnes aux terres rouges de l'Ouest, chaque collection est née d'un lieu, d'une lumière ou d'un lien.</p>
          <span class="chapters__hint">Faites défiler</span>
        </div>
        ${story.chapters
          .map((c) => {
            const col = colBy(c.collection);
            return `<article class="chapter" data-panel>
            <span class="chapter__num" aria-hidden="true">${c.n}</span>
            <div class="chapter__media">${media(col?.art, "ch-" + c.n, { src: img(c.image), alt: c.title })}</div>
            <div class="chapter__body">
              <span class="eyebrow">${esc(c.kicker)}</span>
              <h3 class="display h2">${esc(c.title)}</h3>
              <p>${esc(c.text)}</p>
              ${col ? `<a href="${L("/collections/" + col.handle)}" class="link-underline chapter__link" data-label="${esc(col.title)}">Collection ${esc(col.title)}</a>` : ""}
            </div>
          </article>`;
          })
          .join("")}
      </div>
      <div class="chapters__bar" aria-hidden="true"><span data-hscroll-bar></span></div>
    </div></section>`;
  }

  // vignette « Vu sur Instagram » : mène au bijou associé, sinon à la publication
  const instaHref = (link) => (!link ? null : link.startsWith("collections/") ? L("/" + link) : L("/produit/" + link));
  function instaTile(post, i, toJewel) {
    const href = toJewel ? instaHref(post.link) : null;
    const who = post.username ? "@" + post.username : site.instagramHandle;
    const body = `${media(null, "insta-" + post.id, { src: img(post.image), alt: "Photo de " + who })}<span class="insta-grid__by">${esc(who)}${href ? "<em>Voir le bijou</em>" : ""}</span>`;
    return href
      ? `<a href="${href}" class="reveal" ${d(i * 70)} data-insta="${esc(post.id)}">${body}</a>`
      : `<a href="${esc(post.permalink)}" target="_blank" rel="noreferrer" class="reveal" ${d(i * 70)} data-insta="${esc(post.id)}">${body}</a>`;
  }

  function home() {
    const fall = products.filter((p) => p.collection === "edition-fall" || p.tags.includes("nouveau")).slice(0, 4);
    const best = products.filter((p) => p.tags.includes("best-seller")).slice(0, 4);
    const insta = [...products.filter((p) => img("produits/" + p.handle + "-1")), ...products.filter((p) => !img("produits/" + p.handle + "-1"))].slice(0, 6);
    const slides = heroSlides
      .map((s, k) => {
        const art = colBy(s.collection)?.art;
        if (img(s.image)) return `<div class="hero__slide ${k === 0 ? "is-active" : ""}"><img src="${img(s.image)}" alt="${esc(s.label)}"></div>`;
        return `<div class="hero__slide ${k === 0 ? "is-active" : ""}"><div class="hero-art" style="background:radial-gradient(120% 90% at 70% 30%, #1c3457 0%, #0e2340 45%, #091931 100%)">
          <div class="hero-art__glow"></div>
          ${art ? `<div class="hero-art__jewel media__layer">${jewelSvg(art, { variant: 1 })}</div>` : ""}
          <img class="hero-art__mono" src="${MONO}" alt="">
        </div></div>`;
      })
      .join("");
    return `
    <section class="hero" data-spotlight>
      <div class="hero__media" aria-hidden="true">${slides}<div class="hero__veil"></div></div>
      <div class="hero__dots">${heroSlides.map((s, k) => `<button class="hero__dot ${k === 0 ? "is-active" : ""}" data-slide="${k}" aria-label="${esc(s.label)}"></button>`).join("")}</div>
      <div class="container hero__content">
        <div>
          <h1 class="display h1 hero__title">
            <span class="line"><span style="--i:0">Bijoux</span></span>
            <span class="line"><span style="--i:1"><em class="shimmer">façonnés</em> à la</span></span>
            <span class="line"><span style="--i:2">main, à Paris</span></span>
          </h1>
        </div>
        <div class="hero__side">
          <p>Des plages de Bretagne aux grands espaces de l'Ouest, une créatrice assemble perle après perle des bijoux qui racontent une histoire.</p>
          <div class="hero__ctas"><a href="#histoire" class="btn btn--light" data-scroll="histoire">Notre histoire</a><a href="${L("/boutique")}" class="btn btn--light">La boutique</a></div>
        </div>
      </div>
      <div class="hero__index"><span>Porté : collection <span data-hero-label>${esc(heroSlides[0].label)}</span></span></div>
    </section>

    ${manifestoBlock("L'histoire d'Augustave", true)}
    ${chaptersBlock()}

    <div class="marquee" aria-label="Nos collections"><div class="marquee__track">
      ${[0, 1].map((k) => collections.map((c) => `<a href="${L("/collections/" + c.handle)}" class="marquee__item" ${k ? 'aria-hidden="true" tabindex="-1"' : ""}>${esc(c.title)}</a>`).join("")).join("")}
    </div></div>


    <section class="section section--tight"><div class="container">
      ${sectionHead("Trouver son bijou", "Les catégories", ["/boutique", "Tout voir"])}
      <div class="cat-grid">${categories
        .map(
          (c, i) => `<a href="${L("/boutique/" + c.handle)}" class="cat-card reveal" ${d((i % 3) * 120)}>
          ${media(c.art, c.handle, { src: img("categories/" + c.handle), alt: c.title })}<div class="cat-card__veil"></div>
          <div class="cat-card__body"><div><span class="eyebrow">${esc(c.tagline)}</span><h3 class="cat-card__title">${esc(c.title)}</h3></div><span class="cat-card__arrow">${ARROW()}</span></div>
        </a>`,
        )
        .join("")}</div>
    </div></section>

    <section class="section section--cream"><div class="container">
      ${sectionHead("Pour briller en automne", "Édition <em>Fall</em> & nouveautés", ["/collections/edition-fall", "Voir l'édition"])}
      <div class="product-grid">${fall.map((p, i) => productCard(p, i * 110)).join("")}</div>
    </div></section>

    <section class="section section--navy"><div class="container split">
      <div class="split__media">
        <div class="reveal reveal--mask">${media(colBy("rouge-love").art, "bespoke", { src: img("accueil/sur-mesure"), parallax: 0.12 })}</div>
        ${media(colBy("la-nacree").art, "bespoke-2", { cls: "media--small reveal", style: "--d:400ms", src: img("accueil/sur-mesure-2") })}
      </div>
      <div class="split__body">
        <h2 class="display h2 reveal">Créons <em>ensemble</em> votre collier sur-mesure</h2>
        <p class="lead reveal">Un prénom, une date, les couleurs d'un souvenir. Nous imaginons avec vous une pièce unique, pensée pour vous ou pour celle que vous aimez.</p>
        ${steps()}
        <div class="cta-row reveal"><a href="${L("/atelier")}" class="btn btn--light">Créer mon collier</a><a href="${L("/sur-mesure")}" class="btn btn--light">Raconter mon histoire</a></div>
      </div>
    </div></section>

    <section class="section"><div class="container">
      ${sectionHead("Univers", "Les collections", ["/collections", "Toutes les collections"])}
      <div class="collections-rail" data-rail>${collections.map((c, i) => collectionCard(c, i)).join("")}</div>
      <div class="rail-nav" aria-label="Parcourir les collections"><div class="rail-nav__bar" data-rail-bar><span></span></div><button type="button" class="rail-nav__btn" data-rail-prev aria-label="Collections précédentes"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M10 3 5 8l5 5"/></svg></button><button type="button" class="rail-nav__btn" data-rail-next aria-label="Collections suivantes"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><path d="m6 3 5 5-5 5"/></svg></button></div>
    </div></section>

    <section class="section section--cream"><div class="container">
      <div class="section-head section-head--center"><h2 class="display h2 reveal">Nos <em>coups de cœur</em></h2></div>
      <div class="product-grid">${best.map((p, i) => productCard(p, i * 110)).join("")}</div>
    </div></section>

    ${promisesBlock()}

    <section class="section section--tight" style="padding-top:0"><div class="container">
      <div class="section-head">
        <div><h2 class="display h3 reveal">Vu sur Instagram</h2><p class="section-sub reveal">Vous les portez. Identifiez ${esc(site.instagramHandle)} sur vos photos pour apparaître ici.</p></div>
        <a href="${site.instagram}" target="_blank" rel="noreferrer" class="link-underline reveal" style="display:inline-flex;gap:10px;align-items:center">${INSTA(16)} Nous suivre</a>
      </div>
      <div class="insta-grid">${
        instagram.length
          ? instagram.slice(0, 6).map((post, i) => instaTile(post, i, true)).join("")
          : insta.map((p, i) => `<a href="${L("/produit/" + p.handle)}" class="reveal" ${d(i * 70)} aria-label="${esc(p.title)}">${media(p.art, "insta-" + p.handle, { src: img("produits/" + p.handle + "-1"), alt: p.title })}</a>`).join("")
      }</div>
    </div></section>

    <section class="section section--cream"><div class="container newsletter">
      <div><h2 class="display h2 reveal">Les nouveautés, <em>en avant-première</em></h2></div>
      <div class="reveal" id="newsletter">
        <form data-form="newsletter"><div class="field-inline"><input type="email" required placeholder="Votre adresse e-mail" aria-label="Adresse e-mail"><button type="submit">S'inscrire</button></div>
        <p class="form-note">Nouveautés, éditions limitées et coulisses de l'atelier. Désinscription en un clic.</p></form>
      </div>
    </div></section>`;
  }

  function shop(category, tri) {
    const cur = category ? catBy(category) : null;
    if (category && !cur) return notFound();
    let list = products.filter((p) => !category || p.category === category);
    if (tri === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (tri === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (tri === "new") list = [...list].sort((a, b) => +b.tags.includes("nouveau") - +a.tags.includes("nouveau"));
    const qs = tri && tri !== "featured" ? `?tri=${tri}` : "";
    return `
    <section class="container page-hero">
      <nav class="breadcrumb"><a href="${L("/")}">Accueil</a><span aria-hidden="true">/</span>${
        cur ? `<a href="${L("/boutique")}">Boutique</a><span aria-hidden="true">/</span><span>${esc(cur.title)}</span>` : "<span>Boutique</span>"
      }</nav>
      <h1 class="display h1">${cur ? esc(cur.title) : "La <em>boutique</em>"}</h1>
      <p class="lead">${cur ? esc(cur.description) : "Tous nos bijoux d'auteur, façonnés à la main à Paris, en petites séries."}</p>
    </section>
    <div class="filters"><div class="container filters__inner">
      <nav class="chips" aria-label="Catégories">
        <a href="${L("/boutique" + qs)}" class="chip" ${!cur ? 'aria-current="true"' : ""}>Tout</a>
        ${categories.map((c) => `<a href="${L("/boutique/" + c.handle + qs)}" class="chip" ${c.handle === category ? 'aria-current="true"' : ""}>${esc(c.title)}</a>`).join("")}
      </nav>
      <label class="sort"><span>Trier</span><select data-sort="${category || ""}">
        ${[["featured", "Sélection"], ["new", "Nouveautés"], ["price-asc", "Prix croissant"], ["price-desc", "Prix décroissant"]]
          .map(([v, l]) => `<option value="${v}" ${v === (tri || "featured") ? "selected" : ""}>${l}</option>`)
          .join("")}
      </select></label>
    </div></div>
    <section class="container" style="padding-bottom:clamp(80px,10vw,140px)">
      <p class="result-count">${list.length} ${list.length > 1 ? "bijoux" : "bijou"}</p>
      <div class="product-grid">${list.map((p, i) => productCard(p, (i % 4) * 90)).join("")}</div>
    </section>`;
  }

  function collectionsPage() {
    return `
    <section class="container page-hero"><h1 class="display h1">Les <em>collections</em></h1>
      <p class="lead">Chaque collection est une histoire : une couleur, un paysage, une émotion.</p></section>
    <section class="container" style="padding-bottom:clamp(80px,10vw,140px)"><div class="product-grid product-grid--3">${collections.map((c, i) => collectionCard(c, i, "h2")).join("")}</div></section>`;
  }

  function collectionPage(handle) {
    const c = colBy(handle);
    if (!c) return notFound();
    const list = products.filter((p) => p.collection === handle);
    return `
    <section class="page-hero page-hero--collection" style="--accent:${c.accent}"><div class="collection-hero">
      <div class="collection-hero__body">
        <nav class="breadcrumb"><a href="${L("/")}">Accueil</a><span aria-hidden="true">/</span><a href="${L("/collections")}">Collections</a></nav>
        <span class="eyebrow"><span class="dot"></span>${esc(c.kicker)}</span>
        <h1 class="display h1">${esc(c.title)}</h1>
        <p class="lead">${esc(c.description)}</p>
        <p class="result-count" style="margin:0">${list.length} ${list.length > 1 ? "pièces" : "pièce"}</p>
      </div>
      <div class="reveal reveal--mask" style="display:grid">${media(c.art, "hero-" + c.handle, { src: img("collections/" + c.handle), alt: c.title })}</div>
    </div></section>
    <section class="section"><div class="container"><div class="product-grid">${list.map((p, i) => productCard(p, (i % 4) * 90)).join("")}</div></div></section>
    <section class="section section--cream section--tight"><div class="container">
      <div class="section-head"><h2 class="display h3 reveal">Explorer d'autres collections</h2></div>
      <div class="chips" style="flex-wrap:wrap">${collections
        .filter((o) => o.handle !== handle)
        .map((o) => `<a href="${L("/collections/" + o.handle)}" class="chip">${esc(o.title)}</a>`)
        .join("")}</div>
    </div></section>`;
  }

  function productPage(handle) {
    const p = products.find((x) => x.handle === handle);
    if (!p) return notFound();
    const col = colBy(p.collection);
    const cat = catBy(p.category);
    const related = products.filter((x) => x.collection === p.collection && x.handle !== handle).slice(0, 4);
    const worn = instagram.filter((post) => post.link === handle);
    const photos = [1, 2, 3, 4].map((n) => img("produits/" + p.handle + "-" + n)).filter(Boolean);
    const gallery = photos.length ? photos.map((src) => media(p.art, p.handle, { src, alt: p.title })) : [
      media(p.art, p.handle),
      media({ ...p.art, bg: [p.art.bg[1], p.art.bg[0]] }, p.handle + "-b"),
      `<div class="media"><div class="media__layer" style="display:grid;place-items:center;background:var(--navy)"><img src="${MONO}" alt="" style="width:46%"></div></div>`,
    ];
    const multi = p.variants.length > 1;
    return `
    <div class="container pdp">
      <div class="pdp__gallery">${gallery.map((g, i) => `<div class="reveal" style="--d:${i * 120}ms;${i === 0 ? "grid-column:1/-1" : ""}">${g}</div>`).join("")}</div>
      <div class="pdp__info">
        <nav class="breadcrumb"><a href="${L("/boutique")}">Boutique</a>${cat ? `<span aria-hidden="true">/</span><a href="${L("/boutique/" + cat.handle)}">${esc(cat.title)}</a>` : ""}</nav>
        <div>${col ? `<a href="${L("/collections/" + col.handle)}" class="eyebrow" style="display:inline-block;margin-bottom:14px">Collection ${esc(col.title)}</a>` : ""}
          <h1 class="display pdp__title">${esc(p.title)}</h1></div>
        <p class="pdp__excerpt">${esc(p.excerpt)}</p>
        <div style="display:grid;gap:22px" data-pdp="${p.handle}">
          <div class="pdp__price">${price(p.price)}${p.compareAtPrice ? `<s style="margin-left:12px;color:var(--muted);font-size:16px">${price(p.compareAtPrice)}</s>` : ""}</div>
          ${
            multi
              ? `<fieldset class="option-group"><legend>${esc(p.optionName)} : <span data-variant-label style="text-transform:none;letter-spacing:0">${esc(p.variants[0].title)}</span></legend>
            <div class="option-values">${p.variants.map((v, i) => `<button type="button" class="option-value" data-variant="${i}" aria-pressed="${i === 0}">${esc(v.title)}</button>`).join("")}</div></fieldset>`
              : ""
          }
          <div class="buy-row">
            <div class="qty"><button type="button" data-qty="-1" aria-label="Diminuer">−</button><span data-qty-value>1</span><button type="button" data-qty="1" aria-label="Augmenter">+</button></div>
            <button type="button" class="btn btn--solid" data-add>Ajouter au panier</button>
          </div>
        </div>
        <ul class="reassurance"><li>Fait main dans notre atelier parisien</li><li>Livraison offerte dès ${site.freeShippingFrom} €, dans un écrin Augustave</li><li>Retours gratuits sous ${site.returnsDays} jours</li>${site.welcome ? `<li>−${site.welcome.percent} % sur votre première commande, déduits au paiement</li>` : ""}<li>Pour offrir : écrin cadeau et petit mot écrit à la main, à cocher dans le panier</li></ul>
        <div class="share" data-share="${p.handle}"><span class="share__label">Partager</span><div class="share__row">
          <button type="button" class="share__btn share__btn--main" data-share-story>En story Instagram</button>
          <button type="button" class="share__btn" data-share-link>Envoyer le lien</button>
          <a class="share__btn" data-share-wa target="_blank" rel="noreferrer" href="${esc(SH.shareUrls(shareData(p)).whatsapp)}">WhatsApp</a>
          <a class="share__btn" data-share-pin target="_blank" rel="noreferrer" href="${esc(SH.shareUrls(shareData(p)).pinterest)}">Pinterest</a>
          <button type="button" class="share__btn" data-share-copy>Copier le lien</button>
        </div><p class="share__msg" aria-live="polite"></p></div>
        <div class="accordion">
          <details open><summary>Description</summary><div class="accordion__body"><p>${esc(p.description)}</p></div></details>
          <details><summary>Taille et dimensions</summary><div class="accordion__body">${p.tags.includes("piece-unique") ? "<p>Pièce unique : elle ne sera pas refaite à l'identique. Elle peut néanmoins inspirer une création sur-mesure.</p>" : ""}${p.dimensions ? `<p>${esc(p.dimensions)}</p>` : ""}<p>${esc(sizeGuide(p))}</p></div></details>
          <details><summary>Matières</summary><div class="accordion__body"><p>${esc(p.materials)}</p><p>Chaque perle étant posée à la main, de légères variations rendent votre bijou unique.</p></div></details>
          <details><summary>Entretien</summary><div class="accordion__body"><p>Retirez votre bijou avant la douche, la baignade ou le sport, et évitez le contact avec le parfum. Rangez-le à plat dans son écrin.</p><a href="${L("/infos/entretien")}" class="link-underline">Conseils d'entretien</a></div></details>
          <details><summary>Livraison & retours</summary><div class="accordion__body"><p>Expédition sous 2 à 3 jours ouvrés. Livraison offerte dès ${site.freeShippingFrom} €. Retours sous ${site.returnsDays} jours.</p></div></details>
        </div>
      </div>
    </div>
    ${
      worn.length
        ? `<section class="section section--tight"><div class="container"><div class="section-head"><div><h2 class="display h3 reveal">Porté par vous</h2></div><a href="${site.instagram}" target="_blank" rel="noreferrer" class="link-underline reveal">${esc(site.instagramHandle)}</a></div><div class="insta-grid">${worn.slice(0, 6).map((post, i) => instaTile(post, i, false)).join("")}</div></div></section>`
        : ""
    }
    ${
      related.length
        ? `<section class="section section--cream"><div class="container">${sectionHead("Dans la même collection", esc(col.title))}<div class="product-grid">${related.map((r, i) => productCard(r, i * 90)).join("")}</div></div></section>`
        : ""
    }`;
  }

  // ---------- Atelier ----------
  let creation = null; // code de la création envoyée depuis l'atelier
  let atelierCleanup = null;
  const creationNote = () => {
    const dsg = creation && AT.decodeDesign(creation);
    return dsg
      ? `<div class="creation-note"><strong>Votre création de l'atelier</strong><span>${esc(AT.describeDesign(dsg))}</span><a class="link-underline" href="${L("/atelier?d=" + creation)}">La modifier</a></div>`
      : "";
  };
  function atelierPage() {
    return `
    <section class="container page-hero"><h1 class="display h1">L'atelier</h1>
      <p class="lead">Choisissez le fil, la longueur, vos perles et un pendentif : votre collier se compose sous vos yeux. Commandez-le directement, la créatrice le réalise à la main.</p></section>
    <section class="container atelier-page"><div data-atelier></div></section>
    <section class="container atelier-more"><p>Un prénom à graver, une pierre de naissance, des perles qui ne sont pas ici ? <button type="button" class="link-underline" data-goto-demande>Racontez votre histoire à la créatrice</button>, elle imagine la pièce avec vous.</p></section>`;
  }
  function mountAtelierPage(params) {
    const el = app.querySelector("[data-atelier]");
    if (!el) return;
    // la création suit l'adresse (#/atelier?d=…) sans ajouter d'entrée d'historique
    const setUrl = (code) => {
      if (code) setHash("/atelier?d=" + code, true);
    };
    atelierCleanup = AT.mountAtelier(el, {
      initial: AT.decodeDesign(params.get("d")) || undefined,
      poseModel: new URL("models/pose_landmarker_lite.task", location.href).toString(),
      onChange: (code) => {
        current = "/atelier?d=" + code;
        setUrl(code);
      },
      onOrder: ({ code, text, price: amount, thumb }) => {
        const id = "atelier:" + code;
        const ex = cart.find((l) => l.id === id);
        if (ex) ex.qty += 1;
        else cart.push({ id, handle: "atelier", title: "Ma création de l'atelier", variant: text, price: amount, qty: 1, thumb, href: "/atelier?d=" + code });
        GA.track("add_to_cart", { currency: "EUR", value: amount, items: [GA.gaItem({ id: "creation-atelier", name: "Ma création de l'atelier", variant: code, price: amount })] });
        save();
        renderCart(true);
        openCart(true);
        toast("Votre création a rejoint le panier");
      },
      onSend: (code) => {
        creation = code;
        FX.curtainCover("Votre histoire", () => {
          current = "/sur-mesure";
          setHash(current);
          route();
          FX.curtainReveal();
          const form = document.getElementById("demande");
          if (form) setTimeout(() => window.scrollTo({ top: form.getBoundingClientRect().top + scrollY - 40, behavior: "smooth" }), 400);
        });
      },
    });
  }

  function bespoke() {
    return `
    <section class="container page-hero"><h1 class="display h1">Édition <em>Votre Histoire</em></h1>
      <p class="lead">On crée ensemble votre collier sur-mesure. Une pièce unique, imaginée à partir de ce qui compte pour vous, et façonnée à la main dans notre atelier.</p></section>
    <section class="container paths" aria-label="Deux façons de créer votre bijou">
      <div class="path-card reveal"><span class="path-card__kicker">Tout de suite, en ligne</span><h2 class="display h3">Composer moi-même</h2>
        <p>Dans l'atelier en ligne, vous choisissez le fil, la longueur, les perles et le pendentif. Le collier se dessine sous vos yeux, vous l'essayez sur votre photo et vous le commandez aussitôt.</p>
        <ul><li>Prix affiché en direct, de 45 à 250 €</li><li>Commande immédiate, expédié sous 2 à 3 semaines</li></ul>
        <a href="${L("/atelier")}" class="btn btn--solid">Ouvrir l'atelier</a></div>
      <div class="path-card path-card--navy reveal" style="--d:120ms"><span class="path-card__kicker">Pièce unique, avec la créatrice</span><h2 class="display h3">Raconter mon histoire</h2>
        <p>Pour ce que l'atelier ne sait pas faire : un prénom ou une date, une pierre de naissance, des perles choisies rien que pour vous, un bijou de famille à transformer, un cadeau pour une occasion précise.</p>
        <ul><li>Une première proposition sous 48 h, avec croquis</li><li>À partir de 90 €, façonné en 2 à 3 semaines</li></ul>
        <button type="button" class="btn btn--light" data-scroll="demande">Écrire à la créatrice</button></div>
    </section>
    <section class="section"><div class="container split">
      <div class="split__media"><div class="reveal reveal--mask">${media(colBy("la-nacree").art, "sm-1", { src: img("sur-mesure/atelier"), parallax: 0.1 })}</div></div>
      <div class="split__body">
        <h2 class="display h2 reveal">Avec la créatrice, <em>en trois étapes</em></h2>
        ${steps('style="color:var(--navy)"')}
        <p class="lead reveal" style="font-size:15px">Délai de création : 2 à 3 semaines. Tarif à partir de 90 €, selon les perles et pendentifs choisis.</p>
        <button type="button" class="btn btn--solid reveal" style="justify-self:start" data-scroll="demande">Raconter mon histoire</button>
      </div>
    </div></section>
    <section class="section section--navy" id="demande"><div class="container split">
      <div class="split__body"><h2 class="display h2 reveal">Racontez-nous <em>votre histoire</em></h2>
        <p class="lead reveal">Nous revenons vers vous sous 48 h avec une première proposition.</p></div>
      <div class="reveal"><form class="form" data-form="bespoke">
        <div class="form__row"><div class="field"><label for="prenom">Prénom</label><input id="prenom" name="prenom" required></div>
          <div class="field"><label for="email">E-mail</label><input id="email" name="email" type="email" required></div></div>
        <div class="form__row"><div class="field"><label for="type">Bijou souhaité</label><select id="type" name="type"><option>Collier</option><option>Sautoir</option><option>Ras-de-cou</option><option>Bracelet</option><option>Boucles d'oreilles</option></select></div>
          <div class="field"><label for="occasion">Occasion</label><select id="occasion" name="occasion"><option>Pour moi</option><option>Un cadeau</option><option>Une naissance</option><option>Un mariage</option><option>Un anniversaire</option></select></div></div>
        ${creationNote()}
        <div class="field"><label for="histoire">Votre histoire</label><textarea id="histoire" name="histoire" ${creation ? "" : "required"} placeholder="${creation ? "Un prénom, une date, pour qui est ce collier… dites-nous en un peu plus." : "Couleurs, prénom, date, souvenir… racontez-nous."}"></textarea></div>
        <button class="btn btn--light" type="submit" style="justify-self:start">Envoyer ma demande</button>
      </form></div>
    </div></section>`;
  }

  function maison() {
    const cr = story.creator;
    const portrait = img("maison/fondatrice");
    const atelier = img("maison/atelier");
    return `
    <section class="maison-hero" data-spotlight>
      <div class="maison-hero__media">${media(colBy("la-nacree").art, "mh", { src: img("accueil/hero-1"), parallax: 0.18 })}</div>
      <div class="maison-hero__veil"></div>
      <div class="container maison-hero__content">
        <h1 class="display h1 hero__title" style="max-width:14ch">
          <span class="line"><span style="--i:0">Des bijoux qui</span></span>
          <span class="line"><span style="--i:1"><em class="shimmer">racontent</em> une histoire</span></span>
        </h1>
        <p class="lead" style="animation:fade-up 1.4s .9s var(--ease) both">Une créatrice, ses mains, et des fragments de nature rapportés de la mer ou de la route.</p>
      </div>
    </section>
    ${manifestoBlock("Manifeste", false)}
    <section class="section section--cream"><div class="container creator">
      <div class="creator__portrait reveal reveal--mask">${media(colBy("la-nacree").art, "creatrice", { src: portrait || atelier, parallax: 0.1 })}${portrait ? "" : '<span class="creator__portrait-note">La table de l\'atelier</span>'}</div>
      <div class="creator__body">
        <h2 class="display h2 reveal">${esc(cr.title)}</h2>
        ${cr.paragraphs.map((t, i) => `<p class="lead reveal" style="margin:0;--d:${i * 120}ms">${esc(t)}</p>`).join("")}
        <blockquote class="creator__quote reveal">« ${esc(cr.quote)} »<cite>${esc(cr.signature)}</cite></blockquote>
      </div>
    </div></section>
    ${chaptersBlock()}
    <section class="section section--navy"><div class="container">
      <div class="section-head">
        <div><h2 class="display h2 reveal">De la perle <em>au bijou</em></h2></div>
        <p class="lead reveal" style="max-width:420px;margin:0">Chaque création passe par les mêmes mains, du premier coup de cœur à l'écrin.</p>
      </div>
      <div class="gesture">${story.gesture.map((g, i) => `<div class="gesture__step reveal" ${d(i * 120)}><span>0${i + 1}</span><h3>${esc(g.title)}</h3><p>${esc(g.text)}</p></div>`).join("")}</div>
    </div></section>
    <section class="section"><div class="container">
      <div class="section-head section-head--center"><h2 class="display h2 reveal">Entre <em>mer</em> et <em>lumière</em></h2></div>
      <div class="mosaic">${[
        ["maison/lumiere", "La Nacrée", "la-nacree"],
        ["maison/grands-espaces", "Texas Stones", "texas-stones"],
        ["maison/geste", "Bronze", "bronze"],
        ["maison/ocean", "Grey Shades", "grey-shades"],
      ]
        .map(
          ([im, label, col], i) =>
            `<figure class="reveal" ${d(i * 100)}><a href="${L("/collections/" + col)}" data-label="${label}">${media(colBy(col).art, "mo-" + i, { src: img(im), alt: label, parallax: 0.08, style: i === 3 ? "aspect-ratio:16/10" : "" })}</a><figcaption>${label}</figcaption></figure>`,
        )
        .join("")}</div>
    </div></section>
    <section class="section section--cream"><div class="container">
      <div class="section-head"><div><h2 class="display h2 reveal">Ce qui fait un Augustave</h2></div></div>
      <div class="signatures">${story.signatures.map((x, i) => `<div class="signature reveal" ${d(i * 100)}><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></div>`).join("")}</div>
    </div></section>
    <section class="section section--navy"><div class="container quote">
      <img class="quote__mark reveal" src="${MONO}" alt="">
      <blockquote class="reveal">Et si le prochain bijou racontait <em class="shimmer">votre histoire</em> ?</blockquote>
      <div class="reveal" style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">
        <a href="${L("/sur-mesure")}" class="btn btn--light">Créer mon collier sur-mesure</a>
        <a href="${L("/boutique")}" class="btn btn--light">Découvrir les bijoux</a>
      </div>
      <p class="form-note" style="opacity:.7">Une question ? Écrivez-nous à ${esc(site.email)} ou sur Instagram ${esc(site.instagramHandle)}.</p>
    </div></section>`;
  }

  function info(slug) {
    const p = infoPages[slug];
    if (!p) return notFound();
    return `<section class="container page-hero"><h1 class="display h2">${esc(p.title)}</h1><p class="lead">${esc(p.intro)}</p></section>
      <section class="container prose" style="padding-bottom:120px">${p.sections.map((s) => `<div class="reveal"><h2>${esc(s.h)}</h2>${s.p.map((t) => `<p>${esc(t)}</p>`).join("")}</div>`).join("")}</section>`;
  }

  const demo = () => `<section class="container page-hero" style="min-height:60vh;align-content:center">
      <img src="${MONO}" alt="" style="width:90px"><span class="eyebrow">Mode démonstration</span>
      <h1 class="display h2">Ici s'ouvrira le <em>paiement sécurisé</em></h1>
      <p class="lead">Une fois la boutique Shopify connectée, ce bouton redirige vers le paiement Shopify avec le contenu du panier.</p>
      <a href="${L("/boutique")}" class="btn">Retour à la boutique</a></section>`;

  const notFound = () => `<section class="container page-hero" style="min-height:60vh;align-content:center"><span class="eyebrow">Erreur 404</span>
      <h1 class="display h2">Cette page s'est <em>égarée</em></h1><a href="${L("/boutique")}" class="btn">Retour à la boutique</a></section>`;

  // ---------- Coquille (en-tête, pied de page, panier) ----------
  function shell() {
    const featured = collections.slice(0, 2);
    document.getElementById("shell-top").innerHTML = `
    <div class="preloader" aria-hidden="true"><div class="preloader__inner">
      <img class="preloader__mono" src="${MONO}" alt="">
      <div class="preloader__word">${"AUGUSTAVE".split("").map((l, i) => `<span style="--i:${i}">${l}</span>`).join("")}</div>
      <div class="preloader__line"></div>
    </div></div>
    <div class="curtain" aria-hidden="true"><div class="curtain__inner"><img src="${MONO}" alt=""><span class="curtain__label"></span></div></div>
    <div class="announce"><div class="announce__track">${[...site.announcements, site.announcements[0]].map((a) => `<div class="announce__item">${esc(a)}</div>`).join("")}</div></div>
    <header class="header" id="header"><div class="container header__inner">
      <nav class="header__nav" aria-label="Navigation principale">
        <button class="burger" id="burger" aria-label="Menu"><span></span><span></span></button>
        ${nav
          .map((item) =>
            item.mega
              ? `<div class="has-mega"><a href="${L(item.href)}" class="nav-link" data-nav="${item.href}">${item.label}</a>
            <div class="mega"><div class="container mega__inner">
              <div><p class="eyebrow mega__title">Catégories</p><ul class="mega__list"><li><a href="${L("/boutique")}">Tous les bijoux</a></li>${categories.map((c) => `<li><a href="${L("/boutique/" + c.handle)}">${esc(c.title)}</a></li>`).join("")}</ul></div>
              <div><p class="eyebrow mega__title">Collections</p><ul class="mega__list">${collections.map((c) => `<li><a href="${L("/collections/" + c.handle)}">${esc(c.title)}</a></li>`).join("")}</ul></div>
              <div class="mega__feature">${featured.map((c) => `<a href="${L("/collections/" + c.handle)}" class="mega__card">${media(c.art, c.handle, { src: img("collections/" + c.handle), alt: c.title })}<p>${esc(c.title)}</p></a>`).join("")}</div>
            </div></div></div>`
              : `<a href="${L(item.href)}" class="nav-link" data-nav="${item.href}">${item.label}</a>`,
          )
          .join("")}
      </nav>
      <a href="${L("/")}" class="brand" aria-label="Augustave Paris, accueil"><img class="brand__mark" src="${MONO}" alt=""><span class="brand__name">Augustave<small>Paris</small></span></a>
      <div class="header__nav header__nav--right">
        <a href="${site.instagram}" target="_blank" rel="noreferrer" class="nav-link nav-link--hide-sm" aria-label="Instagram">${INSTA()}</a>
        <button class="nav-link cart-btn" id="cart-btn" aria-label="Panier">${BAG}<span class="cart-btn__count" id="cart-count">0</span></button>
      </div>
    </div></header>
    <div class="mobile-menu" id="mobile-menu">
      <ul class="mobile-menu__list">${[{ href: "/", label: "Accueil" }, ...nav].map((n, i) => `<li><a href="${L(n.href)}" style="--i:${i}">${n.label}</a></li>`).join("")}</ul>
      <div><p class="eyebrow" style="color:var(--gold-light);opacity:.7">Catégories</p><div class="mobile-menu__sub">${categories.map((c) => `<a href="${L("/boutique/" + c.handle)}">${esc(c.title)}</a>`).join("")}</div></div>
      <a href="${site.instagram}" target="_blank" rel="noreferrer" class="mobile-menu__sub">${site.instagramHandle}</a>
    </div>`;

    document.getElementById("shell-bottom").innerHTML = `
    <footer class="footer"><div class="container">
      <div class="footer__top">
        <div><img class="footer__logo" src="${LOGO}" alt="Augustave Paris"><p style="max-width:320px;margin:0">${esc(site.baseline)}. Des bijoux façonnés à la main à Paris, en petites séries, pour raconter votre histoire.</p></div>
        <div><h4>Boutique</h4><ul>${categories.map((c) => `<li><a href="${L("/boutique/" + c.handle)}">${esc(c.title)}</a></li>`).join("")}<li><a href="${L("/sur-mesure")}">Sur-mesure</a></li></ul></div>
        <div><h4>Service client</h4><ul><li><a href="${L("/infos/livraison-retours")}">Livraison & retours</a></li><li><a href="${L("/infos/entretien")}">Entretien des bijoux</a></li><li><a href="mailto:${site.email}">${site.email}</a></li></ul></div>
        <div><h4>La Maison</h4><ul><li><a href="${L("/maison")}">Notre histoire</a></li><li><a href="${L("/collections")}">Collections</a></li><li><a href="${site.instagram}" target="_blank" rel="noreferrer">Instagram</a></li></ul></div>
      </div>
      <div class="footer__bottom"><span>© ${new Date().getFullYear()} Augustave Paris. Tous droits réservés.</span>
        <span style="display:flex;gap:20px;flex-wrap:wrap"><a href="${L("/infos/cgv")}">CGV</a><a href="${L("/infos/mentions-legales")}">Mentions légales</a><a href="${L("/infos/confidentialite")}">Confidentialité</a>${site.gaId ? '<a href="#cookies" data-cookies-open>Cookies</a>' : ""}</span></div>
      <p class="footer__word" aria-hidden="true">AUGUSTAVE</p>
    </div></footer>
    <div class="drawer-backdrop" id="backdrop"></div>
    <aside class="drawer" id="drawer" aria-label="Panier"></aside>
    <div class="toast" id="toast" role="status"></div>`;
  }

  // ---------- Panier ----------
  const KEY = "augustave-preview-cart";
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch (e) {
    cart = [];
  }
  let gift = null; // option cadeau : { message }
  try {
    gift = JSON.parse(localStorage.getItem(KEY + "-gift") || "null");
  } catch (e) {}
  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(cart));
      localStorage.setItem(KEY + "-gift", JSON.stringify(gift));
    } catch (e) {}
  };
  const giftBlock = () => `<div class="gift ${gift ? "is-on" : ""}">
      <label class="gift__toggle"><input type="checkbox" data-gift ${gift ? "checked" : ""}><span class="gift__box" aria-hidden="true"></span>
        <span><strong>C'est pour offrir</strong><small>Écrin cadeau et petit mot écrit à la main, offerts. Le prix n'apparaît pas dans le colis.</small></span></label>
      ${gift ? `<div class="gift__note"><label for="gift-message">Votre petit mot</label><textarea id="gift-message" data-gift-message maxlength="240" rows="3" placeholder="Joyeux anniversaire maman, avec tout notre amour…">${esc(gift.message)}</textarea><span class="gift__count">${gift.message.length} / 240</span></div>` : ""}
    </div>`;
  let toastTimer;

  function addToCart(p, vi, qty) {
    const v = p.variants[vi];
    const ex = cart.find((l) => l.id === v.id);
    if (ex) ex.qty += qty;
    else cart.push({ id: v.id, handle: p.handle, title: p.title, variant: v.title, price: v.price, qty });
    GA.track("add_to_cart", { currency: "EUR", value: v.price * qty, items: [GA.gaItem({ id: p.handle, name: p.title, category: p.category, collection: colBy(p.collection)?.title, variant: v.title, price: v.price, quantity: qty })] });
    save();
    renderCart(true);
    openCart(true);
  }

  function openCart(open) {
    if (open && !document.getElementById("drawer").classList.contains("is-open")) GA.track("view_cart", gaCart(cart));
    document.getElementById("drawer").classList.toggle("is-open", open);
    document.getElementById("backdrop").classList.toggle("is-open", open);
    document.body.classList.toggle("no-scroll", open);
  }

  function renderCart(bump) {
    const count = cart.reduce((n, l) => n + l.qty, 0);
    const subtotal = cart.reduce((n, l) => n + l.qty * l.price, 0);
    const countEl = document.getElementById("cart-count");
    countEl.textContent = count;
    if (bump) {
      countEl.classList.remove("bump");
      void countEl.offsetWidth;
      countEl.classList.add("bump");
    }
    const remaining = Math.max(0, site.freeShippingFrom - subtotal);
    const drawer = document.getElementById("drawer");
    drawer.innerHTML = `<div class="drawer__head"><h2>Votre panier</h2><button class="drawer__close" data-close>Fermer</button></div>${
      cart.length === 0
        ? `<div class="drawer__body"><div class="drawer__empty"><img src="${MONO}" alt=""><p class="lead">Votre panier attend son premier bijou.</p><a href="${L("/boutique")}" class="btn" data-close>Découvrir la boutique</a></div></div>`
        : `<div class="drawer__body">
          <div class="progress">${remaining > 0 ? `Plus que ${price(remaining)} pour profiter de la livraison offerte` : "La livraison vous est offerte"}
            <div class="progress__bar"><span style="width:${Math.min(100, (subtotal / site.freeShippingFrom) * 100)}%"></span></div></div>
          ${cart
            .map((l) => {
              const p = products.find((x) => x.handle === l.handle);
              const thumb = l.thumb ? `<div class="media"><img src="${l.thumb}" alt=""></div>` : media(p?.art, l.handle);
              return `<div class="line-item"><a href="${L(l.href || "/produit/" + l.handle)}" data-close>${thumb}</a>
              <div><h3>${esc(l.title)}</h3><p>${esc(l.variant)}</p>
                <div class="line-item__actions"><div class="qty"><button data-line="${l.id}" data-delta="-1">−</button><span>${l.qty}</span><button data-line="${l.id}" data-delta="1">+</button></div>
                <button class="line-item__remove" data-line="${l.id}" data-delta="-999">Retirer</button></div></div>
              <div class="line-item__price">${price(l.price * l.qty)}</div></div>`;
            })
            .join("")}
        </div>
        <div class="drawer__foot">${giftBlock()}<div class="drawer__total"><span>Sous-total</span><strong>${price(subtotal)}</strong></div>
          ${site.welcome ? `<p class="welcome-note">Première commande ? −${site.welcome.percent} % déduits automatiquement au paiement.</p>` : ""}
          <p class="form-note" style="margin:0">Taxes incluses. Frais de livraison calculés à l'étape suivante.</p>
          <a class="btn btn--solid btn--block" href="${L("/commande-demo")}" data-close data-checkout>Passer commande</a></div>`
    }`;
  }

  function toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-visible"), 2600);
  }

  // ---------- Fondus au défilement ----------
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      }),
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );
  const scanReveal = () => document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => io.observe(el));

  // ---------- Routeur ----------
  // Navigation interne (l'aperçu ne dépend pas de l'URL de la page hôte)
  // Chaque page a sa propre adresse (…/#/produit/collier-rouge-love) : partageable, et le bouton
  // « retour » du navigateur fonctionne.
  let current = "/";
  const setHash = (path, replace) => {
    try {
      const url = location.pathname + location.search + "#" + path;
      if (replace) history.replaceState(null, "", url);
      else history.pushState(null, "", url);
    } catch (e) {}
  };
  function go(path, label) {
    const next = path || "/";
    if (next === current) return;
    FX.curtainCover(label || "", () => {
      current = next;
      setHash(next);
      route();
      FX.curtainReveal();
    });
  }
  window.addEventListener("popstate", () => {
    const next = location.hash.startsWith("#/") ? decodeURI(location.hash.slice(1)) : "/";
    if (next === current) return;
    FX.curtainCover("", () => {
      current = next;
      route();
      FX.curtainReveal();
    });
  });
  let fxCleanup = null;

  function route() {
    const raw = current;
    const [path, query] = raw.split("?");
    const params = new URLSearchParams(query || "");
    const parts = path.split("/").filter(Boolean);
    let html;
    if (!parts.length) html = home();
    else if (parts[0] === "boutique") html = shop(parts[1], params.get("tri"));
    else if (parts[0] === "collections") html = parts[1] ? collectionPage(parts[1]) : collectionsPage();
    else if (parts[0] === "produit") html = productPage(parts[1]);
    else if (parts[0] === "sur-mesure") html = bespoke();
    else if (parts[0] === "atelier") html = atelierPage();
    else if (parts[0] === "maison") html = maison();
    else if (parts[0] === "infos") html = info(parts[1]);
    else if (parts[0] === "commande-demo") html = demo();
    else html = notFound();

    clearInterval(heroTimer);
    if (atelierCleanup) atelierCleanup();
    atelierCleanup = null;
    app.innerHTML = `<div class="page-enter">${html}</div>`;
    const isHome = !parts.length;
    const header = document.getElementById("header");
    header.classList.toggle("header--over-hero", isHome);
    document.querySelectorAll("[data-nav]").forEach((a) => (a.getAttribute("data-nav") === "/" + (parts[0] || "") ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
    document.getElementById("mobile-menu").classList.remove("is-open");
    document.getElementById("burger").classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    window.scrollTo({ top: 0, behavior: "instant" });
    onScroll();
    scanReveal();
    if (fxCleanup) fxCleanup();
    fxCleanup = FX.initPageFx(document);
    if (isHome) startHero();
    GA.trackPage(location.pathname + "#" + path);
    if (parts[0] === "produit") {
      const p = products.find((x) => x.handle === parts[1]);
      if (p) GA.track("view_item", { currency: "EUR", value: p.price, items: [GA.gaItem({ id: p.handle, name: p.title, category: p.category, collection: colBy(p.collection)?.title, price: p.price })] });
    }
    if (parts[0] === "atelier") mountAtelierPage(params);
  }

  function startHero(start = 0) {
    let i = start;
    const slides = app.querySelectorAll(".hero__slide");
    const dots = app.querySelectorAll(".hero__dot");
    const show = (k) => {
      slides.forEach((s, j) => s.classList.toggle("is-active", j === k));
      const n = app.querySelector("[data-hero-label]");
      if (n) n.textContent = heroSlides[k].label;
      dots.forEach((dot, j) => {
        dot.classList.remove("is-active");
        if (j === k) {
          void dot.offsetWidth;
          dot.classList.add("is-active");
        }
      });
    };
    show(i);
    clearInterval(heroTimer);
    heroTimer = setInterval(() => {
      i = (i + 1) % slides.length;
      show(i);
    }, 6000);
  }

  let lastY = 0;
  function onScroll() {
    const y = window.scrollY;
    const h = document.getElementById("header");
    h.classList.toggle("header--scrolled", y > 40);
    const hide = y > 400 && y > lastY + 4;
    if (hide) h.classList.add("header--hidden");
    else if (y < lastY - 4 || y < 400) h.classList.remove("header--hidden");
    lastY = y;
  }

  // ---------- Événements ----------
  document.addEventListener("click", (e) => {
    const t = e.target.closest("button, a");
    if (!t) return;
    const href = t.getAttribute("href");
    if (href && href.startsWith("#/")) {
      e.preventDefault();
      if (t.hasAttribute("data-checkout")) GA.track("begin_checkout", { ...gaCart(cart), ...(site.welcome ? { coupon: site.welcome.code } : {}) });
      if (t.hasAttribute("data-close")) openCart(false);
      return go(href.slice(1), t.dataset.label);
    }
    if (t.dataset.scroll) {
      e.preventDefault();
      const target = document.getElementById(t.dataset.scroll);
      if (target) window.scrollTo({ top: target.getBoundingClientRect().top + scrollY, behavior: "smooth" });
      return;
    }
    if (t.id === "cart-btn") return openCart(true);
    if (t.hasAttribute("data-goto-demande")) {
      go("/sur-mesure");
      setTimeout(() => {
        const form = document.getElementById("demande");
        if (form) window.scrollTo({ top: form.getBoundingClientRect().top + scrollY - 40, behavior: "smooth" });
      }, 1400);
      return;
    }
    if (t.id === "burger") {
      const open = !t.classList.contains("is-open");
      t.classList.toggle("is-open", open);
      document.getElementById("mobile-menu").classList.toggle("is-open", open);
      document.getElementById("header").classList.toggle("header--scrolled", open || window.scrollY > 40);
      document.body.classList.toggle("no-scroll", open);
      return;
    }
    if (t.hasAttribute("data-close")) openCart(false);
    if (t.dataset.slide) startHero(+t.dataset.slide);
    if (t.dataset.quick) {
      const p = products.find((x) => x.handle === t.dataset.quick);
      if (p.variants.length === 1) {
        addToCart(p, 0, 1);
        toast(`${p.title} a rejoint votre panier`);
      } else go("/produit/" + p.handle);
    }
    if (t.dataset.line) {
      const l = cart.find((x) => x.id === t.dataset.line);
      if (+t.dataset.delta < -1) GA.track("remove_from_cart", gaCart([l]));
      l.qty += +t.dataset.delta;
      cart = cart.filter((x) => x.qty > 0);
      save();
      renderCart();
    }
    const sh = t.closest("[data-share]");
    if (sh && t.tagName === "BUTTON") {
      const p = products.find((x) => x.handle === sh.dataset.share);
      const msg = sh.querySelector(".share__msg");
      const flash = (text) => { msg.textContent = text; setTimeout(() => (msg.textContent = ""), 3200); };
      const dt = shareData(p);
      if (t.hasAttribute("data-share-story")) {
        t.disabled = true;
        SH.shareStory(dt).then((r) => r === "downloaded" && flash("Image enregistrée : publiez-la en story depuis votre téléphone."), () => flash("Le partage n'a pas fonctionné, réessayez.")).finally(() => (t.disabled = false));
      }
      if (t.hasAttribute("data-share-link")) SH.shareLink(dt).then((r) => r === "copied" && flash("Lien copié."));
      if (t.hasAttribute("data-share-copy")) SH.copyLink(dt.url).then((r) => flash(r === "copied" ? "Lien copié." : "Copie impossible."));
      return;
    }
    const pdp = t.closest("[data-pdp]");
    if (pdp) {
      const p = products.find((x) => x.handle === pdp.dataset.pdp);
      if (t.dataset.variant) {
        pdp.querySelectorAll("[data-variant]").forEach((b) => b.setAttribute("aria-pressed", b === t));
        pdp.querySelector("[data-variant-label]").textContent = p.variants[+t.dataset.variant].title;
      }
      if (t.dataset.qty) {
        const el = pdp.querySelector("[data-qty-value]");
        el.textContent = Math.max(1, Math.min(10, +el.textContent + +t.dataset.qty));
      }
      if (t.hasAttribute("data-add")) {
        const sel = pdp.querySelector('[aria-pressed="true"]');
        addToCart(p, sel ? +sel.dataset.variant : 0, +pdp.querySelector("[data-qty-value]").textContent);
      }
    }
  });
  document.addEventListener("input", (e) => {
    if (e.target.matches("[data-gift-message]")) {
      gift = { message: e.target.value.slice(0, 240) };
      e.target.parentNode.querySelector(".gift__count").textContent = `${gift.message.length} / 240`;
      save();
    }
  });
  document.addEventListener("change", (e) => {
    if (e.target.matches("[data-gift]")) {
      gift = e.target.checked ? { message: "" } : null;
      save();
      renderCart();
      if (gift) document.querySelector("[data-gift-message]")?.focus();
      return;
    }
    if (e.target.matches("[data-sort]")) {
      const c = e.target.dataset.sort;
      const v = e.target.value;
      go("/boutique" + (c ? "/" + c : "") + (v !== "featured" ? "?tri=" + v : ""));
    }
  });
  document.addEventListener("submit", (e) => {
    const f = e.target;
    e.preventDefault();
    if (f.dataset.form === "newsletter") GA.track("sign_up", { method: "newsletter" });
    if (f.dataset.form === "bespoke") GA.track("generate_lead", { form: "sur-mesure", creation: !!creation });
    if (f.dataset.form === "newsletter") f.outerHTML = '<p class="lead" style="margin:0">Merci, vous êtes inscrite. À très vite dans votre boîte mail.</p>';
    if (f.dataset.form === "bespoke") creation = null;
    if (f.dataset.form === "bespoke") f.outerHTML = '<div class="notice">Merci ! Dans le site final, votre demande nous est envoyée par e-mail et nous vous répondons sous 48 h.</div>';
  });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("keydown", (e) => e.key === "Escape" && openCart(false));

  shell();
  GA.initAnalytics(site.gaId);
  FX.initPreloader();
  document.getElementById("backdrop").addEventListener("click", () => openCart(false));
  renderCart();
  // adresse d'arrivée : #/page, ou ancien lien de l'atelier ?d=…
  try {
    const shared = new URLSearchParams(location.search).get("d");
    if (location.hash.startsWith("#/")) current = decodeURI(location.hash.slice(1));
    else if (shared && AT.decodeDesign(shared)) current = "/atelier?d=" + shared;
  } catch {}
  route();
})();
