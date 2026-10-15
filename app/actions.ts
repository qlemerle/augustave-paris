"use server";

import { commerce } from "@/lib/commerce";
import type { CartLineInput } from "@/lib/commerce/types";

/** Crée le panier côté boutique (Shopify) et renvoie l'URL de paiement sécurisé. */
export async function startCheckout(lines: CartLineInput[]) {
  const clean = lines.filter((l) => l.variantId && l.quantity > 0).map((l) => ({ variantId: l.variantId, quantity: Math.min(l.quantity, 20) }));
  if (!clean.length) return { error: "Votre panier est vide." };
  try {
    return await commerce.createCheckout(clean);
  } catch (e) {
    console.error(e);
    return { error: "Le paiement est momentanément indisponible. Merci de réessayer." };
  }
}
