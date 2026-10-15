"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Image, JewelArt } from "@/lib/commerce/types";
import { gaItem, track } from "@/lib/analytics.mjs";

export type CartLine = {
  variantId: string;
  handle: string;
  title: string;
  variantTitle: string;
  price: number;
  currencyCode: string;
  image?: Image | null;
  art?: JewelArt;
  /** lien de la ligne (création de l'atelier) ; sinon la fiche produit */
  href?: string;
  quantity: number;
};

type CartCtx = {
  lines: CartLine[];
  /** Option cadeau : null si non choisie */
  gift: { message: string } | null;
  setGift: (gift: { message: string } | null) => void;
  count: number;
  subtotal: number;
  isOpen: boolean;
  toast: string | null;
  open: () => void;
  close: () => void;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const STORAGE_KEY = "augustave-cart-v1";
const GIFT_KEY = "augustave-gift-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [gift, setGift] = useState<{ message: string } | null>(null);
  const [isOpen, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const loaded = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
      const g = localStorage.getItem(GIFT_KEY);
      if (g) setGift(JSON.parse(g));
    } catch {}
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
      if (gift) localStorage.setItem(GIFT_KEY, JSON.stringify(gift));
      else localStorage.removeItem(GIFT_KEY);
    } catch {}
  }, [lines, gift]);

  useEffect(() => {
    document.body.classList.toggle("no-scroll", isOpen);
    if (isOpen) track("view_cart", gaCart(lines));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const add = useCallback((line: Omit<CartLine, "quantity">, quantity = 1) => {
    track("add_to_cart", {
      currency: line.currencyCode,
      value: line.price * quantity,
      items: [gaItem({ id: line.handle, name: line.title, variant: line.variantTitle, price: line.price, quantity })],
    });
    setLines((prev) => {
      const existing = prev.find((l) => l.variantId === line.variantId);
      if (existing) return prev.map((l) => (l.variantId === line.variantId ? { ...l, quantity: l.quantity + quantity } : l));
      return [...prev, { ...line, quantity }];
    });
    setOpen(true);
    setToast(`${line.title} a rejoint votre panier`);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const setQuantity = useCallback((variantId: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0 ? prev.filter((l) => l.variantId !== variantId) : prev.map((l) => (l.variantId === variantId ? { ...l, quantity } : l)),
    );
  }, []);

  const value = useMemo<CartCtx>(
    () => ({
      lines,
      gift,
      setGift,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: lines.reduce((n, l) => n + l.quantity * l.price, 0),
      isOpen,
      toast,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add,
      setQuantity,
      remove: (id) => {
        const l = lines.find((x) => x.variantId === id);
        if (l) track("remove_from_cart", gaCart([l]));
        setQuantity(id, 0);
      },
      clear: () => setLines([]),
    }),
    [lines, gift, isOpen, toast, add, setQuantity],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Panier au format GA4 e-commerce */
export const gaCart = (lines: CartLine[]) => ({
  currency: "EUR",
  value: lines.reduce((n, l) => n + l.quantity * l.price, 0),
  items: lines.map((l) => gaItem({ id: l.handle, name: l.title, variant: l.variantTitle, price: l.price, quantity: l.quantity })),
});

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart doit être utilisé dans <CartProvider>");
  return ctx;
}
