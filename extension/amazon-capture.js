(()=>{
  if(window.__PF_AMAZON_CAPTURE__) return;
  window.__PF_AMAZON_CAPTURE__=true;

  const product=()=>{
    const asin=(location.pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i)||[])[1]
      || document.querySelector('[data-asin]')?.getAttribute('data-asin') || '';
    const title=(document.querySelector('#productTitle')?.textContent
      || document.querySelector('#title')?.textContent
      || document.querySelector('h1')?.textContent || '').replace(/\s+/g,' ').trim();
    const price=(document.querySelector('#corePrice_feature_div .a-price .a-offscreen')?.textContent
      || document.querySelector('.a-price .a-offscreen')?.textContent || '').trim();
    return {asin,title,price,url:location.href};
  };

  const send=()=>{
    const p=product();
    if(!p.title) return;
    chrome.runtime.sendMessage({type:'PF_AMAZON_PRODUCT',product:p}).catch(()=>{});
  };

  send();
  setTimeout(send,1200);
  setTimeout(send,3000);
  let last=location.href;
  new MutationObserver(()=>{
    if(location.href!==last){last=location.href;setTimeout(send,700);}
  }).observe(document.documentElement,{subtree:true,childList:true});
})();