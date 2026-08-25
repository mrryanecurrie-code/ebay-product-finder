(()=>{
  if(window.__PF_AMAZON_CAPTURE__) return;
  window.__PF_AMAZON_CAPTURE__=true;
  const product=()=>{
    const asin=(location.pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i)||[])[1]||document.querySelector('[data-asin]')?.getAttribute('data-asin')||'';
    const title=(document.querySelector('#productTitle')?.textContent||document.querySelector('#title')?.textContent||document.querySelector('h1')?.textContent||document.title||'').replace(/\s+/g,' ').replace(/\s*:\s*Amazon\.(?:com|ca).*$/i,'').trim();
    const price=(document.querySelector('#corePrice_feature_div .a-price .a-offscreen')?.textContent||document.querySelector('.a-price .a-offscreen')?.textContent||'').trim();
    return {asin,title,price,url:location.href};
  };
  let lastKey='';
  const send=()=>{const p=product();if(!p.title)return;const key=`${p.asin}|${p.title}`;if(key===lastKey)return;lastKey=key;chrome.runtime.sendMessage({type:'PF_AMAZON_PRODUCT',product:p}).catch(()=>{lastKey='';});};
  send();setTimeout(send,800);setTimeout(send,2200);
  let lastUrl=location.href;
  new MutationObserver(()=>{if(location.href!==lastUrl){lastUrl=location.href;lastKey='';setTimeout(send,400);setTimeout(send,1200);}}).observe(document.documentElement,{subtree:true,childList:true});
})();