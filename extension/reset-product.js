(()=>{
const $=id=>document.getElementById(id);
async function clearProduct(){
  await chrome.storage.local.remove(['pfLastSource','pfLastResearch','pfEconomics','sourceCost']);
  $('sourceEmpty')?.classList.remove('hidden');
  $('sourceProduct')?.classList.add('hidden');
  if($('sourceImage')) $('sourceImage').src='';
  ['sourceTitle','sourceBrand','sourceRating','sourceAsin','sourceVariation','ebayQuery','sourceCost'].forEach(id=>{if($(id)) $(id).value!==undefined?$(id).value='':$(id).textContent='';});
  const defaults={amazonPrice:'—',amazonBsr:'—',amazonBought:'—',d30:'—',d90:'—',d365:'—',avgSold:'—',maxCost:'—',profit:'—',roi:'—',ebayCurrency:'eBay: —'};
  Object.entries(defaults).forEach(([id,v])=>{if($(id)) $(id).textContent=v;});
  if($('verdict')) $('verdict').textContent='WAITING';
  if($('verdictReason')) $('verdictReason').textContent='Capture a new Amazon product';
  if($('demand')) $('demand').textContent='No demand captured.';
  if($('competition')) $('competition').textContent='—';
  if($('winners')) $('winners').textContent='No captured listings yet.';
  if($('economics')) $('economics').textContent='Enter or capture source cost, then Calculate.';
  if($('buyPlan')) $('buyPlan').textContent='Pending research.';
  if($('sellPlan')) $('sellPlan').textContent='Research a product to build the launch plan.';
  if($('sourceInfo')) $('sourceInfo').textContent='No source product captured.';
  if($('sourceStatus')) $('sourceStatus').textContent='SOURCE COST — NOT VERIFIED';
  if($('result')) $('result').textContent='No research captured.';
  if($('researchStatus')) $('researchStatus').textContent='Ready for a new product. Open Amazon and click Capture Amazon Product.';
}
document.addEventListener('DOMContentLoaded',()=>{$('clearProduct')?.addEventListener('click',clearProduct)});
})();