import {SupplierProduct} from "./supplier-research.js";
const clean=(s?:string)=>s?.toLowerCase().replace(/[^a-z0-9]+/g," ").trim()??"";
export function identityKey(p:SupplierProduct){const code=p.upc??p.ean;if(code)return `gtin:${code}:pack:${p.packSize??1}`;return `text:${clean(p.brand)}:${clean(p.title)}:pack:${p.packSize??1}`;}
export function dedupeProducts(products:SupplierProduct[]){const seen=new Map<string,SupplierProduct>();for(const p of products){const key=identityKey(p);const existing=seen.get(key);if(!existing||p.unitCost<existing.unitCost)seen.set(key,p)}return [...seen.values()];}
