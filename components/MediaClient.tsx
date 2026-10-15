"use client";

import { jewelSvg } from "@/lib/jewel-art.mjs";
import type { Image, JewelArt } from "@/lib/commerce/types";

/** Variante légère de <Media> pour les composants client (panier). */
export function MediaClient({ image, art, seed, alt = "" }: { image?: Image | null; art?: JewelArt; seed?: string; alt?: string }) {
  return (
    <div className="media">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image.url} alt={image.alt || alt} loading="lazy" />
      ) : art ? (
        <div className="media__layer" role="img" aria-label={alt} dangerouslySetInnerHTML={{ __html: jewelSvg(art, { seed }) }} />
      ) : null}
    </div>
  );
}
