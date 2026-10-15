import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { commerce } from "@/lib/commerce";
import { ShopView } from "@/components/ShopView";

type Props = { params: Promise<{ categorie: string }>; searchParams: Promise<{ tri?: string }> };

export async function generateStaticParams() {
  return (await commerce.getCategories()).map((c) => ({ categorie: c.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await commerce.getCategory((await params).categorie);
  return c ? { title: c.title, description: c.description } : {};
}

export default async function Page({ params, searchParams }: Props) {
  const { categorie } = await params;
  if (!(await commerce.getCategory(categorie))) notFound();
  const { tri } = await searchParams;
  return <ShopView category={categorie} tri={tri} />;
}
