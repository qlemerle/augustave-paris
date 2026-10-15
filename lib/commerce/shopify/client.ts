import "server-only";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const version = process.env.SHOPIFY_API_VERSION || "2026-07";

export async function shopifyFetch<T>(query: string, variables: Record<string, unknown> = {}, revalidate = 60): Promise<T> {
  if (!domain || !token) {
    throw new Error("Shopify : SHOPIFY_STORE_DOMAIN et SHOPIFY_STOREFRONT_ACCESS_TOKEN doivent être définis (voir .env.example).");
  }
  const res = await fetch(`https://${domain}/api/${version}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate },
  });
  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error(`Shopify : ${JSON.stringify(json.errors ?? res.statusText)}`);
  }
  return json.data as T;
}
