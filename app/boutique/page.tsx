import type { Metadata } from "next";
import { ShopView } from "@/components/ShopView";

export const metadata: Metadata = { title: "Boutique" };

export default async function Page({ searchParams }: { searchParams: Promise<{ tri?: string }> }) {
  const { tri } = await searchParams;
  return <ShopView tri={tri} />;
}
