import { searchActiveListings, summarizeCompetition } from "../integrations/ebay.js";
export type SupplierProduct={id:string;brand?:string;title:string;upc?:string;ean?:string;unitCost:number;currency:string;packSize?:number;supplier:string;supplierSku?:string};
export type SupplierResearchResult=SupplierProduct&{ebayQuery:string;activeListings:number;activeSellers:number;medianDeliveredPrice:number;grossSpread:number;spreadPct:number;status:"CANDIDATE"|"REJECT";reasons:string[]};
export async function researchSupplierCatalogue(products:SupplierProduct[],marketplace=process.env.EBAY_MARKETPLACE??"EBAY_US"){
 const out:SupplierResearchResult[]=[];
 for(const p of products){
  const ebayQuery=p.upc??p.ean??`${p.brand??""} ${p.title}`.trim();
  try{
   const listings=await searchActiveListings(ebayQuery,marketplace,100); const c=summarizeCompetition(listings);
   const grossSpread=c.medianDeliveredPrice-p.unitCost; const spreadPct=p.unitCost>0?grossSpread/p.unitCost*100:0; const reasons:string[]=[];
   if(c.activeListings===0) reasons.push("No active exact-market eBay supply found");
   if(c.activeSellers<=5&&c.activeListings>0) reasons.push("Low active seller count");
   if(spreadPct>=50) reasons.push("Large pre-fee price spread worth deeper economics");
   const status=c.activeListings>0&&spreadPct>=25?"CANDIDATE":"REJECT";
   out.push({...p,ebayQuery,...c,grossSpread,spreadPct,status,reasons});
  }catch(e){out.push({...p,ebayQuery,activeListings:0,activeSellers:0,medianDeliveredPrice:0,grossSpread:0,spreadPct:0,status:"REJECT",reasons:[`Research error: ${e instanceof Error?e.message:String(e)}`]});}
 }
 return out.sort((a,b)=>b.spreadPct-a.spreadPct);
}
