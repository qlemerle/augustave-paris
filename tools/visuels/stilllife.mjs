// Natures mortes "à plat" des bijoux, sur lin, en lumière de fin de journée.
// Produit des SVG 1200x1500 que render.cjs convertit en JPG.

const W = 1200, H = 1500;

/* ---------- couleurs ---------- */
const hx = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const toHex = (a) => "#" + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const mix = (a, b, t) => toHex(hx(a).map((v, i) => v + (hx(b)[i] - v) * t));
const light = (c, t) => mix(c, "#ffffff", t);
const dark = (c, t) => mix(c, "#000000", t);

/* ---------- hasard reproductible ---------- */
function rng(seed) {
  let s = 0;
  for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/* ---------- courbes ---------- */
// Catmull-Rom -> polyligne dense
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
const d = (poly) => "M" + poly.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L");

/* ---------- matériaux ---------- */
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

/* ---------- fils, chaînes ---------- */
function cord(poly, color, w = 5) {
  return (
    `<path d="${d(poly)}" fill="none" stroke="${dark(color, 0.25)}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d(poly)}" fill="none" stroke="${light(color, 0.15)}" stroke-width="${w * 0.45}" stroke-linecap="round" opacity=".7" transform="translate(-0.6 -0.8)"/>`
  );
}
function chain(D, poly, w = 6) {
  // maillons forçat : tirets alternés
  return (
    `<path d="${d(poly)}" fill="none" stroke="${dark(GOLD, 0.35)}" stroke-width="${w}" stroke-dasharray="${w * 1.5} ${w * 0.5}" stroke-linecap="round"/>` +
    `<path d="${d(poly)}" fill="none" stroke="${light(GOLD, 0.35)}" stroke-width="${w * 0.55}" stroke-dasharray="${w * 1.1} ${w * 0.9}" stroke-linecap="round" transform="translate(-0.8 -1)"/>`
  );
}
function thread(poly) {
  return `<path d="${d(poly)}" fill="none" stroke="#8a7a66" stroke-opacity=".45" stroke-width="1.6"/>`;
}

// enfile des perles le long d'une courbe
function string(D, poly, { from = 0, to = 1, beads, kinds, r = 12, gap = 1.04, sizes }) {
  const L = measure(poly), tot = L[L.length - 1];
  let s = "", dist = from * tot, i = 0;
  const items = [];
  while (dist < to * tot) {
    const rr = sizes ? sizes(i, dist / tot) : r;
    const p = at(poly, L, dist + rr);
    items.push([p[0], p[1], rr, beads[i % beads.length], (kinds || ["glass"])[i % (kinds || ["glass"]).length], p[2]]);
    dist += rr * 2 * gap;
    i++;
  }
  for (const [x, y, rr, c, k, a] of items) s += bead(D, x, y, rr, c, k, a);
  return s;
}

/* ---------- pendentifs ---------- */
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

/* ---------- accessoires du décor ---------- */
function props(kind, R, palette) {
  let s = "";
  if (kind === "flower") {
    // brindille fleurie (rappel des photos de la marque)
    const stem = spline([[-40, 260], [120, 300], [240, 380], [330, 470]]);
    s += `<g filter="url(#bokeh)" opacity=".85"><path d="${d(stem)}" stroke="#7a5b3e" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    [[110, 296, 0], [200, 345, 40], [290, 430, -20]].forEach(([x, y, a]) => {
      s += `<g transform="translate(${x} ${y}) rotate(${a})">${[0, 72, 144, 216, 288].map((r) => `<ellipse rx="15" ry="24" cy="-20" fill="#f6e3e0" transform="rotate(${r})"/>`).join("")}<circle r="7" fill="#d9a05b"/></g>`;
    });
    s += `<path d="M240 380 C270 350 300 352 318 360 C296 384 268 390 240 380Z" fill="#9db27a"/></g>`;
  }
  if (kind === "leaves") {
    [[150, 200, 30, "#b8692f"], [1040, 1250, -140, "#a4502a"], [1080, 260, 160, "#d9a05b"], [120, 1300, -60, "#c98a3f"]].forEach(([x, y, a, c]) => {
      s += `<g transform="translate(${x} ${y}) rotate(${a})" filter="url(#soft)"><path d="M0 0 C70 30 90 120 0 190 C-90 120 -70 30 0 0Z" fill="${c}"/><path d="M0 10 L0 200" stroke="${dark(c, 0.3)}" stroke-width="4"/><path d="M0 60 L34 40 M0 100 L40 76 M0 60 L-34 40 M0 100 L-40 76" stroke="${dark(c, 0.25)}" stroke-width="2.5"/></g>`;
    });
  }
  if (kind === "shell") {
    s += `<g transform="translate(1000 1270) rotate(-20)" filter="url(#soft)"><path d="M0 -90 C80 -90 120 -10 100 50 C80 100 -80 100 -100 50 C-120 -10 -80 -90 0 -90Z" fill="url(#nacre)"/>${[...Array(9)].map((_, i) => `<path d="M0 -84 L${-90 + i * 22} 70" stroke="#c7b6a6" stroke-width="2.5" opacity=".7"/>`).join("")}</g>`;
  }
  if (kind === "stones") {
    s += `<g filter="url(#soft)"><ellipse cx="1030" cy="1280" rx="92" ry="62" fill="url(#pebble)"/><ellipse cx="900" cy="1360" rx="54" ry="38" fill="url(#pebble)" transform="rotate(20 900 1360)"/></g>`;
  }
  if (kind === "dish") {
    s += `<g filter="url(#soft)"><ellipse cx="600" cy="760" rx="330" ry="300" fill="url(#ceramic)"/><ellipse cx="600" cy="760" rx="285" ry="258" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/></g>`;
  }
  if (kind === "beads") {
    // perles éparses
    for (let i = 0; i < 9; i++) {
      const x = 120 + R() * 960, y = R() < 0.5 ? 120 + R() * 180 : 1250 + R() * 160;
      s += `<g filter="url(#drop)">${bead(propsDefs, x, y, 9 + R() * 8, palette[i % palette.length], "glass")}</g>`;
    }
  }
  return s;
}
let propsDefs;

/* ---------- scène ---------- */
function scene(D, { bg = "#efe6da", body, prop = [], seed = "x", palette = [GOLD], zoom = null, light = "left" }) {
  const R = rng(seed);
  propsDefs = D;
  const p = prop.map((k) => props(k, R, palette)).join("");
  const view = zoom ? zoom.join(" ") : `0 0 ${W} ${H}`;
  const lx = light === "left" ? 0.18 : 0.82;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view}" width="${zoom ? 1200 : W}" height="${zoom ? 1500 : H}" preserveAspectRatio="xMidYMid slice">
<defs>
<filter id="linen" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9 0.025" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0"/></filter>
<filter id="linen2" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.025 0.9" numOctaves="2" seed="9"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .4 0"/></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" seed="2"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .09 0"/></filter>
<filter id="folds" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.0022 0.006" numOctaves="2" seed="${Math.floor(R() * 50)}"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.1 -.35"/></filter>
<filter id="mottle"><feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="2"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 -.4"/><feComposite in2="SourceGraphic" operator="in"/></filter>
<filter id="drop" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="${light === "left" ? 9 : -9}" dy="12" stdDeviation="7" flood-color="#3a2a18" flood-opacity=".32"/></filter>
<filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="${light === "left" ? 14 : -14}" dy="18" stdDeviation="14" flood-color="#3a2a18" flood-opacity=".22"/></filter>
<filter id="bokeh" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>
<filter id="blur40"><feGaussianBlur stdDeviation="40"/></filter>
<radialGradient id="vign" cx=".5" cy=".48" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#2a1c10" stop-opacity=".28"/></radialGradient>
<radialGradient id="sun" cx="${lx}" cy=".12" r=".9"><stop offset="0" stop-color="#fff6e2" stop-opacity=".75"/><stop offset=".5" stop-color="#fff2d8" stop-opacity=".15"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<radialGradient id="nacre" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#fffaf3"/><stop offset=".4" stop-color="#f0e4dc"/><stop offset=".65" stop-color="#dfe6ea"/><stop offset=".85" stop-color="#ecd9d2"/><stop offset="1" stop-color="#d8c4b4"/></radialGradient>
<radialGradient id="pebble" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#b9b6b0"/><stop offset="1" stop-color="#7f7c77"/></radialGradient>
<radialGradient id="ceramic" cx=".42" cy=".38" r=".75"><stop offset="0" stop-color="#fbf7f1"/><stop offset=".8" stop-color="#ece3d6"/><stop offset="1" stop-color="#d9ccbb"/></radialGradient>
${D}
</defs>
<rect width="${W}" height="${H}" fill="${bg}"/>
<rect width="${W}" height="${H}" filter="url(#folds)" opacity=".3"/>
<rect width="${W}" height="${H}" fill="${dark(bg, 0.2)}" filter="url(#linen)" opacity=".22"/>
<rect width="${W}" height="${H}" fill="${dark(bg, 0.2)}" filter="url(#linen2)" opacity=".16"/>
<rect width="${W}" height="${H}" fill="${bg}" opacity=".35" style="mix-blend-mode:multiply"/>
<rect width="${W}" height="${H}" fill="url(#sun)"/>
${p}
<g filter="url(#drop)">${body}</g>
<g opacity=".16" filter="url(#blur40)"><path d="M${light === "left" ? -100 : 1300} -100 L${light === "left" ? 500 : 700} -100 L${light === "left" ? 1300 : -100} 1700 L${light === "left" ? 900 : 300} 1700Z" fill="#fff8e8"/></g>
<rect width="${W}" height="${H}" fill="url(#vign)"/>
<rect width="${W}" height="${H}" filter="url(#grain)"/>
</svg>`;
}

/* ---------- compositions ---------- */
const U = (cx, top, w, depth, tilt = 0) => [
  [cx - w / 2 - tilt, top], [cx - w * 0.47, top + depth * 0.45], [cx - w * 0.26, top + depth * 0.86], [cx, top + depth], [cx + w * 0.26, top + depth * 0.86], [cx + w * 0.47, top + depth * 0.45], [cx + w / 2 + tilt, top],
];
const loop = (cx, cy, rx, ry, n = 12, wob = 0, R = Math.random) =>
  [...Array(n)].map((_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const k = 1 + (R() - 0.5) * wob;
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k];
  });

export function render(spec) {
  const D = new Defs();
  const R = rng(spec.seed || spec.id);
  const parts = [];
  const add = (s) => parts.push(s);
  for (const it of spec.items) {
    const { t } = it;
    if (t === "pendant" || t === "long" || t === "cluster" || t === "choker") {
      const poly = it.closed ? spline(loop(it.cx, it.cy, it.rx, it.ry, 14, it.wob || 0.04, R), true) : spline(U(it.cx, it.top, it.w, it.depth, it.tilt || 0));
      if (it.base === "cord") add(cord(poly, it.cordColor || "#b3262e", it.cordW || 6));
      else if (it.base === "chain") add(chain(D, poly, it.chainW || 6));
      else add(thread(poly));
      if (it.beads) add(string(D, poly, it.beads));
      if (it.beads2) add(string(D, poly, it.beads2));
      if (it.pendant) {
        const L = measure(poly);
        const m = at(poly, L, L[L.length - 1] * (it.closed ? 0.5 : 0.5));
        for (const pd of [].concat(it.pendant)) add(pendant(D, pd.k, m[0] + (pd.dx || 0), m[1] + (pd.dy || 0), pd.s || 1, pd.c));
      }
    }
    if (t === "bracelet") {
      const poly = spline(loop(it.cx, it.cy, it.r, it.r * (it.squash || 0.96), 12, 0.03, R), true);
      add(thread(poly));
      add(string(D, poly, it.beads));
      if (it.pendant) add(pendant(D, it.pendant.k, it.cx + (it.pendant.dx || 0), it.cy + it.r + (it.pendant.dy || -4), it.pendant.s || 0.8, it.pendant.c));
    }
    if (t === "earring") {
      const { x, y, s = 1 } = it;
      let e = `<g transform="translate(${x} ${y}) rotate(${it.rot || 0}) scale(${s})">`;
      e += `<path d="M0 -22 L0 -40 C0 -84 18 -104 40 -100 C62 -96 64 -68 52 -52" fill="none" stroke="${D.grad("metal", GOLD)}" stroke-width="5" stroke-linecap="round"/>`;
      e += `<circle cx="0" cy="-22" r="5" fill="${D.grad("metal", GOLD)}"/>`;
      let yy = -16;
      for (const b of it.beads || []) {
        e += bead(D, 0, yy + b.r, b.r, b.c, b.k);
        yy += b.r * 2 + 2;
      }
      e += pendant(D, it.pendant.k, 0, yy + 6, it.pendant.s || 0.8, it.pendant.c);
      e += `</g>`;
      add(e);
    }
    if (t === "raw") add(it.svg(D, { bead, pendant, GOLD }));
  }
  return scene(D, { bg: spec.bg, body: parts.join(""), prop: spec.prop || [], seed: spec.id, palette: spec.palette || [GOLD], zoom: spec.zoom, light: spec.light });
}
