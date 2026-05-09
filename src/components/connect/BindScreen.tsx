import { useState, useEffect } from 'react'
import { EyroEye } from '../eye/EyroEye'
import {
  parseBindPayload, isBindPayloadExpired, deriveConnectionToken,
  fetchBindingStatus, storeSession, clearAuth, clearSession,
} from '../../lib/auth'
import type { AuthUser, OsSession } from '../../lib/auth'
import '../components.css'

interface Props {
  encoded: string        // raw ?p= value from URL
  user: AuthUser
  onBound: (session: OsSession) => void
  onExpired: () => void  // QR expired — send back to waiting state
}

type BindState = 'checking' | 'ready' | 'waiting' | 'success' | 'error' | 'expired'

export function BindScreen({ encoded, user, onBound, onExpired }: Props) {
  const payload = parseBindPayload(encoded)

  const [state, setState]     = useState<BindState>('checking')
  const [secondsLeft, setSec] = useState(0)
  const [errMsg, setErr]      = useState('')

  // Validate payload on mount
  useEffect(() => {
    if (!payload) { setState('error'); setErr('Invalid QR code.'); return }
    if (isBindPayloadExpired(payload)) { setState('expired'); return }
    if (payload.email && payload.email !== user.email) {
      setState('error')
      setErr(`This QR code is for ${payload.email}. You're signed in as ${user.email}.`)
      return
    }
    const remaining = Math.max(0, Math.floor((new Date(payload.exp).getTime() - Date.now()) / 1000))
    setSec(remaining)
    setState('ready')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown timer — runs in both 'ready' and 'waiting' states
  useEffect(() => {
    if (state !== 'ready' && state !== 'waiting') return
    const id = setInterval(() => {
      setSec(s => {
        if (s <= 1) { clearInterval(id); setState('expired'); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [state])

  // Poll OS for binding confirmation (starts after user clicks button)
  useEffect(() => {
    if (state !== 'waiting' || !payload) return
    let cancelled = false
    const directUrl = payload.direct ?? import.meta.env.VITE_API_URL ?? 'http://localhost:8765'

    async function poll() {
      try {
        const status = await fetchBindingStatus(directUrl)
        if (cancelled) return
        if (status.bound) {
          const token = await deriveConnectionToken(payload!.os_instance_id, payload!.code)
          const session: OsSession = {
            os_instance_id:   payload!.os_instance_id,
            connection_token: token,
            public_key:       payload!.public_key,
            relay_url:        payload!.relay ?? '',
            direct_url:       directUrl,
            bound_at:         new Date().toISOString(),
          }
          storeSession(session)
          setState('success')
          setTimeout(() => onBound(session), 900)
        }
      } catch {
        // network hiccup — keep waiting
      }
    }

    poll()
    const id = setInterval(poll, 3000)
    return () => { cancelled = true; clearInterval(id) }
  }, [state]) // eslint-disable-line react-hooks/exhaustive-deps

  function fmt(s: number) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  }

  const digits = payload?.code.split('') ?? []

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: '#060810' }}>
      <div className="ob-eye-bg">
        <EyroEye state={state === 'success' ? 'capability' : state === 'waiting' ? 'processing' : 'idle'} size={420} />
      </div>
      <div className="ob-wrap">
        <div className="ob-card">
          <div className="ob-logo">
            <div className="ob-logo-mark">I</div>
            <div className="ob-logo-name">eyro<span>OS</span></div>
          </div>

          {state === 'checking' && (
            <div className="ob-sub" style={{ textAlign: 'center', marginTop: 24 }}>Verifying QR code…</div>
          )}

          {state === 'expired' && (
            <>
              <div className="ob-title" style={{ color: 'var(--warn)' }}>QR code expired</div>
              <div className="ob-sub">Go to your EyroOS and generate a new QR code. The 6-digit code resets each time.</div>
              <button className="btn-secondary" style={{ marginTop: 16 }} onClick={onExpired}>← Back</button>
            </>
          )}

          {state === 'error' && (
            <>
              <div className="ob-title" style={{ color: 'var(--red)' }}>Binding failed</div>
              <div className="login-error">{errMsg}</div>
            </>
          )}

          {state === 'success' && (
            <>
              <div className="ob-title" style={{ color: 'var(--accent)' }}>Bound successfully</div>
              <div className="ob-sub" style={{ textAlign: 'center' }}>
                Your EyroOS is now linked to <strong style={{ color: 'var(--text-1)' }}>{user.email}</strong>
              </div>
              <div style={{ fontSize: 32, textAlign: 'center', marginTop: 20 }}>✓</div>
            </>
          )}

          {(state === 'ready' || state === 'waiting') && payload && (
            <>
              <div className="ob-eyebrow">Binding code</div>
              <div className="ob-title">Enter this on your EyroOS</div>
              <div className="ob-sub">When your EyroOS prompts for a code, enter the number below.</div>

              <div className="bind-code">
                {digits.map((d, i) => (
                  <div key={i} className="bind-digit">{d}</div>
                ))}
              </div>

              <div className="bind-timer">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M6 3.5V6L7.5 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                Expires in {fmt(secondsLeft)}
              </div>

              {state === 'ready' && (
                <>
                  <div className="ob-sub" style={{ marginTop: 12 }}>
                    Once you've entered the code in EyroOS, tap confirm.
                  </div>
                  <button
                    className="btn-primary"
                    style={{ marginTop: 12 }}
                    onClick={() => setState('waiting')}
                  >
                    I've entered the code →
                  </button>
                </>
              )}

              {state === 'waiting' && (
                <div className="ob-sub" style={{ marginTop: 16, textAlign: 'center', opacity: 0.7 }}>
                  Waiting for OS confirmation…
                </div>
              )}

              <button
                className="btn-secondary"
                style={{ marginTop: 20 }}
                onClick={() => { clearAuth(); clearSession(); window.location.reload() }}
              >
                ↩ Retry — scan a new QR
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
