// Illustrations vectorielles utilisées en attendant les vraies photos.
// Fichier en JavaScript pur : partagé par le site Next.js et par l'aperçu statique.
// Dès qu'un produit a une vraie photo, ce rendu n'est plus utilisé pour lui.

/**
 * @typedef {Object} JewelArt
 * @property {"pendant"|"cluster"|"long"|"choker"|"multi"|"bracelet"|"earrings"} type
 * @property {string[]} beads  couleurs des perles
 * @property {string|null} [pendant]  heart | coin | nacre | stone | shell | drop | leaf
 * @property {[string,string]} bg  dégradé de fond
 */

const W = 400;
const H = 500;

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}

function quad(a, c, b, t) {
  const u = 1 - t;
  return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
}

function bead(x, y, r, color) {
  return (
    `<circle cx="${x.toFixed(1)}" cy="${(y + r * 0.25).toFixed(1)}" r="${r}" fill="#000" opacity=".08"/>` +
    `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${color}"/>` +
    `<circle cx="${(x - r * 0.35).toFixed(1)}" cy="${(y - r * 0.38).toFixed(1)}" r="${(r * 0.32).toFixed(1)}" fill="#fff" opacity=".45"/>`
  );
}

function strand(a, c, b, { color, width = 1.4, beads = [], from = 0, to = 1, count = 0, r = 6 }) {
  let s = `<path d="M${a} Q${c} ${b}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? (from + to) / 2 : from + ((to - from) * i) / (count - 1);
    const [x, y] = quad(a, c, b, t);
    // les perles grossissent légèrement vers le centre
    const k = 1 - Math.abs(t - 0.5) * 0.6;
    s += bead(x, y, +(r * k).toFixed(1), beads[i % beads.length]);
  }
  return s;
}

function pendantShape(kind, x, y, id, accent) {
  const g = `url(#g${id})`;
  switch (kind) {
    case "heart":
      return `<g transform="translate(${x} ${y})"><line x1="0" y1="-6" x2="0" y2="2" stroke="${g}" stroke-width="2"/><path d="M0 34 C-26 16 -24 -4 -11 -4 C-5 -4 -1 0 0 5 C1 0 5 -4 11 -4 C24 -4 26 16 0 34Z" fill="${g}"/><path d="M-12 4 C-12 0 -8 -1 -6 1" stroke="#fff" stroke-width="2" fill="none" opacity=".55"/></g>`;
    case "coin":
      return `<g transform="translate(${x} ${y + 18})"><circle r="18" fill="${g}"/><circle r="12.5" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.2"/></g>`;
    case "nacre":
      return `<g transform="translate(${x} ${y + 26})"><ellipse rx="21" ry="25" fill="${g}"/><ellipse rx="17" ry="21" fill="url(#n${id})"/><ellipse cx="-5" cy="-8" rx="5" ry="8" fill="#fff" opacity=".5"/></g>`;
    case "stone":
      return `<g transform="translate(${x} ${y + 22})"><circle r="22" fill="${g}"/><circle r="11" fill="#3a3d42"/><circle cx="-3.5" cy="-3.5" r="3" fill="#fff" opacity=".35"/></g>`;
    case "shell":
      return `<g transform="translate(${x} ${y + 24})"><path d="M0 -22 C18 -22 26 -6 22 8 C18 22 -6 26 -18 16 C-28 6 -20 -22 0 -22Z" fill="${g}"/><ellipse cx="1" cy="1" rx="9" ry="8" fill="${accent}"/><ellipse cx="-2" cy="-2" rx="2.6" ry="2.2" fill="#fff" opacity=".45"/></g>`;
    case "drop":
      return `<g transform="translate(${x} ${y})"><path d="M0 0 C10 18 14 26 14 33 C14 41 7 47 0 47 C-7 47 -14 41 -14 33 C-14 26 -10 18 0 0Z" fill="${g}"/><ellipse cx="-5" cy="32" rx="3" ry="6" fill="#fff" opacity=".4"/></g>`;
    case "leaf":
      return `<g transform="translate(${x} ${y}) rotate(-12)"><path d="M0 0 C18 10 20 32 0 50 C-20 32 -18 10 0 0Z" fill="${g}"/><path d="M0 6 L0 46" stroke="#fff" stroke-opacity=".4" stroke-width="1.2"/></g>`;
    default:
      return "";
  }
}

function silhouette(id) {
  // épaules et cou stylisés, façon buste de présentation
  return (
    `<path d="M140 0 C142 70 136 110 120 140 C90 180 20 196 -10 230 L-10 ${H} L${W + 10} ${H} L${W + 10} 230 C${W - 20} 196 ${W - 90} 180 ${W - 120} 140 C${W - 136} 110 ${W - 142} 70 ${W - 140} 0Z" fill="url(#s${id})"/>` +
    `<path d="M120 140 C150 210 250 210 280 140" fill="none" stroke="#000" stroke-opacity=".035" stroke-width="10"/>`
  );
}

/**
 * Renvoie un SVG (chaîne) représentant le bijou.
 * @param {JewelArt} art
 * @param {{seed?: string, variant?: number}} [opts] variant=1 donne un cadrage différent (2e image)
 */
export function jewelSvg(art, opts = {}) {
  const id = hash((opts.seed || "") + JSON.stringify(art) + (opts.variant || 0));
  const beads = art.beads && art.beads.length ? art.beads : ["#c6a15b"];
  const [bg1, bg2] = art.bg || ["#efe6d8", "#e0d0b8"];
  const accent = beads[0];
  const zoom = opts.variant === 1;
  let body = "";
  let wearable = true;

  switch (art.type) {
    case "pendant": {
      const a = [150, 150], c = [200, 330], b = [250, 150];
      body += strand(a, c, b, { color: accent, width: 2, beads, count: art.pendant === "heart" ? 0 : 13, from: 0.18, to: 0.82, r: 4.5 });
      const [x, y] = quad(a, c, b, 0.5);
      body += pendantShape(art.pendant, x, y, id, accent);
      break;
    }
    case "cluster": {
      const a = [148, 150], c = [200, 330], b = [252, 150];
      body += strand(a, c, b, { color: "#b08d4f", width: 1.2, beads, count: 11, from: 0.3, to: 0.7, r: 10.5 });
      break;
    }
    case "long": {
      const a = [148, 150], c = [200, 520], b = [252, 150];
      body += strand(a, c, b, { color: "#b08d4f", width: 1.2, beads, count: 27, from: 0.06, to: 0.94, r: 5 });
      if (art.pendant) {
        const [x, y] = quad(a, c, b, 0.5);
        body += pendantShape(art.pendant, x, y + 4, id, accent);
      }
      break;
    }
    case "choker": {
      const a = [132, 150], c = [200, 236], b = [268, 150];
      body += strand(a, c, b, { color: "#b08d4f", width: 1, beads, count: 21, from: 0.02, to: 0.98, r: 5 });
      if (art.pendant) {
        const [x, y] = quad(a, c, b, 0.5);
        body += pendantShape(art.pendant, x, y + 2, id, accent);
      }
      break;
    }
    case "multi": {
      [[220, 4.8, 15], [270, 5.6, 17], [325, 6.2, 19]].forEach(([depth, r, count], i) => {
        body += strand([146 - i * 4, 150], [200, depth], [254 + i * 4, 150], {
          color: "#b08d4f", width: 1, beads: beads.slice(i % beads.length).concat(beads.slice(0, i % beads.length)), count, from: 0.1, to: 0.9, r,
        });
      });
      break;
    }
    case "bracelet": {
      wearable = false;
      const cx = 200, cy = 270, rx = 105, ry = 62, n = 22;
      body += `<ellipse cx="${cx}" cy="${cy + 70}" rx="120" ry="18" fill="#000" opacity=".06"/>`;
      body += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#b08d4f" stroke-width="1.2"/>`;
      const items = [];
      for (let i = 0; i < n; i++) {
        const t = (i / n) * Math.PI * 2;
        items.push({ x: cx + Math.cos(t) * rx, y: cy + Math.sin(t) * ry, i });
      }
      items.sort((p, q) => p.y - q.y).forEach((p) => {
        const r = 7.5 + ((p.y - (cy - ry)) / (2 * ry)) * 3;
        body += bead(p.x, p.y, +r.toFixed(1), beads[p.i % beads.length]);
      });
      if (art.pendant) body += pendantShape(art.pendant, cx, cy + ry - 4, id, accent);
      break;
    }
    case "earrings": {
      wearable = false;
      [150, 250].forEach((x, k) => {
        const y0 = 200 + k * 6;
        body += `<path d="M${x - 14} ${y0 - 20} C${x - 14} ${y0 - 44} ${x + 14} ${y0 - 44} ${x + 14} ${y0 - 22} L${x} ${y0}" fill="none" stroke="url(#g${id})" stroke-width="2.2" stroke-linecap="round"/>`;
        body += bead(x, y0 + 12, 9, beads[0]);
        body += pendantShape(art.pendant || "drop", x, y0 + 24, id, accent);
      });
      break;
    }
  }

  const view = zoom ? "92 120 216 270" : "50 70 300 375";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view}" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">` +
    `<defs>` +
    `<linearGradient id="b${id}" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></linearGradient>` +
    `<radialGradient id="l${id}" cx=".3" cy=".15" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="s${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset="1" stop-color="#fff" stop-opacity=".12"/></linearGradient>` +
    `<linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1d79b"/><stop offset=".45" stop-color="#c9a35c"/><stop offset="1" stop-color="#9a7638"/></linearGradient>` +
    `<radialGradient id="n${id}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fffaf3"/><stop offset=".5" stop-color="#eadfd6"/><stop offset=".8" stop-color="#d7e1e6"/><stop offset="1" stop-color="#e9d6cf"/></radialGradient>` +
    `</defs>` +
    `<rect x="-20" y="-20" width="${W + 40}" height="${H + 40}" fill="url(#b${id})"/>` +
    (wearable ? silhouette(id) : `<rect x="-20" y="330" width="${W + 40}" height="200" fill="#fff" opacity=".18"/>`) +
    body +
    `<rect x="-20" y="-20" width="${W + 40}" height="${H + 40}" fill="url(#l${id})"/>` +
    `</svg>`
  );
}

export function jewelDataUri(art, opts) {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(jewelSvg(art, opts));
}
