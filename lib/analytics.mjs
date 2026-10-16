// Mesure d'audience Google Analytics 4, partagée par le site Next et l'aperçu.
// Rien n'est chargé ni déposé tant que la visiteuse n'a pas accepté (bandeau cookies, exigence CNIL).
// Les événements passent par track(), qui ne fait rien sans consentement.

const KEY = "augustave-cookies-v1";
let gaId = "";
let loaded = false;
let lastPage = "";

const stored = () => {
  try {
    return localStorage.getItem(KEY);
  } catch (e) {
    return null;
  }
};

function load() {
  if (loaded || !gaId) return;
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  // les pages vues sont envoyées à la main (navigation sans rechargement)
  // ?ga_debug dans l'adresse : les événements s'affichent dans GA4 > Admin > DebugView (mémorisé pour la visite)
  let debug = /[?&#]ga_debug\b/.test(location.href);
  try {
    if (debug) sessionStorage.setItem("augustave-ga-debug", "1");
    debug = debug || sessionStorage.getItem("augustave-ga-debug") === "1";
  } catch (e) {}
  window.gtag("config", gaId, { send_page_view: false, anonymize_ip: true, ...(debug ? { debug_mode: true } : {}) });
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(gaId);
  document.head.appendChild(s);
  if (lastPage) sendPage(lastPage);
}

function sendPage(path) {
  window.gtag("event", "page_view", { page_location: location.origin + path, page_path: path, page_title: document.title });
}

/**
 * Événement GA4 (ex. "add_to_cart", { currency, value, items }). Sans effet sans consentement.
 * @param {string} name
 * @param {Record<string, unknown>} [params]
 */
export function track(name, params) {
  if (loaded && window.gtag) window.gtag("event", name, params || {});
}

/** Page vue (à appeler à chaque changement de page). @param {string} path */
export function trackPage(path) {
  if (path === lastPage) return;
  lastPage = path;
  if (loaded) sendPage(path);
}

/**
 * Article au format GA4 e-commerce
 * @param {{ id: string, name: string, category?: string, collection?: string, variant?: string, price: number, quantity?: number }} item
 */
export function gaItem({ id, name, category, collection, variant, price, quantity = 1 }) {
  return {
    item_id: id,
    item_name: name,
    item_brand: "Augustave Paris",
    ...(category ? { item_category: category } : {}),
    ...(collection ? { item_category2: collection } : {}),
    ...(variant ? { item_variant: variant } : {}),
    price,
    quantity,
  };
}

function banner() {
  if (document.querySelector(".cookies")) return;
  const el = document.createElement("div");
  el.className = "cookies";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-label", "Cookies");
  el.innerHTML =
    '<p>Nous aimerions mesurer, de façon anonyme, comment le site est visité pour l\'améliorer. Vous êtes libre de refuser.</p>' +
    '<div class="cookies__actions"><button type="button" class="btn btn--solid" data-cookies="oui">Accepter</button>' +
    '<button type="button" class="btn" data-cookies="non">Refuser</button></div>';
  el.addEventListener("click", (e) => {
    const b = e.target.closest("[data-cookies]");
    if (!b) return;
    const yes = b.dataset.cookies === "oui";
    try {
      localStorage.setItem(KEY, yes ? "oui" : "non");
    } catch (err) {}
    el.remove();
    if (yes) load();
    else if (loaded) location.reload(); // retrait du consentement : on recharge sans la mesure
  });
  document.body.appendChild(el);
}

/** @param {string} id Démarre la mesure si l'identifiant est fourni : bandeau au premier passage, chargement si accepté. */
export function initAnalytics(id) {
  gaId = id || "";
  if (!gaId) return;
  // pour les modules sans import (atelier, partage)
  globalThis.augustaveTrack = track;
  // lien « Gérer les cookies » du pied de page
  document.addEventListener("click", (e) => {
    if (e.target.closest && e.target.closest("[data-cookies-open]")) {
      e.preventDefault();
      banner();
    }
  });
  const choice = stored();
  if (choice === "oui") load();
  else if (choice !== "non") banner();
}

export const analyticsEnabled = () => !!gaId;
