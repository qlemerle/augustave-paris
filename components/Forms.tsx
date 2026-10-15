"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { decodeDesign, describeDesign } from "@/lib/atelier.mjs";
import { track } from "@/lib/analytics.mjs";

// Newsletter : à relier à Shopify (customerCreate avec acceptsMarketing) ou à Klaviyo / Brevo.
export function NewsletterForm() {
  const [done, setDone] = useState(false);
  return done ? (
    <p className="lead" style={{ margin: 0 }}>
      Merci, vous êtes inscrite. À très vite dans votre boîte mail.
    </p>
  ) : (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        track("sign_up", { method: "newsletter" });
        setDone(true);
      }}
    >
      <div className="field-inline">
        <input type="email" required placeholder="Votre adresse e-mail" aria-label="Adresse e-mail" />
        <button type="submit">S&apos;inscrire</button>
      </div>
      <p className="form-note">Nouveautés, éditions limitées et coulisses de l&apos;atelier. Désinscription en un clic.</p>
    </form>
  );
}

// Demande sur-mesure : ouvre la messagerie avec un e-mail prérempli (aucun serveur nécessaire).
export function BespokeForm() {
  const [sent, setSent] = useState(false);
  const [creation, setCreation] = useState<{ code: string; text: string } | null>(null);
  // Création venue de l'atelier (?creation=… ou mémorisée pendant la visite)
  useEffect(() => {
    let code = new URLSearchParams(location.search).get("creation");
    try {
      code = code || sessionStorage.getItem("augustave-creation");
    } catch {}
    const design = decodeDesign(code);
    if (code && design) {
      setCreation({ code, text: describeDesign(design) });
      if (location.hash === "#demande") setTimeout(() => document.getElementById("demande")?.scrollIntoView({ behavior: "smooth" }), 700);
    }
  }, []);
  return sent ? (
    <div className="notice">Votre messagerie s&apos;est ouverte avec votre demande. Nous vous répondons sous 48 h.</div>
  ) : (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const body = [
          `Prénom : ${f.get("prenom")}`,
          `E-mail : ${f.get("email")}`,
          `Type de bijou : ${f.get("type")}`,
          `Occasion : ${f.get("occasion")}`,
          ...(creation ? ["", `Ma création : ${creation.text}`, `${location.origin}/atelier?d=${creation.code}`] : []),
          "",
          `${f.get("histoire")}`,
        ].join("\n");
        track("generate_lead", { form: "sur-mesure", creation: !!creation });
        window.location.href = `mailto:${site.email}?subject=${encodeURIComponent("Édition Votre Histoire")}&body=${encodeURIComponent(body)}`;
        setSent(true);
      }}
    >
      <div className="form__row">
        <div className="field">
          <label htmlFor="prenom">Prénom</label>
          <input id="prenom" name="prenom" required autoComplete="given-name" />
        </div>
        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" required autoComplete="email" />
        </div>
      </div>
      <div className="form__row">
        <div className="field">
          <label htmlFor="type">Bijou souhaité</label>
          <select id="type" name="type" defaultValue="Collier">
            <option>Collier</option>
            <option>Sautoir</option>
            <option>Ras-de-cou</option>
            <option>Bracelet</option>
            <option>Boucles d&apos;oreilles</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="occasion">Occasion</label>
          <select id="occasion" name="occasion" defaultValue="Pour moi">
            <option>Pour moi</option>
            <option>Un cadeau</option>
            <option>Une naissance</option>
            <option>Un mariage</option>
            <option>Un anniversaire</option>
          </select>
        </div>
      </div>
      {creation && (
        <div className="creation-note">
          <strong>Votre création de l&apos;atelier</strong>
          <span>{creation.text}</span>
          <a className="link-underline" href={`/atelier?d=${creation.code}`}>
            La modifier
          </a>
        </div>
      )}
      <div className="field">
        <label htmlFor="histoire">Votre histoire</label>
        <textarea
          id="histoire"
          name="histoire"
          required={!creation}
          placeholder={creation ? "Un prénom, une date, pour qui est ce collier… dites-nous en un peu plus." : "Couleurs, prénom, date, souvenir… racontez-nous."}
        />
      </div>
      <button className="btn btn--light" type="submit" style={{ justifySelf: "start" }}>
        Envoyer ma demande
      </button>
    </form>
  );
}
