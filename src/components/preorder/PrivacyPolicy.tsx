import logoSrc from '../../assets/omni-ouro-logo.png'
import './preorder.css'

/** eyro.io's privacy policy. Modelled on GloveGate's (gloveguard-site's
 *  /legal/privacy), rewritten for what this site does: Stripe, Buttondown,
 *  the Meta Pixel (index.html), the Discord giveaway and the Eyro app. */
export function PrivacyPolicy() {
  return (
    <div className="po">
      <header className="po-head">
        <a className="po-brand" href="/"><img src={logoSrc} alt="" /><strong>EYRO</strong></a>
      </header>
      <main className="po-rules">
        <p className="po-kicker">Last updated: 2026-10-16</p>
        <h1>Privacy Policy</h1>
        <p className="po-rules-lead">
          eyro.io is run by Omni-Ouro. We collect what we need to take your reservation, email you,
          and run the giveaway, and we use the Meta Pixel to measure our ads. We don’t sell your data
          for money.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li><strong>When you reserve an Eyro Mini:</strong> your name, email address and the payment’s status, from our payment processor, Stripe. Card details go to Stripe and never reach our systems.</li>
          <li><strong>When you join the mailing list:</strong> your email address, held by our email provider, Buttondown.</li>
          <li><strong>If you win the giveaway:</strong> your name, shipping address, confirmation that you’re eligible, and the tax details on IRS Form W-9, which we need to report the prize.</li>
          <li><strong>If you create an Eyro account</strong> in the Eyro app: your email address and the details needed to run your account.</li>
        </ul>

        <h2>The Meta Pixel</h2>
        <p>
          eyro.io uses the Meta Pixel, a tool from Meta (Facebook and Instagram) that tells us how our ads
          perform and helps us show them to people likely to be interested. When you visit, it sends
          Meta the pages you view and a few actions: clicking Reserve, joining the mailing list, and
          reaching the reservation confirmation page. Meta also receives technical details such as your
          IP address and browser, and may set a cookie. Meta uses this under its own{' '}
          <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noreferrer">privacy policy</a>.
        </p>
        <p>
          To opt out, turn on Global Privacy Control in your browser and eyro.io won’t load the pixel at
          all. You can also manage ad tracking in your{' '}
          <a href="https://accountscenter.facebook.com/ad_preferences" target="_blank" rel="noreferrer">Meta ad preferences</a>,
          or email us.
        </p>

        <h2>The giveaway and Discord</h2>
        <p>
          The giveaway is drawn from members of the Eyro Discord server. To run each drawing we read the
          server’s member list (Discord usernames, account IDs and when each member joined) and keep a
          record of who was in it. That record stays with us. Discord’s handling of your account is
          covered by Discord’s own privacy policy.
        </p>

        <h2>What we do not collect</h2>
        <ul>
          <li>Your card number or other payment card details</li>
          <li>Your activity on other websites. Meta may combine what the pixel reports with what it already knows about you, but we don’t receive that.</li>
        </ul>

        <h2>Sharing</h2>
        <p>
          We share data only with the service providers needed to run eyro.io: Stripe for payments,
          Buttondown for email, Meta for ad measurement, Discord for the giveaway, and Vercel, which
          hosts the site. Pages also load fonts from Google Fonts, which receives your IP address. We
          will disclose data if legally compelled, and will tell you unless prohibited.
        </p>
        <p>
          We don’t sell your data for money. Some US state laws count sending browsing data to an
          advertising partner like Meta as a “sale” or “sharing”. You can opt out of that with Global
          Privacy Control or by emailing us, as described above.
        </p>

        <h2>Retention and your rights</h2>
        <p>
          We keep reservation records as long as needed to fulfil the order and for tax and accounting
          records after. You can unsubscribe from the mailing list at any time from the link in any email.
          You can ask for a copy of your data, a correction, or its deletion at any time by emailing us.
          We keep giveaway tax records as long as the law requires.
        </p>

        <h2>Children</h2>
        <p>eyro.io isn’t meant for children under 13, and the giveaway is for adults 18 and older.</p>

        <h2>Contact</h2>
        <p>
          <a href="mailto:donovan@omni-ouro.com">donovan@omni-ouro.com</a>. Eyro is a product of Omni-Ouro Inc,
          Huntsville, Alabama.
        </p>

        <div className="po-cta po-rules-cta">
          <a className="po-btn po-btn-ghost" href="/">Back to Eyro Mini</a>
        </div>
      </main>
    </div>
  )
}
