import fs from "node:fs";
import path from "node:path";
import catalog from "./catalog.json";
import type { Category, Collection, CommerceProvider, Image, Product, ProductVariant, SortKey } from "../types";

// Les photos se déposent dans /public/images/... et sont détectées automatiquement :
//   produits    : public/images/produits/<handle>-1.jpg, <handle>-2.jpg ...
//   catégories  : public/images/categories/<handle>.jpg
//   collections : public/images/collections/<handle>.jpg
const PUBLIC_DIR = path.join(process.cwd(), "public");
const IMG_EXT = /\.(jpe?g|png|webp|avif)$/i;

function listImages(dir: string, prefix: string, alt: string): Image[] {
  const abs = path.join(PUBLIC_DIR, "images", dir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((f) => IMG_EXT.test(f) && (f.startsWith(prefix + "-") || f.replace(IMG_EXT, "") === prefix))
    .sort((a, b) => a.localeCompare(b, "fr", { numeric: true }))
    .map((f) => ({ url: `/images/${dir}/${f}`, alt }));
}

const OPTIONS: Record<string, { name: string; values: string[] }> = {
  longueur: { name: "Longueur", values: ["40 cm", "45 cm", "50 cm"] },
  sautoir: { name: "Longueur", values: ["70 cm", "80 cm"] },
  "ras-de-cou": { name: "Longueur", values: ["36 cm", "38 cm", "40 cm"] },
  bracelet: { name: "Tour de poignet", values: ["S · 15 cm", "M · 17 cm", "L · 19 cm"] },
  unique: { name: "Taille", values: ["Taille unique"] },
};

// champs facultatifs, renseignés depuis le fichier Excel (tools/catalogue/)
type RawProduct = (typeof catalog.products)[number] & { compareAtPrice?: number; sizes?: string[]; dimensions?: string };

function toProduct(p: RawProduct): Product {
  const unique = p.tags.includes("piece-unique");
  const base = OPTIONS[p.options] ?? OPTIONS.unique;
  const opt = unique ? { name: "Taille", values: ["Pièce unique"] } : p.sizes?.length ? { name: base.name, values: p.sizes } : base;
  const price = { amount: p.price, currencyCode: "EUR" };
  const compareAtPrice = p.compareAtPrice ? { amount: p.compareAtPrice, currencyCode: "EUR" } : null;
  const variants: ProductVariant[] = opt.values.map((v, i) => ({
    id: `mock-${p.handle}-${i + 1}`,
    title: v,
    availableForSale: true,
    price,
    compareAtPrice,
  }));
  return {
    id: `mock-${p.handle}`,
    handle: p.handle,
    title: p.title,
    excerpt: p.excerpt,
    description: p.description,
    materials: p.materials,
    dimensions: p.dimensions ?? null,
    category: p.category,
    collection: p.collection,
    tags: p.tags,
    images: listImages("produits", p.handle, p.title),
    art: p.art as Product["art"],
    optionName: opt.name,
    variants,
    price,
  };
}

function sortProducts(list: Product[], sort: SortKey = "featured") {
  const out = [...list];
  if (sort === "price-asc") out.sort((a, b) => a.price.amount - b.price.amount);
  if (sort === "price-desc") out.sort((a, b) => b.price.amount - a.price.amount);
  if (sort === "new") out.sort((a, b) => +b.tags.includes("nouveau") - +a.tags.includes("nouveau"));
  return out;
}

const products = () => catalog.products.map(toProduct);

const categories = (): Category[] =>
  catalog.categories.map((c) => ({
    ...c,
    art: c.art as Category["art"],
    image: listImages("categories", c.handle, c.title)[0] ?? null,
  }));

const collections = (): Collection[] =>
  catalog.collections.map((c) => ({
    ...c,
    art: c.art as Collection["art"],
    image: listImages("collections", c.handle, c.title)[0] ?? null,
  }));

export const mockProvider: CommerceProvider = {
  async getProducts({ category, collection, sort } = {}) {
    let list = products();
    if (category) list = list.filter((p) => p.category === category);
    if (collection) list = list.filter((p) => p.collection === collection);
    return sortProducts(list, sort);
  },
  async getProduct(handle) {
    return products().find((p) => p.handle === handle) ?? null;
  },
  async getCategories() {
    return categories();
  },
  async getCategory(handle) {
    return categories().find((c) => c.handle === handle) ?? null;
  },
  async getCollections() {
    return collections();
  },
  async getCollection(handle) {
    return collections().find((c) => c.handle === handle) ?? null;
  },
  async createCheckout(lines, gift) {
    const count = lines.reduce((n, l) => n + l.quantity, 0);
    return { checkoutUrl: `/commande-demo?articles=${count}${gift ? "&cadeau=1" : ""}` };
  },
};
