import { useState, useEffect, useRef, useCallback } from 'react'
import { apiFetch } from '../../lib/useEyroWS'

// This reads the same trace-store state the desktop shell's bell reads,
// through the same OS API surface (apiFetch resolves to the direct local
// connection or the ngrok relay transparently) — no separate backend, no
// separate notion of "pending" from what the OS itself already tracks.

interface PendingConfirmation {
  confirmation_id: string
  created_at: string
  status: string
  requested_by: string
  action_type: string
  description: string
  summary: string
  details: Record<string, unknown>
  tier: number
}

const METHOD_LABEL: Record<string, string> = {
  pin:          'PIN',
  password:     'Password',
  admin_phrase: 'Admin Phrase',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function NotificationBell() {
  const [items, setItems]       = useState<PendingConfirmation[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [reviewing, setReviewing] = useState<PendingConfirmation | null>(null)
  const [credential, setCredential] = useState('')
  const [method] = useState('pin')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const wrapRef  = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/api/pending-confirmations?status=pending')
      const d = await res.json()
      setItems(d.confirmations ?? [])
    } catch { /* transient network hiccup — keep last known list */ }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 15000)
    return () => clearInterval(id)
  }, [load])

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  useEffect(() => {
    if (reviewing) setTimeout(() => inputRef.current?.focus(), 80)
  }, [reviewing])

  function openReview(item: PendingConfirmation) {
    setReviewing(item)
    setMenuOpen(false)
    setCredential('')
    setError('')
  }

  async function decline(item: PendingConfirmation) {
    try {
      await apiFetch(`/api/pending-confirmations/${encodeURIComponent(item.confirmation_id)}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: false }),
      })
    } catch { /* best effort — it'll still show as pending next poll if this failed */ }
    setItems(prev => prev.filter(i => i.confirmation_id !== item.confirmation_id))
    setReviewing(null)
  }

  async function approve() {
    if (!reviewing) return
    if (!credential) { setError(`Please enter your ${(METHOD_LABEL[method] ?? method).toLowerCase()}.`); return }
    setLoading(true)
    setError('')
    try {
      const res = await apiFetch(`/api/pending-confirmations/${encodeURIComponent(reviewing.confirmation_id)}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true, method, credential }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.detail || 'Incorrect credential.')
        setCredential('')
        inputRef.current?.focus()
        return
      }
      setItems(prev => prev.filter(i => i.confirmation_id !== reviewing.confirmation_id))
      setReviewing(null)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="confirm-bell-wrap" ref={wrapRef}>
        <button className="spatial-icon-btn" onClick={() => setMenuOpen(o => !o)} title="Pending approvals">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.5C5.8 1.5 4.5 3.1 4.5 5.2V7.8C4.5 8.7 4.1 9.5 3.4 10.2L2.7 10.9C2.4 11.2 2.6 11.8 3 11.8H13C13.4 11.8 13.6 11.2 13.3 10.9L12.6 10.2C11.9 9.5 11.5 8.7 11.5 7.8V5.2C11.5 3.1 10.2 1.5 8 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
            <path d="M6.3 13.5C6.6 14.1 7.2 14.5 8 14.5C8.8 14.5 9.4 14.1 9.7 13.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          {items.length > 0 && <span className="confirm-bell-badge">{items.length > 9 ? '9+' : items.length}</span>}
        </button>
        {menuOpen && (
          <div className="confirm-menu">
            {items.length === 0 ? (
              <div className="confirm-menu-empty">No pending approvals.</div>
            ) : items.map(item => (
              <div key={item.confirmation_id} className="confirm-item" onClick={() => openReview(item)}>
                <div className="confirm-item-summary">{item.summary || item.description || item.action_type}</div>
                <div className="confirm-item-meta">{item.requested_by} · {timeAgo(item.created_at)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {reviewing && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
          onClick={e => { if (e.target === e.currentTarget) setReviewing(null) }}
        >
          <div style={{
            background: 'var(--bg-2, #0e1117)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20, padding: '32px 28px', width: '100%', maxWidth: 380,
            display: 'flex', flexDirection: 'column', gap: 14,
          }}>
            <div style={{ fontSize: 32, textAlign: 'center' }}>🔔</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1,#fff)', textAlign: 'center' }}>
              Approval Requested
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-2,rgba(255,255,255,0.7))', lineHeight: 1.5 }}>
              {reviewing.description || reviewing.summary}
            </div>
            {Object.keys(reviewing.details || {}).length > 0 && (
              <div style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px',
                fontSize: 12, color: 'var(--text-2,rgba(255,255,255,0.7))', fontFamily: 'monospace',
                display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                {Object.entries(reviewing.details).map(([k, v]) => (
                  <div key={k}><span style={{ color: 'var(--text-3,rgba(255,255,255,0.45))' }}>{k}:</span> {String(v)}</div>
                ))}
              </div>
            )}

            <input
              ref={inputRef}
              type="password"
              value={credential}
              onChange={e => setCredential(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') approve() }}
              placeholder={`Enter your ${(METHOD_LABEL[method] ?? method).toLowerCase()}…`}
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: '12px 14px', color: 'var(--text-1,#fff)',
                fontSize: 14, outline: 'none', fontFamily: 'inherit',
              }}
            />

            {error && (
              <div style={{ fontSize: 12, color: '#e55', textAlign: 'center' }}>{error}</div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => decline(reviewing)}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: 10,
                  background: 'rgba(255,79,79,0.1)', border: '1px solid rgba(255,79,79,0.25)',
                  color: '#ff4d6d', fontSize: 13, cursor: 'pointer',
                }}
              >Decline</button>
              <button
                onClick={approve}
                disabled={loading}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: 10,
                  background: 'var(--accent,#00c896)', border: 'none',
                  color: '#000', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >{loading ? 'Verifying…' : 'Approve'}</button>
            </div>
            <button
              onClick={() => setReviewing(null)}
              style={{
                background: 'none', border: 'none', color: 'var(--text-3,rgba(255,255,255,0.45))',
                fontSize: 12, cursor: 'pointer', padding: 4,
              }}
            >Cancel</button>
          </div>
        </div>
      )}
    </>
  )
}
