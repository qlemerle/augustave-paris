import { commerce } from "@/lib/commerce";
import { site } from "@/lib/site";

// Flux produits au format catalogue Meta (Instagram Shopping, Facebook) et Google Merchant.
// À déclarer dans Meta Commerce Manager > Catalogue > Sources de données > Flux de données planifié,
// avec l'URL https://<domaine>/flux-instagram.csv. Inutile si la boutique passe par le canal
// « Facebook & Instagram » de Shopify, qui synchronise le catalogue tout seul.
export const revalidate = 3600;

const CATEGORY_GOOGLE: Record<string, string> = {
  colliers: "Apparel & Accessories > Jewelry > Necklaces",
  sautoirs: "Apparel & Accessories > Jewelry > Necklaces",
  "ras-de-cou": "Apparel & Accessories > Jewelry > Necklaces",
  bracelets: "Apparel & Accessories > Jewelry > Bracelets",
  "boucles-d-oreilles": "Apparel & Accessories > Jewelry > Earrings",
};

const cell = (v: string | number) => `"${String(v).replace(/"/g, '""').replace(/\s+/g, " ").trim()}"`;

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const abs = (u: string) => new URL(u, base).toString();
  const products = await commerce.getProducts();
  const head = ["id", "title", "description", "availability", "condition", "price", "sale_price", "link", "image_link", "additional_image_link", "brand", "google_product_category", "product_type", "custom_label_0"];
  const rows = products.map((p) => {
    const v = p.variants[0];
    const sale = v?.compareAtPrice ? `${p.price.amount.toFixed(2)} ${p.price.currencyCode}` : "";
    const price = v?.compareAtPrice ?? p.price;
    return [
      p.handle,
      p.title,
      p.description || p.excerpt,
      "in stock",
      "new",
      `${price.amount.toFixed(2)} ${price.currencyCode}`,
      sale,
      abs(`/produit/${p.handle}`),
      p.images[0] ? abs(p.images[0].url) : abs("/brand/logo-original.jpg"),
      p.images.slice(1, 10).map((i) => abs(i.url)).join(","),
      site.name,
      CATEGORY_GOOGLE[p.category] ?? "Apparel & Accessories > Jewelry",
      p.category,
      p.collection,
    ]
      .map(cell)
      .join(",");
  });
  return new Response([head.join(","), ...rows].join("\n") + "\n", {
    headers: { "Content-Type": "text/csv; charset=utf-8" },
  });
}
