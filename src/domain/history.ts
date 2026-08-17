export type SoldEvent = { soldAt: string; quantity: number; price: number; currency: string; seller: string; listingId?: string };
export type HistoryAnalysis = {
  windows: { days: 30|90|180|365; unitsSold: number; revenue: number; uniqueListings: number }[];
  activeMonths: number; longestDrySpellMonths: number; monthlyUnits: Record<string, number>;
  continuity: "CONTINUOUS"|"INTERMITTENT"|"ONE_OFF"|"NO_SALES";
};
export function analyzeSoldHistory(events: SoldEvent[], asOf = new Date()): HistoryAnalysis {
  const valid = events.filter(e => Number.isFinite(e.quantity) && e.quantity > 0 && !Number.isNaN(Date.parse(e.soldAt)));
  const windows = ([30,90,180,365] as const).map(days => {
    const start = asOf.getTime() - days*86400000;
    const rows = valid.filter(e => Date.parse(e.soldAt) >= start && Date.parse(e.soldAt) <= asOf.getTime());
    return { days, unitsSold: rows.reduce((s,e)=>s+e.quantity,0), revenue: rows.reduce((s,e)=>s+e.quantity*e.price,0), uniqueListings: new Set(rows.map(e=>e.listingId).filter(Boolean)).size };
  });
  const monthlyUnits: Record<string,number> = {};
  for (const e of valid) { const d=new Date(e.soldAt); const k=`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}`; monthlyUnits[k]=(monthlyUnits[k]??0)+e.quantity; }
  const months: string[]=[]; for(let i=11;i>=0;i--){ const d=new Date(Date.UTC(asOf.getUTCFullYear(),asOf.getUTCMonth()-i,1)); months.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}`); }
  const sequence=months.map(m=>monthlyUnits[m]??0); const activeMonths=sequence.filter(x=>x>0).length;
  let longest=0,current=0; for(const x of sequence){ if(x===0){current++;longest=Math.max(longest,current)}else current=0; }
  const total=sequence.reduce((a,b)=>a+b,0);
  const continuity = total===0?"NO_SALES":activeMonths===1?"ONE_OFF":activeMonths>=8&&longest<=2?"CONTINUOUS":"INTERMITTENT";
  return { windows, activeMonths, longestDrySpellMonths: longest, monthlyUnits, continuity };
}
