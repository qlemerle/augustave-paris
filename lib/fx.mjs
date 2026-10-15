// Effets immersifs (JavaScript pur, sans dépendance).
// Partagés par le site Next.js (components/Fx.tsx) et par l'aperçu statique.
//
//  - Écran d'introduction animé (une fois par visite)
//  - Rideau de transition entre les pages
//  - Texte qui s'illumine mot à mot au défilement   [data-words]
//  - Chapitres en défilement horizontal épinglé      [data-hscroll]
//  - Parallaxe des images                             [data-parallax="0.15"]
//  - Halo lumineux qui suit la souris                 [data-spotlight]
//  - Le fil d'or qui s'enfile de perles au défilement  .thread (créé ici)

const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = () => typeof matchMedia !== "undefined" && matchMedia("(pointer: fine)").matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/* ---------- Écran d'introduction ---------- */
export function initPreloader() {
  const el = document.querySelector(".preloader");
  if (!el) return;
  let seen = false;
  try {
    seen = sessionStorage.getItem("augustave-intro") === "1";
    sessionStorage.setItem("augustave-intro", "1");
  } catch (e) {}
  if (seen || reduced()) {
    el.remove();
    return;
  }
  el.classList.add("is-playing");
  document.documentElement.classList.add("is-intro");
  setTimeout(() => el.classList.add("is-leaving"), 2300);
  setTimeout(() => {
    document.documentElement.classList.remove("is-intro");
    el.remove();
  }, 3400);
}

/* ---------- Rideau de transition ---------- */
let curtainTimer;
export function curtainCover(label, done) {
  const c = document.querySelector(".curtain");
  if (!c || reduced()) return done();
  const l = c.querySelector(".curtain__label");
  if (l) l.textContent = label || "";
  c.classList.remove("is-revealing");
  c.classList.add("is-covering");
  clearTimeout(curtainTimer);
  curtainTimer = setTimeout(done, 650);
}
export function curtainReveal() {
  const c = document.querySelector(".curtain");
  if (!c || !c.classList.contains("is-covering")) return;
  requestAnimationFrame(() => {
    c.classList.add("is-revealing");
    c.classList.remove("is-covering");
    setTimeout(() => c.classList.remove("is-revealing"), 900);
  });
}

