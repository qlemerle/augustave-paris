// Modèle de données neutre : les pages ne dépendent que de ces types,
// jamais directement de Shopify ou des données de démonstration.

export type JewelArt = {
  type: "pendant" | "cluster" | "long" | "choker" | "multi" | "bracelet" | "earrings";
  beads: string[];
  pendant?: string | null;
  bg: [string, string];
};

export type Image = { url: string; alt: string; width?: number; height?: number };

export type Money = { amount: number; currencyCode: string };

export type ProductVariant = {
  id: string; // identifiant Shopify (gid://shopify/ProductVariant/...) ou id local
  title: string;
  availableForSale: boolean;
  price: Money;
  compareAtPrice?: Money | null;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  excerpt: string;
  description: string;
  materials: string;
  dimensions?: string | null; // taille du pendentif, des perles…
  category: string; // handle de catégorie (Shopify : productType)
  collection: string; // handle de collection principale
  tags: string[];
  images: Image[]; // vide => illustration de remplacement
  art?: JewelArt; // illustration de remplacement
  optionName: string; // ex. "Longueur"
  variants: ProductVariant[];
  price: Money; // prix minimum
};

export type Category = {
  handle: string;
  title: string;
  tagline: string;
  description: string;
  image?: Image | null;
  art?: JewelArt;
};

export type Collection = {
  handle: string;
  title: string;
  kicker: string;
  description: string;
  accent: string;
  image?: Image | null;
  art?: JewelArt;
};

export type CartLineInput = {
  variantId: string;
  quantity: number;
  /** Création de l'atelier : code du collier, prix recalculé côté serveur, description et lien */
  atelier?: AtelierLine;
};

export type AtelierLine = { code: string; price: number; text: string; link: string };

export type SortKey = "featured" | "price-asc" | "price-desc" | "new";

export interface CommerceProvider {
  getProducts(opts?: { category?: string; collection?: string; sort?: SortKey }): Promise<Product[]>;
  getProduct(handle: string): Promise<Product | null>;
  getCategories(): Promise<Category[]>;
  getCategory(handle: string): Promise<Category | null>;
  getCollections(): Promise<Collection[]>;
  getCollection(handle: string): Promise<Collection | null>;
  /** Crée un panier côté boutique et renvoie l'URL de paiement. */
  createCheckout(lines: CartLineInput[], gift?: GiftOption | null): Promise<{ checkoutUrl: string }>;
}

/** Option cadeau du panier : écrin et petit mot écrit à la main (offerts). */
export type GiftOption = { message: string };
