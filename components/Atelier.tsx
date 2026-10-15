"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { decodeDesign, mountAtelier } from "@/lib/atelier.mjs";
import { useCart } from "./cart/CartProvider";

export const CREATION_KEY = "augustave-creation";

/** Monte l'atelier interactif (lib/atelier.mjs). La création suit l'URL (?d=…) pour être partagée. */
export function Atelier() {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const cart = useCart();
  const add = useRef(cart.add);
  add.current = cart.add;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const initial = decodeDesign(new URLSearchParams(location.search).get("d"));
    return mountAtelier(el, {
      initial: initial ?? undefined,
      onChange: (code: string) => {
        const url = new URL(location.href);
        url.searchParams.set("d", code);
        history.replaceState(history.state, "", url);
      },
      onOrder: ({ code, text, price, thumb }: { code: string; text: string; price: number; thumb: string }) =>
        add.current({
          variantId: `atelier:${code}`,
          handle: "atelier",
          title: "Ma création de l'atelier",
          variantTitle: text,
          price,
          currencyCode: "EUR",
          image: { url: thumb, alt: text },
          href: `/atelier?d=${code}`,
        }),
      onSend: (code: string) => {
        try {
          sessionStorage.setItem(CREATION_KEY, code);
        } catch {}
        router.push(`/sur-mesure?creation=${encodeURIComponent(code)}#demande`);
      },
    });
  }, [router]);
  return <div ref={ref} className="atelier" />;
}
