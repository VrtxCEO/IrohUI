import { useEffect } from 'react'
import logoSrc from '../../assets/omni-ouro-logo.png'
import { BALANCE, DISCORD_URL, REFUND_BY, RESERVE_PRICE, SHIPPING } from '../../lib/preorder'
import { trackPurchase } from '../../lib/pixel'
import './preorder.css'

/** Where the Stripe Payment Link sends buyers after paying. Stripe emails the
 *  receipt; this page only says what happens next. */
export function PreorderSuccess() {
  useEffect(trackPurchase, [])

  return (
    <div className="po">
      <header className="po-head">
        <a className="po-brand" href="/"><img src={logoSrc} alt="" /><strong>EYRO</strong></a>
      </header>
      <main className="po-done">
        <p className="po-kicker">Reserved</p>
        <h1>Your Eyro Mini is reserved</h1>
        <p className="po-lede">
          Thank you. Stripe has emailed your receipt. Shipments start in {SHIPPING}, and we’ll email
          you before yours ships, when the ${BALANCE} balance is due. If shipping hasn’t started by
          {' '}{REFUND_BY}, we refund your ${RESERVE_PRICE} in full.
        </p>
        <p className="po-lede">
          While you wait, join the Eyro Discord. Members are entered in our monthly Eyro Mini
          giveaway. <a href="/giveaway">Rules</a>.
        </p>
        <div className="po-cta">
          <a className="po-btn" href={DISCORD_URL} target="_blank" rel="noreferrer">Join the Discord</a>
          <a className="po-btn po-btn-ghost" href="/">Back to Eyro Mini</a>
        </div>
      </main>
    </div>
  )
}
