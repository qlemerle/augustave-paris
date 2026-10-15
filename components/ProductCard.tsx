import Link from "next/link";
import { Media } from "./Media";
import { QuickAdd } from "./QuickAdd";
import { formatPrice } from "@/lib/commerce/format";
import type { Product } from "@/lib/commerce/types";

const BADGES: Record<string, string> = {
  "piece-unique": "Pièce unique",
  nouveau: "Nouveau",
  "edition-limitee": "Édition limitée",
  "best-seller": "Coup de cœur",
};

export function ProductCard({ product, collectionTitle, delay = 0 }: { product: Product; collectionTitle?: string; delay?: number }) {
  const badge = Object.keys(BADGES).find((t) => product.tags.includes(t));
  return (
    <article className="product-card reveal" style={{ ["--d" as string]: `${delay}ms` }}>
      <div className="product-card__media">
        {badge && <span className="product-card__badge">{BADGES[badge]}</span>}
        <Link href={`/produit/${product.handle}`} aria-label={product.title}>
          <Media
            image={product.images[0]}
            hoverImage={product.images[1]}
            hover
            art={product.art}
            seed={product.handle}
            alt={product.title}
            sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 25vw"
          />
        </Link>
        <QuickAdd product={product} />
      </div>
      <Link href={`/produit/${product.handle}`} className="product-card__info">
        <div>
          {collectionTitle && <span className="product-card__collection">{collectionTitle}</span>}
          <h3 className="product-card__title">{product.title}</h3>
        </div>
        <span className="product-card__price">{formatPrice(product.price)}</span>
      </Link>
    </article>
  );
}
