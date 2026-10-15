// L'atelier sur-mesure : on compose son collier (fil, longueur, perles, pendentif)
// et il se dessine en direct, perle après perle. JavaScript pur, partagé par le site
// Next.js (components/Atelier.tsx) et l'aperçu statique (preview/).

const hx = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const toHex = (a) => "#" + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const mix = (a, b, t) => toHex(hx(a).map((v, i) => v + (hx(b)[i] - v) * t));
const light = (c, t) => mix(c, "#ffffff", t);
const dark = (c, t) => mix(c, "#000000", t);

function spline(pts, closed = false, steps = 40) {
  const P = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
  const out = [];
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    for (let k = 0; k < steps; k++) {
      const t = k / steps, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
    }
  }
  if (!closed) out.push(pts[pts.length - 1]);
  else out.push(out[0]);
  return out;
}
function measure(poly) {
  const L = [0];
  for (let i = 1; i < poly.length; i++) L.push(L[i - 1] + Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]));
  return L;
}
function at(poly, L, d) {
  let i = 1;
  while (i < L.length - 1 && L[i] < d) i++;
  const t = (d - L[i - 1]) / (L[i] - L[i - 1] || 1);
  const a = poly[i - 1], b = poly[i];
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, Math.atan2(b[1] - a[1], b[0] - a[0])];
}
const pathD = (poly) => "M" + poly.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L");

class Defs {
  constructor() { this.map = new Map(); }
  grad(kind, c) {
    const id = `${kind}${c.slice(1)}`;
    if (this.map.has(id)) return `url(#${id})`;
    let g;
    if (kind === "pearl")
      g = `<radialGradient id="${id}" cx=".36" cy=".32" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="${light(c, 0.5)}"/><stop offset=".75" stop-color="${c}"/><stop offset=".92" stop-color="${mix(c, "#c9b7c4", 0.35)}"/><stop offset="1" stop-color="${dark(c, 0.25)}"/></radialGradient>`;
    else if (kind === "matte")
      g = `<radialGradient id="${id}" cx=".38" cy=".34" r=".8"><stop offset="0" stop-color="${light(c, 0.28)}"/><stop offset=".6" stop-color="${c}"/><stop offset="1" stop-color="${dark(c, 0.38)}"/></radialGradient>`;
    else if (kind === "metal")
      g = `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${light(c, 0.55)}"/><stop offset=".35" stop-color="${c}"/><stop offset=".6" stop-color="${dark(c, 0.3)}"/><stop offset=".8" stop-color="${light(c, 0.25)}"/><stop offset="1" stop-color="${dark(c, 0.35)}"/></linearGradient>`;
    else
      g = `<radialGradient id="${id}" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="${light(c, 0.55)}"/><stop offset=".3" stop-color="${light(c, 0.12)}"/><stop offset=".7" stop-color="${c}"/><stop offset="1" stop-color="${dark(c, 0.45)}"/></radialGradient>`;
    this.map.set(id, g);
    return `url(#${id})`;
  }
  toString() { return [...this.map.values()].join(""); }
}

const GOLD = "#c9a35c";