/* ---------- Le fil ---------- */
// Un fil d'or fixe le long du bord gauche de l'écran : il se tisse à mesure qu'on
// descend la page, et chaque section y est une perle aux couleurs des collections.
// Sur ordinateur, cliquer une perle mène à sa section.
const BEADS = ["#c6a15b", "#b3262e", "#f3ebe1", "#9a5b2e", "#8a8d91", "#6f9c7f", "#2b5c7e", "#b8692f"];
const NS = "http://www.w3.org/2000/svg";
function buildThread(rm) {
  const main = document.querySelector("main");
  if (!main || typeof innerWidth === "undefined") return null;
  document.querySelectorAll(".thread").forEach((t) => t.remove());
  const el = document.createElement("div");
  el.className = "thread";
  const svg = document.createElementNS(NS, "svg");
  const track = document.createElementNS(NS, "path");
  const line = document.createElementNS(NS, "path");
  track.setAttribute("class", "thread__track");
  line.setAttribute("class", "thread__line");
  line.setAttribute("pathLength", "1");
  svg.append(track, line);
  el.append(svg);
  document.body.append(el);
  let beads = [], max = 1;
  const layout = () => {
    const small = innerWidth < 900;
    const W = small ? 18 : 40, cx = small ? 8 : 22, amp = small ? 2.5 : 5;
    const V = innerHeight, y0 = small ? 70 : 110, y1 = V - (small ? 24 : 40);
    const X = (y) => cx + Math.sin(y / 70) * amp;
    el.style.width = W + "px";
    svg.setAttribute("viewBox", `0 0 ${W} ${V}`);
    let d = `M${X(y0).toFixed(1)} ${y0}`;
    for (let y = y0 + 8; y <= y1; y += 8) d += ` L${X(y).toFixed(1)} ${y}`;
    track.setAttribute("d", d);
    line.setAttribute("d", d);
    max = Math.max(1, document.documentElement.scrollHeight - V);
    beads.forEach((b) => b.g.remove());
    beads = [];
    const secs = [...main.querySelectorAll("section")].filter((s) => s.offsetHeight > 240 && !s.parentElement.closest("section"));
    let last = -1;
    secs.forEach((s) => {
      const f = Math.min(1, Math.max(0, (s.getBoundingClientRect().top + scrollY) / max));
      const y = y0 + f * (y1 - y0);
      if (last >= 0 && y - last < (small ? 14 : 22)) return;
      last = y;
      const c = BEADS[beads.length % BEADS.length];
      const r = small ? 3.2 : beads.length % 3 === 0 ? 5.5 : 4.5;
      const title = (s.querySelector("h1, h2")?.textContent || "").trim().replace(/\s+/g, " ");
      const g = document.createElementNS(NS, "g");
      g.setAttribute("class", "thread__bead");
      g.innerHTML =
        `<circle cx="${X(y).toFixed(1)}" cy="${y.toFixed(1)}" r="${small ? 6 : 11}" fill="transparent"/>` +
        `<circle cx="${X(y).toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${c}" stroke="${c === "#f3ebe1" ? "#c6a15b" : "rgba(0,0,0,.2)"}" stroke-width=".8"/>` +
        `<circle cx="${(X(y) - r * 0.35).toFixed(1)}" cy="${(y - r * 0.38).toFixed(1)}" r="${(r * 0.3).toFixed(1)}" fill="#fff" opacity=".75"/>`;
      if (!small && title) {
        g.setAttribute("role", "link");
        g.setAttribute("tabindex", "0");
        g.setAttribute("aria-label", title);
        const t = document.createElementNS(NS, "title");
        t.textContent = title;
        g.prepend(t);
        const go = () => scrollTo({ top: s.getBoundingClientRect().top + scrollY - 20, behavior: rm ? "auto" : "smooth" });
        g.addEventListener("click", go);
        g.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), go()));
      }
      svg.append(g);
      beads.push({ g, f });
    });
    update();
  };
  const update = () => {
    const p = Math.min(1, Math.max(0, scrollY / max));
    line.style.strokeDashoffset = String(1 - p);
    beads.forEach((b) => b.g.classList.toggle("is-on", b.f <= p + 0.004));
  };
  // la hauteur de page change quand les images et les polices arrivent
  let t;
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => { clearTimeout(t); t = setTimeout(layout, 120); }) : null;
  ro && ro.observe(main);
  layout();
  return { el, layout, update, destroy: () => { ro && ro.disconnect(); clearTimeout(t); el.remove(); } };
}

