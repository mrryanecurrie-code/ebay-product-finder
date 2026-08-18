async function configureSidePanel(){
  await chrome.sidePanel.setPanelBehavior({openPanelOnActionClick:true});
}
chrome.runtime.onInstalled.addListener(async()=>{const c=await chrome.storage.local.get(['apiBase']);if(!c.apiBase)await chrome.storage.local.set({apiBase:'http://localhost:3000'});await configureSidePanel();});
chrome.runtime.onStartup.addListener(()=>configureSidePanel().catch(()=>{}));
function isEbay(url=''){try{const h=new URL(url).hostname.toLowerCase();return h==='ebay.com'||h.endsWith('.ebay.com')||h==='ebay.ca'||h.endsWith('.ebay.ca')}catch{return false}}
function isItem(url=''){return isEbay(url)&&/\/itm\//i.test(url)}
async function syncPanel(tabId,url){if(!tabId)return;const ebay=isEbay(url);await chrome.sidePanel.setOptions({tabId,enabled:ebay,path:'popup.html'}).catch(()=>{});if(ebay)await chrome.runtime.sendMessage({type:'PF_ACTIVE_EBAY_TAB',tabId,url,isItem:isItem(url)}).catch(()=>{});}
chrome.tabs.onUpdated.addListener((tabId,changeInfo,tab)=>{if(changeInfo.status==='complete'||changeInfo.url)syncPanel(tabId,changeInfo.url||tab.url)});
chrome.tabs.onActivated.addListener(async({tabId})=>{const tab=await chrome.tabs.get(tabId).catch(()=>null);if(tab)syncPanel(tabId,tab.url)});