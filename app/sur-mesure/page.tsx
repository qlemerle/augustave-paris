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

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container split">
          <div className="split__media">
            <div className="reveal reveal--mask">
              <Media image={findImage("sur-mesure/atelier", "Atelier Augustave")} art={art} seed="sm-1" alt="Atelier" />
            </div>
          </div>
          <div className="split__body">
            <h2 className="display h2 reveal">
              Trois étapes, <em>une histoire</em>
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
            <Link href="/atelier" className="btn btn--solid reveal" style={{ justifySelf: "start" }}>
              Composer mon collier dans l&apos;atelier
            </Link>
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
