// Génère preview/index.html : aperçu statique autonome (une seule page) du site.
// Usage : node --no-warnings preview/build.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as content from "../lib/site.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const b64 = (p, type) => `data:${type};base64,` + fs.readFileSync(path.join(here, p)).toString("base64");

const css = read("app/globals.css");
const catalog = JSON.parse(read("lib/commerce/mock/catalog.json"));
const jewel = read("lib/jewel-art.mjs").replace(/^export /gm, "");
const fx = read("lib/fx.mjs").replace(/^export /gm, "");
const atelier = read("lib/atelier.mjs").replace(/^export /gm, "");
const share = read("lib/share.mjs").replace(/^export /gm, "");
// photos disponibles (publiées à côté de la page sous images/...)
const listDir = (dir, base = "") =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? listDir(path.join(dir, e.name), base + e.name + "/") : /\.(jpe?g|png|webp|avif)$/i.test(e.name) ? [base + e.name] : [],
  );
const images = listDir(path.join(root, "public/images"));
fs.writeFileSync(path.join(here, "images.json"), JSON.stringify(images, null, 2));
const data = {
  catalog,
  site: content.site,
  nav: content.nav,
  heroSlides: content.heroSlides,
  promises: content.promises,
  bespokeSteps: content.bespokeSteps,
  infoPages: content.infoPages,
  story: content.story,
  images,
  mono: b64("mono.webp", "image/webp"),
  logo: b64("logo.webp", "image/webp"),
};

const html = `<title>Augustave Paris</title>
<meta name="description" content="Aperçu du site Augustave Paris, bijoux d'auteur faits main.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..600;1,6..96,400..500&family=Jost:wght@400;500&display=swap">
<style>
:root { color-scheme: light; }
${css}
#shell-top, #shell-bottom { display: contents; }
</style>
<div id="shell-top"></div>
<main id="app"></main>
<div id="shell-bottom"></div>
<script>
${jewel}
window.__DATA = ${JSON.stringify(data)};
window.__DATA.jewelSvg = jewelSvg;
${fx}
window.__DATA.fx = { initPreloader, curtainCover, curtainReveal, initPageFx };
window.__DATA.atelier = (() => {
${atelier}
return { mountAtelier, decodeDesign, describeDesign };
})();
window.__DATA.share = (() => {
${share}
return { shareStory, shareLink, copyLink, shareUrls };
})();
</script>
<script>
${fs.readFileSync(path.join(here, "app.js"), "utf8")}
</script>
`;
fs.writeFileSync(path.join(here, "index.html"), html);
console.log(`preview/index.html : ${(html.length / 1024).toFixed(0)} Ko`);

// --site <dossier> : page autonome + photos, prête pour GitHub Pages
const i = process.argv.indexOf("--site");
if (i > -1) {
  const out = path.resolve(process.argv[i + 1] || "_site");
  fs.mkdirSync(out, { recursive: true });
  const doc = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="favicon.png">
<meta name="robots" content="noindex">
${html.replace("<div id=\"shell-top\">", "</head>\n<body>\n<div id=\"shell-top\">")}</body>
</html>
`;
  fs.writeFileSync(path.join(out, "index.html"), doc);
  fs.cpSync(path.join(root, "public/images"), path.join(out, "images"), { recursive: true });
  fs.cpSync(path.join(root, "public/models"), path.join(out, "models"), { recursive: true });
  fs.copyFileSync(path.join(root, "public/favicon.png"), path.join(out, "favicon.png"));
  fs.writeFileSync(path.join(out, ".nojekyll"), "");
  console.log(`site autonome : ${out}`);
}
