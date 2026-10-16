import logoSrc from '../../assets/omni-ouro-logo.png'
import { DEVICE_PRICE, DISCORD_URL, SHIPPING } from '../../lib/preorder'
import './preorder.css'

/** Official rules for the monthly Eyro Mini giveaway. The draw itself is
 *  scripts/giveaway-draw.mjs, which follows sections 3 to 5. */
export function GiveawayRules() {
  return (
    <div className="po">
      <header className="po-head">
        <a className="po-brand" href="/"><img src={logoSrc} alt="" /><strong>EYRO</strong></a>
        <a className="po-btn po-btn-sm" href={DISCORD_URL} target="_blank" rel="noreferrer">Join the Discord</a>
      </header>
      <main className="po-rules">
        <p className="po-kicker">Official rules</p>
        <h1>Eyro Mini Monthly Giveaway</h1>
        <p className="po-rules-lead">
          No purchase necessary to enter or win. A purchase or reservation does not improve your
          chances of winning. Void where prohibited.
        </p>

        <h2>1. Sponsor</h2>
        <p>
          The giveaway is sponsored by Omni-Ouro Inc, Huntsville, Alabama (“Sponsor”). Questions:{' '}
          <a href="mailto:donovan@omni-ouro.com">donovan@omni-ouro.com</a>. Discord does not sponsor,
          endorse or administer this giveaway.
        </p>

        <h2>2. Who can enter</h2>
        <p>
          Legal residents of the 50 United States and the District of Columbia who are 18 or older
          (or the age of majority where they live, if higher) when they enter. Employees of Sponsor
          and members of their immediate families or households cannot win. Anyone drawn in a
          drawing, including a winner who forfeits the prize, is not eligible for any later drawing.
        </p>

        <h2>3. Entry periods</h2>
        <p>
          Each calendar month is a separate entry period, from 12:00 a.m. Central Time on the first
          day of the month to 11:59 p.m. Central Time on its last day. The first entry period is
          December 2026. The giveaway continues month by month until Sponsor ends it by updating this
          page; ending it does not affect an entry period already underway.
        </p>

        <h2>4. How to enter</h2>
        <p>
          Join the Eyro Discord server at <a href={DISCORD_URL} target="_blank" rel="noreferrer">{DISCORD_URL.replace('https://', '')}</a>{' '}
          using a free Discord account. Everyone who is a member of the server at the end of an entry
          period receives one entry for that period, and members stay entered in each later period for
          as long as they remain in the server. Limit one entry per person per period. Entries from
          multiple accounts held by one person, or made by automated means, are void.
        </p>

        <h2>5. The drawing</h2>
        <p>
          Within seven days after each entry period ends, Sponsor selects one winner at random from all
          eligible entries for that period, using a computer random selection, and keeps a record of
          each drawing. The odds of winning depend on the number of eligible entries.
        </p>

        <h2>6. The prize</h2>
        <p>
          One prize per entry period: one Eyro Mini computer (Intel N95, 16 GB memory, 512 GB SSD).
          Approximate retail value: ${DEVICE_PRICE}. The prize ships to the winner’s address in the
          United States once Eyro Mini units ship; shipments are expected to begin in {SHIPPING}. The
          prize cannot be transferred or exchanged for cash. Sponsor may substitute a prize of equal or
          greater value. The winner is responsible for any taxes. Sponsor will report the prize’s
          value to the IRS on Form 1099 and requires a completed Form W-9 before the prize ships.
        </p>

        <h2>7. Notifying the winner</h2>
        <p>
          Sponsor notifies the winner by Discord direct message and announces the winner’s Discord
          username in the server. To claim the prize, the winner must reply within seven days and
          provide their name, a US shipping address, confirmation that they are eligible, and a
          Form W-9. If the winner does not respond in time, is ineligible, or cannot accept the prize,
          it is forfeited and Sponsor draws an alternate winner from the same period’s entries.
        </p>

        <h2>8. General conditions</h2>
        <p>
          Sponsor may disqualify anyone who tampers with the giveaway or breaks these rules, and may
          cancel or change an entry period if fraud or a technical failure makes it impossible to run
          as planned. By entering, entrants release Sponsor from liability for any injury or loss
          arising from taking part in the giveaway or from the prize. These rules are governed by the
          laws of the State of Alabama.
        </p>

        <h2>9. Privacy</h2>
        <p>
          Sponsor uses the information a winner provides only to deliver the prize and meet tax
          reporting requirements.
        </p>

        <h2>10. Winners list</h2>
        <p>
          For the names of winners, email <a href="mailto:donovan@omni-ouro.com">donovan@omni-ouro.com</a>{' '}
          within 60 days of the end of the entry period you’re asking about.
        </p>

        <div className="po-cta po-rules-cta">
          <a className="po-btn" href={DISCORD_URL} target="_blank" rel="noreferrer">Join the Discord</a>
          <a className="po-btn po-btn-ghost" href="/">Back to Eyro Mini</a>
        </div>
      </main>
    </div>
  )
}
