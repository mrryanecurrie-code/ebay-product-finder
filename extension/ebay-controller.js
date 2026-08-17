async function pfEbayCommand(message){
 if(!window.PF_EBAY) throw new Error('eBay Product Research adapter unavailable');
 if(message.type==='PF_EBAY_RESEARCH_ONE') return PF_EBAY.researchOne(message.query);
 if(message.type==='PF_EBAY_CAPTURE_CATEGORY') return PF_EBAY.snapshot(message.query||document.title);
 if(message.type==='PF_EBAY_RESEARCH_BATCH'){
   const results=await PF_EBAY.researchBatch(message.queries||[],p=>chrome.runtime.sendMessage({type:'PF_EBAY_PROGRESS',progress:p}));
   return {results};
 }
 throw new Error('Unknown eBay Product Research command');
}
chrome.runtime.onMessage.addListener((message,_sender,sendResponse)=>{
 if(!String(message?.type||'').startsWith('PF_EBAY_')) return;
 pfEbayCommand(message).then(data=>sendResponse({ok:true,data})).catch(error=>sendResponse({ok:false,error:String(error?.message||error)}));
 return true;
});
