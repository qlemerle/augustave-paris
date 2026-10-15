import type { Metadata, Viewport } from "next";
import "./globals.css";
import { commerce } from "@/lib/commerce";
import { site } from "@/lib/site";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RevealObserver } from "@/components/RevealObserver";
import { Fx } from "@/components/Fx";
import { Chrome } from "@/components/Chrome";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: `${site.name} · ${site.baseline}`, template: `%s · ${site.name}` },
  description: site.description,
  icons: { icon: "/favicon.png", apple: "/apple-touch-icon.png" },
  openGraph: { siteName: site.name, locale: "fr_FR", type: "website", images: ["/brand/logo-original.jpg"] },
};

export const viewport: Viewport = { themeColor: "#0e2340" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [categories, collections] = await Promise.all([commerce.getCategories(), commerce.getCollections()]);
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..600;1,6..96,400..500&family=Jost:wght@400;500&display=swap"
        />
      </head>
      <body>
        <Chrome />
        <CartProvider>
          <Header categories={categories} collections={collections} />
          <main>{children}</main>
          <Footer categories={categories} />
          <CartDrawer />
        </CartProvider>
        <RevealObserver />
        <Fx />
      </body>
    </html>
  );
}
