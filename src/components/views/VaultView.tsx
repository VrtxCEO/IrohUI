import { useState } from 'react'

const VAULT_FILES = [
  { icon: '🔑', name: 'seed_phrases.enc', meta: 'Crypto · last modified 3 days ago · 0.4kb' },
  { icon: '📋', name: 'api_keys_master.enc', meta: 'Credentials · last modified today · 1.1kb' },
  { icon: '📜', name: 'legal_id_docs.enc', meta: 'Identity · last modified 2 weeks ago · 8.2kb' },
  { icon: '💰', name: 'financial_accounts.enc', meta: 'Finance · last modified 1 week ago · 3.6kb' },
  { icon: '🗝', name: 'vortex_private_keys.enc', meta: 'Vortex-Global · last modified 5 days ago · 0.8kb' },
]

export function VaultView({ onVaultStateChange }: { onVaultStateChange?: (open: boolean) => void }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [phrase, setPhrase] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [unlocking, setUnlocking] = useState(false)

  function openModal() { setModalOpen(true); setError(''); setPhrase(''); setPin('') }
  function closeModal() { setModalOpen(false) }

  function attemptUnlock() {
    if (!phrase.trim()) { setError('Admin phrase is required.'); return }
    if (!pin.trim()) { setError('PIN is required.'); return }
    setError('')
    setUnlocking(true)
    setTimeout(() => {
      setUnlocking(false)
      setModalOpen(false)
      setUnlocked(true)
      onVaultStateChange?.(true)
    }, 1200)
  }

  function lock() {
    setUnlocked(false)
    onVaultStateChange?.(false)
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {!unlocked ? (
        <div className="vault-locked-overlay">
          <div className="vault-locked-icon">🔒</div>
          <div className="vault-locked-title">File Vault</div>
          <div className="vault-locked-sub">Encrypted files your agent cannot see unless you open a session. Decryption key is held in your agent's secure vault.</div>
          <div className="vault-locked-detail">
            <div className="vault-locked-detail-row">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="5" width="10" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M3 5V3.5a3 3 0 016 0V5" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              AES-256 encrypted at rest
            </div>
            <div className="vault-locked-detail-row">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M4 6l1.5 1.5L8 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Agent access: <strong style={{ color: 'var(--red)', marginLeft: 4 }}>none</strong>
            </div>
            <div className="vault-locked-detail-row">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1L7.5 4.5H11L8.5 6.5L9.5 10L6 8L2.5 10L3.5 6.5L1 4.5H4.5L6 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
              </svg>
              {VAULT_FILES.length} encrypted files
            </div>
          </div>
          <button className="btn-vault-open" onClick={openModal}>Open Vault Session</button>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div className="vault-banner">
            <div className="vault-banner-dot" />
            <div className="vault-banner-text">Vault session active — <strong>agent has access</strong></div>
            <div className="vault-lock-btn" onClick={lock}>🔒 Lock</div>
          </div>
          <div className="content-panel" style={{ flex: 1, overflowY: 'auto' }}>
            <div className="panel-title">File Vault</div>
            <div className="panel-sub">Decrypted for this session. Your agent can read and reference these files.</div>
            <div className="section-label">Vault contents · {VAULT_FILES.length} files</div>
            {VAULT_FILES.map(f => (
              <div key={f.name} className="vault-file-row">
                <div className="vault-file-icon">{f.icon}</div>
                <div className="vault-file-info">
                  <div className="vault-file-name">{f.name}</div>
                  <div className="vault-file-meta">{f.meta}</div>
                </div>
                <span className="vault-enc-badge">decrypted</span>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(0,200,150,0.05)', border: '1px solid rgba(0,200,150,0.12)', borderRadius: 10, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Agent access granted.</span> Your agent can reference vault contents during this session. Vault auto-locks when you leave this view or close the app.
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <div className={`modal-backdrop ${modalOpen ? 'open' : ''}`}>
        <div className="modal-card">
          <div className="modal-lock-icon">🔐</div>
          <div className="modal-title">File Vault</div>
          <div className="modal-sub">Authentication required. Once unlocked, you and your agent will both have access for this session.</div>
          <div className="modal-auth-steps">
            <div className="modal-auth-step">
              <div className="modal-auth-label"><span className="step-num">1</span> Admin Phrase</div>
              <input className="modal-input" type="password" placeholder="Enter your admin phrase…"
                value={phrase} onChange={e => setPhrase(e.target.value)} />
            </div>
            <div className="modal-auth-step">
              <div className="modal-auth-label"><span className="step-num">2</span> PIN</div>
              <input className="modal-input" type="password" placeholder="4–6 digit PIN" maxLength={6}
                inputMode="numeric" value={pin} onChange={e => setPin(e.target.value)} />
            </div>
          </div>
          <div className="modal-error">{error}</div>
          <button className="btn-vault-unlock" onClick={attemptUnlock}
            style={unlocking ? { opacity: 0.6 } : {}}>
            {unlocking ? 'Decrypting…' : 'Unlock Vault'}
          </button>
          <button className="btn-vault-cancel" onClick={closeModal}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