function bead(D, x, y, r, c, kind = "glass", rot = 0) {
  let s = "";
  if (kind === "facet") {
    // perle à facettes : octogone + éclats
    const pts = [...Array(8)].map((_, i) => {
      const a = rot + (i * Math.PI) / 4 + Math.PI / 8;
      return [x + Math.cos(a) * r, y + Math.sin(a) * r * 0.92];
    });
    s += `<polygon points="${pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ")}" fill="${D.grad("glass", c)}"/>`;
    s += `<polygon points="${x - r * 0.55},${y - r * 0.15} ${x - r * 0.15},${y - r * 0.62} ${x + r * 0.1},${y - r * 0.2} ${x - r * 0.3},${y + r * 0.15}" fill="#fff" opacity=".38"/>`;
    s += `<polygon points="${x + r * 0.2},${y + r * 0.25} ${x + r * 0.62},${y + r * 0.05} ${x + r * 0.5},${y + r * 0.55}" fill="${dark(c, 0.5)}" opacity=".45"/>`;
    s += `<circle cx="${x - r * 0.38}" cy="${y - r * 0.4}" r="${r * 0.14}" fill="#fff" opacity=".9"/>`;
    return s;
  }
  if (kind === "pearl") {
    s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${D.grad("pearl", c)}"/>`;
    s += `<ellipse cx="${x - r * 0.32}" cy="${y - r * 0.36}" rx="${r * 0.22}" ry="${r * 0.14}" fill="#fff" opacity=".85" transform="rotate(-30 ${x - r * 0.32} ${y - r * 0.36})"/>`;
    return s;
  }
  if (kind === "matte") {
    s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${D.grad("matte", c)}"/>`;
    s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" filter="url(#mottle)" opacity=".35"/>`;
    s += `<ellipse cx="${x - r * 0.35}" cy="${y - r * 0.4}" rx="${r * 0.28}" ry="${r * 0.18}" fill="#fff" opacity=".22"/>`;
    return s;
  }
  if (kind === "gold") {
    s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${D.grad("metal", GOLD)}"/>`;
    s += `<circle cx="${x - r * 0.35}" cy="${y - r * 0.38}" r="${r * 0.2}" fill="#fff8e6" opacity=".9"/>`;
    return s;
  }
  // verre
  s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${D.grad("glass", c)}"/>`;
  s += `<ellipse cx="${x + r * 0.25}" cy="${y + r * 0.42}" rx="${r * 0.38}" ry="${r * 0.16}" fill="${light(c, 0.4)}" opacity=".35"/>`;
  s += `<ellipse cx="${x - r * 0.34}" cy="${y - r * 0.38}" rx="${r * 0.22}" ry="${r * 0.13}" fill="#fff" opacity=".9" transform="rotate(-35 ${x - r * 0.34} ${y - r * 0.38})"/>`;
  return s;
}

function pendant(D, kind, x, y, s = 1, accent = GOLD) {
  const g = D.grad("metal", GOLD);
  const T = (inner) => `<g transform="translate(${x} ${y}) scale(${s})">${inner}</g>`;
  switch (kind) {
    case "heart":
      return T(
        `<circle cx="0" cy="-8" r="9" fill="none" stroke="${g}" stroke-width="5"/>` +
          `<path d="M0 92 C-70 44 -66 -4 -32 -6 C-14 -7 -3 6 0 18 C3 6 14 -7 32 -6 C66 -4 70 44 0 92Z" fill="${g}"/>` +
          `<path d="M0 82 C-56 42 -54 6 -30 4 C-16 3 -5 14 0 26 C5 14 16 3 30 4 C54 6 56 42 0 82Z" fill="none" stroke="${dark(GOLD, 0.3)}" stroke-width="2" opacity=".6"/>` +
          `<circle cx="0" cy="40" r="8" fill="${dark(GOLD, 0.55)}"/><rect x="-3.5" y="42" width="7" height="18" rx="2" fill="${dark(GOLD, 0.55)}"/>` +
          `<path d="M-38 12 C-40 2 -30 -2 -22 2" stroke="#fff" stroke-width="5" fill="none" opacity=".6" stroke-linecap="round"/>`
      );
    case "key":
      return T(
        `<circle cx="0" cy="12" r="16" fill="none" stroke="${g}" stroke-width="7"/>` +
          `<rect x="-4" y="26" width="8" height="78" rx="3" fill="${g}"/>` +
          `<rect x="4" y="80" width="18" height="7" fill="${g}"/><rect x="4" y="94" width="12" height="7" fill="${g}"/>`
      );
    case "coin":
      return T(
        `<circle cx="0" cy="-6" r="7" fill="none" stroke="${g}" stroke-width="4"/>` +
          `<circle cx="0" cy="34" r="36" fill="${g}"/><circle cx="0" cy="34" r="27" fill="none" stroke="${dark(GOLD, 0.3)}" stroke-width="2" opacity=".55"/>` +
          `<path d="M0 14 L6 28 L21 29 L9 38 L13 53 L0 44 L-13 53 L-9 38 L-21 29 L-6 28Z" fill="${light(GOLD, 0.3)}" opacity=".7"/>` +
          `<ellipse cx="-14" cy="18" rx="10" ry="6" fill="#fff" opacity=".45" transform="rotate(-35 -14 18)"/>`
      );
    case "nacre":
    case "shell": {
      const pearlC = kind === "shell" ? "#55595f" : "#f7efe6";
      return T(
        `<circle cx="0" cy="-6" r="7" fill="none" stroke="${g}" stroke-width="4"/>` +
          `<path d="M0 0 C40 -2 62 30 58 62 C54 98 18 112 -12 106 C-48 98 -64 64 -54 32 C-46 8 -24 1 0 0Z" fill="url(#nacre)"/>` +
          `<path d="M0 0 C40 -2 62 30 58 62 C54 98 18 112 -12 106 C-48 98 -64 64 -54 32 C-46 8 -24 1 0 0Z" fill="none" stroke="${GOLD}" stroke-width="5" opacity=".9"/>` +
          `<path d="M-30 30 C-10 18 18 22 34 40 M-36 60 C-12 46 22 52 40 72" stroke="#fff" stroke-width="3" fill="none" opacity=".55"/>` +
          bead(D, 2, 56, 20, pearlC, "pearl")
      );
    }
    case "stone":
      return T(
        `<circle cx="0" cy="-6" r="7" fill="none" stroke="${g}" stroke-width="4"/>` +
          `<circle cx="0" cy="40" r="44" fill="${g}"/>` +
          `<circle cx="0" cy="40" r="30" fill="url(#nacre)"/>` +
          bead(D, 0, 40, 18, "#5d6167", "pearl")
      );
    case "drop":
      return T(
        `<circle cx="0" cy="-6" r="7" fill="none" stroke="${g}" stroke-width="4"/>` +
          `<path d="M0 0 C22 36 32 56 32 74 C32 96 17 110 0 110 C-17 110 -32 96 -32 74 C-32 56 -22 36 0 0Z" fill="${D.grad("glass", accent)}"/>` +
          `<ellipse cx="-12" cy="70" rx="7" ry="16" fill="#fff" opacity=".55"/>`
      );
    case "leaf":
      return T(
        `<circle cx="0" cy="-6" r="7" fill="none" stroke="${g}" stroke-width="4"/>` +
          `<g transform="rotate(-14)"><path d="M0 0 C46 26 52 84 0 128 C-52 84 -46 26 0 0Z" fill="${g}"/>` +
          `<path d="M0 10 L0 120 M0 40 L22 26 M0 64 L28 48 M0 88 L24 76 M0 40 L-22 26 M0 64 L-28 48 M0 88 L-24 76" stroke="${dark(GOLD, 0.35)}" stroke-width="2.5" fill="none" opacity=".7"/>` +
          `<path d="M-14 30 C-24 50 -24 70 -14 92" stroke="#fff" stroke-width="4" fill="none" opacity=".45" stroke-linecap="round"/></g>`
      );
    default:
      return "";
  }
}
/* =====================================================================
   Catalogue de l'atelier
   Prix indicatifs (en euros) : à ajuster ici. Quand les photos des perles
   et pendentifs arriveront, on pourra ajouter un champ `image` à chacun.
   ===================================================================== */
export const ATELIER = {
  bases: [
    { id: "cordon-rouge", name: "Cordon rouge", kind: "cord", color: "#b3262e", price: 29 },
    { id: "cordon-marine", name: "Cordon marine", kind: "cord", color: "#1f3a5f", price: 29 },
    { id: "cordon-sable", name: "Cordon sable", kind: "cord", color: "#c4a77d", price: 29 },
    { id: "chaine", name: "Chaîne dorée", kind: "chain", color: GOLD, price: 39 },
    { id: "fil", name: "Fil invisible", kind: "thread", color: "#b9b2a8", price: 25 },
  ],
  lengths: [
    { id: "ras", name: "Ras-de-cou", cm: 38, depth: 360, price: 0 },
    { id: "collier", name: "Collier", cm: 45, depth: 580, price: 5 },
    { id: "sautoir", name: "Sautoir", cm: 75, depth: 900, price: 15 },
  ],
  layouts: [
    { id: "tour", name: "Tout le tour" },
    { id: "centre", name: "Au centre" },
    { id: "eparse", name: "Quelques perles" },
  ],
  beads: [
    { id: "nacre", name: "Perle nacrée", color: "#f3ebe1", kind: "pearl", r: 13, price: 2 },
    { id: "corail", name: "Corail facetté", color: "#d9774f", kind: "facet", r: 11, price: 1.5 },
    { id: "rouge", name: "Verre rouge", color: "#b3262e", kind: "glass", r: 11, price: 1 },
    { id: "bronze", name: "Bronze facetté", color: "#9a5b2e", kind: "facet", r: 17, price: 2 },
    { id: "jade", name: "Pierre verte", color: "#6f9c7f", kind: "matte", r: 14, price: 2.5 },
    { id: "eau", name: "Pierre d'eau", color: "#9dbf9c", kind: "matte", r: 12, price: 2 },
    { id: "gris", name: "Rocaille grise", color: "#8a8d91", kind: "glass", r: 7, price: 0.4 },
    { id: "marine", name: "Rocaille marine", color: "#1f4766", kind: "glass", r: 7, price: 0.4 },
    { id: "ambre", name: "Ambre", color: "#c27a3a", kind: "glass", r: 12, price: 1.5 },
    { id: "terre", name: "Terre cuite", color: "#a4502a", kind: "matte", r: 13, price: 1.5 },
    { id: "or", name: "Perle dorée", color: GOLD, kind: "gold", r: 6, price: 1 },
  ],
  pendants: [
    { id: "aucun", name: "Sans pendentif", price: 0 },
    { id: "heart", name: "Cœur cadenas", price: 18 },
    { id: "key", name: "Petite clé", price: 12 },
    { id: "nacre", name: "Nacre et perle", price: 22 },
    { id: "shell", name: "Coquillage, perle grise", price: 24 },
    { id: "coin", name: "Médaille étoile", price: 14 },
    { id: "leaf", name: "Feuille d'or", price: 16 },
    { id: "drop", name: "Goutte de verre", price: 10 },
    { id: "initial", name: "Initiale gravée", price: 20 },
  ],
  presets: [
    { name: "Rouge Love", design: { base: "cordon-rouge", length: "collier", layout: "eparse", motif: ["nacre"], pendant: "heart" } },
    { name: "La Nacrée", design: { base: "chaine", length: "collier", layout: "centre", motif: ["nacre", "corail", "corail"], pendant: "nacre" } },
    { name: "Bronze", design: { base: "fil", length: "collier", layout: "centre", motif: ["bronze"], pendant: "aucun" } },
    { name: "Grey Shades", design: { base: "fil", length: "sautoir", layout: "tour", motif: ["gris", "gris", "marine", "gris"], pendant: "shell" } },
    { name: "Texas Stones", design: { base: "chaine", length: "collier", layout: "centre", motif: ["jade", "or", "eau", "or"], pendant: "coin" } },
    { name: "Le cœur de l'Océan", design: { base: "fil", length: "collier", layout: "tour", motif: ["marine", "gris", "marine", "or"], pendant: "shell" } },
    { name: "Édition Fall", design: { base: "chaine", length: "sautoir", layout: "centre", motif: ["ambre", "terre", "or"], pendant: "leaf" } },
  ],
};

const MAX_MOTIF = 8;
const byId = (list, id) => list.find((x) => x.id === id) || list[0];
export const DEFAULT_DESIGN = { ...ATELIER.presets[1].design, letter: "A" };

/* ---------- Code partageable : chaine.collier.centre.nacre-corail.nacre.A ---------- */
export function encodeDesign(d) {
  return [d.base, d.length, d.layout, d.motif.join("-") || "_", d.pendant, (d.letter || "A").toUpperCase()].join(".");
}
export function decodeDesign(code) {
  if (!code || typeof code !== "string") return null;
  const [base, length, layout, motif, pendant, letter] = code.split(".");
  const ok = (list, id) => list.some((x) => x.id === id);
  if (!ok(ATELIER.bases, base) || !ok(ATELIER.lengths, length) || !ok(ATELIER.layouts, layout) || !ok(ATELIER.pendants, pendant)) return null;
  const m = (motif || "").split("-").filter((id) => ok(ATELIER.beads, id)).slice(0, MAX_MOTIF);
  return { base, length, layout, motif: m, pendant, letter: /^[A-Za-zÀ-ÿ]$/.test(letter || "") ? letter.toUpperCase() : "A" };
}

/* ---------- Géométrie ---------- */
const VW = 1000, VH = 1150, CX = 500, SPREAD = 560, TOP = -60;
const BS = 1.25; // échelle d'affichage des perles sur le collier
function strandPoly(depth) {
  const w = SPREAD, top = TOP, cx = CX;
  return spline([
    [cx - w / 2, top], [cx - w * 0.47, top + depth * 0.45], [cx - w * 0.26, top + depth * 0.86], [cx, top + depth],
    [cx + w * 0.26, top + depth * 0.86], [cx + w * 0.47, top + depth * 0.45], [cx + w / 2, top],
  ], false, 34);
}

// positions (décalage le long du fil depuis le centre) des perles, symétriques
function layoutBeads(design, total) {
  const motif = design.motif.map((id) => byId(ATELIER.beads, id));
  if (!motif.length) return [];
  const half = { tour: 0.46, centre: 0.17, eparse: 0.27 }[design.layout] * total;
  const gap = design.layout === "eparse" ? 4.2 : 1.04;
  const out = [{ key: "c0", s: 0, bead: motif[0] }];
  let off = 0, prev = motif[0];
  for (let i = 1; i < 400; i++) {
    const b = motif[i % motif.length];
    off += (prev.r + b.r) * BS * gap;
    if (off + b.r * BS > half) break;
    out.push({ key: "l" + i, s: -off, bead: b }, { key: "r" + i, s: off, bead: b });
    prev = b;
  }
  return out;
}

export function priceOf(design, total) {
  const base = byId(ATELIER.bases, design.base).price;
  const len = byId(ATELIER.lengths, design.length).price;
  const pend = byId(ATELIER.pendants, design.pendant).price;
  const beads = layoutBeads(design, total ?? measure(strandPoly(byId(ATELIER.lengths, design.length).depth)).at(-1));
  const b = beads.reduce((sum, x) => sum + x.bead.price, 0);
  return { total: Math.max(45, Math.ceil((base + len + pend + b) / 5) * 5), count: beads.length };
}

export function describeDesign(design) {
  const base = byId(ATELIER.bases, design.base), len = byId(ATELIER.lengths, design.length);
  const pend = byId(ATELIER.pendants, design.pendant);
  const names = [...new Set(design.motif)].map((id) => byId(ATELIER.beads, id).name.toLowerCase());
  const list = names.length > 1 ? names.slice(0, -1).join(", ") + " et " + names.at(-1) : names[0];
  const where = { tour: "tout le tour", centre: "au centre", eparse: "espacées" }[design.layout];
  let s = `${len.name} de ${len.cm} cm sur ${base.name.toLowerCase()}`;
  s += list ? `, ${list} ${where}` : ", sans perles";
  if (design.pendant !== "aucun") s += pend.id === "initial" ? `, initiale ${design.letter} gravée` : `, pendentif ${pend.name.toLowerCase()}`;
  return s + ".";
}

/* ---------- Rendu SVG ---------- */
function beadSymbol(D, b) {
  return `<g id="ab-${b.id}">${bead(D, 0, 0, b.r * BS, b.color, b.kind)}</g>`;
}
function pendantMarkup(D, design) {
  const p = design.pendant;
  if (p === "aucun") return "";
  if (p === "initial") {
    const g = D.grad("metal", GOLD);
    return `<g transform="scale(1.25)"><circle cx="0" cy="-6" r="7" fill="none" stroke="${g}" stroke-width="4"/><circle cx="0" cy="36" r="38" fill="${g}"/><circle cx="0" cy="36" r="31" fill="none" stroke="${dark(GOLD, 0.3)}" stroke-width="1.5" opacity=".6"/><text x="0" y="53" text-anchor="middle" font-family="Bodoni Moda, Didot, serif" font-size="50" font-weight="600" fill="${dark(GOLD, 0.5)}" stroke="${dark(GOLD, 0.5)}" stroke-width="1.2">${(design.letter || "A").replace(/[<&>]/g, "")}</text><ellipse cx="-22" cy="12" rx="8" ry="4.5" fill="#fff" opacity=".35" transform="rotate(-35 -22 12)"/></g>`;
  }
  const accent = p === "drop" ? byId(ATELIER.beads, design.motif[0] || "ambre").color : GOLD;
  const both = p === "heart" ? pendant(D, "key", 46, 4, 1.1) : "";
  return both + pendant(D, p, 0, 0, 1.25, accent);
}

function baseMarkup(base) {
  if (base.kind === "cord")
    return `<path class="a-cord" fill="none" stroke="${dark(base.color, 0.2)}" stroke-width="7" stroke-linecap="round"/><path class="a-cord" fill="none" stroke="${light(base.color, 0.18)}" stroke-width="2.6" stroke-linecap="round" opacity=".7" transform="translate(-.8 -1)"/>`;
  if (base.kind === "chain")
    return `<path class="a-cord" fill="none" stroke="${dark(GOLD, 0.35)}" stroke-width="6" stroke-dasharray="9 3" stroke-linecap="round"/><path class="a-cord" fill="none" stroke="${light(GOLD, 0.35)}" stroke-width="3.2" stroke-dasharray="6.6 5.4" stroke-linecap="round" transform="translate(-.8 -1)"/>`;
  return `<path class="a-cord" fill="none" stroke="#8a7a66" stroke-opacity=".5" stroke-width="1.8"/>`;
}

/* ---------- Essayage : collier drapé sur une photo ---------- */
// Un « ajustement » décrit le haut du buste dans l'image, en pixels de la photo :
//   N  : creux de la gorge (base du cou), up : vecteur unitaire vers le menton,
//   ppc : pixels par centimètre, f : raccourci horizontal quand le buste est de trois quarts.
const DROP_CM = { ras: 3.5, collier: 11, sautoir: 27 };
const STAGE_PPC = 47; // unités du dessin de l'atelier par centimètre

export const BUST_FIT = { W: 800, H: 1000, N: [400, 478], up: [0, -1], ppc: 10.9, f: 1 };

/** Déduit l'ajustement des repères MediaPipe Pose (coordonnées normalisées). */
export function fitFromPose(lm, W, H) {
  const P = (i) => [lm[i].x * W, lm[i].y * H];
  const vis = (i) => (lm[i].visibility ?? 1) > 0.4;
  if (!vis(11) || !vis(12)) return null;
  const ls = P(11), rs = P(12);
  const M = [(ls[0] + rs[0]) / 2, (ls[1] + rs[1]) / 2];
  const sw = Math.hypot(ls[0] - rs[0], ls[1] - rs[1]);
  const mouth = vis(9) && vis(10) ? [(P(9)[0] + P(10)[0]) / 2, (P(9)[1] + P(10)[1]) / 2] : P(0);
  // axe du cou : perpendiculaire à la ligne des épaules, orienté vers la tête
  let perp = [rs[0] - ls[0], rs[1] - ls[1]];
  const pl = Math.hypot(...perp) || 1;
  perp = [perp[0] / pl, perp[1] / pl];
  let up = [perp[1], -perp[0]];
  if ((mouth[0] - M[0]) * up[0] + (mouth[1] - M[1]) * up[1] < 0) up = [-up[0], -up[1]];
  const mouthH = (mouth[0] - M[0]) * up[0] + (mouth[1] - M[1]) * up[1]; // hauteur bouche / épaules
  const ears = vis(7) && vis(8) ? Math.hypot(P(7)[0] - P(8)[0], P(7)[1] - P(8)[1]) : 0;
  // échelle : la hauteur bouche-épaules (≈ 17 cm) ne dépend pas de l'orientation du buste
  const cands = [mouthH / 17, sw / 37, ears ? ears / 14.5 : 0].filter((v) => v > 0).sort((a, b) => a - b);
  const ppc = cands.length === 3 ? cands[1] : Math.max(...cands);
  if (!(ppc > 0)) return null;
  const f = Math.max(0.55, Math.min(1, sw / (37 * ppc)));
  // le creux de la gorge est un peu au-dessus de la ligne des articulations des épaules
  const N = [M[0] + up[0] * 1.2 * ppc, M[1] + up[1] * 1.2 * ppc];
  return { W, H, N, up, ppc, f };
}

/** Collier en coordonnées de la photo, posé selon l'ajustement. Renvoie le contenu SVG et ses définitions. */
export function drapeMarkup(design, fit, tweak = { dx: 0, dy: 0, s: 1, r: 0 }, uid = "d") {
  const { ppc: ppc0, f, up } = fit;
  const ppc = ppc0 * tweak.s;
  const N = [fit.N[0] + tweak.dx, fit.N[1] + tweak.dy];
  const rot = (tweak.r * Math.PI) / 180;
  const u0 = [up[0] * Math.cos(rot) - up[1] * Math.sin(rot), up[0] * Math.sin(rot) + up[1] * Math.cos(rot)];
  const down = [-u0[0], -u0[1]];
  const side = [-down[1], down[0]]; // vers la droite de l'image quand le buste est droit
  const cm = (x, y) => [N[0] + side[0] * x * ppc * f + down[0] * y * ppc, N[1] + side[1] * x * ppc * f + down[1] * y * ppc];
  const drop = DROP_CM[design.length] ?? 8;
  const nh = 6; // le fil sort de derrière le cou, sur la base des trapèzes (cm)
  // le fil s'élargit en passant sur les trapèzes puis se resserre régulièrement jusqu'au centre
  const wide = nh + 1.4 + Math.min(2.5, drop * 0.06);
  const pts = [
    cm(-nh, -3.2), cm(-wide, -0.6), cm(-wide * 0.92, drop * 0.3), cm(-wide * 0.6, drop * 0.72), cm(0, drop),
    cm(wide * 0.6, drop * 0.72), cm(wide * 0.92, drop * 0.3), cm(wide, -0.6), cm(nh, -3.2),
  ];
  const poly = spline(pts, false, 30);
  const L = measure(poly), total = L[L.length - 1], mid = total / 2;
  const k = ppc / STAGE_PPC; // échelle du dessin de l'atelier vers la photo
  const D = new Defs();
  const used = new Map();
  const base = byId(ATELIER.bases, design.base);
  const scaleAttr = (m) => m.replace(/(stroke-width|stroke-dasharray)="([^"]+)"/g, (_, a, v) => `${a}="${v.split(/\s+/).map((n) => (+n * k).toFixed(2)).join(" ")}"`)
    .replace(/translate\(-\.8 -1\)/g, `translate(${(-0.8 * k).toFixed(2)} ${(-1 * k).toFixed(2)})`);
  const dd = pathD(poly);
  const cords = scaleAttr(baseMarkup(base)).replace(/class="a-cord"/g, `d="${dd}"`);
  // perles, posées le long du fil depuis le centre
  const beads = layoutBeads(design, total / k);
  let centerR = 0, beadsSvg = "", shadows = "";
  for (const n of beads) {
    const [x, y, a] = at(poly, L, Math.max(0, Math.min(total, mid + n.s * k)));
    used.set(n.bead.id, n.bead);
    const r = n.bead.r * BS * k;
    if (n.key === "c0") centerR = r;
    shadows += `<circle cx="${(x + 2 * k).toFixed(1)}" cy="${(y + 4 * k).toFixed(1)}" r="${(r * 1.3).toFixed(1)}" fill="url(#${uid}-sh)"/>`;
    beadsSvg += `<use href="#${uid}-b-${n.bead.id}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${((a * 180) / Math.PI).toFixed(1)}) scale(${k.toFixed(3)})"/>`;
  }
  const [px, py] = at(poly, L, mid);
  const ang = (Math.atan2(down[1], down[0]) * 180) / Math.PI - 90;
  const pend = pendantMarkup(D, design);
  const pendSvg = pend ? `<g transform="translate(${(px + down[0] * (centerR * 0.8 + 4 * k)).toFixed(1)} ${(py + down[1] * (centerR * 0.8 + 4 * k)).toFixed(1)}) rotate(${ang.toFixed(1)}) scale(${k.toFixed(3)})" filter="url(#${uid}-psh)">${pend}</g>` : "";
  const symbols = [...used.values()].map((b) => `<g id="${uid}-b-${b.id}">${bead(D, 0, 0, b.r * BS, b.color, b.kind)}</g>`).join("");
  // le haut du fil passe derrière le cou : fondu sur les 3 premiers centimètres
  const t0 = cm(0, -3.2), t1 = cm(0, -0.4);
  const defs = `<radialGradient id="${uid}-sh"><stop offset="0" stop-color="#2a1a0c" stop-opacity=".32"/><stop offset="1" stop-color="#2a1a0c" stop-opacity="0"/></radialGradient>
<radialGradient id="nacre" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#fffaf3"/><stop offset=".4" stop-color="#f0e4dc"/><stop offset=".65" stop-color="#dfe6ea"/><stop offset=".85" stop-color="#ecd9d2"/><stop offset="1" stop-color="#d8c4b4"/></radialGradient>
<filter id="${uid}-psh" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="${(4 * k).toFixed(2)}" dy="${(7 * k).toFixed(2)}" stdDeviation="${(5 * k).toFixed(2)}" flood-color="#2a1a0c" flood-opacity=".35"/></filter>
<linearGradient id="${uid}-fade" gradientUnits="userSpaceOnUse" x1="${t0[0].toFixed(1)}" y1="${t0[1].toFixed(1)}" x2="${t1[0].toFixed(1)}" y2="${t1[1].toFixed(1)}"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>
<mask id="${uid}-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${fit.W}" height="${fit.H}"><rect width="${fit.W}" height="${fit.H}" fill="url(#${uid}-fade)"/></mask>
${D.toString()}${symbols}`;
  const body = `<g mask="url(#${uid}-mask)"><g opacity=".22" transform="translate(${(2 * k).toFixed(1)} ${(4 * k).toFixed(1)})">${scaleAttr(baseMarkup(base)).replace(/class="a-cord"/g, `d="${dd}"`).replace(/stroke="[^"]+"/g, 'stroke="#2a1a0c"')}</g>${cords}${shadows}${beadsSvg}</g>${pendSvg}`;
  return { defs, body };
}

