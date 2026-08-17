export type EvidenceLevel="VERIFIED"|"ESTIMATED"|"ASSUMED"|"UNKNOWN";
export type Evidence={name:string;level:EvidenceLevel;source:string;observedAt?:string};
const weight:Record<EvidenceLevel,number>={VERIFIED:1,ESTIMATED:.65,ASSUMED:.3,UNKNOWN:0};
export function confidenceScore(evidence:Evidence[]){if(!evidence.length)return {score:0,label:"LOW" as const};const score=Math.round(evidence.reduce((s,e)=>s+weight[e.level],0)/evidence.length*100);return {score,label:(score>=80?"HIGH":score>=55?"MEDIUM":"LOW") as "HIGH"|"MEDIUM"|"LOW"};}
export function requiredBuyEvidence(evidence:Evidence[]){const by=new Map(evidence.map(e=>[e.name,e.level]));const required=["supplier_cost","product_identity","ebay_price","ebay_demand","shipping_cost"];const missing=required.filter(k=>!by.has(k)||by.get(k)==="UNKNOWN");const assumed=required.filter(k=>by.get(k)==="ASSUMED");return {eligible:missing.length===0&&assumed.length===0,missing,assumed};}
