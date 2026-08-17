chrome.runtime.onInstalled.addListener(async()=>{const c=await chrome.storage.local.get(['apiBase']);if(!c.apiBase)await chrome.storage.local.set({apiBase:'http://localhost:3000'})});
