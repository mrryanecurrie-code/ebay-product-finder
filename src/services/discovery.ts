import { discoverAmazonCandidates } from "../integrations/keepa.js";
import { searchActiveListings, summarizeCompetition } from "../integrations/ebay.js";

export type DiscoveryCandidate = {
  asin: string;
  title: string;
  identifier?: string;
  amazon: { salesRank?: number; monthlySold?: number; price?: number };
  ebay: { activeListings: number; activeSellers: number; medianDeliveredPrice: number };
  signal: "INVESTIGATE" | "WEAK";
  reasons: string[];
};

export async function discoverAmazonToEbay(term: string): Promise<DiscoveryCandidate[]> {
  const amazon = await discoverAmazonCandidates(term, process.env.KEEPA_DOMAIN ?? "CA");
  const results: DiscoveryCandidate[] = [];
  for (const product of amazon) {
    const identifier = product.upc ?? product.ean;
    const ebayQuery = identifier || `${product.brand ?? ""} ${product.title}`.trim();
    const listings = await searchActiveListings(ebayQuery, process.env.EBAY_MARKETPLACE ?? "EBAY_US", 100);
    const competition = summarizeCompetition(listings);
    const reasons: string[] = [];
    if (product.monthlySold && product.monthlySold >= 50) reasons.push("Strong Amazon demand signal");
    if (competition.activeSellers <= 5) reasons.push("Relatively few active eBay sellers");
    if (product.currentAmazonPrice && competition.medianDeliveredPrice > product.currentAmazonPrice * 1.15) reasons.push("eBay median price is materially above Amazon price signal");
    results.push({
      asin: product.asin,
      title: product.title,
      identifier,
      amazon: { salesRank: product.salesRank, monthlySold: product.monthlySold, price: product.currentAmazonPrice },
      ebay: competition,
      signal: reasons.length >= 2 ? "INVESTIGATE" : "WEAK",
      reasons,
    });
  }
  return results.sort((a,b) => (b.signal === "INVESTIGATE" ? 1 : 0) - (a.signal === "INVESTIGATE" ? 1 : 0));
}
