import { useEffect, useState } from 'react'
import eyroEyeSrc from '../../assets/eyro_eye.svg'
import { LoginScreen } from '../login/LoginScreen'
import { clearAuth, getStoredUser, getToken } from '../../lib/auth'
import type { AuthUser } from '../../lib/auth'
import { fetchMyReservations, fetchPreorderInfo, money, reserve } from '../../lib/preorder'
import type { Plan, PreorderInfo, Reservation } from '../../lib/preorder'
import './preorder.css'

const SPECS = [
  ['Processor', 'Intel N95'],
  ['Memory', '16 GB'],
  ['Storage', '512 GB SSD'],
  ['System', 'Linux, with Eyro built in'],
]

export function PreorderPage() {
  const [info, setInfo] = useState<PreorderInfo | null>(null)
  const [infoError, setInfoError] = useState(false)
  const [plan, setPlan] = useState<Plan>('standard')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<AuthUser | null>(() => (getToken() ? getStoredUser() : null))
  const [signingIn, setSigningIn] = useState(false)
  const [mine, setMine] = useState<Reservation[]>([])
  const cancelled = new URLSearchParams(window.location.search).get('preorder') === 'cancelled'

  useEffect(() => {
    fetchPreorderInfo().then(setInfo).catch(() => setInfoError(true))
  }, [])

  useEffect(() => {
    if (!user) return
    fetchMyReservations().then(setMine).catch(() => setMine([]))
  }, [user])

  async function onReserve() {
    setBusy(true)
    setError('')
    try {
      await reserve(plan)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setBusy(false)
    }
  }

  function signOut() {
    clearAuth()
    setUser(null)
  }

  if (signingIn) {
    return (
      <div className="po-signin">
        <button className="po-signin-back" onClick={() => setSigningIn(false)}>← Back to Eyro Mini</button>
        <LoginScreen onLogin={(u) => { setUser(u); setSigningIn(false) }} />
      </div>
    )
  }

  const deposit = info ? money(info.deposit.amount_cents, info.deposit.currency) : ''
  const chosen = info?.plans.find((p) => p.id === plan)
  // Shown only while signed in: a sign-out hides the last account's list.
  const active = user ? mine.filter((r) => r.status === 'reserved') : []

  return (
    <div className="po">
      <header className="po-head">
        <a className="po-brand" href="/"><img src={eyroEyeSrc} alt="" /> Eyro</a>
        <nav>
          <a href="/manifesto">Manifesto</a>
          {user
            ? <span className="po-user">{user.email} · <button onClick={signOut}>Sign out</button></span>
            : <button className="po-link" onClick={() => setSigningIn(true)}>Sign in</button>}
        </nav>
      </header>

      <main className="po-main">
        {cancelled && <p className="po-note">Checkout was cancelled. Nothing was charged.</p>}

        <section className="po-hero">
          <p className="po-kicker">Pre-order</p>
          <h1>Eyro Mini</h1>
          <p className="po-lede">A small computer that runs Eyro as its operating system. Your agent works on your desk, under rules you set: it asks, and Eyro decides.</p>
          <dl className="po-specs">
            {SPECS.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
          </dl>
        </section>

        <section className="po-order">
          {infoError && <p className="po-note">Pre-orders aren't open yet. Check back soon.</p>}
          {info && (
            <>
              <div className="po-plans" role="radiogroup" aria-label="Delivery">
                {info.plans.map((p) => (
                  <button
                    key={p.id}
                    role="radio"
                    aria-checked={plan === p.id}
                    className={`po-plan${plan === p.id ? ' on' : ''}`}
                    onClick={() => setPlan(p.id)}
                  >
                    <span className="po-plan-name">{p.label}</span>
                    <span className="po-plan-price">{money(p.device_cents, info.deposit.currency)}</span>
                    <span className="po-plan-when">Expected {p.delivery}</span>
                  </button>
                ))}
              </div>

              <button className="po-reserve" disabled={busy} onClick={onReserve}>
                {busy ? 'Opening checkout…' : `Reserve for ${deposit}`}
              </button>
              {chosen && (
                <p className="po-balance">
                  {deposit} today, credited toward the price. {money(chosen.balance_cents, info.deposit.currency)} when it ships.
                </p>
              )}
              {error && <p className="po-error">{error}</p>}

              {!user && (
                <p className="po-nudge">
                  Have an Eyro account? <button className="po-link" onClick={() => setSigningIn(true)}>Sign in</button> first
                  and your reservation shows up there. Or reserve as a guest: it joins your account later by email.
                </p>
              )}
              <p className="po-terms">{info.terms}</p>
            </>
          )}
        </section>

        {active.length > 0 && (
          <section className="po-mine">
            <h2>Your reservations</h2>
            {active.map((r) => (
              <div key={r.id} className="po-res">
                <span>Eyro Mini · {r.plan === 'rush' ? 'Rush' : 'Standard'}</span>
                <span>Expected {r.delivery}</span>
                <span>{money(r.deposit_cents, r.currency)} paid</span>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  )
}
