import Link from "next/link";
import { site } from "@/lib/site";
import type { Category } from "@/lib/commerce/types";

export function Footer({ categories }: { categories: Category[] }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div>
            <img className="footer__logo" src="/brand/logo-or.png" alt="Augustave Paris" />
            <p style={{ maxWidth: 320, margin: 0 }}>
              {site.baseline}. Des bijoux façonnés à la main à Paris, en petites séries, pour raconter votre histoire.
            </p>
          </div>
          <div>
            <h4>Boutique</h4>
            <ul>
              {categories.map((c) => (
                <li key={c.handle}>
                  <Link href={`/boutique/${c.handle}`}>{c.title}</Link>
                </li>
              ))}
              <li>
                <Link href="/sur-mesure">Sur-mesure</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Service client</h4>
            <ul>
              <li>
                <Link href="/infos/livraison-retours">Livraison & retours</Link>
              </li>
              <li>
                <Link href="/infos/entretien">Entretien des bijoux</Link>
              </li>
              <li>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
            </ul>
          </div>
          <div>
            <h4>La Maison</h4>
            <ul>
              <li>
                <Link href="/maison">Notre histoire</Link>
              </li>
              <li>
                <Link href="/collections">Collections</Link>
              </li>
              <li>
                <a href={site.instagram} target="_blank" rel="noreferrer">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} Augustave Paris. Tous droits réservés.</span>
          <span style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Link href="/infos/cgv">CGV</Link>
            <Link href="/infos/mentions-legales">Mentions légales</Link>
            <Link href="/infos/confidentialite">Confidentialité</Link>
          </span>
        </div>
        <p className="footer__word" aria-hidden>
          AUGUSTAVE
        </p>
      </div>
    </footer>
  );
}
