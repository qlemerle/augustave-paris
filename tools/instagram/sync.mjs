// Récupère les photos Instagram où @augustave.paris est identifié (API Instagram Graph, édition « tags »),
// télécharge les images dans public/images/instagram/ et écrit content/instagram.json.
// Usage : IG_USER_ID=... IG_ACCESS_TOKEN=... node tools/instagram/sync.mjs
// Sans ces variables, le script ne fait rien (la galerie garde son contenu actuel).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const { IG_USER_ID, IG_ACCESS_TOKEN } = process.env;
const API = "https://graph.facebook.com/v21.0";
if (!IG_USER_ID || !IG_ACCESS_TOKEN) {
  console.log("Instagram : IG_USER_ID / IG_ACCESS_TOKEN absents, rien à synchroniser.");
  process.exit(0);
}

const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const choix = read("content/instagram-choix.json");
const catalog = read("lib/commerce/mock/catalog.json");
const imgDir = path.join(root, "public/images/instagram");
fs.mkdirSync(imgDir, { recursive: true });

const FIELDS = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username,children{media_type,media_url,thumbnail_url}";

async function list(edge, limit) {
  const out = [];
  let url = `${API}/${IG_USER_ID}/${edge}?fields=${encodeURIComponent(FIELDS)}&limit=50&access_token=${IG_ACCESS_TOKEN}`;
  while (url && out.length < limit) {
    const res = await fetch(url);
    const json = await res.json();
    if (json.error) throw new Error(`Instagram ${edge} : ${json.error.message}`);
    out.push(...json.data);
    url = json.paging?.next;
  }
  return out;
}

// Associe une publication à un bijou ou une collection d'après sa légende (titres, collections, hashtags)
const norm = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ");
const squash = (s) => norm(s).replace(/ /g, "");
function guessLink(caption) {
  const c = norm(caption);
  const tags = squash(caption);
  const hit = (name) => c.includes(norm(name).trim()) || tags.includes(squash(name));
  const product = catalog.products.find((p) => hit(p.title));
  if (product) return product.handle;
  const col = catalog.collections.find((x) => hit(x.title));
  return col ? `collections/${col.handle}` : null;
}

const imageOf = (m) => {
  if (m.media_type === "CAROUSEL_ALBUM") {
    const first = m.children?.data?.[0];
    return first ? imageOf(first) : null;
  }
  return m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url;
};

const max = choix.maximum || 12;
const media = [...(await list("tags", max * 2)).map((m) => ({ ...m, source: "identifie" }))];
if (choix.propres) media.push(...(await list("media", max)).map((m) => ({ ...m, source: "compte" })));
media.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

const posts = [];
for (const m of media) {
  if (posts.length >= max) break;
  if (choix.masquer.includes(m.id)) continue;
  const src = imageOf(m);
  if (!src) continue;
  const file = `instagram/${m.id}.jpg`;
  const dest = path.join(root, "public/images", file);
  if (!fs.existsSync(dest)) {
    const res = await fetch(src);
    if (!res.ok) continue;
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  }
  posts.push({
    id: m.id,
    username: m.username || null,
    permalink: m.permalink,
    image: file.replace(/\.jpg$/, ""),
    caption: (m.caption || "").slice(0, 300),
    date: m.timestamp,
    source: m.source,
    link: choix.bijoux[m.id] ?? guessLink(m.caption),
  });
}

// on supprime les images des publications qui ne sont plus affichées
const keep = new Set(posts.map((p) => `${p.id}.jpg`));
for (const f of fs.readdirSync(imgDir)) if (!keep.has(f)) fs.rmSync(path.join(imgDir, f));

const out = path.join(root, "content/instagram.json");
const before = fs.readFileSync(out, "utf8");
const prev = JSON.parse(before);
const changed = JSON.stringify(prev.posts) !== JSON.stringify(posts);
if (changed) fs.writeFileSync(out, JSON.stringify({ updatedAt: new Date().toISOString(), posts }, null, 2) + "\n");
console.log(`Instagram : ${posts.length} publication(s)${changed ? ", galerie mise à jour" : ", rien de nouveau"}.`);
