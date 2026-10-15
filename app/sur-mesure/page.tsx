import type { Metadata } from "next";
import Link from "next/link";
import { commerce } from "@/lib/commerce";
import { findImage } from "@/lib/media";
import { bespokeSteps } from "@/lib/site";
import { Media } from "@/components/Media";
import { BespokeForm } from "@/components/Forms";

export const metadata: Metadata = {
  title: "Édition Votre Histoire · Sur-mesure",
  description: "Créons ensemble votre collier sur-mesure : couleurs, prénom, date, souvenir.",
};

export default async function Page() {
  const collections = await commerce.getCollections();
  const art = collections.find((c) => c.handle === "la-nacree")?.art;
  return (
    <>
      <section className="container page-hero">
        <h1 className="display h1">
          Édition <em>Votre Histoire</em>
        </h1>
        <p className="lead">
          On crée ensemble votre collier sur-mesure. Une pièce unique, imaginée à partir de ce qui compte pour vous, et façonnée à la main dans notre atelier.
        </p>
      </section>

      <section className="container paths" aria-label="Deux façons de créer votre bijou">
        <div className="path-card reveal">
          <span className="path-card__kicker">Tout de suite, en ligne</span>
          <h2 className="display h3">Composer moi-même</h2>
          <p>
            Dans l&apos;atelier en ligne, vous choisissez le fil, la longueur, les perles et le pendentif. Le collier se dessine sous vos yeux, vous l&apos;essayez sur
            votre photo et vous le commandez aussitôt.
          </p>
          <ul>
            <li>Prix affiché en direct, de 45 à 250 €</li>
            <li>Commande immédiate, expédié sous 2 à 3 semaines</li>
          </ul>
          <Link href="/atelier" className="btn btn--solid">
            Ouvrir l&apos;atelier
          </Link>
        </div>
        <div className="path-card path-card--navy reveal" style={{ ["--d" as string]: "120ms" }}>
          <span className="path-card__kicker">Pièce unique, avec la créatrice</span>
          <h2 className="display h3">Raconter mon histoire</h2>
          <p>
            Pour ce que l&apos;atelier ne sait pas faire : un prénom ou une date, une pierre de naissance, des perles choisies rien que pour vous, un bijou de
            famille à transformer, un cadeau pour une occasion précise.
          </p>
          <ul>
            <li>Une première proposition sous 48 h, avec croquis</li>
            <li>À partir de 90 €, façonné en 2 à 3 semaines</li>
          </ul>
          <a href="#demande" className="btn btn--light">
            Écrire à la créatrice
          </a>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div className="split__media">
            <div className="reveal reveal--mask">
              <Media image={findImage("sur-mesure/atelier", "Atelier Augustave")} art={art} seed="sm-1" alt="Atelier" />
            </div>
          </div>
          <div className="split__body">
            <h2 className="display h2 reveal">
              Avec la créatrice, <em>en trois étapes</em>
            </h2>
            <ol className="steps reveal" style={{ color: "var(--navy)" }}>
              {bespokeSteps.map((s) => (
                <li key={s.title} style={{ borderColor: "var(--line)" }}>
                  <div>
                    <strong>{s.title}</strong>
                    <span>{s.text}</span>
                  </div>
                </li>
              ))}
            </ol>
            <p className="lead reveal" style={{ fontSize: 15 }}>
              Délai de création : 2 à 3 semaines. Tarif à partir de 90 €, selon les perles et pendentifs choisis.
            </p>
            <a href="#demande" className="btn btn--solid reveal" style={{ justifySelf: "start" }}>
              Raconter mon histoire
            </a>
          </div>
        </div>
      </section>

      <section className="section section--navy" id="demande">
        <div className="container split">
          <div className="split__body">
            <h2 className="display h2 reveal">
              Racontez-nous <em>votre histoire</em>
            </h2>
            <p className="lead reveal">Nous revenons vers vous sous 48 h avec une première proposition.</p>
          </div>
          <div className="reveal">
            <BespokeForm />
          </div>
        </div>
      </section>
    </>
  );
}
