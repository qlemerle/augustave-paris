"use server";

import { commerce } from "@/lib/commerce";
import { decodeDesign, describeDesign, priceOf } from "@/lib/atelier.mjs";
import type { CartLineInput, GiftOption } from "@/lib/commerce/types";

/** Crée le panier côté boutique (Shopify) et renvoie l'URL de paiement sécurisé. */
export async function startCheckout(lines: CartLineInput[], gift?: GiftOption | null) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "";
  const clean: CartLineInput[] = [];
  for (const l of lines) {
    if (!l.variantId || !(l.quantity > 0)) continue;
    const quantity = Math.min(l.quantity, 20);
    if (!l.variantId.startsWith("atelier:")) {
      clean.push({ variantId: l.variantId, quantity });
      continue;
    }
    // création de l'atelier : le prix est recalculé ici, jamais repris du navigateur
    const code = l.variantId.slice("atelier:".length);
    const design = decodeDesign(code);
    if (!design) return { error: "Une création du panier n'est plus valide. Merci de la recomposer dans l'atelier." };
    clean.push({
      variantId: l.variantId,
      quantity,
      atelier: { code, price: priceOf(design).total, text: describeDesign(design), link: `${base}/atelier?d=${code}` },
    });
  }
  if (!clean.length) return { error: "Votre panier est vide." };
  try {
    const cleanGift = gift ? { message: String(gift.message || "").trim().slice(0, 240) } : null;
    return await commerce.createCheckout(clean, cleanGift);
  } catch (e) {
    console.error(e);
    return { error: "Le paiement est momentanément indisponible. Merci de réessayer." };
  }
}
