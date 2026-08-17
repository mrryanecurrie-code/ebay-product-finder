export const sourcingModes={
 WHOLESALE_TO_EBAY:{label:"Wholesale List → eBay.com",description:"Scan supplier products and return profitable eBay.com buy candidates."},
 AMAZON_TO_EBAY:{label:"Amazon/Keepa → eBay.com",description:"Use proven Amazon demand as a radar, then validate the same exact product on eBay.com."},
 EBAY_SUPPLY_GAP:{label:"eBay.com Supply Gaps",description:"Find persistent eBay demand with concentrated sellers, stock-outs or weak current supply."},
 RETAIL_ARBITRAGE:{label:"Retail → eBay.com",description:"Evaluate retail acquisition prices against exact-product eBay.com resale economics."},
 CROSS_MARKET:{label:"Marketplace Arbitrage → eBay.com",description:"Compare acquisition marketplaces against eBay.com while preserving currency, shipping and fees."}
} as const;
export type SourcingMode=keyof typeof sourcingModes;
