async function pfEbayCommand(message){
 if(message.type==='PF_EBAY_RESEARCH_ONE'){
   if(!window.PF_EBAY)throw new Error('eBay Product Research adapter unavailable');
   return PF_EBAY.researchOne(message.query);
 }
 if(message.type==='PF_EBAY_SOLD_ONE'){
   if(!window.PF_EBAY_SOLD)throw new Error('eBay Sold Items adapter unavailable');
   return PF_EBAY_SOLD.researchOne(message.query);
 }
 if(message.type==='PF_EBAY_CAPTURE_CATEGORY'){
   if(!window.PF_EBAY)throw new Error('eBay Product Research adapter unavailable');
   return PF_EBAY.snapshot(message.query||document.title);
 }
 throw new Error('Unknown eBay research command');
}
chrome.runtime.onMessage.addListener((message,_sender,sendResponse)=>{
 if(!String(message?.type||'').startsWith('PF_EBAY_'))return;
 pfEbayCommand(message).then(data=>sendResponse({ok:true,data})).catch(error=>sendResponse({ok:false,error:String(error?.message||error)}));
 return true;
});