import Link from "next/link";
import { Suspense } from "react";
import { commerce } from "@/lib/commerce";
import { ProductCard } from "./ProductCard";
import { SortSelect } from "./SortSelect";
import type { SortKey } from "@/lib/commerce/types";

const SORTS: SortKey[] = ["featured", "new", "price-asc", "price-desc"];

export async function ShopView({ category, tri }: { category?: string; tri?: string }) {
  const sort = SORTS.includes(tri as SortKey) ? (tri as SortKey) : "featured";
  const [categories, collections, products] = await Promise.all([
    commerce.getCategories(),
    commerce.getCollections(),
    commerce.getProducts({ category, sort }),
  ]);
  const current = categories.find((c) => c.handle === category);
  const colTitle = (h: string) => collections.find((c) => c.handle === h)?.title;
  const qs = sort === "featured" ? "" : `?tri=${sort}`;

  return (
    <>
      <section className="container page-hero">
        <nav className="breadcrumb" aria-label="Fil d'Ariane">
          <Link href="/">Accueil</Link>
          <span aria-hidden>/</span>
          {current ? (
            <>
              <Link href="/boutique">Boutique</Link>
              <span aria-hidden>/</span>
              <span>{current.title}</span>
            </>
          ) : (
            <span>Boutique</span>
          )}
        </nav>
        <h1 className="display h1">{current ? current.title : <>La <em>boutique</em></>}</h1>
        <p className="lead">{current ? current.description : "Tous nos bijoux d'auteur, façonnés à la main à Paris, en petites séries."}</p>
      </section>

      <div className="filters">
        <div className="container filters__inner">
          <nav className="chips" aria-label="Catégories">
            <Link href={`/boutique${qs}`} className="chip" aria-current={!current ? "true" : undefined} scroll={false}>
              Tout
            </Link>
            {categories.map((c) => (
              <Link key={c.handle} href={`/boutique/${c.handle}${qs}`} className="chip" aria-current={c.handle === category ? "true" : undefined} scroll={false}>
                {c.title}
              </Link>
            ))}
          </nav>
          <Suspense>
            <SortSelect />
          </Suspense>
        </div>
      </div>

      <section className="container" style={{ paddingBottom: "clamp(80px, 10vw, 140px)" }}>
        <p className="result-count">
          {products.length} {products.length > 1 ? "bijoux" : "bijou"}
        </p>
        <div className="product-grid">
          {products.map((p, i) => (
            <ProductCard key={p.handle} product={p} collectionTitle={colTitle(p.collection)} delay={(i % 4) * 90} />
          ))}
        </div>
      </section>
    </>
  );
}
