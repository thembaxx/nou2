export const metadata = { title: "Data sources & financial assumptions" };
export default function Page() {
  return (
    <article className="page prose-copy !max-w-4xl">
      <p className="eyebrow">Transparent by design</p>
      <h1 className="page-title mt-5">
        The Numbers.
        <br />
        And The Assumptions.
      </h1>
      <h2>What is live, and what is illustrative?</h2>
      <p>
        Published marketplace listings are provided by sellers. Carpur does not import listings from
        another marketplace or verify vehicle ownership, seller identity, roadworthy status, price
        or condition. The separately labelled illustrative inventory is fictional, is not for sale
        and cannot receive enquiries. Editorial photos may not match the stated trim.
      </p>
      <h2>Manufacturer Catalogue: Real Model Data</h2>
      <p>
        Carpur includes a dated snapshot of 44 Toyota South Africa variants across 10 ranges,
        observed on 13 October 2026. Prices, fuel types, transmissions, body styles and published
        consumption come from the manufacturer’s model pages. Each catalogue model links to its
        original source. This is manufacturer reference data, not verified dealer stock, an offer,
        or a guaranteed current price.
      </p>
      <p>
        Confirm the model year, specification, VAT, optional extras, on-road fees, service plan,
        warranty and delivery date with an authorised dealer. Manufacturer consumption is a
        laboratory figure and real-world consumption can differ. The Hiace source did not provide
        consumption: its calculator explicitly identifies the editable planning assumption.
      </p>
      <p>
        <a href="https://www.toyota.co.za/ranges/starlet" target="_blank" rel="noreferrer">
          Toyota South Africa — Starlet
        </a>{" "}
        ·{" "}
        <a href="https://www.toyota.co.za/ranges/corolla-cross" target="_blank" rel="noreferrer">
          Corolla Cross
        </a>{" "}
        ·{" "}
        <a href="https://www.toyota.co.za/ranges/rav4" target="_blank" rel="noreferrer">
          RAV4
        </a>{" "}
        ·{" "}
        <a href="https://www.toyota.co.za/ranges/fortuner" target="_blank" rel="noreferrer">
          Fortuner
        </a>
        . Further source links appear on each catalogue model. Current catalogue coverage is Toyota.
        The seller workflow accepts any make; Carpur does not claim to have every car or brand in
        stock.
      </p>
      <h2>South African Financial Reference Sources</h2>
      <p>
        Check current figures at the source before making a decision. The financial defaults are
        planning assumptions. These official and industry sources help you replace them with current
        figures; they are not live rate feeds.
      </p>
      <ul className="mt-5 list-disc space-y-4 pl-6 text-slate-300">
        <li>
          <a
            href="https://www.resbank.co.za/en/home/what-we-do/monetary-policy"
            target="_blank"
            rel="noreferrer"
          >
            South African Reserve Bank — monetary policy
          </a>
          . Policy rates inform market rates but are not your personal vehicle-finance quote.
        </li>
        <li>
          <a href="https://www.dmpr.gov.za/" target="_blank" rel="noreferrer">
            Department of Mineral and Petroleum Resources — petroleum prices
          </a>
          . Check the fuel grade, effective month and inland/coastal region.
        </li>
        <li>
          <a href="https://aa.co.za/fuel-pricing/" target="_blank" rel="noreferrer">
            Automobile Association of South Africa — fuel pricing
          </a>
          . A secondary reference for understanding pump-price changes.
        </li>
        <li>
          <a
            href="https://www.eskom.co.za/distribution/tariffs-and-charges/"
            target="_blank"
            rel="noreferrer"
          >
            Eskom — tariffs and charges
          </a>
          . Electricity cost depends on your municipality, tariff block and charger provider; a home
          tariff is not a public charging quote.
        </li>
        <li>
          <a href="https://www.ncr.org.za/" target="_blank" rel="noreferrer">
            National Credit Regulator
          </a>
          . Consumer credit information and registered credit-provider checks.
        </li>
        <li>
          <a href="https://online.natis.gov.za/" target="_blank" rel="noreferrer">
            National Traffic Information System
          </a>
          . Vehicle registration and licensing information.
        </li>
      </ul>
      <h2>Finance calculation</h2>
      <p>
        The calculator uses a fixed annual nominal rate divided by 12. The monthly payment amortises
        price less deposit, with any balloon discounted to the end of the loan. The balloon is
        settled in cash when the term ends. Monthly instalments stop at the end of the term; fuel,
        insurance and maintenance continue for the selected horizon.
      </p>
      <p>
        There are no automatic initiation fees, monthly service fees, VAT adjustments, licensing
        fees, inflation, changing rates or refinancing assumptions. Add relevant recurring fees to
        the maintenance allowance or adjust the vehicle price for financed upfront fees. Your
        lender’s actual repayment schedule can differ. Early settlement fees and interest timing are
        not modelled.
      </p>
      <h2>Fuel, insurance and maintenance</h2>
      <p>
        Monthly fuel cost = annual distance × consumption per 100 km ÷ 100 × unit price ÷ 12.
        Electric vehicles use kWh and R/kWh in the same formula. Regular hybrid consumption should
        reflect your route. Plug-in hybrid calculators start at an illustrative 7 L/100 km plus a
        separate R450 monthly charging allowance to avoid treating charge-dependent lab fuel figures
        as a complete energy budget. Edit both for your usage. Electric and hydrogen units are
        identified separately. Insurance and maintenance are monthly allowances, not quotes.
        Insurance varies by driver, location and coverage; repairs, tyres and servicing vary by
        vehicle and usage.
      </p>
      <h2>Depreciation and the ownership horizon</h2>
      <p>
        Estimated resale = purchase price × (1 − annual depreciation rate) raised to the number of
        years. This is a simple declining-balance assumption, not a valuation feed. Net ownership
        cost = deposit + repayments + any settled balloon + running costs + outstanding debt −
        estimated resale. Do not add depreciation again: it is already reflected in the resale
        deduction.
      </p>
      <h2>Budget headroom and comparison</h2>
      <p>
        Budget headroom is net income minus living costs, other commitments and the estimated
        monthly vehicle outflow. It is shown in rand, not as a credit score. Carpur does not access
        a credit bureau, assess creditworthiness or predict approval. Financial inputs remain in
        your current browser page and are not submitted to the server.
      </p>
      <p>
        Comparison applies shared assumptions to two cars and shows 1-, 3- and 5-year cash outflow,
        resale, remaining debt and net ownership cost. Energy unit prices and additional charging
        allowances are separate for each vehicle. Use the individual calculator for separate
        insurance quotes, maintenance and consumption. The stress scenario increases interest by 2
        percentage points, energy and insurance by 20%, maintenance by 30% and depreciation by 5
        percentage points. It illustrates uncertainty; it is not a probability or a forecast.
      </p>
    </article>
  );
}
