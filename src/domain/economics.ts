export type EconomicsInput={unitCost:number;inboundShipping:number;duty:number;brokerage:number;prep:number;otherLanded:number;salePrice:number;buyerShippingCharged?:number;outboundShipping:number;ebayFeeRate:number;ebayFixedFee?:number;promotedListingRate?:number;returnsReserveRate?:number};
export function calculateEconomics(i:EconomicsInput){
 const landed=i.unitCost+i.inboundShipping+i.duty+i.brokerage+i.prep+i.otherLanded;
 const orderRevenue=i.salePrice+(i.buyerShippingCharged??0);
 const marketplaceFees=orderRevenue*(i.ebayFeeRate+(i.promotedListingRate??0))+(i.ebayFixedFee??0);
 const returnsReserve=orderRevenue*(i.returnsReserveRate??0);
 const profit=orderRevenue-landed-i.outboundShipping-marketplaceFees-returnsReserve;
 return {landedCost:landed,orderRevenue,marketplaceFees,returnsReserve,profit,marginPct:orderRevenue?profit/orderRevenue*100:0,roiPct:landed?profit/landed*100:0,breakEvenSalePrice:(landed+i.outboundShipping+(i.ebayFixedFee??0))/(1-(i.ebayFeeRate+(i.promotedListingRate??0)+(i.returnsReserveRate??0)))};
}
