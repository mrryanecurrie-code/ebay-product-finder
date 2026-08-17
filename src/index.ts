import Fastify from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";
import { analyzeOpportunity } from "./domain/opportunity.js";
import { searchActiveListings, summarizeCompetition } from "./integrations/ebay.js";
import { discoverAmazonToEbay } from "./services/discovery.js";

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

app.get("/health", async () => ({ ok: true, service: "ebay-product-finder" }));

const schema = z.object({
  productId: z.string(), title: z.string(), upc: z.string().optional(), supplierUnitCost: z.number().nonnegative(),
  currency: z.string().min(3).max(3), targetSalePrice: z.number().positive(), estimatedShipping: z.number().nonnegative(), estimatedMarketplaceFees: z.number().nonnegative(),
  windows: z.array(z.object({ days: z.union([z.literal(30),z.literal(90),z.literal(180),z.literal(365)]), unitsSold: z.number().int().nonnegative(), revenue: z.number().nonnegative(), uniqueListings: z.number().int().nonnegative() })),
  sellers: z.array(z.object({ seller: z.string(), unitsSold: z.number().int().nonnegative(), active: z.boolean(), outOfStock: z.boolean() })),
});

app.post("/api/opportunities/analyze", async (request, reply) => {
  const parsed = schema.safeParse(request.body);
  if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });
  return analyzeOpportunity(parsed.data);
});

app.get("/api/ebay/search", async (request, reply) => {
  const parsed = z.object({ q: z.string().min(2) }).safeParse(request.query);
  if (!parsed.success) return reply.code(400).send({ error: "q is required" });
  const listings = await searchActiveListings(parsed.data.q, process.env.EBAY_MARKETPLACE ?? "EBAY_US", 100);
  return { query: parsed.data.q, competition: summarizeCompetition(listings), listings };
});

app.get("/api/discover", async (request, reply) => {
  const parsed = z.object({ q: z.string().min(2) }).safeParse(request.query);
  if (!parsed.success) return reply.code(400).send({ error: "q is required" });
  const candidates = await discoverAmazonToEbay(parsed.data.q);
  return { query: parsed.data.q, candidates: candidates.filter(c => c.signal === "INVESTIGATE") };
});

const port = Number(process.env.PORT ?? 3000);
await app.listen({ port, host: "0.0.0.0" });
