"use client";

import { useState } from "react";
import { useCart } from "./cart/CartProvider";
import { formatPrice } from "@/lib/commerce/format";
import type { Product } from "@/lib/commerce/types";

export function AddToCart({ product }: { product: Product }) {
  const cart = useCart();
  const [variantId, setVariantId] = useState(product.variants.find((v) => v.availableForSale)?.id ?? product.variants[0]?.id);
  const [qty, setQty] = useState(1);
  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const showOptions = product.variants.length > 1;

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <div className="pdp__price">
        {formatPrice(variant.price)}
        {variant.compareAtPrice && (
          <s style={{ marginLeft: 12, color: "var(--muted)", fontSize: 16 }}>{formatPrice(variant.compareAtPrice)}</s>
        )}
      </div>
      {showOptions && (
        <fieldset className="option-group">
          <legend>
            {product.optionName} : <span style={{ textTransform: "none", letterSpacing: 0 }}>{variant.title}</span>
          </legend>
          <div className="option-values">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                className="option-value"
                aria-pressed={v.id === variantId}
                disabled={!v.availableForSale}
                onClick={() => setVariantId(v.id)}
              >
                {v.title}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      <div className="buy-row">
        <div className="qty">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Diminuer la quantité">
            −
          </button>
          <span>{qty}</span>
          <button type="button" onClick={() => setQty((q) => Math.min(10, q + 1))} aria-label="Augmenter la quantité">
            +
          </button>
        </div>
        <button
          type="button"
          className="btn btn--solid"
          disabled={!variant.availableForSale}
          onClick={() =>
            cart.add(
              {
                variantId: variant.id,
                handle: product.handle,
                title: product.title,
                variantTitle: variant.title,
                price: variant.price.amount,
                currencyCode: variant.price.currencyCode,
                image: product.images[0] ?? null,
                art: product.art,
              },
              qty,
            )
          }
        >
          {variant.availableForSale ? "Ajouter au panier" : "Épuisé"}
        </button>
      </div>
    </div>
  );
}
