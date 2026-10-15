"use client";

import { useEffect, useState } from "react";
import { jewelSvg } from "@/lib/jewel-art.mjs";
import { copyLink, shareLink, shareStory, shareUrls } from "@/lib/share.mjs";
import type { JewelArt } from "@/lib/commerce/types";

type Props = { handle: string; title: string; price: string; collection?: string; image?: string | null; art?: JewelArt };

/** Boutons de partage d'un bijou : story Instagram, lien, WhatsApp, Pinterest. */
export function ShareProduct({ handle, title, price, collection, image, art }: Props) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const data = () => {
    const url = `${location.origin}/produit/${handle}`;
    return {
      handle,
      title,
      price,
      collection: collection ? `Collection ${collection}` : "",
      url,
      image: image ? new URL(image, location.origin).toString() : null,
      art: !image && art ? jewelSvg(art, { seed: handle }) : null,
    };
  };
  const flash = (t: string) => {
    setMsg(t);
    setTimeout(() => setMsg(""), 3200);
  };
  const story = async () => {
    setBusy(true);
    const r = await shareStory(data()).catch(() => "failed");
    setBusy(false);
    if (r === "downloaded") flash("Image enregistrée : publiez-la en story depuis votre téléphone.");
    if (r === "failed") flash("Le partage n'a pas fonctionné, réessayez.");
  };
  const link = async () => {
    const r = await shareLink(data());
    if (r === "copied") flash("Lien copié.");
  };
  const [urls, setUrls] = useState<ReturnType<typeof shareUrls> | null>(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setUrls(shareUrls(data())), [handle]);
  return (
    <div className="share">
      <span className="share__label">Partager</span>
      <div className="share__row">
        <button type="button" className="share__btn share__btn--main" onClick={story} disabled={busy}>
          {busy ? "Préparation…" : "En story Instagram"}
        </button>
        <button type="button" className="share__btn" onClick={link}>
          Envoyer le lien
        </button>
        <a className="share__btn" href={urls?.whatsapp ?? "#"} target="_blank" rel="noreferrer" onClick={(e) => !urls && e.preventDefault()}>
          WhatsApp
        </a>
        <a className="share__btn" href={urls?.pinterest ?? "#"} target="_blank" rel="noreferrer" onClick={(e) => !urls && e.preventDefault()}>
          Pinterest
        </a>
        <button type="button" className="share__btn" onClick={async () => flash((await copyLink(data().url)) === "copied" ? "Lien copié." : "Copie impossible.")}>
          Copier le lien
        </button>
      </div>
      <p className="share__msg" aria-live="polite">
        {msg}
      </p>
    </div>
  );
}
