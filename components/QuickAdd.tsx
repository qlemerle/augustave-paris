"use client";

import { useRouter } from "next/navigation";
import { useCart } from "./cart/CartProvider";
import type { Product } from "@/lib/commerce/types";

/** Bouton d'ajout rapide sur les cartes produit (ou lien vers la fiche si plusieurs tailles). */
export function QuickAdd({ product }: { product: Product }) {
  const cart = useCart();
  const router = useRouter();
  const single = product.variants.length === 1;
  const v = product.variants[0];
  return (
    <button
      className="product-card__quick"
      onClick={() =>
        single
          ? cart.add({
              variantId: v.id,
              handle: product.handle,
              title: product.title,
              variantTitle: v.title,
              price: v.price.amount,
              currencyCode: v.price.currencyCode,
              image: product.images[0] ?? null,
              art: product.art,
            })
          : router.push(`/produit/${product.handle}`)
      }
    >
      {single ? "Ajouter au panier" : "Choisir ma taille"}
    </button>
  );
}
