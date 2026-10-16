import { useState } from 'react'
import type { FormEvent } from 'react'
import eyroEyeSrc from '../../assets/eyro_eye.svg'
import productShot from '../../assets/mini/eyro-mini.webp'
import { BALANCE, DEVICE_PRICE, PROMO_CODE, REFUND_BY, RESERVE_PRICE, RESERVE_URL, SHIPPING, reserveUrl, shareEyro, subscribe } from '../../lib/preorder'
import type { ShareResult } from '../../lib/preorder'
import './preorder.css'

const SPECS = [
  ['Processor', 'Intel N95'],
  ['Memory', '16 GB'],
  ['Storage', '512 GB SSD'],
  ['System', 'Linux, with Eyro built in'],
]

const ENFORCES = [
  ['Tool firewall', 'The agent cannot invoke what it has not been permitted.'],
  ['Validation gate', 'Actions are checked before they run.'],
  ['Freedom levels', 'Graduated autonomy under your control, not the model’s discretion.'],
  ['Clearance', 'Files carry a classification. An agent is refused what it isn’t cleared to read, and the refusal is recorded.'],
  ['Hash-chained audit', 'Each entry carries the hash of the one before it. Altering any record breaks every hash that follows.'],
  ['Daily sealing', 'Any single day can be handed to an auditor and verified on its own.'],
]

const STEPS = [
  [`Reserve for $${RESERVE_PRICE}`, `Checkout is through Stripe. The $${RESERVE_PRICE} is credited toward the $${DEVICE_PRICE} price.`],
  ['We email you before it ships', `You pay the $${BALANCE} balance then, and give us your shipping address.`],
  ['It ships', `Shipments start in ${SHIPPING}, in reservation order.`],
]

const FAQ = [
  ['Is the reservation refundable?', `If shipping hasn’t started by ${REFUND_BY}, we refund your $${RESERVE_PRICE} in full.`],
  ['When will mine ship?', `Shipments start in ${SHIPPING}, and units go out in the order they were reserved.`],
  ['How do I get the discount?', 'Join the mailing list on this page. Your promotion code shows up right there, and the Reserve button applies it at checkout.'],
  ['When do I pay the rest?', `Before your unit ships. We email you first, and the $${RESERVE_PRICE} you paid comes off the price.`],
  ['Do I need an account?', 'No. Checkout only asks for your email and card.'],
]

