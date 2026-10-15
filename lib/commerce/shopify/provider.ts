import "server-only";
import catalog from "../mock/catalog.json";
import { shopifyFetch } from "./client";
import { ATELIER_PRODUCT_QUERY, CART_CREATE_MUTATION, COLLECTION_PRODUCTS_QUERY, COLLECTIONS_QUERY, PRODUCT_QUERY, PRODUCTS_QUERY } from "./queries";
import type { Category, Collection, CommerceProvider, Image, Product, SortKey } from "../types";

// Correspondance Shopify -> site :
// - Catégorie   = "Type de produit" Shopify (ex. "Colliers"), converti en handle (colliers).
//                 Titres et accroches des catégories : lib/commerce/mock/catalog.json.
// - Collection  = collection Shopify (Rouge Love, La Nacrée...). Métachamps facultatifs :
//                 custom.surtitre (ex. "Édition limitée"), custom.couleur (ex. #b3262e).
// - Produit     : métachamps facultatifs custom.materiaux et custom.accroche.

const CATEGORY_HANDLES = new Set(catalog.categories.map((c) => c.handle));
const IGNORED_COLLECTIONS = new Set(["frontpage", "all", ...CATEGORY_HANDLES]);

const slugify = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

type Money = { amount: string; currencyCode: string };
type ShopifyImage = { url: string; altText: string | null; width: number; height: number };
type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string;
  tags: string[];
  materials: { value: string } | null;
  dimensions: { value: string } | null;
  excerpt: { value: string } | null;
  options: { name: string }[];
  collections: { nodes: { handle: string }[] };
  images: { nodes: ShopifyImage[] };
  priceRange: { minVariantPrice: Money };
  variants: {
    nodes: { id: string; title: string; availableForSale: boolean; price: Money; compareAtPrice: Money | null }[];
  };
};
type ShopifyCollection = {
  handle: string;
  title: string;
  description: string;
  image: ShopifyImage | null;
  kicker: { value: string } | null;
  accent: { value: string } | null;
};

const ATELIER_HANDLE = process.env.SHOPIFY_ATELIER_HANDLE || "creation-atelier";
async function fetchAtelierVariants() {
  const data = await shopifyFetch<{
    product: { variants: { nodes: { id: string; availableForSale: boolean; price: { amount: string } }[] } } | null;
  }>(ATELIER_PRODUCT_QUERY, { handle: ATELIER_HANDLE }, 300);
  return (data.product?.variants.nodes ?? []).map((v) => ({ id: v.id, availableForSale: v.availableForSale, price: Number(v.price.amount) }));
}

const money = (m: Money) => ({ amount: Number(m.amount), currencyCode: m.currencyCode });
const image = (i: ShopifyImage, fallbackAlt: string): Image => ({
  url: i.url,
  alt: i.altText || fallbackAlt,
  width: i.width,
  height: i.height,
});

function toProduct(p: ShopifyProduct): Product {
  const firstSentence = p.description.split(/(?<=[.!?])\s/)[0] ?? "";
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    excerpt: p.excerpt?.value ?? firstSentence,
    description: p.description,
    materials: p.materials?.value ?? "",
    dimensions: p.dimensions?.value ?? null,
    category: slugify(p.productType || ""),
    collection: p.collections.nodes.map((c) => c.handle).find((h) => !IGNORED_COLLECTIONS.has(h)) ?? "",
    tags: p.tags.map(slugify),
    images: p.images.nodes.map((i) => image(i, p.title)),
    optionName: p.options[0]?.name === "Title" ? "Taille" : p.options[0]?.name ?? "Taille",
    variants: p.variants.nodes.map((v) => ({
      id: v.id,
      title: v.title === "Default Title" ? "Taille unique" : v.title,
      availableForSale: v.availableForSale,
      price: money(v.price),
      compareAtPrice: v.compareAtPrice ? money(v.compareAtPrice) : null,
    })),
    price: money(p.priceRange.minVariantPrice),
  };
}

function sortArgs(sort: SortKey = "featured", inCollection = false) {
  switch (sort) {
    case "price-asc":
      return { sortKey: "PRICE", reverse: false };
    case "price-desc":
      return { sortKey: "PRICE", reverse: true };
    case "new":
      return { sortKey: "CREATED", reverse: true };
    default:
      return inCollection ? { sortKey: "COLLECTION_DEFAULT", reverse: false } : { sortKey: "BEST_SELLING", reverse: false };
  }
}

