"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "./cart/CartProvider";
import { BagIcon, InstagramIcon } from "./Icons";
import { MediaClient } from "./MediaClient";
import { nav, site } from "@/lib/site";
import type { Category, Collection } from "@/lib/commerce/types";

type Props = { categories: Category[]; collections: Collection[] };

export function Header({ categories, collections }: Props) {
  const pathname = usePathname();
  const cart = useCart();
  const overHero = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const lastY = useRef(0);
  const prevCount = useRef(cart.count);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 400 && y > lastY.current + 4);
      if (y < lastY.current - 4 || y < 400) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    document.body.classList.toggle("no-scroll", menuOpen);
  }, [menuOpen]);
  useEffect(() => {
    if (cart.count > prevCount.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 650);
      prevCount.current = cart.count;
      return () => clearTimeout(t);
    }
    prevCount.current = cart.count;
  }, [cart.count]);

  const cls = ["header", overHero && "header--over-hero", (scrolled || menuOpen) && "header--scrolled", hidden && !menuOpen && "header--hidden"]
    .filter(Boolean)
    .join(" ");
  const featured = collections.slice(0, 2);

  return (
    <>
      <div className="announce" aria-label="Informations">
        <div className="announce__track">
          {[...site.announcements, site.announcements[0]].map((a, i) => (
            <div className="announce__item" key={i} aria-hidden={i === site.announcements.length}>
              {a}
            </div>
          ))}
        </div>
      </div>
      <header className={cls}>
        <div className="container header__inner">
          <nav className="header__nav" aria-label="Navigation principale">
            <button className={`burger ${menuOpen ? "is-open" : ""}`} onClick={() => setMenuOpen((o) => !o)} aria-label="Menu" aria-expanded={menuOpen}>
              <span />
              <span />
            </button>
            {nav.map((item) =>
              item.mega ? (
                <div className="has-mega" key={item.href}>
                  <Link href={item.href} className="nav-link" aria-current={pathname.startsWith(item.href) ? "page" : undefined}>
                    {item.label}
                  </Link>
                  <div className="mega">
                    <div className="container mega__inner">
                      <div>
                        <p className="eyebrow mega__title">Catégories</p>
                        <ul className="mega__list">
                          <li>
                            <Link href="/boutique">Tous les bijoux</Link>
                          </li>
                          {categories.map((c) => (
                            <li key={c.handle}>
                              <Link href={`/boutique/${c.handle}`}>{c.title}</Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="eyebrow mega__title">Collections</p>
                        <ul className="mega__list">
                          {collections.map((c) => (
                            <li key={c.handle}>
                              <Link href={`/collections/${c.handle}`}>{c.title}</Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mega__feature">
                        {featured.map((c) => (
                          <Link href={`/collections/${c.handle}`} className="mega__card" key={c.handle}>
                            <MediaClient image={c.image} art={c.art} seed={c.handle} alt={c.title} />
                            <p>{c.title}</p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link key={item.href} href={item.href} className="nav-link" aria-current={pathname.startsWith(item.href) ? "page" : undefined}>
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <Link href="/" className="brand" aria-label="Augustave Paris, accueil">
            <img className="brand__mark" src="/brand/monogramme-or.png" alt="" width={40} height={37} />
            <span className="brand__name">
              Augustave
              <small>Paris</small>
            </span>
          </Link>

          <div className="header__nav header__nav--right">
            <a href={site.instagram} target="_blank" rel="noreferrer" className="nav-link nav-link--hide-sm" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <button className="nav-link cart-btn" onClick={cart.open} aria-label={`Panier, ${cart.count} article(s)`}>
              <BagIcon />
              <span className={`cart-btn__count ${bump ? "bump" : ""}`}>{cart.count}</span>
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen} inert={!menuOpen}>
        <ul className="mobile-menu__list">
          {[{ href: "/", label: "Accueil" }, ...nav].map((item, i) => (
            <li key={item.href}>
              <Link href={item.href} style={{ ["--i" as string]: i }}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div>
          <p className="eyebrow" style={{ color: "var(--gold-light)", opacity: 0.7 }}>
            Catégories
          </p>
          <div className="mobile-menu__sub">
            {categories.map((c) => (
              <Link key={c.handle} href={`/boutique/${c.handle}`}>
                {c.title}
              </Link>
            ))}
          </div>
        </div>
        <a href={site.instagram} target="_blank" rel="noreferrer" className="mobile-menu__sub">
          {site.instagramHandle}
        </a>
      </div>
    </>
  );
}
