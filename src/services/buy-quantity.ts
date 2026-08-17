export function recommendBuyQuantity(input:{sold30:number;sold90:number;activeSellers:number;topSellerSharePct:number;continuity:"CONTINUOUS"|"INTERMITTENT"|"ONE_OFF"|"NO_SALES";unitLandedCost:number;maxCapitalPerSku?:number}){
 const monthly=input.sold30>0?input.sold30:input.sold90/3; if(monthly<=0||input.continuity==="ONE_OFF"||input.continuity==="NO_SALES")return {qty:0,reason:"Demand is not sufficiently persistent"};
 let capture=.15;if(input.activeSellers<=3)capture=.25;if(input.topSellerSharePct>=60)capture=.1;if(input.continuity==="INTERMITTENT")capture*=.5;
 const demandQty=Math.max(1,Math.floor(monthly*capture));const capital=input.maxCapitalPerSku??250;const capitalQty=input.unitLandedCost>0?Math.floor(capital/input.unitLandedCost):0;const qty=Math.max(0,Math.min(10,demandQty,capitalQty));
 return {qty,reason:`Conservative ${(capture*100).toFixed(0)}% capture of recent velocity, capped by inventory risk and $${capital} SKU capital`};
}
