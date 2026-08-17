import { createHash } from "node:crypto";

export type SupplierRow = { brand?: string; name?: string; title?: string; upc?: string|number; sku?: string; cost?: string|number; price?: string|number; currency?: string; packSize?: string|number; url?: string };
export type NormalizedSupplierProduct = { id:string; brand:string; title:string; upc?:string; supplierSku?:string; unitCost:number; currency:string; packSize:number; sourceUrl?:string };

const cleanUpc = (v: unknown) => String(v ?? "").replace(/\D/g, "") || undefined;
const money = (v: unknown) => Number(String(v ?? "0").replace(/[^0-9.-]/g, ""));

export function normalizeSupplierRow(row: SupplierRow, defaultCurrency = "USD"): NormalizedSupplierProduct {
  const brand = String(row.brand ?? "UNKNOWN").trim();
  const title = String(row.name ?? row.title ?? "").trim();
  if (!title) throw new Error("Supplier row is missing product name/title");
  const upc = cleanUpc(row.upc);
  const unitCost = money(row.cost ?? row.price);
  if (!(unitCost > 0)) throw new Error(`Invalid supplier cost for ${title}`);
  const packSize = Math.max(1, Number(row.packSize ?? 1) || 1);
  const key = `${brand}|${upc ?? title.toLowerCase()}|${packSize}`;
  return { id:createHash("sha256").update(key).digest("hex").slice(0,24), brand, title, upc, supplierSku:row.sku?.trim(), unitCost, currency:String(row.currency ?? defaultCurrency).toUpperCase(), packSize, sourceUrl:row.url };
}
