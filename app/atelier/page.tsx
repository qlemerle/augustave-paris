import type { Metadata } from "next";
import { Atelier } from "@/components/Atelier";

export const metadata: Metadata = {
  title: "L'atelier · Créez votre collier",
  description: "Composez votre collier Augustave Paris : le fil, la longueur, les perles et le pendentif. Il se dessine sous vos yeux.",
};

export default function Page() {
  return (
    <>
      <section className="container page-hero">
        <h1 className="display h1">L&apos;atelier</h1>
        <p className="lead">
          Choisissez le fil, la longueur, vos perles et un pendentif : votre collier se compose sous vos yeux. Envoyez-le ensuite à la créatrice, qui le réalise à la main.
        </p>
      </section>
      <section className="container atelier-page">
        <Atelier />
      </section>
    </>
  );
}
