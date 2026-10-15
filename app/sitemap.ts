import type { MetadataRoute } from "next";
import { commerce } from "@/lib/commerce";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const [products, categories, collections] = await Promise.all([commerce.getProducts(), commerce.getCategories(), commerce.getCollections()]);
  return [
    ...["", "/boutique", "/collections", "/sur-mesure", "/maison"].map((p) => ({ url: base + p })),
    ...categories.map((c) => ({ url: `${base}/boutique/${c.handle}` })),
    ...collections.map((c) => ({ url: `${base}/collections/${c.handle}` })),
    ...products.map((p) => ({ url: `${base}/produit/${p.handle}` })),
  ];
}
