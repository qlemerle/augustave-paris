// Partage des bijoux : story Instagram (image 1080 × 1920), partage natif du lien, copie du lien.
// JavaScript pur, partagé par le site Next.js (components/ShareProduct.tsx) et l'aperçu statique.

const NAVY = "#0e2340", GOLD = "#c6a15b", NACRE = "#f4f2ef", INK = "#172033", MUTED = "#62666d";

const loadImg = (src) =>
  new Promise((res, rej) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });

function wrap(g, text, maxW) {
  const words = text.split(/\s+/), lines = [];
  let line = "";
  for (const w of words) {
    const t = line ? line + " " + w : w;
    if (g.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Dessine la story d'un bijou.
 * @param {{ image?: string|null, art?: string|null, title: string, price: string, collection?: string, url: string }} p
 * art : SVG de l'illustration de remplacement quand il n'y a pas de photo
 */
export async function storyCanvas(p) {
  const W = 1080, H = 1920;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  try { await Promise.all([document.fonts.load('400 80px "Bodoni Moda"'), document.fonts.load('400 36px "Jost"')]); } catch (e) {}
  g.fillStyle = NACRE;
  g.fillRect(0, 0, W, H);

  // photo, recadrée comme object-fit: cover, dans un cadre
  const fx = 70, fy = 150, fw = W - 140, fh = 1220;
  let img = null;
  try {
    if (p.image) img = await loadImg(p.image);
    else if (p.art) img = await loadImg("data:image/svg+xml;charset=utf-8," + encodeURIComponent(p.art));
  } catch (e) {}
  if (img) {
    const k = Math.max(fw / img.width, fh / img.height);
    g.save();
    g.beginPath();
    g.rect(fx, fy, fw, fh);
    g.clip();
    g.drawImage(img, fx + (fw - img.width * k) / 2, fy + (fh - img.height * k) / 2, img.width * k, img.height * k);
    g.restore();
  }

  // marque
  g.fillStyle = NAVY;
  g.textAlign = "center";
  g.font = '400 40px "Bodoni Moda", Georgia, serif';
  g.fillText("A U G U S T A V E", W / 2, 96);
  g.fillStyle = GOLD;
  g.font = '400 22px "Jost", Arial, sans-serif';
  g.fillText("P A R I S", W / 2, 128);

  // texte
  let y = fy + fh + 110;
  if (p.collection) {
    g.fillStyle = GOLD;
    g.font = '400 34px "Jost", Arial, sans-serif';
    g.fillText(p.collection, W / 2, y);
    y += 86;
  }
  g.fillStyle = INK;
  g.font = '400 76px "Bodoni Moda", Georgia, serif';
  for (const line of wrap(g, p.title, W - 180).slice(0, 2)) {
    g.fillText(line, W / 2, y);
    y += 86;
  }
  g.fillStyle = MUTED;
  g.font = '400 38px "Jost", Arial, sans-serif';
  g.fillText(`${p.price} · fait main à Paris`, W / 2, y + 6);
  g.fillStyle = NAVY;
  g.font = '500 30px "Jost", Arial, sans-serif';
  g.fillText("@augustave.paris", W / 2, H - 70);
  return c;
}

const toFile = (c, name) =>
  new Promise((r) => c.toBlob((b) => r(new File([b], name, { type: "image/jpeg" })), "image/jpeg", 0.92));

export function canShareFiles() {
  try {
    const f = new File([new Blob(["x"], { type: "image/jpeg" })], "x.jpg", { type: "image/jpeg" });
    return !!(navigator.canShare && navigator.canShare({ files: [f] }));
  } catch (e) {
    return false;
  }
}

/** Story : partage natif de l'image sur mobile (Instagram, WhatsApp…), sinon téléchargement. */
export async function shareStory(p) {
  const c = await storyCanvas(p);
  const name = "augustave-" + (p.handle || "bijou") + ".jpg";
  if (canShareFiles()) {
    const file = await toFile(c, name);
    try {
      await navigator.share({ files: [file], text: `${p.title} · @augustave.paris ${p.url}` });
      return "shared";
    } catch (e) {
      if (e && e.name === "AbortError") return "cancelled";
    }
  }
  const a = document.createElement("a");
  a.download = name;
  a.href = c.toDataURL("image/jpeg", 0.92);
  a.click();
  return "downloaded";
}

/** Lien : feuille de partage du téléphone, sinon copie. */
export async function shareLink(p) {
  if (navigator.share) {
    try {
      await navigator.share({ title: p.title, text: `${p.title} · Augustave Paris`, url: p.url });
      return "shared";
    } catch (e) {
      if (e && e.name === "AbortError") return "cancelled";
    }
  }
  return copyLink(p.url);
}

export async function copyLink(url) {
  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch (e) {
    return "failed";
  }
}

export const shareUrls = (p) => ({
  whatsapp: `https://wa.me/?text=${encodeURIComponent(`${p.title} · Augustave Paris ${p.url}`)}`,
  pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(p.url)}&media=${encodeURIComponent(p.image || "")}&description=${encodeURIComponent(p.title + " · Augustave Paris")}`,
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(p.url)}`,
});
