const PF_GOOGLE_DEFAULTS={googleSheets:[],googleConnected:false};
const g$=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

async function googleToken(interactive=true){
  return new Promise((resolve,reject)=>chrome.identity.getAuthToken({interactive},token=>{
    const err=chrome.runtime.lastError;
    if(err||!token) reject(new Error(err?.message||'Google authorization failed'));
    else resolve(token);
  }));
}
async function googleFetch(url,options={}){
  let token=await googleToken(true);
  const run=()=>fetch(url,{...options,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json',...(options.headers||{})}});
  let r=await run();
  if(r.status===401){await new Promise(res=>chrome.identity.removeCachedAuthToken({token},res));token=await googleToken(true);r=await run()}
  if(!r.ok) throw new Error(`Google API ${r.status}: ${(await r.text()).slice(0,180)}`);
  return r.status===204?null:r.json();
}
async function googleProfile(){return googleFetch('https://www.googleapis.com/oauth2/v2/userinfo')}
async function listSpreadsheets(){
  const q=encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const d=await googleFetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc&pageSize=100`);
  return d.files||[];
}
async function spreadsheetTabs(id){const d=await googleFetch(`https://sheets.googleapis.com/v4/spreadsheets/${id}?fields=sheets.properties`);return(d.sheets||[]).map(s=>s.properties.title)}
async function createSpreadsheet(name){return googleFetch('https://sheets.googleapis.com/v4/spreadsheets',{method:'POST',body:JSON.stringify({properties:{title:name}})})}
function currentExportRecord(){
  const rs=(typeof lastResearch!=='undefined'&&lastResearch)||null,src=(typeof lastSource!=='undefined'&&lastSource)||null,e=(typeof lastEconomics!=='undefined'&&lastEconomics)||null;
  if(!rs&&!src)throw new Error('Capture/research a product before exporting.');
  const sold=(rs?.rows||rs?.products||[]).filter(x=>Number(x.quantitySold)>0),observed=sold.reduce((n,x)=>n+Number(x.quantitySold||0),0),avg=Number(rs?.summary?.averageSoldPrice?.amount)||'';
  const top3=sold.sort((a,b)=>Number(b.quantitySold)-Number(a.quantitySold)).slice(0,3),top3units=top3.reduce((n,x)=>n+Number(x.quantitySold||0),0);
  return [new Date().toISOString(),src?.title||rs?.query||'',src?.asin||'',src?.upc||'',src?.price||'',src?.url||'',rs?.query||'',observed,avg,top3.map(x=>x.quantitySold).join(' / '),observed?((top3units/observed)*100).toFixed(1)+'%':'',e?.cost??'',e?.ship??'',e?Number(e.cost||0)+Number(e.ship||0):'',e?.fees??'',e?.ads??'',e?.profit??'',e?.roi??'',e?.margin??'',e?.maxCost??'',e?.verdict||'',e?.reason||''];
}
const HEADERS=['Researched At','Product','ASIN','UPC','Amazon Price','Amazon URL','eBay Query','Observed Units','Avg Sold Price','Top Sellers Units','Top 3 Share','Source Cost','Inbound Shipping','Landed Cost','eBay Fees','Promotion','Profit','ROI %','Margin %','Max Buy Cost','Decision','Reason'];
async function ensureHeaders(dest){
  const range=encodeURIComponent(`'${dest.tab.replace(/'/g,"''")}'!A1:V1`),url=`https://sheets.googleapis.com/v4/spreadsheets/${dest.spreadsheetId}/values/${range}`;
  const d=await googleFetch(url);if(!(d.values?.[0]?.length))await googleFetch(`${url}?valueInputOption=RAW`,{method:'PUT',body:JSON.stringify({values:[HEADERS]})});
}
async function exportTo(dest){
  await ensureHeaders(dest);const row=currentExportRecord(),range=encodeURIComponent(`'${dest.tab.replace(/'/g,"''")}'!A:V`);
  await googleFetch(`https://sheets.googleapis.com/v4/spreadsheets/${dest.spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,{method:'POST',body:JSON.stringify({values:[row]})});
  setGoogleStatus(`Saved to ${dest.label} ✓`,'ok');
}
function setGoogleStatus(text,kind=''){const e=g$('googleStatus');if(e){e.textContent=text;e.dataset.kind=kind}}
async function loadGoogleState(){return chrome.storage.local.get(PF_GOOGLE_DEFAULTS)}
async function saveDestinations(items){await chrome.storage.local.set({googleSheets:items});renderGoogleDestinations(items)}
function renderGoogleDestinations(items=[]){
  const box=g$('googleDestinations');if(!box)return;
  box.innerHTML=items.length?items.map((d,i)=>`<button class="sheetDest" data-sheet="${i}">${esc(d.label)}</button>`).join(''):'<div class="muted">No export sheets saved yet.</div>';
  box.querySelectorAll('[data-sheet]').forEach(b=>b.onclick=async()=>{try{const x=await loadGoogleState();await exportTo(x.googleSheets[Number(b.dataset.sheet)])}catch(e){setGoogleStatus(e.message,'error')}});
}
async function connectGoogle(){try{setGoogleStatus('Connecting to Google…');await googleToken(true);let p={};try{p=await googleProfile()}catch{}await chrome.storage.local.set({googleConnected:true,googleEmail:p.email||''});g$('googleAccount').textContent=p.email?`Connected: ${p.email}`:'Google connected';setGoogleStatus('Google Sheets ready ✓','ok');g$('googleConnect').textContent='RECONNECT';}catch(e){setGoogleStatus(e.message,'error')}}
async function addDestination(){
  try{setGoogleStatus('Loading your spreadsheets…');const files=await listSpreadsheets();if(!files.length)throw new Error('No Google Sheets found. Create one first.');
    const names=files.map((f,i)=>`${i+1}. ${f.name}`).join('\n'),pick=prompt(`Choose spreadsheet number:\n\n${names}`,'1');if(!pick)return;const file=files[Number(pick)-1];if(!file)throw new Error('Invalid spreadsheet selection.');
    const tabs=await spreadsheetTabs(file.id),tab=prompt(`Choose tab:\n${tabs.join('\n')}`,tabs[0]||'Sheet1');if(!tab||!tabs.includes(tab))return;const label=prompt('Button label for Product Finder:',file.name);if(!label)return;
    const x=await loadGoogleState(),items=[...(x.googleSheets||[]),{label:label.trim(),spreadsheetId:file.id,spreadsheetName:file.name,tab}];await saveDestinations(items);setGoogleStatus(`${label.trim()} added ✓`,'ok');
  }catch(e){setGoogleStatus(e.message,'error')}
}
async function makeDestination(){try{const name=prompt('New Google Sheet name:','Product Finder Buy Sheet');if(!name)return;setGoogleStatus('Creating sheet…');const s=await createSpreadsheet(name.trim()),tab=s.sheets?.[0]?.properties?.title||'Sheet1',label=prompt('Button label:',name.trim())||name.trim(),x=await loadGoogleState(),items=[...(x.googleSheets||[]),{label,spreadsheetId:s.spreadsheetId,spreadsheetName:name.trim(),tab}];await saveDestinations(items);setGoogleStatus(`${label} created ✓`,'ok')}catch(e){setGoogleStatus(e.message,'error')}}
async function manageDestinations(){const x=await loadGoogleState(),items=x.googleSheets||[];if(!items.length)return setGoogleStatus('No saved sheets to manage.');const names=items.map((d,i)=>`${i+1}. ${d.label} → ${d.spreadsheetName} / ${d.tab}`).join('\n'),pick=prompt(`Remove which destination?\n\n${names}\n\nEnter number or Cancel:`);if(!pick)return;const i=Number(pick)-1;if(i<0||i>=items.length)return;items.splice(i,1);await saveDestinations(items);setGoogleStatus('Destination removed.','ok')}
async function initGoogleSheets(){const x=await loadGoogleState();renderGoogleDestinations(x.googleSheets||[]);if(x.googleConnected){g$('googleAccount').textContent=x.googleEmail?`Connected: ${x.googleEmail}`:'Google connected';g$('googleConnect').textContent='RECONNECT';setGoogleStatus('Choose a destination after research.')}g$('googleConnect').onclick=connectGoogle;g$('googleAdd').onclick=addDestination;g$('googleCreate').onclick=makeDestination;g$('googleManage').onclick=manageDestinations}
document.addEventListener('DOMContentLoaded',initGoogleSheets);