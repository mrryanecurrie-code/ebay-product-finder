async function configureSidePanel(){
  await chrome.sidePanel.setPanelBehavior({openPanelOnActionClick:true});
  await chrome.sidePanel.setOptions({enabled:false}).catch(()=>{});
}

chrome.runtime.onInstalled.addListener(async()=>{
  const c=await chrome.storage.local.get(['apiBase']);
  if(!c.apiBase)await chrome.storage.local.set({apiBase:'http://localhost:3000'});
  await configureSidePanel();
});

chrome.runtime.onStartup.addListener(()=>configureSidePanel().catch(()=>{}));

function isEbay(url=''){
  try{
    const h=new URL(url).hostname.toLowerCase();
    return h==='ebay.com'||h.endsWith('.ebay.com')||h==='ebay.ca'||h.endsWith('.ebay.ca');
  }catch{return false;}
}

async function syncPanel(tabId,url){
  if(!tabId)return;
  const ebay=isEbay(url);
  await chrome.sidePanel.setOptions({tabId,enabled:ebay,path:'popup.html'}).catch(()=>{});
  if(ebay){
    // Chrome requires sidePanel.open() to follow a user gesture, so we enable the
    // persistent panel automatically on every eBay tab and open it when Chrome
    // permits. Once opened, it remains available while the user browses eBay.
    await chrome.sidePanel.open({tabId}).catch(()=>{});
  }
}

chrome.tabs.onUpdated.addListener((tabId,changeInfo,tab)=>{
  if(changeInfo.status==='complete'||changeInfo.url)syncPanel(tabId,changeInfo.url||tab.url);
});

chrome.tabs.onActivated.addListener(async({tabId})=>{
  const tab=await chrome.tabs.get(tabId).catch(()=>null);
  if(tab)syncPanel(tabId,tab.url);
});