/* ---------- Effets liés à la page ---------- */
export function initPageFx(root = document) {
  const cleanups = [];
  const rm = reduced();

  // Mots qui s'illuminent
  const wordBlocks = [...root.querySelectorAll("[data-words]")].map((el) => {
    if (!el.dataset.split) {
      el.innerHTML = el.textContent
        .trim()
        .split(/\s+/)
        .map((w) => `<span class="w">${w}</span> `)
        .join("");
      el.dataset.split = "1";
    }
    return { el, words: [...el.querySelectorAll(".w")] };
  });

  // Défilement horizontal épinglé
  const hs = [...root.querySelectorAll("[data-hscroll]")].map((sec) => ({
    sec,
    track: sec.querySelector("[data-hscroll-track]"),
    panels: [...sec.querySelectorAll("[data-panel]")],
    bar: sec.querySelector("[data-hscroll-bar]"),
  }));
  const sizeHs = () =>
    hs.forEach((h) => {
      if (!h.track) return;
      // fin du défilement = bord droit du dernier chapitre (les grands chiffres débordent)
      const last = h.panels[h.panels.length - 1];
      const end = last ? last.offsetLeft + last.offsetWidth + (parseFloat(getComputedStyle(h.track).paddingRight) || 0) : h.track.scrollWidth;
      const extra = Math.max(0, end - innerWidth);
      h.extra = extra;
      h.sec.style.height = rm ? "" : `${innerHeight + extra}px`;
    });
  sizeHs();

  const parallax = [...root.querySelectorAll("[data-parallax]")];
  const thread = buildThread(rm);
  if (thread) cleanups.push(thread.destroy);

  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = innerHeight;
    if (thread) thread.update();
    for (const b of wordBlocks) {
      const r = b.el.getBoundingClientRect();
      const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35));
      const lit = Math.round(p * b.words.length);
      b.words.forEach((w, i) => w.classList.toggle("is-lit", rm || i < lit));
    }
    if (!rm)
      for (const h of hs) {
        if (!h.track) continue;
        const r = h.sec.getBoundingClientRect();
        const p = h.extra ? clamp(-r.top / h.extra) : 0;
        h.track.style.transform = `translate3d(${-p * h.extra}px,0,0)`;
        if (h.bar) h.bar.style.transform = `scaleX(${p})`;
        h.panels.forEach((panel) => {
          const pr = panel.getBoundingClientRect();
          const c = (pr.left + pr.width / 2 - innerWidth / 2) / innerWidth;
          panel.style.setProperty("--off", c.toFixed(3));
          panel.style.setProperty("--a", Math.min(1, Math.abs(c)).toFixed(3));
          panel.classList.toggle("is-active", Math.abs(c) < 0.35);
        });
      }
    if (!rm)
      for (const el of parallax) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        const speed = parseFloat(el.dataset.parallax) || 0.12;
        const c = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.transform = `translate3d(0, ${(-c * speed * 100).toFixed(2)}%, 0) scale(${1 + speed})`;
      }
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  const onResize = () => {
    sizeHs();
    if (thread) thread.layout();
    onScroll();
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onResize);
  cleanups.push(() => {
    removeEventListener("scroll", onScroll);
    removeEventListener("resize", onResize);
  });
  update();
  // les polices et images peuvent changer les dimensions
  const t = setTimeout(onResize, 800);
  cleanups.push(() => clearTimeout(t));

  // Carrousels : boutons précédent / suivant et barre de position
  root.querySelectorAll("[data-rail]").forEach((rail) => {
    const nav = rail.nextElementSibling;
    if (!nav || !nav.classList.contains("rail-nav")) return;
    const prev = nav.querySelector("[data-rail-prev]");
    const next = nav.querySelector("[data-rail-next]");
    const bar = nav.querySelector("[data-rail-bar]");
    const sync = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      const ratio = rail.scrollWidth ? rail.clientWidth / rail.scrollWidth : 1;
      const p = max > 0 ? rail.scrollLeft / max : 0;
      if (bar) {
        bar.style.setProperty("--w", `${(ratio * 100).toFixed(1)}%`);
        bar.style.setProperty("--x", `${((p * (1 - ratio)) / ratio * 100).toFixed(1)}%`);
      }
      if (prev) prev.disabled = rail.scrollLeft < 4;
      if (next) next.disabled = rail.scrollLeft > max - 4;
    };
    const step = (dir) => {
      const card = rail.firstElementChild;
      const w = card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).columnGap || "0") : rail.clientWidth;
      rail.scrollBy({ left: dir * w, behavior: rm ? "auto" : "smooth" });
    };
    const onPrev = () => step(-1);
    const onNext = () => step(1);
    prev && prev.addEventListener("click", onPrev);
    next && next.addEventListener("click", onNext);
    rail.addEventListener("scroll", sync, { passive: true });
    addEventListener("resize", sync);
    sync();
    cleanups.push(() => {
      prev && prev.removeEventListener("click", onPrev);
      next && next.removeEventListener("click", onNext);
      rail.removeEventListener("scroll", sync);
      removeEventListener("resize", sync);
    });
  });

  // Halo lumineux du héros
  if (fine() && !rm) {
    const onMove = (e) => {
      const s = e.target.closest && e.target.closest("[data-spotlight]");
      if (s) {
        const r = s.getBoundingClientRect();
        s.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
        s.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
      }
    };
    root.addEventListener("mousemove", onMove);
    cleanups.push(() => root.removeEventListener("mousemove", onMove));
  }

  return () => cleanups.forEach((f) => f());
}
