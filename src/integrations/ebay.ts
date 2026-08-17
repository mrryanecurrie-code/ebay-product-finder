export type EbayListing = {
  itemId: string;
  title: string;
  price: number;
  currency: string;
  seller: string;
  sellerFeedbackPct?: number;
  sellerFeedbackScore?: number;
  itemUrl?: string;
  condition?: string;
  shipping?: number;
};

type TokenCache = { token: string; expiresAt: number };
let tokenCache: TokenCache | undefined;

function credentials() {
  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("EBAY_CLIENT_ID and EBAY_CLIENT_SECRET are required");
  return { clientId, clientSecret };
}

async function applicationToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.token;
  const { clientId, clientSecret } = credentials();
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: "https://api.ebay.com/oauth/api_scope",
  });
  const response = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) throw new Error(`eBay OAuth failed: ${response.status} ${await response.text()}`);
  const json = await response.json() as { access_token: string; expires_in: number };
  tokenCache = { token: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

export async function searchActiveListings(query: string, marketplace = "EBAY_US", limit = 50): Promise<EbayListing[]> {
  const token = await applicationToken();
  const url = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", String(Math.min(limit, 200)));
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, "X-EBAY-C-MARKETPLACE-ID": marketplace },
  });
  if (!response.ok) throw new Error(`eBay Browse search failed: ${response.status} ${await response.text()}`);
  const json = await response.json() as any;
  return (json.itemSummaries ?? []).map((item: any) => ({
    itemId: item.itemId,
    title: item.title,
    price: Number(item.price?.value ?? 0),
    currency: item.price?.currency ?? "USD",
    seller: item.seller?.username ?? "unknown",
    sellerFeedbackPct: item.seller?.feedbackPercentage == null ? undefined : Number(item.seller.feedbackPercentage),
    sellerFeedbackScore: item.seller?.feedbackScore == null ? undefined : Number(item.seller.feedbackScore),
    itemUrl: item.itemWebUrl,
    condition: item.condition,
    shipping: Number(item.shippingOptions?.[0]?.shippingCost?.value ?? 0),
  }));
}

export function summarizeCompetition(listings: EbayListing[]) {
  const prices = listings.map(x => x.price + (x.shipping ?? 0)).filter(x => x > 0).sort((a,b) => a-b);
  const sellers = new Set(listings.map(x => x.seller));
  const median = prices.length ? prices[Math.floor(prices.length / 2)] : 0;
  return { activeListings: listings.length, activeSellers: sellers.size, medianDeliveredPrice: median };
}