async function fetchCollections(): Promise<Collection[]> {
  const data = await shopifyFetch<{ collections: { nodes: ShopifyCollection[] } }>(COLLECTIONS_QUERY);
  return data.collections.nodes
    .filter((c) => !IGNORED_COLLECTIONS.has(c.handle))
    .map((c) => {
      const local = catalog.collections.find((l) => l.handle === c.handle);
      return {
        handle: c.handle,
        title: c.title,
        description: c.description || local?.description || "",
        kicker: c.kicker?.value ?? local?.kicker ?? "Collection",
        accent: c.accent?.value ?? local?.accent ?? "#c6a15b",
        image: c.image ? image(c.image, c.title) : null,
        art: local?.art as Collection["art"],
      };
    });
}

export const shopifyProvider: CommerceProvider = {
  async getProducts({ category, collection, sort } = {}) {
    if (collection) {
      const data = await shopifyFetch<{ collection: { products: { nodes: ShopifyProduct[] } } | null }>(
        COLLECTION_PRODUCTS_QUERY,
        { handle: collection, first: 100, ...sortArgs(sort, true) },
      );
      const list = (data.collection?.products.nodes ?? []).map(toProduct);
      return category ? list.filter((p) => p.category === category) : list;
    }
    const data = await shopifyFetch<{ products: { nodes: ShopifyProduct[] } }>(PRODUCTS_QUERY, {
      first: 100,
      query: null,
      ...sortArgs(sort),
    });
    // le produit technique de l'atelier n'apparaît pas dans la boutique
    const list = data.products.nodes.filter((p) => p.handle !== ATELIER_HANDLE).map(toProduct);
    return category ? list.filter((p) => p.category === category) : list;
  },
  async getProduct(handle) {
    const data = await shopifyFetch<{ product: ShopifyProduct | null }>(PRODUCT_QUERY, { handle });
    return data.product ? toProduct(data.product) : null;
  },
  async getCategories(): Promise<Category[]> {
    return catalog.categories.map((c) => ({ ...c, art: c.art as Category["art"], image: null }));
  },
  async getCategory(handle) {
    return (await this.getCategories()).find((c) => c.handle === handle) ?? null;
  },
  getCollections: fetchCollections,
  async getCollection(handle) {
    return (await fetchCollections()).find((c) => c.handle === handle) ?? null;
  },
  async createCheckout(lines, gift) {
    // L'option cadeau voyage dans la note et les attributs de la commande (visibles dans l'admin Shopify)
    const atelierVariants = lines.some((l) => l.atelier) ? await fetchAtelierVariants() : [];
    const toLine = (l: (typeof lines)[number]) => {
      if (!l.atelier) return { merchandiseId: l.variantId, quantity: l.quantity };
      const v = atelierVariants.find((x) => x.price === l.atelier!.price && x.availableForSale);
      if (!v) throw new Error(`Atelier : aucune variante à ${l.atelier.price} € dans le produit « ${ATELIER_HANDLE} ».`);
      return {
        merchandiseId: v.id,
        quantity: l.quantity,
        // visibles sur la commande dans l'admin Shopify
        attributes: [
          { key: "Création", value: l.atelier.text },
          { key: "Code", value: l.atelier.code },
          { key: "Voir le collier", value: l.atelier.link },
        ],
      };
    };
    const input = {
      lines: lines.map(toLine),
      ...(gift
        ? {
            note: gift.message ? `Cadeau : écrin et petit mot. « ${gift.message} »` : "Cadeau : écrin et petit mot.",
            attributes: [
              { key: "Cadeau", value: "Oui" },
              ...(gift.message ? [{ key: "Petit mot", value: gift.message }] : []),
            ],
          }
        : {}),
    };
    const data = await shopifyFetch<{
      cartCreate: { cart: { checkoutUrl: string } | null; userErrors: { message: string }[] };
    }>(CART_CREATE_MUTATION, { input }, 0);
    if (!data.cartCreate.cart) throw new Error(data.cartCreate.userErrors.map((e) => e.message).join(", "));
    return { checkoutUrl: data.cartCreate.cart.checkoutUrl };
  },
};
