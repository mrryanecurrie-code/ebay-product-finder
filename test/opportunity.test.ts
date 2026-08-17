import test from "node:test";
import assert from "node:assert/strict";
import { analyzeOpportunity } from "../src/domain/opportunity.js";

const base = {
  productId:"anua-250", title:"ANUA Heartleaf 77% Soothing Toner 250ml", upc:"8809640732829",
  supplierUnitCost:7.84, currency:"USD", targetSalePrice:19.41, estimatedShipping:4, estimatedMarketplaceFees:2.5,
  windows:[
    {days:30 as const,unitsSold:12,revenue:216,uniqueListings:4},
    {days:90 as const,unitsSold:49,revenue:834,uniqueListings:8},
    {days:180 as const,unitsSold:105,revenue:1785,uniqueListings:12},
    {days:365 as const,unitsSold:286,revenue:4348.89,uniqueListings:20}
  ]
};

test("does not blindly treat annual units / 12 as current monthly demand", () => {
  const r=analyzeOpportunity({...base,sellers:[{seller:"leader",unitsSold:60,active:true,outOfStock:false}]});
  assert.equal(r.recommendedInitialQty,3); // 25% of observed last-30-day demand, not 286/12
});

test("dominant seller stockout is recognized as a supply gap", () => {
  const r=analyzeOpportunity({...base,sellers:[
    {seller:"leader",unitsSold:60,active:false,outOfStock:true},
    {seller:"other",unitsSold:10,active:true,outOfStock:false}
  ]});
  assert.equal(r.topSellerOutOfStock,true);
  assert.ok(r.reasons.some(x=>x.includes("supply gap")));
});

test("active dominant seller increases entry risk", () => {
  const r=analyzeOpportunity({...base,sellers:[
    {seller:"leader",unitsSold:60,active:true,outOfStock:false},
    {seller:"other",unitsSold:10,active:true,outOfStock:false}
  ]});
  assert.ok(r.reasons.some(x=>x.includes("entry risk")));
});
