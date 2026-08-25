(()=>{
const $=id=>document.getElementById(id);
function rows(r){return(r?.rows||r?.products||[]).filter(x=>Number(x.quantitySold)>0)}
function demand(r){const a=rows(r),u=a.reduce((s,x)=>s+Number(x.quantitySold||0),0);return u>=100||a.filter(x=>Number(x.quantitySold)>=10).length>=3?'STRONG':u>=20?'MODERATE':u>0?'WEAK':'NO DEMAND'}
async function render(){const {pfLastResearch:r}=await chrome.storage.local.get({pfLastResearch:null});const el=$('ebayDemandQuick');if(!el)return;const d=r?demand(r):'—';el.textContent=d;el.style.color=d==='STRONG'?'#286a2c':d==='MODERATE'?'#8a6500':d==='WEAK'||d==='NO DEMAND'?'#9b2c2c':''}
chrome.storage.onChanged.addListener((c,a)=>{if(a==='local'&&c.pfLastResearch)render()});document.readyState==='loading'?document.addEventListener('DOMContentLoaded',render):render();
})();