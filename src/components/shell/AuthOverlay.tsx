import { useState, useEffect, useRef } from 'react'
import type { AuthChallenge } from '../../lib/useEyroWS'
import { apiFetch, getApiBase } from '../../lib/useEyroWS'

interface Props {
  challenge: AuthChallenge | null
  wsRef: React.RefObject<WebSocket | null>
  onClose: () => void
}

const METHOD_LABEL: Record<string, string> = {
  pin:          'PIN',
  password:     'Password',
  admin_phrase: 'Admin Phrase',
}

export function AuthOverlay({ challenge, wsRef, onClose }: Props) {
  const [credential, setCredential] = useState('')
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const method = challenge?.required_methods?.[0] ?? 'pin'
  const label  = METHOD_LABEL[method] ?? method

  useEffect(() => {
    if (challenge) {
      setCredential('')
      setError('')
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [challenge])

  if (!challenge) return null

  async function submit() {
    if (!credential) { setError(`Please enter your ${label.toLowerCase()}.`); return }
    setLoading(true)
    setError('')
    try {
      const res = await apiFetch('/api/auth/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, method }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.detail || 'Incorrect credential.')
        setCredential('')
        inputRef.current?.focus()
        return
      }
      onClose()
      if (wsRef.current?.readyState === WebSocket.OPEN && data.original_goal) {
        wsRef.current.send(JSON.stringify({ type: 'auth_approved', goal: data.original_goal }))
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--bg-2, #0e1117)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20, padding: '32px 28px', width: '100%', maxWidth: 360,
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <div style={{ fontSize: 32, textAlign: 'center' }}>🔐</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1,#fff)', textAlign: 'center' }}>
          Approval Required
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-3,rgba(255,255,255,0.45))', textAlign: 'center', lineHeight: 1.5 }}>
          Enter your <strong style={{ color: 'var(--text-1,#fff)' }}>{label}</strong> to authorize this action.
        </div>

        <input
          ref={inputRef}
          type="password"
          value={credential}
          onChange={e => setCredential(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit() }}
          placeholder={`Enter your ${label.toLowerCase()}…`}
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
            onClick={onClose}
            style={{
              flex: 1, padding: '11px 0', borderRadius: 10,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer',
            }}
          >Cancel</button>
          <button
            onClick={submit}
            disabled={loading}
            style={{
              flex: 1, padding: '11px 0', borderRadius: 10,
              background: 'var(--accent,#00c896)', border: 'none',
              color: '#000', fontWeight: 600, fontSize: 13, cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >{loading ? 'Verifying…' : 'Submit'}</button>
        </div>
      </div>
    </div>
  )
}