// MediaPipe Pose, chargé seulement au premier essayage sur photo
const MP_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1";
let posePromise = null;
function detectPose(img, model) {
  if (!posePromise)
    posePromise = (async () => {
      const load = new Function("u", "return import(u)"); // hors du bundler : module chargé à la demande
      const vision = await load(MP_CDN + "/vision_bundle.mjs");
      const files = await vision.FilesetResolver.forVisionTasks(MP_CDN + "/wasm");
      return vision.PoseLandmarker.createFromOptions(files, {
        baseOptions: { modelAssetPath: model || "/models/pose_landmarker_lite.task" },
        runningMode: "IMAGE",
        numPoses: 1,
      });
    })();
  return posePromise.then((pose) => {
    const r = pose.detect(img);
    return r.landmarks && r.landmarks[0] ? r.landmarks[0] : null;
  }).catch((e) => { posePromise = null; throw e; });
}

/* ---------- Interface ---------- */
// Buste de présentation en velours, fond de l'essayage quand il n'y a pas de photo (format 4:5)
const BUST_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice" width="800" height="1000">
<defs>
<linearGradient id="t-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1ebe2"/><stop offset="1" stop-color="#e2d8ca"/></linearGradient>
<radialGradient id="t-vel" cx=".42" cy=".38" r=".8"><stop offset="0" stop-color="#2a4569"/><stop offset=".55" stop-color="#14294a"/><stop offset="1" stop-color="#0a1a33"/></radialGradient>
<linearGradient id="t-neck" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0c1d38"/><stop offset=".38" stop-color="#2b4870"/><stop offset=".6" stop-color="#1d3659"/><stop offset="1" stop-color="#0b1b35"/></linearGradient>
<radialGradient id="t-sh" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#3a2a18" stop-opacity=".28"/><stop offset="1" stop-color="#3a2a18" stop-opacity="0"/></radialGradient>
</defs>
<rect width="800" height="1000" fill="url(#t-bg)"/>
<ellipse cx="400" cy="985" rx="420" ry="40" fill="url(#t-sh)"/>
<path d="M20 1000 L20 700 C50 560 210 520 318 478 C338 440 346 380 346 250 L454 250 C454 380 462 440 482 478 C590 520 750 560 780 700 L780 1000 Z" fill="url(#t-vel)"/>
<path d="M346 250 C346 380 338 440 318 478 C370 505 430 505 482 478 C462 440 454 380 454 250 Z" fill="url(#t-neck)" opacity=".9"/>
<ellipse cx="400" cy="250" rx="56" ry="13" fill="#2c4870"/>
<ellipse cx="400" cy="246" rx="49" ry="9" fill="#c6a15b" opacity=".85"/>
<path d="M110 660 C190 590 280 552 340 540" fill="none" stroke="#fff" stroke-opacity=".06" stroke-width="40" stroke-linecap="round"/>
</svg>`;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

function swatchSvg(D, b, size = 44) {
  const v = b.r * 1.6;
  return `<svg viewBox="${-v} ${-v} ${v * 2} ${v * 2}" width="${size}" height="${size}" aria-hidden="true">${bead(D, 0, 0, b.r, b.color, b.kind)}</svg>`;
}
function pendantIcon(D, p, design) {
  if (p.id === "aucun") return `<svg viewBox="-60 -30 120 150" width="54" height="66" aria-hidden="true"><line x1="-36" y1="-10" x2="36" y2="110" stroke="currentColor" stroke-opacity=".35" stroke-width="2"/></svg>`;
  return `<svg viewBox="-75 -25 150 175" width="54" height="66" aria-hidden="true">${pendantMarkup(D, { ...design, pendant: p.id })}</svg>`;
}

/**
 * Monte l'atelier dans `el`.
 * @param {HTMLElement} el
 * @param {{ initial?: object, onChange?: (code: string) => void, onSend?: (code: string, text: string) => void,
 *   onOrder?: (o: { code: string, text: string, price: number, thumb: string }) => void,
 *   poseModel?: string }} opts  poseModel : adresse du modèle MediaPipe Pose (essayage sur photo)
 */
export function mountAtelier(el, opts = {}) {
  const D = new Defs();
  let design = { ...DEFAULT_DESIGN, ...(opts.initial || {}) };
  design.motif = [...design.motif];
  const symbols = ATELIER.beads.map((b) => beadSymbol(D, b)).join("");
  const sw = new Defs();
  const swatches = ATELIER.beads.map((b) => swatchSvg(sw, b)).join("");
  void swatches;

  el.classList.add("atelier");
  el.innerHTML = `
  <div class="atelier__stage">
    <svg class="atelier__svg" viewBox="0 0 ${VW} ${VH}" role="img" aria-label="Aperçu de votre collier">
      <defs>
        <radialGradient id="a-sh"><stop offset="0" stop-color="#3a2a18" stop-opacity=".34"/><stop offset=".6" stop-color="#3a2a18" stop-opacity=".12"/><stop offset="1" stop-color="#3a2a18" stop-opacity="0"/></radialGradient>
        <radialGradient id="nacre" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#fffaf3"/><stop offset=".4" stop-color="#f0e4dc"/><stop offset=".65" stop-color="#dfe6ea"/><stop offset=".85" stop-color="#ecd9d2"/><stop offset="1" stop-color="#d8c4b4"/></radialGradient>
        <filter id="a-psh" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="7" dy="11" stdDeviation="7" flood-color="#3a2a18" flood-opacity=".3"/></filter>
        <g id="a-defs"></g>
        ${symbols}
      </defs>
      <g class="a-base-shadow" transform="translate(6 9)" opacity=".16"></g>
      <g class="a-base"></g>
      <g class="a-shadows"></g>
      <g class="a-beads"></g>
      <g class="a-pendant" filter="url(#a-psh)"><g class="a-pendant__inner"></g></g>
    </svg>
    <button type="button" class="atelier__tryon" data-tryon>Essayer sur moi</button>
    <div class="atelier__caption">
      <p class="atelier__desc" aria-live="polite"></p>
      <p class="atelier__price"><span>Estimation</span> <strong></strong></p>
    </div>
  </div>
  <div class="atelier__panel">
    <div class="atelier__group">
      <h3 class="atelier__label">Partir d'une collection</h3>
      <div class="atelier__chips" data-presets>${ATELIER.presets.map((p, i) => `<button type="button" class="chip" data-preset="${i}">${esc(p.name)}</button>`).join("")}</div>
    </div>
    <div class="atelier__group">
      <h3 class="atelier__label">Le fil</h3>
      <div class="atelier__options" data-group="base">${ATELIER.bases.map((b) => `<button type="button" class="atelier__opt" data-value="${b.id}"><span class="atelier__dot atelier__dot--${b.kind}" style="--c:${b.color}"></span>${esc(b.name)}</button>`).join("")}</div>
    </div>
    <div class="atelier__group">
      <h3 class="atelier__label">La longueur</h3>
      <div class="atelier__seg" data-group="length">${ATELIER.lengths.map((l) => `<button type="button" data-value="${l.id}">${esc(l.name)}<small>${l.cm} cm</small></button>`).join("")}</div>
    </div>
    <div class="atelier__group">
      <h3 class="atelier__label">Les perles <span class="atelier__hint">Touchez une perle pour l'enfiler. Le motif se répète en miroir depuis le centre.</span></h3>
      <div class="atelier__palette">${ATELIER.beads.map((b) => `<button type="button" class="atelier__bead" data-add="${b.id}" title="${esc(b.name)}" aria-label="Ajouter : ${esc(b.name)}">${swatchSvg(sw, b)}<span>${esc(b.name)}</span></button>`).join("")}</div>
      <div class="atelier__motif">
        <span class="atelier__motif-label">Votre motif</span>
        <ol class="atelier__motif-list" data-motif></ol>
      </div>
      <div class="atelier__seg atelier__seg--small" data-group="layout">${ATELIER.layouts.map((l) => `<button type="button" data-value="${l.id}">${esc(l.name)}</button>`).join("")}</div>
    </div>
    <div class="atelier__group">
      <h3 class="atelier__label">Le pendentif</h3>
      <div class="atelier__pendants" data-group="pendant">${ATELIER.pendants.map((p) => `<button type="button" class="atelier__pend" data-value="${p.id}" title="${esc(p.name)}"><span class="atelier__pend-art" data-pend-art="${p.id}"></span><span>${esc(p.name)}</span></button>`).join("")}</div>
      <label class="atelier__letter" data-letter hidden>Lettre à graver <input maxlength="1" value="${esc(design.letter || "A")}" autocomplete="off" /></label>
    </div>
    <div class="atelier__actions">
      ${opts.onOrder ? `<button type="button" class="btn btn--solid" data-order>Commander ma création <span data-order-price></span></button>` : ""}
      <button type="button" class="btn${opts.onOrder ? "" : " btn--solid"}" data-send>${opts.onOrder ? "En parler d'abord avec la créatrice" : "Envoyer ma création à la créatrice"}</button>
      <div class="atelier__minor">
        <button type="button" class="link-underline" data-random>Une idée au hasard</button>
        <button type="button" class="link-underline" data-copy>Copier le lien</button>
        <button type="button" class="link-underline" data-save>Enregistrer l'image</button>
      </div>
      <p class="atelier__note">${opts.onOrder ? "Votre collier est monté à la main après votre commande et expédié sous 2 à 3 semaines. Une question, un prénom à ajouter ? Écrivez-nous avant de commander." : "Le prix est une estimation : la créatrice vous confirme le tarif et le délai, 2 à 3 semaines en général."}</p>
    </div>
  </div>`;

  const $ = (s) => el.querySelector(s);
  const svg = $(".atelier__svg");
  const gBase = $(".a-base"), gBaseSh = $(".a-base-shadow"), gSh = $(".a-shadows"), gBeads = $(".a-beads");
  const gPend = $(".a-pendant"), gPendIn = $(".a-pendant__inner");
  const NS = "http://www.w3.org/2000/svg";
  const syncDefs = () => {
    const holder = svg.querySelector("defs");
    let extra = holder.querySelector("#a-grads");
    if (!extra) {
      extra = document.createElementNS(NS, "g");
      extra.id = "a-grads";
      holder.prepend(extra);
    }
    extra.innerHTML = D.toString();
  };
  // icônes des pendentifs
  const iconDefs = new Defs();
  el.querySelectorAll("[data-pend-art]").forEach((n) => {
    const p = byId(ATELIER.pendants, n.dataset.pendArt);
    n.innerHTML = pendantIcon(iconDefs, p, design);
  });
  // les icônes ont besoin de leurs dégradés
  const iconHolder = document.createElement("div");
  iconHolder.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
  iconHolder.innerHTML = `<svg aria-hidden="true"><defs>${iconDefs.toString()}${sw.toString()}<radialGradient id="nacre-i" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#fffaf3"/><stop offset="1" stop-color="#d8c4b4"/></radialGradient></defs></svg>`;
  el.append(iconHolder);

  /* --- état animé --- */
  const live = new Map(); // key -> {g, sh, s, target, id, delay, dying}
  let depth = byId(ATELIER.lengths, design.length).depth, depthTarget = depth;
  let raf = 0;
  const rm = reduced();

  const setBase = () => {
    const base = byId(ATELIER.bases, design.base);
    gBase.innerHTML = baseMarkup(base);
    gBaseSh.innerHTML = base.kind === "thread" ? "" : `<path class="a-cord" fill="none" stroke="#3a2a18" stroke-width="7" stroke-linecap="round"/>`;
  };
  const setPendant = () => {
    gPendIn.innerHTML = pendantMarkup(D, design);
    syncDefs();
  };

  const frame = () => {
    raf = 0;
    let moving = false;
    if (Math.abs(depthTarget - depth) > 0.5) { depth += (depthTarget - depth) * (rm ? 1 : 0.14); moving = true; } else depth = depthTarget;
    const poly = strandPoly(depth), L = measure(poly), total = L[L.length - 1], mid = total / 2;
    const dd = pathD(poly);
    el.querySelectorAll(".a-cord").forEach((p) => p.setAttribute("d", dd));
    let centerR = 0;
    for (const [key, b] of live) {
      if (b.delay > 0) { b.delay--; moving = true; }
      else if (Math.abs(b.target - b.s) > 0.4) { b.s += (b.target - b.s) * (rm ? 1 : 0.16); moving = true; }
      else b.s = b.target;
      if (b.dying && Math.abs(b.target - b.s) < 6) { b.g.remove(); b.sh.remove(); live.delete(key); continue; }
      const [x, y, a] = at(poly, L, Math.max(0, Math.min(total, mid + b.s)));
      const r = byId(ATELIER.beads, b.id).r * BS;
      b.g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${((a * 180) / Math.PI).toFixed(1)})`);
      b.sh.setAttribute("transform", `translate(${(x + 6).toFixed(1)} ${(y + 9).toFixed(1)}) scale(${(r * 1.35).toFixed(1)})`);
      if (key === "c0") centerR = r;
    }
    const [px, py] = at(poly, L, mid);
    gPend.setAttribute("transform", `translate(${px.toFixed(1)} ${(py + centerR * 0.8 + 4).toFixed(1)})`);
    if (moving) raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

  const setBeads = (fromEnds = false) => {
    const total = measure(strandPoly(depthTarget)).at(-1);
    const next = layoutBeads(design, total);
    const keys = new Set(next.map((n) => n.key));
    const edge = total / 2 + 30;
    // perles retirées : elles glissent hors du fil
    for (const [key, b] of live) if (!keys.has(key) && !b.dying) { b.dying = true; b.target = Math.sign(b.s || 1) * edge; }
    let order = 0;
    next.forEach((n) => {
      let b = live.get(n.key);
      if (!b || b.dying) {
        if (b) { b.g.remove(); b.sh.remove(); }
        const sh = document.createElementNS(NS, "circle");
        sh.setAttribute("r", "1");
        sh.setAttribute("fill", "url(#a-sh)");
        const g = document.createElementNS(NS, "use");
        g.setAttribute("href", "#ab-" + n.bead.id);
        gSh.append(sh);
        gBeads.append(g);
        const side = n.s < 0 ? -1 : 1;
        b = { g, sh, id: n.bead.id, s: fromEnds || !live.size ? side * edge : side * edge, target: n.s, delay: rm ? 0 : Math.round(Math.abs(n.s) / 18) + (order++ % 2) };
        // on enfile depuis les extrémités : les perles du centre partent en premier
        b.delay = rm ? 0 : Math.min(40, Math.round((edge - Math.abs(n.s)) / 40));
        live.set(n.key, b);
      } else {
        b.target = n.s;
        if (b.id !== n.bead.id) {
          b.id = n.bead.id;
          b.g.setAttribute("href", "#ab-" + n.bead.id);
          b.g.classList.remove("is-pop");
          void b.g.getBoundingClientRect();
          b.g.classList.add("is-pop");
        }
      }
    });
    kick();
  };

  /* --- interface --- */
  const desc = $(".atelier__desc"), priceEl = $(".atelier__price strong"), motifList = $("[data-motif]");
  const letterBox = $("[data-letter]"), letterInput = letterBox.querySelector("input");
  const syncUi = () => {
    for (const grp of ["base", "length", "layout", "pendant"])
      el.querySelectorAll(`[data-group="${grp}"] [data-value]`).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.value === design[grp])));
    motifList.innerHTML = design.motif.length
      ? design.motif.map((id, i) => { const b = byId(ATELIER.beads, id); return `<li><button type="button" data-remove="${i}" aria-label="Retirer : ${esc(b.name)}" title="Retirer">${swatchSvg(sw, b, 30)}</button></li>`; }).join("")
      : `<li class="atelier__motif-empty">Aucune perle pour l'instant</li>`;
    const code = encodeDesign(design).replace(/\.[^.]*$/, "");
    el.querySelectorAll("[data-preset]").forEach((b) => b.setAttribute("aria-current", String(encodeDesign({ ...ATELIER.presets[+b.dataset.preset].design, letter: "A" }).replace(/\.[^.]*$/, "") === code)));
    letterBox.hidden = design.pendant !== "initial";
    desc.textContent = describeDesign(design);
    const total = measure(strandPoly(depthTarget)).at(-1);
    priceEl.textContent = `${priceOf(design, total).total} €`;
    const op = el.querySelector("[data-order-price]");
    if (op) op.textContent = `· ${priceOf(design, total).total} €`;
    const ob = el.querySelector("[data-order]");
    if (ob) ob.disabled = !design.motif.length && design.pendant === "aucun";
    el.querySelectorAll("[data-add]").forEach((b) => (b.disabled = design.motif.length >= MAX_MOTIF));
    opts.onChange && opts.onChange(encodeDesign(design));
  };
  const apply = (patch, { beads = true, fromEnds = false } = {}) => {
    const prevBase = design.base, prevPend = design.pendant, prevLetter = design.letter;
    design = { ...design, ...patch };
    if (patch.length) depthTarget = byId(ATELIER.lengths, design.length).depth;
    if (design.base !== prevBase) setBase();
    if (design.pendant !== prevPend || design.letter !== prevLetter || patch.motif) setPendant();
    if (beads) setBeads(fromEnds);
    syncUi();
    kick();
  };

  const onClick = (e) => {
    const t = e.target.closest("button");
    if (!t || !el.contains(t)) return;
    const grp = t.closest("[data-group]");
    if (grp && t.dataset.value) return apply({ [grp.dataset.group]: t.dataset.value });
    if (t.dataset.add) return design.motif.length < MAX_MOTIF && apply({ motif: [...design.motif, t.dataset.add] });
    if (t.dataset.remove) { const m = [...design.motif]; m.splice(+t.dataset.remove, 1); return apply({ motif: m }); }
    if (t.dataset.preset) { const p = ATELIER.presets[+t.dataset.preset].design; for (const [k, b] of live) { b.g.remove(); b.sh.remove(); live.delete(k); } return apply({ ...p, motif: [...p.motif] }, { fromEnds: true }); }
    if ("random" in t.dataset) {
      const pick = (l) => l[Math.floor(Math.random() * l.length)];
      const n = 1 + Math.floor(Math.random() * 4);
      for (const [k, b] of live) { b.g.remove(); b.sh.remove(); live.delete(k); }
      return apply({ base: pick(ATELIER.bases).id, length: pick(ATELIER.lengths).id, layout: pick(ATELIER.layouts).id, pendant: pick(ATELIER.pendants).id, motif: Array.from({ length: n }, () => pick(ATELIER.beads).id) }, { fromEnds: true });
    }
    if ("copy" in t.dataset) {
      const url = new URL(location.href);
      url.searchParams.set("d", encodeDesign(design));
      navigator.clipboard?.writeText(url.toString()).then(() => flash(t, "Lien copié"), () => flash(t, "Copie impossible"));
      return;
    }
    if ("save" in t.dataset) return saveImage();
    if ("tryon" in t.dataset) return openTryOn();
    if ("send" in t.dataset) return opts.onSend && opts.onSend(encodeDesign(design), describeDesign(design));
    if ("order" in t.dataset) {
      const total = measure(strandPoly(depthTarget)).at(-1);
      return opts.onOrder && opts.onOrder({ code: encodeDesign(design), text: describeDesign(design), price: priceOf(design, total).total, thumb: thumbnail() });
    }
  };
  const flash = (btn, text) => { const old = btn.textContent; btn.textContent = text; setTimeout(() => (btn.textContent = old), 1600); };
  const onLetter = () => {
    const v = letterInput.value.trim().slice(0, 1);
    if (/^[A-Za-zÀ-ÿ]$/.test(v)) apply({ letter: v.toUpperCase() }, { beads: false });
  };
  el.addEventListener("click", onClick);
  letterInput.addEventListener("input", onLetter);

  // vignette pour le panier : SVG autonome recadré sur le collier, en data URL
  const thumbnail = () => {
    const clone = svg.cloneNode(true);
    clone.setAttribute("xmlns", NS);
    clone.setAttribute("viewBox", `${CX - 330} ${Math.max(0, TOP + depth * 0.25)} 660 ${Math.min(VH, depth * 0.85 + 260)}`);
    clone.setAttribute("preserveAspectRatio", "xMidYMid meet");
    const bg = document.createElementNS(NS, "rect");
    bg.setAttribute("x", "-1000");
    bg.setAttribute("y", "-1000");
    bg.setAttribute("width", "4000");
    bg.setAttribute("height", "4000");
    bg.setAttribute("fill", "#ece5da");
    clone.insertBefore(bg, clone.querySelector("defs").nextSibling);
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(clone));
  };

  const saveImage = () => {
    const clone = svg.cloneNode(true);
    clone.setAttribute("xmlns", NS);
    clone.setAttribute("width", "1000");
    clone.setAttribute("height", "1150");
    const bg = document.createElementNS(NS, "rect");
    bg.setAttribute("width", "100%");
    bg.setAttribute("height", "100%");
    bg.setAttribute("fill", "#efe8de");
    clone.insertBefore(bg, clone.querySelector("defs").nextSibling);
    const data = new XMLSerializer().serializeToString(clone);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = 1000;
      c.height = 1150;
      c.getContext("2d").drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = "mon-collier-augustave.png";
      a.href = c.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(data);
  };

  /* --- essayage virtuel --- */
  let closeTryOn = null;
  function openTryOn() {
    if (closeTryOn) return;
    const W0 = 1080, H0 = 1350; // format portrait 4:5 (Instagram)
    const ov = document.createElement("div");
    ov.className = "tryon";
    ov.setAttribute("role", "dialog");
    ov.setAttribute("aria-modal", "true");
    ov.setAttribute("aria-label", "Essayage virtuel");
    ov.innerHTML = `
      <div class="tryon__box">
        <div class="tryon__stage" data-stage>
          <div class="tryon__bg" data-bg>${BUST_SVG}</div>
          <img class="tryon__photo" data-photo alt="" hidden>
          <svg class="tryon__necklace" data-necklace xmlns="${NS}" preserveAspectRatio="xMidYMid slice" aria-label="Votre collier"></svg>
          <p class="tryon__hint" data-hint>Faites glisser le collier pour l'ajuster. Pincez pour l'agrandir.</p>
        </div>
        <div class="tryon__panel">
          <h2 class="tryon__title">Essayez votre collier</h2>
          <p class="tryon__text">Une photo de face ou de trois quarts, cou dégagé. Le collier se pose tout seul sur votre cou, à sa vraie longueur. La photo reste sur votre appareil : elle n'est envoyée nulle part.</p>
          <div class="tryon__pick">
            <label class="btn btn--solid">Prendre ou choisir une photo<input type="file" accept="image/*" data-file hidden></label>
            <button type="button" class="link-underline" data-bust>Revenir au buste</button>
          </div>
          <p class="tryon__status" data-status aria-live="polite"></p>
          <label class="tryon__range">Taille<input type="range" min="60" max="160" step="1" value="100" data-size></label>
          <label class="tryon__range">Inclinaison<input type="range" min="-30" max="30" step="1" value="0" data-rot></label>
          <button type="button" class="link-underline tryon__reset" data-reset>Replacer automatiquement</button>
          <div class="tryon__actions">
            <button type="button" class="btn" data-shot>Enregistrer la photo</button>
            <button type="button" class="btn" data-share hidden>Partager en story</button>
            <button type="button" class="link-underline" data-close>Revenir à l'atelier</button>
          </div>
        </div>
        <button type="button" class="tryon__close" data-close aria-label="Fermer">Fermer</button>
      </div>`;
    document.body.append(ov);
    document.body.classList.add("no-scroll");
    const q = (sel) => ov.querySelector(sel);
    const stage = q("[data-stage]"), photo = q("[data-photo]"), neck = q("[data-necklace]"), bg = q("[data-bg]");
    const size = q("[data-size]"), rot = q("[data-rot]"), status = q("[data-status]");
    let fit = BUST_FIT, tweak = { dx: 0, dy: 0, s: 1, r: 0 }, photoUrl = null, light = "none";

    const render = () => {
      const { defs, body } = drapeMarkup(design, fit, tweak, "to");
      neck.setAttribute("viewBox", `0 0 ${fit.W} ${fit.H}`);
      neck.innerHTML = `<defs>${defs}</defs>${body}`;
      neck.style.filter = light;
      size.value = Math.round(tweak.s * 100);
      rot.value = Math.round(tweak.r);
    };
    render();

    // échelle écran -> pixels de la photo (même recadrage que object-fit: cover)
    const scale = () => Math.max(stage.clientWidth / fit.W, stage.clientHeight / fit.H);
    const pts = new Map();
    let start = null;
    const snap = () => {
      const [a, b] = [...pts.values()];
      return { t: { ...tweak }, d: b ? Math.hypot(b.x - a.x, b.y - a.y) : 0, ang: b ? Math.atan2(b.y - a.y, b.x - a.x) : 0, mid: b ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } : { ...a } };
    };
    const down = (e) => {
      if (e.target.closest("button, input, label")) return;
      stage.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      start = snap();
      q("[data-hint]").classList.add("is-hidden");
    };
    const move = (e) => {
      if (!pts.has(e.pointerId) || !start) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const now = snap(), k = scale();
      tweak.dx = start.t.dx + (now.mid.x - start.mid.x) / k;
      tweak.dy = start.t.dy + (now.mid.y - start.mid.y) / k;
      if (pts.size > 1 && start.d) {
        tweak.s = Math.min(1.6, Math.max(0.6, start.t.s * (now.d / start.d)));
        tweak.r = Math.min(30, Math.max(-30, start.t.r + ((now.ang - start.ang) * 180) / Math.PI));
      }
      render();
    };
    const up = (e) => {
      pts.delete(e.pointerId);
      start = pts.size ? snap() : null;
    };
    const wheel = (e) => {
      e.preventDefault();
      tweak.s = Math.min(1.6, Math.max(0.6, tweak.s * (e.deltaY < 0 ? 1.04 : 0.96)));
      render();
    };
    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", up);
    stage.addEventListener("wheel", wheel, { passive: false });
    size.addEventListener("input", () => { tweak.s = size.value / 100; render(); });
    rot.addEventListener("input", () => { tweak.r = +rot.value; render(); });

    // lumière : le collier prend la luminosité de la photo autour du cou
    const ambient = (img, f) => {
      try {
        const c = document.createElement("canvas");
        c.width = 48;
        c.height = 48;
        const g = c.getContext("2d");
        const r = 7 * f.ppc;
        g.drawImage(img, f.N[0] - r, f.N[1] - r, r * 2, r * 2.4, 0, 0, 48, 48);
        const d = g.getImageData(0, 0, 48, 48).data;
        let sum = 0;
        for (let i = 0; i < d.length; i += 4) sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
        const lum = sum / (d.length / 4) / 255;
        return `brightness(${(0.78 + lum * 0.34).toFixed(2)}) saturate(${(0.88 + lum * 0.14).toFixed(2)})`;
      } catch (e) {
        return "none";
      }
    };

    const guessFit = (W, H) => ({ W, H, N: [W / 2, H * 0.56], up: [0, -1], ppc: Math.min(W, H) / 34, f: 1 });
    const analyse = async (img) => {
      status.textContent = "Je repère votre cou et vos épaules…";
      try {
        const lm = await detectPose(img, opts.poseModel);
        const f = lm && fitFromPose(lm, img.naturalWidth, img.naturalHeight);
        if (f) {
          status.textContent = "Collier posé. Vous pouvez l'ajuster du doigt.";
          return f;
        }
        status.textContent = "Je n'ai pas trouvé les épaules sur cette photo : placez le collier du doigt.";
      } catch (e) {
        status.textContent = "Le placement automatique n'est pas disponible ici : placez le collier du doigt.";
      }
      return guessFit(img.naturalWidth, img.naturalHeight);
    };
    const setPhoto = async (url) => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
      photoUrl = url;
      tweak = { dx: 0, dy: 0, s: 1, r: 0 };
      if (!url) {
        photo.hidden = true;
        bg.hidden = false;
        fit = BUST_FIT;
        light = "none";
        status.textContent = "";
        return render();
      }
      photo.src = url;
      await photo.decode().catch(() => {});
      photo.hidden = false;
      bg.hidden = true;
      neck.style.opacity = "0";
      fit = guessFit(photo.naturalWidth, photo.naturalHeight);
      render();
      fit = await analyse(photo);
      if (photoUrl !== url) return;
      light = ambient(photo, fit);
      render();
      neck.style.opacity = "";
    };
    q("[data-file]").addEventListener("change", (e) => {
      const f = e.target.files && e.target.files[0];
      if (f) setPhoto(URL.createObjectURL(f));
    });

    const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
    const shoot = async () => {
      const c = document.createElement("canvas");
      c.width = W0;
      c.height = H0;
      const g = c.getContext("2d");
      const base = photoUrl ? photo : await loadImg("data:image/svg+xml;charset=utf-8," + encodeURIComponent(BUST_SVG));
      const bw = base.naturalWidth || base.width, bh = base.naturalHeight || base.height;
      const k = Math.max(W0 / bw, H0 / bh);
      g.drawImage(base, (W0 - bw * k) / 2, (H0 - bh * k) / 2, bw * k, bh * k);
      const clone = neck.cloneNode(true);
      clone.setAttribute("width", W0);
      clone.setAttribute("height", H0);
      clone.removeAttribute("style");
      const nimg = await loadImg("data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(clone)));
      g.filter = light;
      g.drawImage(nimg, 0, 0, W0, H0);
      g.filter = "none";
      g.fillStyle = "rgba(255,255,255,.85)";
      g.font = "500 26px Jost, Arial, sans-serif";
      g.textAlign = "right";
      g.fillText("AUGUSTAVE PARIS", W0 - 40, H0 - 40);
      return c;
    };
    const download = async () => {
      const c = await shoot();
      const a = document.createElement("a");
      a.download = "essayage-augustave.jpg";
      a.href = c.toDataURL("image/jpeg", 0.9);
      a.click();
    };
    // partage natif (mobile) : la photo part directement vers Instagram, WhatsApp…
    const share = async () => {
      const c = await shoot();
      const blob = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.9));
      const file = new File([blob], "essayage-augustave.jpg", { type: "image/jpeg" });
      await navigator.share({ files: [file], text: "Mon collier Augustave Paris @augustave.paris" });
    };
    try {
      const probe = new File([new Blob(["x"], { type: "image/jpeg" })], "x.jpg", { type: "image/jpeg" });
      if (navigator.canShare && navigator.canShare({ files: [probe] })) q("[data-share]").hidden = false;
    } catch (e) {}
    const onClick = (e) => {
      const t = e.target.closest("button");
      if (!t) return;
      if ("close" in t.dataset) closeTryOn();
      if ("bust" in t.dataset) setPhoto(null);
      if ("reset" in t.dataset) { tweak = { dx: 0, dy: 0, s: 1, r: 0 }; render(); }
      if ("shot" in t.dataset) download().catch(() => {});
      if ("share" in t.dataset) share().catch(() => {});
    };
    const onKey = (e) => e.key === "Escape" && closeTryOn();
    ov.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);
    requestAnimationFrame(() => ov.classList.add("is-open"));
    closeTryOn = () => {
      window.removeEventListener("keydown", onKey);
      if (photoUrl) URL.revokeObjectURL(photoUrl);
      document.body.classList.remove("no-scroll");
      ov.remove();
      closeTryOn = null;
    };
  }

  setBase();
  setPendant();
  setBeads(true);
  syncUi();
  kick();

  return () => {
    if (closeTryOn) closeTryOn();
    cancelAnimationFrame(raf);
    el.removeEventListener("click", onClick);
    letterInput.removeEventListener("input", onLetter);
    el.innerHTML = "";
    el.classList.remove("atelier");
  };
}
