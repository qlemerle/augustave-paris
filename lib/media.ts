import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Image } from "./commerce/types";

const EXTS = ["webp", "avif", "jpg", "jpeg", "png"];

/**
 * Cherche une photo éditoriale dans /public/images (ex. "accueil/hero-1"
 * trouve public/images/accueil/hero-1.jpg). Renvoie null si elle n'existe pas encore,
 * auquel cas les composants affichent une illustration de remplacement.
 */
export function findImage(name: string, alt = ""): Image | null {
  for (const ext of EXTS) {
    const rel = `/images/${name}.${ext}`;
    if (fs.existsSync(path.join(process.cwd(), "public", rel))) return { url: rel, alt };
  }
  return null;
}
