import eyroEyeSrc from '../../assets/eyro_eye.svg'
import { BALANCE, REFUND_BY, RESERVE_PRICE, SHIPPING } from '../../lib/preorder'
import './preorder.css'

/** Where the Stripe Payment Link sends buyers after paying. Stripe emails the
 *  receipt; this page only says what happens next. */
export function PreorderSuccess() {
  return (
    <div className="po">
      <header className="po-head">
        <a className="po-brand" href="/"><img src={eyroEyeSrc} alt="" /> Eyro</a>
      </header>
      <main className="po-done">
        <p className="po-kicker">Reserved</p>
        <h1>Your Eyro Mini is reserved</h1>
        <p className="po-lede">
          Thank you. Stripe has emailed your receipt. Shipments start in {SHIPPING}, and we’ll email
          you before yours ships, when the ${BALANCE} balance is due. If shipping hasn’t started by
          {' '}{REFUND_BY}, we refund your ${RESERVE_PRICE} in full.
        </p>
        <a className="po-btn" href="/">Back to Eyro Mini</a>
      </main>
    </div>
  )
}
