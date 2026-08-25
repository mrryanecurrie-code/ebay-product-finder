(()=>{
const $=id=>document.getElementById(id);
const money=(amount,currency)=>{const n=Number(amount);if(!Number.isFinite(n))return'—';return `${currency==='CAD'?'C$':currency==='USD'?'US$':'$'}${n.toFixed(2)}`};
const cleanTitle=s=>String(s||'').replace(/^,?\s*preview full size image\s*/i,'').trim();
function researchRows(r){return(r?.rows||r?.products||[]).filter(x=>Number(x.quantitySold)>0).sort((a,b)=>Number(b.quantitySold)-Number(a.quantitySold))}
function units(r){return researchRows(r).reduce((s,x)=>s+Number(x.quantitySold||0),0)}
function demand(r){const u=units(r),rows=researchRows(r);return u>=100||rows.filter(x=>Number(x.quantitySold)>=10).length>=3?'STRONG':u>=20?'MODERATE':u>0?'WEAK':'NO PROVEN DEMAND'}
function renderSource(p){
 if(!p){$('sourceEmpty')?.classList.remove('hidden');$('sourceProduct')?.classList.add('hidden');if($('ebayQuery'))$('ebayQuery').value='';return;}
 $('sourceEmpty')?.classList.add('hidden');$('sourceProduct')?.classList.remove('hidden');
 if($('sourceImage'))$('sourceImage').src=p.image||'';if($('sourceTitle'))$('sourceTitle').textContent=p.title||'';if($('sourceBrand'))$('sourceBrand').textContent=p.brand||'';
 if($('sourceRating'))$('sourceRating').textContent=p.rating?`★ ${p.rating}${p.reviews?` • ${Number(p.reviews).toLocaleString()} reviews`:''}`:'';
 if($('sourceAsin'))$('sourceAsin').textContent=p.asin?`ASIN: ${p.asin}`:'';if($('sourceVariation'))$('sourceVariation').textContent=p.variation||'';if($('ebayQuery'))$('ebayQuery').value=p.title||'';
}
function renderResearch(r){
 if(!r){if($('demand'))$('demand').textContent='No demand captured.';if($('competition'))$('competition').textContent='—';if($('winners'))$('winners').textContent='No captured listings yet.';return;}
 const rows=researchRows(r),u=units(r),d=demand(r),c=r?.summary?.averageSoldPrice?.currency||'',avg=r?.summary?.averageSoldPrice?.amount;
 if($('demand'))$('demand').innerHTML=`<div class="row"><span>Demand</span><strong>${d}</strong></div><div class="row"><span>Observed units</span><strong>${u}</strong></div><div class="row"><span>Average sold</span><strong>${money(avg,c)}</strong></div><div class="row"><span>Sample</span><strong>${rows.length} sold listings</strong></div>`;
 if($('competition'))$('competition').innerHTML=rows.length?`<div class="row"><span>Top sellers</span><strong>${rows.slice(0,3).map(x=>x.quantitySold).join(' / ')}</strong></div><div class="row"><span>Top-3 share</span><strong>${u?((rows.slice(0,3).reduce((s,x)=>s+Number(x.quantitySold||0),0)/u)*100).toFixed(1):'0.0'}%</strong></div>`:'—';
 if($('winners'))$('winners').innerHTML=rows.slice(0,3).map((x,i)=>`<div class="listing"><strong>#${i+1} • ${x.quantitySold} sold</strong><div>${cleanTitle(x.title)||x.listingId||''}</div></div>`).join('')||'No captured listings yet.';
 if($('verdict'))$('verdict').textContent=d==='STRONG'?'DEMAND ✓':'REVIEW';if($('verdictReason'))$('verdictReason').textContent='eBay research synchronized';
}
async function sync(){const s=await chrome.storage.local.get({pfLastSource:null,pfLastResearch:null});renderSource(s.pfLastSource);renderResearch(s.pfLastResearch)}
chrome.storage.onChanged.addListener((changes,area)=>{if(area!=='local')return;if(changes.pfLastSource||changes.pfLastResearch||changes.pfEconomics){sync();}});
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',sync):sync();
})();