export const metadata = { title: "Privacy, safety & marketplace terms" };
export default function Page() {
  return (
    <article className="page prose-copy !max-w-4xl">
      <p className="eyebrow">Privacy & marketplace terms</p>
      <h1 className="page-title mt-5">
        A Clearer.
        <br />
        Safer Journey.
      </h1>
      <h2>Your data</h2>
      <p>
        Carpur stores your account name, email and a hashed password, along with session information
        needed for sign-in. Seller listings, uploaded photographs, enquiries and account-saved
        vehicles are stored in PostgreSQL. Published listing details and photos are public. Your
        email is not included in public listing pages.
      </p>
      <p>
        When you send an enquiry, your name, email and message are shared with the seller in their
        Carpur inbox after you consent. Sellers can reply by email outside Carpur. There are no
        automated email notifications, email verification or password recovery emails at this stage.
        Use a password manager and verify your email address before signing up.
      </p>
      <p>
        Affordability inputs stay in the current page and are not sent to the server. Anonymous
        saved vehicles, catalogue models and illustrative vehicles use browser local storage. Theme
        and visual-quality preferences also stay in this browser. Automatic visual quality reads
        available hardware, connection and reduced-motion preferences locally; these signals are not
        sent to Carpur. Signed-in live vehicle saves use your account. Carpur uses essential session
        cookies. No advertising trackers or analytics integrations have been added.
      </p>
      <h2>Control and retention</h2>
      <p>
        You can edit or delete your listings from the dashboard. Deleting a listing removes its
        photos, associated enquiries and account garage references. Remove saved vehicles in your
        garage. Accounts and enquiries otherwise remain until deletion is requested. For account
        access, correction or deletion requests, open a private support request with the project
        owner; do not put personal details into public repository issues. A dedicated support
        channel and self-service account deletion are still pending.
      </p>
      <h2>Seller responsibilities</h2>
      <p>
        You must have authority to sell the vehicle, provide accurate information and have
        permission to publish all photographs. Dealership accounts currently use a single account
        owner; team seats and dealership verification are not offered. Listings must not include
        identity documents, finance statements, banking details or home addresses. Carpur may remove
        abusive or misleading content.
      </p>
      <h2>Buyer safety</h2>
      <p>
        Carpur is a marketplace, not the seller, a lender or an insurer. It does not take deposits
        or process payments. Confirm identity, inspect registration documents and arrange an
        independent mechanical and roadworthy inspection. Meet in a safe public place. Do not pay to
        view a vehicle or transfer a deposit to an unverified seller. A listing category does not
        indicate that the seller is verified.
      </p>
      <h2>Estimates and availability</h2>
      <p>
        Financial outputs are planning estimates. Get finance and insurance quotes from registered
        providers and check the actual contract terms. Carpur is an early release with no live data
        feeds, automated content moderation or vehicle-history integration. You are responsible for
        your purchase decision and for agreeing sale terms directly with the seller.
      </p>
    </article>
  );
}
