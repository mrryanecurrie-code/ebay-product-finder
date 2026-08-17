import type {SoldEvent} from "../domain/history.js";
export type HistoryQuery={q:string;marketplace?:string;days?:number};
export interface EbayHistoryProvider{readonly name:string;searchSold(query:HistoryQuery):Promise<SoldEvent[]>;}
export class MarketplaceInsightsProvider implements EbayHistoryProvider{
 readonly name="EBAY_MARKETPLACE_INSIGHTS";
 constructor(private token:string){}
 async searchSold(query:HistoryQuery){
  const marketplace=query.marketplace??"EBAY_US";const days=query.days??365;const end=new Date();const start=new Date(end.getTime()-days*86400000);
  const url=new URL("https://api.ebay.com/buy/marketplace_insights/v1_beta/item_sales/search");url.searchParams.set("q",query.q);url.searchParams.set("limit","200");url.searchParams.set("filter",`lastSoldDate:[${start.toISOString()}..${end.toISOString()}]`);
  const r=await fetch(url,{headers:{Authorization:`Bearer ${this.token}`,"X-EBAY-C-MARKETPLACE-ID":marketplace}});if(!r.ok)throw new Error(`Marketplace Insights unavailable: ${r.status} ${await r.text()}`);
  const j=await r.json() as any;return (j.itemSales??[]).map((x:any)=>({soldAt:x.lastSoldDate,quantity:Number(x.totalSoldQuantity??1),price:Number(x.lastSoldPrice?.value??0),currency:x.lastSoldPrice?.currency??"USD",seller:x.seller?.username??x.seller?.userId??"unknown",listingId:x.legacyItemId??x.itemId} satisfies SoldEvent));
 }
}
export class UnavailableHistoryProvider implements EbayHistoryProvider{readonly name="UNAVAILABLE";async searchSold(){throw new Error("No approved eBay historical sold-data provider is configured. Do not substitute active listings for sold history.");}}
export function historyProviderFromEnv():EbayHistoryProvider{const token=process.env.EBAY_MARKETPLACE_INSIGHTS_TOKEN;return token?new MarketplaceInsightsProvider(token):new UnavailableHistoryProvider();}
