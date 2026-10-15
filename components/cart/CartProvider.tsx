"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Image, JewelArt } from "@/lib/commerce/types";

export type CartLine = {
  variantId: string;
  handle: string;
  title: string;
  variantTitle: string;
  price: number;
  currencyCode: string;
  image?: Image | null;
  art?: JewelArt;
  quantity: number;
};

type CartCtx = {
  lines: CartLine[];
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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const loaded = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {}
  }, [lines]);

  useEffect(() => {
    document.body.classList.toggle("no-scroll", isOpen);
  }, [isOpen]);

  const add = useCallback((line: Omit<CartLine, "quantity">, quantity = 1) => {
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
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: lines.reduce((n, l) => n + l.quantity * l.price, 0),
      isOpen,
      toast,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add,
      setQuantity,
      remove: (id) => setQuantity(id, 0),
      clear: () => setLines([]),
    }),
    [lines, isOpen, toast, add, setQuantity],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart doit être utilisé dans <CartProvider>");
  return ctx;
}
