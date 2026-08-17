# V1 acceptance criteria

V1 is complete only when the following can be demonstrated with real evidence.

1. User imports a supplier catalogue or starts an Amazon/Keepa discovery search.
2. Products are normalized and deduplicated by exact identity and pack size.
3. Cheap pre-screen removes malformed candidates before paid/rate-limited research.
4. Amazon/Keepa may provide demand-discovery signals but does not decide the eBay purchase by itself.
5. eBay.com current supply is researched in USD.
6. Historical eBay sold evidence is obtained from an authorized source and normalized into actual sold events/windows.
7. The engine distinguishes continuous demand from one-month/one-off sales.
8. Seller concentration and stock-out/supply-gap evidence are calculated.
9. Supplier shipping is verified; no guessed freight may create a BUY.
10. Landed cost, eBay fees, outbound shipping, promoted listing allowance and returns reserve are included.
11. BUY requires verified product identity, supplier cost, eBay price, historical demand and shipping evidence.
12. Output shows only actionable BUY candidates by default, ranked with recommended initial quantity and next action.
13. Results persist and can be exported as CSV for Google Drive/Sheets ingestion.
14. ANUA benchmark cases reproduce the manual conclusions, including dominant-seller and stock-out behavior.
15. User never needs browser Developer Tools, console JavaScript or manual JSON extraction.

## External gates

- eBay developer production approval for live Browse API access.
- Authorized historical sold-data source. eBay Marketplace Insights is preferred if access is granted.
- Keepa API key at runtime for Amazon discovery.
- Real supplier shipping quote before a final purchase instruction.
