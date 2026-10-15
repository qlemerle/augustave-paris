import type { Money } from "./types";

export function formatPrice(m: Money | number, currencyCode = "EUR") {
  const amount = typeof m === "number" ? m : m.amount;
  const code = typeof m === "number" ? currencyCode : m.currencyCode;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: code,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}
