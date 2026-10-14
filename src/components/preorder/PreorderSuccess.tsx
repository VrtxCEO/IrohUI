import { useEffect, useState } from 'react'
import eyroEyeSrc from '../../assets/eyro_eye.svg'
import { fetchCheckoutResult } from '../../lib/preorder'
import './preorder.css'

type Result = Awaited<ReturnType<typeof fetchCheckoutResult>>

/** Where Stripe returns after checkout. What it says comes from Stripe. */
export function PreorderSuccess() {
  const [result, setResult] = useState<Result | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('session_id') ?? ''
    fetchCheckoutResult(id).then(setResult).catch(() => setFailed(true))
  }, [])

  return (
    <div className="po">
      <header className="po-head">
        <a className="po-brand" href="/"><img src={eyroEyeSrc} alt="" /> Eyro</a>
      </header>
      <main className="po-main po-done">
        {!result && !failed && <p className="po-lede">Checking your reservation…</p>}
        {failed && (
          <>
            <h1>We couldn't find that reservation</h1>
            <p className="po-lede">If you were charged, your reservation is safe; contact us and we'll confirm it. <a href="/">Back to Eyro Mini</a></p>
          </>
        )}
        {result && result.paid && (
          <>
            <p className="po-kicker">Reserved</p>
            <h1>Your Eyro Mini is reserved</h1>
            <p className="po-lede">
              {result.plan === 'rush' ? 'Rush' : 'Standard'} order, expected {result.delivery}.
              {result.email ? ` We'll reach you at ${result.email}.` : ''}
            </p>
            <p className="po-terms">We'll email you before it ships, when the balance is due.</p>
            <a className="po-reserve po-back" href="/">Back to Eyro Mini</a>
          </>
        )}
        {result && !result.paid && (
          <>
            <h1>Your payment is processing</h1>
            <p className="po-lede">Your reservation is recorded as soon as the payment completes. <a href="/">Back to Eyro Mini</a></p>
          </>
        )}
      </main>
    </div>
  )
}
