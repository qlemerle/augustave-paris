"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (
    <label className="sort">
      <span>Trier</span>
      <select
        value={params.get("tri") ?? "featured"}
        onChange={(e) => {
          const p = new URLSearchParams(params);
          if (e.target.value === "featured") p.delete("tri");
          else p.set("tri", e.target.value);
          router.push(`${pathname}${p.size ? `?${p}` : ""}`, { scroll: false });
        }}
      >
        <option value="featured">Sélection</option>
        <option value="new">Nouveautés</option>
        <option value="price-asc">Prix croissant</option>
        <option value="price-desc">Prix décroissant</option>
      </select>
    </label>
  );
}
