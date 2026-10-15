import "server-only";
import type { CommerceProvider } from "./types";
import { mockProvider } from "./mock/provider";
import { shopifyProvider } from "./shopify/provider";

// Choix de la source du catalogue via la variable d'environnement COMMERCE_PROVIDER.
// "mock" (par défaut) : données locales de lib/commerce/mock/catalog.json
// "shopify" : Shopify Storefront API (voir .env.example)
export const commerce: CommerceProvider =
  process.env.COMMERCE_PROVIDER === "shopify" ? shopifyProvider : mockProvider;

export * from "./types";