export function PreorderPage() {
  return (
    <div className="po">
      <header className="po-head">
        <a className="po-brand" href="/"><img src={eyroEyeSrc} alt="" /> Eyro</a>
        <nav>
          <a className="po-navlink" href="#how">How it works</a>
          <a className="po-navlink" href="#faq">FAQ</a>
          <a className="po-navlink" href="/manifesto">Manifesto</a>
          <a className="po-btn po-btn-sm" href={RESERVE_URL}>Reserve</a>
        </nav>
      </header>

      <main>
        <section className="po-hero">
          <div className="po-hero-copy">
            <p className="po-kicker">Pre-order · Shipping {SHIPPING}</p>
            <h1>Eyro Mini</h1>
            <p className="po-lede">
              A small computer with Eyro as its operating system. Your agent asks for every action,
              and Eyro decides under the rules you set. Every decision is on the record.
            </p>
            <div className="po-price">
              <span className="po-price-big">${DEVICE_PRICE}</span>
              <span>Reserve today for ${RESERVE_PRICE}, credited toward the price. Refunded in full if shipping hasn’t started by {REFUND_BY}.</span>
            </div>
            <div className="po-cta">
              <a className="po-btn" href={RESERVE_URL}>Reserve for ${RESERVE_PRICE}</a>
              <ShareButton />
            </div>
          </div>
          <div className="po-shot">
            <img src={productShot} alt="Eyro Mini: a black carbon-fibre box with a glowing ring on top" />
          </div>
        </section>

        <MailingList />

        <section className="po-section">
          <p className="po-kicker">Why Eyro</p>
          <h2>The model never holds the keys</h2>
          <div className="po-compare">
            <div>
              <h3>Every other approach</h3>
              <p>The model holds the tools and the credentials. A policy check sits in front of it. If anything gets around the check, the model still has the keys.</p>
            </div>
            <div className="po-compare-eyro">
              <h3>Eyro</h3>
              <p>The operating system holds the tools. The model asks it for every action. There is nothing to get around, because the model was never given the authority.</p>
            </div>
          </div>
          <div className="po-grid">
            {ENFORCES.map(([t, d]) => (<div key={t}><h3>{t}</h3><p>{d}</p></div>))}
          </div>
        </section>

        <section className="po-section po-split">
          <div>
            <p className="po-kicker">The hardware</p>
            <h2>Small enough to forget it’s there</h2>
            <p className="po-lede">Eyro Mini comes with Eyro installed and ready. Plug it in, pair it with your account, and it’s running.</p>
          </div>
          <dl className="po-specs">
            {SPECS.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
          </dl>
        </section>

        <section className="po-section" id="how">
          <p className="po-kicker">How reserving works</p>
          <h2>${RESERVE_PRICE} holds your place</h2>
          <ol className="po-steps">
            {STEPS.map(([t, d], i) => (<li key={t}><span>{i + 1}</span><h3>{t}</h3><p>{d}</p></li>))}
          </ol>
        </section>

        <section className="po-section po-faq" id="faq">
          <p className="po-kicker">Questions</p>
          <h2>Before you reserve</h2>
          {FAQ.map(([q, a]) => (<details key={q}><summary>{q}</summary><p>{a}</p></details>))}
        </section>

        <section className="po-section po-final">
          <h2>Reserve your Eyro Mini</h2>
          <p className="po-lede">${RESERVE_PRICE} today. Shipments start in {SHIPPING}.</p>
          <div className="po-cta">
            <a className="po-btn" href={RESERVE_URL}>Reserve for ${RESERVE_PRICE}</a>
            <ShareButton />
          </div>
        </section>
      </main>

      <footer className="po-foot">
        <span>© {new Date().getFullYear()} <a href="https://omni-ouro.com">Omni-Ouro</a></span>
        <nav>
          <a href="/manifesto">Manifesto</a>
          <a href="/app">Eyro app</a>
        </nav>
      </footer>
    </div>
  )
}

/** Under the hero: join the list for the promotion code, or pass eyro.io on. */
function MailingList() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')
  const [copied, setCopied] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setState('busy')
    const ok = await subscribe(email.trim()).catch(() => false)
    setState(ok ? 'done' : 'error')
  }

  async function copyCode() {
    await navigator.clipboard.writeText(PROMO_CODE).then(() => setCopied(true), () => {})
  }

  return (
    <section className="po-list">
      <div className="po-list-copy">
        <h2>Join the mailing list for a discount on your reservation</h2>
        <p>Your promotion code shows up here as soon as you join. We’ll also tell you when shipments go out.</p>
      </div>
      {state === 'done' && PROMO_CODE ? (
        <div className="po-code" role="status">
          <span className="po-code-label">You’re on the list. Your code:</span>
          <button type="button" className="po-code-value" onClick={copyCode} title="Copy code">
            {PROMO_CODE}<small>{copied ? 'Copied' : 'Copy'}</small>
          </button>
          <a className="po-btn" href={reserveUrl(PROMO_CODE)}>Reserve with code</a>
        </div>
      ) : state === 'done' ? (
        <p className="po-list-done" role="status">You’re on the list. Check your inbox for your code, then <a href={RESERVE_URL}>reserve</a>.</p>
      ) : (
        <form className="po-list-form" onSubmit={onSubmit}>
          <label className="po-sr" htmlFor="po-email">Email address</label>
          <input id="po-email" type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="po-btn" disabled={state === 'busy'}>{state === 'busy' ? 'Joining…' : 'Get my code'}</button>
          {state === 'error' && <p className="po-error" role="status">That didn’t go through. Check the address and try again.</p>}
        </form>
      )}
      <div className="po-list-share">
        <span>Know someone who’d want one?</span>
        <ShareButton label="Send them the link" />
      </div>
    </section>
  )
}

const SHARE_NOTE: Record<ShareResult, string> = {
  shared: 'Thanks for sharing',
  copied: 'Link copied',
  cancelled: '',
  failed: 'Copy eyro.io to share',
}

function ShareButton({ label = 'Share' }: { label?: string }) {
  const [note, setNote] = useState('')

  async function onShare() {
    const result = await shareEyro()
    setNote(SHARE_NOTE[result])
    if (result !== 'failed') setTimeout(() => setNote(''), 2500)
  }

  return (
    <button type="button" className="po-btn po-btn-ghost" onClick={onShare} aria-live="polite">
      {note || label}
    </button>
  )
}
