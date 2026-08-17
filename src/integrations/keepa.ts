export type KeepaCandidate = {
  asin: string;
  title: string;
  brand?: string;
  upc?: string;
  ean?: string;
  salesRank?: number;
  monthlySold?: number;
  currentAmazonPrice?: number;
};

const domainMap: Record<string, number> = { US: 1, GB: 2, DE: 3, FR: 4, JP: 5, CA: 6, IT: 8, ES: 9, IN: 10, MX: 11 };

export async function discoverAmazonCandidates(term: string, domain = "CA"): Promise<KeepaCandidate[]> {
  const key = process.env.KEEPA_API_KEY;
  if (!key) throw new Error("KEEPA_API_KEY is required");
  const domainId = domainMap[domain.toUpperCase()] ?? 6;
  const search = new URL("https://api.keepa.com/search");
  search.searchParams.set("key", key);
  search.searchParams.set("domain", String(domainId));
  search.searchParams.set("type", "product");
  search.searchParams.set("term", term);
  const searchResponse = await fetch(search);
  if (!searchResponse.ok) throw new Error(`Keepa search failed: ${searchResponse.status} ${await searchResponse.text()}`);
  const searchJson = await searchResponse.json() as any;
  const asins: string[] = (searchJson.asinList ?? []).slice(0, 20);
  if (!asins.length) return [];

  const productUrl = new URL("https://api.keepa.com/product");
  productUrl.searchParams.set("key", key);
  productUrl.searchParams.set("domain", String(domainId));
  productUrl.searchParams.set("asin", asins.join(","));
  productUrl.searchParams.set("stats", "90");
  const productResponse = await fetch(productUrl);
  if (!productResponse.ok) throw new Error(`Keepa product lookup failed: ${productResponse.status} ${await productResponse.text()}`);
  const json = await productResponse.json() as any;
  return (json.products ?? []).map((p: any) => ({
    asin: p.asin,
    title: p.title ?? p.asin,
    brand: p.brand,
    upc: p.upc,
    ean: Array.isArray(p.eanList) ? p.eanList[0] : undefined,
    salesRank: p.stats?.current?.[3] > 0 ? p.stats.current[3] : undefined,
    monthlySold: p.monthlySold > 0 ? p.monthlySold : undefined,
    currentAmazonPrice: p.stats?.current?.[0] > 0 ? p.stats.current[0] / 100 : undefined,
  }));
}
