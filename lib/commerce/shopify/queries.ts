const PRODUCT_FIELDS = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    productType
    tags
    materials: metafield(namespace: "custom", key: "materiaux") { value }
    excerpt: metafield(namespace: "custom", key: "accroche") { value }
    options(first: 1) { name }
    collections(first: 10) { nodes { handle } }
    images(first: 8) { nodes { url altText width height } }
    priceRange { minVariantPrice { amount currencyCode } }
    variants(first: 30) {
      nodes {
        id
        title
        availableForSale
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
      }
    }
  }
`;

export const PRODUCTS_QUERY = /* GraphQL */ `
  ${PRODUCT_FIELDS}
  query Products($first: Int!, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse) {
      nodes { ...ProductFields }
    }
  }
`;

export const COLLECTION_PRODUCTS_QUERY = /* GraphQL */ `
  ${PRODUCT_FIELDS}
  query CollectionProducts($handle: String!, $first: Int!, $sortKey: ProductCollectionSortKeys, $reverse: Boolean) {
    collection(handle: $handle) {
      products(first: $first, sortKey: $sortKey, reverse: $reverse) { nodes { ...ProductFields } }
    }
  }
`;

export const PRODUCT_QUERY = /* GraphQL */ `
  ${PRODUCT_FIELDS}
  query Product($handle: String!) {
    product(handle: $handle) { ...ProductFields }
  }
`;

export const COLLECTIONS_QUERY = /* GraphQL */ `
  query Collections {
    collections(first: 50) {
      nodes {
        handle
        title
        description
        image { url altText width height }
        kicker: metafield(namespace: "custom", key: "surtitre") { value }
        accent: metafield(namespace: "custom", key: "couleur") { value }
      }
    }
  }
`;

export const CART_CREATE_MUTATION = /* GraphQL */ `
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart { checkoutUrl }
      userErrors { field message }
    }
  }
`;
