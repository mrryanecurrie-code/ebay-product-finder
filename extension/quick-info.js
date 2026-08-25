(()=>{
const $=id=>document.getElementById(id);
const num=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
const money=(amount,currency)=>{const n=num(amount);if(n===null)return'—';return `${currency==='CAD'?'C$':currency==='USD'?'US$':'$'}${n.toFixed(2)}`};
function amazonCurrency(p){return /amazon\.ca/i.test(p?.url||'')?'CAD':/amazon\.com/i.test(p?.url||'')?'USD':''}
function cleanBsr(raw){raw=String(raw||'').replace(/^.*?Best Sellers Rank\s*/i,'').replace(/^\s*[:#-]*\s*/,'');const m=raw.match(/#?([\d,]+)\s+in\s+([^\(\n]+)/i);if(!m)return raw||'—';return `#${m[1]}\n${m[2].trim()}`}
function cleanBought(raw){const m=String(raw||'').match(/([\d,.]+[KMB]?\+?)\s*bought in past month/i);return m?`${m[1]}\nbought past month`:(raw||'—')}
async function renderQuick(){
 const s=await chrome.storage.local.get({pfLastSource:null,pfLastResearch:null,pfEconomics:null});
 const p=s.pfLastSource,r=s.pfLastResearch,e=s.pfEconomics;
 if(p){const ap=String(p.price||'').replace(/,/g,'').match(/([0-9]+(?:\.[0-9]+)?)/)?.[1];$('amazonPrice').textContent=money(ap,amazonCurrency(p));$('amazonBsr').textContent=cleanBsr(p.bsr);$('amazonBsr').style.whiteSpace='pre-line';$('amazonBought').textContent=cleanBought(p.bought);$('amazonBought').style.whiteSpace='pre-line'}
 const c=r?.summary?.averageSoldPrice?.currency||'';
 if($('ebayCurrency'))$('ebayCurrency').textContent=`eBay: ${c||'—'}`;
 if($('avgSold'))$('avgSold').textContent=money(r?.summary?.averageSoldPrice?.amount,c);
 if($('d30'))$('d30').textContent=r?.recentDemand?.days30?.units??'—';
 if($('d90'))$('d90').textContent=r?.recentDemand?.days90?.units??'—';
 if($('d365'))$('d365').textContent=r?.recentDemand?.days365?.units??'—';
 if($('maxCost'))$('maxCost').textContent=e?money(e.maxCost,c):'—';
 if($('profit'))$('profit').textContent=e?money(e.profit,c):'—';
 if($('roi'))$('roi').textContent=e&&Number.isFinite(Number(e.roi))?`${Number(e.roi).toFixed(1)}%`:'—';
}
chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&(changes.pfLastSource||changes.pfLastResearch||changes.pfEconomics))setTimeout(renderQuick,50)});
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(renderQuick,100)):setTimeout(renderQuick,100);
})();