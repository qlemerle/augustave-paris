"use client";

import Link from "next/link";
import { useEffect, useTransition, useState } from "react";
import { useCart } from "./CartProvider";
import { startCheckout } from "@/app/actions";
import { formatPrice } from "@/lib/commerce/format";
import { site } from "@/lib/site";
import { MediaClient } from "../MediaClient";

export function CartDrawer() {
  const cart = useCart();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const remaining = Math.max(0, site.freeShippingFrom - cart.subtotal);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && cart.close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cart]);

  const checkout = () =>
    startTransition(async () => {
      setError(null);
      const res = await startCheckout(cart.lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })));
      if ("checkoutUrl" in res) window.location.href = res.checkoutUrl;
      else setError(res.error);
    });

  return (
    <>
      <div className={`drawer-backdrop ${cart.isOpen ? "is-open" : ""}`} onClick={cart.close} aria-hidden />
      <aside className={`drawer ${cart.isOpen ? "is-open" : ""}`} aria-label="Panier" aria-hidden={!cart.isOpen} inert={!cart.isOpen}>
        <div className="drawer__head">
          <h2>Votre panier</h2>
          <button className="drawer__close" onClick={cart.close}>
            Fermer
          </button>
        </div>

        {cart.lines.length === 0 ? (
          <div className="drawer__body">
            <div className="drawer__empty">
              <img src="/brand/monogramme-or.png" alt="" />
              <p className="lead">Votre panier attend son premier bijou.</p>
              <Link href="/boutique" className="btn" onClick={cart.close}>
                Découvrir la boutique
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="drawer__body">
              <div className="progress">
                {remaining > 0 ? (
                  <>Plus que {formatPrice(remaining)} pour profiter de la livraison offerte</>
                ) : (
                  <>La livraison vous est offerte</>
                )}
                <div className="progress__bar">
                  <span style={{ width: `${Math.min(100, (cart.subtotal / site.freeShippingFrom) * 100)}%` }} />
                </div>
              </div>
              {cart.lines.map((l) => (
                <div className="line-item" key={l.variantId}>
                  <Link href={`/produit/${l.handle}`} onClick={cart.close}>
                    <MediaClient image={l.image} art={l.art} seed={l.handle} alt={l.title} />
                  </Link>
                  <div>
                    <h3>{l.title}</h3>
                    <p>{l.variantTitle}</p>
                    <div className="line-item__actions">
                      <div className="qty">
                        <button onClick={() => cart.setQuantity(l.variantId, l.quantity - 1)} aria-label="Retirer un">
                          −
                        </button>
                        <span>{l.quantity}</span>
                        <button onClick={() => cart.setQuantity(l.variantId, l.quantity + 1)} aria-label="Ajouter un">
                          +
                        </button>
                      </div>
                      <button className="line-item__remove" onClick={() => cart.remove(l.variantId)}>
                        Retirer
                      </button>
                    </div>
                  </div>
                  <div className="line-item__price">{formatPrice(l.price * l.quantity, l.currencyCode)}</div>
                </div>
              ))}
            </div>
            <div className="drawer__foot">
              <div className="drawer__total">
                <span>Sous-total</span>
                <strong>{formatPrice(cart.subtotal)}</strong>
              </div>
              <p className="form-note" style={{ margin: 0 }}>
                Taxes incluses. Frais de livraison calculés à l&apos;étape suivante.
              </p>
              {error && <p className="notice">{error}</p>}
              <button className="btn btn--solid btn--block" onClick={checkout} disabled={pending}>
                {pending ? "Redirection…" : "Passer commande"}
              </button>
            </div>
          </>
        )}
      </aside>
      <div className={`toast ${cart.toast ? "is-visible" : ""}`} role="status">
        {cart.toast}
      </div>
    </>
  );
}
