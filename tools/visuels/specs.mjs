const RED = "#b3262e", CORAL = "#d9774f", PEARL = "#f3ebe1", BRZ = ["#8c4f27", "#a8673a", "#9a5b2e"], GREY = ["#8a8d91", "#5e6166", "#b9bbbe"];
const GREEN = ["#6f9c7f", "#9dbf9c", "#58806a"], NAVY = "#1f4766", AMBER = ["#b8692f", "#d9a05b"], TERRA = ["#a4502a", "#7a3f1d", "#b8692f"];
const G = "#c9a35c";
const Z = (cx, cy, w = 560) => [cx - w / 2, cy - (w * 1.25) / 2, w, w * 1.25];

// coupelle en céramique avec des perles
const dish = (cx, cy, r, colors, kinds, n = 26, seed = 1) => ({
  t: "raw",
  svg: (D, { bead }) => {
    let s = `<g filter="url(#soft)"><ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 0.94}" fill="url(#ceramic)"/></g><ellipse cx="${cx}" cy="${cy}" rx="${r * 0.86}" ry="${r * 0.8}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3"/>`;
    let x = seed * 9301;
    const R = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
    const items = [];
    for (let i = 0; i < n; i++) {
      const a = R() * Math.PI * 2, d = Math.sqrt(R()) * r * 0.62;
      items.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.92, 9 + R() * 8, colors[i % colors.length], kinds[i % kinds.length]]);
    }
    items.sort((a, b) => a[1] - b[1]).forEach(([bx, by, br, c, k]) => (s += `<g filter="url(#drop)">${bead(D, bx, by, br, c, k)}</g>`));
    return s;
  },
});
const spool = (cx, cy, color) => ({
  t: "raw",
  svg: () =>
    `<g filter="url(#soft)" transform="translate(${cx} ${cy}) rotate(-18)"><rect x="-70" y="-110" width="140" height="22" rx="6" fill="#d8c3a2"/><rect x="-70" y="88" width="140" height="22" rx="6" fill="#cbb48f"/><rect x="-56" y="-88" width="112" height="176" fill="${color}"/>${[...Array(22)].map((_, i) => `<line x1="-56" x2="56" y1="${-86 + i * 8}" y2="${-82 + i * 8}" stroke="#000" stroke-opacity=".12" stroke-width="2"/>`).join("")}<path d="M56 30 C140 60 160 160 260 200" stroke="${color}" stroke-width="3" fill="none"/></g>`,
});

const P = {
  sautoirRouge: { t: "long", cx: 600, top: -20, w: 560, depth: 1180, base: "cord", cordColor: RED, cordW: 7,
    beads: { from: 0.42, to: 0.58, beads: [PEARL], kinds: ["pearl"], r: 16, gap: 3 },
    pendant: [{ k: "key", dx: 60, dy: 6, s: 1.4 }, { k: "heart", dx: -14, dy: 8, s: 1.55 }] },
  braceletRouge: (cx = 600, cy = 720, r = 300) => ({ t: "bracelet", cx, cy, r,
    beads: { beads: [RED, RED, RED, G], kinds: ["glass", "glass", "glass", "gold"], r: r * 0.068, gap: 1.03 }, pendant: { k: "heart", s: r * 0.0046, dy: 6 } }),
  rasNacree: (cx = 600, cy = 730, r = 330) => ({ t: "choker", closed: true, cx, cy, rx: r, ry: r * 0.95, base: "thread",
    beads: { beads: [PEARL, CORAL, CORAL], kinds: ["pearl", "facet", "facet"], r: r * 0.042, gap: 1.06 } }),
  rasOcean: (cx = 600, cy = 730, r = 320) => ({ t: "choker", closed: true, cx, cy, rx: r, ry: r * 0.95, base: "thread",
    beads: { beads: [NAVY, NAVY, NAVY, NAVY, NAVY, G], kinds: ["glass", "glass", "glass", "glass", "glass", "gold"], r: r * 0.028, gap: 1.02 } }),
  braceletBronze: (cx = 600, cy = 730, r = 300) => ({ t: "bracelet", cx, cy, r,
    beads: { beads: BRZ, kinds: ["facet"], r: r * 0.1, gap: 1.0 } }),
  braceletTexas: (cx = 600, cy = 730, r = 300) => ({ t: "bracelet", cx, cy, r,
    beads: { beads: [GREEN[0], G, GREEN[1], G, GREEN[2], G], kinds: ["matte", "gold", "matte", "gold", "matte", "gold"], sizes: (i) => (i % 2 ? r * 0.035 : r * 0.085), gap: 1.04 }, pendant: { k: "coin", s: r * 0.0042, dy: 2 } }),
  ambre: { t: "pendant", cx: 600, top: -20, w: 620, depth: 980, base: "chain", chainW: 7,
    beads: { from: 0.3, to: 0.7, beads: AMBER, kinds: ["glass"], r: 15, gap: 1.6 }, pendant: { k: "leaf", s: 1.6, dy: 6 } },
  terracotta: (cx = 600, w = 640) => ({ t: "long", cx, top: -30, w, depth: 1300, base: "thread",
    beads: { from: 0.02, to: 0.98, beads: TERRA, kinds: ["matte", "matte", "gold"], r: 15, gap: 1.02 } }),
};
const ear = (x, y, s, beads, pendant, rot = 0) => ({ t: "earring", x, y, s, beads, pendant, rot });
const pair = (y, s, beads, pendant, x1 = 440, x2 = 760) => [ear(x1, y, s, beads, pendant, -6), ear(x2, y + 30, s, beads, pendant, 5)];

