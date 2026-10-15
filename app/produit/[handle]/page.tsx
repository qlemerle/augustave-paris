import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { commerce } from "@/lib/commerce";
import { site } from "@/lib/site";
import { Media } from "@/components/Media";
import { AddToCart } from "@/components/AddToCart";
import { ProductCard } from "@/components/ProductCard";

type Props = { params: Promise<{ handle: string }> };

export async function generateStaticParams() {
  return (await commerce.getProducts()).map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await commerce.getProduct((await params).handle);
  if (!p) return {};
  // balises lues par Instagram / Facebook (aperçu de lien, catalogue) et par Google
  return {
    title: p.title,
    description: p.excerpt,
    alternates: { canonical: `/produit/${p.handle}` },
    openGraph: { title: p.title, description: p.excerpt, url: `/produit/${p.handle}`, images: p.images.slice(0, 4).map((i) => i.url) },
  };
}

export default async function Page({ params }: Props) {
  const { handle } = await params;
  const product = await commerce.getProduct(handle);
  if (!product) notFound();
  const [collection, category, siblings] = await Promise.all([
    commerce.getCollection(product.collection),
    commerce.getCategory(product.category),
    commerce.getProducts({ collection: product.collection }),
  ]);
  const related = siblings.filter((p) => p.handle !== product.handle).slice(0, 4);

  // Galerie : photos réelles, sinon 3 cadrages de l'illustration
  const gallery = product.images.length
    ? product.images.map((img, i) => <Media key={i} image={img} alt={product.title} priority={i === 0} sizes="(max-width: 900px) 100vw, 55vw" />)
    : [
        <Media key="a" art={product.art} seed={product.handle} alt={product.title} />,
        <Media key="b" art={{ ...product.art!, bg: [product.art!.bg[1], product.art!.bg[0]] }} seed={`${product.handle}-b`} alt="" />,
        <div key="c" className="media">
          <div className="media__layer" style={{ display: "grid", placeItems: "center", background: "var(--navy)" }}>
            <img src="/brand/monogramme-or.png" alt="" style={{ width: "46%" }} />
          </div>
        </div>,
      ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    brand: { "@type": "Brand", name: site.name },
    sku: product.handle,
    image: product.images.map((i) => new URL(i.url, process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").toString()),
    offers: {
      "@type": "Offer",
      url: new URL(`/produit/${product.handle}`, process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").toString(),
      priceCurrency: product.price.currencyCode,
      price: product.price.amount,
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <div className="container pdp">
        <div className="pdp__gallery">
          {gallery.map((g, i) => (
            <div key={i} className="reveal" style={{ ["--d" as string]: `${i * 120}ms`, gridColumn: i === 0 ? "1 / -1" : undefined }}>
              {g}
            </div>
          ))}
        </div>

        <div className="pdp__info">
          <nav className="breadcrumb" aria-label="Fil d'Ariane">
            <Link href="/boutique">Boutique</Link>
            {category && (
              <>
                <span aria-hidden>/</span>
                <Link href={`/boutique/${category.handle}`}>{category.title}</Link>
              </>
            )}
          </nav>
          <div>
            {collection && (
              <Link href={`/collections/${collection.handle}`} className="eyebrow" style={{ display: "inline-block", marginBottom: 14 }}>
                Collection {collection.title}
              </Link>
            )}
            <h1 className="display pdp__title">{product.title}</h1>
          </div>
          <p className="pdp__excerpt">{product.excerpt}</p>
          <AddToCart product={product} />
          <ul className="reassurance">
            <li>Fait main dans notre atelier parisien</li>
            <li>Livraison offerte dès {site.freeShippingFrom} €, dans un écrin Augustave</li>
            <li>Retours gratuits sous {site.returnsDays} jours</li>
            <li>Pour offrir : écrin cadeau et petit mot écrit à la main, à cocher dans le panier</li>
          </ul>
          <div className="accordion">
            <details open>
              <summary>Description</summary>
              <div className="accordion__body">
                <p>{product.description}</p>
              </div>
            </details>
            <details>
              <summary>Taille et dimensions</summary>
              <div className="accordion__body">
                {product.tags.includes("piece-unique") && (
                  <p>Pièce unique : elle ne sera pas refaite à l&apos;identique. Elle peut néanmoins inspirer une création sur-mesure.</p>
                )}
                {product.dimensions && <p>{product.dimensions}</p>}
                <p>{sizeGuide(product.optionName, product.variants.map((v) => v.title))}</p>
              </div>
            </details>
            {product.materials && (
              <details>
                <summary>Matières</summary>
                <div className="accordion__body">
                  <p>{product.materials}</p>
                  <p>Chaque perle étant posée à la main, de légères variations rendent votre bijou unique.</p>
                </div>
              </details>
            )}
            <details>
              <summary>Entretien</summary>
              <div className="accordion__body">
                <p>Retirez votre bijou avant la douche, la baignade ou le sport, et évitez le contact avec le parfum. Rangez-le à plat dans son écrin.</p>
                <Link href="/infos/entretien" className="link-underline">
                  Conseils d&apos;entretien
                </Link>
              </div>
            </details>
            <details>
              <summary>Livraison & retours</summary>
              <div className="accordion__body">
                <p>Expédition sous 2 à 3 jours ouvrés. Livraison offerte dès {site.freeShippingFrom} €. Retours sous {site.returnsDays} jours.</p>
              </div>
            </details>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section section--cream">
          <div className="container">
            <div className="section-head">
              <div>
                <h2 className="display h2 reveal">{collection?.title}</h2>
              </div>
            </div>
            <div className="product-grid">
              {related.map((p, i) => (
                <ProductCard key={p.handle} product={p} collectionTitle={collection?.title} delay={i * 90} />
              ))}
            </div>
          </div>
        </section>
      )}
      {/* balises produit Open Graph (property=, que Next ne génère pas) : React les place dans le <head> */}
      <meta property="product:price:amount" content={String(product.price.amount)} />
      <meta property="product:price:currency" content={product.price.currencyCode} />
      <meta property="product:availability" content="in stock" />
      <meta property="product:brand" content={site.name} />
      <meta property="product:retailer_item_id" content={product.handle} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}

// Repères de taille, selon le type d'option du bijou
function sizeGuide(optionName: string, sizes: string[]) {
  const list = sizes.filter((s) => !/unique/i.test(s)).join(", ");
  if (/poignet/i.test(optionName))
    return `Tailles proposées : ${list}. Mesurez votre tour de poignet et ajoutez 1 à 2 cm pour un bracelet qui bouge joliment.`;
  if (/longueur/i.test(optionName) && list)
    return `Longueurs proposées : ${list}. Repères : 38 à 40 cm se porte au ras du cou, 45 cm à la naissance du décolleté, 70 cm et plus en sautoir.`;
  return "Taille unique, ajustée à la main dans notre atelier.";
}
