# External hard stops

The application must not invent evidence to bypass these dependencies.

## 1. eBay production approval
Required for live eBay.com Browse API calls. Pending developer approval can be developed around but not live-tested.

## 2. Historical eBay sales evidence
Marketplace Insights can supply sales history but is Limited Release. If access is unavailable, a compliant alternate historical sold-data provider must implement the HistoricalSalesProvider interface. Active listings are never substituted for sold history.

## 3. Supplier shipping
Final BUY status requires a verified shipping quote to the actual receiving destination. Until then a product can be CANDIDATE/WATCH but economics are not final.

## 4. Keepa key
Required for automated Amazon demand-radar runs. Amazon is discovery evidence, not the target selling marketplace.

## Target
Primary resale marketplace: eBay.com / EBAY_US. Economics and final buy list: USD.
