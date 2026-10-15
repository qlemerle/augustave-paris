"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initAnalytics, track, trackPage } from "@/lib/analytics.mjs";
import { site } from "@/lib/site";

let started = false;

/** Google Analytics 4 : bandeau cookies, puis pages vues (voir lib/analytics.mjs). */
export function Analytics() {
  const pathname = usePathname();
  useEffect(() => {
    if (started) return;
    started = true;
    initAnalytics(site.gaId);
  }, []);
  useEffect(() => {
    // le titre de la page est mis à jour juste après la navigation
    const t = setTimeout(() => trackPage(pathname), 50);
    return () => clearTimeout(t);
  }, [pathname]);
  return null;
}

/** Envoie un événement GA4 à l'affichage (ex. view_item sur une fiche produit). */
export function TrackEvent({ name, params }: { name: string; params: Record<string, unknown> }) {
  const key = JSON.stringify(params);
  useEffect(() => {
    // après la page vue
    const t = setTimeout(() => track(name, params), 120);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, key]);
  return null;
}
