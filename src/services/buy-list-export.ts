export type BuyListRow={rank:number;product:string;upc?:string;supplier:string;supplierSku?:string;unitCostUsd:number;landedCostUsd:number;targetEbayPriceUsd:number;expectedProfitUsd:number;marginPct:number;roiPct:number;sold30:number;sold90:number;sold365:number;activeSellers:number;topSellerSharePct:number;topSellerOutOfStock:boolean;recommendedQty:number;confidence:"HIGH"|"MEDIUM"|"LOW";nextAction:string};
const esc=(v:unknown)=>`"${String(v??"").replaceAll('"','""')}"`;
const confidenceWeight={HIGH:1,MEDIUM:.75,LOW:.4} as const;
export function buyListToCsv(rows:BuyListRow[]){const keys=Object.keys(rows[0]??{}) as (keyof BuyListRow)[];if(!keys.length)return "";return [keys.join(","),...rows.map(r=>keys.map(k=>esc(r[k])).join(","))].join("\n");}
export function rankBuyList(rows:Omit<BuyListRow,"rank">[]){return [...rows].sort((a,b)=>(b.roiPct*confidenceWeight[b.confidence])-(a.roiPct*confidenceWeight[a.confidence])).map((r,i)=>({...r,rank:i+1}));}
