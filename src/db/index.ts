import pg from "pg";
const { Pool } = pg;

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function saveRecommendation(r: {
  runId?: number; productId: string; marketplace: string; score: number;
  decision: "BUY"|"WATCH"|"REJECT"; targetSalePrice: number; grossProfit: number;
  marginPct: number; roiPct: number; trend: string; recommendedInitialQty: number; reasons: string[];
}) {
  await pool.query(`INSERT INTO recommendations
    (run_id,product_id,target_marketplace,score,decision,target_sale_price,estimated_unit_profit,margin_pct,roi_pct,trend,recommended_initial_qty,reasons)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb)`,
    [r.runId ?? null,r.productId,r.marketplace,r.score,r.decision,r.targetSalePrice,r.grossProfit,r.marginPct,r.roiPct,r.trend,r.recommendedInitialQty,JSON.stringify(r.reasons)]);
}

export async function getBuyList(limit = 25) {
  const { rows } = await pool.query(`SELECT r.*, p.brand, p.title, p.upc, p.pack_size,
    s.supplier, s.unit_cost, s.currency AS supplier_currency, s.source_url
    FROM recommendations r JOIN products p ON p.id=r.product_id
    LEFT JOIN LATERAL (SELECT * FROM supplier_offers so WHERE so.product_id=p.id ORDER BY observed_at DESC LIMIT 1) s ON true
    WHERE r.decision='BUY' ORDER BY r.score DESC, r.roi_pct DESC LIMIT $1`, [limit]);
  return rows;
}
