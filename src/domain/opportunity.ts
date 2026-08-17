export type DemandWindow = {
  days: 30 | 90 | 180 | 365;
  unitsSold: number;
  revenue: number;
  uniqueListings: number;
};

export type SellerShare = {
  seller: string;
  unitsSold: number;
  active: boolean;
  outOfStock: boolean;
};

export type OpportunityInput = {
  productId: string;
  title: string;
  upc?: string;
  supplierUnitCost: number;
  currency: string;
  targetSalePrice: number;
  estimatedShipping: number;
  estimatedMarketplaceFees: number;
  windows: DemandWindow[];
  sellers: SellerShare[];
};

export type Opportunity = OpportunityInput & {
  grossProfit: number;
  marginPct: number;
  roiPct: number;
  trend: "GROWING" | "STABLE" | "DECLINING" | "INSUFFICIENT_DATA";
  topSellerSharePct: number;
  topSellerOutOfStock: boolean;
  recommendedInitialQty: number;
  score: number;
  reasons: string[];
};

const units = (input: OpportunityInput, days: DemandWindow["days"]) =>
  input.windows.find((w) => w.days === days)?.unitsSold ?? 0;

export function analyzeOpportunity(input: OpportunityInput): Opportunity {
  const sold30 = units(input, 30);
  const sold90 = units(input, 90);
  const sold365 = units(input, 365);
  const monthly90 = sold90 / 3;
  const monthly365 = sold365 / 12;

  let trend: Opportunity["trend"] = "INSUFFICIENT_DATA";
  if (sold90 > 0 && sold365 > 0) {
    const ratio = monthly90 / Math.max(monthly365, 0.01);
    trend = ratio >= 1.2 ? "GROWING" : ratio <= 0.7 ? "DECLINING" : "STABLE";
  }

  const totalSellerUnits = input.sellers.reduce((sum, s) => sum + s.unitsSold, 0);
  const topSeller = [...input.sellers].sort((a, b) => b.unitsSold - a.unitsSold)[0];
  const topSellerSharePct = totalSellerUnits > 0 && topSeller
    ? (topSeller.unitsSold / totalSellerUnits) * 100
    : 0;
  const topSellerOutOfStock = Boolean(topSeller?.outOfStock);

  const grossProfit = input.targetSalePrice - input.supplierUnitCost - input.estimatedShipping - input.estimatedMarketplaceFees;
  const marginPct = input.targetSalePrice > 0 ? (grossProfit / input.targetSalePrice) * 100 : 0;
  const roiPct = input.supplierUnitCost > 0 ? (grossProfit / input.supplierUnitCost) * 100 : 0;

  const reasons: string[] = [];
  let score = 0;

  if (grossProfit > 0) { score += 20; reasons.push("Positive estimated unit profit"); }
  if (roiPct >= 30) { score += 20; reasons.push("Estimated ROI is at least 30%"); }
  if (sold30 >= 5) { score += 15; reasons.push("Recent 30-day demand is active"); }
  if (trend === "GROWING") { score += 15; reasons.push("Recent demand is stronger than the annual baseline"); }
  if (trend === "STABLE") { score += 10; reasons.push("Demand appears persistent rather than one-time"); }
  if (topSellerOutOfStock) { score += 20; reasons.push("Leading seller is out of stock: potential supply gap"); }
  if (topSellerSharePct >= 50) { reasons.push(`Seller concentration is high (${topSellerSharePct.toFixed(0)}% top-seller share)`); }
  if (topSellerSharePct >= 50 && !topSellerOutOfStock) { score -= 10; reasons.push("Dominant seller is still active, increasing entry risk"); }
  if (trend === "DECLINING") { score -= 20; reasons.push("Recent demand is below the annual baseline"); }

  // Conservative first buy: never assume annual units / 12. Use recent observed velocity,
  // capped to limit inventory exposure while the listing proves itself.
  const recentMonthlyDemand = sold30 > 0 ? sold30 : monthly90;
  const recommendedInitialQty = Math.max(1, Math.min(10, Math.floor(recentMonthlyDemand * 0.25) || 1));

  return {
    ...input,
    grossProfit,
    marginPct,
    roiPct,
    trend,
    topSellerSharePct,
    topSellerOutOfStock,
    recommendedInitialQty,
    score: Math.max(0, Math.min(100, score)),
    reasons,
  };
}
