import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container page-hero" style={{ minHeight: "60vh", alignContent: "center" }}>
      <span className="eyebrow">Erreur 404</span>
      <h1 className="display h2">
        Cette page s&apos;est <em>égarée</em>
      </h1>
      <Link href="/boutique" className="btn">
        Retour à la boutique
      </Link>
    </section>
  );
}
