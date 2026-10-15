import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { commerce } from "@/lib/commerce";
import { Media } from "@/components/Media";
import { ProductCard } from "@/components/ProductCard";

type Props = { params: Promise<{ handle: string }> };

export async function generateStaticParams() {
  return (await commerce.getCollections()).map((c) => ({ handle: c.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await commerce.getCollection((await params).handle);
  return c ? { title: c.title, description: c.description } : {};
}

export default async function Page({ params }: Props) {
  const { handle } = await params;
  const [collection, collections] = await Promise.all([commerce.getCollection(handle), commerce.getCollections()]);
  if (!collection) notFound();
  const products = await commerce.getProducts({ collection: handle });
  const others = collections.filter((c) => c.handle !== handle);

  return (
    <>
      <section className="page-hero page-hero--collection" style={{ ["--accent" as string]: collection.accent }}>
        <div className="collection-hero">
          <div className="collection-hero__body">
            <nav className="breadcrumb" aria-label="Fil d'Ariane">
              <Link href="/">Accueil</Link>
              <span aria-hidden>/</span>
              <Link href="/collections">Collections</Link>
            </nav>
            <span className="eyebrow">
              <span className="dot" />
              {collection.kicker}
            </span>
            <h1 className="display h1">{collection.title}</h1>
            <p className="lead">{collection.description}</p>
            <p className="result-count" style={{ margin: 0 }}>
              {products.length} {products.length > 1 ? "pièces" : "pièce"}
            </p>
          </div>
          <div className="reveal reveal--mask" style={{ display: "grid" }}>
            <Media image={collection.image} art={collection.art} seed={`hero-${collection.handle}`} alt={collection.title} priority sizes="(max-width: 900px) 100vw, 50vw" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="product-grid">
            {products.map((p, i) => (
              <ProductCard key={p.handle} product={p} collectionTitle={collection.title} delay={(i % 4) * 90} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--cream section--tight">
        <div className="container">
          <div className="section-head">
            <h2 className="display h3 reveal">Explorer d&apos;autres collections</h2>
          </div>
          <div className="chips" style={{ flexWrap: "wrap" }}>
            {others.map((c) => (
              <Link key={c.handle} href={`/collections/${c.handle}`} className="chip">
                {c.title}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
