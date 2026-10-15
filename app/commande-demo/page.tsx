import Link from "next/link";

export const metadata = { title: "Commande (démonstration)", robots: { index: false } };

export default function Page() {
  return (
    <section className="container page-hero" style={{ minHeight: "60vh", alignContent: "center" }}>
      <img src="/brand/monogramme-or.png" alt="" style={{ width: 90 }} />
      <span className="eyebrow">Mode démonstration</span>
      <h1 className="display h2">
        Ici s&apos;ouvrira le <em>paiement sécurisé</em>
      </h1>
      <p className="lead">
        Une fois la boutique Shopify connectée (COMMERCE_PROVIDER=shopify), ce bouton redirige vers le paiement Shopify avec le contenu du panier.
      </p>
      <Link href="/boutique" className="btn">
        Retour à la boutique
      </Link>
    </section>
  );
}
