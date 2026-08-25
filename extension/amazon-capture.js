(()=>{
  if(window.__PF_AMAZON_CAPTURE__) return;
  window.__PF_AMAZON_CAPTURE__=true;
  const text=(sel)=>document.querySelector(sel)?.textContent?.replace(/\s+/g,' ').trim()||'';
  const attr=(sel,name)=>document.querySelector(sel)?.getAttribute(name)||'';
  const pageAsin=()=> (location.pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i)||[])[1]||'';
  const isProductPage=()=>/amazon\.(ca|com)$/i.test(location.hostname.replace(/^www\./,''))&&!!pageAsin();
  const product=()=>{
    const asin=pageAsin()||document.querySelector('[data-asin]')?.getAttribute('data-asin')||'';
    const title=(text('#productTitle')||text('#title')||text('h1')||document.title||'').replace(/\s*:\s*Amazon\.(?:com|ca).*$/i,'').trim();
    const price=(text('#corePrice_feature_div .a-price .a-offscreen')||text('.a-price .a-offscreen')).trim();
    const image=attr('#landingImage','src')||attr('#imgBlkFront','src')||attr('#main-image','src')||attr('#ebooksImgBlkFront','src');
    const brand=(text('#bylineInfo')||text('#brand')||'').replace(/^Visit the\s+/i,'').replace(/\s+Store$/i,'').trim();
    const rating=(text('#acrPopover .a-icon-alt')||text('[data-hook="rating-out-of-text"]')).match(/[0-9.]+/)?.[0]||'';
    const reviews=(text('#acrCustomerReviewText')||text('[data-hook="total-review-count"]')).replace(/[^0-9,]/g,'').replace(/,/g,'');
    const bought=text('#social-proofing-faceout-title-tk_bought')||text('[data-csa-c-content-id="social-proofing-faceout-title-tk_bought"]')||[...document.querySelectorAll('span')].map(x=>x.textContent?.trim()).find(x=>/bought in past month/i.test(x||''))||'';
    const variation=[...document.querySelectorAll('#variation_size_name .selection,#variation_color_name .selection,#variation_style_name .selection,#variation_number_of_items .selection')].map(x=>x.textContent.trim()).filter(Boolean).join(' • ');
    const bullets=[...document.querySelectorAll('#feature-bullets li span.a-list-item')].map(x=>x.textContent.replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,8);
    const detailText=[...document.querySelectorAll('#productDetails_techSpec_section_1 tr,#productDetails_detailBullets_sections1 tr,#detailBullets_feature_div li')].map(x=>x.textContent.replace(/\s+/g,' ').trim()).filter(Boolean);
    const bsr=detailText.find(x=>/best sellers rank/i.test(x))||'';
    return {asin,title,price,image,brand,rating,reviews,bought,variation,bullets,bsr,url:location.href,capturedAt:new Date().toISOString()};
  };
  let lastAsin=''; let timer=null;
  const autoCapture=async(force=false)=>{
    if(!isProductPage()) return;
    const asin=pageAsin(); if(!force&&asin===lastAsin) return;
    const p=product(); if(!p.asin||!p.title||p.title.length<4) return;
    lastAsin=asin;
    try{await chrome.storage.local.set({pfLastSource:p,pfLastResearch:null,pfEconomics:null});}catch(e){}
    chrome.runtime.sendMessage({type:'PF_AMAZON_PRODUCT',product:p}).catch(()=>{});
  };
  const schedule=(force=false)=>{clearTimeout(timer);timer=setTimeout(()=>autoCapture(force),700);};
  chrome.runtime.onMessage.addListener((m,_s,reply)=>{if(m?.type==='PF_CAPTURE_AMAZON_NOW'){const p=product();if(p?.asin&&p?.title)chrome.storage.local.set({pfLastSource:p});reply({ok:true,product:p});return true;}});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>schedule(true));else schedule(true);
  window.addEventListener('load',()=>schedule(true));
  new MutationObserver(()=>{if(pageAsin()!==lastAsin)schedule(false);}).observe(document.documentElement,{childList:true,subtree:true});
  let lastUrl=location.href;setInterval(()=>{if(location.href!==lastUrl){lastUrl=location.href;lastAsin='';schedule(true);}},1000);
})();