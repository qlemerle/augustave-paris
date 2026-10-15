// Galerie « Vu sur Instagram » : publications où @augustave.paris est identifié.
// Le contenu est écrit par tools/instagram/sync.mjs (voir README, « Vu sur Instagram »).
import data from "@/content/instagram.json";

export type InstaPost = {
  id: string;
  username: string | null;
  permalink: string;
  /** image dans public/images, sans extension (ex. "instagram/1789…") */
  image: string;
  caption: string;
  date: string;
  source: "identifie" | "compte";
  /** bijou (handle) ou "collections/<handle>" associé, sinon null */
  link: string | null;
};

export const instaPosts = data.posts as InstaPost[];

/** Lien interne vers le bijou ou la collection de la publication */
export const instaHref = (link: string | null) => (!link ? null : link.startsWith("collections/") ? `/${link}` : `/produit/${link}`);

export const instaPostsFor = (handle: string) => instaPosts.filter((p) => p.link === handle);
