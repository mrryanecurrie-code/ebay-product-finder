export type ProductIdentity={brand?:string;title:string;upc?:string;ean?:string;packSize?:number;variant?:string};
const norm=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
export function inferPackSize(title:string){ const m=norm(title).match(/(?:pack of|set of|lot of|x)\s*(\d{1,2})\b|\b(\d{1,2})\s*(?:pack|pcs|pieces)\b/); return Number(m?.[1]??m?.[2]??1); }
export function matchProduct(target:ProductIdentity,candidate:ProductIdentity){
  const targetCode=target.upc??target.ean, candidateCode=candidate.upc??candidate.ean;
  const targetPack=target.packSize??1, candidatePack=candidate.packSize??inferPackSize(candidate.title);
  if(targetCode&&candidateCode&&targetCode!==candidateCode)return {match:false,confidence:0,reason:"identifier mismatch"};
  if(targetPack!==candidatePack)return {match:false,confidence:0,reason:"pack-size mismatch"};
  const t=new Set(norm(`${target.brand??""} ${target.title} ${target.variant??""}`).split(" ").filter(x=>x.length>2));
  const c=new Set(norm(`${candidate.brand??""} ${candidate.title} ${candidate.variant??""}`).split(" ").filter(x=>x.length>2));
  const overlap=[...t].filter(x=>c.has(x)).length/Math.max(t.size,1);
  const identifierExact=Boolean(targetCode&&candidateCode&&targetCode===candidateCode);
  const confidence=identifierExact?1:overlap;
  return {match:identifierExact||overlap>=0.7,confidence,reason:identifierExact?"exact identifier":`title overlap ${Math.round(overlap*100)}%`};
}
