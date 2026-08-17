# eBay Product Finder

Automated product sourcing and eBay opportunity intelligence.

## Product doctrine

The application answers one practical question: **What should I buy to resell on eBay?**

Amazon/Keepa are primarily demand-discovery signals. eBay is the primary resale marketplace. Supplier catalogues provide acquisition candidates and costs.

## Required workflows

1. **Supplier → eBay** — ingest wholesale catalogues, normalize products/UPCs, research eBay demand and competition, calculate economics, rank buy candidates.
2. **Amazon/Keepa → eBay** — use proven Amazon demand to discover products, then determine whether the same product presents an eBay opportunity.
3. **eBay supply-gap discovery** — identify products with persistent demand where strong sellers/listings are out of stock, weakly supplied, or otherwise vulnerable.

## Non-negotiable UX

The operator must never need to use browser Developer Tools, paste JavaScript into the console, manually download research JSON, or manually switch eBay Product Research date ranges.

The primary user-facing output is a simple **BUY LIST**. Rejected candidates and diagnostic noise stay internal unless requested.

Each recommendation should ultimately include:

- exact product / UPC
- supplier and unit cost
- target eBay marketplace and target sale price
- 30/90/180/365-day demand and trend
- seller concentration and supply-gap / stock-out evidence
- shipping and marketplace costs
- expected profit, margin, and ROI
- recommended initial buy quantity
- confidence and next action

## First regression benchmark

ANUA wholesale products and the previously researched eBay examples are the first benchmark. The implementation must correctly distinguish exact SKUs from variants/multipacks, preserve currency, use actual sold quantities rather than naive monthly averages, detect demand continuity/decline, measure seller concentration, and recognize stock-outs as possible opportunities rather than automatically treating them as failures.

## Architecture direction

- TypeScript application
- PostgreSQL persistent operational database
- adapter-based integrations for supplier catalogues, Keepa/Amazon signals, and eBay data
- raw evidence retained separately from normalized observations
- deterministic opportunity scoring and economics
- auditable recommendation reasons

## Acceptance test

A user can provide a supplier catalogue or start a discovery run, press **FIND PRODUCTS**, and receive ranked actionable eBay buy candidates without performing any console/data-extraction work themselves.
