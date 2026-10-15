import type { Metadata } from "next";
import Link from "next/link";
import { commerce } from "@/lib/commerce";
import { Media } from "@/components/Media";

export const metadata: Metadata = { title: "Collections" };

export default async function Page() {
  const collections = await commerce.getCollections();
  return (
    <>
      <section className="container page-hero">
        <h1 className="display h1">
          Les <em>collections</em>
        </h1>
        <p className="lead">Chaque collection est une histoire : une couleur, un paysage, une émotion.</p>
      </section>
      <section className="container" style={{ paddingBottom: "clamp(80px, 10vw, 140px)" }}>
        <div className="product-grid product-grid--3">
          {collections.map((c, i) => (
            <Link
              key={c.handle}
              href={`/collections/${c.handle}`}
              className="collection-card reveal"
              style={{ ["--accent" as string]: c.accent, ["--d" as string]: `${(i % 3) * 110}ms` }}
            >
              <Media image={c.image} art={c.art} seed={c.handle} alt={c.title} sizes="(max-width: 640px) 50vw, 33vw" />
              <div>
                <span className="collection-card__kicker">{c.kicker}</span>
                <h2 className="collection-card__title">{c.title}</h2>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
