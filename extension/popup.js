const result=document.getElementById('result');
async function active(){const [tab]=await chrome.tabs.query({active:true,currentWindow:true});return tab}
async function ask(type){const tab=await active();if(!tab?.id)throw new Error('No active tab');return chrome.tabs.sendMessage(tab.id,{type})}
async function cfg(){return chrome.storage.local.get({apiBase:'http://localhost:3000',authToken:''})}
async function post(path,body){const c=await cfg();const r=await fetch(c.apiBase+path,{method:'POST',headers:{'content-type':'application/json',...(c.authToken?{authorization:`Bearer ${c.authToken}`}:{})},body:JSON.stringify(body)});if(!r.ok)throw new Error(`${r.status}: ${await r.text()}`);return r.json()}
document.getElementById('investigate').onclick=async()=>{try{result.textContent='Capturing product…';const x=await ask('PF_EXTRACT_PRODUCT');result.textContent='Sending to Product Finder…';const y=await post('/api/companion/investigate',x.product);result.textContent=y.message||'Investigation queued.'}catch(e){result.textContent='Error: '+e.message}};
document.getElementById('scan').onclick=async()=>{try{result.textContent='Scanning visible products…';const x=await ask('PF_SCAN_PAGE');const y=await post('/api/companion/scan',{sourceUrl:(await active()).url,products:x.products});result.textContent=y.message||`${x.products.length} products queued.`}catch(e){result.textContent='Error: '+e.message}};
document.getElementById('settings').onclick=()=>chrome.runtime.openOptionsPage();
