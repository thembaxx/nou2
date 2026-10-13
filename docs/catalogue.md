# Manufacturer catalogue

The checked-in snapshot `data/toyota-2026-10-13.json` contains 44 model variants from ten Toyota South Africa model pages, retrieved on 13 October 2026. It records source IDs, exact model names, published reference prices, consumption, fuel type, transmission, body style, seating, engine and drivetrain fields. Prices are copied from manufacturer model records, not calculated or invented. The observation date does not establish an effective price date or a guarantee that the price is still valid.

Each `sourceUrl` is the original HTTPS manufacturer page. Examples include:

- https://www.toyota.co.za/ranges/starlet — five variants, R273,700 to R334,200 at observation.
- https://www.toyota.co.za/ranges/corolla-cross — seven variants, petrol and hybrid.
- https://www.toyota.co.za/ranges/rav4 — petrol, hybrid and plug-in hybrid.
- https://www.toyota.co.za/ranges/fortuner — twelve diesel variants.
- Additional ranges: Corolla, Urban Cruiser, Land Cruiser Prado, GR86, Hiace and Rumion.

`lib/catalogue.ts` maps source terminology to shared filters, retains a link/date on every model, and labels records as manufacturer references. It never seeds PostgreSQL or labels these models as seller offers. Model year, actual stock, mileage, VAT treatment, on-road fees, available options, warranty and delivery are not inferred. The year sentinel is not displayed or emitted as structured metadata. Native source images remain hosted by the manufacturer and are not claimed as Carpur photography.

The source reports no consumption for Hiace. Its detail page says “Not Published” and the calculator declares its editable 7 L/100 km assumption. Plug-in hybrid lab consumption is displayed as sourced, while planning deliberately starts at a disclosed 7 L/100 km plus R450/month charging to avoid presenting a charge-dependent fuel figure as the complete running cost. These conservative planning numbers are illustrative and must be replaced with the buyer’s actual use and quotations.

The Volkswagen Polo Vivo page was checked but its structured offer carried a 2022 availability date. It was excluded rather than represented as a verified current quote.

Run `node scripts/refresh-catalogue.mjs` to write a **candidate** snapshot under `/tmp`. Source failures and structural changes stop the run. Review changes and current source usage terms before replacing the dated file; a failed update never substitutes fictional records. Adding other manufacturers requires the same source/date/price-basis review. There is no claim of complete South African market or inventory coverage.
