"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { curtainCover, curtainReveal, initPageFx, initPreloader } from "@/lib/fx.mjs";

/** Branche les effets immersifs (lib/fx.mjs) et le rideau de transition entre pages. */
export function Fx() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    initPreloader();
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || a.closest(".drawer, [data-no-curtain]")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.hash) return;
      if (url.pathname === location.pathname) return;
      e.preventDefault();
      e.stopPropagation();
      curtainCover(a.dataset.label || "", () => router.push(url.pathname + url.search));
    };
    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, [router]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    curtainReveal();
    return initPageFx(document);
  }, [pathname]);

  return null;
}