export const specs = [
  // ---- produits sans photo : vue d'ensemble (-1) et détail (-2)
  { id: "produits/sautoir-rouge-love-1", bg: "#f1e6df", prop: ["flower"], items: [P.sautoirRouge] },
  { id: "produits/sautoir-rouge-love-2", bg: "#f1e6df", prop: ["flower"], items: [P.sautoirRouge], zoom: Z(600, 1080, 520), light: "right" },
  { id: "produits/bracelet-rouge-love-1", bg: "#f3e9e3", prop: ["flower"], items: [P.braceletRouge()] },
  { id: "produits/bracelet-rouge-love-2", bg: "#f3e9e3", prop: ["flower"], items: [P.braceletRouge()], zoom: Z(640, 900, 560), light: "right" },
  { id: "produits/ras-de-cou-la-nacree-1", bg: "#f4ebe2", prop: ["shell"], items: [P.rasNacree()] },
  { id: "produits/ras-de-cou-la-nacree-2", bg: "#f4ebe2", prop: ["shell"], items: [P.rasNacree()], zoom: Z(600, 1000, 500), light: "right" },
  { id: "produits/boucles-la-nacree-1", bg: "#f4ece4", items: [dish(600, 760, 380, [], [], 0), ...pair(560, 2.1, [{ r: 10, c: CORAL, k: "facet" }, { r: 8, c: PEARL, k: "pearl" }], { k: "nacre", s: 1 }, 470, 730)] },
  { id: "produits/boucles-la-nacree-2", bg: "#f4ece4", items: [dish(600, 760, 380, [], [], 0), ...pair(560, 2.1, [{ r: 10, c: CORAL, k: "facet" }, { r: 8, c: PEARL, k: "pearl" }], { k: "nacre", s: 1 }, 470, 730)], zoom: Z(470, 600, 500), light: "right" },
  { id: "produits/bracelet-bronze-1", bg: "#efe5d8", prop: ["flower"], items: [P.braceletBronze()] },
  { id: "produits/bracelet-bronze-2", bg: "#efe5d8", prop: ["flower"], items: [P.braceletBronze()], zoom: Z(620, 900, 520), light: "right" },
  { id: "produits/boucles-grey-shades-1", bg: "#eeece8", prop: ["stones"], light: "right", items: pair(520, 2.2, [{ r: 6, c: GREY[0] }, { r: 6, c: GREY[1] }, { r: 6, c: GREY[2] }, { r: 6, c: GREY[0] }], { k: "shell", s: 0.95 }) },
  { id: "produits/boucles-grey-shades-2", bg: "#eeece8", prop: ["stones"], items: pair(520, 2.2, [{ r: 6, c: GREY[0] }, { r: 6, c: GREY[1] }, { r: 6, c: GREY[2] }, { r: 6, c: GREY[0] }], { k: "shell", s: 0.95 }), zoom: Z(440, 600, 500) },
  { id: "produits/bracelet-texas-stones-1", bg: "#f1e5d3", prop: ["stones"], items: [P.braceletTexas()] },
  { id: "produits/bracelet-texas-stones-2", bg: "#f1e5d3", prop: ["stones"], items: [P.braceletTexas()], zoom: Z(600, 940, 520), light: "right" },
  { id: "produits/ras-de-cou-ocean-1", bg: "#e8edf0", prop: ["shell"], items: [P.rasOcean()] },
  { id: "produits/ras-de-cou-ocean-2", bg: "#e8edf0", prop: ["shell"], items: [P.rasOcean()], zoom: Z(600, 980, 480), light: "right" },
  { id: "produits/collier-ambre-d-automne-1", bg: "#f1e4d2", prop: ["leaves"], items: [P.ambre] },
  { id: "produits/collier-ambre-d-automne-2", bg: "#f1e4d2", prop: ["leaves"], items: [P.ambre], zoom: Z(600, 940, 520), light: "right" },
  { id: "produits/sautoir-terracotta-1", bg: "#efe0cd", prop: ["leaves"], items: [P.terracotta()] },
  { id: "produits/sautoir-terracotta-2", bg: "#efe0cd", prop: ["leaves"], items: [P.terracotta()], zoom: Z(600, 1080, 520), light: "right" },
  { id: "produits/boucles-feuille-d-or-1", bg: "#f2e6d6", prop: ["leaves"], items: pair(540, 2.1, [{ r: 11, c: AMBER[0] }], { k: "leaf", s: 0.95 }) },
  { id: "produits/boucles-feuille-d-or-2", bg: "#f2e6d6", prop: ["leaves"], items: pair(540, 2.1, [{ r: 11, c: AMBER[0] }], { k: "leaf", s: 0.95 }), zoom: Z(440, 640, 520), light: "right" },

  // ---- produits avec photo portée : 2e vue à plat
  { id: "produits/collier-rouge-love-2", bg: "#f3e8e2", prop: ["flower"], items: [{ t: "pendant", cx: 600, top: -20, w: 600, depth: 960, base: "cord", cordColor: RED, cordW: 7,
      beads: { from: 0.44, to: 0.56, beads: [PEARL], kinds: ["pearl"], r: 16, gap: 4 }, pendant: [{ k: "key", dx: 62, dy: 6, s: 1.4 }, { k: "heart", dx: -14, dy: 8, s: 1.6 }] }] },
  { id: "produits/collier-bronze-2", bg: "#efe5d8", prop: ["flower"], items: [{ t: "cluster", cx: 600, top: -20, w: 640, depth: 900, base: "thread",
      beads: { from: 0.33, to: 0.67, beads: BRZ, kinds: ["facet"], sizes: (i, p) => 18 + 12 * (1 - Math.abs(p - 0.5) * 4), gap: 0.98 } }] },
  { id: "produits/collier-bronze-gouttes-2", bg: "#ede2d3", prop: ["stones"], items: [{ t: "cluster", cx: 600, top: -20, w: 640, depth: 860, base: "thread",
      beads: { from: 0.36, to: 0.64, beads: BRZ, kinds: ["facet"], r: 22, gap: 0.98 },
      pendant: [{ k: "drop", dx: -70, dy: -6, s: 0.8, c: BRZ[1] }, { k: "drop", dx: 70, dy: -6, s: 0.8, c: BRZ[1] }, { k: "drop", dx: 0, dy: 12, s: 1.05, c: BRZ[0] }] }] },
  { id: "produits/collier-coeur-de-l-ocean-2", bg: "#e9eef0", prop: ["shell"], items: [{ t: "pendant", cx: 600, top: -20, w: 600, depth: 940, base: "thread",
      beads: { from: 0.02, to: 0.98, beads: [GREY[0], NAVY, GREY[2], GREY[1]], kinds: ["glass"], r: 6, gap: 1.0 }, pendant: { k: "shell", s: 1.7, dy: 4 } }] },
  { id: "produits/collier-grey-shades-2", bg: "#eeece8", prop: ["stones"], light: "right", items: [{ t: "pendant", cx: 600, top: -20, w: 600, depth: 940, base: "thread",
      beads: { from: 0.02, to: 0.98, beads: GREY, kinds: ["glass"], r: 6, gap: 1.0 }, pendant: { k: "stone", s: 1.6, dy: 4 } }] },

  // ---- catégories
  { id: "categories/sautoirs", bg: "#ece0cf", prop: ["leaves"], items: [P.terracotta(420, 520), { ...P.sautoirRouge, cx: 790, w: 460, depth: 1250 }] },
  { id: "categories/ras-de-cou", bg: "#f1e9de", prop: ["shell"], items: [P.rasNacree(600, 700, 360), P.rasOcean(600, 700, 250)] },
  { id: "categories/bracelets", bg: "#f2e7e1", prop: ["flower"], items: [P.braceletTexas(420, 1060, 200), P.braceletBronze(800, 760, 200), P.braceletRouge(430, 480, 190)] },
  { id: "categories/boucles-d-oreilles", bg: "#ebe8e4", items: [
      ...pair(260, 1.5, [{ r: 6, c: GREY[0] }, { r: 6, c: GREY[1] }, { r: 6, c: GREY[2] }], { k: "shell", s: 0.9 }, 480, 720),
      ...pair(680, 1.5, [{ r: 10, c: CORAL, k: "facet" }], { k: "nacre", s: 0.9 }, 480, 720),
      ...pair(1080, 1.5, [{ r: 11, c: AMBER[0] }], { k: "leaf", s: 0.9 }, 480, 720)] },

  // ---- collection Édition Fall
  { id: "collections/edition-fall", bg: "#f0e3d2", prop: ["leaves"], items: [P.terracotta(600, 760), { ...P.ambre, w: 420, depth: 760 }, ...pair(1240, 1.4, [{ r: 11, c: AMBER[0] }], { k: "leaf", s: 0.95 }, 470, 730)] },

  // ---- l'atelier (en attendant le portrait de la créatrice)
  { id: "maison/atelier", bg: "#efe6da", light: "left", items: [
      dish(360, 420, 230, [CORAL, PEARL, CORAL], ["facet", "pearl", "facet"], 30, 3),
      dish(860, 640, 200, BRZ, ["facet"], 22, 5),
      dish(420, 1010, 210, [GREEN[0], G, GREEN[1]], ["matte", "gold", "matte"], 26, 7),
      spool(880, 1170, RED),
      { t: "pendant", cx: 760, top: 980, w: 260, depth: 220, base: "chain", chainW: 5, pendant: { k: "nacre", s: 0.9, dy: 4 } }] },
];
